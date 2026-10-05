import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client.js';
import { useSoundStore } from '../store/soundStore.js';
import { toast } from '../components/layout/Toast.jsx';

function TopicRow({ topic, onNavigate }) {
  return (
    <div className="card" style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--ink)' }}>{topic.title}</span>
            {topic.practiced && <span className="badge badge-mint">✓ Done</span>}
          </div>
          {topic.complexityNotes?.summary && (
            <div style={{ fontSize: '0.8rem', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
              ⏱ {topic.complexityNotes.time} · 💾 {topic.complexityNotes.space}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="keycap keycap-blue keycap-sm"  onClick={() => onNavigate(`/topics/${topic._id}/learn`)}>📖 Learn</button>
          <button className="keycap keycap-sun keycap-sm"   onClick={() => onNavigate(`/topics/${topic._id}/practice`)}>🧪 Practice</button>
          <button className="keycap keycap-mint keycap-sm"  onClick={() => onNavigate(`/topics/${topic._id}/solve`)}>⚔️ Solve</button>
        </div>
      </div>
    </div>
  );
}

export default function LevelPage() {
  const { levelId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { play } = useSoundStore();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/levels/${levelId}`)
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load level'))
      .finally(() => setLoading(false));
  }, [levelId]);

  if (loading) return <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>⏳ Loading level...</div>;
  if (!data) return <div className="page">Level not found.</div>;

  const { level, topics, practiceProgress } = data;
  const allPracticed = topics.length > 0 && topics.every(t => t.practiced);

  const handleNav = (path) => { play('click'); navigate(path); };

  return (
    <div className="page page-enter">
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.85rem', color: 'var(--ink-3)', marginBottom: '0.5rem' }}>
        <Link to="/levels" style={{ color: 'var(--blue)' }}>Levels</Link> › Level {level.number}
      </div>

      {/* Level header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '2.5rem' }}>{level.icon}</span>
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>{level.title}</h1>
          <p style={{ color: 'var(--ink-3)', fontSize: '0.9rem' }}>{level.description}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--ink-3)', marginBottom: '0.4rem' }}>
          <span>Practice progress</span>
          <span style={{ fontWeight: 700, color: 'var(--mint)' }}>{practiceProgress}%</span>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: `${practiceProgress}%` }} />
        </div>
      </div>

      {/* Topics */}
      <h2 style={{ marginBottom: '0.75rem', fontSize: '1rem', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Topics
      </h2>
      {topics.map(t => (
        <TopicRow key={t._id} topic={t} onNavigate={handleNav} />
      ))}

      {/* Exam button */}
      <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--blue-l)', border: '2px solid var(--blue)', borderRadius: 16, textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
        <h3 style={{ marginBottom: '0.5rem', color: 'var(--ink)' }}>Ready for the Exam?</h3>
        <p style={{ color: 'var(--ink-3)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          {allPracticed
            ? 'You\'ve practiced everything! Go crush that exam 💪'
            : `Practice all ${topics.length} topics first for best results!`}
        </p>
        <button
          className="keycap keycap-blue keycap-lg"
          onClick={() => handleNav(`/levels/${levelId}/exam`)}
        >
          🎯 Take the Exam
        </button>
      </div>
    </div>
  );
}
