import express from 'express';
import { issueBook, returnBook, getUserHistory, getAllIssues, payFine, userBorrowBook } from '../controllers/issueController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validation.js';
import { issueBookSchema, returnBookSchema, userBorrowSchema } from '../utils/validators.js';

const router = express.Router();

router.post('/issue', authenticate, authorize('admin'), validate(issueBookSchema), issueBook);
router.post('/borrow', authenticate, validate(userBorrowSchema), userBorrowBook);
router.post('/return/:id', authenticate, authorize('admin'), validate(returnBookSchema), returnBook);
router.get('/history', authenticate, getUserHistory);
router.get('/admin/all', authenticate, authorize('admin'), getAllIssues);
router.put('/pay-fine/:id', authenticate, authorize('admin'), payFine);

export default router;
