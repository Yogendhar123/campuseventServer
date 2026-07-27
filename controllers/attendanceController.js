import Attendance from '../models/Attendance.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private/Admin/Organizer
export const markAttendance = asyncHandler(async (req, res) => {
  const { eventId, studentId, status } = req.body;

  const attendance = await Attendance.findOneAndUpdate(
    { event: eventId, student: studentId },
    { status: status || 'Present', markedBy: req.user._id, markedAt: new Date() },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(201).json({ success: true, data: attendance });
});

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private
export const getAttendance = asyncHandler(async (req, res) => {
  const { eventId, studentId, page = 1, limit = 20 } = req.query;
  const query = {};

  if (eventId) query.event = eventId;
  if (req.user.role === 'student') {
    query.student = req.user._id;
  } else if (studentId) {
    query.student = studentId;
  }

  const records = await Attendance.find(query)
    .populate('event', 'title date')
    .populate('student', 'name email')
    .sort({ markedAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  const total = await Attendance.countDocuments(query);

  res.status(200).json({
    success: true,
    count: records.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    data: records,
  });
});

// @desc    Update attendance
// @route   PUT /api/attendance/:id
// @access  Private/Admin/Organizer
export const updateAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id);
  if (!attendance) {
    res.status(404);
    throw new Error('Attendance record not found');
  }

  attendance.status = req.body.status || attendance.status;
  attendance.markedBy = req.user._id;
  attendance.markedAt = new Date();
  const updated = await attendance.save();

  res.status(200).json({ success: true, data: updated });
});
