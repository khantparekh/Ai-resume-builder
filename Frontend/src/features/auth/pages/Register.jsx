import React, { useState } from 'react';
import '../auth.form.scss';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../hooks/useAuth.js';

const Register = () => {
    const navigate = useNavigate();
    const { loading, handleRegister } = useAuth();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        if (!username || !email || !password) {
            setErrorMsg("Please fill in all fields.");
            return;
        }

        setSubmitting(true);
        try {
            await handleRegister({ username, email, password });
            navigate('/');
        } catch (err) {
            setErrorMsg(err?.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="brand-header">
                    <div className="brand-icon">
                        <span className="material-symbols-outlined filled">insights</span>
                    </div>
                    <h1>Create Account</h1>
                    <p>Join CareerCompat AI to optimize resumes & ace interviews</p>
                </div>

                {errorMsg && (
                    <div className="auth-error">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                        <span>{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Full Name / Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            required
                            placeholder="Alex Morgan"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            placeholder="Minimum 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={submitting || loading}
                    >
                        {submitting ? (
                            <>
                                <span className="material-symbols-outlined">progress_activity</span>
                                Creating Account...
                            </>
                        ) : (
                            <>
                                <span>Get Started</span>
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in here</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;