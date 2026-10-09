import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { getReportById } from '../services/interview.api.js';
import ScoreRing from '../components/ScoreRing.jsx';
import SkillGapCard from '../components/SkillGapCard.jsx';
import QuestionAccordion from '../components/QuestionAccordion.jsx';
import './AnalysisReport.scss';

const AnalysisReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [checkedTasks, setCheckedTasks] = useState({});

    useEffect(() => {
        const fetchReport = async () => {
            setLoading(true);
            try {
                const response = await getReportById(id);
                setReport(response.data);
            } catch (err) {
                setErrorMsg("Failed to load report. It may have been deleted.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchReport();
        }
    }, [id]);

    const toggleTask = (taskKey) => {
        setCheckedTasks(prev => ({ ...prev, [taskKey]: !prev[taskKey] }));
    };

    if (loading) {
        return (
            <div className="report-loading animate-fade-in">
                <span className="material-symbols-outlined animate-spin icon-spin">progress_activity</span>
                <h3>Loading Analysis Report...</h3>
            </div>
        );
    }

    if (errorMsg || !report) {
        return (
            <div className="report-error card animate-fade-in">
                <span className="material-symbols-outlined">error</span>
                <h3>{errorMsg || "Report not found"}</h3>
                <Link to="/" className="btn btn-primary">Back to Dashboard</Link>
            </div>
        );
    }

    const {
        matchScore = 0,
        roleTitle = "Target Role",
        summary = "",
        skillGaps = [],
        technicalQuestions = [],
        behavioralQuestions = [],
        preparationPlan = [],
        atsOptimization
    } = report;

    return (
        <div className="analysis-report-page animate-fade-in">
            {/* Top Navigation Bar Helper */}
            <div className="report-top-nav">
                <Link to="/" className="back-link">
                    <span className="material-symbols-outlined">arrow_back</span>
                    <span>Back to Dashboard</span>
                </Link>
                <div className="top-action-pills">
                    <button
                        className="btn btn-outline btn-sm"
                        onClick={() => navigate(`/ats-studio?reportId=${report._id}`)}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>document_scanner</span>
                        <span>ATS Studio ({atsOptimization?.atsScore || 70}%)</span>
                    </button>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/mock-interview?reportId=${report._id}`)}
                    >
                        <span className="material-symbols-outlined filled" style={{ fontSize: '18px' }}>mic</span>
                        <span>Start Mock Interview</span>
                    </button>
                </div>
            </div>

            {/* Hero Card: Match Score & Overview */}
            <section className="report-hero card">
                <div className="hero-score-column">
                    <ScoreRing
                        score={matchScore}
                        size={140}
                        strokeWidth={11}
                        label="MATCH"
                    />
                </div>

                <div className="hero-content-column">
                    <div className="role-heading-row">
                        <h1>{roleTitle}</h1>
                        <span className="badge badge-success">Compatibility Scan Verified</span>
                    </div>

                    <p className="hero-summary-text">
                        {summary || "Your profile shows strong compatibility for this position. Core skill strengths were identified along with targeted areas for technical refinement."}
                    </p>

                    <div className="hero-pill-tags">
                        <span className="badge badge-success">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                            {technicalQuestions.length + behavioralQuestions.length} Interview Questions
                        </span>
                        <span className="badge badge-warning">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>warning</span>
                            {skillGaps.length} Gaps to Address
                        </span>
                        {atsOptimization && (
                            <span className="badge badge-neutral">
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>speed</span>
                                ATS Score: {atsOptimization.atsScore}%
                            </span>
                        )}
                    </div>
                </div>
            </section>

            {/* Dual Column Layout: Left Column (Gaps & Questions) | Right Column (Prep Roadmap) */}
            <div className="report-main-grid">
                <div className="report-left-col">
                    {/* 1. Skill Gaps Section */}
                    <section className="report-section">
                        <div className="section-title-wrap">
                            <span className="material-symbols-outlined filled icon-teal">extension</span>
                            <h2>Identified Skill Gaps</h2>
                        </div>
                        <p className="section-desc">Key requirements mentioned in the job description that require refinement in your profile.</p>

                        <div className="skill-gaps-list">
                            {skillGaps.length === 0 ? (
                                <p className="empty-text">No critical skill gaps identified! Great alignment.</p>
                            ) : (
                                skillGaps.map((item, idx) => (
                                    <SkillGapCard
                                        key={idx}
                                        skill={item.skill}
                                        severity={item.severity}
                                        recommendation={item.recommendation}
                                    />
                                ))
                            )}
                        </div>
                    </section>

                    {/* 2. Technical Interview Questions */}
                    <section className="report-section">
                        <div className="section-title-wrap">
                            <span className="material-symbols-outlined filled icon-teal">terminal</span>
                            <h2>Targeted Technical Questions</h2>
                        </div>
                        <p className="section-desc">Technical questions likely to be asked based on the job requirements, with recommended response approaches.</p>

                        <div className="questions-list">
                            {technicalQuestions.map((q, idx) => (
                                <QuestionAccordion
                                    key={idx}
                                    type="technical"
                                    index={idx + 1}
                                    question={q.question}
                                    intention={q.intention}
                                    answer={q.answer}
                                />
                            ))}
                        </div>
                    </section>

                    {/* 3. Behavioral Interview Questions */}
                    <section className="report-section">
                        <div className="section-title-wrap">
                            <span className="material-symbols-outlined filled icon-teal">groups</span>
                            <h2>Behavioral & Situational Questions</h2>
                        </div>
                        <p className="section-desc">Assessments of team dynamics, conflict handling, and leadership using the STAR format.</p>

                        <div className="questions-list">
                            {behavioralQuestions.map((q, idx) => (
                                <QuestionAccordion
                                    key={idx}
                                    type="behavioral"
                                    index={idx + 1}
                                    question={q.question}
                                    intention={q.intention}
                                    answer={q.answer}
                                />
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column: Day-by-Day Preparation Plan */}
                <div className="report-right-col">
                    <div className="prep-roadmap-sticky card">
                        <div className="section-title-wrap">
                            <span className="material-symbols-outlined filled icon-teal">calendar_month</span>
                            <h3>Preparation Roadmap</h3>
                        </div>
                        <p className="section-desc">Actionable day-wise schedule to prepare for this role.</p>

                        <div className="prep-days-timeline">
                            {preparationPlan.map((planItem, planIdx) => (
                                <div key={planIdx} className="prep-day-block">
                                    <div className="day-badge-header">
                                        <span className="day-number">Day {planItem.day}</span>
                                        <span className="day-focus">{planItem.focus}</span>
                                    </div>

                                    <ul className="day-tasks-list">
                                        {planItem.tasks?.map((task, taskIdx) => {
                                            const taskKey = `${planIdx}-${taskIdx}`;
                                            const isDone = !!checkedTasks[taskKey];
                                            return (
                                                <li
                                                    key={taskIdx}
                                                    className={`day-task-item ${isDone ? 'completed' : ''}`}
                                                    onClick={() => toggleTask(taskKey)}
                                                >
                                                    <span className="material-symbols-outlined task-check-icon">
                                                        {isDone ? 'check_box' : 'check_box_outline_blank'}
                                                    </span>
                                                    <span>{task}</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Direct Call To Action Inside Sidebar */}
                        <div className="prep-sidebar-footer">
                            <button
                                className="btn btn-secondary w-full"
                                onClick={() => navigate(`/mock-interview?reportId=${report._id}`)}
                            >
                                <span className="material-symbols-outlined filled">mic</span>
                                <span>Practice in AI Interview</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisReport;
