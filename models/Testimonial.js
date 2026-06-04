const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [
        true,
        'Student name is required',
      ],
      trim: true,
    },

    university: {
      type: String,
      required: [
        true,
        'University name is required',
      ],
      trim: true,
    },

    text: {
      type: String,
      required: [
        true,
        'Testimonial text is required',
      ],
      trim: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },

    image: {
      type: String,
      default: '',
    },

    country: {
      type: String,
      trim: true,
      default: '',
    },

    course: {
      type: String,
      trim: true,
      default: '',
    },

    featured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// =========================
// CLEAN JSON RESPONSE
// =========================

testimonialSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model(
  'Testimonial',
  testimonialSchema
);