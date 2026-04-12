/**
 * Seed Script — run once to populate the database with sample data.
 * Usage: node seed.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db     = require('./config/db');

async function seed() {
  try {
    console.log('🌱 Seeding database...\n');

    // ── 1. Create test user ──────────────────────────────────────────────────
    const email    = 'test@example.com';
    const password = 'password123';
    const hash     = await bcrypt.hash(password, 12);

    const [existing] = await db.execute(
      'SELECT id FROM users WHERE email = ?', [email]
    );

    let userId;
    if (existing.length > 0) {
      userId = existing[0].id;
      console.log(`✅ Test user already exists  (ID: ${userId})`);
    } else {
      const [result] = await db.execute(
        'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)',
        ['Alex Johnson', email, '+1 555 123 4567', hash]
      );
      userId = result.insertId;
      console.log(`✅ Test user created          (ID: ${userId})`);
    }

    // ── 2. Insert sample items ───────────────────────────────────────────────
    const items = [
      {
        title:       'Setup project environment',
        description: 'Install Node.js, MySQL, and configure the .env file.',
        status:      'completed',
      },
      {
        title:       'Design database schema',
        description: 'Create users and items tables with proper indexes and foreign keys.',
        status:      'completed',
      },
      {
        title:       'Build authentication API',
        description: 'Implement register, login, and forgot/reset password endpoints with JWT.',
        status:      'completed',
      },
      {
        title:       'Create dashboard UI',
        description: 'Build stats cards, item list, search/filter, and CRUD operations.',
        status:      'active',
      },
      {
        title:       'Add email notifications',
        description: 'Configure Nodemailer with Mailtrap for password reset emails.',
        status:      'active',
      },
      {
        title:       'Write API tests',
        description: 'Test all API endpoints using Postman or Jest.',
        status:      'pending',
      },
      {
        title:       'Deploy to production',
        description: 'Deploy backend to Railway and Next.js frontend to Vercel.',
        status:      'pending',
      },
      {
        title:       'Add search and pagination',
        description: 'Implement server-side pagination and full-text search on items.',
        status:      'pending',
      },
    ];

    // Clear old seed items for this user so re-running is safe
    await db.execute('DELETE FROM items WHERE user_id = ?', [userId]);

    for (const item of items) {
      await db.execute(
        'INSERT INTO items (user_id, title, description, status) VALUES (?, ?, ?, ?)',
        [userId, item.title, item.description, item.status]
      );
    }

    console.log(`✅ ${items.length} sample items added\n`);

    // ── 3. Show summary ──────────────────────────────────────────────────────
    const [stats] = await db.execute(
      `SELECT
         COUNT(*)                  AS total,
         SUM(status='completed')   AS completed,
         SUM(status='active')      AS active,
         SUM(status='pending')     AS pending
       FROM items WHERE user_id = ?`,
      [userId]
    );
    const s = stats[0];
    console.log('📊 Stats:');
    console.log(`   Total: ${s.total}  |  ✅ Completed: ${s.completed}  |  ⚡ Active: ${s.active}  |  ⏳ Pending: ${s.pending}`);

    console.log('\n─────────────────────────────────────────');
    console.log('🔑 Test account credentials:');
    console.log(`   Email    : ${email}`);
    console.log(`   Password : ${password}`);
    console.log('─────────────────────────────────────────');
    console.log('🚀 Open http://localhost:3000/login to log in!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
