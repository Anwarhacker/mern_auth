require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const authRoutes  = require('./routes/auth');
const itemsRoutes = require('./routes/items');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',  authRoutes);
app.use('/api/items', itemsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Internal server error.',
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export for Vercel Serverless
module.exports = app;
