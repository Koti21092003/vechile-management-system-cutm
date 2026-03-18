import express from 'express';
import { getAllUsers, getUser, createUser, updateUser, deleteUser, toggleUserStatus, uploadProfilePhoto } from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();
router.use(protect);

router.route('/').get(authorize('admin'), getAllUsers).post(authorize('admin'), createUser);
router.route('/:id').get(getUser).put(updateUser).delete(authorize('admin'), deleteUser);
router.patch('/:id/toggle-status', authorize('admin'), toggleUserStatus);
router.post('/:id/upload-photo', upload.single('photo'), uploadProfilePhoto);

export default router;
