import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function StarField() {
  const canvasRef = useRef(null);
  const isAuthPage = typeof window !== 'undefined' && (
    window.location.pathname === '/login' ||
    window.location.pathname === '/register' ||
    window.location.pathname === '/'
  );

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COLORS = [
      [255, 255, 255],
      [255, 240, 160],
      [180, 210, 255],
      [210, 190, 255],
      [160, 255, 210],
    ];

    const stars = Array.from({ length: 140 }, () => {
      const c = COLORS[Math.floor(Math.random() * COLORS.length)];
      return {
        x:    Math.random() * window.innerWidth,
        y:    Math.random() * window.innerHeight,
        size: 0.6 + Math.random() * 2.2,
        vx:   (Math.random() - 0.5) * 0.03,
        vy:   -(0.008 + Math.random() * 0.03),
        alpha: 0.35 + Math.random() * 0.5,
        c,
        cross: Math.random() > 0.6,
      };
    });

    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        s.x += s.vx;
        s.y += s.vy;
        if (s.y < -8)  { s.y = canvas.height + 8; s.x = Math.random() * canvas.width; }
        if (s.x < -8)    s.x = canvas.width + 8;
        if (s.x > canvas.width + 8) s.x = -8;

        const [r, g, b] = s.c;
        const a = s.alpha.toFixed(2);

        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 5);
        grd.addColorStop(0, `rgba(${r},${g},${b},${(s.alpha * 0.3).toFixed(2)})`);
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        if (s.cross) {
          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
          ctx.lineWidth = s.size * 0.6;
          ctx.lineCap = 'round';
          const len = s.size * 3;
          ctx.beginPath(); ctx.moveTo(-len, 0); ctx.lineTo(len, 0); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, -len); ctx.lineTo(0, len); ctx.stroke();
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
          ctx.fill();
        }
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return createPortal(
    <>
      {/* 🌌 Starfield Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
          display: 'block',
        }}
        aria-hidden="true"
      />

      {/* Hide generic static white moon/clouds on login/landing page to allow rich custom art */}
      {!isAuthPage && (
        <>
          {/* 🌕 Global Solid White Full Moon */}
          <div
            style={{
              position: 'fixed',
              top: '7%',
              right: '10%',
              width: 90,
              height: 90,
              borderRadius: '50%',
              background: '#ffffff',
              boxShadow: '0 0 35px rgba(255,255,255,0.9), 0 0 70px rgba(255,255,255,0.4)',
              zIndex: 0,
              pointerEvents: 'none',
              opacity: 0.9
            }}
            aria-hidden="true"
          />

          {/* ☁️ Global Static Fluffy White Clouds Footer */}
          <div
            style={{
              position: 'fixed',
              bottom: -5,
              left: 0,
              width: '100%',
              zIndex: 0,
              pointerEvents: 'none',
              lineHeight: 0,
              opacity: 0.95
            }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 1440 220" style={{ width: '100%', height: 'auto', display: 'block' }}>
              <path
                fill="#ffffff"
                d="M 0,220 
                   L 0,140 
                   Q 30,90 70,120 
                   Q 110,60 170,90 
                   Q 220,50 280,95 
                   Q 340,70 390,110 
                   Q 450,50 510,95 
                   Q 570,80 620,115 
                   Q 680,60 750,105 
                   Q 810,40 880,90 
                   Q 950,50 1010,95 
                   Q 1070,60 1130,110 
                   Q 1190,50 1260,100 
                   Q 1330,70 1390,115 
                   Q 1430,90 1440,120 
                   L 1440,220 Z"
              />
            </svg>
          </div>
        </>
      )}
    </>,
    document.body
  );
}
