import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get notifications for logged in user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

  res.status(200).json({ success: true, count: notifications.length, unreadCount, data: notifications });
});

// @desc    Create notification (admin/organizer broadcast or system use)
// @route   POST /api/notifications
// @access  Private/Admin/Organizer
export const createNotification = asyncHandler(async (req, res) => {
  const { userId, title, message, type, relatedEvent } = req.body;

  const notification = await Notification.create({
    user: userId,
    title,
    message,
    type: type || 'info',
    relatedEvent,
  });

  res.status(201).json({ success: true, data: notification });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  if (String(notification.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to update this notification');
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({ success: true, data: notification });
});
