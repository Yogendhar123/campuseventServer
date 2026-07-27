import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    date: { type: Date, required: true },
    time: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
    capacity: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Upcoming',
    },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bannerImage: { type: String, default: '' },
  },
  { timestamps: true }
);

eventSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Event', eventSchema);
