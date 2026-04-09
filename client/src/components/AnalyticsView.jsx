import React, { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { BarChart3, TrendingUp, Calendar, AlertTriangle, IndianRupee, Clock } from 'lucide-react';
import api from '../utils/api';
import '../styles/Analytics.css';

const AnalyticsView = () => {
    const [topSold, setTopSold] = useState([]);
    const [trend, setTrend] = useState([]);
    const [heatmap, setHeatmap] = useState([]);
    const [forecast, setForecast] = useState([]);
    const [profitability, setProfitability] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const [topRes, trendRes, heatmapRes, forecastRes, profitRes] = await Promise.all([
                api.get('/analytics/top-sold'),
                api.get('/analytics/consumption-trend'),
                api.get('/analytics/heatmap'),
                api.get('/analytics/forecast'),
                api.get('/analytics/profitability')
            ]);
            setTopSold(topRes.data);
            setTrend(trendRes.data);
            setHeatmap(heatmapRes.data);
            setForecast(forecastRes.data);
            setProfitability(profitRes.data);
        } catch (error) {
            console.error('Failed to fetch analytics', error);
        } finally {
            setLoading(false);
        }
    };

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const getHeatmapColor = (count) => {
        if (!count) return 'var(--bg-secondary)';
        const opacity = Math.min(count / 10, 1); // Scale based on sales count
        return `rgba(138, 43, 226, ${opacity})`;
    };

    if (loading) return <div className="placeholder-content">Loading analytical data...</div>;

    return (
        <div className="analytics-view">
            <div className="view-header">
                <h2>Inventory Intelligence</h2>
                <p>Advanced metrics and forecasting for chemical assets.</p>
            </div>

            <div className="analytics-grid">
                {/* Top Sold Bar Chart */}
                <div className="chart-card">
                    <h3><BarChart3 size={20} /> Top 10 Most Sold (This Month)</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topSold}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <XAxis dataKey="name" fontSize={12} stroke="var(--text-secondary)" />
                                <YAxis fontSize={12} stroke="var(--text-secondary)" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--accent-primary)' }}
                                />
                                <Bar dataKey="quantity" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Consumption Trend Line Chart */}
                <div className="chart-card">
                    <h3><TrendingUp size={20} /> Consumption Trend (Last 30 Days)</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <XAxis dataKey="date" fontSize={12} stroke="var(--text-secondary)" />
                                <YAxis fontSize={12} stroke="var(--text-secondary)" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="quantity" stroke="var(--accent-primary)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sales Activity Heatmap */}
                <div className="chart-card" style={{ gridColumn: 'span 2' }}>
                    <h3><Clock size={20} /> Sales Activity Heatmap (Day vs Hour)</h3>
                    <div className="heatmap-container">
                        <div className="heatmap-hours">
                            <div className="heatmap-row-label"></div>
                            {hours.map(h => (
                                <div key={h} className="hour-label">{h}h</div>
                            ))}
                        </div>
                        {days.map((day, dIdx) => (
                            <div key={day} className="heatmap-grid">
                                <div className="heatmap-row-label">{day}</div>
                                {hours.map(hour => {
                                    const cell = heatmap.find(h => h.day === dIdx && h.hour === hour);
                                    const count = cell ? cell.count : 0;
                                    return (
                                        <div 
                                            key={hour} 
                                            className="heatmap-cell" 
                                            style={{ backgroundColor: getHeatmapColor(count) }}
                                            title={`${day} ${hour}:00 - ${count} sales`}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stock Forecast Table */}
                <div className="chart-card" style={{ gridColumn: 'span 2' }}>
                    <h3><Calendar size={20} /> Stock Exhaustion Forecast</h3>
                    <div className="forecast-table-container">
                        <table className="analytics-table">
                            <thead>
                                <tr>
                                    <th>Chemical Name</th>
                                    <th>Current Stock</th>
                                    <th>Avg Daily Usage</th>
                                    <th>Est. Days Left</th>
                                    <th>Predicted Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {forecast.map((f, i) => (
                                    <tr key={i}>
                                        <td><strong>{f.name}</strong></td>
                                        <td>{f.currentQuantity} {f.unit}</td>
                                        <td>{f.avgDailyConsumption} {f.unit}/day</td>
                                        <td>
                                            <span className={`days-left-badge ${
                                                f.daysUntilEmpty === 'N/A' ? '' : 
                                                f.daysUntilEmpty <= 7 ? 'danger' : 
                                                f.daysUntilEmpty <= 21 ? 'warning' : 'safe'
                                            }`}>
                                                {f.daysUntilEmpty} {typeof f.daysUntilEmpty === 'number' ? 'days' : ''}
                                            </span>
                                        </td>
                                        <td>{f.predictedDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Profitability Ranking */}
                <div className="chart-card" style={{ gridColumn: 'span 2' }}>
                    <h3><IndianRupee size={20} /> Most Profitable Chemicals (Revenue)</h3>
                    <div className="profitability-list">
                        {profitability.slice(0, 5).map((p, i) => (
                            <div key={i} className="profit-item">
                                <div className="profit-rank">{i + 1}</div>
                                <div className="profit-name">{p.name}</div>
                                <div className="profit-value">₹{p.revenue.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsView;
