import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client.js';
import { useSoundStore } from '../store/soundStore.js';
import { toast } from '../components/layout/Toast.jsx';
import TutorButton from '../components/tutor/TutorButton.jsx';

// Import shared logic directly (Vite can import from server/shared as absolute alias or relative)
// We inline the step counting here to avoid path issues; logic is identical to server/shared/memoryOps.js
const MAX_ARRAY_SIZE = 8;

function getStepsForOp(op, index, n) {
  switch (op) {
    case 'insert': {
      const atEnd = index === n;
      const steps = atEnd ? 1 : n - index + 1;
      return { steps, timeComplexity: atEnd ? 'O(1)' : 'O(n)', spaceComplexity: 'O(1)',
               detail: atEnd ? `Insert at end → 1 step` : `Insert at [${index}] → ${n-index} shifts + 1 write = ${steps} steps` };
    }
    case 'delete': {
      const steps = n - index;
      return { steps, timeComplexity: index === n-1 ? 'O(1)' : 'O(n)', spaceComplexity: 'O(1)',
               detail: index === n-1 ? `Delete last → 1 step` : `Delete at [${index}] → ${n-1-index} shifts + 1 = ${steps} steps` };
    }
    case 'update':
      return { steps: 1, timeComplexity: 'O(1)', spaceComplexity: 'O(1)', detail: `Update at [${index}] → 1 write` };
    case 'access':
      return { steps: 1, timeComplexity: 'O(1)', spaceComplexity: 'O(1)', detail: `Access at [${index}] → 1 read` };
    default:
      return { steps: 0, timeComplexity: 'O(?)', spaceComplexity: 'O(?)', detail: '' };
  }
}

// Base address for display
const BASE_ADDR = 0x100;

