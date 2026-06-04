/* eslint-disable no-unused-vars */
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

const app = express();

app.set('trust proxy', 1);

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const uploadsRoot = path.join(__dirname, 'uploads');
const uploadsBlogsDir = path.join(uploadsRoot, 'blogs');
const uploadsTeamDir = path.join(uploadsRoot, 'team');
const uploadsUniversitiesDir = path.join(uploadsRoot, 'universities');

fs.mkdirSync(uploadsRoot, { recursive: true });
fs.mkdirSync(uploadsBlogsDir, { recursive: true });
fs.mkdirSync(uploadsTeamDir, { recursive: true });
fs.mkdirSync(uploadsUniversitiesDir, { recursive: true });

app.use(helmet());
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
    })
);

app.use(morgan('dev'));

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);

            const allowedOrigins = [
                CLIENT_URL,
                'https://provisa.com.np',
                'https://www.provisa.com.np',
                'http://localhost:5173',
                'http://localhost:8080',
                'http://localhost:8081',
                'http://localhost:4000',
            ];

            const isRender = origin.endsWith('.onrender.com');

            if (allowedOrigins.includes(origin) || isRender) {
                return callback(null, true);
            }

            return callback(null, true);
        },
        credentials: true,
    })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(uploadsRoot));

app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/admin-test', (req, res) => res.send('✅ Admin system working'));

app.get('/__diag/root', (req, res) => {
    const backendDist = path.join(__dirname, 'dist');
    const backendDistIndex = path.join(backendDist, 'index.html');

    const maybeRoot = path.join(__dirname, '..');
    const rootDist = path.join(maybeRoot, 'backend', 'dist');

    res.status(200).json({
        backendDistExists: fs.existsSync(backendDist),
        backendDistIndexExists: fs.existsSync(backendDistIndex),
        rootDistExists: fs.existsSync(rootDist),
        rootDistIndexExists: fs.existsSync(path.join(rootDist, 'index.html')),
        mongoUriConfigured: !!MONGODB_URI,
        mongodbReady: mongoose.connection.readyState === 1,
    });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin/blogs', require('./routes/admin/blogs'));
app.use('/api/admin/team', require('./routes/admin/team'));
app.use('/api/admin/testimonials', require('./routes/admin/testimonials'));
app.use('/api/admin/universities', require('./routes/admin/universities'));
app.use('/api/admin/services', require('./routes/admin/services'));
app.use('/api/admin/settings', require('./routes/admin/settings'));
app.use('/api/inquiries', require('./routes/inquiries'));
app.use('/settings', require('./routes/settings'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/services', require('./routes/services'));
app.use('/api/team', require('./routes/team'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/universities', require('./routes/universities'));

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        mongodb: mongoose.connection.readyState === 1,
    });
});

// ==============================
// FRONTEND (dist) - robust SPA fallback
// ==============================
function getCandidateDistIndexPaths() {
    const backendDist = path.join(__dirname, 'dist', 'index.html');
    const projectFrontendDist = path.join(__dirname, '..', 'frontend', 'dist', 'index.html');
    const backendDistZipExtracted = path.join(__dirname, 'dist', 'index.html');

    return Array.from(new Set([backendDist, projectFrontendDist, backendDistZipExtracted]));
}

const candidateDistIndexes = getCandidateDistIndexPaths();
let distIndexPath = null;
let distRoot = null;

for (const candidate of candidateDistIndexes) {
    if (fs.existsSync(candidate)) {
        distIndexPath = candidate;
        distRoot = path.dirname(candidate);
        break;
    }
}

if (distIndexPath && distRoot) {
    app.use(express.static(distRoot));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        res.sendFile(distIndexPath);
    });
} else {
    app.get('/', (req, res) => {
        const backendDistIndex = path.join(__dirname, 'dist', 'index.html');
        const frontendDistIndex = path.join(__dirname, '..', 'frontend', 'dist', 'index.html');

        res.status(503).send(
            'Frontend build not found on server. Expected: ' +
            backendDistIndex +
            ' (and fallback: ' +
            frontendDistIndex +
            ')'
        );
    });
}

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

app.use((err, req, res, next) => {
    console.error('❌ Error:', err?.message || err);
    res.status(500).json({
        success: false,
        message: err?.message || 'Server Error',
    });
});

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI missing. API requests requiring DB will fail.');
} else {
    mongoose
        .connect(MONGODB_URI)
        .then(() => console.log('✅ MongoDB connected'))
        .catch((err) => {
            console.error('❌ MongoDB error:', err?.message || err);
        });
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

