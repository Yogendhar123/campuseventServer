import crypto from 'crypto';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role && ['admin', 'organizer'].includes(role) ? 'student' : role || 'student',
  });

  await Notification.create({
    user: user._id,
    title: 'Welcome!',
    message: `Welcome to Campus Events, ${user.name}!`,
    type: 'success',
  });

  res.status(201).json({
    success: true,
    data: {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Your account has been deactivated');
  }

  res.status(200).json({
    success: true,
    data: {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc    Logout user (client discards token; endpoint provided for completeness)
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @desc    Forgot password - generates reset token
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    // Do not reveal whether the email exists
    return res.status(200).json({
      success: true,
      message: 'If that email is registered, a reset link has been sent',
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins
  await user.save({ validateBeforeSave: false });

  // In production this would be emailed. Returned here for demo purposes.
  res.status(200).json({
    success: true,
    message: 'Password reset token generated',
    resetToken,
  });
});

// @desc    Get logged in user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findById(req.user._id);

  user.name = name ?? user.name;
  user.phone = phone ?? user.phone;
  user.avatar = avatar ?? user.avatar;

  if (req.body.password) {
    user.password = req.body.password;
  }

  const updated = await user.save();
  res.status(200).json({
    success: true,
    data: { id: updated._id, name: updated.name, email: updated.email, role: updated.role },
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: 'Password updated successfully' });
});
