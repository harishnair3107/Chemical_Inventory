import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../components/Button';
import { UserCheck, UserX, Clock } from 'lucide-react';
import '../styles/AdminRequests.css';

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/pending');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/auth/approve/${id}`);
      setRequests(requests.filter(req => req._id !== id));
    } catch (err) {
      alert('Failed to approve employee');
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/auth/reject/${id}`);
      setRequests(requests.filter(req => req._id !== id));
    } catch (err) {
      alert('Failed to reject employee');
    }
  };

  if (loading) return <div className="loading">Loading requests...</div>;

  return (
    <div className="page admin-requests">
      <header className="page-header">
        <h1>Registration Requests</h1>
        <p>Review and manage employee access requests.</p>
      </header>

      <div className="requests-container">
        {requests.length === 0 ? (
          <div className="empty-state">
            <Clock size={48} />
            <p>No pending requests at the moment.</p>
          </div>
        ) : (
          <div className="requests-grid">
            {requests.map((req) => (
              <div key={req._id} className="request-card">
                <div className="user-info">
                  <h3>{req.username}</h3>
                  <p>{req.email}</p>
                </div>
                <div className="request-actions">
                  <Button onClick={() => handleApprove(req._id)} variant="primary" className="approve-btn">
                    <UserCheck size={18} /> Approve
                  </Button>
                  <Button onClick={() => handleReject(req._id)} variant="danger" className="reject-btn">
                    <UserX size={18} /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRequests;
