import mongoose from 'mongoose';

const venueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    location: { type: String, default: '' },
    capacity: { type: Number, required: true, min: 1 },
    facilities: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model('Venue', venueSchema);
