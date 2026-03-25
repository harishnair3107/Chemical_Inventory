import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) {
        // If not logged in, redirect to appropriate login page
        return <Navigate to={role === 'admin' ? '/admin' : '/login'} replace />;
    }

    if (role && user.role !== role) {
        // If logged in but wrong role, redirect to their home dashboard
        return <Navigate to={user.role === 'admin' ? '/admin' : '/inventory'} replace />;
    }

    return children;
};

export default ProtectedRoute;
