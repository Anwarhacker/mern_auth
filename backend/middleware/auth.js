const jwt      = require('jsonwebtoken');
const supabase = require('../config/supabase');

/**
 * Middleware: verifies JWT token from Authorization header.
 * Attaches the authenticated user object to req.user.
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided. Access denied.' });
    }

    const token   = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, phone')
      .eq('id', decoded.id)
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = { verifyToken };
