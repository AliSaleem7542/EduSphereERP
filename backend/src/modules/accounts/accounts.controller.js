const { prisma } = require('../../config/database');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

async function getEntries(req, res, next) {
  try {
    const { type, startDate, endDate } = req.query;
    const where = {};
    if (type) where.type = type;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate)   where.date.lte = new Date(endDate);
    }
    const entries = await prisma.accountEntry.findMany({ where, orderBy: { date: 'desc' } });
    return sendSuccess(res, entries);
  } catch (err) { next(err); }
}

async function createEntry(req, res, next) {
  try {
    const { type, category, description, amount, date, reference } = req.body;

    // Validate required fields
    if (!type || !['INCOME', 'EXPENSE'].includes(type)) {
      return sendError(res, 'type must be INCOME or EXPENSE', 400);
    }
    if (!category || !String(category).trim()) {
      return sendError(res, 'category is required', 400);
    }
    if (!amount || isNaN(parseFloat(amount))) {
      return sendError(res, 'amount is required and must be a number', 400);
    }
    if (!date) {
      return sendError(res, 'date is required', 400);
    }

    const entry = await prisma.accountEntry.create({
      data: {
        type,
        category:    String(category).trim(),
        description: description ? String(description).trim() : '',
        amount:      parseFloat(amount),
        date:        new Date(date),
        reference:   reference || null,
        createdById: req.user.id,
      },
    });
    return sendSuccess(res, entry, 'Entry created', 201);
  } catch (err) { next(err); }
}

async function updateEntry(req, res, next) {
  try {
    const { type, category, description, amount, date, reference } = req.body;
    const data = {};
    if (type)        data.type        = type;
    if (category)    data.category    = String(category).trim();
    if (description !== undefined) data.description = description ? String(description).trim() : '';
    if (amount)      data.amount      = parseFloat(amount);
    if (date)        data.date        = new Date(date);
    if (reference !== undefined) data.reference = reference || null;
    const entry = await prisma.accountEntry.update({ where: { id: parseInt(req.params.id) }, data });
    return sendSuccess(res, entry, 'Entry updated');
  } catch (err) { next(err); }
}

async function deleteEntry(req, res, next) {
  try {
    await prisma.accountEntry.delete({ where: { id: parseInt(req.params.id) } });
    return sendSuccess(res, null, 'Entry deleted');
  } catch (err) { next(err); }
}

async function getLedger(req, res, next) {
  try {
    const entries = await prisma.accountEntry.findMany({ orderBy: [{ date: 'asc' }, { id: 'asc' }] });
    let balance = 0;
    const ledger = entries.map((e) => {
      balance += e.type === 'INCOME' ? Number(e.amount) : -Number(e.amount);
      return { ...e, runningBalance: balance };
    });
    return sendSuccess(res, { ledger, closingBalance: balance });
  } catch (err) { next(err); }
}

async function getBalanceSheet(req, res, next) {
  try {
    const [income, expense] = await Promise.all([
      prisma.accountEntry.aggregate({ where: { type: 'INCOME' }, _sum: { amount: true } }),
      prisma.accountEntry.aggregate({ where: { type: 'EXPENSE' }, _sum: { amount: true } }),
    ]);
    const totalIncome  = Number(income._sum.amount  || 0);
    const totalExpense = Number(expense._sum.amount || 0);
    return sendSuccess(res, { totalIncome, totalExpense, netBalance: totalIncome - totalExpense });
  } catch (err) { next(err); }
}

module.exports = { getEntries, createEntry, updateEntry, deleteEntry, getLedger, getBalanceSheet };
