import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  guardian: {
    type: String,
    required: true,
    trim: true
  },
  mobile: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  allergies: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated'],
    default: 'active'
  },
  dateOfBirth: {
    type: Date
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
