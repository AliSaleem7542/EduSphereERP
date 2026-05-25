const { Router } = require('express');
const c = require('./library.controller');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');

const router = Router();
router.use(authenticate);

router.get('/books',           authorize('ADMIN', 'TEACHER', 'STUDENT'), c.getBooks);
router.post('/books',          authorize('ADMIN'),                        c.addBook);
router.put('/books/:id',       authorize('ADMIN'),                        c.updateBook);
router.delete('/books/:id',    authorize('ADMIN'),                        c.deleteBook);
router.post('/issue',          authorize('ADMIN'),                        c.issueBook);
router.post('/return/:issueId', authorize('ADMIN'),                       c.returnBook);
router.get('/issues',          authorize('ADMIN', 'STUDENT'),             c.getIssues);
router.get('/overdue',         authorize('ADMIN'),                        c.getOverdue);

module.exports = router;
