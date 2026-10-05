import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore.js';
import { ToastProvider } from './components/layout/Toast.jsx';
import Navbar from './components/layout/Navbar.jsx';
import StarField from './components/StarField.jsx';

// Pages
import LoginPage    from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LevelMapPage from './pages/LevelMapPage.jsx';
import LevelPage    from './pages/LevelPage.jsx';
import LearnPage    from './pages/LearnPage.jsx';
import PracticePage from './pages/PracticePage.jsx';
import SolvePage    from './pages/SolvePage.jsx';
import ExamPage     from './pages/ExamPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import ProgressPage from './pages/ProgressPage.jsx';
import AdminPage    from './pages/AdminPage.jsx';
import SandboxPage  from './pages/SandboxPage.jsx';
import DSADashboardPage from './pages/DSADashboardPage.jsx';
import ExplanationPage from './pages/ExplanationPage.jsx';

// Route guards
const PrivateRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/levels" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? <Navigate to="/levels" replace /> : children;
};

// Page transition wrapper
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-enter">
      <Routes location={location}>
        {/* Guest-only */}
        <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* Protected */}
        <Route path="/levels"                element={<PrivateRoute><LevelMapPage /></PrivateRoute>} />
        <Route path="/levels/:levelId"       element={<PrivateRoute><LevelPage /></PrivateRoute>} />
        <Route path="/topics/:topicId/learn" element={<PrivateRoute><LearnPage /></PrivateRoute>} />
        <Route path="/topics/:topicId/practice" element={<PrivateRoute><PracticePage /></PrivateRoute>} />
        <Route path="/topics/:topicId/solve" element={<PrivateRoute><SolvePage /></PrivateRoute>} />
        <Route path="/levels/:levelId/exam"  element={<PrivateRoute><ExamPage /></PrivateRoute>} />
        <Route path="/leaderboard"           element={<PrivateRoute><LeaderboardPage /></PrivateRoute>} />
        <Route path="/progress"              element={<PrivateRoute><ProgressPage /></PrivateRoute>} />
        {/* Public — free memory space, usable without login */}
        <Route path="/sandbox"               element={<SandboxPage />} />
        <Route path="/dashboard"             element={<DSADashboardPage />} />
        <Route path="/explanation"           element={<ExplanationPage />} />
        <Route path="/admin"                 element={<AdminRoute><AdminPage /></AdminRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/levels" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  const { fetchMe } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <BrowserRouter>
      <ToastProvider>
        {/* Star canvas — fixed, behind everything */}
        <StarField />
        {/* App shell — transparent so dark navy body + stars show */}
        <div style={{
          display: 'flex', flexDirection: 'column', minHeight: '100vh',
          position: 'relative', zIndex: 1, background: 'transparent',
        }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <AnimatedRoutes />
          </main>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}
