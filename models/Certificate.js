import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    certificateId: { type: String, required: true, unique: true },
    fileUrl: { type: String, default: '' },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

certificateSchema.index({ event: 1, student: 1 }, { unique: true });

export default mongoose.model('Certificate', certificateSchema);
