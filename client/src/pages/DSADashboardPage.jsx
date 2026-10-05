import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Play, Pause, RotateCcw, 
  ChevronRight, Code, Sparkles, Layers, 
  Target, Award, X, Plus, Trash2, ArrowRight,
  CheckCircle2, MoveRight, Network, Compass, HelpCircle, Zap, Activity
} from 'lucide-react';
import NightScene from '../components/NightScene.jsx';
import './LoginPage.css';
import './DSADashboardPage.css';

/* ── DSA WORLDS TREE DATA ── */
const DSA_WORLDS = [
  {
    id: 'arrays',
    title: 'Arrays',
    icon: '📊',
    topics: [
      { id: 'intro', title: 'Introduction' },
      { id: 'two-pointers', title: 'Two Pointers', active: true },
      { id: 'sliding-window', title: 'Sliding Window' },
      { id: 'prefix-sum', title: 'Prefix Sum' },
      { id: 'diff-array', title: 'Difference Array' },
      { id: 'sorting', title: 'Sorting' },
      { id: 'binary-search', title: 'Binary Search' },
      { id: 'matrix', title: 'Matrix Traversal' }
    ]
  },
  { id: 'strings', title: 'Strings', icon: '🔤', topics: [] },
  { id: 'linkedlists', title: 'Linked Lists', icon: '🔗', topics: [] },
  { id: 'stackqueue', title: 'Stack & Queue', icon: '🥞', topics: [] },
  { id: 'trees', title: 'Trees', icon: '🌲', topics: [] },
  { id: 'graphs', title: 'Graphs', icon: '🕸️', topics: [] },
  { id: 'dp', title: 'Dynamic Programming', icon: '🧩', topics: [] },
  { id: 'greedy', title: 'Greedy', icon: '🎯', topics: [] }
];

