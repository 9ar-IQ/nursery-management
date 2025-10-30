import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  nurseryName: {
    type: String,
    default: 'My Nursery'
  },
  currency: {
    type: String,
    default: 'KWD'
  },
  timezone: {
    type: String,
    default: 'Asia/Kuwait'
  },
  categories: {
    income: [{ type: String }],
    expense: [{ type: String }]
  },
  paymentMethods: [{ type: String }],
  classes: [{ type: String }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
