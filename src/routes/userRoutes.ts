import express from 'express';
import { getUsers, suspendUser, updateProfile } from '../controllers/userController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = express.Router();

router.get('/', authenticate, authorize('admin'), getUsers);
router.put('/:id/suspension', authenticate, authorize('admin'), suspendUser);
router.put('/profile/update', authenticate, updateProfile);

export default router;
