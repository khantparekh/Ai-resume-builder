import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../auth/hooks/useAuth.js';
import './Navbar.scss';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, handleLogout } = useAuth();

    const isActive = (path) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const onLogout = async () => {
        await handleLogout();
        navigate('/login');
    };

    return (
        <header className="navbar-container">
            <div className="navbar-inner">
                {/* Brand Logo */}
                <Link to="/dashboard" className="navbar-brand">
                    <div className="brand-logo-badge">
                        <span className="material-symbols-outlined filled">insights</span>
                    </div>
                    <div className="brand-text">
                        <span className="brand-title">CareerCompat AI</span>
                        <span className="brand-subtitle">Resume & Mock Interview</span>
                    </div>
                </Link>

                {/* Main Navigation Links */}
                <nav className="navbar-nav">
                    <Link
                        to="/dashboard"
                        className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
                    >
                        <span className="material-symbols-outlined">dashboard</span>
                        <span>Dashboard</span>
                    </Link>

                    <Link
                        to="/setup"
                        className={`nav-item ${isActive('/setup') ? 'active' : ''}`}
                    >
                        <span className="material-symbols-outlined">analytics</span>
                        <span>New Analysis</span>
                    </Link>

                    <Link
                        to="/ats-studio"
                        className={`nav-item ${isActive('/ats-studio') ? 'active' : ''}`}
                    >
                        <span className="material-symbols-outlined">document_scanner</span>
                        <span>ATS Studio</span>
                    </Link>

                    <Link
                        to="/mock-interview"
                        className={`nav-item ${isActive('/mock-interview') ? 'active' : ''}`}
                    >
                        <span className="material-symbols-outlined">mic</span>
                        <span>AI Mock Interview</span>
                    </Link>
                </nav>

                {/* User Section */}
                <div className="navbar-user">
                    {user && (
                        <div className="user-profile-badge">
                            <div className="user-avatar">
                                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span className="user-name">{user.username || user.email}</span>
                        </div>
                    )}
                    <button
                        onClick={onLogout}
                        className="btn-logout"
                        title="Sign Out"
                    >
                        <span className="material-symbols-outlined">logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
