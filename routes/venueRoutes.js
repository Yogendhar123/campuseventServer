import express from 'express';
import { getVenues, createVenue, updateVenue, deleteVenue } from '../controllers/venueController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getVenues);
router.post('/', protect, authorize('admin', 'organizer'), createVenue);
router.put('/:id', protect, authorize('admin', 'organizer'), updateVenue);
router.delete('/:id', protect, authorize('admin'), deleteVenue);

export default router;
