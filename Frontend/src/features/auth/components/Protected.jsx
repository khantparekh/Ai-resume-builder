import React from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { Navigate } from 'react-router';
import Navbar from '../../interview/components/Navbar.jsx';

const Protected = ({ children }) => {
    const { loading, user } = useAuth();

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                backgroundColor: 'var(--surface)'
            }}>
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: '40px', color: 'var(--secondary)' }}>
                    progress_activity
                </span>
                <p style={{ color: 'var(--on-surface-variant)', fontWeight: 600 }}>Loading CareerCompat AI...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default Protected;