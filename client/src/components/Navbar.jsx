import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Moon, Sun, FlaskConical, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-logo">
          <FlaskConical size={24} />
          <span>ChemInventory</span>
        </NavLink>
        <div className="navbar-links">
          {user ? (
            user.role === 'admin' ? (
              <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>Admin Panel</NavLink>
            ) : (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
                <NavLink to="/inventory" className={({ isActive }) => isActive ? 'active' : ''}>Inventory</NavLink>
              </>
            )
          ) : (
            <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>Admin Access</NavLink>
          )}
          {!user ? (
            <>
              <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>Login</NavLink>
              <NavLink to="/register" className={({ isActive }) => isActive ? 'active' : ''}>Register</NavLink>
            </>
          ) : (
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          )}
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
