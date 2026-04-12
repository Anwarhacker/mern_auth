const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const supabase = require('../config/supabase');
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

    // Check if email already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ message: 'This email is already registered.' });
    }

    const hashed = await bcrypt.hash(password, 12);

    const { error } = await supabase.from('users').insert({
      name:     name.trim(),
      email:    email.toLowerCase().trim(),
      phone:    phone?.trim() || null,
      password: hashed,
    });

    if (error) throw error;

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

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

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

    const genericMsg = 'If that email exists in our system, a reset link has been sent.';

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (!user) return res.json({ message: genericMsg });

    const token  = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 60 * 60 * 1000; // 1 hour

    const { error } = await supabase
      .from('users')
      .update({ reset_token: token, reset_token_expiry: expiry })
      .eq('email', email.toLowerCase().trim());

    if (error) throw error;

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

    const { data: user } = await supabase
      .from('users')
      .select('id, reset_token_expiry')
      .eq('reset_token', token)
      .maybeSingle();

    if (!user || user.reset_token_expiry < Date.now()) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired.' });
    }

    const hashed = await bcrypt.hash(password, 12);

    const { error } = await supabase
      .from('users')
      .update({ password: hashed, reset_token: null, reset_token_expiry: null })
      .eq('id', user.id);

    if (error) throw error;

    res.json({ message: 'Password reset successfully! You can now log in.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };
