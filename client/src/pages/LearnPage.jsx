import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client.js';
import { toast } from '../components/layout/Toast.jsx';
import TutorButton from '../components/tutor/TutorButton.jsx';

export default function LearnPage() {
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

  if (loading) return <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>⏳ Loading notes...</div>;
  if (!topic) return <div className="page">Topic not found.</div>;

  return (
    <div className="page page-enter" style={{ maxWidth: 780 }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.85rem', color: 'var(--ink-3)', marginBottom: '1rem' }}>
        <Link to="/levels" style={{ color: 'var(--blue)' }}>Levels</Link>
        {' › '}
        <Link to={`/levels/${topic.levelId?._id ?? topic.levelId}`} style={{ color: 'var(--blue)' }}>
          {topic.levelId?.title ?? 'Level'}
        </Link>
        {' › '}{topic.title}
      </div>

      <h1 className="page-title">📖 {topic.title}</h1>

      {/* Complexity summary card */}
      {topic.complexityNotes && (
        <div className="stats-bar" style={{ marginBottom: '1.75rem' }}>
          <div className="stat-item">
            <span className="stat-label">Time Complexity</span>
            <span className="stat-value blue">{topic.complexityNotes.time}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Space Complexity</span>
            <span className="stat-value mint">{topic.complexityNotes.space}</span>
          </div>
          <div className="stat-item" style={{ flex: 1 }}>
            <span className="stat-label">Summary</span>
            <span className="stat-value" style={{ fontSize: '0.82rem', fontFamily: 'var(--font-sans)' }}>
              {topic.complexityNotes.summary}
            </span>
          </div>
        </div>
      )}

      {/* Rich learn content */}
      <div
        className="card"
        style={{ padding: '2rem', lineHeight: 1.8 }}
        dangerouslySetInnerHTML={{ __html: topic.learnContent || '<p>Content coming soon!</p>' }}
      />

      {/* Navigation row */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', flexWrap: 'wrap' }}>
        <button className="keycap keycap-ghost" onClick={() => navigate(-1)}>← Back</button>
        <button className="keycap keycap-sun" onClick={() => navigate(`/topics/${topicId}/practice`)}>
          🧪 Practice this →
        </button>
        <button className="keycap keycap-mint" onClick={() => navigate(`/topics/${topicId}/solve`)}>
          ⚔️ Solve on LeetCode →
        </button>
      </div>

      <TutorButton topicId={topicId} topicName={topic.title} levelName={topic.levelId?.title} />
    </div>
  );
}
