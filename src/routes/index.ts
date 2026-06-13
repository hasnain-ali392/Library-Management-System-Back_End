import express from 'express';
import authRoutes from './authRoutes';
import bookRoutes from './bookRoutes';
import issueRoutes from './issueRoutes';
import fineRoutes from './fineRoutes';
import reportRoutes from './reportRoutes';
import userRoutes from './userRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/issues', issueRoutes);
router.use('/fines', fineRoutes);
router.use('/reports', reportRoutes);
router.use('/users', userRoutes);
router.use('/circulation', issueRoutes);

export default router;
