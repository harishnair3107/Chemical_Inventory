import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Sidebar from '../components/Sidebar';
import InventoryList from './InventoryList';
import Calendar from '../components/Calendar';
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
  Users,
  User,
  Save,
  RefreshCw,
  Mail,
  ShieldCheck,
  Sliders
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('sv-SE'));
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [settings, setSettings] = useState({ lowStockThreshold: 10, expiryAlertDays: 30, adminEmail: 'harishnair3107@gmail.com' });

  useEffect(() => {
    if (user && user.role === 'admin') {
      setStep('panel');
      fetchSettings();
      fetchRequests();
      fetchActivities();
      fetchAlerts();
      fetchStats();
      fetchEmployees();
      fetchAttendance(selectedDate);

      const interval = setInterval(() => {
        fetchRequests();
        fetchActivities();
        fetchAlerts();
        fetchStats();
        fetchAttendance(selectedDate);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [user, selectedDate]);

  const fetchSettings = async () => {
    try {
      const res = await api.get('settings');
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
      const res = await api.put('settings', settings);
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

  const handleTestEmail = async () => {
    console.log('TESTING EMAIL TO:', settings.adminEmail);
    setLoading(true);
    try {
      await api.post('settings/test-mail', { email: settings.adminEmail });
      alert('Test success: A diagnostic code has been dispatched to ' + settings.adminEmail);
    } catch (err) {
      console.error('Test email failed:', err);
      alert('Diagnostic failure: Please check your SMTP credentials');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await api.get('auth/pending');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch requests');
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await api.get('activity?role=admin');
      setActivities(res.data);
    } catch (err) {
      console.error('Failed to fetch activities');
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await api.get('inventory/alerts');
      setAlerts(res.data);
    } catch (err) {
      console.error('Failed to fetch alerts');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('inventory');
      setTotalChemicals(res.data.length);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('auth/employees');
      setEmployees(res.data);
    } catch (err) {
      console.error('Failed to fetch employees');
    }
  };

  const fetchAttendance = async (date) => {
    if (!date) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/attendance?date=${date}`);
      setAttendanceLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch attendance');
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
      const res = await api.get('inventory/report');
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
      await api.post('auth/admin/login', { email });
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
      const res = await api.post('auth/admin/verify', { email, otp });
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

  const handleRemoveEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to remove this employee? All their activity logs will remain but they will lose access.')) return;
    try {
      await axios.delete(`http://localhost:5000/api/auth/remove/${id}`);
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
            {activeTab === 'requests' && <RequestsView />}
            {activeTab === 'alerts' && <AlertsView />}
            {activeTab === 'employee-logs' && <EmployeeLogsView />}
            {activeTab === 'reports' && <ReportsView />}
            {activeTab === 'settings' && (
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
                        <p className="field-hint">A primary notification will trigger when stock dips below this limit.</p>
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
                        <p className="field-hint">Defines how many days prior to expiry a warning is generated.</p>
                      </div>
                    </div>
                  </div>

                  <div className="settings-module-card">
                    <div className="card-icon-header system">
                      <ShieldCheck size={24} />
                      <h3>System Core</h3>
                    </div>
                    <div className="card-content">
                      <div className="setting-field">
                        <div className="field-label-group">
                          <label>Administrative Email</label>
                        </div>
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
                            placeholder="admin@gspl.com"
                            required
                          />
                        </div>
                        <p className="field-hint">The secure address for OTP verification and system-level alerts.</p>
                      </div>

                      <div className="smtp-verification">
                        <h4>SMTP Health Check</h4>
                        <p>Verify that your mail server is active and able to send codes.</p>
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={handleTestEmail}
                            disabled={loading}
                            className="test-btn"
                        >
                          {loading ? <RefreshCw className="animate-spin" size={16} /> : <Activity size={16} />}
                          <span>Execute Diagnostic Email</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="settings-footer-actions">
                  {hasUnsavedChanges && (
                    <div className="unsaved-notice">
                      <AlertTriangle size={16} />
                      <span>You have unsaved adjustments.</span>
                    </div>
                  )}
                  <Button 
                    onClick={handleUpdateSettings} 
                    disabled={isUpdating || !hasUnsavedChanges} 
                    variant="primary"
                    className="save-settings-btn"
                  >
                    {isUpdating ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                    <span>{isUpdating ? 'Synchronizing...' : 'Save Configuration'}</span>
                  </Button>
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
              placeholder={`e.g. ${settings.adminEmail}`}
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
