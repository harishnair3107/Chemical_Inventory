import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Beaker, AlertTriangle, List, Activity, Clock, LogIn, LogOut, Truck, CreditCard, Menu, IndianRupee, ClipboardList, CheckCircle, XCircle } from 'lucide-react';
import EmployeeSidebar from '../components/EmployeeSidebar';
import Button from '../components/Button';
import '../styles/Dashboard.css';
import '../styles/AdminPortal.css'; 

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const [activities, setActivities] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [statsData, setStatsData] = useState({ total: 0, low: 0, expiring: 0, categories: 0 });
  const [alerts, setAlerts] = useState({ expiringSoon: [], lowStock: [] });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [salesLogs, setSalesLogs] = useState([]);
  const [salesStats, setSalesStats] = useState({ monthly: 0, yearly: 0 });

  useEffect(() => {
    if (user) {
        fetchAllData();
        const interval = setInterval(fetchAllData, 5000);
        return () => clearInterval(interval);
    }
  }, [user]);

  const fetchAllData = () => {
      fetchActivities();
      fetchStats();
      fetchAlerts();
      fetchAttendance();
      fetchTasks();
      fetchSales();
  };

  const fetchStats = async () => {
    try {
        const res = await api.get('/inventory');
        const data = res.data;
        const today = new Date();
        const thirtyDays = new Date();
        thirtyDays.setDate(today.getDate() + 30);
        setStatsData({
            total: data.length,
            low: data.filter(c => c.quantity < 10 && c.quantity > 0).length,
            expiring: data.filter(c => new Date(c.expiryDate) < thirtyDays).length,
            categories: [...new Set(data.map(c => c.category))].length || 0
        });
    } catch (err) {}
  };

  const fetchAlerts = async () => {
    try {
        const res = await api.get('/inventory/alerts');
        setAlerts(res.data);
    } catch (err) {}
  };

  const fetchActivities = async () => {
    try {
      const res = await api.get(`/activity?role=employee&userId=${user.id}`);
      setActivities(res.data);
    } catch (err) {}
  };

  const fetchAttendance = async () => {
    try {
      const res = await api.get(`/attendance?userId=${user.id}`);
      setAttendanceLogs(res.data);
    } catch (err) {}
  };

  const fetchTasks = async () => {
      try {
          const res = await api.get(`/task?assignedTo=${user.id}`);
          setTasks(res.data);
      } catch (err) {}
  };

  const fetchSales = async () => {
      try {
          const [logs, stats] = await Promise.all([
              api.get(`/sales/logs?userId=${user.id}`),
              api.get(`/sales/stats?userId=${user.id}`)
          ]);
          setSalesLogs(logs.data);
          setSalesStats(stats.data);
      } catch (err) {}
  };

  const handleUpdateTaskStatus = async (id, status, revertReason = '') => {
      try {
          await api.patch(`/task/${id}/status`, { status, revertReason, userId: user.id });
          fetchTasks();
      } catch (err) {
          alert('Failed to update task');
      }
  };

  const handleToggleDelivery = async (id, currentValue) => {
    try {
        await api.patch(`/activity/${id}/status`, { isDelivered: !currentValue });
        fetchActivities();
    } catch (err) {}
  };

  const DashboardView = () => {
    const stats = [
        { label: 'Total Chemicals', value: statsData.total, icon: <Beaker size={24} />, color: 'blueviolet' },
        { label: 'Pending Tasks', value: tasks.filter(t => t.status === 'Pending').length, icon: <ClipboardList size={24} />, color: '#3b82f6' },
        { label: 'Low Stock Alerts', value: statsData.low, icon: <AlertTriangle size={24} />, color: '#f59e0b' },
        { label: 'Expiring Soon', value: statsData.expiring, icon: <Clock size={24} />, color: '#ef4444' }
    ];

    return (
        <div className="panel-view">
            <div className="view-header">
                <h2>Welcome back, {user?.username}</h2>
                <p>Here is your inventory overview.</p>
            </div>
            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card" style={{ '--border-color': stat.color, margin: 0, width: '100%' }}>
                        <div className="stat-info">
                            <span className="stat-label">{stat.label}</span>
                            <span className="stat-value">{stat.value}</span>
                        </div>
                        <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>
            <section className="dashboard-alerts">
                <div className="section-header" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <AlertTriangle size={20} />
                    <h2 style={{ margin: 0 }}>Critical Alerts</h2>
                </div>
                <div className="alerts-container">
                    {alerts.expiringSoon?.length === 0 && alerts.lowStock?.length === 0 ? (
                        <p className="no-data" style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>All systems operational. No alerts.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {alerts.expiringSoon?.map(item => (
                                <div key={item._id} className="alert-card-small expiry" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                                    <Clock size={20} />
                                    <span><strong>{item.name}</strong> expiring on {new Date(item.expiryDate).toLocaleDateString()}</span>
                                </div>
                            ))}
                            {alerts.lowStock?.map(item => (
                                <div key={item._id} className="alert-card-small low-stock" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                                    <AlertTriangle size={20} />
                                    <span><strong>{item.name}</strong> is low on stock ({item.quantity} {item.unit})</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
  };

  const SalesView = () => (
      <div className="panel-view">
          <div className="view-header">
              <h2>My Sales Dashboard</h2>
              <p>Track your generated revenue and recorded payments.</p>
          </div>
          
          <div className="admin-stat-card" style={{ maxWidth: '300px', marginBottom: '2rem' }}>
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#10b98120', color: '#10b981' }}>
                  <IndianRupee size={20} />
              </div>
              <div className="stat-content">
                  <span className="stat-label">This Month's Sales</span>
                  <span className="stat-value">₹{salesStats.monthly.toLocaleString()}</span>
              </div>
          </div>

          <div className="sales-logs-section">
              <h3>Recent Sales Transactions</h3>
              {salesLogs.length === 0 ? (
                  <p className="no-data" style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>No sales logs found.</p>
              ) : (
                  <div className="table-responsive" style={{ overflowX: 'auto', backgroundColor: 'var(--bg-primary)', borderRadius: '12px', boxShadow: '0 4px 6px -1px var(--border-color)', marginTop: '1rem' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                                  <th style={{ padding: '1rem' }}>Chemical/Product</th>
                                  <th style={{ padding: '1rem' }}>Quantity</th>
                                  <th style={{ padding: '1rem' }}>Amount</th>
                                  <th style={{ padding: '1rem' }}>Method</th>
                                  <th style={{ padding: '1rem' }}>Status</th>
                                  <th style={{ padding: '1rem' }}>Date</th>
                              </tr>
                          </thead>
                          <tbody>
                              {salesLogs.map(sale => (
                                  <tr key={sale._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                      <td style={{ padding: '1rem', fontWeight: '500' }}>{sale.chemicalName}</td>
                                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{sale.quantity} units</td>
                                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>₹{sale.amount}</td>
                                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{sale.paymentMethod}</td>
                                      <td style={{ padding: '1rem' }}>
                                          <span style={{ 
                                              padding: '0.25rem 0.5rem', 
                                              borderRadius: '999px', 
                                              fontSize: '0.85rem',
                                              backgroundColor: sale.isPaymentReceived ? '#10b98120' : '#f59e0b20', 
                                              color: sale.isPaymentReceived ? '#10b981' : '#f59e0b' 
                                          }}>
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

  const TasksView = () => (
      <div className="panel-view">
          <div className="view-header">
              <h2>Assigned Tasks</h2>
              <p>Manage the requests assigned to you by administrators.</p>
          </div>
          <div className="tasks-container" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tasks.length === 0 ? (
                  <p className="no-data" style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>You have no assigned tasks.</p>
              ) : (
                  tasks.map(task => (
                      <div key={task._id} className="task-card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: '12px', borderLeft: `4px solid ${task.status === 'Completed' ? '#10b981' : task.status === 'Pending' ? '#3b82f6' : task.status === 'Accepted' ? '#f59e0b' : '#ef4444'}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                              <div>
                                  <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{task.title}</h3>
                                  <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>{task.description}</p>
                              </div>
                              <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '500', backgroundColor: 'var(--bg-secondary)' }}>{task.status}</span>
                          </div>
                          
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Activity size={14} /> Date Assigned: {new Date(task.createdAt).toLocaleDateString()}</span>
                          </div>

                          <div className="task-actions" style={{ display: 'flex', gap: '0.75rem' }}>
                              {task.status === 'Pending' && (
                                  <>
                                      <Button onClick={() => handleUpdateTaskStatus(task._id, 'Accepted')}><CheckCircle size={16} /> Accept Task</Button>
                                      <Button variant="outline" onClick={() => {
                                          const reason = window.prompt("Reason for reverting:");
                                          if (reason !== null) handleUpdateTaskStatus(task._id, 'Reverted', reason);
                                      }}><XCircle size={16} /> Revert</Button>
                                  </>
                              )}
                              {task.status === 'Accepted' && (
                                  <Button onClick={() => handleUpdateTaskStatus(task._id, 'Completed')}><CheckCircle size={16} /> Mark Completed</Button>
                              )}
                          </div>
                      </div>
                  ))
              )}
          </div>
      </div>
  );

  const UpdatesView = () => (
      <div className="panel-view">
          <div className="view-header">
              <h2>Your Recent Updates</h2>
              <p>Delivery checkpoints and activity logs.</p>
          </div>
          <div className="activity-list" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activities.length === 0 ? (
                <p className="no-data" style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>No recent activity found.</p>
            ) : (
                activities.map(act => (
                    <div key={act._id} className="activity-item" style={{ backgroundColor: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px var(--border-color)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div className={`activity-dot ${act.action === 'Stock Update' ? 'primary' : 'success'}`} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: act.action === 'Stock Update' ? 'var(--accent-primary)' : '#10b981', marginTop: '6px' }}></div>
                        <div className="activity-content-wrapper" style={{ flex: 1 }}>
                            <div className="activity-main-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <p className="activity-details" style={{ margin: 0, fontWeight: '500', lineHeight: 1.5 }}>{act.details}</p>
                                <span className="activity-time" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', marginLeft: '1rem' }}>{new Date(act.createdAt).toLocaleString()}</span>
                            </div>
                            
                            {act.action === 'Stock Update' && (
                                <div className="activity-status-controls" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <button 
                                        className={`status-chip ${act.isDelivered ? 'active' : ''}`}
                                        onClick={() => handleToggleDelivery(act._id, act.isDelivered)}
                                        title={act.isDelivered ? "Mark as Undelivered" : "Mark as Delivered"}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '999px', border: '1px solid', backgroundColor: act.isDelivered ? '#10b98120' : 'transparent', borderColor: act.isDelivered ? '#10b981' : 'var(--border-color)', color: act.isDelivered ? '#10b981' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
                                    >
                                        <Truck size={14} />
                                        <span>{act.isDelivered ? 'Delivered' : 'Pending Delivery'}</span>
                                    </button>
                                    <button 
                                        className={`status-chip payment ${act.isPaymentReceived ? 'active' : ''}`}
                                        disabled
                                        title="Payment status is managed in Sales or by Admin"
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '999px', border: '1px solid', backgroundColor: act.isPaymentReceived ? '#10b981' : 'transparent', borderColor: act.isPaymentReceived ? '#10b981' : 'var(--border-color)', color: act.isPaymentReceived ? 'white' : 'var(--text-secondary)', cursor: 'not-allowed', opacity: act.isPaymentReceived ? 1 : 0.6 }}
                                    >
                                        <CreditCard size={14} />
                                        <span>{act.isPaymentReceived ? 'Paid (Locked)' : 'Payment Status'}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
          </div>
      </div>
  );

  const AttendanceView = () => (
      <div className="panel-view">
          <div className="view-header">
              <h2>My Login Logs</h2>
              <p>History of your login and logout sessions.</p>
          </div>
          <div className="attendance-logs-section" style={{ marginTop: '1.5rem' }}>
              {attendanceLogs.length === 0 ? (
                  <p className="no-data" style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>No login logs available.</p>
              ) : (
                  <div className="table-responsive" style={{ overflowX: 'auto', backgroundColor: 'var(--bg-primary)', borderRadius: '12px', boxShadow: '0 4px 6px -1px var(--border-color)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                                  <th style={{ padding: '1rem' }}>Activity Type</th>
                                  <th style={{ padding: '1rem' }}>Date</th>
                                  <th style={{ padding: '1rem' }}>Time</th>
                              </tr>
                          </thead>
                          <tbody>
                              {attendanceLogs.map(log => {
                                  const date = new Date(log.createdAt);
                                  return (
                                  <tr key={log._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                                      <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                          <div style={{ backgroundColor: log.action === 'Login' ? '#10b98120' : '#ef444420', color: log.action === 'Login' ? '#10b981' : '#ef4444', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                              {log.action === 'Login' ? <LogIn size={16} /> : <LogOut size={16} />}
                                          </div>
                                          <span style={{ fontWeight: '500', color: log.action === 'Login' ? '#10b981' : '#ef4444' }}>{log.action}</span>
                                      </td>
                                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{date.toLocaleDateString()}</td>
                                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{date.toLocaleTimeString()}</td>
                                  </tr>
                              )})}
                          </tbody>
                      </table>
                  </div>
              )}
          </div>
      </div>
  );

  return (
    <div className={`admin-panel-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <EmployeeSidebar 
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
          <div className="admin-badge" style={{ backgroundColor: '#10b98120', color: '#10b981' }}>
              <Activity size={16} />
              <span>Active Employee Session</span>
          </div>
        </header>

        <div className="admin-page-content">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'sales' && <SalesView />}
          {activeTab === 'tasks' && <TasksView />}
          {activeTab === 'updates' && <UpdatesView />}
          {activeTab === 'attendance' && <AttendanceView />}
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
