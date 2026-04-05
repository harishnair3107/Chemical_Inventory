import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus,
  Package, 
  Settings, 
  LogOut, 
  X,
  UserCircle,
  AlertTriangle,
  FileText,
  BarChart3,
  Clock,
  ShieldAlert,
  Info
} from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar, user, logout, activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const adminLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'inventory', label: 'Inventory Management', icon: <Package size={20} /> },
    { id: 'requests', label: 'Access Requests', icon: <UserPlus size={20} /> },
    { id: 'pass-requests', label: 'Password Requests', icon: <ShieldAlert size={20} /> },
    { id: 'attendance', label: 'Attendance Logs', icon: <Clock size={20} /> },
    { id: 'alerts', label: 'Stock Alerts', icon: <AlertTriangle size={20} /> },
    { id: 'employee-logs', label: 'Employee Logs', icon: <FileText size={20} /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} /> },
    { id: 'notice-board', label: 'System Notice', icon: <Info size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="admin-brand">
          <div className="brand-icon">A</div>
          <span>Admin Panel</span>
        </div>
        <button className="mobile-close" onClick={toggleSidebar}>
          <X size={24} />
        </button>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">
          <UserCircle size={40} />
        </div>
        <div className="user-info">
          <p className="user-name">{user?.username}</p>
          <p className="user-role">System Administrator</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {adminLinks.map((link) => (
          <button
            key={link.id}
            className={`nav-link ${activeTab === link.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(link.id);
              if (window.innerWidth < 1024) toggleSidebar();
            }}
          >
            {link.icon}
            <span>{link.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
