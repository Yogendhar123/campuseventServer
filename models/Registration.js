import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Registered', 'Cancelled', 'Waitlisted'], default: 'Registered' },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

registrationSchema.index({ event: 1, student: 1 }, { unique: true });

export default mongoose.model('Registration', registrationSchema);
