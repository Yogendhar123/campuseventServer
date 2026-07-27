import express from 'express';
import {
  generateCertificate,
  getCertificates,
  getCertificate,
} from '../controllers/certificateController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getCertificates);
router.get('/:id', protect, getCertificate);
router.post('/generate', protect, authorize('admin', 'organizer'), generateCertificate);

export default router;
