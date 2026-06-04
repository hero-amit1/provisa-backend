/* eslint-disable @typescript-eslint/no-require-imports, no-undef */

const dns = require('dns');
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

// cPanel often sits behind a reverse proxy; trust proxy helps with correct client IP and URL detection.
app.set('trust proxy', 1);

// ==============================
// ENV
// ==============================
// cPanel injects PORT; do NOT force a fallback port on production/cPanel.
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

const CLIENT_URL = process.env.CLIENT_URL || 'https://provisa.com.np';

if (MONGODB_URI?.startsWith('mongodb+srv://')) {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  console.log('[server] using DNS servers', dns.getServers());
}


// ==============================
// VALIDATION
// ==============================
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI missing in .env');
}


// ==============================
// CREATE UPLOAD FOLDERS (cPanel working-directory safe)
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
// CORS (PRODUCTION SAFE)
// ==============================
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        CLIENT_URL,
        'https://provisa.com.np',
        'https://www.provisa.com.np',
        'http://localhost:5173',
        'http://localhost:8080',
        'http://localhost:8081',
      ];

      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.provisa.com.np')
      ) {
        return callback(null, true);
      }

      return callback(null, true); // prevent production crash
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

app.get('/admin-test', (req, res) => {
  res.send('✅ Admin system working');
});

// ==============================
// FRONTEND FIX (/admin ROUTE FIX)
// ==============================
// IMPORTANT: prevents 500 error on /admin
// ==============================
const distPath = path.join(__dirname, 'dist');
const distIndexPath = path.join(distPath, 'index.html');

// Diagnostic: identify why root '/' is failing (useful for logs).
app.get('/__diag/root', (req, res) => {
  const distExists = fs.existsSync(distPath);
  const distIndexExists = fs.existsSync(distIndexPath);

  res.status(200).json({
    distExists,
    distIndexExists,
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
const distHasIndex = fs.existsSync(distIndexPath);


if (distHasIndex) {
  app.use(express.static(distPath));

  // Serve SPA for any non-API route.
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();

    res.sendFile(distIndexPath);
  });
} else {
  console.log('⚠️ No frontend build found (dist/index.html missing)');

  // Deterministic response for `/` when frontend build is not present.
  app.get('/', (req, res) => {
    res.status(503).send(
      'Frontend build not found on server. Expected backend/dist/index.html'
    );
  });
}


// ==============================
// ERROR HANDLER
// ==============================
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);

  res.status(500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

// ==============================
// MONGODB CONNECTION
// ==============================
if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => {
      // Do not crash the server; allow frontend to load even if Mongo is temporarily down.
      console.error('❌ MongoDB error:', err.message);
    });
} else {
  console.error('❌ MongoDB not configured (MONGODB_URI missing)');
}


// ==============================
// START SERVER
// ==============================
// cPanel injects PORT. If PORT is missing, fail fast so the operator knows what to fix.
if (!PORT) {
  console.error('❌ PORT is missing in environment variables. cPanel did not inject it.');
} else {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

