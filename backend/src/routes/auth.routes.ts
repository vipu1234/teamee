import { Router } from 'express';
import { signup, login, logout, getMe, updateProfile, changePassword } from '../controllers/auth.controller.ts';
import { validate } from '../middleware/validate.ts';
import { authenticate } from '../middleware/auth.ts';
import { signupSchema, loginSchema } from '../schemas/auth.schema.ts';

const router = Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, changePassword);

export default router;
