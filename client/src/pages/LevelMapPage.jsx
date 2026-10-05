import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useSoundStore } from '../store/soundStore.js';
import { toast } from '../components/layout/Toast.jsx';

const LEVEL_EMOJIS = ['🧱','📦','🔃','🔤','🧵','🌲','🔗','🏔️','⚡','🏆'];

function LevelNode({ level, index, onClick }) {
  const nodeClass = level.completed ? 'complete' : level.current ? 'current' : level.locked ? 'locked' : '';
  const emoji = level.completed ? '✅' : level.comingSoon ? '🔒' : (level.icon || LEVEL_EMOJIS[index] || '📚');
  const isLeft = index % 2 === 0;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
    }}>
      {/* Connector above (not for first) */}
      {index > 0 && (
        <div
          className={`level-connector ${level.completed || level.current ? 'done' : ''}`}
          style={{ height: 52 }}
        />
      )}

      {/* Node row — alternates left/right like TypingClub */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '1rem',
          transform: `translateX(${isLeft ? '-48px' : '48px'})`,
          transition: 'transform 0.3s',
        }}
      >
        {/* Info card on left side for right-shifted nodes */}
        {!isLeft && (
          <div style={{
            textAlign: 'right',
            opacity: level.locked && !level.current ? 0.55 : 1,
          }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.07em',
              textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 2 }}>
              Level {level.number}
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: level.current ? 'var(--blue)' : 'var(--ink)',
              maxWidth: 110, lineHeight: 1.2 }}>
              {level.title}
            </div>
            {level.current && <div className="badge badge-blue" style={{ marginTop: 4, float: 'right' }}>▶ Current</div>}
            {level.completed && <div className="badge badge-mint" style={{ marginTop: 4, float: 'right' }}>Done ✓</div>}
            {level.comingSoon && <div className="badge badge-gray" style={{ marginTop: 4, float: 'right' }}>Soon 🚧</div>}
          </div>
        )}

        {/* The node circle */}
        <div
          className="level-node"
          onClick={onClick}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && onClick()}
          aria-label={`Level ${level.number}: ${level.title}${level.locked ? ' (locked)' : ''}`}
          style={{ width: 'auto' }}
        >
          <div
            className={`level-node-circle ${nodeClass}`}
            style={{
              animationDelay: `${index * 0.08}s`,
              animation: 'nodeEntrance 0.6s cubic-bezier(0.34,1.56,0.64,1) both',
              width: level.current ? 92 : 80,
              height: level.current ? 92 : 80,
              fontSize: level.current ? '2.4rem' : '2rem',
            }}
          >
            {emoji}
          </div>
        </div>

        {/* Info card on right side for left-shifted nodes */}
        {isLeft && (
          <div style={{
            textAlign: 'left',
            opacity: level.locked && !level.current ? 0.55 : 1,
          }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.07em',
              textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 2 }}>
              Level {level.number}
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: level.current ? 'var(--blue)' : 'var(--ink)',
              maxWidth: 110, lineHeight: 1.2 }}>
              {level.title}
            </div>
            {level.current && <div className="badge badge-blue" style={{ marginTop: 4 }}>▶ Current</div>}
            {level.completed && <div className="badge badge-mint" style={{ marginTop: 4 }}>Done ✓</div>}
            {level.comingSoon && <div className="badge badge-gray" style={{ marginTop: 4 }}>Soon 🚧</div>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LevelMapPage() {
  const [levels, setLevels]   = useState([]);
  const [loading, setLoading] = useState(true);
  const { play }  = useSoundStore();
  const navigate  = useNavigate();

  useEffect(() => {
    api.get('/levels')
      .then(r => setLevels(r.data))
      .catch(() => toast.error('Failed to load levels'))
      .finally(() => setLoading(false));
  }, []);

  const handleClick = (level) => {
    play('click');
    if (level.comingSoon) { toast.info('Coming soon! Finish Level 5 first 🚧'); return; }
    if (level.locked) { play('wrong'); toast.error(`🔒 Complete Level ${level.number - 1} to unlock!`); return; }
    navigate(`/levels/${level._id}`);
  };

  if (loading) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: '5rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'mascotHop 1s ease infinite' }}>🧠</div>
      <p style={{ fontWeight: 700 }}>Loading your adventure map…</p>
    </div>
  );

  return (
    <div className="page page-enter" style={{ maxWidth: 520 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ fontSize: '2.2rem', marginBottom: '0.35rem' }}>Learning Path</h1>
        <p className="page-sub" style={{ marginBottom: 0 }}>
          Complete each level to unlock the next.<br />
          Reach Level 10 and earn the <strong>NOESIS Master</strong> badge! 🏆
        </p>
      </div>

      {/* Badge goal */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
        background: 'linear-gradient(135deg,rgba(255,248,225,0.95),rgba(255,239,180,0.9))',
        border: '2px solid var(--sun)', borderRadius: 18,
        padding: '0.85rem 1.5rem', marginBottom: '2.5rem',
        fontWeight: 800, fontSize: '0.95rem', color: '#7a5800',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 20px rgba(255,201,60,0.2)',
        animation: 'goalGlow 2.5s ease infinite',
      }}>
        🏆 Goal: Earn the NOESIS Master Badge
      </div>

      {/* Level path */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {levels.map((lvl, i) => (
          <LevelNode key={lvl._id} level={lvl} index={i} onClick={() => handleClick(lvl)} />
        ))}

        {/* Coming soon footer */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem 1.5rem',
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(8px)',
          border: '1.5px dashed var(--border)',
          borderRadius: 18, textAlign: 'center',
          color: 'var(--ink-3)', fontSize: '0.875rem',
          fontWeight: 600,
        }}>
          🚧 Levels 6-10 are brewing in the lab.<br />
          <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>Stay curious — they'll be worth the wait!</span>
        </div>
      </div>

      <style>{`
        @keyframes nodeEntrance {
          from { opacity: 0; transform: scale(0.4) translateY(30px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes goalGlow {
          0%,100% { box-shadow: 0 4px 20px rgba(255,201,60,0.2); }
          50%      { box-shadow: 0 4px 30px rgba(255,201,60,0.55); }
        }
        @keyframes moonFloat {
          0%,100% { transform: translateY(0) rotate(-5deg); }
          50%      { transform: translateY(-12px) rotate(5deg); }
        }
        @keyframes twinkle {
          0%,100% { opacity: 0.3; transform: scale(0.85); }
          50%      { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
