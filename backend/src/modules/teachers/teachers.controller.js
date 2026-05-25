const { prisma } = require('../../config/database');
const { hashPassword } = require('../../utils/bcrypt');
const { sendSuccess, sendError, paginate } = require('../../utils/apiResponse');
const { logActivity } = require('../../utils/activityLogger');

async function getAll(req, res, next) {
  try {
    const { page = 1, limit = 20, department, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (department) where.department = { contains: department, mode: 'insensitive' };
    if (status)     where.status     = status;
    if (search) {
      where.OR = [
        { name:  { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({ where, skip, take: parseInt(limit), orderBy: { name: 'asc' } }),
      prisma.teacher.count({ where }),
    ]);

    return sendSuccess(res, paginate(teachers, total, page, limit));
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    if (req.user.role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({ where: { userId: req.user.id } });
      if (!teacher || teacher.id !== id) return sendError(res, 'Access denied', 403);
    }

    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) return sendError(res, 'Teacher not found', 404);
    return sendSuccess(res, teacher);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const body = req.body;

    const name          = (body.name          || '').trim();
    const phone         = (body.phone         || '').trim();
    const email         = (body.email         || '').trim();
    const department    = (body.department    || '').trim();
    const qualification = (body.qualification || '').trim();

    if (!name)          return sendError(res, 'Teacher name is required', 400);
    if (!phone)         return sendError(res, 'Phone number is required', 400);
    if (!email)         return sendError(res, 'Email is required', 400);
    if (!department)    return sendError(res, 'Department is required', 400);
    if (!qualification) return sendError(res, 'Qualification is required', 400);

    // ── Enum validation ──────────────────────────────────────────────────────
    const VALID_GENDER   = ['MALE', 'FEMALE', 'OTHER'];
    const VALID_EMP_TYPE = ['PERMANENT', 'CONTRACT', 'PART_TIME', 'VISITING'];
    const VALID_STATUS   = ['ACTIVE', 'INACTIVE', 'ON_LEAVE'];

    const gender         = VALID_GENDER.includes(body.gender)         ? body.gender         : 'MALE';
    const employmentType = VALID_EMP_TYPE.includes(body.employmentType) ? body.employmentType : 'PERMANENT';
    const status         = VALID_STATUS.includes(body.status)         ? body.status         : 'ACTIVE';

    // ── Safe optional fields (strip empty strings) ───────────────────────────
    const fatherName     = (body.fatherName     || '').trim() || null;
    const cnic           = (body.cnic           || '').trim() || null;
    const address        = (body.address        || '').trim() || null;
    const specialization = (body.specialization || '').trim() || null;

    // ── Date fields — only set if non-empty valid date string ────────────────
    const dobRaw      = (body.dob        || '').trim();
    const joiningRaw  = (body.joiningDate || '').trim();
    const dob         = dobRaw     ? new Date(dobRaw)     : null;
    const joiningDate = joiningRaw ? new Date(joiningRaw) : null;

    // Reject invalid dates
    if (dobRaw     && isNaN(dob.getTime()))     return sendError(res, 'Invalid date of birth', 400);
    if (joiningRaw && isNaN(joiningDate.getTime())) return sendError(res, 'Invalid joining date', 400);

    // ── Numeric fields ───────────────────────────────────────────────────────
    const experience = parseInt(body.experience) || 0;
    const salary     = body.salary && String(body.salary).trim() !== '' ? parseFloat(body.salary) : null;

    const passwordHash = await hashPassword(phone);

    const teacher = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: `teacher_${phone.replace(/\D/g, '')}`,
          passwordHash,
          role: 'TEACHER',
        },
      });

      return tx.teacher.create({
        data: {
          userId:         user.id,
          name,
          phone,
          email,
          department,
          qualification,
          gender,
          employmentType,
          status,
          experience,
          salary,
          fatherName,
          cnic,
          address,
          specialization,
          dob,
          joiningDate,
          photo: req.file ? `/uploads/photos/${req.file.filename}` : null,
        },
      });
    });

    await logActivity({ userId: req.user.id, action: 'CREATE_TEACHER', entity: 'Teacher', entityId: teacher.id, ipAddress: req.ip });
    return sendSuccess(res, teacher, 'Teacher created successfully', 201);
  } catch (err) {
    // Log detailed error so validation failures are visible in server console
    console.error('❌ createTeacher error:', err.message || err);
    if (err.constructor && err.constructor.name === 'PrismaClientValidationError') {
      console.error('   Prisma validation detail:', err.message);
    }
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const id   = parseInt(req.params.id);
    const body = req.body;

    // Only allow known Teacher schema fields — strip anything else to prevent PrismaClientValidationError
    const VALID_GENDER   = ['MALE', 'FEMALE', 'OTHER'];
    const VALID_EMP_TYPE = ['PERMANENT', 'CONTRACT', 'PART_TIME', 'VISITING'];
    const VALID_STATUS   = ['ACTIVE', 'INACTIVE', 'ON_LEAVE'];

    const data = {};
    if (body.name)           data.name           = String(body.name).trim();
    if (body.phone)          data.phone          = String(body.phone).trim();
    if (body.email)          data.email          = String(body.email).trim();
    if (body.department)     data.department     = String(body.department).trim();
    if (body.qualification)  data.qualification  = String(body.qualification).trim();
    if (body.fatherName !== undefined) data.fatherName     = body.fatherName     ? String(body.fatherName).trim()     : null;
    if (body.cnic       !== undefined) data.cnic           = body.cnic           ? String(body.cnic).trim()           : null;
    if (body.address    !== undefined) data.address        = body.address        ? String(body.address).trim()        : null;
    if (body.specialization !== undefined) data.specialization = body.specialization ? String(body.specialization).trim() : null;
    if (body.experience !== undefined) data.experience = parseInt(body.experience) || 0;
    if (body.salary     !== undefined && body.salary !== '') data.salary = parseFloat(body.salary);
    if (body.gender     && VALID_GENDER.includes(body.gender))     data.gender         = body.gender;
    if (body.employmentType && VALID_EMP_TYPE.includes(body.employmentType)) data.employmentType = body.employmentType;
    if (body.status     && VALID_STATUS.includes(body.status))     data.status         = body.status;
    if (body.dob        && String(body.dob).trim())  data.dob        = new Date(body.dob);
    if (body.joiningDate && String(body.joiningDate).trim()) data.joiningDate = new Date(body.joiningDate);
    if (req.file) data.photo = `/uploads/photos/${req.file.filename}`;

    const teacher = await prisma.teacher.update({ where: { id }, data });
    await logActivity({ userId: req.user.id, action: 'UPDATE_TEACHER', entity: 'Teacher', entityId: id, ipAddress: req.ip });
    return sendSuccess(res, teacher, 'Teacher updated successfully');
  } catch (err) {
    console.error('❌ updateTeacher error:', err.message || err);
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    await prisma.teacher.update({ where: { id }, data: { status: 'INACTIVE' } });
    await logActivity({ userId: req.user.id, action: 'DELETE_TEACHER', entity: 'Teacher', entityId: id, ipAddress: req.ip });
    return sendSuccess(res, null, 'Teacher deactivated successfully');
  } catch (err) {
    next(err);
  }
}

