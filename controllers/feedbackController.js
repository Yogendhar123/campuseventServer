import Feedback from '../models/Feedback.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private/Student
export const createFeedback = asyncHandler(async (req, res) => {
  const { eventId, rating, comments } = req.body;

  const existing = await Feedback.findOne({ event: eventId, student: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error('You have already submitted feedback for this event');
  }

  const feedback = await Feedback.create({
    event: eventId,
    student: req.user._id,
    rating,
    comments,
  });

  res.status(201).json({ success: true, data: feedback });
});

// @desc    Get feedback
// @route   GET /api/feedback
// @access  Private
export const getFeedback = asyncHandler(async (req, res) => {
  const { eventId } = req.query;
  const query = {};
  if (eventId) query.event = eventId;
  if (req.user.role === 'student') query.student = req.user._id;

  const feedback = await Feedback.find(query)
    .populate('event', 'title')
    .populate('student', 'name email')
    .sort({ createdAt: -1 });

  const avgRating = feedback.length
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(2)
    : 0;

  res.status(200).json({ success: true, count: feedback.length, avgRating, data: feedback });
});
