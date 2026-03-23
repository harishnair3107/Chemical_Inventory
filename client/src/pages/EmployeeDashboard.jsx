import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Beaker, AlertTriangle, List, Activity, Clock } from 'lucide-react';
import '../styles/Dashboard.css';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [statsData, setStatsData] = useState({ total: 0, low: 0, expiring: 0, categories: 0 });
  const [alerts, setAlerts] = useState({ expiringSoon: [], lowStock: [] });

  useEffect(() => {
    if (user) {
        fetchActivities();
        fetchStats();
        fetchAlerts();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
        const res = await axios.get('http://localhost:5000/api/inventory');
        const data = res.data;
        const today = new Date();
        const thirtyDays = new Date();
        thirtyDays.setDate(today.getDate() + 30);

        setStatsData({
            total: data.length,
            low: data.filter(c => c.quantity < 10).length,
            expiring: data.filter(c => new Date(c.expiryDate) < thirtyDays).length,
            categories: [...new Set(data.map(c => c.category))].length || 0
        });
    } catch (err) {
        console.error('Failed to fetch stats');
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

  const fetchActivities = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/activity?role=employee&userId=${user._id}`);
      setActivities(res.data);
    } catch (err) {
      console.error('Failed to fetch activities');
    }
  };

  const stats = [
    { label: 'Total Chemicals', value: statsData.total, icon: <Beaker size={24} />, color: 'blueviolet' },
    { label: 'Low Stock Alerts', value: statsData.low, icon: <AlertTriangle size={24} />, color: '#f59e0b' },
    { label: 'Expiring Soon', value: statsData.expiring, icon: <Clock size={24} />, color: '#ef4444' },
    { label: 'Total Categories', value: statsData.categories, icon: <List size={24} />, color: '#10b981' },
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Employee Dashboard</h1>
        <p>Welcome back, {user?.username}. Here is your inventory overview.</p>
      </header>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ '--border-color': stat.color }}>
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

      <div className="dashboard-sections">
        <section className="recent-activity">
          <div className="section-header">
            <Activity size={20} />
            <h2>Your Recent Activity</h2>
          </div>
          <div className="activity-list">
            {activities.length === 0 ? (
                <p className="no-data">No recent activity found.</p>
            ) : (
                activities.map(act => (
                    <div key={act._id} className="activity-item">
                        <div className="activity-dot"></div>
                        <p>{act.details}</p>
                        <span>{new Date(act.createdAt).toLocaleString()}</span>
                    </div>
                ))
            )}
          </div>
        </section>

        <section className="dashboard-alerts">
            <div className="section-header">
                <AlertTriangle size={20} />
                <h2>Critical Alerts</h2>
            </div>
            <div className="alerts-container">
                {alerts.expiringSoon.length === 0 && alerts.lowStock.length === 0 ? (
                    <p className="no-data">All systems operational. No alerts.</p>
                ) : (
                    <>
                        {alerts.expiringSoon.map(item => (
                            <div key={item._id} className="alert-card-small expiry">
                                <Clock size={16} />
                                <span>{item.name} expiring on {new Date(item.expiryDate).toLocaleDateString()}</span>
                            </div>
                        ))}
                        {alerts.lowStock.map(item => (
                            <div key={item._id} className="alert-card-small low-stock">
                                <AlertTriangle size={16} />
                                <span>{item.name} is low on stock ({item.quantity} {item.unit})</span>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </section>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
