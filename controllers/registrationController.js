import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Register for an event
// @route   POST /api/registrations
// @access  Private/Student
export const createRegistration = asyncHandler(async (req, res) => {
  const { eventId } = req.body;

  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  const existing = await Registration.findOne({ event: eventId, student: req.user._id });
  if (existing && existing.status === 'Registered') {
    res.status(400);
    throw new Error('You are already registered for this event');
  }

  const currentCount = await Registration.countDocuments({ event: eventId, status: 'Registered' });
  const status = event.capacity && currentCount >= event.capacity ? 'Waitlisted' : 'Registered';

  let registration;
  if (existing) {
    existing.status = status;
    registration = await existing.save();
  } else {
    registration = await Registration.create({ event: eventId, student: req.user._id, status });
  }

  await Notification.create({
    user: req.user._id,
    title: status === 'Registered' ? 'Registration Confirmed' : 'Added to Waitlist',
    message: `You have been ${status.toLowerCase()} for "${event.title}"`,
    type: status === 'Registered' ? 'success' : 'warning',
    relatedEvent: event._id,
  });

  res.status(201).json({ success: true, data: registration });
});

// @desc    Get registrations (own for student, all for admin/organizer)
// @route   GET /api/registrations
// @access  Private
export const getRegistrations = asyncHandler(async (req, res) => {
  const { eventId, page = 1, limit = 10 } = req.query;
  const query = {};

  if (req.user.role === 'student') {
    query.student = req.user._id;
  }
  if (eventId) query.event = eventId;

  const registrations = await Registration.find(query)
    .populate('event', 'title date status')
    .populate('student', 'name email')
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  const total = await Registration.countDocuments(query);

  res.status(200).json({
    success: true,
    count: registrations.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    data: registrations,
  });
});

// @desc    Cancel registration
// @route   DELETE /api/registrations/:id
// @access  Private
export const cancelRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id);
  if (!registration) {
    res.status(404);
    throw new Error('Registration not found');
  }

  if (req.user.role === 'student' && String(registration.student) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only cancel your own registration');
  }

  registration.status = 'Cancelled';
  await registration.save();

  res.status(200).json({ success: true, message: 'Registration cancelled successfully' });
});
