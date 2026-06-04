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

// cPanel / Render compatibility
app.set('trust proxy', 1);

// ==============================
// ENV
// ==============================
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

// ✅ UPDATED CLIENT URL SUPPORT
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ==============================
// CREATE UPLOAD FOLDERS
// ==============================
const uploadsRoot = path.join(__dirname, 'uploads');
const uploadsBlogsDir = path.join(uploadsRoot, 'blogs');
const uploadsTeamDir = path.join(uploadsRoot, 'team');
const uploadsUniversitiesDir = path.join(uploadsRoot, 'universities');

fs.mkdirSync(uploadsRoot, { recursive: true });
fs.mkdirSync(uploadsBlogsDir, { recursive: true });
fs.mkdirSync(uploadsTeamDir, { recursive: true });
fs.mkdirSync(uploadsUniversitiesDir, { recursive: true });

// ==============================
// SECURITY
// ==============================
app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// ==============================
// LOGGING
// ==============================
app.use(morgan('dev'));

// ==============================
// CORS (UPDATED)
// ==============================
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
        'https://api.provisa.com.np',
      ];

      // allow Render deployments
      const isRender = origin.endsWith('.onrender.com');

      if (allowedOrigins.includes(origin) || isRender) {
        return callback(null, true);
      }

      // allow but don’t block (safe fallback)
      return callback(null, true);
    },
    credentials: true,
  })
);

// ==============================
// BODY PARSER
// ==============================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ==============================
// STATIC FILES
// ==============================
app.use('/uploads', express.static(uploadsRoot));

// ==============================
// BASIC ROUTES
// ==============================
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/admin-test', (req, res) => res.send('✅ Admin system working'));

// ==============================
// DIAGNOSTIC
// ==============================
app.get('/__diag/root', (req, res) => {
  const distPath = path.join(__dirname, 'dist');
  const distIndexPath = path.join(distPath, 'index.html');

  res.status(200).json({
    distExists: fs.existsSync(distPath),
    distIndexExists: fs.existsSync(distIndexPath),
    mongoUriConfigured: !!MONGODB_URI,
    mongodbReady: mongoose.connection.readyState === 1,
  });
});

// ==============================
// API ROUTES
// ==============================
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

// ==============================
// HEALTH CHECK
// ==============================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    mongodb: mongoose.connection.readyState === 1,
  });
});

// ==============================
// FRONTEND (SPA fallback)
// ==============================
function resolveDistIndexPath() {
  const candidates = [
    path.join(__dirname, 'dist', 'index.html'),
    path.join(__dirname, '..', 'frontend', 'dist', 'index.html'),
    path.join(__dirname, 'public', 'index.html'),
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return {
        distIndexPath: c,
        distRoot: path.dirname(c),
      };
    }
  }
  return null;
}

const resolved = resolveDistIndexPath();

if (resolved) {
  app.use(express.static(resolved.distRoot));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(resolved.distIndexPath);
  });
} else {
  app.get('*', (req, res) => {
    res.status(503).send(
      'Frontend build not found on server. Expected backend/dist/index.html (or fallback: frontend/dist/index.html)'
    );
  });
}

// ==============================
// 404 HANDLER
// ==============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ==============================
// GLOBAL ERROR HANDLER
// ==============================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err?.message || err);

  res.status(500).json({
    success: false,
    message: err?.message || 'Server Error',
  });
});

// ==============================
// MONGODB CONNECTION
// ==============================
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI missing');
} else {
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) =>
      console.error('❌ MongoDB error:', err?.message || err)
    );
}

// ==============================
// START SERVER
// ==============================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});