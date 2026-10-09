import React, { useState } from 'react';
import '../auth.form.scss';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../hooks/useAuth.js';

const Login = () => {
    const navigate = useNavigate();
    const { loading, handleLogin } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        if (!email || !password) {
            setErrorMsg("Please enter both email and password.");
            return;
        }

        setSubmitting(true);
        try {
            await handleLogin({ email, password });
            navigate('/');
        } catch (err) {
            setErrorMsg(err?.response?.data?.message || "Invalid credentials. Please try again.");
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
                    <h1>CareerCompat AI</h1>
                    <p>Sign in to access your resume analytics & AI mock interviews</p>
                </div>

                {errorMsg && (
                    <div className="auth-error">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                        <span>{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Work or Personal Email</label>
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
                            placeholder="••••••••"
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
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                Signing in...
                            </>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/register">Create an account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;