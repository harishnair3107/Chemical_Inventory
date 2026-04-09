import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Sidebar from '../components/Sidebar';
import InventoryList from './InventoryList';
import AnalyticsView from '../components/AnalyticsView';
import Calendar from '../components/Calendar';
import '../styles/Analytics.css';
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
  ShieldAlert,
  ShieldCheck,
  Info,
  Sliders,
  Mail,
  Users,
  RefreshCw,
  User,
  AlertTriangle,
  IndianRupee,
  ClipboardList
} from 'lucide-react';
import '../styles/AdminPortal.css';

const AdminPortal = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('login'); // login, verify, panel
  const [activeTab, setActiveTab] = useState('dashboard');
  const [requests, setRequests] = useState([]);
  const [activities, setActivities] = useState([]);
  const [alerts, setAlerts] = useState({ lowStock: [], expiringSoon: [], emptyStock: [] });
  const [totalChemicals, setTotalChemicals] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [passRequests, setPassRequests] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employeeActivities, setEmployeeActivities] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('sv-SE'));
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [settings, setSettings] = useState({ lowStockThreshold: 10, expiryAlertDays: 30, adminEmail: 'raunak1718@gmail.com' });
  const [processing, setProcessing] = useState(null);
  const [newPass, setNewPass] = useState('');
  const [note, setNote] = useState('');
  
  const [tasks, setTasks] = useState([]);
  const [salesLogs, setSalesLogs] = useState([]);
  const [salesStats, setSalesStats] = useState({ monthlySales: 0, yearlySales: 0, monthlyProfit: 0, yearlyProfit: 0 });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', deadline: '' });
  const [refreshEnabled, setRefreshEnabled] = useState(true);
  
  const [expenses, setExpenses] = useState([]);
  const [expenseForm, setExpenseForm] = useState({ category: 'Salary', amount: '', date: new Date().toISOString().substring(0, 10), notes: '' });
  
  const now = new Date();
  const [salesMonth, setSalesMonth] = useState(now.getMonth().toString());
  const [salesYear, setSalesYear] = useState(now.getFullYear().toString());
  const [salesPaymentMethod, setSalesPaymentMethod] = useState('All');

  useEffect(() => {
    if (user && user.role === 'admin') {
      setStep('panel');
      fetchSettings();
      fetchRequests();
      fetchPassRequests();
      fetchActivities();
      fetchAlerts();
      fetchStats();
      fetchEmployees();
      fetchAttendance(selectedDate);
      fetchTasks();
      fetchSales();
      fetchExpenses();

      const interval = setInterval(() => {
        if (refreshEnabled && !isUpdating && !processing) {
          fetchRequests();
          fetchPassRequests();
          fetchActivities();
          fetchAlerts();
          fetchStats();
          fetchAttendance(selectedDate);
          fetchTasks();
          fetchSales();
          fetchExpenses();
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [user, selectedDate, salesMonth, salesYear, salesPaymentMethod, refreshEnabled, isUpdating, processing]);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      setSettings(res.data);
    } catch (err) {
      console.error('Failed to fetch settings');
    }
  };

  const handleUpdateSettings = async (e) => {
    if (e) e.preventDefault();
    console.log('UPDATING SETTINGS...', settings);
    setIsUpdating(true);
    try {
      const res = await api.put('/settings', settings);
      setSettings(res.data);
      setHasUnsavedChanges(false);
      alert('Settings synchronized successfully');
      fetchAlerts(); 
    } catch (err) {
      console.error('Update failed:', err);
      alert('Adjustment sync failed');
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchPassRequests = async () => {
    try {
      const res = await api.get('/auth/reset-requests');
      setPassRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch password requests');
    }
  };

  const handleCompletePassReset = async (id, newPassword, adminNote) => {
    try {
      await api.put(`/auth/complete-reset/${id}`, { newPassword, adminNote });
      setPassRequests(passRequests.filter(r => r._id !== id));
      alert('Password updated successfully');
      fetchActivities();
    } catch (err) {
      alert('Failed to update password');
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await api.get('/auth/pending');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch requests');
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await api.get('/activity?role=admin');
      setActivities(res.data);
    } catch (err) {
      console.error('Failed to fetch activities');
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/inventory/alerts');
      setAlerts(res.data);
    } catch (err) {
      console.error('Failed to fetch alerts');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/inventory');
      setTotalChemicals(res.data.length);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/auth/employees');
      setEmployees(res.data);
    } catch (err) {
      console.error('Failed to fetch employees');
    }
  };

  const fetchAttendance = async (date) => {
    if (!date) return;
    try {
      const res = await api.get(`/attendance?date=${date}`);
      setAttendanceLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch attendance');
    }
  };

  const fetchEmployeeLogs = async (userId) => {
    if (!userId) return;
    try {
      const res = await api.get(`/activity?role=employee&userId=${userId}`);
      setEmployeeActivities(res.data);
    } catch (err) {
      console.error('Failed to fetch employee logs');
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get('/task');
      setTasks(res.data);
    } catch(err) {}
  };

  const fetchSales = async () => {
    try {
      const qs = `?month=${salesMonth}&year=${salesYear}&paymentMethod=${salesPaymentMethod}`;
      const [logs, stats] = await Promise.all([
        api.get(`/sales/logs${qs}`),
        api.get(`/sales/stats${qs}`)
      ]);
      setSalesLogs(logs.data);
      setSalesStats(stats.data);
    } catch(err) {}
  };

  const fetchExpenses = async () => {
    try {
       const res = await api.get('/expenses');
       setExpenses(res.data);
    } catch(err) {}
  };

  const handleAddExpense = async (e) => {
      e.preventDefault();
      try {
          await api.post('/expenses', expenseForm);
          setExpenseForm({ category: 'Salary', amount: '', date: new Date().toISOString().substring(0, 10), notes: '' });
          fetchExpenses();
          fetchSales();
          alert('Expense recorded successfully');
      } catch (err) { alert('Failed to record expense'); }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/task', { ...taskForm, assignedTo: taskForm.assignedTo, assignedBy: user.id });
      setTaskForm({ title: '', description: '', assignedTo: '', deadline: '' });
      fetchTasks();
      alert('Task assigned successfully!');
    } catch(err) { alert('Failed to assign task'); }
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
      const res = await api.get('/inventory/report');
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
    setLoading(true);
    try {
      await api.post('/auth/admin/login', { email });
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
      const res = await api.post('/auth/admin/verify', { email, otp });
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
      await api.put(`/auth/approve/${id}`);
      setRequests(requests.filter((req) => req._id !== id));
      fetchActivities(); // Refresh feed immediately
    } catch (err) {
      alert('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.delete(`/auth/reject/${id}`);
      setRequests(requests.filter((req) => req._id !== id));
      fetchActivities();
    } catch (err) {
      alert('Failed to reject');
    }
  };

  const handleRemoveEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to remove this employee? All their activity logs will remain but they will lose access.')) return;
    try {
      await api.delete(`/auth/remove/${id}`);
      setEmployees(employees.filter(emp => emp._id !== id));
      if (selectedEmployee === id) {
        setSelectedEmployee('');
        setEmployeeActivities([]);
      }
      alert('Employee removed successfully');
    } catch (err) {
      alert('Failed to remove employee');
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
            <div className="empty-icon-wrapper">
                <Clock size={48} />
            </div>
            <h3>No Pending Access</h3>
            <p>All employee registration requests have been processed.</p>
          </div>
        ) : (
          <div className="requests-grid">
            {requests.map((req) => (
              <div key={req._id} className="request-card">
                <div className="card-badge">New Request</div>
                <div className="card-body">
                    <div className="user-avatar-main">
                        <User size={32} />
                    </div>
                    <div className="user-info-main">
                        <h4>{req.username}</h4>
                        <p>{req.email}</p>
                        <div className="request-meta">
                            <Clock size={12} />
                            <span>Requested {new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div className="card-actions">
                  <button onClick={() => handleApprove(req._id)} className="action-btn-approve" title="Approve Access">
                    <UserCheck size={18} />
                    <span>Approve</span>
                  </button>
                  <button onClick={() => handleReject(req._id)} className="action-btn-reject" title="Reject Request">
                    <UserX size={18} />
                    <span>Reject</span>
                  </button>
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

  const PassRequestsView = () => {
    return (
      <div className="panel-view">
        <div className="view-header">
          <h2>Password Reset Requests</h2>
          <p>Manually update employee passwords and provide a secure note.</p>
        </div>

        <div className="requests-container">
          {passRequests.length === 0 ? (
            <div className="empty-state">
              <ShieldCheck size={48} />
              <p>No pending password reset requests.</p>
            </div>
          ) : (
            <div className="requests-list">
              {passRequests.map(req => (
                <div key={req._id} className="pass-request-card">
                  <div className="req-user-info">
                    <strong>{req.username}</strong>
                    <span>{req.email}</span>
                    <small>Requested: {new Date(req.createdAt).toLocaleString()}</small>
                  </div>
                  
                  {processing === req._id ? (
                    <div className="req-process-form">
                      <Input 
                        label="New Password" 
                        value={newPass} 
                        onChange={e => setNewPass(e.target.value)}
                        placeholder="Enter secure password"
                      />
                      <Input 
                        label="Note to Employee" 
                        value={note} 
                        onChange={e => setNote(e.target.value)}
                        placeholder="e.g. Please use this for your next login."
                      />
                      <div className="form-actions">
                        <Button onClick={() => handleCompletePassReset(req._id, newPass, note)}>Update & Close</Button>
                        <Button variant="secondary" onClick={() => setProcessing(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button onClick={() => {
                        setProcessing(req._id);
                        setNewPass('User123!'); // Default suggestion
                        setNote('Password has been updated per your request.');
                    }}>
                      <RefreshCw size={16} /> Process Reset
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const NoticeBoardView = () => (
    <div className="panel-view">
      <div className="view-header">
        <h2>System Notice & Maintenance</h2>
        <p>Important information regarding the Chemical Inventory Management System.</p>
      </div>

      <div className="notice-content-card">
        <div className="notice-icon"><Info size={32} /></div>
        <div className="notice-body">
          <h3>Why Nodemailer is Disabled</h3>
          <p>
            We have transitioned from automated email (Nodemailer) to a manual administrative process for the following reasons:
          </p>
          <ul>
            <li><strong>Free Hosting Limitations:</strong> Outbound SMTP traffic (Port 465/587) is often restricted on free tiers of deployment sites like Render to prevent spam.</li>
            <li><strong>Infrastructure Costs:</strong> Reliable automated email services (like SendGrid or high-tier Gmail API) require expensive monthly subscriptions that exceed our current bootstrap budget.</li>
            <li><strong>Reliability:</strong> Manual resets ensure 100% arrival rate as the Admin directly manages the credentials, bypassing common "Spam" folder issues.</li>
          </ul>
          <p className="notice-footer">
            Admin login is now secured via <strong>encrypted password</strong> instead of OTP for the same infrastructure reasons.
          </p>
        </div>
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

  const SettingsView = () => (
    <div className="panel-view">
      <div className="view-header">
        <h2>Advanced System Settings</h2>
        <p>Manage inventory automation, alert thresholds, and security preferences.</p>
      </div>
      
      <div className="settings-grid-layout">
        <div className="settings-module-card">
          <div className="card-icon-header inventory">
            <Package size={24} />
            <h3>Inventory Controls</h3>
          </div>
          <div className="card-content">
            <div className="setting-field">
              <div className="field-label-group">
                <label>Low Stock Alert</label>
                <span className="current-badge">{settings.lowStockThreshold} units</span>
              </div>
              <div className="field-input-wrapper">
                <Sliders size={18} className="field-icon" />
                <input 
                  type="number" 
                  value={settings.lowStockThreshold} 
                  onChange={(e) => {
                      setSettings({...settings, lowStockThreshold: parseInt(e.target.value)});
                      setHasUnsavedChanges(true);
                  }}
                  className="premium-admin-input"
                  min="1"
                />
              </div>
            </div>

            <div className="setting-field">
              <div className="field-label-group">
                <label>Expiry Lead Time</label>
                <span className="current-badge">{settings.expiryAlertDays} days</span>
              </div>
              <div className="field-input-wrapper">
                <Clock size={18} className="field-icon" />
                <input 
                  type="number" 
                  value={settings.expiryAlertDays} 
                  onChange={(e) => {
                      setSettings({...settings, expiryAlertDays: parseInt(e.target.value)});
                      setHasUnsavedChanges(true);
                  }}
                  className="premium-admin-input"
                  min="1"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="settings-module-card">
          <div className="card-icon-header system">
            <Shield size={24} color="var(--accent-primary)" />
            <h3>System Status</h3>
          </div>
          <div className="card-content">
            <div className="setting-field">
              <label>Admin Notification Email</label>
              <div className="field-input-wrapper">
                <Mail size={18} className="field-icon" />
                <input 
                  type="email" 
                  value={settings.adminEmail} 
                  onChange={(e) => {
                      setSettings({...settings, adminEmail: e.target.value});
                      setHasUnsavedChanges(true);
                  }}
                  className="premium-admin-input"
                  disabled
                />
              </div>
              <p className="field-hint">Master email is currently locked to {settings.adminEmail}</p>
            </div>
            
            <div className="status-badge-group" style={{ marginTop: '1.5rem' }}>
              <div className="status-item">
                 <div className="status-dot online"></div>
                 <span>Database: Active</span>
              </div>
              <div className="status-item">
                 <div className="status-dot offline"></div>
                 <span>Nodemailer: Offline</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-footer-actions">
        {hasUnsavedChanges && <span className="unsaved-notice"><AlertTriangle size={16} /> Unsaved changes</span>}
        <Button onClick={handleUpdateSettings} disabled={!hasUnsavedChanges}>Save Changes</Button>
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
        <div className="logs-actions">
          {selectedEmployee && employeeActivities.length > 0 && (
            <Button onClick={downloadEmployeeLogs} className="download-logs-btn">
              <Download size={18} /> Export as CSV
            </Button>
          )}
          {selectedEmployee && (
            <Button 
              variant="danger" 
              onClick={() => handleRemoveEmployee(selectedEmployee)} 
              className="remove-employee-btn"
            >
              <UserX size={18} /> Remove Employee
            </Button>
          )}
        </div>
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

  const SalesView = () => (
      <div className="panel-view">
          <div className="view-header">
              <h2>Global Sales Dashboard</h2>
              <p>Monitor revenue, profits, and sales records across all employees.</p>
          </div>
          
          <div className="sales-filters" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ flex: 1, minWidth: '150px' }}>
                  <label className="input-label" style={{ marginBottom: '0.25rem', display: 'block' }}>Month</label>
                  <select className="input-field" value={salesMonth} onChange={e => setSalesMonth(e.target.value)} style={{ width: '100%', padding: '0.5rem' }}>
                      <option value="0">January</option><option value="1">February</option><option value="2">March</option>
                      <option value="3">April</option><option value="4">May</option><option value="5">June</option>
                      <option value="6">July</option><option value="7">August</option><option value="8">September</option>
                      <option value="9">October</option><option value="10">November</option><option value="11">December</option>
                  </select>
              </div>
              <div style={{ flex: 1, minWidth: '150px' }}>
                  <label className="input-label" style={{ marginBottom: '0.25rem', display: 'block' }}>Year</label>
                  <select className="input-field" value={salesYear} onChange={e => setSalesYear(e.target.value)} style={{ width: '100%', padding: '0.5rem' }}>
                      {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
              </div>
              <div style={{ flex: 1, minWidth: '150px' }}>
                  <label className="input-label" style={{ marginBottom: '0.25rem', display: 'block' }}>Payment Method</label>
                  <select className="input-field" value={salesPaymentMethod} onChange={e => setSalesPaymentMethod(e.target.value)} style={{ width: '100%', padding: '0.5rem' }}>
                      <option value="All">All Methods</option>
                      <option value="UPI">UPI</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                      <option value="N/A">Pending/Not Paid</option>
                  </select>
              </div>
          </div>

          <div className="admin-stats-grid" style={{ marginBottom: '2rem' }}>
              <div className="admin-stat-card">
                  <div className="stat-icon-wrapper" style={{ backgroundColor: '#10b98120', color: '#10b981' }}>
                      <IndianRupee size={20} />
                  </div>
                  <div className="stat-content">
                      <span className="stat-label">Monthly Sales</span>
                      <span className="stat-value">₹{salesStats.monthlySales?.toLocaleString()}</span>
                  </div>
              </div>
              <div className="admin-stat-card">
                  <div className="stat-icon-wrapper" style={{ backgroundColor: '#3b82f620', color: '#3b82f6' }}>
                      <IndianRupee size={20} />
                  </div>
                  <div className="stat-content">
                      <span className="stat-label">Yearly Sales</span>
                      <span className="stat-value">₹{salesStats.yearlySales?.toLocaleString()}</span>
                  </div>
              </div>
              <div className="admin-stat-card" style={{ borderColor: salesStats.monthlyProfit < 0 ? '#ef4444' : 'var(--border-color)' }}>
                  <div className="stat-icon-wrapper" style={{ backgroundColor: salesStats.monthlyProfit < 0 ? '#fee2e2' : '#f0fdf4', color: salesStats.monthlyProfit < 0 ? '#ef4444' : '#166534' }}>
                      <Activity size={20} />
                  </div>
                  <div className="stat-content">
                      <span className="stat-label">Monthly Profit</span>
                      <span className="stat-value" style={{ color: salesStats.monthlyProfit < 0 ? '#ef4444' : 'inherit' }}>
                          {salesStats.monthlyProfit < 0 ? '-' : ''}₹{Math.abs(salesStats.monthlyProfit).toLocaleString()}
                      </span>
                  </div>
              </div>
              <div className="admin-stat-card" style={{ borderColor: salesStats.yearlyProfit < 0 ? '#ef4444' : 'var(--border-color)' }}>
                  <div className="stat-icon-wrapper" style={{ backgroundColor: salesStats.yearlyProfit < 0 ? '#fee2e2' : '#f0fdf4', color: salesStats.yearlyProfit < 0 ? '#ef4444' : '#166534' }}>
                      <Activity size={20} />
                  </div>
                  <div className="stat-content">
                      <span className="stat-label">Yearly Profit</span>
                      <span className="stat-value" style={{ color: salesStats.yearlyProfit < 0 ? '#ef4444' : 'inherit' }}>
                          {salesStats.yearlyProfit < 0 ? '-' : ''}₹{Math.abs(salesStats.yearlyProfit).toLocaleString()}
                      </span>
                  </div>
              </div>
          </div>

          <div className="sales-logs-section">
              <h3>Comprehensive Sales Log</h3>
              {salesLogs.length === 0 ? (
                  <p className="no-data">No sales logs found for this filter.</p>
              ) : (
                  <div className="table-responsive" style={{ overflowX: 'auto', backgroundColor: 'var(--bg-primary)', borderRadius: '12px', marginTop: '1rem' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                                  <th style={{ padding: '1rem' }}>Employee</th>
                                  <th style={{ padding: '1rem' }}>Item</th>
                                  <th style={{ padding: '1rem' }}>Qty</th>
                                  <th style={{ padding: '1rem' }}>Amount</th>
                                  <th style={{ padding: '1rem' }}>Method</th>
                                  <th style={{ padding: '1rem' }}>Status</th>
                                  <th style={{ padding: '1rem' }}>Date</th>
                              </tr>
                          </thead>
                          <tbody>
                              {salesLogs.map(sale => (
                                  <tr key={sale._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                      <td style={{ padding: '1rem', fontWeight: '500' }}>{sale.username}</td>
                                      <td style={{ padding: '1rem' }}>{sale.chemicalName}</td>
                                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{sale.quantity}</td>
                                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>₹{sale.amount}</td>
                                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{sale.paymentMethod}</td>
                                      <td style={{ padding: '1rem' }}>
                                          <span style={{ padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.85rem', backgroundColor: sale.isPaymentReceived ? '#10b98120' : '#f59e0b20', color: sale.isPaymentReceived ? '#10b981' : '#f59e0b' }}>
                                              {sale.isPaymentReceived ? 'Paid' : 'Pending'}
                                          </span>
                                      </td>
                                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{new Date(sale.createdAt).toLocaleDateString()}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              )}
          </div>
      </div>
  );

  const ExpensesView = () => (
      <div className="panel-view">
          <div className="view-header">
              <h2>Expense Tracking</h2>
              <p>Log salaries and bills to accurately calculate business profits.</p>
          </div>
          
          <form onSubmit={handleAddExpense} style={{ backgroundColor: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Record Expense</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label className="input-label" style={{ marginBottom: '0.5rem' }}>Category</label>
                      <select className="input-field" value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                          <option value="Salary">Employee Salary (Monthly)</option>
                          <option value="Electricity">Electricity Bill (Monthly)</option>
                          <option value="Water">Water Bill (Yearly)</option>
                          <option value="Land Tax">Land Tax (Yearly)</option>
                      </select>
                  </div>
                  <div>
                      <Input type="number" label="Amount (₹)" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} required min="0" />
                  </div>
                  <div>
                      <Input type="date" label="Date Applied" value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} required />
                  </div>
                  <div>
                      <Input type="text" label="Notes (Optional)" value={expenseForm.notes} onChange={e => setExpenseForm({...expenseForm, notes: e.target.value})} />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                      <Button type="submit">Add Expense</Button>
                  </div>
              </div>
          </form>

          <div className="expenses-board">
              <h3>Recorded Expenses</h3>
              {expenses.length === 0 ? (
                  <p className="no-data">No expenses recorded yet.</p>
              ) : (
                  <div className="table-responsive" style={{ overflowX: 'auto', backgroundColor: 'var(--bg-primary)', borderRadius: '12px', marginTop: '1rem' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                                  <th style={{ padding: '1rem' }}>Category</th>
                                  <th style={{ padding: '1rem' }}>Amount</th>
                                  <th style={{ padding: '1rem' }}>Date</th>
                                  <th style={{ padding: '1rem' }}>Notes</th>
                              </tr>
                          </thead>
                          <tbody>
                              {expenses.map(exp => (
                                  <tr key={exp._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                      <td style={{ padding: '1rem', fontWeight: '500' }}>{exp.category}</td>
                                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>₹{exp.amount}</td>
                                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{new Date(exp.date).toLocaleDateString()}</td>
                                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{exp.notes || '-'}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              )}
          </div>
      </div>
  );

  const TasksView = () => (
      <div className="panel-view">
          <div className="view-header">
              <h2>Task Management</h2>
              <p>Assign tasks to employees and monitor progress.</p>
          </div>
          
          <form onSubmit={handleAssignTask} className="task-assignment-form" style={{ backgroundColor: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Assign New Task</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input label="Task Title" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} required />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label className="input-label" style={{ marginBottom: '0.5rem' }}>Assign To</label>
                      <select className="input-field" value={taskForm.assignedTo} onChange={e => setTaskForm({...taskForm, assignedTo: e.target.value})} required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                          <option value="">Select Employee</option>
                          {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.username}</option>)}
                      </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                      <label className="input-label" style={{ marginBottom: '0.5rem' }}>Description</label>
                      <textarea className="input-field" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} required style={{ width: '100%', minHeight: '80px', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                  </div>
                  <div>
                      <Input type="date" label="Deadline" value={taskForm.deadline} onChange={e => setTaskForm({...taskForm, deadline: e.target.value})} required />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <Button type="submit" style={{ width: '100%' }}>Assign Task</Button>
                  </div>
              </div>
          </form>

          <div className="tasks-board">
              <h3>All Assigned Tasks</h3>
              {tasks.length === 0 ? (
                  <p className="no-data">No tasks have been assigned yet.</p>
              ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                      {tasks.map(task => (
                          <div key={task._id} className="task-card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: '12px', borderLeft: `4px solid ${task.status === 'Completed' ? '#10b981' : task.status === 'Pending' ? '#3b82f6' : task.status === 'Accepted' ? '#f59e0b' : '#ef4444'}` }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                  <div>
                                      <h3 style={{ margin: 0 }}>{task.title} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>to {task.assignedTo?.username}</span></h3>
                                  </div>
                                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '500', backgroundColor: 'var(--bg-secondary)' }}>{task.status}</span>
                              </div>
                              <p style={{ color: 'var(--text-secondary)' }}>{task.description}</p>
                              {task.revertReason && task.status === 'Reverted' && (
                                  <div style={{ marginTop: '0.5rem', padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '0.9rem' }}>
                                      <strong>Revert Reason:</strong> {task.revertReason}
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>
  );

  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-login-redirect" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem', background: 'var(--bg-primary)' }}>
        <Shield size={64} color="var(--accent-primary)" />
        <h1>Access Restricted</h1>
        <p>Please sign in via the secure portal to access the Admin Panel.</p>
        <Button onClick={() => navigate('/login')}>Return to Login</Button>
      </div>
    );
  }

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
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                className={`refresh-toggle-btn ${refreshEnabled ? 'active' : 'paused'}`}
                onClick={() => setRefreshEnabled(!refreshEnabled)}
                title={refreshEnabled ? "Pause Live Updates" : "Resume Live Updates"}
              >
                {refreshEnabled ? <RefreshCw size={18} className="spin-slow" /> : <RefreshCw size={18} style={{ opacity: 0.5 }} />}
                <span>{refreshEnabled ? 'Live' : 'Paused'}</span>
              </button>
              <div className="admin-badge">
                <Shield size={16} />
                <span>Active Admin Session</span>
              </div>
            </div>
          </header>

          <div className="admin-page-content">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'analytics' && <AnalyticsView />}
            {activeTab === 'inventory' && <InventoryList />}
            {activeTab === 'pass-requests' && <PassRequestsView />}
            {activeTab === 'attendance' && (
              <div className="panel-view">
                <div className="view-header">
                  <h2>Attendance Logs</h2>
                  <p>Monitor employee login and logout activity by date.</p>
                </div>

                <div className="attendance-layout">
                  <div className="attendance-sidebar">
                    <Calendar 
                      selectedDate={selectedDate} 
                      onDateSelect={(date) => setSelectedDate(date.toLocaleDateString('sv-SE'))} 
                    />
                    <div className="selected-date-info">
                        <h3>Selected Date</h3>
                        <p>{new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>

                  <div className="attendance-main">
                    <div className="attendance-feed">
                      {attendanceLogs.length === 0 ? (
                        <div className="empty-state">
                          <Clock size={48} />
                          <p>No login/logout activity found for this date.</p>
                        </div>
                      ) : (
                        attendanceLogs.map((log) => (
                          <div key={log._id} className={`attendance-card ${log.action.toLowerCase()}`}>
                            <div className="log-type-icon">
                                {log.action === 'Login' ? <UserCheck size={20} /> : <UserX size={20} />}
                            </div>
                            <div className="log-info">
                              <h4>{log.username}</h4>
                              <span className="log-action-type">{log.action}</span>
                            </div>
                            <div className="log-time-badge">
                              {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'expenses' && <ExpensesView />}
            {activeTab === 'sales' && <SalesView />}
            {activeTab === 'tasks' && <TasksView />}
            {activeTab === 'requests' && <RequestsView />}
            {activeTab === 'alerts' && <AlertsView />}
            {activeTab === 'employee-logs' && <EmployeeLogsView />}
            {activeTab === 'reports' && <ReportsView />}
            {activeTab === 'notice-board' && <NoticeBoardView />}
            {activeTab === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>
  );
};

export default AdminPortal;
