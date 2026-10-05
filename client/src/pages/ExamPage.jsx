import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client.js';
import { useAuthStore } from '../store/authStore.js';
import { useSoundStore } from '../store/soundStore.js';
import { toast } from '../components/layout/Toast.jsx';
import TutorButton from '../components/tutor/TutorButton.jsx';

/* ── Shared step logic (mirrors server/shared/memoryOps.js exactly) ────── */
const MAX = 8;
function stepsFor(op, idx, n) {
  if (op === 'insert') return idx === n ? 1 : n - idx + 1;
  if (op === 'delete') return n - idx;
  return 1; // update, access
}

/* ── Canvas confetti ─────────────────────────────────────────────────────── */
function Confetti({ active }) {
  const canvasRef = useRef(null);
  const frameRef  = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ['#2F6BFF','#17B26A','#FFC93C','#FF5D5D','#7C3AED','#F6F8FC'];
    const pieces = Array.from({ length: 140 }, () => ({
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height - canvas.height,
      w:    6 + Math.random() * 10,
      h:    8 + Math.random() * 14,
      r:    Math.random() * Math.PI * 2,
      dr:   (Math.random() - 0.5) * 0.18,
      vy:   2.5 + Math.random() * 4,
      vx:   (Math.random() - 0.5) * 2.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: 1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of pieces) {
        p.y  += p.vy;
        p.x  += p.vx;
        p.r  += p.dr;
        if (p.y > canvas.height * 0.7) p.opacity = Math.max(0, p.opacity - 0.018);
        if (p.opacity > 0) alive = true;
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive) frameRef.current = requestAnimationFrame(draw);
    };
    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 8999, pointerEvents: 'none' }}
    />
  );
}

