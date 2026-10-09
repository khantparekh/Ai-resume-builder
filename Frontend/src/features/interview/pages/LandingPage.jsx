import React from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../auth/hooks/useAuth.js';
import ScoreRing from '../components/ScoreRing.jsx';
import './LandingPage.scss';

const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="landing-page animate-fade-in">
            {/* Top Navigation Bar */}
            <header className="landing-header">
                <div className="landing-header-inner">
                    <Link to="/" className="landing-brand">
                        <div className="brand-logo-badge">
                            <span className="material-symbols-outlined filled">insights</span>
                        </div>
                        <div className="brand-text">
                            <span className="brand-title">CareerCompat AI</span>
                            <span className="brand-subtitle">Career Intelligence</span>
                        </div>
                    </Link>

                    <nav className="landing-nav-links">
                        <a href="#features" className="nav-link">Features</a>
                        <a href="#how-it-works" className="nav-link">How It Works</a>
                        <a href="#interview" className="nav-link">AI Interview</a>
                        <a href="#ats-studio" className="nav-link">ATS Studio</a>
                    </nav>

                    <div className="landing-header-actions">
                        {user ? (
                            <Link to="/dashboard" className="btn btn-primary btn-sm">
                                <span className="material-symbols-outlined">dashboard</span>
                                <span>Go to Dashboard</span>
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-outline btn-sm">
                                    <span>Sign In</span>
                                </Link>
                                <Link to="/register" className="btn btn-primary btn-sm">
                                    <span>Get Started</span>
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="landing-hero-section">
                <div className="landing-hero-container">
                    <div className="hero-text-col">
                        <div className="hero-badge">
                            <span className="material-symbols-outlined filled text-sm">verified</span>
                            <span>AI-DRIVEN PRECISION</span>
                        </div>

                        <h1 className="hero-heading">
                            Surgical Precision for Your Career Growth
                        </h1>

                        <p className="hero-description">
                            Leverage advanced neural analysis powered by Google Gemini to dissect job requirements and optimize your professional identity. Bridge skill gaps, beat ATS screeners, and master interviews with objective, data-backed insights.
                        </p>

                        <div className="hero-cta-group">
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={() => navigate(user ? '/setup' : '/register')}
                            >
                                <span className="material-symbols-outlined">upload_file</span>
                                <span>Upload Resume & Match</span>
                            </button>

                            <button
                                className="btn btn-outline btn-lg"
                                onClick={() => navigate(user ? '/dashboard' : '/login')}
                            >
                                <span className="material-symbols-outlined">play_circle</span>
                                <span>{user ? 'View Dashboard' : 'Explore Platform'}</span>
                            </button>
                        </div>

                        <div className="hero-stats-row">
                            <div className="stat-item">
                                <span className="stat-value">98%</span>
                                <span className="stat-label">ATS Parse Rate</span>
                            </div>
                            <div className="stat-divider" />
                            <div className="stat-item">
                                <span className="stat-value">6x</span>
                                <span className="stat-label">Interview Pass Rate</span>
                            </div>
                            <div className="stat-divider" />
                            <div className="stat-item">
                                <span className="stat-value">3.8</span>
                                <span className="stat-label">Gemini Powered</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Hero Visual Card */}
                    <div className="hero-visual-col">
                        <div className="hero-glow-blob" />
                        <div className="hero-glass-card card">
                            <div className="glass-card-header">
                                <div className="glass-card-title">
                                    <span className="material-symbols-outlined filled icon-teal">analytics</span>
                                    <span>Compatibility Scan</span>
                                </div>
                                <div className="window-dots">
                                    <span className="dot dot-red" />
                                    <span className="dot dot-amber" />
                                    <span className="dot dot-teal" />
                                </div>
                            </div>

                            <div className="glass-scan-role">
                                <h3>Senior Full Stack Architect</h3>
                                <p>Target: Cloud-native distributed systems</p>
                            </div>

                            <div className="pulse-scan-visual">
                                <div className="pulse-line line-1" />
                                <div className="pulse-line line-2" />
                                <div className="pulse-line line-3" />
                            </div>

                            <div className="skill-tags-cloud">
                                <span className="skill-tag matched">React Architecture</span>
                                <span className="skill-tag matched">Node Microservices</span>
                                <span className="skill-tag matched">AWS Cloud</span>
                                <span className="skill-tag gap">Docker / K8s</span>
                            </div>

                            <div className="hero-score-preview">
                                <div className="score-preview-text">
                                    <span className="score-lbl">COMPATIBILITY SCORE</span>
                                    <span className="score-val">94%</span>
                                </div>
                                <span className="material-symbols-outlined filled score-check-icon">task_alt</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof Bar */}
            <section className="proof-bar-section">
                <div className="proof-container">
                    <p className="proof-title">Trusted by ambitious candidates applying to world-class teams</p>
                    <div className="proof-logos">
                        <div className="proof-item"><span className="material-symbols-outlined">api</span> NEXUS</div>
                        <div className="proof-item"><span className="material-symbols-outlined">data_thresholding</span> DATAFLOW</div>
                        <div className="proof-item"><span className="material-symbols-outlined">cloud_done</span> STRATUS</div>
                        <div className="proof-item"><span className="material-symbols-outlined">blur_on</span> VORTEX</div>
                        <div className="proof-item"><span className="material-symbols-outlined">layers</span> STACKED</div>
                    </div>
                </div>
            </section>

            {/* Feature Grid Section */}
            <section id="features" className="features-section">
                <div className="features-container">
                    <div className="section-head text-center">
                        <span className="badge badge-success">PLATFORM CAPABILITIES</span>
                        <h2>Intelligence in Every Step</h2>
                        <p>Complete end-to-end guidance from initial resume scan to the final technical round.</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-box card">
                            <div className="feature-box-icon teal-bg">
                                <span className="material-symbols-outlined">analytics</span>
                            </div>
                            <h3>Precision Score Match</h3>
                            <p>Proprietary semantic matching compares your experience directly against target Job Descriptions, uncovering exact alignment percentages.</p>
                        </div>

                        <div className="feature-box card">
                            <div className="feature-box-icon amber-bg">
                                <span className="material-symbols-outlined">extension</span>
                            </div>
                            <h3>Bridge Skill Gaps</h3>
                            <p>Instant prioritization of missing tools and domain knowledge with high, medium, and low severity rankings plus direct study recommendations.</p>
                        </div>

                        <div className="feature-box card">
                            <div className="feature-box-icon indigo-bg">
                                <span className="material-symbols-outlined">document_scanner</span>
                            </div>
                            <h3>ATS Resume Studio</h3>
                            <p>Discover missing keywords, transform bullets with the Google X-Y-Z formula, and export a ready-to-use ATS-compliant resume markdown draft.</p>
                        </div>

                        <div className="feature-box card">
                            <div className="feature-box-icon dark-bg">
                                <span className="material-symbols-outlined">mic</span>
                            </div>
                            <h3>AI Mock Interview</h3>
                            <p>Interactive 6-question simulation covering technical deep dives, resume projects, and behavioral STAR questions with voice input and grading.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Deep Dive AI Interview Feature Showcase */}
            <section id="interview" className="showcase-section">
                <div className="showcase-container card">
                    <div className="showcase-glow" />
                    <div className="showcase-content">
                        <span className="badge badge-warning">AI BAR RAISER SIMULATOR</span>
                        <h2>Master the Interview Before It Happens</h2>
                        <p>
                            CareerCompat AI doesn't just proofread your resume; it simulates your future interviewer. Experience realistic pressure, practice aloud with speech-to-text, and receive honest bar-raiser evaluations.
                        </p>

                        <ul className="showcase-benefits-list">
                            <li>
                                <span className="material-symbols-outlined filled icon-teal">check_circle</span>
                                <div>
                                    <strong>STAR Method Behavioral Coaching:</strong>
                                    <span> Evaluates your answers on Situation, Task, Action, and Quantified Result.</span>
                                </div>
                            </li>
                            <li>
                                <span className="material-symbols-outlined filled icon-teal">check_circle</span>
                                <div>
                                    <strong>Role-Specific Technical Drill-Downs:</strong>
                                    <span> Real architectural trade-offs, edge cases, and design choices.</span>
                                </div>
                            </li>
                            <li>
                                <span className="material-symbols-outlined filled icon-teal">check_circle</span>
                                <div>
                                    <strong>Masterclass Exemplar Answers:</strong>
                                    <span> Read ideal model answers demonstrating how staff engineers and senior leaders respond.</span>
                                </div>
                            </li>
                        </ul>

                        <div className="showcase-cta">
                            <button
                                className="btn btn-secondary btn-lg"
                                onClick={() => navigate(user ? '/mock-interview' : '/register')}
                            >
                                <span className="material-symbols-outlined filled">mic</span>
                                <span>Try AI Mock Interview</span>
                            </button>
                        </div>
                    </div>

                    <div className="showcase-visual-preview">
                        <div className="mock-q-bubble card">
                            <div className="q-bubble-header">
                                <span className="badge badge-success">TECHNICAL QUESTION #1</span>
                                <span className="material-symbols-outlined filled icon-mic">volume_up</span>
                            </div>
                            <p className="q-bubble-text">
                                "How do you handle state normalization and avoid unnecessary re-renders in large-scale React systems?"
                            </p>
                            <div className="score-mini-banner">
                                <span>Scored 92% • Strong Hire</span>
                                <span className="material-symbols-outlined filled text-sm">stars</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="how-section">
                <div className="how-container">
                    <div className="section-head text-center">
                        <span className="badge badge-neutral">STEP-BY-STEP</span>
                        <h2>How CareerCompat AI Works</h2>
                        <p>Three straightforward steps to maximize your chances of getting hired.</p>
                    </div>

                    <div className="how-steps-grid">
                        <div className="step-card card">
                            <div className="step-num-badge">01</div>
                            <h3>Upload & Target</h3>
                            <p>Upload your PDF resume or paste raw text. Paste the target job posting to initiate neural semantic comparison.</p>
                        </div>

                        <div className="step-card card">
                            <div className="step-num-badge">02</div>
                            <h3>Analyze & Optimize</h3>
                            <p>Review match score, examine prioritized skill gaps, and access ATS keyword enhancements in the ATS Studio.</p>
                        </div>

                        <div className="step-card card">
                            <div className="step-num-badge">03</div>
                            <h3>Practice & Ace</h3>
                            <p>Launch the interactive AI Mock Interview, respond via voice or typing, and get graded on every response with exemplar solutions.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom Call to Action Banner */}
            <section className="cta-banner-section">
                <div className="cta-banner-card card">
                    <h2>Ready to Land Your Dream Role?</h2>
                    <p>Stop guessing why recruiters pass on your application. Get data-backed precision today.</p>
                    <div className="cta-buttons-wrap">
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={() => navigate(user ? '/setup' : '/register')}
                        >
                            <span>Start Free Analysis</span>
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-inner">
                    <div className="footer-brand-wrap">
                        <div className="brand-logo-badge">
                            <span className="material-symbols-outlined filled">insights</span>
                        </div>
                        <span className="footer-brand-title">CareerCompat AI</span>
                    </div>
                    <p className="footer-copy">© {new Date().getFullYear()} CareerCompat AI. Precision career intelligence powered by Gemini.</p>
                    <div className="footer-links">
                        <Link to="/login">Sign In</Link>
                        <Link to="/register">Create Account</Link>
                        <a href="#features">Features</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