async function getSubjects(req, res, next) {
  try {
    const teacherId = parseInt(req.params.id);
    const subjects = await prisma.teacherSubject.findMany({
      where: { teacherId },
      include: { subject: true, class: true },
    });
    return sendSuccess(res, subjects);
  } catch (err) {
    next(err);
  }
}

async function getSchedule(req, res, next) {
  try {
    const teacherId = parseInt(req.params.id);
    const schedule = await prisma.timetable.findMany({
      where: { teacherId },
      include: { subject: true, class: true, section: true },
      orderBy: [{ day: 'asc' }, { periodNo: 'asc' }],
    });
    return sendSuccess(res, schedule);
  } catch (err) {
    next(err);
  }
}

async function getStudents(req, res, next) {
  try {
    const teacherId = parseInt(req.params.id);
    const assignments = await prisma.teacherSubject.findMany({
      where: { teacherId },
      select: { classId: true },
    });
    const classIds = [...new Set(assignments.map((a) => a.classId))];
    const students = await prisma.student.findMany({
      where: { classId: { in: classIds }, status: 'ACTIVE' },
      include: { class: true, section: true },
      orderBy: { rollNo: 'asc' },
    });
    return sendSuccess(res, students);
  } catch (err) {
    next(err);
  }
}

async function assignSubjects(req, res, next) {
  try {
    const teacherId = parseInt(req.params.id);
    const { subjects, academicYearId } = req.body;

    if (!Array.isArray(subjects) || !subjects.length) {
      return sendError(res, 'subjects array is required', 400);
    }

    // Auto-resolve academicYearId
    let yearId = academicYearId ? parseInt(academicYearId) : null;
    if (!yearId) {
      const currentYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
      if (!currentYear) return sendError(res, 'No current academic year found', 400);
      yearId = currentYear.id;
    }

    const created = await prisma.$transaction(
      subjects.map((s) =>
        prisma.teacherSubject.upsert({
          where: {
            teacherId_subjectId_classId_academicYearId: {
              teacherId,
              subjectId: s.subjectId,
              classId: s.classId,
              academicYearId: yearId,
            },
          },
          update: {},
          create: {
            teacherId,
            subjectId: s.subjectId,
            classId: s.classId,
            sectionId: s.sectionId || null,
            academicYearId: yearId,
          },
        })
      )
    );

    return sendSuccess(res, created, 'Subjects assigned successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, create, update, remove, getSubjects, getSchedule, getStudents, assignSubjects };
