import express from 'express';
import { getUserFines, payFine } from '../controllers/fineController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = express.Router();

router.get('/my-fines', authenticate, getUserFines);
router.post('/pay/:id', authenticate, authorize('admin'), payFine);

export default router;
