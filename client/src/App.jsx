import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Map from './pages/Map';
import Level from './pages/Level';
import Practice from './pages/Practice';
import Exam from './pages/Exam';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Map /></PrivateRoute>} />
      <Route path="/level/:levelId" element={<PrivateRoute><Level /></PrivateRoute>} />
      <Route path="/practice/:topicId" element={<PrivateRoute><Practice /></PrivateRoute>} />
      <Route path="/exam/:levelId" element={<PrivateRoute><Exam /></PrivateRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
