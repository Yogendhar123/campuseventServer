import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, enum: ['admin', 'organizer', 'student'] },
    permissions: [{ type: String }],
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Role', roleSchema);
