import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Moon, Sun, FlaskConical, LogOut, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-logo" onClick={closeMenu}>
          <FlaskConical size={24} />
          <span>ChemInventory</span>
        </NavLink>

        <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`navbar-links ${isOpen ? 'show' : ''}`}>
          {user ? (
            user.role === 'admin' ? (
              <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>Admin Panel</NavLink>
            ) : (
              <>
                <NavLink to="/inventory" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>Inventory</NavLink>
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>Dashboard</NavLink>
              </>
            )
          ) : (
            <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>Admin Access</NavLink>
          )}
          {!user ? (
            <>
              <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>Login</NavLink>
              <NavLink to="/register" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>Register</NavLink>
            </>
          ) : (
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          )}
          <button 
            onClick={() => {
              toggleTheme();
              closeMenu();
            }} 
            className="theme-toggle"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
