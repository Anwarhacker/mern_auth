const supabase = require('../config/supabase');

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

    const { data: newItem, error } = await supabase
      .from('items')
      .insert({
        user_id:     userId,
        title:       title.trim(),
        description: description?.trim() || null,
        status:      itemStatus,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ item: newItem, message: 'Item created successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─── Get All Items + Stats ────────────────────────────────────────────────────
const getItems = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data: items, error } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Compute stats in JS (avoids an extra DB round-trip)
    const stats = {
      total:     items.length,
      active:    items.filter((i) => i.status === 'active').length,
      pending:   items.filter((i) => i.status === 'pending').length,
      completed: items.filter((i) => i.status === 'completed').length,
    };

    res.json({ items, stats });
  } catch (err) {
    next(err);
  }
};

// ─── Get Single Item ──────────────────────────────────────────────────────────
const getItem = async (req, res, next) => {
  try {
    const { data: item, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) throw error;

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    res.json({ item });
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
    const { data: current, error: fetchErr } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!current) return res.status(404).json({ message: 'Item not found.' });

    const validStatuses = ['active', 'pending', 'completed'];

    const { data: updated, error: updateErr } = await supabase
      .from('items')
      .update({
        title:       title?.trim()       || current.title,
        description: description !== undefined ? description?.trim() || null : current.description,
        status:      validStatuses.includes(status) ? status : current.status,
        updated_at:  new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    res.json({ item: updated, message: 'Item updated successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─── Delete Item ──────────────────────────────────────────────────────────────
const deleteItem = async (req, res, next) => {
  try {
    const { data: existing } = await supabase
      .from('items')
      .select('id')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!existing) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ message: 'Item deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createItem, getItems, getItem, updateItem, deleteItem };
