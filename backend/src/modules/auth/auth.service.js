const { prisma } = require('../../config/database');
const { comparePassword, hashPassword } = require('../../utils/bcrypt');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  expiryToDate,
  REFRESH_EXPIRES,
} = require('../../config/jwt');
const { logActivity } = require('../../utils/activityLogger');
const {
  recordFailedAttempt,
  isAccountLocked,
  resetFailedAttempts,
} = require('../../utils/accountLockout');
const {
  logFailedLogin,
  logAccountLockout,
  logSuccessfulLogin,
  logPasswordChange,
} = require('../../utils/securityLogger');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildTokenPair(user) {
  const payload = { id: user.id, role: user.role, username: user.username };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ id: user.id });
  return { accessToken, refreshToken };
}

async function storeRefreshToken(userId, token) {
  try {
    await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt: expiryToDate(REFRESH_EXPIRES),
      },
    });
  } catch (err) {
    // If token already exists (unique constraint), it's already stored — ignore
    if (err.code === 'P2002') return;
    throw err;
  }
}

// ─── Admin Login ──────────────────────────────────────────────────────────────

async function adminLogin(username, password, ipAddress, userAgent = null) {
  // Accept username OR email (admin@edusphere.com → username: admin)
  let lookupUsername = username;
  if (username && username.includes('@')) {
    // Strip domain, use local part as username
    lookupUsername = username.split('@')[0];
  }

  // Check if account is locked
  const lockStatus = isAccountLocked(lookupUsername, ipAddress);
  if (lockStatus.isLocked) {
    await logAccountLockout(lookupUsername, ipAddress, userAgent, lockStatus.lockedUntil);
    throw { statusCode: 429, message: lockStatus.message };
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: lookupUsername },
        { username: username }, // exact match fallback
      ],
      role: 'ADMIN',
    },
  });

  if (!user || user.role !== 'ADMIN') {
    const failResult = recordFailedAttempt(lookupUsername, ipAddress);
    await logFailedLogin(lookupUsername, ipAddress, userAgent, failResult.remainingAttempts);
    throw { statusCode: 401, message: failResult.message };
  }

  if (!user.isActive) {
    throw { statusCode: 403, message: 'Account is deactivated' };
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    const failResult = recordFailedAttempt(lookupUsername, ipAddress);
    await logFailedLogin(lookupUsername, ipAddress, userAgent, failResult.remainingAttempts);
    throw { statusCode: 401, message: failResult.message };
  }

  // Success - reset failed attempts
  resetFailedAttempts(lookupUsername, ipAddress);
  await logSuccessfulLogin(user.id, lookupUsername, ipAddress, userAgent, 'ADMIN');

  const { accessToken, refreshToken } = buildTokenPair(user);
  await storeRefreshToken(user.id, refreshToken);

  await logActivity({
    userId: user.id,
    action: 'ADMIN_LOGIN',
    entity: 'User',
    entityId: user.id,
    ipAddress,
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, username: user.username, role: user.role },
  };
}

// ─── Teacher Login ────────────────────────────────────────────────────────────

async function teacherLogin(phone, password, ipAddress, userAgent = null) {
  // Check if account is locked
  const lockStatus = isAccountLocked(phone, ipAddress);
  if (lockStatus.isLocked) {
    await logAccountLockout(phone, ipAddress, userAgent, lockStatus.lockedUntil);
    throw { statusCode: 429, message: lockStatus.message };
  }

  const teacher = await prisma.teacher.findUnique({
    where: { phone },
    include: { user: true },
  });

  if (!teacher || !teacher.user) {
    const failResult = recordFailedAttempt(phone, ipAddress);
    await logFailedLogin(phone, ipAddress, userAgent, failResult.remainingAttempts);
    throw { statusCode: 401, message: failResult.message };
  }

  if (!teacher.user.isActive) {
    throw { statusCode: 403, message: 'Account is deactivated' };
  }

  if (teacher.status !== 'ACTIVE') {
    throw { statusCode: 403, message: 'Teacher account is not active' };
  }

  // Default password = phone number
  const storedHash = teacher.user.passwordHash;
  const valid = await comparePassword(password, storedHash);
  if (!valid) {
    const failResult = recordFailedAttempt(phone, ipAddress);
    await logFailedLogin(phone, ipAddress, userAgent, failResult.remainingAttempts);
    throw { statusCode: 401, message: failResult.message };
  }

  // Success - reset failed attempts
  resetFailedAttempts(phone, ipAddress);
  await logSuccessfulLogin(teacher.user.id, phone, ipAddress, userAgent, 'TEACHER');

  const { accessToken, refreshToken } = buildTokenPair(teacher.user);
  await storeRefreshToken(teacher.user.id, refreshToken);

  await logActivity({
    userId: teacher.user.id,
    action: 'TEACHER_LOGIN',
    entity: 'Teacher',
    entityId: teacher.id,
    ipAddress,
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: teacher.user.id,
      role: teacher.user.role,
      teacherId: teacher.id,
      name: teacher.name,
      phone: teacher.phone,
      department: teacher.department,
      photo: teacher.photo,
    },
  };
}

// ─── Student Login ────────────────────────────────────────────────────────────

