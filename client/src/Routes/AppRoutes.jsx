import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import EmployeeDashboard from '../pages/EmployeeDashboard';
import InventoryList from '../pages/InventoryList';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AdminPortal from '../pages/AdminPortal';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminPortal />} />

            {/* Protected Employee Routes */}
            <Route path="/dashboard" element={
                <ProtectedRoute role="employee">
                    <EmployeeDashboard />
                </ProtectedRoute>
            } />
            <Route path="/inventory" element={
                <ProtectedRoute role="employee">
                    <InventoryList />
                </ProtectedRoute>
            } />

            {/* Default Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
