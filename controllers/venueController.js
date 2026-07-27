import Venue from '../models/Venue.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getVenues = asyncHandler(async (req, res) => {
  const venues = await Venue.find().sort({ name: 1 });
  res.status(200).json({ success: true, count: venues.length, data: venues });
});

export const createVenue = asyncHandler(async (req, res) => {
  const venue = await Venue.create(req.body);
  res.status(201).json({ success: true, data: venue });
});

export const updateVenue = asyncHandler(async (req, res) => {
  const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!venue) {
    res.status(404);
    throw new Error('Venue not found');
  }
  res.status(200).json({ success: true, data: venue });
});

export const deleteVenue = asyncHandler(async (req, res) => {
  const venue = await Venue.findById(req.params.id);
  if (!venue) {
    res.status(404);
    throw new Error('Venue not found');
  }
  await venue.deleteOne();
  res.status(200).json({ success: true, message: 'Venue deleted successfully' });
});
