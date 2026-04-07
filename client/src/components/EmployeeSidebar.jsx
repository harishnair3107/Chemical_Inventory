import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  Clock,
  Settings, 
  LogOut, 
  X,
  UserCircle,
  ClipboardList,
  IndianRupee
} from 'lucide-react';
import '../styles/Sidebar.css';

const EmployeeSidebar = ({ isOpen, toggleSidebar, user, logout, activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const employeeLinks = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'sales', label: 'My Sales', icon: <IndianRupee size={20} /> },
    { id: 'tasks', label: 'Assigned Tasks', icon: <ClipboardList size={20} /> },
    { id: 'updates', label: 'My Updates', icon: <Activity size={20} /> },
    { id: 'attendance', label: 'Login Logs', icon: <Clock size={20} /> },
  ];

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="admin-brand">
          <div className="brand-icon">E</div>
          <span>Employee Panel</span>
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
          <p className="user-role">Staff Member</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {employeeLinks.map((link) => (
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

export default EmployeeSidebar;
