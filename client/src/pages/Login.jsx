import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, ShieldCheck } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot Password States
  const [forgotMode, setForgotMode] = useState(false);
  const [resetStep, setResetStep] = useState('email'); // email, otp, success
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

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

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/inventory');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setResetStep('otp');
      setMessage('Password reset code sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setResetStep('success');
      setMessage('Password updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const resetToLogin = () => {
    setForgotMode(false);
    setResetStep('email');
    setError('');
    setMessage('');
    setOtp('');
    setNewPassword('');
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
                <h1>Forgot Password</h1>
                <p>Enter your email to receive a reset code</p>
              </>
            )}
            {resetStep === 'otp' && (
              <>
                <h1>Verify Code</h1>
                <p>Enter the 6-digit code sent to <strong>{email}</strong></p>
              </>
            )}
            {resetStep === 'success' && (
              <>
                <div className="success-icon-large">
                  <ShieldCheck size={48} color="var(--success)" />
                </div>
                <h1>Security Updated</h1>
                <p>Your password has been successfully reset</p>
              </>
            )}
          </header>

          <div className="login-form-container">
            {error && <div className="error-msg">{error}</div>}
            {message && resetStep !== 'success' && <div className="success-msg">{message}</div>}

            {resetStep === 'email' && (
              <form onSubmit={handleRequestOtp} className="login-form">
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                />
                <Button type="submit" className="login-btn" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </Button>
              </form>
            )}

            {resetStep === 'otp' && (
              <form onSubmit={handleResetPassword} className="login-form">
                <Input
                  label="Verification Code"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  required
                />
                <div className="password-input-wrapper">
                  <Input
                    label="New Password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex="-1"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <Button type="submit" className="login-btn" disabled={loading}>
                  {loading ? 'Updating...' : 'Reset Password'}
                </Button>
              </form>
            )}

            {resetStep === 'success' && (
              <Button onClick={resetToLogin} className="login-btn">
                Return to Login
              </Button>
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
          <h1>Welcome Back</h1>
          <p>Sign in to manage your inventory</p>
        </header>

        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="error-msg">{error}</div>}
          {message && <div className="success-msg">{message}</div>}

          <Input
            label="Email Address"
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
            <button type="button" className="forgot-password" onClick={() => setForgotMode(true)}>
              Forgot password?
            </button>
          </div>
          <Button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <footer className="login-footer">
          <p>Don't have an account? <NavLink to="/register">Create one</NavLink></p>
        </footer>
      </div>
    </div>
  );
};

export default Login;
