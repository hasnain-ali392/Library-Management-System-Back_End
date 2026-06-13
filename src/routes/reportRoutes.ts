import express from 'express';
import { getDashboardStats } from '../controllers/reportController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = express.Router();

router.get('/dashboard-stats', authenticate, authorize('admin'), getDashboardStats);

export default router;
