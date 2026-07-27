import express from 'express';
import {
  register,
  login,
  logout,
  forgotPassword,
  getProfile,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validateMiddleware.js';
import { registerValidator, loginValidator, forgotPasswordValidator } from '../validators/authValidator.js';

const router = express.Router();

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPasswordValidator, validate, forgotPassword);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
