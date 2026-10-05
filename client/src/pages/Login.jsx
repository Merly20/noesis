import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Noesis</h1>
        <p>Master Data Structures & Algorithms</p>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input 
              type="text" 
              placeholder="Username" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
            />
          )}
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="keycap-btn">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <p onClick={() => setIsLogin(!isLogin)} className="toggle-mode">
          {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
        </p>
      </div>
    </div>
  );
}