function MemBlock({ value, index, isSelected, isShifting, isEmpty, onClick, onDrop }) {
  const addr = `0x${(BASE_ADDR + index * 4).toString(16).toUpperCase()}`;
  const handleDragOver = e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDrop = e => {
    e.preventDefault();
    const tool = e.dataTransfer.getData('tool');
    if (tool && onDrop) onDrop(tool, index);
  };
  return (
    <div
      className={`mem-block${isSelected ? ' selected' : ''}${isShifting ? ' shifting' : ''}${isEmpty ? ' empty' : ''}`}
      onClick={onClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      title={`Index: ${index} | Address: ${addr}`}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
      aria-label={`Cell ${index}, value ${isEmpty ? 'empty' : value}`}
    >
      <span className="mem-value">{isEmpty ? '·' : value}</span>
      <span className="mem-index">[{index}]</span>
      <span className="mem-addr">{addr}</span>
    </div>
  );
}

export default function PracticePage() {
  const { topicId } = useParams();
  const [topic, setTopic]         = useState(null);
  const [array, setArray]         = useState([]);
  const [startArray, setStart]    = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selectedTool, setTool]   = useState(null); // 'insert'|'delete'|'update'|'access'
  const [selectedCell, setCell]   = useState(null);
  const [valueInput, setValue]    = useState('');
  const [steps, setSteps]         = useState(0);
  const [operations, setOps]      = useState([]);
  const [opLog, setOpLog]         = useState([]);
  const [complexity, setComplexity] = useState({ time: '—', space: '—', detail: '—' });
  const [shifting, setShifting]   = useState([]);
  const [mascotState, setMascot]  = useState('idle'); // idle|happy|error
  const [floatMsg, setFloat]      = useState(null);
  const [practiced, setPracticed] = useState(false);
  const { play } = useSoundStore();
  const logRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/topics/${topicId}`)
      .then(r => {
        setTopic(r.data);
        const arr = r.data.startArray?.length ? [...r.data.startArray] : [1, 2, 3, 4];
        setArray(arr);
        setStart([...arr]);
        setPracticed(r.data.practiced);
      })
      .catch(() => toast.error('Failed to load topic'))
      .finally(() => setLoading(false));
  }, [topicId]);

  // Auto-scroll op log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [opLog]);

  const animateMascot = (state) => {
    setMascot(state);
    setTimeout(() => setMascot('idle'), 700);
  };

  const showFloat = (msg, color = 'var(--mint)') => {
    setFloat({ msg, color, key: Date.now() });
    setTimeout(() => setFloat(null), 1000);
  };

  const handleCellClick = useCallback((idx) => {
    if (!selectedTool) return;
    play('click');
    setCell(idx);
    executeOp(selectedTool, idx);
  }, [selectedTool, array, valueInput]);

  const executeOp = (op, idx) => {
    const n = array.length;

    // Guard checks
    if (op === 'insert') {
      if (n >= MAX_ARRAY_SIZE) {
        play('wrong'); animateMascot('error');
        toast.error('Memory full. RAM is not a clown car. 🎪');
        return;
      }
      const val = parseInt(valueInput, 10);
      if (isNaN(val)) { toast.error('Enter a number value first!'); return; }
      const info = getStepsForOp('insert', idx, n);
      const newArr = [...array];
      newArr.splice(idx, 0, val);
      // Animate shifting blocks
      const shifting = Array.from({ length: n - idx }, (_, i) => idx + i);
      setShifting(shifting);
      setTimeout(() => {
        setArray(newArr);
        setShifting([]);
        setSteps(s => s + info.steps);
        setOps(o => [...o, { op: 'insert', index: idx, value: val }]);
        setOpLog(l => [...l, info.detail]);
        setComplexity({ time: info.timeComplexity, space: info.spaceComplexity, detail: info.detail });
        showFloat(`+${info.steps} step${info.steps > 1 ? 's' : ''}`);
        animateMascot('happy');
        play('correct');
      }, 300);
    } else if (op === 'delete') {
      if (n === 0) { play('wrong'); toast.error('Nothing to delete!'); return; }
      if (idx >= n) return;
      const info = getStepsForOp('delete', idx, n);
      const shifting = Array.from({ length: n - 1 - idx }, (_, i) => idx + i + 1);
      setShifting(shifting);
      setTimeout(() => {
        const newArr = [...array];
        newArr.splice(idx, 1);
        setArray(newArr);
        setShifting([]);
        setSteps(s => s + info.steps);
        setOps(o => [...o, { op: 'delete', index: idx }]);
        setOpLog(l => [...l, info.detail]);
        setComplexity({ time: info.timeComplexity, space: info.spaceComplexity, detail: info.detail });
        showFloat(`+${info.steps}`);
        animateMascot('happy');
        play('correct');
      }, 300);
    } else if (op === 'update') {
      if (idx >= n) return;
      const val = parseInt(valueInput, 10);
      if (isNaN(val)) { toast.error('Enter a number value first!'); return; }
      const info = getStepsForOp('update', idx, n);
      const newArr = [...array];
      newArr[idx] = val;
      setArray(newArr);
      setSteps(s => s + 1);
      setOps(o => [...o, { op: 'update', index: idx, value: val }]);
      setOpLog(l => [...l, info.detail]);
      setComplexity({ time: 'O(1)', space: 'O(1)', detail: info.detail });
      showFloat('+1');
      animateMascot('happy');
      play('correct');
    } else if (op === 'access') {
      if (idx >= n) return;
      const info = getStepsForOp('access', idx, n);
      setSteps(s => s + 1);
      setOps(o => [...o, { op: 'access', index: idx }]);
      setOpLog(l => [...l, `access[${idx}] = ${array[idx]} → 1 step`]);
      setComplexity({ time: 'O(1)', space: 'O(1)', detail: info.detail });
      showFloat(`= ${array[idx]}`, 'var(--blue)');
      animateMascot('happy');
      play('correct');
    }
  };

  const reset = () => {
    setArray([...startArray]);
    setSteps(0);
    setOps([]);
    setOpLog([]);
    setComplexity({ time: '—', space: '—', detail: '—' });
    setTool(null);
    setCell(null);
    setValue('');
    setMascot('idle');
    toast.info('Array reset! Fresh start 🔄');
  };

  const markPracticed = async () => {
    try {
      await api.post(`/topics/${topicId}/practice-done`);
      setPracticed(true);
      toast.success('Practice recorded! +XP 🎉');
      play('levelup');
    } catch { toast.error('Could not save progress'); }
  };

  if (loading) return <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>⏳ Setting up your RAM...</div>;
  if (!topic) return <div className="page">Topic not found.</div>;

  const TOOLS = [
    { id: 'insert', label: 'Insert', emoji: '➕', color: 'keycap-blue',  desc: 'Click a cell to insert before it' },
    { id: 'delete', label: 'Delete', emoji: '🗑️', color: 'keycap-coral', desc: 'Click a cell to delete it' },
    { id: 'update', label: 'Update', emoji: '✏️', color: 'keycap-sun',   desc: 'Click a cell to update its value' },
    { id: 'access', label: 'Access', emoji: '👁️', color: 'keycap-mint',  desc: 'Click a cell to read its value' },
  ];

  return (
    <div className="page page-enter" style={{ maxWidth: 900 }}>
      <div style={{ fontSize: '0.85rem', color: 'var(--ink-3)', marginBottom: '0.75rem' }}>
        <Link to="/levels" style={{ color: 'var(--blue)' }}>Levels</Link>
        {' › '}
        <span>{topic.title}</span>
        {' › Practice'}
      </div>

      <h1 className="page-title">🧪 {topic.title}</h1>
      {topic.missionText && <p className="page-sub">{topic.missionText}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'start' }}>
        {/* LEFT: Array + stats */}
        <div>
          {/* Mascot + array */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            {/* Mascot */}
            <div className={`mascot ${mascotState}`} aria-hidden="true">
              {mascotState === 'happy' ? '😄' : mascotState === 'error' ? '😬' : '🤖'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--ink-3)', marginBottom: '0.35rem', fontWeight: 600 }}>
                RAM — {array.length}/{MAX_ARRAY_SIZE} slots used
                {selectedTool && <span style={{ color: 'var(--blue)', marginLeft: '0.5rem' }}>
                  · {TOOLS.find(t => t.id === selectedTool)?.desc}
                </span>}
              </div>
              {/* Memory grid */}
              <div className="mem-grid" style={{ position: 'relative' }}>
                {Array.from({ length: MAX_ARRAY_SIZE }, (_, i) => {
                  const isEmpty = i >= array.length;
                  const handleDrop = (tool, idx) => executeOp(tool, idx);
                  return (
                    <MemBlock
                      key={i}
                      value={array[i]}
                      index={i}
                      isSelected={selectedCell === i}
                      isShifting={shifting.includes(i)}
                      isEmpty={isEmpty}
                      onDrop={handleDrop}
                      onClick={isEmpty && selectedTool === 'insert' ? () => executeOp('insert', i) : (isEmpty ? undefined : () => handleCellClick(i))}
                    />
                  );
                })}

                {/* Floating step counter */}
                {floatMsg && (
                  <div className="float-points" style={{ color: floatMsg.color, top: 0, right: 8 }}>
                    {floatMsg.msg}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="stats-bar" style={{ marginBottom: '0.75rem' }}>
            <div className="stat-item">
              <span className="stat-label">Steps Taken</span>
              <span className="stat-value coral">{steps}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Last Op Time</span>
              <span className="stat-value blue">{complexity.time}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Space</span>
              <span className="stat-value mint">{complexity.space}</span>
            </div>
            <div className="stat-item" style={{ flex: 2 }}>
              <span className="stat-label">Detail</span>
              <span className="stat-value" style={{ fontSize: '0.78rem', fontFamily: 'var(--font-sans)', color: 'var(--ink-2)' }}>
                {complexity.detail}
              </span>
            </div>
          </div>

          {/* Op log */}
          {opLog.length > 0 && (
            <div className="op-log" ref={logRef}>
              {opLog.map((entry, i) => (
                <div key={i} className="op-log-entry">&gt; {entry}</div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Tools panel */}
        <div style={{ minWidth: 180 }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink-3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              🛠 Tools
            </div>

            {/* Value input */}
            <input
              type="number"
              className="input"
              placeholder="Value (0-99)"
              value={valueInput}
              onChange={e => setValue(e.target.value)}
              style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
            />

            {/* Tool buttons — click to select OR drag onto a cell */}
            {TOOLS.map(t => (
              <button
                key={t.id}
                draggable
                onDragStart={e => {
                  e.dataTransfer.setData('tool', t.id);
                  e.dataTransfer.effectAllowed = 'move';
                  setTool(t.id);
                }}
                className={`keycap ${t.color} ${selectedTool === t.id ? '' : 'keycap-ghost'}`}
                style={selectedTool === t.id ? {} : { opacity: 0.7 }}
                onClick={() => {
                  play('click');
                  setTool(selectedTool === t.id ? null : t.id);
                  setCell(null);
                }}
                title={`${t.desc} — or drag onto a cell`}
              >
                {t.emoji} {t.label}
              </button>
            ))}

            <hr style={{ border: 'none', borderTop: '1.5px solid var(--border)', margin: '0.25rem 0' }} />

            {/* Reset */}
            <button className="keycap keycap-ghost keycap-sm" onClick={reset}>🔄 Reset</button>

            {/* Mark practiced */}
            {!practiced ? (
              <button className="keycap keycap-mint keycap-sm" onClick={markPracticed}>
                ✅ Mark Done
              </button>
            ) : (
              <div className="badge badge-mint" style={{ justifyContent: 'center', padding: '0.4rem' }}>
                ✓ Practiced!
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1.25rem' }}>
        <button className="keycap keycap-ghost keycap-sm" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <TutorButton
        topicId={topicId}
        topicName={topic.title}
        levelName={topic.levelId?.title}
        practiceContext={{ currentArray: array, operations: opLog.slice(-5), steps }}
      />
    </div>
  );
}
