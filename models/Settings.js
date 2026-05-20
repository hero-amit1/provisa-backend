const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      trim: true,
      default: '',
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },

    phone: {
      type: String,
      trim: true,
      default: '',
    },

    address: {
      type: String,
      trim: true,
      default: '',
    },

    logo: {
      type: String,
      default: '',
    },

    facebook: {
      type: String,
      default: '',
    },

    instagram: {
      type: String,
      default: '',
    },

    linkedin: {
      type: String,
      default: '',
    },

    whatsapp: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// =========================
// SINGLETON SETTINGS
// =========================

settingsSchema.statics.getSingleton =
  async function getSingleton() {
    let doc = await this.findOne({});

    if (!doc) {
      doc = await this.create({});
    }

    return doc;
  };

// =========================
// CLEAN JSON
// =========================

settingsSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model(
  'Settings',
  settingsSchema
);