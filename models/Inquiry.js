/* eslint-disable */
const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  date: { type: String },
  time: { type: String },
  country: { type: String },
  message: { type: String, required: true },
  type: { type: String, enum: ['contact', 'appointment'], default: 'contact' },
  status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },

  // EmailJS debug info (only populated for appointments when email sending fails)
  emailDebug: {
    type: { type: String, default: undefined },
    success: { type: Boolean, default: undefined },
    at: { type: Date, default: undefined },
    payload: { type: Object, default: undefined },
    result: { type: Object, default: undefined },
    error: { type: Object, default: undefined },
  },
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);

