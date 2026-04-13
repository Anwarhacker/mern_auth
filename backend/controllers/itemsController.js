const db = require('../config/db');

// ─── Create Item ──────────────────────────────────────────────────────────────
const createItem = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;
    const userId = req.user.id;

    if (!title?.trim()) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const validStatuses = ['active', 'pending', 'completed'];
    const itemStatus = validStatuses.includes(status) ? status : 'pending';

    const [result] = await db.execute(
      'INSERT INTO items (user_id, title, description, status) VALUES (?, ?, ?, ?)',
      [userId, title.trim(), description?.trim() || null, itemStatus]
    );

    const [newItem] = await db.execute('SELECT * FROM items WHERE id = ?', [result.insertId]);
    res.status(201).json({ item: newItem[0], message: 'Item created successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─── Get All Items + Stats ────────────────────────────────────────────────────
const getItems = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [items] = await db.execute(
      'SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    const [statsRows] = await db.execute(
      `SELECT
         COUNT(*)                       AS total,
         SUM(status = 'active')         AS active,
         SUM(status = 'pending')        AS pending,
         SUM(status = 'completed')      AS completed
       FROM items
       WHERE user_id = ?`,
      [userId]
    );

    res.json({ items, stats: statsRows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── Get Single Item ──────────────────────────────────────────────────────────
const getItem = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    res.json({ item: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── Update Item ──────────────────────────────────────────────────────────────
const updateItem = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;
    const { id } = req.params;
    const userId = req.user.id;

    // Fetch current item (ensures ownership)
    const [existing] = await db.execute(
      'SELECT * FROM items WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    const current = existing[0];
    const validStatuses = ['active', 'pending', 'completed'];

    const newTitle       = title?.trim()       || current.title;
    const newDescription = description !== undefined ? description?.trim() || null : current.description;
    const newStatus      = validStatuses.includes(status) ? status : current.status;

    await db.execute(
      'UPDATE items SET title = ?, description = ?, status = ? WHERE id = ? AND user_id = ?',
      [newTitle, newDescription, newStatus, id, userId]
    );

    const [updated] = await db.execute('SELECT * FROM items WHERE id = ?', [id]);
    res.json({ item: updated[0], message: 'Item updated successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─── Delete Item ──────────────────────────────────────────────────────────────
const deleteItem = async (req, res, next) => {
  try {
    const [existing] = await db.execute(
      'SELECT id FROM items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    await db.execute(
      'DELETE FROM items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    res.json({ message: 'Item deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createItem, getItems, getItem, updateItem, deleteItem };
