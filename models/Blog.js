const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    excerpt: {
      type: String,
      trim: true,
      default: '',
    },

    content: {
      type: String,
      required: [true, 'Blog content is required'],
    },

    category: {
      type: String,
      trim: true,
      default: 'General',
    },

    image: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

// =========================
// GENERATE SLUG
// =========================

blogSchema.pre('validate', async function (next) {
  try {
    // Generate slug if missing
    if (!this.slug && this.title) {
      let baseSlug = this.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      let slug = baseSlug;
      let counter = 1;

      // Ensure unique slug
      while (
        await mongoose.models.Blog.findOne({
          slug,
          _id: { $ne: this._id },
        })
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
});

// =========================
// CLEAN JSON RESPONSE
// =========================

blogSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model(
  'Blog',
  blogSchema
);