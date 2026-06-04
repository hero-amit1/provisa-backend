const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'admin',
        enum: ['admin', 'editor', 'user'],
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

module.exports = mongoose.model('Admin', adminSchema);
