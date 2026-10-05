import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore.js';
import api from '../api/client.js';
import { toast } from '../components/layout/Toast.jsx';

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState({ leaderboard: [], myRank: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leaderboard')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load leaderboard'))
      .finally(() => setLoading(false));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  if (loading) return <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>⏳ Counting points...</div>;

  return (
    <div className="page page-enter" style={{ maxWidth: 600 }}>
      <h1 className="page-title">🏆 Leaderboard</h1>
      <p className="page-sub">Top 50 learners ranked by points. Are you on the board?</p>

      {data.myRank && (
        <div style={{
          background: 'var(--blue-l)', border: '2px solid var(--blue)',
          borderRadius: 12, padding: '0.75rem 1.25rem', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700
        }}>
          <span style={{ fontSize: '1.5rem' }}>📍</span>
          <span>Your rank: <strong style={{ color: 'var(--blue)', fontSize: '1.25rem' }}>#{data.myRank}</strong></span>
          <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>· {user?.points?.toLocaleString()} pts</span>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {data.leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-3)' }}>
            No learners yet. Be the first!
          </div>
        ) : (
          <table style={{ margin: 0 }}>
            <thead>
              <tr>
                <th style={{ width: 48 }}>#</th>
                <th>Learner</th>
                <th style={{ textAlign: 'right' }}>Points</th>
              </tr>
            </thead>
            <tbody>
              {data.leaderboard.map((u, i) => {
                const isMe = String(u._id) === String(user?._id);
                return (
                  <tr key={u._id} style={{ background: isMe ? 'var(--blue-l)' : undefined }}>
                    <td style={{ fontWeight: 800, textAlign: 'center' }}>
                      {medals[i] ?? `${i + 1}`}
                    </td>
                    <td style={{ fontWeight: isMe ? 800 : 600, color: isMe ? 'var(--blue)' : undefined }}>
                      {u.username} {isMe && '← you'}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--mint)' }}>
                      {u.points.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
