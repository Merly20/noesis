import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Eye, EyeOff, Rocket, Mail, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { toast } from '../components/layout/Toast.jsx';
import './LoginPage.css';
import NightScene from '../components/NightScene.jsx';
/* ─────────────────────────────────────────────────────────────
   Foreground UI
   ───────────────────────────────────────────────────────────── */

function LogoIcon({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="15" cy="17" r="7" stroke="#fff" strokeWidth="1.6" />
      <ellipse cx="15" cy="17" rx="13" ry="4.5" stroke="#fff" strokeWidth="1.4" transform="rotate(-20 15 17)" />
      <path d="M26 3 L27 6 L30 7 L27 8 L26 11 L25 8 L22 7 L25 6 Z" fill="#fff" />
    </svg>
  );
}

function TopNav() {
  return (
    <header className="nz-nav">
      <Link to="/login" className="nz-pill">
        <LogoIcon />
        <span className="nz-pill-brand">Noesis</span>
      </Link>
      <nav className="nz-pill nz-links">
        <Link to="/login">Home</Link>
        <Link to="/levels">Learn</Link>
        <a href="#about">About</a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="nz-hero">
      <div className="nz-title-wrap">
        {/* orbit ring around the title */}
        <svg className="nz-orbit" viewBox="0 0 400 160" preserveAspectRatio="none">
          <path
            d="M 60 118 C -10 95, 10 40, 120 22 C 230 5, 360 15, 395 45"
            stroke="rgba(255,255,255,0.75)" strokeWidth="1.4" fill="none"
          />
          <path d="M 44 112 L 48 120 L 56 124 L 48 128 L 44 136 L 40 128 L 32 124 L 40 120 Z" fill="#fff" />
        </svg>
        <h1 className="nz-title">Noesis</h1>
        <svg className="nz-spark" viewBox="0 0 24 24">
          <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill="#fff" />
        </svg>
      </div>
      <p className="nz-sub">DSA Discovery Lab</p>

      <div className="nz-tag">
        <p className="nz-tag-1">from pattern learning</p>
        <p className="nz-tag-2">to <b>pattern</b> <em>discovery</em></p>
        <svg className="nz-swoosh" viewBox="0 0 300 14" preserveAspectRatio="none">
          <path d="M 2 10 Q 150 0 298 6" stroke="rgba(220,210,255,0.7)" strokeWidth="1.4" fill="none" />
        </svg>
      </div>
    </section>
  );
}

function Field({ icon: Icon, error, children, trailing }) {
  return (
    <>
      <div className={`nz-field ${error ? 'err' : ''}`}>
        <Icon size={17} className="nz-ico" />
        {children}
        {trailing}
      </div>
      {error && <span className="nz-err">{error}</span>}
    </>
  );
}

function LoginCard({ defaultTab }) {
  const { login, register, loading } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState(defaultTab);
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [lf, setLf] = useState({ name: '', password: '' });
  const [sf, setSf] = useState({ username: '', email: '', password: '' });

  const switchTab = (t) => { setTab(t); setErrors({}); setShowPw(false); };

  const onLogin = async (e) => {
    e.preventDefault();
    const er = {};
    if (!lf.name.trim()) er.name = 'Please enter your name';
    if (!lf.password) er.password = 'Please enter your password';
    setErrors(er);
    if (Object.keys(er).length) return;
    const res = await login(lf.name.trim(), lf.password);
    if (res.success) { toast.success('Welcome back! 🌙'); navigate('/levels'); }
    else toast.error(res.error || 'Login failed');
  };

  const onSignup = async (e) => {
    e.preventDefault();
    const er = {};
    if (sf.username.trim().length < 3) er.username = 'At least 3 characters';
    if (!/\S+@\S+\.\S+/.test(sf.email)) er.email = 'Enter a valid email';
    if (sf.password.length < 6) er.password = 'At least 6 characters';
    setErrors(er);
    if (Object.keys(er).length) return;
    const res = await register(sf.username.trim(), sf.email.trim(), sf.password);
    if (res.success) { toast.success('Account created! ✨'); navigate('/levels'); }
    else toast.error(res.error || 'Sign up failed');
  };

  const eye = (
    <button type="button" className="nz-eye" onClick={() => setShowPw((v) => !v)}
      aria-label={showPw ? 'Hide password' : 'Show password'}>
      {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
    </button>
  );

  return (
    <motion.div
      className="nz-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
    >
      <div className="nz-tabs" role="tablist">
        {[['login', 'Login'], ['signup', 'Sign Up']].map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k}
            className={`nz-tab ${tab === k ? 'active' : ''}`} onClick={() => switchTab(k)}>
            {label}
            {tab === k && <motion.span layoutId="nz-tab-bar" className="nz-tab-bar" transition={{ duration: 0.35 }} />}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="nz-head">
            <h2>{tab === 'login' ? 'Welcome Back!' : 'Create Account'}</h2>
            <p>{tab === 'login' ? 'Continue your Noesis journey' : 'Begin your Noesis journey'}</p>
          </div>

          {tab === 'login' ? (
            <form className="nz-form" onSubmit={onLogin} noValidate>
              <Field icon={User} error={errors.name}>
                <input placeholder="Enter your name" autoComplete="username"
                  value={lf.name} onChange={(e) => setLf({ ...lf, name: e.target.value })} />
              </Field>
              <Field icon={Lock} error={errors.password} trailing={eye}>
                <input type={showPw ? 'text' : 'password'} placeholder="Enter your password"
                  autoComplete="current-password"
                  value={lf.password} onChange={(e) => setLf({ ...lf, password: e.target.value })} />
              </Field>
              <button type="submit" className="nz-btn-primary" disabled={loading}>
                {loading ? 'Logging in…' : <>Login <ArrowRight size={16} className="nz-arrow" /></>}
              </button>
            </form>
          ) : (
            <form className="nz-form" onSubmit={onSignup} noValidate>
              <Field icon={User} error={errors.username}>
                <input placeholder="Enter your name" autoComplete="username"
                  value={sf.username} onChange={(e) => setSf({ ...sf, username: e.target.value })} />
              </Field>
              <Field icon={Mail} error={errors.email}>
                <input type="email" placeholder="Enter your email" autoComplete="email"
                  value={sf.email} onChange={(e) => setSf({ ...sf, email: e.target.value })} />
              </Field>
              <Field icon={Lock} error={errors.password} trailing={eye}>
                <input type={showPw ? 'text' : 'password'} placeholder="Create a password"
                  autoComplete="new-password"
                  value={sf.password} onChange={(e) => setSf({ ...sf, password: e.target.value })} />
              </Field>
              <button type="submit" className="nz-btn-primary" disabled={loading}>
                {loading ? 'Creating…' : <>Sign Up <ArrowRight size={16} className="nz-arrow" /></>}
              </button>
            </form>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="nz-or">or</div>

      <button type="button" className="nz-btn-ghost" onClick={() => navigate('/sandbox')}>
        <Rocket size={17} /> Use Without Login
      </button>

      <p className="nz-note">
        Explore and play without an account.<br />
        Your progress won't be saved.
      </p>
    </motion.div>
  );
}

export default function LoginPage({ defaultTab = 'login' }) {
  // Portal to <body>: the route wrapper uses a CSS transform, which would
  // otherwise turn our position:fixed full-screen layers into wrapper-relative ones.
  return createPortal(
    <div className="nz-page">
      <NightScene />
      <div className="nz-content">
        <TopNav />
        <main className="nz-main">
          <Hero />
          <LoginCard defaultTab={defaultTab} />
        </main>
      </div>
    </div>,
    document.body
  );
}
