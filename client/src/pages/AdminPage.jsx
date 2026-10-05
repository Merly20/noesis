import React, { useEffect, useState } from 'react';
import api from '../api/client.js';
import { toast } from '../components/layout/Toast.jsx';

export default function AdminPage() {
  const [tab, setTab]         = useState('users');
  const [users, setUsers]     = useState([]);
  const [levels, setLevels]   = useState([]);
  const [topics, setTopics]   = useState([]);
  const [tasks, setTasks]     = useState([]);
  const [settings, setSettings] = useState({ tutorEnabled: true });
  const [loading, setLoading] = useState(false);

  const load = async (t = tab) => {
    setLoading(true);
    try {
      if (t === 'users')    { const r = await api.get('/admin/users');       setUsers(r.data); }
      if (t === 'levels')   { const r = await api.get('/admin/levels');      setLevels(r.data); }
      if (t === 'topics')   { const r = await api.get('/admin/topics');      setTopics(r.data); }
      if (t === 'exam')     { const r = await api.get('/admin/exam-tasks');  setTasks(r.data); }
      if (t === 'settings') {
        const r = await api.get('/admin/settings');
        const te = r.data.find(s => s.key === 'tutorEnabled');
        setSettings({ tutorEnabled: te?.value ?? true });
      }
    } catch { toast.error('Load failed'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { load(tab); }, [tab]);

  const toggleTutor = async () => {
    try {
      await api.patch('/admin/settings', { key: 'tutorEnabled', value: !settings.tutorEnabled });
      setSettings(s => ({ ...s, tutorEnabled: !s.tutorEnabled }));
      toast.success(`Tutor ${!settings.tutorEnabled ? 'enabled' : 'disabled'}`);
    } catch { toast.error('Settings update failed'); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(u => u.filter(x => x._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Delete failed'); }
  };

  const tabs = [
    { id: 'users',    label: '👤 Users' },
    { id: 'levels',   label: '📊 Levels' },
    { id: 'topics',   label: '📝 Topics' },
    { id: 'exam',     label: '🎯 Exam Tasks' },
    { id: 'settings', label: '⚙️ Settings' },
  ];

  return (
    <div className="page page-enter">
      <h1 className="page-title">⚙️ Admin Panel</h1>
      <p className="page-sub">You have great power. Use it wisely. 🕷️</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id}
            className={`keycap keycap-sm ${tab === t.id ? 'keycap-ink' : 'keycap-ghost'}`}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ink-3)' }}>⏳ Loading...</div>}

      {/* USERS */}
      {!loading && tab === 'users' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Points</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 700 }}>{u.username}</td>
                  <td style={{ color: 'var(--ink-3)', fontSize: '0.85rem' }}>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-coral' : 'badge-blue'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--mint)' }}>
                    {u.points}
                  </td>
                  <td>
                    <button className="keycap keycap-coral keycap-sm" onClick={() => deleteUser(u._id)}>
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* LEVELS */}
      {!loading && tab === 'levels' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead><tr><th>#</th><th>Title</th><th>Active</th><th>Coming Soon</th></tr></thead>
            <tbody>
              {levels.map(l => (
                <tr key={l._id}>
                  <td style={{ fontWeight: 800 }}>{l.number}</td>
                  <td style={{ fontWeight: 700 }}>{l.icon} {l.title}</td>
                  <td><span className={`badge ${l.isActive ? 'badge-mint' : 'badge-gray'}`}>{l.isActive ? 'Active' : 'Hidden'}</span></td>
                  <td><span className={`badge ${l.comingSoon ? 'badge-sun' : 'badge-gray'}`}>{l.comingSoon ? 'Soon' : 'Live'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TOPICS */}
      {!loading && tab === 'topics' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead><tr><th>Level</th><th>Topic</th><th>Order</th><th>Active</th></tr></thead>
            <tbody>
              {topics.map(t => (
                <tr key={t._id}>
                  <td style={{ fontSize: '0.82rem', color: 'var(--ink-3)' }}>
                    L{t.levelId?.number} · {t.levelId?.title}
                  </td>
                  <td style={{ fontWeight: 700 }}>{t.title}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{t.order}</td>
                  <td><span className={`badge ${t.isActive ? 'badge-mint' : 'badge-gray'}`}>{t.isActive ? 'Active' : 'Hidden'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EXAM TASKS */}
      {!loading && tab === 'exam' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead><tr><th>Level</th><th>Title</th><th>Start</th><th>Goal</th><th>Max Steps</th><th>Points</th></tr></thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t._id}>
                  <td style={{ fontSize: '0.82rem', color: 'var(--ink-3)' }}>L{t.levelId?.number}</td>
                  <td style={{ fontWeight: 700 }}>{t.title}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>[{t.startArray?.join(',')}]</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--mint)' }}>[{t.goalArray?.join(',')}]</td>
                  <td>{t.maxSteps}</td>
                  <td style={{ color: 'var(--sun)', fontWeight: 700 }}>{t.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SETTINGS */}
      {!loading && tab === 'settings' && (
        <div className="card" style={{ maxWidth: 400 }}>
          <h3 style={{ marginBottom: '1.25rem' }}>Global Settings</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--paper)', borderRadius: 10 }}>
            <div>
              <div style={{ fontWeight: 700 }}>🤖 AI Tutor</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--ink-3)' }}>Allow learners to use the AI tutor</div>
            </div>
            <button
              className={`keycap ${settings.tutorEnabled ? 'keycap-mint' : 'keycap-coral'}`}
              onClick={toggleTutor}
            >
              {settings.tutorEnabled ? '✓ Enabled' : '✗ Disabled'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
