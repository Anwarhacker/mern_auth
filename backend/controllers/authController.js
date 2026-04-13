const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const db       = require('../config/db');
const { sendPasswordResetEmail } = require('../utils/mailer');

// ─── Register ────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const [existing] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'This email is already registered.' });
    }

    const hashed = await bcrypt.hash(password, 12);

    const [result] = await db.execute(
      'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), phone?.trim() || null, hashed]
    );

    const userId = result.insertId;

    // ─── Insert Demo Items ───────────────────────────────────────────────────
    const demoItems = [
      {
        title: 'Welcome to your Dashboard! 👋',
        description: 'This is a sample item. You can edit, delete, or mark it as complete using the actions menu.',
        status: 'active'
      },
      {
        title: 'Explore features',
        description: 'Try testing out the live search, filtering by status, or adding a new item of your own.',
        status: 'pending'
      },
      {
        title: 'Account setup completed',
        description: 'You successfully registered and logged into the application.',
        status: 'completed'
      }
    ];

    for (const item of demoItems) {
      await db.execute(
        'INSERT INTO items (user_id, title, description, status) VALUES (?, ?, ?, ?)',
        [userId, item.title, item.description, item.status]
      );
    }

    res.status(201).json({ message: 'Registration successful! Please log in.' });
  } catch (err) {
    next(err);
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user  = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Current User ────────────────────────────────────────────────────────
const getMe = (req, res) => {
  res.json({ user: req.user });
};

// ─── Forgot Password ─────────────────────────────────────────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const [rows] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    // Always return the same message to prevent email enumeration
    const genericMsg = 'If that email exists in our system, a reset link has been sent.';

    if (rows.length === 0) {
      return res.json({ message: genericMsg });
    }

    const token  = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 60 * 60 * 1000; // 1 hour

    await db.execute(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
      [token, expiry, email.toLowerCase().trim()]
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    try {
      await sendPasswordResetEmail(email, resetUrl);
    } catch (emailErr) {
      console.error('⚠️  Email send failed (continuing):', emailErr.message);
    }

    res.json({ message: genericMsg });
  } catch (err) {
    next(err);
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────
const resetPassword = async (req, res, next) => {
  try {
    const { token }    = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'New password is required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const [rows] = await db.execute(
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > ?',
      [token, Date.now()]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired.' });
    }

    const hashed = await bcrypt.hash(password, 12);

    await db.execute(
      `UPDATE users
         SET password = ?, reset_token = NULL, reset_token_expiry = NULL
       WHERE id = ?`,
      [hashed, rows[0].id]
    );

    res.json({ message: 'Password reset successfully! You can now log in.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };
