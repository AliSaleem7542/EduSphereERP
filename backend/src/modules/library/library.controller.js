const { prisma } = require('../../config/database');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

async function getBooks(req, res, next) {
  try {
    const { category, available, search } = req.query;
    const where = {};
    if (category)  where.category = { contains: category, mode: 'insensitive' };
    if (available === 'true') where.availableCopies = { gt: 0 };
    if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { author: { contains: search, mode: 'insensitive' } }];
    const books = await prisma.book.findMany({ where, orderBy: { title: 'asc' } });
    return sendSuccess(res, books);
  } catch (err) { next(err); }
}

async function addBook(req, res, next) {
  try {
    const { title, author, isbn, category, publisher, edition, totalCopies, shelfNo } = req.body;
    const copies = parseInt(totalCopies) || 1;
    const book = await prisma.book.create({ data: { title, author, isbn, category, publisher, edition, totalCopies: copies, availableCopies: copies, shelfNo } });
    return sendSuccess(res, book, 'Book added', 201);
  } catch (err) { next(err); }
}

async function updateBook(req, res, next) {
  try {
    const book = await prisma.book.update({ where: { id: parseInt(req.params.id) }, data: req.body });
    return sendSuccess(res, book, 'Book updated');
  } catch (err) { next(err); }
}

async function deleteBook(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    // Check for active (unreturned) issues
    const activeIssues = await prisma.bookIssue.count({ where: { bookId: id, status: 'ISSUED' } });
    if (activeIssues > 0) return sendError(res, 'Cannot delete book with active issues. Return all copies first.', 400);
    // Delete issue history first, then book
    await prisma.bookIssue.deleteMany({ where: { bookId: id } });
    await prisma.book.delete({ where: { id } });
    return sendSuccess(res, null, 'Book deleted');
  } catch (err) { next(err); }
}

async function issueBook(req, res, next) {
  try {
    const { bookId, studentId, dueDate, issueDate } = req.body;
    if (!bookId)    return sendError(res, 'bookId is required', 400);
    if (!studentId) return sendError(res, 'studentId is required', 400);
    if (!dueDate)   return sendError(res, 'dueDate is required', 400);

    const book = await prisma.book.findUnique({ where: { id: parseInt(bookId) } });
    if (!book) return sendError(res, 'Book not found', 404);
    if (book.availableCopies < 1) return sendError(res, 'No copies available', 400);

    const issueDateParsed = issueDate ? new Date(issueDate) : new Date();

    const issue = await prisma.$transaction(async (tx) => {
      const i = await tx.bookIssue.create({
        data: {
          bookId:     parseInt(bookId),
          studentId:  parseInt(studentId),
          issueDate:  issueDateParsed,
          dueDate:    new Date(dueDate),
          status:     'ISSUED',
          issuedById: req.user.id,
        },
        include: { book: true, student: true },
      });
      await tx.book.update({ where: { id: parseInt(bookId) }, data: { availableCopies: { decrement: 1 } } });
      return i;
    });

    return sendSuccess(res, issue, 'Book issued', 201);
  } catch (err) { next(err); }
}

async function returnBook(req, res, next) {
  try {
    const issueId = parseInt(req.params.issueId);
    const issue = await prisma.bookIssue.findUnique({ where: { id: issueId } });
    if (!issue) return sendError(res, 'Issue record not found', 404);

    const returnDate = new Date();
    const dueDate    = new Date(issue.dueDate);
    const overdueDays = Math.max(0, Math.floor((returnDate - dueDate) / 86400000));
    const finePerDay = 5; // Could come from SystemSettings
    const fine = overdueDays * finePerDay;

    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.bookIssue.update({
        where: { id: issueId },
        data: { returnDate, fine, status: 'RETURNED' },
        include: { book: true },
      });
      await tx.book.update({ where: { id: issue.bookId }, data: { availableCopies: { increment: 1 } } });
      return u;
    });

    return sendSuccess(res, updated, `Book returned. Fine: Rs. ${fine}`);
  } catch (err) { next(err); }
}

async function getIssues(req, res, next) {
  try {
    const { studentId, status } = req.query;
    const where = {};
    if (studentId) where.studentId = parseInt(studentId);
    if (status)    where.status    = status;
    const issues = await prisma.bookIssue.findMany({ where, include: { book: true, student: true }, orderBy: { issueDate: 'desc' } });
    return sendSuccess(res, issues);
  } catch (err) { next(err); }
}

async function getOverdue(req, res, next) {
  try {
    const today = new Date();
    const issues = await prisma.bookIssue.findMany({
      where: { status: 'ISSUED', dueDate: { lt: today } },
      include: { book: true, student: true },
    });
    return sendSuccess(res, issues);
  } catch (err) { next(err); }
}

module.exports = { getBooks, addBook, updateBook, deleteBook, issueBook, returnBook, getIssues, getOverdue };
