import Event from '../models/Event.js';
import Category from '../models/Category.js';
import Venue from '../models/Venue.js';
import Registration from '../models/Registration.js';
import Attendance from '../models/Attendance.js';
import Certificate from '../models/Certificate.js';
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Dashboard summary statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getStats = asyncHandler(async (req, res) => {
  const [totalEvents, totalCategories, totalVenues, upcomingEvents] = await Promise.all([
    Event.countDocuments(),
    Category.countDocuments(),
    Venue.countDocuments(),
    Event.countDocuments({ status: 'Upcoming' }),
  ]);

  const base = { totalEvents, totalCategories, totalVenues, upcomingEvents };

  if (req.user.role === 'student') {
    const [myRegistrations, myAttendance, myCertificates] = await Promise.all([
      Registration.countDocuments({ student: req.user._id, status: 'Registered' }),
      Attendance.countDocuments({ student: req.user._id, status: 'Present' }),
      Certificate.countDocuments({ student: req.user._id }),
    ]);
    return res.status(200).json({
      success: true,
      data: { ...base, myRegistrations, myAttendance, myCertificates },
    });
  }

  const [totalUsers, totalRegistrations, totalAttendance, totalCertificates, totalFeedback] =
    await Promise.all([
      User.countDocuments(),
      Registration.countDocuments({ status: 'Registered' }),
      Attendance.countDocuments({ status: 'Present' }),
      Certificate.countDocuments(),
      Feedback.countDocuments(),
    ]);

  res.status(200).json({
    success: true,
    data: {
      ...base,
      totalUsers,
      totalRegistrations,
      totalAttendance,
      totalCertificates,
      totalFeedback,
    },
  });
});

// @desc    Reports - registrations/attendance per event, feedback averages
// @route   GET /api/dashboard/reports
// @access  Private/Admin/Organizer
export const getReports = asyncHandler(async (req, res) => {
  const events = await Event.find().populate('category', 'name').populate('venue', 'name');

  const report = await Promise.all(
    events.map(async (event) => {
      const [registrations, attended, feedbacks] = await Promise.all([
        Registration.countDocuments({ event: event._id, status: 'Registered' }),
        Attendance.countDocuments({ event: event._id, status: 'Present' }),
        Feedback.find({ event: event._id }),
      ]);

      const avgRating = feedbacks.length
        ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(2)
        : null;

      return {
        eventId: event._id,
        title: event.title,
        date: event.date,
        category: event.category?.name,
        venue: event.venue?.name,
        status: event.status,
        registrations,
        attended,
        attendanceRate: registrations ? `${((attended / registrations) * 100).toFixed(1)}%` : '0%',
        avgRating,
        feedbackCount: feedbacks.length,
      };
    })
  );

  res.status(200).json({ success: true, count: report.length, data: report });
});
