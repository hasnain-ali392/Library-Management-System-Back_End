import express from 'express';
import { getBooks, getBookById, addBook, updateBook, deleteBook } from '../controllers/bookController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validation.js';
import { bookCreateSchema, getBooksQuerySchema } from '../utils/validators.js';

const router = express.Router();

router.route('/')
  .get(validate(getBooksQuerySchema), getBooks)
  .post(authenticate, authorize('admin'), upload.single('bookImage'), validate(bookCreateSchema), addBook);

router.route('/:id')
  .get(getBookById)
  .put(authenticate, authorize('admin'), upload.single('bookImage'), updateBook)
  .delete(authenticate, authorize('admin'), deleteBook);

export default router;
