import express from 'express';
import authRoutes from './authRoutes.js';
import bookRoutes from './bookRoutes.js';
import issueRoutes from './issueRoutes.js';
import fineRoutes from './fineRoutes.js';
import reportRoutes from './reportRoutes.js';
import userRoutes from './userRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/issues', issueRoutes);
router.use('/fines', fineRoutes);
router.use('/reports', reportRoutes);
router.use('/users', userRoutes);
router.use('/circulation', issueRoutes);

export default router;
