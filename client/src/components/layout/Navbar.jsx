import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useSoundStore } from '../../store/soundStore.js';

const NAV_LINKS = [
  { to: '/levels',      label: '🗺️ Levels'   },
  { to: '/sandbox',     label: '🧪 Sandbox'  },
  { to: '/leaderboard', label: '🏆 Ranks'    },
  { to: '/progress',    label: '📈 Progress' },
];

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { muted, toggle: toggleMute, play } = useSoundStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [points, setPoints] = useState(user?.points ?? 0);
  const prevPoints = useRef(points);
  const [bump, setBump] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Animate points pill on change
  useEffect(() => {
    if (user?.points !== undefined && user.points !== prevPoints.current) {
      prevPoints.current = user.points;
      setPoints(user.points);
      setBump(true);
      setTimeout(() => setBump(false), 600);
    } else if (user?.points !== undefined) {
      setPoints(user.points);
    }
  }, [user?.points]);

  const handleLogout = () => {
    play('click');
    logout();
    navigate('/');
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/levels" className="nav-logo" onClick={() => play('click')}>
          <div className="nav-logo-icon">N</div>
          <span>NOESIS</span>
        </Link>

        {/* Desktop nav links */}
        <ul className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', listStyle: 'none' }}>
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={`nav-link ${isActive(to) ? 'active' : ''}`}
                onClick={() => play('click')}
              >
                {label}
              </Link>
            </li>
          ))}
          {user.role === 'admin' && (
            <li>
              <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`} onClick={() => play('click')}
                style={{ color: 'var(--coral)', fontWeight: 800 }}>
                ⚙️ Admin
              </Link>
            </li>
          )}
        </ul>

        {/* Right side */}
        <div className="nav-right">
          {/* Points pill */}
          <div
            className="points-pill"
            style={{ transition: 'transform 0.2s', transform: bump ? 'scale(1.15)' : 'scale(1)' }}
          >
            ⚡ {points.toLocaleString()} pts
          </div>

          {/* User greeting */}
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)' }}>
            {user.username}
          </span>

          {/* Mute toggle */}
          <button
            className="mute-btn"
            onClick={() => { toggleMute(); }}
            aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? '🔇' : '🔊'}
          </button>

          {/* Logout */}
          <button
            className="keycap keycap-ghost keycap-sm"
            onClick={handleLogout}
            style={{ color: 'var(--coral)', borderColor: 'var(--coral-l)' }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
