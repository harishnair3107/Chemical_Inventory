import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Sidebar from '../components/Sidebar';
import InventoryList from './InventoryList';
import { 
  Shield, 
  Clock, 
  UserCheck, 
  UserX, 
  Activity, 
  AlertCircle,
  Menu,
  Bell,
  FileText,
  Download,
  Package,
  CheckCircle,
  AlertTriangle,
  Users
} from 'lucide-react';
import '../styles/AdminPortal.css';

const AdminPortal = () => {
  const { user, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('login'); // login, verify, panel
  const [activeTab, setActiveTab] = useState('dashboard');
  const [requests, setRequests] = useState([]);
  const [activities, setActivities] = useState([]);
  const [alerts, setAlerts] = useState({ lowStock: [], expiringSoon: [], emptyStock: [] });
  const [totalChemicals, setTotalChemicals] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employeeActivities, setEmployeeActivities] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user && user.role === 'admin') {
      setStep('panel');
      fetchRequests();
      fetchActivities();
      fetchAlerts();
      fetchStats();
      fetchEmployees();

      const interval = setInterval(() => {
        fetchRequests();
        fetchActivities();
        fetchAlerts();
        fetchStats();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/pending');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch requests');
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/activity?role=admin');
      setActivities(res.data);
    } catch (err) {
      console.error('Failed to fetch activities');
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/inventory/alerts');
      setAlerts(res.data);
    } catch (err) {
      console.error('Failed to fetch alerts');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/inventory');
      setTotalChemicals(res.data.length);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/employees');
      setEmployees(res.data);
    } catch (err) {
      console.error('Failed to fetch employees');
    }
  };

  const fetchEmployeeLogs = async (userId) => {
    if (!userId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/activity?role=employee&userId=${userId}`);
      setEmployeeActivities(res.data);
    } catch (err) {
      console.error('Failed to fetch employee logs');
    }
  };

  const downloadEmployeeLogs = () => {
    if (employeeActivities.length === 0) return;
    const employee = employees.find(e => e._id === selectedEmployee);
    const csv = [
        ['Action', 'Details', 'Timestamp'],
        ...employeeActivities.map(act => [
            act.action,
            act.details,
            new Date(act.createdAt).toLocaleString()
        ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `logs_${employee?.username || 'employee'}_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
  };

  const handleDownloadReport = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/inventory/report');
      const data = res.data.data;
      const csv = [
        ['Name', 'Formula', 'Quantity', 'Unit', 'Expiry Date', 'Location', 'Status'],
        ...data.map(item => [
          item.name,
          item.formula,
          item.quantity,
          item.unit,
          new Date(item.expiryDate).toLocaleDateString(),
          item.storageLocation,
          item.status
        ])
      ].map(e => e.join(",")).join("\n");

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `inventory_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to generate report');
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (email !== 'harishnair3107@gmail.com') {
      setError('ACCESS DENIED: Internal System Personnel Only');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/admin/login', { email });
      setStep('verify');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/admin/verify', { email, otp });
      login(res.data.user);
      setStep('panel');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/auth/approve/${id}`);
      setRequests(requests.filter((req) => req._id !== id));
      fetchActivities(); // Refresh feed immediately
    } catch (err) {
      alert('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/auth/reject/${id}`);
      setRequests(requests.filter((req) => req._id !== id));
      fetchActivities();
    } catch (err) {
      alert('Failed to reject');
    }
  };

  // Sub-components for Panel Views
  const DashboardView = () => (
    <div className="panel-view">
      <div className="view-header">
        <h2>System Overview</h2>
        <p>Monitor real-time activities across all employees.</p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon-wrapper"><Users size={20} /></div>
          <div className="stat-content">
            <span className="stat-label">Pending Requests</span>
            <span className="stat-value">{requests.length}</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon-wrapper"><Package size={20} /></div>
          <div className="stat-content">
            <span className="stat-label">Total Chemicals</span>
            <span className="stat-value">{totalChemicals}</span>
          </div>
        </div>
        <div className="admin-stat-card warning">
          <div className="stat-icon-wrapper"><AlertTriangle size={20} /></div>
          <div className="stat-content">
            <span className="stat-label">Stock Alerts</span>
            <span className="stat-value">{alerts.lowStock.length + alerts.expiringSoon.length}</span>
          </div>
        </div>
        <div className="admin-stat-card info">
          <div className="stat-icon-wrapper"><Activity size={20} /></div>
          <div className="stat-content">
            <span className="stat-label">Total Activities</span>
            <span className="stat-value">{activities.length}</span>
          </div>
        </div>
      </div>

      <section className="activity-feed-section">
        <h3>Live Activity Feed</h3>
        <div className="activity-feed">
          {activities.length === 0 ? (
            <p className="no-data">No activities recorded yet.</p>
          ) : (
            activities.map((act) => (
              <div key={act._id} className="activity-log">
                <div className="log-icon">
                    <Activity size={16} />
                </div>
                <div className="log-details">
                  <p><strong>{act.username}</strong> ({act.role}): {act.details.replace(act.username, '').trim()}</p>
                  <span className="log-time">{new Date(act.createdAt).toLocaleString()}</span>
                </div>
                <span className={`log-tag ${(act.action || 'Unknown').toLowerCase().replace(' ', '-')}`}>
                    {act.action || 'Unknown'}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );

  const RequestsView = () => (
    <div className="panel-view">
      <div className="view-header">
        <h2>Access Requests</h2>
        <p>Review and approve new employee registrations.</p>
      </div>

      <div className="requests-container">
        {requests.length === 0 ? (
          <div className="empty-state">
            <Clock size={48} />
            <p>No pending requests.</p>
          </div>
        ) : (
          <div className="requests-table">
            {requests.map((req) => (
              <div key={req._id} className="request-row">
                <div className="user-details">
                  <h4>{req.username}</h4>
                  <span>{req.email}</span>
                </div>
                <div className="row-actions">
                  <Button onClick={() => handleApprove(req._id)} className="approve-btn">
                    <UserCheck size={16} /> Approve
                  </Button>
                  <Button onClick={() => handleReject(req._id)} variant="danger" className="reject-btn">
                    <UserX size={16} /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const AlertsView = () => (
    <div className="panel-view">
      <div className="view-header">
        <h2>Stock Alerts</h2>
        <p>Immediate attention required for these items.</p>
      </div>

      <div className="alerts-grid">
        <section className="alert-box danger">
          <h3><AlertCircle size={20} /> Out of Stock (0 Quantity)</h3>
          {alerts.emptyStock.length === 0 ? <p className="no-data">No items are completely out of stock.</p> : (
            <div className="alert-list">
              {alerts.emptyStock.map(item => (
                <div key={item._id} className="alert-item">
                  <span>{item.name}</span>
                  <span className="item-meta">Quantity: 0 {item.unit}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="alert-box danger" style={{ opacity: 0.85 }}>
          <h3><AlertTriangle size={20} /> Low Stock Levels</h3>
          {alerts.lowStock.length === 0 ? <p className="no-data">All stock levels are optimal.</p> : (
            <div className="alert-list">
              {alerts.lowStock.map(item => (
                <div key={item._id} className="alert-item">
                  <span>{item.name}</span>
                  <span className="item-meta">{item.quantity} {item.unit} remaining</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="alert-box warning">
          <h3><Clock size={20} /> Expiring Soon</h3>
          {alerts.expiringSoon.length === 0 ? <p className="no-data">No upcoming expirations.</p> : (
            <div className="alert-list">
              {alerts.expiringSoon.map(item => (
                <div key={item._id} className="alert-item">
                  <span>{item.name}</span>
                  <span className="item-meta">Expires: {new Date(item.expiryDate).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );

  const EmployeeLogsView = () => (
    <div className="panel-view">
      <div className="view-header">
        <h2>Employee Activities</h2>
        <p>Track progress and performance of specific employees.</p>
      </div>

      <div className="logs-control-panel">
        <div className="employee-select-wrapper">
          <label>Select Employee</label>
          <select 
            value={selectedEmployee} 
            onChange={(e) => {
              setSelectedEmployee(e.target.value);
              fetchEmployeeLogs(e.target.value);
            }}
            className="admin-select"
          >
            <option value="">-- Choose an employee --</option>
            {employees.map(emp => (
              <option key={emp._id} value={emp._id}>{emp.username} ({emp.email})</option>
            ))}
          </select>
        </div>
        {selectedEmployee && employeeActivities.length > 0 && (
          <Button onClick={downloadEmployeeLogs} className="download-logs-btn">
            <Download size={18} /> Export as CSV
          </Button>
        )}
      </div>

      <div className="employee-activity-feed">
        {!selectedEmployee ? (
          <div className="empty-state">
            <Users size={48} />
            <p>Select an employee to view their activity history.</p>
          </div>
        ) : employeeActivities.length === 0 ? (
          <p className="no-data">No activities found for this employee.</p>
        ) : (
          employeeActivities.map((act) => (
            <div key={act._id} className="activity-log">
                <div className="log-icon"><Activity size={16} /></div>
                <div className="log-details">
                    <p>{act.details}</p>
                    <span className="log-time">{new Date(act.createdAt).toLocaleString()}</span>
                </div>
                <span className={`log-tag ${(act.action || 'update').toLowerCase().replace(' ', '-')}`}>{act.action || 'Update'}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const ReportsView = () => (
    <div className="panel-view">
      <div className="view-header">
        <h2>System Reports</h2>
        <p>Export comprehensive inventory and activity data.</p>
      </div>

      <div className="reports-container">
        <div className="report-card">
          <div className="report-info">
            <FileText size={40} />
            <div>
              <h3>Inventory Snapshot</h3>
              <p>Current stock levels, formulas, and locations.</p>
            </div>
          </div>
          <Button onClick={handleDownloadReport}>
            <Download size={18} /> Download CSV
          </Button>
        </div>
      </div>
    </div>
  );

  if (step === 'panel') {
    return (
      <div className={`admin-panel-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Sidebar 
          isOpen={sidebarOpen} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          user={user} 
          logout={logout}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <main className="admin-main">
          <header className="admin-top-bar">
            <button className="menu-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={24} />
            </button>
            <div className="top-bar-title" style={{ textTransform: 'capitalize' }}>
              {activeTab.replace('-', ' ')}
            </div>
            <div className="admin-badge">
                <Shield size={16} />
                <span>Secure Session</span>
            </div>
          </header>

          <div className="admin-page-content">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'inventory' && <InventoryList />}
            {activeTab === 'requests' && <RequestsView />}
            {activeTab === 'alerts' && <AlertsView />}
            {activeTab === 'employee-logs' && <EmployeeLogsView />}
            {activeTab === 'reports' && <ReportsView />}
            {activeTab === 'settings' && (
              <div className="panel-view">
                <div className="view-header">
                    <h2>Settings</h2>
                    <p>Configure system-wide parameters and admin preferences.</p>
                </div>
                <div className="placeholder-content">
                    <AlertCircle size={40} />
                    <p>Settings module is under active development.</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-icon">
          <Shield size={48} />
        </div>
        <h1>Admin Vault</h1>
        <p>{step === 'login' ? 'Enter admin email to access secure area' : 'Enter the 6-digit decryption code'}</p>

        {error && <div className="error-msg alert-error">
            <AlertCircle size={18} />
            {error}
        </div>}

        <form onSubmit={step === 'login' ? handleSendOtp : handleVerifyOtp}>
          {step === 'login' ? (
            <Input
              label="Personnel Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. harishnair3107@gmail.com"
              required
            />
          ) : (
            <Input
              label="Decryption Code"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              required
            />
          )}
          <Button type="submit" disabled={loading} className="admin-submit-btn">
            {loading ? 'Processing...' : step === 'login' ? 'Request Access' : 'Authenticate'}
          </Button>
        </form>
        {step === 'verify' && (
          <button className="back-btn" onClick={() => setStep('login')}>Cancel Authorization</button>
        )}
      </div>
    </div>
  );
};

export default AdminPortal;
