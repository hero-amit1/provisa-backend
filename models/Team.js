const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [
        true,
        'Team member name is required',
      ],
      trim: true,
    },

    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
    },

    image: {
      type: String,
      default: '',
    },

    bio: {
      type: String,
      trim: true,
      default: '',
    },

    social: {
      facebook: {
        type: String,
        trim: true,
        default: '',
      },

      instagram: {
        type: String,
        trim: true,
        default: '',
      },

      linkedin: {
        type: String,
        trim: true,
        default: '',
      },

      twitter: {
        type: String,
        trim: true,
        default: '',
      },
    },
  },
  {
    timestamps: true,
  }
);

// =========================
// CLEAN JSON RESPONSE
// =========================

teamSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model(
  'Team',
  teamSchema
);