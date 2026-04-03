import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [adminEmail, setAdminEmail] = useState('harishnair3107@gmail.com');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminEmail = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/settings');
        setAdminEmail(res.data.adminEmail);
      } catch (err) {
        console.error('Failed to fetch admin email');
      }
    };
    fetchAdminEmail();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { username, email, password });
      setMessage(res.data.message);
      if (email === adminEmail) {
          setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <header className="login-header">
          <h1>Create Account</h1>
          <p>Join the Chemical Inventory Management System</p>
        </header>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-msg">{error}</div>}
          {message && <div className="success-msg">{message}</div>}
          
           {!message && (
            <>
              <Input
                label="Full Name"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="John Doe"
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Button type="submit" className="login-btn">Register</Button>
            </>
          )}
        </form>

        <footer className="login-footer">
          <p>Already have an account? <NavLink to="/login">Sign In</NavLink></p>
        </footer>
      </div>
    </div>
  );
};

export default Register;
