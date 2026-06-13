import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { validate } from '../middleware/validation.js';
import { registerSchema, loginSchema } from '../utils/validators.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', authenticate, (req, res) => {
    // Invalidate the token on the client side by clearing the cookie
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    res.status(200).json({ message: 'Logged out successfully' });
}
);
router.get('/me', authenticate, getMe);

export default router;
