import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore.js';
import api from '../api/client.js';
import { toast } from '../components/layout/Toast.jsx';

export default function ProgressPage() {
  const { user } = useAuthStore();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/progress')
      .then(r => setProgress(r.data))
      .catch(() => toast.error('Failed to load progress'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>⏳ Loading...</div>;

  const examResults = progress?.examResults ?? [];
  const badges = progress?.badges ?? [];
  const practicedTopics = progress?.practicedTopics ?? [];
  const totalPoints = user?.points ?? 0;

  return (
    <div className="page page-enter">
      <h1 className="page-title">📈 Your Progress</h1>
      <p className="page-sub">Every step counts. Here's how far you've come.</p>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { emoji: '⚡', label: 'Points', value: totalPoints.toLocaleString(), color: 'var(--sun)' },
          { emoji: '🔓', label: 'Level Unlocked', value: progress?.unlockedLevel ?? 1, color: 'var(--blue)' },
          { emoji: '🧪', label: 'Topics Practiced', value: practicedTopics.length, color: 'var(--mint)' },
          { emoji: '📝', label: 'Exams Passed', value: examResults.filter(r => r.stars > 0).length, color: 'var(--coral)' },
        ].map(({ emoji, label, value, color }) => (
          <div key={label} className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{emoji}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color }}>{value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--ink-3)', fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>🏅 Badges</h3>
        {badges.length ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {badges.map(b => (
              <span key={b} className="badge badge-sun" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
                🏅 {b.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--ink-3)', fontSize: '0.9rem' }}>
            No badges yet — pass your first exam! 🎯
          </p>
        )}
      </div>

      {/* Exam history */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>📝 Exam History</h3>
        {examResults.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[...examResults].reverse().map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.6rem 0.75rem', background: 'var(--paper)', borderRadius: 10,
                flexWrap: 'wrap', gap: '0.5rem'
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--ink-2)' }}>
                  {new Date(r.completedAt).toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1,2,3].map(n => (
                    <span key={n} style={{ fontSize: '1rem', opacity: n <= r.stars ? 1 : 0.2 }}>⭐</span>
                  ))}
                </div>
                <div style={{ fontWeight: 700, color: 'var(--mint)', fontFamily: 'var(--font-mono)' }}>
                  +{r.pointsEarned} pts
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)' }}>{r.stepsUsed} steps</div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--ink-3)', fontSize: '0.9rem' }}>
            No exam results yet. Take the Level 1 exam! 🎯
          </p>
        )}
      </div>
    </div>
  );
}
