import React from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, ArrowRight, ArrowLeft } from 'lucide-react';
import './LoginPage.css';
import NightScene from '../components/NightScene.jsx';
import { useAuthStore } from '../store/authStore.js';

function TopNav() {
  return (
    <header className="nz-nav">
      <nav className="nz-links">
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
      <p className="nz-sub">Sandbox Mode</p>

      <div className="nz-tag">
        <p className="nz-tag-1">explore freely</p>
        <p className="nz-tag-2">without an <b>account</b></p>
        <svg className="nz-swoosh" viewBox="0 0 300 14" preserveAspectRatio="none">
          <path d="M 2 10 Q 150 0 298 6" stroke="rgba(220,210,255,0.7)" strokeWidth="1.4" fill="none" />
        </svg>
      </div>
    </section>
  );
}

export default function SandboxPage() {
  const navigate = useNavigate();
  const { user, guestLogin } = useAuthStore();

  return createPortal(
    <div className="nz-page">
      <NightScene />
      <div className="nz-content">
        <TopNav />
        <main className="nz-main">
          <Hero />
          <motion.div
            className="nz-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            <div className="nz-head">
              <h2>Use Without Login</h2>
              <p>Explore Noesis features as a guest. Your progress will not be saved.</p>
            </div>
            
            <div style={{ marginTop: '2rem' }}>
              <button 
                type="button" 
                className="nz-btn-primary" 
                onClick={() => {
                  guestLogin();
                  navigate('/dashboard');
                }}
              >
                <Rocket size={17} style={{ marginRight: '8px' }}/> 
                Start Exploring <ArrowRight size={16} className="nz-arrow" />
              </button>
            </div>
            
            <div className="nz-or">or</div>

            <button type="button" className="nz-btn-ghost" onClick={() => navigate('/login')}>
              <ArrowLeft size={17} style={{ marginRight: '8px' }}/> Go back to Login
            </button>

          </motion.div>
        </main>
      </div>
    </div>,
    document.body
  );
}
