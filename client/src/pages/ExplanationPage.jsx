import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ArrowLeft, User, Sparkles, CheckCircle2, Play, Pause, RotateCcw,
  Smile, Cpu, Compass, Layers, Zap
} from 'lucide-react';
import NightScene from '../components/NightScene.jsx';
import './LoginPage.css';
import './ExplanationPage.css';

export default function ExplanationPage() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(1);
  const [direction, setDirection] = useState(1);
  const [eli5, setEli5] = useState(false); // "Teach me like I'm 10" mode

  // Playback control state
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 0.5x, 1x, 1.5x
  const [animSubStep, setAnimSubStep] = useState(0);

  const totalSlides = 6;

  // Auto animation playback timer per slide
  useEffect(() => {
    let timer;
    if (isPlaying) {
      const intervalMs = 2200 / speed;
      timer = setInterval(() => {
        setAnimSubStep(prev => {
          if (prev >= getMaxSubStep(slide)) {
            // Auto advance to next slide if playing
            if (slide < totalSlides) {
              setDirection(1);
              setSlide(s => s + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return prev;
            }
          }
          return prev + 1;
        });
      }, intervalMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed, slide]);

  const getMaxSubStep = (sNum) => {
    switch (sNum) {
      case 1: return 5;
      case 2: return 4;
      case 3: return 2; // 0: Opposite, 1: Same, 2: Fast&Slow
      case 4: return 4;
      case 5: return 3; // 3 algorithm steps
      case 6: return 1;
      default: return 0;
    }
  };

  const goToSlide = (newSlide) => {
    if (newSlide < 1 || newSlide > totalSlides) return;
    setDirection(newSlide > slide ? 1 : -1);
    setSlide(newSlide);
    setAnimSubStep(0);
  };

  const handleRestart = () => {
    setAnimSubStep(0);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (animSubStep >= getMaxSubStep(slide) && slide < totalSlides) {
      setAnimSubStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  const slideVariants = {
    initial: (dir) => ({
      x: dir > 0 ? 90 : -90,
      opacity: 0,
      scale: 0.96
    }),
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.35, ease: 'easeOut' }
    },
    exit: (dir) => ({
      x: dir > 0 ? -90 : 90,
      opacity: 0,
      scale: 0.96,
      transition: { duration: 0.25, ease: 'easeIn' }
    })
  };

  return createPortal(
    <div className="nz-page exp-page">
      {/* Background Animated Night Scene */}
      <NightScene />

      <div className="exp-container">

        {/* ── TOP HEADER NAVBAR ── */}
        <header className="exp-navbar">
          {/* Logo */}
          <div className="exp-logo-pill" onClick={() => navigate('/')}>
            <span style={{ fontSize: '1.2rem' }}>🪐</span>
            <div>
              <div className="exp-logo-title">Noesis</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="exp-nav-links">
            <button className="exp-nav-item" onClick={() => navigate('/')}>Home</button>
            <button className="exp-nav-item active">Learn</button>
            <button className="exp-nav-item" onClick={() => navigate('/dashboard')}>Practice</button>
            <button className="exp-nav-item" onClick={() => navigate('/dashboard')}>LeetCode</button>
            <button className="exp-nav-item" onClick={() => navigate('/dashboard')}>Playground</button>
            <button className="exp-nav-item" onClick={() => navigate('/dashboard')}>Memory Map</button>
          </nav>

          {/* Right Guest Badge */}
          <div className="exp-guest-pill">
            <User size={14} color="#60a5fa" />
            <span>Guest Mode</span>
          </div>
        </header>

        {/* ── PRESENTATION HEADER BAR ── */}
        <div className="exp-presentation-bar">
          {/* Progress Indicator */}
          <div className="exp-step-nodes">
            {[1, 2, 3, 4, 5, 6].map((sNum, idx) => (
              <React.Fragment key={sNum}>
                <div 
                  className={`exp-step-dot ${slide === sNum ? 'active' : ''} ${slide > sNum ? 'done' : ''}`}
                  onClick={() => goToSlide(sNum)}
                >
                  {slide > sNum ? '✓' : sNum}
                </div>
                {idx < 5 && (
                  <div className={`exp-step-line ${slide > sNum ? 'done' : ''}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="exp-progress-text">
            Slide {slide} of 6
          </div>

          {/* "Teach me like I'm 10" Toggle Button */}
          <button 
            className={`exp-eli5-btn ${eli5 ? 'active' : ''}`}
            onClick={() => setEli5(!eli5)}
          >
            <Smile size={16} color={eli5 ? '#facc15' : '#94a3b8'} />
            <span>🧒 Teach me like I'm 10 {eli5 ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* ── PRESENTATION SLIDE VIEWPORT ── */}
        <div className="exp-screen-viewport">
          <AnimatePresence custom={direction} mode="wait">

            {/* ── SLIDE 1 — INTRODUCTION ── */}
            {slide === 1 && (
              <motion.div 
                key="slide1"
                custom={direction}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="exp-screen-card"
              >
                <div className="exp-screen-badge">SLIDE 1 • INTRODUCTION</div>
                
                <h1 className="exp-presentation-title">
                  TWO POINTERS
                </h1>
                
                <p className="exp-presentation-subtitle">
                  {eli5 ? '"Two best friends searching a row of mystery boxes from opposite ends!"' : '"Two positions. One array. A smarter way to search."'}
                </p>

                {/* Animated Array & Pointers */}
                <div className="exp-animated-stage">
                  <div className="exp-cells-row">
                    {[1, 3, 5, 7, 9].map((val, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ 
                          opacity: animSubStep >= 0 ? 1 : 0, 
                          scale: animSubStep >= 0 ? 1 : 0 
                        }}
                        transition={{ delay: idx * 0.15, duration: 0.3 }}
                        className={`exp-cell-item ${
                          (idx === 0 && animSubStep >= 1) || (idx === 4 && animSubStep >= 2) ? 'highlighted' : ''
                        }`}
                      >
                        {val}
                        {/* L Pointer */}
                        {idx === 0 && animSubStep >= 1 && (
                          <motion.span 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="exp-avatar-ptr exp-avatar-l"
                          >
                            L → (Start)
                          </motion.span>
                        )}
                        {/* R Pointer */}
                        {idx === 4 && animSubStep >= 2 && (
                          <motion.span 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="exp-avatar-ptr exp-avatar-r"
                          >
                            ← R (End)
                          </motion.span>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Flow Arrow Display */}
                  {animSubStep >= 3 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="exp-flow-indicator"
                    >
                      L → &nbsp;&nbsp; [ 1 ][ 3 ][ 5 ][ 7 ][ 9 ] &nbsp;&nbsp; ← R
                    </motion.div>
                  )}
                </div>

                {/* Explanations appearing */}
                {animSubStep >= 4 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="exp-legend-box"
                  >
                    <div><span className="exp-tag-l">L</span> = Left Pointer (Index 0)</div>
                    <div><span className="exp-tag-r">R</span> = Right Pointer (Index N-1)</div>
                  </motion.div>
                )}

                <div className="exp-short-exp">
                  {eli5 
                    ? "Imagine you and your friend start at both ends of a line of cards and walk towards each other to find a matching pair!" 
                    : "Two Pointers means using two positions in an array to search or process elements efficiently."}
                </div>

              </motion.div>
            )}

            {/* ── SLIDE 2 — WHY TWO POINTERS? ── */}
            {slide === 2 && (
              <motion.div 
                key="slide2"
                custom={direction}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="exp-screen-card"
              >
                <div className="exp-screen-badge">SLIDE 2 • WHY TWO POINTERS?</div>
                
                <h1 className="exp-screen-title">
                  {animSubStep < 2 ? "Imagine checking every possible pair..." : "Let's be smarter."}
                </h1>

                <div className="exp-animated-stage">
                  {animSubStep < 2 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <div className="exp-cells-row">
                        {[1, 3, 5, 7, 9].map((val, idx) => (
                          <div 
                            key={idx} 
                            className={`exp-cell-item ${
                              (animSubStep === 0 && (idx === 0 || idx === 1)) || 
                              (animSubStep === 1 && (idx === 0 || idx === 2)) ? 'bad-highlight' : ''
                            }`}
                          >
                            {val}
                          </div>
                        ))}
                      </div>

                      {/* Brute Force Badge */}
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="exp-warning-badge"
                      >
                        {animSubStep === 0 ? "1 + 3 = 4 (Check 1)" : "1 + 5 = 6 (Check 2... 3... 4... 10...)"}
                      </motion.div>

                      {animSubStep === 1 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="exp-too-many-badge"
                        >
                          Too many checks! 😵 O(N²) Comparisons
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
                    >
                      <div className="exp-cells-row">
                        {[1, 3, 5, 7, 9].map((val, idx) => (
                          <div key={idx} className="exp-cell-item highlighted">
                            {val}
                            {idx === 0 && <span className="exp-avatar-ptr exp-avatar-l">L →</span>}
                            {idx === 4 && <span className="exp-avatar-ptr exp-avatar-r">← R</span>}
                          </div>
                        ))}
                      </div>

                      <div className="exp-smart-badge">
                        Instead of checking everything, we use what we already know! ✨
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="exp-short-exp">
                  {eli5
                    ? "Instead of testing every single key in a giant bag one by one, you use clues to skip bad pairs!"
                    : "By eliminating impossible pairs based on sorted order, Two Pointers cuts down O(N²) work into O(N)."}
                </div>
              </motion.div>
            )}

            {/* ── SLIDE 3 — TYPES OF TWO POINTERS ── */}
            {slide === 3 && (
              <motion.div 
                key="slide3"
                custom={direction}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="exp-screen-card"
                style={{ maxWidth: '840px' }}
              >
                <div className="exp-screen-badge">SLIDE 3 • TYPES</div>
                
                <h1 className="exp-screen-title">
                  Meet the Two Pointer Types
                </h1>

                {/* Sub-Step Pattern Selectors */}
                <div className="exp-pattern-tabs">
                  <button className={`exp-pattern-tab ${animSubStep === 0 ? 'active' : ''}`} onClick={() => setAnimSubStep(0)}>
                    1. OPPOSITE DIRECTION
                  </button>
                  <button className={`exp-pattern-tab ${animSubStep === 1 ? 'active' : ''}`} onClick={() => setAnimSubStep(1)}>
                    2. SAME DIRECTION
                  </button>
                  <button className={`exp-pattern-tab ${animSubStep === 2 ? 'active' : ''}`} onClick={() => setAnimSubStep(2)}>
                    3. FAST & SLOW
                  </button>
                </div>

                {/* Animated Visual Stage */}
                <div className="exp-animated-stage" style={{ width: '100%', minHeight: '160px' }}>
                  
                  {/* TYPE 1: OPPOSITE DIRECTION */}
                  {animSubStep === 0 && (
                    <motion.div 
                      key="type1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="exp-pattern-display"
                    >
                      <div className="exp-pattern-heading">↔️ OPPOSITE DIRECTION</div>
                      <div className="exp-cells-row" style={{ margin: '1rem 0' }}>
                        {[1, 3, 5, 7, 9].map((val, idx) => (
                          <div key={idx} className="exp-cell-item">
                            {val}
                            {idx === 0 && <span className="exp-avatar-ptr exp-avatar-l">L →</span>}
                            {idx === 4 && <span className="exp-avatar-ptr exp-avatar-r">← R</span>}
                          </div>
                        ))}
                      </div>
                      <div className="exp-pattern-desc">
                        {eli5 ? "Two friends walking toward each other from opposite ends of a bridge!" : "Start from opposite ends and move toward each other."}
                      </div>
                    </motion.div>
                  )}

                  {/* TYPE 2: SAME DIRECTION */}
                  {animSubStep === 1 && (
                    <motion.div 
                      key="type2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="exp-pattern-display"
                    >
                      <div className="exp-pattern-heading">➡️➡️ SAME DIRECTION</div>
                      <div className="exp-cells-row" style={{ margin: '1rem 0' }}>
                        {[1, 3, 5, 7, 9].map((val, idx) => (
                          <div key={idx} className="exp-cell-item">
                            {val}
                            {idx === 0 && <span className="exp-avatar-ptr exp-avatar-l">L →</span>}
                            {idx === 1 && <span className="exp-avatar-ptr exp-avatar-r">R →</span>}
                          </div>
                        ))}
                      </div>
                      <div className="exp-pattern-desc">
                        {eli5 ? "Two friends walking together in the same direction!" : "Both pointers move forward in the array."}
                      </div>
                    </motion.div>
                  )}

                  {/* TYPE 3: FAST & SLOW */}
                  {animSubStep === 2 && (
                    <motion.div 
                      key="type3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="exp-pattern-display"
                    >
                      <div className="exp-pattern-heading">🐢 🐇 FAST & SLOW</div>
                      <div className="exp-cells-row" style={{ margin: '1rem 0' }}>
                        {[1, 3, 5, 7, 9].map((val, idx) => (
                          <div key={idx} className="exp-cell-item">
                            {val}
                            {idx === 0 && <span className="exp-avatar-ptr exp-avatar-l">Slow (1x) →</span>}
                            {idx === 2 && <span className="exp-avatar-ptr exp-avatar-r">Fast (2x) → →</span>}
                          </div>
                        ))}
                      </div>
                      <div className="exp-pattern-desc">
                        {eli5 ? "A turtle (slow) and a rabbit (fast) running a race!" : "One pointer moves faster than the other."}
                      </div>
                    </motion.div>
                  )}

                </div>

              </motion.div>
            )}

            {/* ── SLIDE 4 — HOW IT WORKS ── */}
            {slide === 4 && (
              <motion.div 
                key="slide4"
                custom={direction}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="exp-screen-card"
              >
                <div className="exp-screen-badge">SLIDE 4 • HOW IT WORKS</div>
                
                <h1 className="exp-screen-title">
                  How does Two Pointers actually work?
                </h1>

                <div className="exp-story-box" style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.85rem', color: '#60a5fa', fontWeight: 800 }}>EXAMPLE MISSION</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                    Target = 10 &nbsp;•&nbsp; Array: [1, 3, 5, 7, 9]
                  </div>
                </div>

                {/* Calculation Stage */}
                <div className="exp-animated-stage">
                  <div className="exp-cells-row">
                    {[1, 3, 5, 7, 9].map((val, idx) => (
                      <div key={idx} className={`exp-cell-item ${(idx === 0 || idx === 4) ? 'highlighted' : ''}`}>
                        {val}
                        {idx === 0 && <span className="exp-avatar-ptr exp-avatar-l">L = 1</span>}
                        {idx === 4 && <span className="exp-avatar-ptr exp-avatar-r">R = 9</span>}
                      </div>
                    ))}
                  </div>

                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="exp-calc-badge"
                  >
                    1 + 9 = 10 &nbsp;→&nbsp; <span style={{ color: '#10b981', fontWeight: 900 }}>🎯 TARGET FOUND!</span>
                  </motion.div>
                </div>

                {/* 3 Decision Rules appearing sequentially */}
                <div className="exp-rules-grid">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: animSubStep >= 1 ? 1 : 0.4, y: 0 }}
                    className="exp-rule-item"
                  >
                    <div style={{ color: '#facc15', fontWeight: 800 }}>sum &lt; target</div>
                    <div style={{ fontSize: '0.8rem', color: '#fff' }}>Move L → (Need larger value)</div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: animSubStep >= 2 ? 1 : 0.4, y: 0 }}
                    className="exp-rule-item"
                  >
                    <div style={{ color: '#f87171', fontWeight: 800 }}>sum &gt; target</div>
                    <div style={{ fontSize: '0.8rem', color: '#fff' }}>Move R ← (Need smaller value)</div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: animSubStep >= 3 ? 1 : 0.4, y: 0 }}
                    className="exp-rule-item"
                    style={{ borderColor: '#10b981' }}
                  >
                    <div style={{ color: '#6ee4a8', fontWeight: 800 }}>sum == target</div>
                    <div style={{ fontSize: '0.8rem', color: '#fff' }}>✨ FOUND IT!</div>
                  </motion.div>
                </div>

              </motion.div>
            )}

            {/* ── SLIDE 5 — STEP-BY-STEP ANIMATION ── */}
            {slide === 5 && (
              <motion.div 
                key="slide5"
                custom={direction}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="exp-screen-card"
              >
                <div className="exp-screen-badge">SLIDE 5 • STEP-BY-STEP ANIMATION</div>
                
                <h1 className="exp-screen-title">
                  Watch the Pointers Move
                </h1>

                <div className="exp-story-box" style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.85rem', color: '#60a5fa', fontWeight: 800 }}>PROBLEM</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                    Array: [ 1, 2, 4, 6, 8, 11 ] &nbsp;•&nbsp; Target = 10
                  </div>
                </div>

                {/* Animated Pointer Movements Stage */}
                <div className="exp-animated-stage">
                  <div className="exp-cells-row">
                    {[1, 2, 4, 6, 8, 11].map((val, idx) => {
                      // SubStep 0: L=0 (1), R=5 (11)
                      // SubStep 1: L=0 (1), R=4 (8)  (R moved left)
                      // SubStep 2: L=1 (2), R=4 (8)  (L moved right -> 2+8=10 MATCH!)
                      let curL = animSubStep === 0 ? 0 : animSubStep === 1 ? 0 : 1;
                      let curR = animSubStep === 0 ? 5 : 4;
                      let isL = idx === curL;
                      let isR = idx === curR;

                      return (
                        <div key={idx} className={`exp-cell-item ${isL || isR ? 'highlighted' : ''}`}>
                          {val}
                          {isL && <span className="exp-avatar-ptr exp-avatar-l">L = {val}</span>}
                          {isR && <span className="exp-avatar-ptr exp-avatar-r">R = {val}</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Live Step Explanation */}
                  <motion.div 
                    key={animSubStep}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="exp-step-callout"
                  >
                    {animSubStep === 0 && (
                      <div>
                        <strong>STEP 1:</strong> L = 1, R = 11 &nbsp;→&nbsp; 1 + 11 = <strong>12</strong><br />
                        <span style={{ color: '#f87171' }}>12 &gt; 10 (Too big!). Move R ← left.</span>
                      </div>
                    )}
                    {animSubStep === 1 && (
                      <div>
                        <strong>STEP 2:</strong> L = 1, R = 8 &nbsp;→&nbsp; 1 + 8 = <strong>9</strong><br />
                        <span style={{ color: '#facc15' }}>9 &lt; 10 (Too small!). Move L → right.</span>
                      </div>
                    )}
                    {animSubStep >= 2 && (
                      <div>
                        <strong>STEP 3:</strong> L = 2, R = 8 &nbsp;→&nbsp; 2 + 8 = <strong>10</strong><br />
                        <span style={{ color: '#6ee4a8', fontWeight: 900 }}>✨ 10 == 10 🎉 FOUND THE PAIR!</span>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Sub-step indicator buttons */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className={`exp-substep-btn ${animSubStep === 0 ? 'active' : ''}`} onClick={() => setAnimSubStep(0)}>Step 1</button>
                  <button className={`exp-substep-btn ${animSubStep === 1 ? 'active' : ''}`} onClick={() => setAnimSubStep(1)}>Step 2</button>
                  <button className={`exp-substep-btn ${animSubStep >= 2 ? 'active' : ''}`} onClick={() => setAnimSubStep(2)}>Step 3</button>
                </div>

              </motion.div>
            )}

            {/* ── SLIDE 6 — YOUR TURN / MEMORY ARCHITECT ── */}
            {slide === 6 && (
              <motion.div 
                key="slide6"
                custom={direction}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="exp-screen-card"
                style={{ borderColor: 'rgba(168, 85, 247, 0.4)', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(168, 85, 247, 0.25)' }}
              >
                <div className="exp-screen-badge" style={{ background: '#a855f7', color: '#fff' }}>SLIDE 6 • YOUR TURN</div>
                
                <h1 className="exp-screen-title" style={{ background: 'linear-gradient(135deg, #ffffff 30%, #e9d5ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Now it's your turn.
                </h1>

                <div style={{ fontSize: '1rem', color: '#c084fc', fontWeight: 700 }}>
                  You've seen the pattern. You've seen the pointers move. Now YOU build it.
                </div>

                {/* Empty Memory Sandbox Preview */}
                <div className="exp-architect-preview">
                  <div className="exp-preview-header">EMPTY MEMORY WORKSPACE</div>
                  
                  <div className="exp-cells-row" style={{ margin: '0.5rem 0' }}>
                    {[ ' ', ' ', ' ', ' ', ' ' ].map((_, idx) => (
                      <div key={idx} className="exp-cell-item" style={{ background: 'rgba(15, 23, 42, 0.8)', borderColor: '#a855f7' }}>
                        {idx === 0 ? '?' : ''}
                      </div>
                    ))}
                  </div>

                  <div className="exp-toolbox-preview">
                    <span className="exp-tool-chip">🧱 Array</span>
                    <span className="exp-tool-chip">🔢 Value</span>
                    <span className="exp-tool-chip">📍 Pointer</span>
                    <span className="exp-tool-chip">🔗 Connector</span>
                    <span className="exp-tool-chip">📦 Variable</span>
                  </div>

                  <div className="exp-preview-mission">
                    "Build the array. Create L and R. Find the pair whose sum is 10."
                  </div>
                </div>

                {/* BIG BUTTON ENTER MEMORY ARCHITECT */}
                <button 
                  className="exp-btn-enter-architect"
                  onClick={() => navigate('/dashboard')}
                >
                  🧠 Enter Memory Architect <ArrowRight size={22} />
                </button>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ── PRESENTATION CONTROLS BAR (AT BOTTOM) ── */}
        <footer className="exp-controls-footer">
          
          {/* Back Button */}
          <button 
            className="exp-ctrl-btn" 
            onClick={() => goToSlide(slide - 1)}
            disabled={slide === 1}
          >
            <ArrowLeft size={16} /> Back
          </button>

          {/* Playback Controls */}
          <div className="exp-playback-group">
            <button className="exp-ctrl-btn" onClick={handleRestart} title="Restart Slide Animation">
              <RotateCcw size={16} /> Restart
            </button>

            <button className="exp-ctrl-btn play-btn" onClick={togglePlay}>
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              <span>{isPlaying ? 'Pause' : 'Play Lesson'}</span>
            </button>

            {/* Speed Selector */}
            <div className="exp-speed-selector">
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Speed:</span>
              {[0.5, 1, 1.5].map(sp => (
                <button 
                  key={sp}
                  className={`exp-speed-btn ${speed === sp ? 'active' : ''}`}
                  onClick={() => setSpeed(sp)}
                >
                  {sp}x
                </button>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <button 
            className="exp-ctrl-btn next-btn"
            onClick={() => goToSlide(slide + 1)}
            disabled={slide === totalSlides}
          >
            Next <ArrowRight size={16} />
          </button>

        </footer>

      </div>
    </div>,
    document.body
  );
}



