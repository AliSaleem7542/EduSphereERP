const { prisma } = require('../../config/database');
const { sendSuccess, sendError, paginate } = require('../../utils/apiResponse');
const { generateReceiptNo } = require('../../utils/receiptGenerator');
const { logActivity } = require('../../utils/activityLogger');

async function getAll(req, res, next) {
  try {
    const { page = 1, limit = 20, studentId, feeType, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (studentId) where.studentId = parseInt(studentId);
    if (feeType)   where.feeType   = feeType;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate)   where.date.lte = new Date(endDate);
    }
    const [records, total] = await Promise.all([
      prisma.feeRecord.findMany({ where, skip, take: parseInt(limit), include: { student: true }, orderBy: { date: 'desc' } }),
      prisma.feeRecord.count({ where }),
    ]);
    return sendSuccess(res, paginate(records, total, page, limit));
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const record = await prisma.feeRecord.findUnique({ where: { id: parseInt(req.params.id) }, include: { student: true } });
    if (!record) return sendError(res, 'Fee record not found', 404);
    return sendSuccess(res, record);
  } catch (err) { next(err); }
}

async function collect(req, res, next) {
  try {
    const { studentId, feeType, period, installment, amount, transportAmount, paymentMethod, remarks, date } = req.body;

    // Validate required fields and enums
    const VALID_FEE_TYPES = ['MONTHLY', 'ADMISSION', 'EXAM', 'LIBRARY', 'TRANSPORT', 'OTHER'];
    const VALID_PAY_METHODS = ['CASH', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE'];

    if (!studentId)                          return sendError(res, 'studentId is required', 400);
    if (!feeType)                            return sendError(res, 'feeType is required', 400);
    if (!VALID_FEE_TYPES.includes(feeType))  return sendError(res, `feeType must be one of: ${VALID_FEE_TYPES.join(', ')}`, 400);
    if (!amount || isNaN(parseFloat(amount))) return sendError(res, 'amount is required and must be a number', 400);

    const safePayMethod = VALID_PAY_METHODS.includes(paymentMethod) ? paymentMethod : 'CASH';
    const receiptNo = await generateReceiptNo();

    const record = await prisma.feeRecord.create({
      data: {
        receiptNo,
        studentId:       parseInt(studentId),
        feeType,
        period:          period || null,
        installment:     installment || null,
        amount:          parseFloat(amount),
        transportAmount: transportAmount ? parseFloat(transportAmount) : null,
        paymentMethod:   safePayMethod,
        remarks:         remarks || null,
        date:            date ? new Date(date) : new Date(),
        status:          'PAID',
        collectedById:   req.user.id,
      },
      include: { student: true },
    });

    await logActivity({ userId: req.user.id, action: 'COLLECT_FEE', entity: 'FeeRecord', entityId: record.id, ipAddress: req.ip });
    return sendSuccess(res, record, 'Fee collected successfully', 201);
  } catch (err) { next(err); }
}

async function voidRecord(req, res, next) {
  try {
    await prisma.feeRecord.update({ where: { id: parseInt(req.params.id) }, data: { status: 'REFUNDED' } });
    return sendSuccess(res, null, 'Fee record voided');
  } catch (err) { next(err); }
}

async function getPending(req, res, next) {
  try {
    const students = await prisma.student.findMany({
      where: { status: 'ACTIVE', packageTotal: { gt: 0 } },
      include: { feeRecords: true, class: true, section: true },
    });

    const pending = students
      .map((s) => {
        const paid = s.feeRecords.reduce((sum, r) => sum + Number(r.amount), 0);
        const due  = Math.max(0, Number(s.packageTotal) - paid);
        return { ...s, totalPaid: paid, pendingAmount: due };
      })
      .filter((s) => s.pendingAmount > 0);

    return sendSuccess(res, pending);
  } catch (err) { next(err); }
}

async function getSummary(req, res, next) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayRecords, allRecords] = await Promise.all([
      prisma.feeRecord.findMany({ where: { date: { gte: today }, status: 'PAID' } }),
      prisma.feeRecord.findMany({ where: { status: 'PAID' } }),
    ]);

    const collectedToday = todayRecords.reduce((s, r) => s + Number(r.amount), 0);
    const totalCollected = allRecords.reduce((s, r) => s + Number(r.amount), 0);

    return sendSuccess(res, { collectedToday, totalCollected, receiptsToday: todayRecords.length, totalReceipts: allRecords.length });
  } catch (err) { next(err); }
}

async function getRefunds(req, res, next) {
  try {
    const refunds = await prisma.feeRefund.findMany({ include: { student: true, feeRecord: true }, orderBy: { createdAt: 'desc' } });
    return sendSuccess(res, refunds);
  } catch (err) { next(err); }
}

async function processRefund(req, res, next) {
  try {
    const { feeRecordId, amount, reason, date } = req.body;
    const refund = await prisma.$transaction(async (tx) => {
      const r = await tx.feeRefund.create({
        data: {
          feeRecordId: parseInt(feeRecordId),
          studentId: (await tx.feeRecord.findUnique({ where: { id: parseInt(feeRecordId) } })).studentId,
          amount: parseFloat(amount),
          reason,
          date: date ? new Date(date) : new Date(),
          processedById: req.user.id,
        },
      });
      await tx.feeRecord.update({ where: { id: parseInt(feeRecordId) }, data: { status: 'REFUNDED' } });
      return r;
    });
    return sendSuccess(res, refund, 'Refund processed', 201);
  } catch (err) { next(err); }
}

module.exports = { getAll, getOne, collect, voidRecord, getPending, getSummary, getRefunds, processRefund };
