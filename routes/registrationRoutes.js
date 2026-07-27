import express from 'express';
import {
  createRegistration,
  getRegistrations,
  cancelRegistration,
} from '../controllers/registrationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/', createRegistration);
router.get('/', getRegistrations);
router.delete('/:id', cancelRegistration);

export default router;
