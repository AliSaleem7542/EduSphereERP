const { prisma } = require('../../config/database');
const { sendSuccess, sendError, paginate } = require('../../utils/apiResponse');
const { logActivity } = require('../../utils/activityLogger');

async function getAll(req, res, next) {
  try {
    const { page = 1, limit = 20, classId, sectionId, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (classId)   where.classId   = parseInt(classId);
    if (sectionId) where.sectionId = parseInt(sectionId);
    if (status)    where.status    = status;
    if (search) {
      where.OR = [
        { firstName:  { contains: search, mode: 'insensitive' } },
        { lastName:   { contains: search, mode: 'insensitive' } },
        { rollNo:     { contains: search, mode: 'insensitive' } },
        { fatherName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { rollNo: 'asc' },
        include: { class: true, section: true },
      }),
      prisma.student.count({ where }),
    ]);

    return sendSuccess(res, paginate(students, total, page, limit));
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    // Students can only view their own profile
    if (req.user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
      if (!student || student.id !== id) {
        return sendError(res, 'Access denied', 403);
      }
    }

    const student = await prisma.student.findUnique({
      where: { id },
      include: { class: true, section: true, academicYear: true },
    });

    if (!student) return sendError(res, 'Student not found', 404);
    return sendSuccess(res, student);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const body = req.body;
    if (req.file) body.photo = `/uploads/photos/${req.file.filename}`;

    // Debug log — visible in Render logs
    console.log('[STUDENT CREATE] Received fields:', Object.keys(body));

    // Coerce required integer/date fields from multipart form strings
    if (body.classId)       body.classId       = parseInt(body.classId);
    if (body.sectionId)     body.sectionId     = parseInt(body.sectionId);
    if (body.dob)           body.dob           = new Date(body.dob);
    if (body.admissionDate) body.admissionDate = new Date(body.admissionDate);
    if (body.annualCharges) body.annualCharges = parseFloat(body.annualCharges);
    if (body.tuitionFee)    body.tuitionFee    = parseFloat(body.tuitionFee);
    if (body.transportFee)  body.transportFee  = parseFloat(body.transportFee);
    if (body.packageTotal)  body.packageTotal  = parseFloat(body.packageTotal);

    // Auto-resolve academicYearId
    if (!body.academicYearId) {
      const currentYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
      if (!currentYear) return sendError(res, 'No current academic year found. Please seed the database.', 400);
      body.academicYearId = currentYear.id;
    } else {
      body.academicYearId = parseInt(body.academicYearId);
    }

    // Default required enum fields
    if (!body.gender)        body.gender        = 'MALE';
    if (!body.admissionType) body.admissionType = 'NEW';
    if (!body.feeCategory)   body.feeCategory   = 'REGULAR';
    if (!body.transport)     body.transport     = 'NONE';
    if (!body.status)        body.status        = 'ACTIVE';

    // Default admissionDate to today if not provided
    if (!body.admissionDate) body.admissionDate = new Date();

    // ── WHITELIST: only pass fields that exist in the Prisma Student model ──
    // This prevents "Invalid data provided to database" from unknown fields
    // like guardianEmail, notes, etc. sent by the frontend form.
    const ALLOWED_STUDENT_FIELDS = new Set([
      'rollNo','firstName','middleName','lastName','dob','gender','bloodGroup',
      'cnic','religion','address','photo','admissionDate','admissionType',
      'classId','sectionId','academicYearId','prevSchool','prevGrade',
      'feeCategory','transport','transportFee','annualCharges','tuitionFee','packageTotal',
      'fatherName','fatherCnic','fatherPhone','fatherOccupation',
      'motherName','motherPhone','guardianName','guardianPhone','emergencyContact',
      'status','userId',
    ]);

    const data = {};
    Object.keys(body).forEach((k) => {
      if (ALLOWED_STUDENT_FIELDS.has(k) && body[k] !== '' && body[k] !== undefined && body[k] !== null) {
        data[k] = body[k];
      } else if (!ALLOWED_STUDENT_FIELDS.has(k)) {
        console.log('[STUDENT CREATE] Stripped unknown field:', k);
      }
    });

    console.log('[STUDENT CREATE] Final data keys:', Object.keys(data));

    const student = await prisma.student.create({ data });

    await logActivity({
      userId: req.user.id,
      action: 'CREATE_STUDENT',
      entity: 'Student',
      entityId: student.id,
      ipAddress: req.ip,
    });

    return sendSuccess(res, student, 'Student created successfully', 201);
  } catch (err) {
    console.error('[STUDENT CREATE] Error:', err.message);
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const body = req.body;
    if (req.file) body.photo = `/uploads/photos/${req.file.filename}`;

    console.log('[STUDENT UPDATE] id:', id, '| fields:', Object.keys(body));

    // Coerce integer/date fields
    if (body.classId)        body.classId        = parseInt(body.classId);
    if (body.sectionId)      body.sectionId      = parseInt(body.sectionId);
    if (body.academicYearId) body.academicYearId = parseInt(body.academicYearId);
    if (body.dob)            body.dob            = new Date(body.dob);
    if (body.admissionDate)  body.admissionDate  = new Date(body.admissionDate);
    if (body.annualCharges)  body.annualCharges  = parseFloat(body.annualCharges);
    if (body.tuitionFee)     body.tuitionFee     = parseFloat(body.tuitionFee);
    if (body.transportFee)   body.transportFee   = parseFloat(body.transportFee);
    if (body.packageTotal)   body.packageTotal   = parseFloat(body.packageTotal);

    // ── WHITELIST: only pass known Student model fields ──
    const ALLOWED_STUDENT_FIELDS = new Set([
      'rollNo','firstName','middleName','lastName','dob','gender','bloodGroup',
      'cnic','religion','address','photo','admissionDate','admissionType',
      'classId','sectionId','academicYearId','prevSchool','prevGrade',
      'feeCategory','transport','transportFee','annualCharges','tuitionFee','packageTotal',
      'fatherName','fatherCnic','fatherPhone','fatherOccupation',
      'motherName','motherPhone','guardianName','guardianPhone','emergencyContact',
      'status',
    ]);

    const data = {};
    Object.keys(body).forEach((k) => {
      if (ALLOWED_STUDENT_FIELDS.has(k) && body[k] !== '' && body[k] !== undefined && body[k] !== null) {
        data[k] = body[k];
      }
    });

    console.log('[STUDENT UPDATE] Final data keys:', Object.keys(data));

    const student = await prisma.student.update({ where: { id }, data });

    await logActivity({
      userId: req.user.id,
      action: 'UPDATE_STUDENT',
      entity: 'Student',
      entityId: id,
      ipAddress: req.ip,
    });

    return sendSuccess(res, student, 'Student updated successfully');
  } catch (err) {
    console.error('[STUDENT UPDATE] Error:', err.message);
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    await prisma.student.update({ where: { id }, data: { status: 'INACTIVE' } });

    await logActivity({
      userId: req.user.id,
      action: 'DELETE_STUDENT',
      entity: 'Student',
      entityId: id,
      ipAddress: req.ip,
    });

    return sendSuccess(res, null, 'Student deactivated successfully');
  } catch (err) {
    next(err);
  }
}

