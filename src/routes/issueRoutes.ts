import express from 'express';
import { issueBook, returnBook, getUserHistory, getAllIssues, payFine, userBorrowBook } from '../controllers/issueController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validation';
import { issueBookSchema, returnBookSchema, userBorrowSchema } from '../utils/validators';

const router = express.Router();

router.post('/issue', authenticate, authorize('admin'), validate(issueBookSchema), issueBook);
router.post('/borrow', authenticate, validate(userBorrowSchema), userBorrowBook);
router.post('/return/:id', authenticate, authorize('admin'), validate(returnBookSchema), returnBook);
router.get('/history', authenticate, getUserHistory);
router.get('/admin/all', authenticate, authorize('admin'), getAllIssues);
router.put('/pay-fine/:id', authenticate, authorize('admin'), payFine);

export default router;