async function studentLogin(rollNo, password, ipAddress, userAgent = null) {
  // Check if account is locked
  const lockStatus = isAccountLocked(rollNo, ipAddress);
  if (lockStatus.isLocked) {
    await logAccountLockout(rollNo, ipAddress, userAgent, lockStatus.lockedUntil);
    throw { statusCode: 429, message: lockStatus.message };
  }

  // Try exact match first, then try section-prefixed variants
  let student = await prisma.student.findUnique({
    where: { rollNo },
    include: { user: true, class: true, section: true },
  });

  // If not found, try matching by the numeric part (e.g. "201" matches "C-1-201")
  if (!student) {
    const allMatches = await prisma.student.findMany({
      where: { rollNo: { endsWith: `-${rollNo}` } },
      include: { user: true, class: true, section: true },
      take: 1,
    });
    if (allMatches.length > 0) student = allMatches[0];
  }

  if (!student) {
    const failResult = recordFailedAttempt(rollNo, ipAddress);
    await logFailedLogin(rollNo, ipAddress, userAgent, failResult.remainingAttempts);
    throw { statusCode: 401, message: failResult.message };
  }

  if (student.status !== 'ACTIVE') {
    throw { statusCode: 403, message: 'Student account is not active' };
  }

  // If student has a linked User account, use that; otherwise compare against rollNo
  if (student.user) {
    if (!student.user.isActive) {
      throw { statusCode: 403, message: 'Account is deactivated' };
    }
    // Try the supplied password first, then also try the full stored rollNo
    const valid = await comparePassword(password, student.user.passwordHash);
    // Also accept the full stored rollNo as password (for students who haven't changed it)
    const validFull = valid ? true : await comparePassword(student.rollNo, student.user.passwordHash);
    // Accept if: supplied password matches hash, OR supplied password equals stored rollNo, OR equals short part
    const shortPart = student.rollNo.split('-').pop();
    const validShort = (!valid && !validFull) ? (password === shortPart || password === student.rollNo) : false;

    if (!valid && !validFull && !validShort) {
      const failResult = recordFailedAttempt(rollNo, ipAddress);
      await logFailedLogin(rollNo, ipAddress, userAgent, failResult.remainingAttempts);
      throw { statusCode: 401, message: failResult.message };
    }

    // Success - reset failed attempts
    resetFailedAttempts(rollNo, ipAddress);
    await logSuccessfulLogin(student.user.id, rollNo, ipAddress, userAgent, 'STUDENT');

    const { accessToken, refreshToken } = buildTokenPair(student.user);
    await storeRefreshToken(student.user.id, refreshToken);

    await logActivity({
      userId: student.user.id,
      action: 'STUDENT_LOGIN',
      entity: 'Student',
      entityId: student.id,
      ipAddress,
    });

    return buildStudentResponse(student, accessToken, refreshToken, student.user.id);
  }

  // Fallback: password = rollNo (no User record yet)
  // Accept both the full stored rollNo and the short numeric part
  const shortRollNo = rollNo; // what the user typed
  const fullRollNo = student.rollNo; // what's stored in DB
  if (password !== fullRollNo && password !== shortRollNo) {
    const failResult = recordFailedAttempt(rollNo, ipAddress);
    await logFailedLogin(rollNo, ipAddress, userAgent, failResult.remainingAttempts);
    throw { statusCode: 401, message: failResult.message };
  }

  // Success - reset failed attempts
  resetFailedAttempts(rollNo, ipAddress);

  // Auto-create a User record for this student
  const passwordHash = await hashPassword(fullRollNo);
  const newUser = await prisma.user.create({
    data: {
      username: `student_${fullRollNo.replace(/[^a-zA-Z0-9]/g, '_')}`,
      passwordHash,
      role: 'STUDENT',
    },
  });

  await prisma.student.update({
    where: { id: student.id },
    data: { userId: newUser.id },
  });

  await logSuccessfulLogin(newUser.id, rollNo, ipAddress, userAgent, 'STUDENT');

  const { accessToken, refreshToken } = buildTokenPair(newUser);
  await storeRefreshToken(newUser.id, refreshToken);

  await logActivity({
    userId: newUser.id,
    action: 'STUDENT_LOGIN',
    entity: 'Student',
    entityId: student.id,
    ipAddress,
  });

  return buildStudentResponse(student, accessToken, refreshToken, newUser.id);
}

function buildStudentResponse(student, accessToken, refreshToken, userId) {
  return {
    accessToken,
    refreshToken,
    user: {
      id: userId,
      role: 'STUDENT',
      studentId: student.id,
      name: `${student.firstName} ${student.lastName}`,
      rollNo: student.rollNo,
      class: student.class?.name,
      section: student.section?.name,
      photo: student.photo,
    },
  };
}

// ─── Refresh Token ────────────────────────────────────────────────────────────

async function refreshAccessToken(token) {
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw { statusCode: 401, message: 'Invalid or expired refresh token' };
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    throw { statusCode: 401, message: 'Refresh token not found or expired' };
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user || !user.isActive) {
    throw { statusCode: 401, message: 'User not found or deactivated' };
  }

  // Rotate: delete old, issue new
  await prisma.refreshToken.delete({ where: { token } });

  const { accessToken, refreshToken: newRefreshToken } = buildTokenPair(user);
  await storeRefreshToken(user.id, newRefreshToken);

  return { accessToken, refreshToken: newRefreshToken };
}

// ─── Logout ───────────────────────────────────────────────────────────────────

async function logout(token) {
  if (!token) return;
  await prisma.refreshToken.deleteMany({ where: { token } });
}

// ─── Change Password ──────────────────────────────────────────────────────────

async function changePassword(userId, currentPassword, newPassword, ipAddress = null, userAgent = null) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw { statusCode: 404, message: 'User not found' };

  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) throw { statusCode: 400, message: 'Current password is incorrect' };

  const newHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  // Log password change
  await logPasswordChange(userId, user.username, ipAddress, userAgent);

  // Invalidate all refresh tokens
  await prisma.refreshToken.deleteMany({ where: { userId } });
}

module.exports = {
  adminLogin,
  teacherLogin,
  studentLogin,
  refreshAccessToken,
  logout,
  changePassword,
};
