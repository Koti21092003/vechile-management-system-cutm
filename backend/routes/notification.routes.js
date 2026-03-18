import express from 'express';
import { getAllNotifications, getNotification, createNotification, markAsRead, markAllAsRead, deleteNotification } from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.route('/').get(getAllNotifications).post(createNotification);
router.patch('/mark-all-read', markAllAsRead);
router.route('/:id').get(getNotification).delete(deleteNotification);
router.patch('/:id/mark-read', markAsRead);

export default router;
