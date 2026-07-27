import express from 'express';
import { getStats, getReports } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, getStats);
router.get('/reports', protect, authorize('admin', 'organizer'), getReports);

export default router;
