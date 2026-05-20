const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [
        true,
        'University name is required',
      ],
      trim: true,
    },

    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },

    city: {
      type: String,
      trim: true,
      default: '',
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    website: {
      type: String,
      trim: true,
      default: '',
    },

    image: {
      type: String,
      default: '',
    },

    ranking: {
      type: Number,
      default: 0,
    },

    tuitionFee: {
      type: String,
      trim: true,
      default: '',
    },

    intake: {
      type: String,
      trim: true,
      default: '',
    },

    programs: {
      type: [String],
      default: [],
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

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// =========================
// GENERATE SLUG
// =========================

universitySchema.pre(
  'validate',
  async function (next) {
    try {
      if (!this.slug && this.name) {
        let baseSlug = this.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');

        let slug = baseSlug;
        let counter = 1;

        while (
          await mongoose.models.University.findOne(
            {
              slug,
              _id: { $ne: this._id },
            }
          )
        ) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        this.slug = slug;
      }

      next();
    } catch (error) {
      next(error);
    }
  }
);

// =========================
// CLEAN JSON RESPONSE
// =========================

universitySchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model(
  'University',
  universitySchema
);