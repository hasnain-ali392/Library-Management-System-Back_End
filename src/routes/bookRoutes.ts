import express from 'express';
import { getBooks, getBookById, addBook, updateBook, deleteBook } from '../controllers/bookController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { upload } from '../middleware/upload';
import { validate } from '../middleware/validation';
import { bookCreateSchema, getBooksQuerySchema } from '../utils/validators';

const router = express.Router();

router.route('/')
  .get(validate(getBooksQuerySchema), getBooks)
  .post(authenticate, authorize('admin'), upload.single('bookImage'), validate(bookCreateSchema), addBook);

router.route('/:id')
  .get(getBookById)
  .put(authenticate, authorize('admin'), upload.single('bookImage'), updateBook)
  .delete(authenticate, authorize('admin'), deleteBook);

export default router;
