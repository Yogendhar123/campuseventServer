import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { v4 as uuidv4 } from 'uuid';
import Certificate from '../models/Certificate.js';
import Attendance from '../models/Attendance.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

const uploadsDir = path.resolve('uploads', 'certificates');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// @desc    Generate certificate for a student who attended an event
// @route   POST /api/certificates/generate
// @access  Private/Admin/Organizer
export const generateCertificate = asyncHandler(async (req, res) => {
  const { eventId, studentId } = req.body;

  const attendance = await Attendance.findOne({ event: eventId, student: studentId, status: 'Present' });
  if (!attendance) {
    res.status(400);
    throw new Error('Student must have attended the event to receive a certificate');
  }

  const existing = await Certificate.findOne({ event: eventId, student: studentId });
  if (existing) {
    return res.status(200).json({ success: true, data: existing, message: 'Certificate already issued' });
  }

  const event = await Event.findById(eventId);
  const student = await User.findById(studentId);
  const certificateId = `CERT-${uuidv4().slice(0, 8).toUpperCase()}`;
  const fileName = `${certificateId}.pdf`;
  const filePath = path.join(uploadsDir, fileName);

  const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
  doc.pipe(fs.createWriteStream(filePath));

  doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
  doc.fontSize(28).text('Certificate of Participation', 0, 100, { align: 'center' });
  doc.fontSize(16).moveDown(1).text('This certifies that', { align: 'center' });
  doc.fontSize(24).moveDown(0.5).text(student.name, { align: 'center' });
  doc.fontSize(16).moveDown(0.5).text(`has successfully participated in "${event.title}"`, { align: 'center' });
  doc.fontSize(12).moveDown(1).text(`Date: ${new Date(event.date).toDateString()}`, { align: 'center' });
  doc.fontSize(10).moveDown(2).text(`Certificate ID: ${certificateId}`, { align: 'center' });
  doc.end();

  const certificate = await Certificate.create({
    event: eventId,
    student: studentId,
    certificateId,
    fileUrl: `/uploads/certificates/${fileName}`,
  });

  res.status(201).json({ success: true, data: certificate });
});

// @desc    Get certificates
// @route   GET /api/certificates
// @access  Private
export const getCertificates = asyncHandler(async (req, res) => {
  const query = {};
  if (req.user.role === 'student') query.student = req.user._id;

  const certificates = await Certificate.find(query)
    .populate('event', 'title date')
    .populate('student', 'name email')
    .sort({ issuedAt: -1 });

  res.status(200).json({ success: true, count: certificates.length, data: certificates });
});

// @desc    Get single certificate
// @route   GET /api/certificates/:id
// @access  Private
export const getCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id)
    .populate('event', 'title date')
    .populate('student', 'name email');

  if (!certificate) {
    res.status(404);
    throw new Error('Certificate not found');
  }

  if (req.user.role === 'student' && String(certificate.student._id) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to view this certificate');
  }

  res.status(200).json({ success: true, data: certificate });
});
