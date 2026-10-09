import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router';
import { getReports, getReportById } from '../services/interview.api.js';
import ScoreRing from '../components/ScoreRing.jsx';
import './AtsResumeStudio.scss';

const AtsResumeStudio = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const reportIdParam = searchParams.get('reportId');

    const [reportsList, setReportsList] = useState([]);
    const [activeReportId, setActiveReportId] = useState(reportIdParam || '');
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('keywords'); // 'keywords' | 'bullets' | 'summary' | 'skills' | 'draft'
    const [copySuccess, setCopySuccess] = useState('');

    // Fetch user's reports list
    useEffect(() => {
        const loadReports = async () => {
            try {
                const res = await getReports();
                const list = res.data || [];
                setReportsList(list);

                if (!activeReportId && list.length > 0) {
                    setActiveReportId(list[0]._id);
                    setSearchParams({ reportId: list[0]._id });
                }
            } catch (err) {
                console.error("Failed to load reports:", err);
            }
        };
        loadReports();
    }, []);

    // Load active report details
    useEffect(() => {
        const loadReportData = async () => {
            if (!activeReportId) return;
            setLoading(true);
            try {
                const res = await getReportById(activeReportId);
                setReport(res.data);
            } catch (err) {
                console.error("Failed to load report data:", err);
            } finally {
                setLoading(false);
            }
        };

        loadReportData();
    }, [activeReportId]);

    const handleSelectReport = (id) => {
        setActiveReportId(id);
        setSearchParams({ reportId: id });
    };

    const handleCopy = (text, label) => {
        navigator.clipboard.writeText(text);
        setCopySuccess(label);
        setTimeout(() => setCopySuccess(''), 2500);
    };

    const handleDownload = (filename, content) => {
        const element = document.createElement("a");
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const atsData = report?.atsOptimization;

    return (
        <div className="ats-studio-page animate-fade-in">
            {/* Top Bar with Report Selector */}
            <div className="ats-top-bar">
                <div>
                    <h1>ATS Resume Studio & Optimizer</h1>
                    <p>Tailor your resume with high-impact keywords, STAR metric rewrites, and ATS-compliant formatting.</p>
                </div>

                {reportsList.length > 0 && (
                    <div className="report-selector-wrapper">
                        <label>Select Target Role Scan:</label>
                        <select
                            value={activeReportId}
                            onChange={(e) => handleSelectReport(e.target.value)}
                            className="report-select-input"
                        >
                            {reportsList.map((r) => (
                                <option key={r._id} value={r._id}>
                                    {r.roleTitle || "Target Role"} ({r.matchScore}% Match)
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="ats-loading-state card">
                    <span className="material-symbols-outlined animate-spin icon-spin">progress_activity</span>
                    <h3>Loading ATS Recommendations...</h3>
                </div>
            ) : !report ? (
                <div className="ats-empty-state card">
                    <span className="material-symbols-outlined empty-icon">document_scanner</span>
                    <h3>No reports found</h3>
                    <p>Run a resume scan first to generate ATS keyword analysis and tailored rewrites.</p>
                    <Link to="/setup" className="btn btn-primary">Run First Scan</Link>
                </div>
            ) : !atsData ? (
                <div className="ats-empty-state card">
                    <h3>No ATS data available for this report</h3>
                    <Link to="/setup" className="btn btn-primary">Run New Scan</Link>
                </div>
            ) : (
                <>
                    {/* ATS Score & Benchmark Hero */}
                    <div className="ats-hero-card card">
                        <div className="ats-hero-gauge">
                            <ScoreRing
                                score={atsData.atsScore || 70}
                                size={120}
                                strokeWidth={10}
                                label="ATS SCORE"
                            />
                        </div>

                        <div className="ats-hero-details">
                            <div className="ats-role-row">
                                <h2>{report.roleTitle || "Target Role"}</h2>
                                <span className={`badge ${atsData.atsScore >= 75 ? 'badge-success' : 'badge-warning'}`}>
                                    {atsData.atsScore >= 75 ? 'High ATS Pass Likelihood' : 'Keyword Gap Detected'}
                                </span>
                            </div>

                            <p className="ats-hero-summary">
                                Based on applicant tracking systems like Workday, Greenhouse, and Lever, this optimization ensures your resume satisfies both keyword filters and human recruiter standards.
                            </p>

                            <div className="ats-stats-row">
                                <div className="stat-pill">
                                    <span className="stat-num">{atsData.matchingKeywords?.length || 0}</span>
                                    <span className="stat-text">Keywords Matched</span>
                                </div>
                                <div className="stat-pill">
                                    <span className="stat-num warning-num">{atsData.missingKeywords?.length || 0}</span>
                                    <span className="stat-text">Critical Keywords Missing</span>
                                </div>
                                <div className="stat-pill">
                                    <span className="stat-num">{atsData.experienceBulletPoints?.length || 0}</span>
                                    <span className="stat-text">Metric Bullet Rewrites</span>
                                </div>
                            </div>
                        </div>

                        <div className="ats-hero-quick-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => navigate(`/mock-interview?reportId=${report._id}`)}
                            >
                                <span className="material-symbols-outlined filled">mic</span>
                                <span>Mock Interview</span>
                            </button>
                        </div>
                    </div>

                    {/* Copy Notification Toast */}
                    {copySuccess && (
                        <div className="copy-toast animate-fade-in">
                            <span className="material-symbols-outlined">check_circle</span>
                            <span>Copied {copySuccess} to clipboard!</span>
                        </div>
                    )}

                    {/* Studio Navigation Tabs */}
                    <div className="studio-tabs card">
                        <button
                            className={`studio-tab-btn ${activeTab === 'keywords' ? 'active' : ''}`}
                            onClick={() => setActiveTab('keywords')}
                        >
                            <span className="material-symbols-outlined">key</span>
                            <span>Keywords ({atsData.missingKeywords?.length || 0})</span>
                        </button>

                        <button
                            className={`studio-tab-btn ${activeTab === 'bullets' ? 'active' : ''}`}
                            onClick={() => setActiveTab('bullets')}
                        >
                            <span className="material-symbols-outlined">format_list_bulleted</span>
                            <span>STAR Bullet Rewrites</span>
                        </button>

                        <button
                            className={`studio-tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
                            onClick={() => setActiveTab('summary')}
                        >
                            <span className="material-symbols-outlined">badge</span>
                            <span>ATS Summary</span>
                        </button>

                        <button
                            className={`studio-tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
                            onClick={() => setActiveTab('skills')}
                        >
                            <span className="material-symbols-outlined">integration_instructions</span>
                            <span>Skills Layout</span>
                        </button>

                        <button
                            className={`studio-tab-btn ${activeTab === 'draft' ? 'active' : ''}`}
                            onClick={() => setActiveTab('draft')}
                        >
                            <span className="material-symbols-outlined">article</span>
                            <span>Full ATS Resume Draft</span>
                        </button>
                    </div>

                    {/* Tab 1: Missing & Matched Keywords */}
                    {activeTab === 'keywords' && (
                        <div className="tab-content-panel animate-fade-in">
                            <div className="panel-header-row">
                                <div>
                                    <h3>Missing Keywords & Placement Suggestions</h3>
                                    <p>Add these exact terms into your experience or project sections to clear ATS filter thresholds.</p>
                                </div>
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => handleCopy(
                                        atsData.missingKeywords?.map(k => k.keyword).join(', '),
                                        "all missing keywords"
                                    )}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>content_copy</span>
                                    <span>Copy All Keywords</span>
                                </button>
                            </div>

                            <div className="keywords-grid">
                                {atsData.missingKeywords?.map((kwObj, idx) => (
                                    <div key={idx} className="keyword-card card">
                                        <div className="keyword-card-top">
                                            <span className="keyword-title">{kwObj.keyword}</span>
                                            <span className={`badge ${
                                                kwObj.importance === 'critical' ? 'badge-danger' :
                                                kwObj.importance === 'recommended' ? 'badge-warning' : 'badge-neutral'
                                            }`}>
                                                {kwObj.importance || 'recommended'}
                                            </span>
                                        </div>
                                        <p className="keyword-context">{kwObj.context || "Include in projects or technical competencies section."}</p>
                                        <button
                                            className="btn-copy-mini"
                                            onClick={() => handleCopy(kwObj.keyword, kwObj.keyword)}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>content_copy</span>
                                            <span>Copy</span>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {atsData.matchingKeywords && atsData.matchingKeywords.length > 0 && (
                                <div className="matched-keywords-section card">
                                    <h4>
                                        <span className="material-symbols-outlined filled icon-teal">check_circle</span>
                                        Already Matched in Your Profile
                                    </h4>
                                    <div className="matched-pills-wrap">
                                        {atsData.matchingKeywords.map((kw, i) => (
                                            <span key={i} className="badge badge-success">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 2: High-Impact Bullet Rewrites */}
                    {activeTab === 'bullets' && (
                        <div className="tab-content-panel animate-fade-in">
                            <div className="panel-header-row">
                                <div>
                                    <h3>Quantifiable Experience Bullet Rewrites</h3>
                                    <p>Transformed using Google's X-Y-Z formula: "Accomplished [X] as measured by [Y] by doing [Z]" with target JD keywords.</p>
                                </div>
                            </div>

                            <div className="bullets-list">
                                {atsData.experienceBulletPoints?.map((item, idx) => (
                                    <div key={idx} className="bullet-rewrite-card card">
                                        <div className="bullet-card-header">
                                            <span className="badge badge-neutral">Role / Focus: {item.originalOrRole || `Experience #${idx + 1}`}</span>
                                            <button
                                                className="btn btn-outline btn-sm"
                                                onClick={() => handleCopy(item.improvedBullet, "bullet point")}
                                            >
                                                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>content_copy</span>
                                                <span>Copy Bullet</span>
                                            </button>
                                        </div>

                                        <div className="bullet-improved-box">
                                            <span className="label-improved">ATS-Optimized Impact Bullet:</span>
                                            <p className="bullet-text">
                                                • {item.improvedBullet}
                                            </p>
                                        </div>

                                        {item.rationale && (
                                            <div className="bullet-rationale-box">
                                                <span className="material-symbols-outlined icon-info">info</span>
                                                <p><strong>Recruiter Rationale:</strong> {item.rationale}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Tailored ATS Summary */}
                    {activeTab === 'summary' && (
                        <div className="tab-content-panel animate-fade-in">
                            <div className="panel-header-row">
                                <div>
                                    <h3>Tailored Professional Summary</h3>
                                    <p>An ATS-crafted introductory summary statement targeting this specific position.</p>
                                </div>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleCopy(atsData.suggestedSummary, "summary")}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>content_copy</span>
                                    <span>Copy Summary</span>
                                </button>
                            </div>

                            <div className="summary-display-card card">
                                <div className="summary-text-area">
                                    "{atsData.suggestedSummary}"
                                </div>
                                <div className="summary-tips">
                                    <span className="material-symbols-outlined icon-teal">check</span>
                                    <span>Place directly underneath your contact information at the top of your resume.</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Structured Skills Layout */}
                    {activeTab === 'skills' && (
                        <div className="tab-content-panel animate-fade-in">
                            <div className="panel-header-row">
                                <div>
                                    <h3>ATS-Structured Skills Formatting</h3>
                                    <p>ATS scanners parse categorization cleanly when organized into clear logical buckets.</p>
                                </div>
                            </div>

                            <div className="skills-categorized-grid">
                                <div className="skill-bucket-card card">
                                    <h4>Hard Skills & Architecture</h4>
                                    <div className="bucket-pills">
                                        {atsData.skillsSectionRecommendation?.hardSkills?.map((s, i) => (
                                            <span key={i} className="skill-pill hard-skill">{s}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="skill-bucket-card card">
                                    <h4>Tools, Frameworks & Cloud</h4>
                                    <div className="bucket-pills">
                                        {atsData.skillsSectionRecommendation?.toolsAndFrameworks?.map((s, i) => (
                                            <span key={i} className="skill-pill tool-skill">{s}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="skill-bucket-card card">
                                    <h4>Soft Skills & Methodologies</h4>
                                    <div className="bucket-pills">
                                        {atsData.skillsSectionRecommendation?.softSkills?.map((s, i) => (
                                            <span key={i} className="skill-pill soft-skill">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 5: Complete ATS Resume Draft (Markdown & Export) */}
                    {activeTab === 'draft' && (
                        <div className="tab-content-panel animate-fade-in">
                            <div className="panel-header-row">
                                <div>
                                    <h3>Complete ATS-Optimized Resume Draft</h3>
                                    <p>Full ready-to-use resume markdown that incorporates all recommendations, ready to copy or download.</p>
                                </div>
                                <div className="draft-action-buttons">
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => handleCopy(atsData.optimizedResumeMarkdown, "entire resume markdown")}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>content_copy</span>
                                        <span>Copy Markdown</span>
                                    </button>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleDownload("ATS_Optimized_Resume.md", atsData.optimizedResumeMarkdown)}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
                                        <span>Download .MD</span>
                                    </button>
                                </div>
                            </div>

                            <div className="markdown-preview-card card">
                                <pre className="markdown-preview-content">
                                    {atsData.optimizedResumeMarkdown || "Generating resume draft..."}
                                </pre>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AtsResumeStudio;
