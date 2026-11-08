import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../auth/hooks/useAuth.js';
import './Navbar.scss';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, handleLogout } = useAuth();
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const isActive = (path) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const onLogout = async () => {
        setUserMenuOpen(false);
        await handleLogout();
        navigate('/login');
    };

    const getUserDisplayName = () => {
        if (!user) return 'User';
        if (user.username) return user.username;
        if (user.email) return user.email.split('@')[0];
        return 'Professional';
    };

    const getUserInitial = () => {
        const name = getUserDisplayName();
        return name.charAt(0).toUpperCase();
    };

    return (
        <header className="navbar-container">
            <div className="navbar-inner">
                {/* Brand Logo & Name */}
                <div className="brand-group">
                    <Link to="/dashboard" className="navbar-brand">
                        <div className="brand-logo-badge">
                            <span className="material-symbols-outlined filled">insights</span>
                        </div>
                        <div className="brand-text">
                            <span className="brand-title">CareerCompat AI</span>
                            <span className="brand-subtitle">Resume & Mock Interview</span>
                        </div>
                    </Link>
                </div>

                {/* Main Navigation Links */}
                <nav className="navbar-nav" aria-label="Primary Navigation">
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
                        <span className="material-symbols-outlined">query_stats</span>
                        <span>Compatibility Scan</span>
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
                        <span>Mock Interview</span>
                    </Link>
                </nav>

                {/* Right Action & User Controls */}
                <div className="navbar-right">
                    <Link to="/setup" className="btn-quick-scan">
                        <span className="material-symbols-outlined">add</span>
                        <span>New Scan</span>
                    </Link>

                    <div className="nav-divider"></div>

                    {user && (
                        <div className="user-dropdown-container">
                            <button
                                type="button"
                                className="user-profile-trigger"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                aria-expanded={userMenuOpen}
                                title={user.email}
                            >
                                <div className="user-avatar-badge">
                                    {getUserInitial()}
                                </div>
                                <div className="user-info-text">
                                    <span className="user-name">{getUserDisplayName()}</span>
                                    <span className="user-role">Candidate</span>
                                </div>
                                <span className="material-symbols-outlined chevron">
                                    {userMenuOpen ? 'expand_less' : 'expand_more'}
                                </span>
                            </button>

                            {userMenuOpen && (
                                <div className="user-dropdown-menu animate-fade-in">
                                    <div className="menu-header">
                                        <p className="menu-user-name">{getUserDisplayName()}</p>
                                        <p className="menu-user-email">{user.email || 'Account'}</p>
                                    </div>
                                    <div className="menu-divider"></div>
                                    <Link
                                        to="/dashboard"
                                        className="menu-item"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        <span className="material-symbols-outlined">dashboard</span>
                                        <span>My Reports & Scans</span>
                                    </Link>
                                    <Link
                                        to="/ats-studio"
                                        className="menu-item"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        <span className="material-symbols-outlined">description</span>
                                        <span>ATS Resume Studio</span>
                                    </Link>
                                    <div className="menu-divider"></div>
                                    <button
                                        type="button"
                                        onClick={onLogout}
                                        className="menu-item logout"
                                    >
                                        <span className="material-symbols-outlined">logout</span>
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
