import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client.js';
import { toast } from '../components/layout/Toast.jsx';

export default function SolvePage() {
  const { topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/topics/${topicId}`)
      .then(r => setTopic(r.data))
      .catch(() => toast.error('Failed to load topic'))
      .finally(() => setLoading(false));
  }, [topicId]);

  if (loading) return <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>⏳ Loading...</div>;
  if (!topic) return <div className="page">Topic not found.</div>;

  return (
    <div className="page page-enter" style={{ maxWidth: 640 }}>
      <div style={{ fontSize: '0.85rem', color: 'var(--ink-3)', marginBottom: '1rem' }}>
        <Link to="/levels" style={{ color: 'var(--blue)' }}>Levels</Link>
        {' › '}{topic.title}
      </div>

      <h1 className="page-title">⚔️ Solve — {topic.title}</h1>
      <p className="page-sub">Practice real LeetCode problems interactively in memory or open on LeetCode! 💪</p>

      {topic.leetcodeLinks?.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {topic.leetcodeLinks.map((link, i) => (
            <div
              key={i}
              className="card"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1rem 1.25rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, background: 'rgba(47,107,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, color: 'var(--blue)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem',
                  flexShrink: 0
                }}>
                  #{link.number}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>{link.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--blue)' }}>leetcode.com ↗</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="keycap keycap-blue keycap-sm"
                  onClick={() => navigate('/sandbox')}
                >
                  🎮 Play Memory Game
                </button>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="keycap keycap-ghost keycap-sm"
                  style={{ textDecoration: 'none' }}
                >
                  Open LeetCode ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-3)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚧</div>
          <p>LeetCode links for this topic are coming soon!</p>
        </div>
      )}

      <div style={{ marginTop: '1.5rem' }}>
        <button className="keycap keycap-ghost" onClick={() => navigate(-1)}>← Back</button>
      </div>
    </div>
  );
}