async function getAttendance(req, res, next) {
  try {
    const studentId = parseInt(req.params.id);
    const { startDate, endDate } = req.query;

    const where = { studentId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate)   where.date.lte = new Date(endDate);
    }

    const records = await prisma.studentAttendance.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    const total   = records.length;
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const absent  = records.filter((r) => r.status === 'ABSENT').length;
    const leave   = records.filter((r) => r.status === 'LEAVE').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return sendSuccess(res, { records, summary: { total, present, absent, leave, percentage } });
  } catch (err) {
    next(err);
  }
}

async function getResults(req, res, next) {
  try {
    const studentId = parseInt(req.params.id);
    const results = await prisma.examResult.findMany({
      where: { studentId },
      include: { exam: true },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, results);
  } catch (err) {
    next(err);
  }
}

async function getFees(req, res, next) {
  try {
    const studentId = parseInt(req.params.id);
    const records = await prisma.feeRecord.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
    });
    const totalPaid = records.reduce((sum, r) => sum + Number(r.amount), 0);
    return sendSuccess(res, { records, totalPaid });
  } catch (err) {
    next(err);
  }
}

async function getBooks(req, res, next) {
  try {
    const studentId = parseInt(req.params.id);
    const issues = await prisma.bookIssue.findMany({
      where: { studentId },
      include: { book: true },
      orderBy: { issueDate: 'desc' },
    });
    return sendSuccess(res, issues);
  } catch (err) {
    next(err);
  }
}

async function promote(req, res, next) {
  try {
    const studentId = parseInt(req.params.id);
    const { toClassId, toSectionId, academicYearId } = req.body;

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return sendError(res, 'Student not found', 404);

    // Auto-resolve academicYearId
    let yearId = academicYearId ? parseInt(academicYearId) : null;
    if (!yearId) {
      const currentYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
      if (!currentYear) return sendError(res, 'No current academic year found', 400);
      yearId = currentYear.id;
    }

    if (!toClassId) return sendError(res, 'toClassId is required', 400);

    const promotion = await prisma.$transaction(async (tx) => {
      const promo = await tx.studentPromotion.create({
        data: {
          studentId,
          fromClassId:   student.classId,
          toClassId:     parseInt(toClassId),
          fromSectionId: student.sectionId,
          toSectionId:   toSectionId ? parseInt(toSectionId) : null,
          academicYearId: yearId,
          promotedById:  req.user.id,
        },
      });

      await tx.student.update({
        where: { id: studentId },
        data: {
          classId:       parseInt(toClassId),
          sectionId:     toSectionId ? parseInt(toSectionId) : null,
          academicYearId: yearId,
        },
      });

      return promo;
    });

    return sendSuccess(res, promotion, 'Student promoted successfully');
  } catch (err) {
    next(err);
  }
}

