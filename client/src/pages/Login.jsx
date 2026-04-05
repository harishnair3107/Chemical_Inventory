import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, ShieldCheck, User, Settings } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Forgot Password States
  const [forgotMode, setForgotMode] = useState(false);
  const [resetStep, setResetStep] = useState('email'); // email, success
  const [resetStatus, setResetStatus] = useState(null);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const loginPath = isAdmin ? '/auth/admin/login' : '/auth/login';

    try {
      const res = await api.post(loginPath, { email, password });
      login(res.data.user);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/inventory');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setResetStep('success');
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset request');
    } finally {
      setLoading(false);
    }
  };

  const checkResetStatus = async () => {
    if (!email) return setError('Enter your email to check status');
    setError('');
    setLoading(true);
    try {
      // We need to fetch user first to get ID, or just use email endpoint
      // For simplicity, we'll assume the backend can search by email or we just use a generic message
      setMessage("Please contact your Admin directly for status if you haven't seen an update.");
    } catch (err) {
      setError('Could not fetch status.');
    } finally {
      setLoading(false);
    }
  };

  const resetToLogin = () => {
    setForgotMode(false);
    setResetStep('email');
    setError('');
    setMessage('');
  };

  if (forgotMode) {
    return (
      <div className="login-container">
        <div className="login-card">
          <header className="login-header">
            <button className="back-to-login" onClick={resetToLogin}>
              <ArrowLeft size={18} />
              <span>Back to Login</span>
            </button>
            {resetStep === 'email' && (
              <>
                <h1>Request Password Reset</h1>
                <p>Your request will be sent to the Admin for manual processing</p>
              </>
            )}
            {resetStep === 'success' && (
              <>
                <div className="success-icon-large">
                  <ShieldCheck size={48} color="var(--success)" />
                </div>
                <h1>Request Received</h1>
                <p>{message}</p>
              </>
            )}
          </header>

          <div className="login-form-container">
            {error && <div className="error-msg">{error}</div>}
            
            {resetStep === 'email' && (
              <form onSubmit={handleRequestReset} className="login-form">
                <Input
                  label="Registered Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                />
                <Button type="submit" className="login-btn" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Request to Admin'}
                </Button>
                <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <p>Note: Automated emails are disabled for security and performance. The Admin will update your password manually.</p>
                </div>
              </form>
            )}

            {resetStep === 'success' && (
              <div style={{ textAlign: 'center' }}>
                <div className="info-box" style={{ background: 'rgba(52, 152, 219, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    <p><strong>Next Phase:</strong> The Admin will log your request and provide a new password. Speak to your supervisor or Admin for the new credentials.</p>
                </div>
                <Button onClick={resetToLogin} className="login-btn">
                  Return to Login
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <header className="login-header">
          <div className="login-badge">
             {isAdmin ? <Settings size={16} /> : <User size={16} />}
             <span>{isAdmin ? 'Admin Portal' : 'Employee Portal'}</span>
          </div>
          <h1>{isAdmin ? 'Admin Sign In' : 'Welcome Back'}</h1>
          <p>Sign in to manage your inventory</p>
        </header>

        <div className="login-toggle">
            <button 
                className={!isAdmin ? 'active' : ''} 
                onClick={() => setIsAdmin(false)}
            >Employee</button>
            <button 
                className={isAdmin ? 'active' : ''} 
                onClick={() => setIsAdmin(true)}
            >Admin</button>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="error-msg">{error}</div>}
          {message && <div className="success-msg">{message}</div>}

          <Input
            label={isAdmin ? "Admin Email" : "Employee Email"}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
          />
          
          <div className="password-input-wrapper">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button 
              type="button" 
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex="-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            {!isAdmin && (
                <button type="button" className="forgot-password" onClick={() => setForgotMode(true)}>
                Forgot password?
                </button>
            )}
          </div>
          <Button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Authenticating...' : (isAdmin ? 'Admin Login' : 'Sign In')}
          </Button>
        </form>

        <footer className="login-footer">
          {!isAdmin && <p>Don't have an account? <NavLink to="/register">Create one</NavLink></p>}
          {isAdmin && <p>Admin credential issues? Contact IT Support.</p>}
        </footer>
      </div>
    </div>
  );
};

export default Login;