export default function DSADashboardPage() {
  const navigate = useNavigate();

  // Active Modals / Views (Progressive Disclosure)
  const [showExplanation, setShowExplanation] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showMemoryMap, setShowMemoryMap] = useState(false);

  // Active Topic & Workspace Memory State
  const [activeTopic, setActiveTopic] = useState('two-pointers');
  const [activeTab, setActiveTab] = useState('Overview');
  
  // Interactive Memory Workspace Slots
  const [slots, setSlots] = useState([1, 3, 5, 7, 9]);
  const [leftPtr, setLeftPtr] = useState(0);
  const [rightPtr, setRightPtr] = useState(4);
  const [targetSum] = useState(10);
  const [discoveredConcepts, setDiscoveredConcepts] = useState(['Two Pointers']);

  // Visualization Player State
  const [vizStep, setVizStep] = useState(1);
  const [isVizPlaying, setIsVizPlaying] = useState(false);

  const currentSum = (slots[leftPtr] || 0) + (slots[rightPtr] || 0);
  const isMatch = currentSum === targetSum;

  const handleCheckSolution = () => {
    if (isMatch) {
      if (!discoveredConcepts.includes('Two Pointers')) {
        setDiscoveredConcepts(prev => [...prev, 'Two Pointers']);
      }
      setShowSuccessModal(true);
    } else {
      alert(`Current sum (${currentSum}) does not equal target sum (${targetSum}). Adjust your pointers!`);
    }
  };

  return createPortal(
    <div className="nz-page dsb-page">
      {/* Background Animated Night Scene */}
      <NightScene />

      <div className="dsb-container">

        {/* ── TOP HEADER NAVBAR ── */}
        <header className="dsb-navbar">
          {/* Logo */}
          <div className="dsb-logo-pill" onClick={() => navigate('/')}>
            <span style={{ fontSize: '1.2rem' }}>🪐</span>
            <div>
              <div className="dsb-logo-title">Noesis</div>
              <div className="dsb-logo-sub">MEMORY ARCHITECT</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="dsb-nav-links">
            <button className="dsb-nav-item" onClick={() => navigate('/')}>Home</button>
            <button className="dsb-nav-item active">Learn</button>
            <button className="dsb-nav-item" onClick={() => setShowPractice(true)}>🎮 Practice</button>
            <button className="dsb-nav-item" onClick={() => setShowVisualization(true)}>▶ Visualizer</button>
            <button className="dsb-nav-item" onClick={() => setShowMemoryMap(true)}>🧠 Memory Map</button>
          </nav>

          {/* Right Guest Badge */}
          <div className="dsb-guest-pill">
            <Sparkles size={14} color="#60a5fa" />
            <span>Guest Mode</span>
          </div>
        </header>

        {/* ── MAIN WORKSPACE LAYOUT ── */}
        <div className="dsb-workspace-layout">
          
          {/* ── LEFT SIDEBAR: DSA WORLDS TREE ── */}
          <aside className="dsb-tree-sidebar">
            <div className="dsb-sidebar-title">
              <Layers size={14} /> DSA WORLDS
            </div>

            {DSA_WORLDS.map(world => (
              <div key={world.id} className="dsb-world-group">
                <div className="dsb-world-header">
                  <span>{world.icon} {world.title}</span>
                  <ChevronRight size={14} color="#64748b" />
                </div>

                {world.topics.length > 0 && (
                  <div className="dsb-world-topics">
                    {world.topics.map(t => (
                      <div 
                        key={t.id} 
                        className={`dsb-topic-item ${activeTopic === t.id ? 'active' : ''}`}
                        onClick={() => setActiveTopic(t.id)}
                      >
                        <span>{t.title}</span>
                        {t.active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa' }} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </aside>

          {/* ── CENTER WORKSPACE CONTENT ── */}
          <main className="dsb-main-content">
            
            {/* Topic Header & Progressive Action Buttons */}
            <div className="dsb-concept-header-card">
              <div className="dsb-concept-title-group">
                <div className="dsb-concept-icon-box">🎯</div>
                <div>
                  <h1 className="dsb-concept-title">Two Pointers</h1>
                  <p className="dsb-concept-sub">Explore arrays from both ends. Build, experiment, and solve.</p>
                </div>
              </div>

              {/* Progressive Disclosure Action Buttons */}
              <div className="dsb-action-bar">
                <button className="dsb-act-btn" onClick={() => navigate('/explanation')}>
                  <BookOpen size={15} color="#90b8ff" /> 📖 Explanation
                </button>
                
                <button className="dsb-act-btn" onClick={() => setShowMissionModal(true)}>
                  <Target size={15} color="#ffc93c" /> 🎯 Your Mission
                </button>

                <button className="dsb-act-btn" onClick={() => setShowVisualization(true)}>
                  <Play size={15} color="#6ee4a8" /> ▶ Visualization
                </button>

                <button className="dsb-act-btn" onClick={() => setShowPractice(true)}>
                  <Code size={15} color="#c084fc" /> 🎮 Practice
                </button>
              </div>
            </div>

            {/* ── MEMORY ARCHITECT WORKSPACE (PRIMARY FOCUS) ── */}
            <div className="dsb-architect-grid">
              
              {/* Toolbox Panel (Left) */}
              <div className="dsb-toolbox-card">
                <div className="dsb-toolbox-header">
                  <span>🧰 Toolbox</span>
                </div>

                <div className="dsb-toolbox-tabs">
                  <button className="dsb-tb-tab active">Data</button>
                  <button className="dsb-tb-tab">Pointers</button>
                  <button className="dsb-tb-tab">Tools</button>
                </div>

                <div className="dsb-toolbox-tools">
                  <div className="dsb-tool-item" onClick={() => setSlots(prev => [...prev, 0])}>
                    <Plus size={16} color="#38bdf8" /> Array Slot
                  </div>

                  <div className="dsb-tool-item" onClick={() => {
                    const val = prompt('Enter a value to place:');
                    if (val !== null && !isNaN(val)) {
                      setSlots(prev => [...prev, Number(val)]);
                    }
                  }}>
                    <Sparkles size={16} color="#6ee4a8" /> Value
                  </div>

                  <div className="dsb-tool-item" onClick={() => setLeftPtr(prev => Math.max(0, prev - 1))}>
                    <MoveRight size={16} color="#38bdf8" /> Left (L -)
                  </div>

                  <div className="dsb-tool-item" onClick={() => setLeftPtr(prev => Math.min(slots.length - 1, prev + 1))}>
                    <MoveRight size={16} color="#38bdf8" /> Left (L +)
                  </div>

                  <div className="dsb-tool-item" onClick={() => setRightPtr(prev => Math.max(0, prev - 1))}>
                    <MoveRight size={16} color="#f472b6" /> Right (R -)
                  </div>

                  <div className="dsb-tool-item" onClick={() => setRightPtr(prev => Math.min(slots.length - 1, prev + 1))}>
                    <MoveRight size={16} color="#f472b6" /> Right (R +)
                  </div>

                  <div className="dsb-tool-item danger" onClick={() => {
                    setSlots([1, 3, 5, 7, 9]);
                    setLeftPtr(0);
                    setRightPtr(4);
                  }}>
                    <Trash2 size={16} color="#ef4444" /> Reset
                  </div>
                </div>

                <div style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', marginTop: '0.4rem' }}>
                  💡 Click tool actions to build & move memory elements.
                </div>
              </div>

              {/* Memory Workspace Canvas (Center) */}
              <div className="dsb-workspace-canvas">
                <div className="dsb-canvas-title-row">
                  <div className="dsb-canvas-title">
                    🧠 Memory Workspace
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Interactive RAM Slots</span>
                </div>

                {/* Array Memory Slots with Pointers */}
                <div className="dsb-array-slots-wrap">
                  {slots.map((val, idx) => {
                    const isL = idx === leftPtr;
                    const isR = idx === rightPtr;

                    return (
                      <div key={idx} className={`dsb-slot-cell ${val !== 0 ? 'filled' : ''}`}>
                        {val}
                        <span className="dsb-slot-index">{idx}</span>

                        {isL && <span className="dsb-ptr-tag dsb-ptr-left-tag">L</span>}
                        {isR && <span className="dsb-ptr-tag dsb-ptr-right-tag">R</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Live Calculation Output Display */}
                <div className="dsb-calc-display">
                  <div className="dsb-calc-text">
                    <strong>Sum:</strong> arr[{leftPtr}] ({slots[leftPtr] || 0}) + arr[{rightPtr}] ({slots[rightPtr] || 0}) = <strong>{currentSum}</strong>
                  </div>

                  {isMatch ? (
                    <div className="dsb-calc-match">✨ Target Sum {targetSum} Matched!</div>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Target = {targetSum}</span>
                  )}
                </div>
              </div>

              {/* Mission Objectives Card (Right) */}
              <div className="dsb-mission-card">
                <div className="dsb-mission-header">
                  <Target size={16} color="#ffc93c" /> Mission Objective
                </div>

                <div className="dsb-mission-desc">
                  Find the pair of numbers in memory whose sum equals <strong>10</strong> using Two Pointers.
                </div>

                <div className="dsb-target-box">
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Target Sum</div>
                    <div className="dsb-target-num">{targetSum}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Given Values</div>
                    <div className="dsb-given-pills">
                      {[1, 3, 5, 7, 9].map((n, i) => (
                        <div key={i} className="dsb-given-pill">{n}</div>
                      ))}
                    </div>
                  </div>
                </div>

                <button className="dsb-act-btn primary" onClick={handleCheckSolution} style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                  Check Solution <ArrowRight size={16} />
                </button>
              </div>

            </div>

          </main>
        </div>

      </div>

      {/* ── PROGRESSIVE DISCLOSURE MODALS & OVERLAYS ── */}

      {/* 1. CONCEPT EXPLANATION MODAL */}
      {showExplanation && (
        <div className="dsb-modal-backdrop" onClick={() => setShowExplanation(false)}>
          <div className="dsb-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="dsb-modal-header">
              <div className="dsb-modal-title">📖 What is Two Pointers?</div>
              <button className="dsb-modal-close" onClick={() => setShowExplanation(false)}><X size={16} /></button>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
              {['Overview', 'How it Works', 'When to Use', 'Example'].map(t => (
                <button 
                  key={t} 
                  className={`dsb-tb-tab ${activeTab === t ? 'active' : ''}`}
                  onClick={() => setActiveTab(t)}
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                >
                  {t}
                </button>
              ))}
            </div>

            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6 }}>
              {activeTab === 'Overview' && (
                <div>
                  <p><strong>Two Pointers</strong> is a pattern where two indices are used to explore an array efficiently — usually from both ends moving inward, or in the same direction.</p>
                  <p style={{ marginTop: '0.5rem', color: '#94a3b8' }}>Instead of using nested O(N²) loops, Two Pointers reduces time complexity to <strong>O(N)</strong>.</p>
                </div>
              )}

              {activeTab === 'How it Works' && (
                <ol style={{ paddingLeft: '1.2rem' }}>
                  <li>Place two pointers (Left at index 0, Right at last index).</li>
                  <li>Calculate the current metric (e.g. sum = arr[L] + arr[R]).</li>
                  <li>If sum &gt; target, move Right pointer left (R - 1).</li>
                  <li>If sum &lt; target, move Left pointer right (L + 1).</li>
                  <li>Repeat until target is found or pointers cross.</li>
                </ol>
              )}

              {activeTab === 'When to Use' && (
                <ul style={{ paddingLeft: '1.2rem' }}>
                  <li>Sorted arrays</li>
                  <li>Finding pair sums or triplets</li>
                  <li>Subarray / substring boundaries</li>
                  <li>In-place duplicate removal</li>
                </ul>
              )}

              {activeTab === 'Example' && (
                <div style={{ background: 'rgba(2,6,23,0.6)', padding: '0.8rem', borderRadius: 8, fontFamily: 'monospace' }}>
                  Target = 10<br />
                  Array = [1, 3, 5, 7, 9]<br />
                  L at 1, R at 9 → Sum = 10 (Target Found!)
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. VISUALIZATION MODAL */}
      {showVisualization && (
        <div className="dsb-modal-backdrop" onClick={() => setShowVisualization(false)}>
          <div className="dsb-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="dsb-modal-header">
              <div className="dsb-modal-title">▶ Two Pointers Visualization</div>
              <button className="dsb-modal-close" onClick={() => setShowVisualization(false)}><X size={16} /></button>
            </div>

            <div className="dsb-viz-canvas">
              <div className="dsb-bars-row">
                {[1, 3, 5, 7, 9].map((val, idx) => (
                  <div key={idx} className={`dsb-bar-box ${idx === 0 || idx === 4 ? 'highlight' : ''}`} style={{ height: `${val * 10 + 20}%` }}>
                    {val}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '1rem' }}>
                Step {vizStep}: Comparing Left pointer arr[0] (1) and Right pointer arr[4] (9). Sum = 10.
              </div>
            </div>

            <div className="dsb-viz-controls">
              <button className="dsb-btn-ghost-sm" onClick={() => setVizStep(prev => Math.max(1, prev - 1))}>Prev Step</button>
              <button className="dsb-btn-primary-sm" onClick={() => setIsVizPlaying(!isVizPlaying)}>
                {isVizPlaying ? <Pause size={14} /> : <Play size={14} />} {isVizPlaying ? 'Pause' : 'Play'}
              </button>
              <button className="dsb-btn-ghost-sm" onClick={() => setVizStep(prev => Math.min(4, prev + 1))}>Next Step</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MISSION MODAL */}
      {showMissionModal && (
        <div className="dsb-modal-backdrop" onClick={() => setShowMissionModal(false)}>
          <div className="dsb-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="dsb-modal-header">
              <div className="dsb-modal-title">🎯 Mission Checklist</div>
              <button className="dsb-modal-close" onClick={() => setShowMissionModal(false)}><X size={16} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                '1. Create the array slots in memory',
                '2. Place the given values [1, 3, 5, 7, 9]',
                '3. Set Left pointer at index 0 and Right pointer at index 4',
                '4. Calculate sum = arr[L] + arr[R]',
                '5. Match target sum = 10'
              ].map((stepText, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(30,41,59,0.5)', padding: '0.6rem 0.8rem', borderRadius: 8 }}>
                  <CheckCircle2 size={16} color="#6ee4a8" />
                  <span style={{ fontSize: '0.83rem', color: '#e2e8f0' }}>{stepText}</span>
                </div>
              ))}
            </div>

            <button className="dsb-act-btn primary" onClick={() => setShowMissionModal(false)} style={{ justifyContent: 'center' }}>
              Resume Mission Workspace
            </button>
          </div>
        </div>
      )}

      {/* 4. PRACTICE MODAL */}
      {showPractice && (
        <div className="dsb-modal-backdrop" onClick={() => setShowPractice(false)}>
          <div className="dsb-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="dsb-modal-header">
              <div className="dsb-modal-title">🎮 Two Pointers Practice Problems</div>
              <button className="dsb-modal-close" onClick={() => setShowPractice(false)}><X size={16} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { title: 'Two Sum II - Input Array Is Sorted', diff: 'Easy', color: '#6ee4a8' },
                { title: '3Sum - Find Triplets', diff: 'Medium', color: '#f59e0b' },
                { title: 'Container With Most Water', diff: 'Medium', color: '#f59e0b' },
                { title: 'Trapping Rain Water', diff: 'Hard', color: '#ef4444' },
                { title: 'Remove Duplicates from Sorted Array', diff: 'Easy', color: '#6ee4a8' }
              ].map((prob, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(30,41,59,0.5)', padding: '0.7rem 0.9rem', borderRadius: 10 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>{prob.title}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: prob.color }}>{prob.diff}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. PATTERN DISCOVERED SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="dsb-modal-backdrop" onClick={() => setShowSuccessModal(false)}>
          <div className="dsb-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="dsb-success-box">
              <div className="dsb-success-icon">✨</div>
              <div className="dsb-success-title">PATTERN DISCOVERED!</div>
              <div className="dsb-success-concept">Two Pointers</div>
              <div className="dsb-success-quote">"You built and solved the pattern yourself."</div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button className="dsb-act-btn primary" onClick={() => { setShowSuccessModal(false); setShowMemoryMap(true); }}>
                  Add to Memory Map 🧠
                </button>
                <button className="dsb-act-btn" onClick={() => setShowSuccessModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MEMORY MAP MODAL */}
      {showMemoryMap && (
        <div className="dsb-modal-backdrop" onClick={() => setShowMemoryMap(false)}>
          <div className="dsb-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 650 }}>
            <div className="dsb-modal-header">
              <div className="dsb-modal-title">🧠 Memory Map Knowledge Tree</div>
              <button className="dsb-modal-close" onClick={() => setShowMemoryMap(false)}><X size={16} /></button>
            </div>

            <div className="dsb-map-container">
              <div className="dsb-map-root">ARRAY WORLD</div>

              <div className="dsb-map-nodes-row">
                <div className={`dsb-map-node ${discoveredConcepts.includes('Two Pointers') ? 'discovered' : ''}`}>
                  Two Pointers {discoveredConcepts.includes('Two Pointers') ? '✓' : ''}
                </div>
                <div className="dsb-map-node">Sliding Window</div>
                <div className="dsb-map-node">Prefix Sum</div>
                <div className="dsb-map-node">Binary Search</div>
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center' }}>
              Discovered concepts glow bright green in your Memory Map.
            </div>
          </div>
        </div>
      )}

    </div>,
    document.body
  );
}