async function bulkImport(req, res, next) {
  try {
    if (!req.file) return sendError(res, 'No file uploaded', 400);

    const XLSX = require('xlsx');
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) return sendError(res, 'File is empty or has no data rows', 400);

    // Auto-resolve academic year
    let year = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
    if (!year) return sendError(res, 'No current academic year found', 400);

    const stats = { imported: 0, skipped: 0, failed: 0, errors: [] };
    const seenRollNos = new Set();
    const existingRollNos = await prisma.student.findMany({ select: { rollNo: true } });
    existingRollNos.forEach((s) => seenRollNos.add(s.rollNo));

    const classCache = {};
    const sectionCache = {};

    for (const row of rows) {
      try {
        const name = String(row['Name'] || row['Student Name'] || row['name'] || '').trim();
        if (!name) { stats.skipped++; continue; }

        const { firstName, lastName } = (() => {
          const parts = name.split(/\s+/);
          return parts.length === 1
            ? { firstName: parts[0], lastName: parts[0] }
            : { firstName: parts[0], lastName: parts.slice(1).join(' ') };
        })();

        const className = String(row['Class'] || row['class'] || '1st Year').trim();
        const sectionName = String(row['Section'] || row['section'] || '').trim();
        const rollNoRaw = String(row['Roll No'] || row['RollNo'] || row['Roll Number'] || row['rollNo'] || '').trim();

        // Resolve class
        if (!classCache[className]) {
          const cls = await prisma.class.upsert({
            where: { name_academicYearId: { name: className, academicYearId: year.id } },
            update: {},
            create: { name: className, academicYearId: year.id },
          });
          classCache[className] = cls;
        }
        const cls = classCache[className];

        // Resolve section
        if (sectionName && !sectionCache[sectionName]) {
          const sec = await prisma.section.upsert({
            where: { name_classId: { name: sectionName, classId: cls.id } },
            update: {},
            create: { name: sectionName, classId: cls.id },
          });
          sectionCache[sectionName] = sec;
        }
        const sec = sectionName ? sectionCache[sectionName] : null;

        // Unique rollNo
        let rollNo = rollNoRaw ? `${sectionName}-${rollNoRaw}` : `AUTO-${Date.now()}-${stats.imported}`;
        if (seenRollNos.has(rollNo)) rollNo = `${rollNo}-${stats.imported}`;
        seenRollNos.add(rollNo);

        const annualCharges = parseFloat(row['Annual Charges'] || row['AnnualCharges'] || 8000) || 0;
        const tuitionFee = parseFloat(row['Tuition Fee'] || row['TuitionFee'] || 0) || 0;
        const transportFee = parseFloat(row['Transport Fee'] || row['TransportFee'] || 0) || 0;
        const packageTotal = annualCharges + tuitionFee + transportFee;

        const genderRaw = String(row['Gender'] || row['gender'] || '').trim().toUpperCase();
        const genderVal = genderRaw === 'FEMALE' ? 'FEMALE' : genderRaw === 'OTHER' ? 'OTHER' : 'MALE';

        await prisma.student.create({
          data: {
            rollNo,
            firstName,
            lastName,
            gender: genderVal,
            admissionDate: new Date('2025-04-01'),
            admissionType: 'NEW',
            classId: cls.id,
            sectionId: sec ? sec.id : null,
            academicYearId: year.id,
            feeCategory: 'REGULAR',
            transport: transportFee > 0 ? 'SCHOOL_BUS' : 'NONE',
            transportFee: transportFee || null,
            annualCharges: annualCharges || null,
            tuitionFee: tuitionFee || null,
            packageTotal: packageTotal || null,
            fatherName: String(row['Father Name'] || row['FatherName'] || '').trim() || null,
            fatherPhone: String(row['Phone'] || row['Father Phone'] || row['Contact'] || '').trim() || null,
            address: String(row['Address'] || row['address'] || '').trim() || null,
            status: 'ACTIVE',
          },
        });

        stats.imported++;
      } catch (err) {
        stats.failed++;
        stats.errors.push(err.message);
      }
    }

    await logActivity({ userId: req.user.id, action: 'BULK_IMPORT_EXCEL', entity: 'Student', details: stats, ipAddress: req.ip });
    return sendSuccess(res, stats, `Import complete: ${stats.imported} imported, ${stats.skipped} skipped, ${stats.failed} failed`);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll, getOne, create, update, remove,
  getAttendance, getResults, getFees, getBooks,
  promote, bulkImport,
};
