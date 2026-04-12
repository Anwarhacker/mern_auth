'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';

/* ─── ICON COMPONENTS ─────────────────────────────────────────────────────── */
const Icon = ({ d, className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const icons = {
  total:     <><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></>,
  active:    <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
  pending:   <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  completed: <><polyline points="20 6 9 17 4 12"/></>,
  plus:      <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  search:    <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  edit:      <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  trash:     <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></>,
  x:         <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  check:     <><polyline points="20 6 9 17 4 12"/></>,
  empty:     <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>,
};

/* ─── STAT CARD ───────────────────────────────────────────────────────────── */
function StatCard({ label, value, iconKey, accent }) {
  const palettes = {
    indigo:  { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', bar: 'bg-indigo-500', icon: 'text-indigo-400' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', bar: 'bg-emerald-500', icon: 'text-emerald-400' },
    amber:   { bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  bar: 'bg-amber-500',  icon: 'text-amber-400'  },
    blue:    { bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   bar: 'bg-blue-500',   icon: 'text-blue-400'   },
  };
  const p = palettes[accent] || palettes.indigo;
  return (
    <div className={`bg-slate-900 border ${p.border} rounded-2xl p-5 relative overflow-hidden card-hover`}>
      <div className={`absolute left-0 top-0 w-1 h-full ${p.bar} rounded-l-2xl`} />
      <div className="pl-1">
        <div className={`w-10 h-10 ${p.bg} border ${p.border} rounded-xl flex items-center justify-center mb-4`}>
          <svg className={`w-5 h-5 ${p.icon}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {icons[iconKey]}
          </svg>
        </div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
        <p className="text-3xl font-bold text-slate-100">{Number(value) || 0}</p>
      </div>
    </div>
  );
}

/* ─── STATUS BADGE ────────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const cfg = {
    active:    'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    pending:   'bg-amber-500/15  text-amber-400  border-amber-500/30',
    completed: 'bg-blue-500/15   text-blue-400   border-blue-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg[status] || cfg.pending} capitalize`}>
      {status}
    </span>
  );
}

/* ─── ITEM CARD ───────────────────────────────────────────────────────────── */
function ItemCard({ item, onEdit, onDelete, onStatusChange }) {
  const [deleting, setDeleting] = useState(false);
  const borderClass = {
    active: 'status-active', pending: 'status-pending', completed: 'status-completed',
  }[item.status] || 'status-pending';

  const handleDelete = async () => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    setDeleting(true);
    await onDelete(item.id);
    setDeleting(false);
  };

  const date = new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-5 ${borderClass} card-hover flex flex-col gap-3`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-100 leading-snug mb-1 truncate">{item.title}</h3>
          {item.description && (
            <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{item.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <StatusBadge status={item.status} />
          <span className="text-slate-600 text-xs">{date}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Quick status cycle */}
          <select
            value={item.status}
            onChange={(e) => onStatusChange(item.id, e.target.value)}
            className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <button
            onClick={() => onEdit(item)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-indigo-500/20 hover:text-indigo-400 text-slate-400 flex items-center justify-center transition-all duration-150"
            title="Edit"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icons.edit}</svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 flex items-center justify-center transition-all duration-150 disabled:opacity-40"
            title="Delete"
          >
            {deleting
              ? <div className="w-4 h-4 border-2 border-slate-600 border-t-red-400 rounded-full animate-spin" />
              : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icons.trash}</svg>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── EDIT MODAL ──────────────────────────────────────────────────────────── */
function EditModal({ item, onSave, onClose }) {
  const [form, setForm]       = useState({ title: item.title, description: item.description || '', status: item.status });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setLoading(true);
    await onSave(item.id, form);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl slide-down">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-100">Edit Item</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icons.x}</svg>
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Title <span className="text-red-400">*</span></label>
            <input type="text" value={form.title} onChange={(e) => { setForm({ ...form, title: e.target.value }); setError(''); }} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input-field resize-none" placeholder="Optional description..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field cursor-pointer">
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── MAIN DASHBOARD PAGE ─────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user }          = useAuth();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, completed: 0 });
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ title: '', description: '', status: 'pending' });
  const [addLoading, setAddLoading]   = useState(false);
  const [addError, setAddError]       = useState('');
  const [addSuccess, setAddSuccess]   = useState('');
  const [editItem, setEditItem]       = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  /* ── Fetch ── */
  const fetchItems = async () => {
    try {
      setFetchError('');
      const res = await api.get('/items');
      setItems(res.data.items);
      setStats(res.data.stats);
    } catch (err) {
      setFetchError(err.response?.data?.message || 'Failed to load items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  /* ── Filtered items ── */
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [items, searchQuery, filterStatus]);

  /* ── Add Item ── */
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.title.trim()) { setAddError('Title is required.'); return; }
    setAddLoading(true); setAddError(''); setAddSuccess('');
    try {
      const res = await api.post('/items', addForm);
      setItems([res.data.item, ...items]);
      setStats((s) => ({ ...s, total: Number(s.total) + 1, [addForm.status]: Number(s[addForm.status]) + 1 }));
      setAddForm({ title: '', description: '', status: 'pending' });
      setAddSuccess('Item added successfully!');
      setTimeout(() => setAddSuccess(''), 3000);
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to create item.');
    } finally {
      setAddLoading(false);
    }
  };

  /* ── Update Item ── */
  const handleUpdate = async (id, data) => {
    try {
      const res = await api.put(`/items/${id}`, data);
      setItems(items.map((i) => (i.id === id ? res.data.item : i)));
      await fetchItems(); // re-fetch stats
      setEditItem(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed.');
    }
  };

  /* ── Delete Item ── */
  const handleDelete = async (id) => {
    try {
      await api.delete(`/items/${id}`);
      setItems(items.filter((i) => i.id !== id));
      await fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  /* ── Status change ── */
  const handleStatusChange = async (id, status) => {
    try {
      const res = await api.put(`/items/${id}`, { status });
      setItems(items.map((i) => (i.id === id ? res.data.item : i)));
      await fetchItems();
    } catch (err) { /* silent */ }
  };

  /* ── Render ── */
  return (
    <div className="pb-12">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          <span className="text-indigo-400">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-slate-400 mt-1">Here&apos;s an overview of your items and activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Items"  value={stats.total}     iconKey="total"     accent="indigo"  />
        <StatCard label="Active"       value={stats.active}    iconKey="active"    accent="emerald" />
        <StatCard label="Pending"      value={stats.pending}   iconKey="pending"   accent="amber"   />
        <StatCard label="Completed"    value={stats.completed} iconKey="completed" accent="blue"    />
      </div>

      {/* Add Item Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl mb-8 overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <div>
            <h2 className="font-semibold text-slate-100">My Items</h2>
            <p className="text-xs text-slate-500 mt-0.5">{items.length} total item{items.length !== 1 && 's'}</p>
          </div>
          <button
            onClick={() => { setShowAddForm(!showAddForm); setAddError(''); setAddSuccess(''); }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {showAddForm ? icons.x : icons.plus}
            </svg>
            {showAddForm ? 'Cancel' : 'Add Item'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddSubmit} className="border-t border-slate-800 p-5 slide-down">
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Title <span className="text-red-400">*</span></label>
                <input
                  type="text" value={addForm.title}
                  onChange={(e) => { setAddForm({ ...addForm, title: e.target.value }); setAddError(''); }}
                  placeholder="Enter item title..." className="input-field"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description <span className="text-slate-500 font-normal text-xs">(optional)</span></label>
                <textarea
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  placeholder="Add a description..." rows={2} className="input-field resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
                <select value={addForm.status} onChange={(e) => setAddForm({ ...addForm, status: e.target.value })} className="input-field cursor-pointer">
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex items-end">
                <button type="submit" disabled={addLoading} className="btn-primary">
                  {addLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Adding...</> : 'Add Item'}
                </button>
              </div>
            </div>

            {addError   && <p className="text-red-400 text-sm mt-2">{addError}</p>}
            {addSuccess && <p className="text-emerald-400 text-sm mt-2">{addSuccess}</p>}
          </form>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icons.search}</svg>
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..." className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'pending', 'completed'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                filterStatus === s
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading your items...</p>
          </div>
        </div>
      ) : fetchError ? (
        <div className="text-center py-16">
          <p className="text-red-400 mb-4">{fetchError}</p>
          <button onClick={fetchItems} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-500 transition-colors">Retry</button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-800 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icons.empty}</svg>
          </div>
          <p className="text-slate-300 font-semibold mb-1">
            {searchQuery || filterStatus !== 'all' ? 'No matching items' : 'No items yet'}
          </p>
          <p className="text-slate-500 text-sm mb-6">
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your search or filter.'
              : 'Create your first item using the button above.'}
          </p>
          {!showAddForm && !(searchQuery || filterStatus !== 'all') && (
            <button onClick={() => setShowAddForm(true)} className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-500/20">
              Add your first item
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onEdit={setEditItem}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {filteredItems.length > 0 && (
        <p className="text-slate-600 text-xs text-center mt-6">
          Showing {filteredItems.length} of {items.length} item{items.length !== 1 && 's'}
        </p>
      )}

      {/* Edit Modal */}
      {editItem && (
        <EditModal
          item={editItem}
          onSave={handleUpdate}
          onClose={() => setEditItem(null)}
        />
      )}
    </div>
  );
}
