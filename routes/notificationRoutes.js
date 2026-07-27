import express from 'express';
import {
  getNotifications,
  createNotification,
  markAsRead,
} from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getNotifications);
router.post('/', authorize('admin', 'organizer'), createNotification);
router.put('/:id/read', markAsRead);

export default router;
