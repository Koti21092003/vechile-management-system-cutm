import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe, resetPassword, updatePassword } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

// Validation rules
const registerValidation = [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('role').isIn(['admin', 'driver', 'staff']).withMessage('Invalid role')
];

const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
];

const resetPasswordValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

// Routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', protect, getMe);
router.post('/reset-password', resetPasswordValidation, validate, resetPassword);
router.put('/update-password', protect, updatePassword);

export default router;
