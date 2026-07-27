import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get all events (search, filter, paginate)
// @route   GET /api/events
// @access  Public
export const getEvents = asyncHandler(async (req, res) => {
  const { search, category, venue, status, page = 1, limit = 9, sort = '-date' } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (category) query.category = category;
  if (venue) query.venue = venue;
  if (status) query.status = status;

  const events = await Event.find(query)
    .populate('category', 'name')
    .populate('venue', 'name capacity')
    .populate('organizer', 'name email')
    .sort(sort)
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  const total = await Event.countDocuments(query);

  res.status(200).json({
    success: true,
    count: events.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    data: events,
  });
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
export const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('category', 'name')
    .populate('venue', 'name capacity location')
    .populate('organizer', 'name email');

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  const registrationCount = await Registration.countDocuments({
    event: event._id,
    status: 'Registered',
  });

  res.status(200).json({ success: true, data: { ...event.toObject(), registrationCount } });
});

// @desc    Create event
// @route   POST /api/events
// @access  Private/Admin/Organizer
export const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create({ ...req.body, organizer: req.user._id });
  res.status(201).json({ success: true, data: event });
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin/Organizer
export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  if (req.user.role === 'organizer' && String(event.organizer) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only edit events you created');
  }

  Object.assign(event, req.body);
  const updated = await event.save();
  res.status(200).json({ success: true, data: updated });
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin/Organizer
export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  if (req.user.role === 'organizer' && String(event.organizer) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only delete events you created');
  }

  await event.deleteOne();
  res.status(200).json({ success: true, message: 'Event deleted successfully' });
});
