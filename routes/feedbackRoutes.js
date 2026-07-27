import express from 'express';
import { createFeedback, getFeedback } from '../controllers/feedbackController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/', createFeedback);
router.get('/', getFeedback);

export default router;
