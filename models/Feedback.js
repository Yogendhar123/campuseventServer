import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comments: { type: String, default: '' },
  },
  { timestamps: true }
);

feedbackSchema.index({ event: 1, student: 1 }, { unique: true });

export default mongoose.model('Feedback', feedbackSchema);