/* ── Star pop animation ─────────────────────────────────────────────────── */
function Stars({ count }) {
  return (
    <div className="stars" style={{ justifyContent: 'center', gap: '0.4rem' }}>
      {[1, 2, 3].map(n => (
        <span
          key={n}
          className={`star ${n <= count ? 'filled' : 'empty'}`}
          style={{ animationDelay: `${(n - 1) * 0.15}s`, fontSize: '2rem' }}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}

/* ── Celebration overlay ─────────────────────────────────────────────────── */
function CelebrationOverlay({ result, onNext, onRetry, isLastTask, onClose }) {
  const { play } = useSoundStore();
  useEffect(() => { play('levelup'); }, []);

  return (
    <>
      <Confetti active />
      <div className="celebration-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="celebration-card">
          <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem', animation: 'mascotHop 0.5s ease' }}>
            {result.levelComplete ? '🏆' : '🎉'}
          </div>
          <h2 style={{ marginBottom: '0.35rem', fontSize: '1.6rem' }}>
            {result.levelComplete ? 'Level Complete!' : 'Task Solved!'}
          </h2>
          <p style={{ color: 'var(--ink-3)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {result.levelComplete
              ? 'Amazing work! You unlocked the next level 🔓'
              : 'Keep going — next task awaits!'}
          </p>

          <Stars count={result.stars} />

          <div style={{
            margin: '1rem 0', background: 'var(--mint-l)',
            border: '1.5px solid var(--mint)', borderRadius: 12,
            padding: '0.85rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem'
          }}>
            <div style={{ fontWeight: 900, color: 'var(--mint)', fontSize: '1.5rem' }}>
              +{result.pointsEarned} pts
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--ink-3)' }}>
              {result.steps} step{result.steps !== 1 ? 's' : ''} used
              · {result.stars}/3 ⭐
            </div>
            {result.levelUnlocked && (
              <div className="badge badge-blue" style={{ justifyContent: 'center', marginTop: '0.25rem' }}>
                🔓 Next Level Unlocked!
              </div>
            )}
            {result.badgeAwarded && (
              <div className="badge badge-sun" style={{ justifyContent: 'center', marginTop: '0.25rem' }}>
                🏅 Badge: {result.badgeAwarded.replace(/-/g, ' ')}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="keycap keycap-ghost" onClick={onRetry}>🔁 Try Again</button>
            {!isLastTask && (
              <button className="keycap keycap-blue" onClick={onNext}>Next Task →</button>
            )}
            {isLastTask && (
              <button className="keycap keycap-mint" onClick={() => window.location.href = '/levels'}>
                🗺️ Back to Map
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Memory block ────────────────────────────────────────────────────────── */
const BASE_ADDR = 0x100;
function MemBlock({ value, index, isEmpty, isSelected, onDrop, onClick }) {
  const handleDragOver = e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDrop = e => { e.preventDefault(); const op = e.dataTransfer.getData('tool'); if (op) onDrop?.(op, index); };

  return (
    <div
      className={`mem-block${isEmpty ? ' empty' : ''}${isSelected ? ' selected' : ''}`}
      style={{ width: 64, height: 64, cursor: 'pointer' }}
      onClick={() => onClick?.(index)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.(index)}
      aria-label={`Cell ${index}, value ${isEmpty ? 'empty' : value}`}
    >
      <span className="mem-value" style={{ fontSize: '1.1rem' }}>{isEmpty ? '·' : value}</span>
      <span className="mem-index">[{index}]</span>
      <span className="mem-addr">0x{(BASE_ADDR + index * 4).toString(16).toUpperCase()}</span>
    </div>
  );
}

/* ── Task mini-array display ─────────────────────────────────────────────── */
function ArrayDisplay({ arr, label, color }) {
  return (
    <div>
      <div style={{
        fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.06em',
        textTransform: 'uppercase', color, marginBottom: '0.4rem'
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
        {arr.map((v, i) => (
          <div key={i} style={{
            width: 46, height: 46, borderRadius: 8, border: `2px solid ${color}`,
            background: `${color}18`, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 1
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1rem', color: 'var(--ink)' }}>{v}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color }}>[{i}]</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Per-task visualizer ─────────────────────────────────────────────────── */
function TaskVisualizer({ task, onSubmit, submitting }) {
  const [array, setArray]       = useState([...task.startArray]);
  const [ops, setOps]           = useState([]);
  const [steps, setSteps]       = useState(0);
  const [log, setLog]           = useState([]);
  const [activeTool, setActive] = useState(null);
  const [value, setValue]       = useState('');
  const { play } = useSoundStore();

  useEffect(() => {
    setArray([...task.startArray]);
    setOps([]); setSteps(0); setLog([]); setActive(null); setValue('');
  }, [task._id]);

  const exec = useCallback((op, idx) => {
    const n = array.length;
    if (op === 'insert') {
      if (n >= MAX) { play('wrong'); toast.error('Memory full! RAM is not a clown car. 🎪'); return; }
      const val = parseInt(value, 10);
      if (isNaN(val)) { toast.error('Enter a number value first!'); return; }
      const s = stepsFor('insert', idx, n);
      const a = [...array]; a.splice(idx, 0, val);
      setArray(a); setSteps(t => t + s);
      setOps(o => [...o, { op: 'insert', index: idx, value: val }]);
      setLog(l => [...l, `insert(${idx}, ${val}) → ${s} step${s > 1 ? 's' : ''}`]);
      play('correct');
    } else if (op === 'delete') {
      if (idx >= n) return;
      const s = stepsFor('delete', idx, n);
      const a = [...array]; a.splice(idx, 1);
      setArray(a); setSteps(t => t + s);
      setOps(o => [...o, { op: 'delete', index: idx }]);
      setLog(l => [...l, `delete(${idx}) → ${s} step${s > 1 ? 's' : ''}`]);
      play('correct');
    } else if (op === 'update') {
      if (idx >= n) return;
      const val = parseInt(value, 10);
      if (isNaN(val)) { toast.error('Enter a number value first!'); return; }
      const a = [...array]; a[idx] = val;
      setArray(a); setSteps(t => t + 1);
      setOps(o => [...o, { op: 'update', index: idx, value: val }]);
      setLog(l => [...l, `update(${idx}, ${val}) → 1 step`]);
      play('correct');
    } else if (op === 'access') {
      if (idx >= n) return;
      setSteps(t => t + 1);
      setOps(o => [...o, { op: 'access', index: idx }]);
      setLog(l => [...l, `access(${idx}) = ${array[idx]} → 1 step`]);
      play('correct');
    }
    setActive(null);
  }, [array, value, play]);

  const handleCellClick = (idx) => { if (activeTool) exec(activeTool, idx); };
  const handleDrop = (op, idx) => exec(op, idx);
  const reset = () => {
    setArray([...task.startArray]); setOps([]); setSteps(0);
    setLog([]); setActive(null); setValue('');
  };

  const TOOLS = [
    { id: 'insert', emoji: '➕', label: 'Insert', color: 'keycap-blue' },
    { id: 'delete', emoji: '🗑️', label: 'Delete', color: 'keycap-coral' },
    { id: 'update', emoji: '✏️', label: 'Update', color: 'keycap-sun' },
    { id: 'access', emoji: '👁️', label: 'Access', color: 'keycap-mint' },
  ];

  const overBudget = steps > task.maxSteps;

  return (
    <div>
      {/* Start → Goal */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        gap: '1rem', alignItems: 'center', marginBottom: '1.25rem'
      }}>
        <ArrayDisplay arr={task.startArray} label="Start" color="var(--ink-3)" />
        <div style={{ fontSize: '1.75rem', color: 'var(--blue)', fontWeight: 900 }}>→</div>
        <ArrayDisplay arr={task.goalArray}  label="Goal 🎯" color="var(--mint)" />
      </div>

      {/* Budget badge */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span className="badge badge-gray">Max {task.maxSteps} steps</span>
        <span className={`badge ${overBudget ? 'badge-coral' : 'badge-mint'}`}>
          {steps} used {overBudget ? '⚠️ Over budget!' : ''}
        </span>
        {log.length > 0 && <span className="badge badge-blue">{log.length} op{log.length > 1 ? 's' : ''}</span>}
      </div>

      {/* Your current array */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '0.4rem' }}>
          Your Array
        </div>
        <div className="mem-grid" style={{ padding: '0.75rem' }}>
          {Array.from({ length: MAX }, (_, i) => {
            const empty = i >= array.length;
            return (
              <MemBlock
                key={i} value={array[i]} index={i}
                isEmpty={empty} isSelected={false}
                onClick={handleCellClick}
                onDrop={handleDrop}
              />
            );
          })}
        </div>
      </div>

      {/* Tools row (draggable) */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.75rem' }}>
        <input
          type="number" className="input"
          placeholder="Value"
          value={value}
          onChange={e => setValue(e.target.value)}
          style={{ width: 88, textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
        />
        {TOOLS.map(t => (
          <button
            key={t.id}
            draggable
            onDragStart={e => { e.dataTransfer.setData('tool', t.id); setActive(t.id); }}
            onDragEnd={() => {}}
            className={`keycap keycap-sm ${activeTool === t.id ? t.color : 'keycap-ghost'}`}
            onClick={() => { play('click'); setActive(activeTool === t.id ? null : t.id); }}
            title={`Select ${t.label} — then click a cell, or drag onto a cell`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
        <button className="keycap keycap-ghost keycap-sm" onClick={reset} title="Reset">🔄</button>
      </div>

      {/* Op log */}
      {log.length > 0 && (
        <div className="op-log" style={{ marginBottom: '0.75rem', maxHeight: 72 }}>
          {log.map((e, i) => <div key={i} className="op-log-entry">&gt; {e}</div>)}
        </div>
      )}

      {/* Submit */}
      <button
        className="keycap keycap-blue"
        style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '0.7rem' }}
        onClick={() => onSubmit(ops, steps)}
        disabled={submitting || ops.length === 0}
      >
        {submitting ? '⏳ Checking on server...' : '✅ Check My Answer'}
      </button>
    </div>
  );
}

/* ── Main ExamPage ───────────────────────────────────────────────────────── */
export default function ExamPage() {
  const { levelId }         = useParams();
  const [tasks, setTasks]   = useState([]);
  const [taskIdx, setIdx]   = useState(0);
  const [loading, setLoad]  = useState(true);
  const [submitting, setSub] = useState(false);
  const [result, setResult] = useState(null);
  const { refreshPoints }   = useAuthStore();
  const { play }            = useSoundStore();
  const navigate            = useNavigate();

  useEffect(() => {
    api.get(`/exam/level/${levelId}`)
      .then(r => setTasks(r.data))
      .catch(() => toast.error('No exam tasks found for this level'))
      .finally(() => setLoad(false));
  }, [levelId]);

  const handleSubmit = async (operations, steps) => {
    setSub(true);
    try {
      const { data } = await api.post('/exam/submit', { taskId: tasks[taskIdx]._id, operations });
      if (data.passed) {
        setResult(data);
        await refreshPoints();
      } else {
        play('wrong');
        toast.error(data.error || 'Not quite right — try again!');
      }
    } catch {
      toast.error('Submission failed. Try again!');
    } finally {
      setSub(false);
    }
  };

  if (loading) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
      <p>Preparing your exam...</p>
    </div>
  );

  if (!tasks.length) return (
    <div className="page">
      <p style={{ marginBottom: '1rem' }}>No exam tasks found for this level yet.</p>
      <button className="keycap keycap-ghost" onClick={() => navigate(-1)}>← Back</button>
    </div>
  );

  const task = tasks[taskIdx];
  const isLast = taskIdx === tasks.length - 1;

  return (
    <div className="page page-enter" style={{ maxWidth: 700 }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.85rem', color: 'var(--ink-3)', marginBottom: '0.75rem' }}>
        <Link to="/levels" style={{ color: 'var(--blue)' }}>Levels</Link>
        {' › '}Exam
      </div>

      <h1 className="page-title">📝 Level Exam</h1>
      <p className="page-sub">
        Transform the Start array into the Goal array using as few operations as possible.
        Your work is validated on the server — no cheating! 😄
      </p>

      {/* Task tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {tasks.map((t, i) => (
          <button
            key={i}
            className={`keycap keycap-sm ${i === taskIdx ? 'keycap-blue' : 'keycap-ghost'}`}
            onClick={() => { setIdx(i); setResult(null); }}
          >
            Task {i + 1}
          </button>
        ))}
      </div>

      {/* Task card */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <h3 style={{ marginBottom: '0.3rem' }}>{task.title || `Task ${taskIdx + 1}`}</h3>
        {task.description && (
          <p style={{ color: 'var(--ink-3)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            {task.description}
          </p>
        )}
        <TaskVisualizer
          key={task._id}
          task={task}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
        {task.hint && (
          <details style={{ marginTop: '1rem' }}>
            <summary style={{ cursor: 'pointer', color: 'var(--blue)', fontWeight: 700, fontSize: '0.875rem' }}>
              💡 Show Hint
            </summary>
            <div style={{
              background: 'var(--sun-l)', border: '1.5px solid var(--sun)',
              borderRadius: 10, padding: '0.75rem', marginTop: '0.5rem',
              fontSize: '0.875rem', color: '#7a5800'
            }}>
              {task.hint}
            </div>
          </details>
        )}
      </div>

      <button className="keycap keycap-ghost keycap-sm" onClick={() => navigate(-1)}>← Back to Level</button>

      {/* Celebration */}
      {result && (
        <CelebrationOverlay
          result={result}
          isLastTask={isLast}
          onNext={() => { setIdx(i => i + 1); setResult(null); }}
          onRetry={() => setResult(null)}
          onClose={() => setResult(null)}
        />
      )}

      <TutorButton topicId={null} topicName="Exam" levelName="Exam" isExam />
    </div>
  );
}
