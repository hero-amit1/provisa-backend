require('dotenv').config();
const dns = require('dns');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'provisa@admin.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'password';

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is required to seed an admin account.');
    process.exit(1);
}

const run = async () => {
    if (MONGODB_URI?.startsWith('mongodb+srv://')) {
        dns.setServers(['8.8.8.8', '8.8.4.4']);
        console.log('[seedAdmin] using DNS servers', dns.getServers());
    }

    await mongoose.connect(MONGODB_URI);

    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const admin = await Admin.findOneAndUpdate(
        { email: ADMIN_EMAIL.toLowerCase().trim() },
        { email: ADMIN_EMAIL.toLowerCase().trim(), password: hash, role: 'admin' },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('✅ Admin seeded:');
    console.log(`  email: ${admin.email}`);
    console.log(`  password: ${ADMIN_PASSWORD}`);
    console.log('Use this account to log in, then change the password immediately.');
    process.exit(0);
};

run().catch((err) => {
    console.error('❌ Failed to seed admin:', err);
    process.exit(1);
});
