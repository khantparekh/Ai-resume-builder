import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { getReports, getMockSessions, deleteReport } from '../services/interview.api.js';
import ScoreRing from '../components/ScoreRing.jsx';
import './Dashboard.scss';

const Dashboard = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [reportsRes, sessionsRes] = await Promise.allSettled([
                getReports(),
                getMockSessions()
            ]);

            if (reportsRes.status === 'fulfilled' && reportsRes.value?.data) {
                setReports(reportsRes.value.data);
            }
            if (sessionsRes.status === 'fulfilled' && sessionsRes.value?.data) {
                setSessions(sessionsRes.value.data);
            }
        } catch (err) {
            console.error("Dashboard data load error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this report?")) {
            try {
                await deleteReport(id);
                setReports(prev => prev.filter(r => r._id !== id));
            } catch (err) {
                alert("Failed to delete report.");
            }
        }
    };

    // Calculate metrics
    const totalReports = reports.length;
    const avgScore = totalReports > 0
        ? Math.round(reports.reduce((acc, curr) => acc + (curr.matchScore || 0), 0) / totalReports)
        : 0;
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const avgInterviewScore = completedSessions.length > 0
        ? Math.round(completedSessions.reduce((acc, curr) => acc + (curr.overallEvaluation?.overallScore || 0), 0) / completedSessions.length)
        : 0;

    return (
        <div className="dashboard-page animate-fade-in">
            {/* Top Welcome Banner */}
            <div className="dashboard-hero">
                <div className="hero-text">
                    <h1>Career Intelligence Hub</h1>
                    <p>Track your job description compatibility, ATS resume readiness, and practice AI mock interviews.</p>
                </div>
                <div className="hero-actions">
                    <Link to="/setup" className="btn btn-primary btn-lg">
                        <span className="material-symbols-outlined filled">add_circle</span>
                        <span>New Resume Scan</span>
                    </Link>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon-wrapper primary-icon">
                        <span className="material-symbols-outlined">analytics</span>
                    </div>
                    <div className="stat-data">
                        <span className="stat-value">{totalReports}</span>
                        <span className="stat-label">Reports Analyzed</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper secondary-icon">
                        <span className="material-symbols-outlined">stars</span>
                    </div>
                    <div className="stat-data">
                        <span className="stat-value">{avgScore}%</span>
                        <span className="stat-label">Average Match Score</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper interview-icon">
                        <span className="material-symbols-outlined">record_voice_over</span>
                    </div>
                    <div className="stat-data">
                        <span className="stat-value">{completedSessions.length}</span>
                        <span className="stat-label">AI Interviews Completed</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper ats-icon">
                        <span className="material-symbols-outlined">auto_awesome</span>
                    </div>
                    <div className="stat-data">
                        <span className="stat-value">{avgInterviewScore ? `${avgInterviewScore}%` : 'N/A'}</span>
                        <span className="stat-label">Average Interview Score</span>
                    </div>
                </div>
            </div>

            {/* Quick Action Feature Cards */}
            <div className="feature-cards-grid">
                <div className="feature-card" onClick={() => navigate('/setup')}>
                    <div className="feature-badge">Scan & Match</div>
                    <div className="feature-icon">
                        <span className="material-symbols-outlined filled">upload_file</span>
                    </div>
                    <h3>Resume vs JD Matcher</h3>
                    <p>Compare resume with target job descriptions to identify exact skill gaps and high-yield interview questions.</p>
                    <div className="feature-cta">
                        <span>Start Scan</span>
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </div>
                </div>

                <div className="feature-card" onClick={() => navigate('/ats-studio')}>
                    <div className="feature-badge">ATS Optimizer</div>
                    <div className="feature-icon ats-bg">
                        <span className="material-symbols-outlined filled">document_scanner</span>
                    </div>
                    <h3>ATS Resume Studio</h3>
                    <p>Get keyword additions, metric-focused bullet points, and an updated ATS-compliant resume markdown draft.</p>
                    <div className="feature-cta">
                        <span>Optimize Resume</span>
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </div>
                </div>

                <div className="feature-card" onClick={() => navigate('/mock-interview')}>
                    <div className="feature-badge">AI Simulator</div>
                    <div className="feature-icon interview-bg">
                        <span className="material-symbols-outlined filled">mic</span>
                    </div>
                    <h3>AI Mock Interview</h3>
                    <p>Practice technical, resume-based, and behavioral questions with instant speech input and deep AI performance scoring.</p>
                    <div className="feature-cta">
                        <span>Launch Interview</span>
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </div>
                </div>
            </div>

            {/* Recent Reports Section */}
            <div className="section-block">
                <div className="section-header">
                    <div className="section-title-wrap">
                        <span className="material-symbols-outlined filled">history_edu</span>
                        <h2>Recent Analysis Reports</h2>
                    </div>
                    {reports.length > 0 && (
                        <span className="badge badge-neutral">{reports.length} Reports Saved</span>
                    )}
                </div>

                {loading ? (
                    <div className="loading-placeholder">
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        <p>Loading your career analytics...</p>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="empty-state-card">
                        <div className="empty-icon">
                            <span className="material-symbols-outlined">description</span>
                        </div>
                        <h3>No analysis reports yet</h3>
                        <p>Upload a resume and job description to get your match score, ATS suggestions, and prep plan.</p>
                        <Link to="/setup" className="btn btn-primary">
                            Run Your First Analysis
                        </Link>
                    </div>
                ) : (
                    <div className="reports-grid">
                        {reports.map((report) => (
                            <div
                                key={report._id}
                                className="report-card card card-interactive"
                                onClick={() => navigate(`/report/${report._id}`)}
                            >
                                <div className="report-card-top">
                                    <div className="score-ring-compact">
                                        <ScoreRing
                                            score={report.matchScore}
                                            size={72}
                                            strokeWidth={7}
                                            label="MATCH"
                                        />
                                    </div>
                                    <div className="report-card-info">
                                        <h4 className="report-role">{report.roleTitle || "Target Role"}</h4>
                                        <span className="report-date">
                                            {new Date(report.createdAt).toLocaleDateString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <button
                                        className="btn-delete"
                                        onClick={(e) => handleDelete(report._id, e)}
                                        title="Delete Report"
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>

                                <p className="report-summary-text">
                                    {report.summary || report.jobDescription?.slice(0, 140) + '...'}
                                </p>

                                <div className="report-tags">
                                    <span className="badge badge-success">
                                        {report.skillGaps?.length || 0} Gaps Identified
                                    </span>
                                    {report.atsOptimization && (
                                        <span className="badge badge-warning">
                                            ATS Score: {report.atsOptimization.atsScore}%
                                        </span>
                                    )}
                                </div>

                                <div className="report-card-footer">
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/ats-studio?reportId=${report._id}`);
                                        }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit_document</span>
                                        <span>ATS Studio</span>
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/mock-interview?reportId=${report._id}`);
                                        }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>mic</span>
                                        <span>Mock Interview</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Mock Interviews Section */}
            {sessions.length > 0 && (
                <div className="section-block">
                    <div className="section-header">
                        <div className="section-title-wrap">
                            <span className="material-symbols-outlined filled">record_voice_over</span>
                            <h2>AI Mock Interview History</h2>
                        </div>
                    </div>

                    <div className="sessions-table-wrapper card">
                        <table className="sessions-table">
                            <thead>
                                <tr>
                                    <th>Target Role</th>
                                    <th>Status</th>
                                    <th>Score</th>
                                    <th>Verdict</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map(s => {
                                    const isComplete = s.status === 'completed';
                                    const score = s.overallEvaluation?.overallScore;
                                    const verdict = s.overallEvaluation?.verdict || 'In Progress';
                                    return (
                                        <tr key={s._id}>
                                            <td className="role-cell">
                                                <strong>{s.roleTitle || "Target Role"}</strong>
                                            </td>
                                            <td>
                                                <span className={`badge ${isComplete ? 'badge-success' : 'badge-neutral'}`}>
                                                    {s.status}
                                                </span>
                                            </td>
                                            <td>
                                                {score !== undefined && score !== null ? (
                                                    <span className="data-font" style={{ fontWeight: 700 }}>
                                                        {score}%
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td>
                                                <span className={`badge ${verdict.includes('Hire') ? 'badge-success' : 'badge-warning'}`}>
                                                    {verdict}
                                                </span>
                                            </td>
                                            <td>
                                                {new Date(s.createdAt).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-outline btn-sm"
                                                    onClick={() => navigate(`/mock-interview/${s._id}`)}
                                                >
                                                    {isComplete ? 'View Evaluation' : 'Resume Session'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
