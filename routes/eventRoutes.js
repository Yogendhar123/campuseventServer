import express from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import validate from '../middleware/validateMiddleware.js';
import { eventValidator } from '../validators/eventValidator.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', protect, authorize('admin', 'organizer'), eventValidator, validate, createEvent);
router.put('/:id', protect, authorize('admin', 'organizer'), updateEvent);
router.delete('/:id', protect, authorize('admin', 'organizer'), deleteEvent);

export default router;
