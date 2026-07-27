import express from 'express';
import { markAttendance, getAttendance, updateAttendance } from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAttendance);
router.post('/', protect, authorize('admin', 'organizer'), markAttendance);
router.put('/:id', protect, authorize('admin', 'organizer'), updateAttendance);

export default router;
