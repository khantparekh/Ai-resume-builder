import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { generateReport } from '../services/interview.api.js';
import './AnalysisSetup.scss';

const AnalysisSetup = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Form states
    const [resumeTab, setResumeTab] = useState('upload'); // 'upload' | 'text'
    const [selectedFile, setSelectedFile] = useState(null);
    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [selfDescription, setSelfDescription] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    // Submission & Loading state
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisStep, setAnalysisStep] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');

    const analysisStepsText = [
        "Ingesting resume data & parsing core competencies...",
        "Evaluating semantic match against Job Description...",
        "Calculating ATS keyword density & score gaps...",
        "Crafting tailored interview questions & prep roadmap..."
    ];

    // File handlers
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type !== 'application/pdf') {
                setErrorMsg("Please upload a PDF file (.pdf)");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setErrorMsg("File size must be under 5MB");
                return;
            }
            setSelectedFile(file);
            setErrorMsg('');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type !== 'application/pdf') {
                setErrorMsg("Please upload a PDF file (.pdf)");
                return;
            }
            setSelectedFile(file);
            setErrorMsg('');
        }
    };

    const handleQuickPaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                setJobDescription(text);
            }
        } catch (err) {
            console.warn("Clipboard access denied or unavailable:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!jobDescription.trim()) {
            setErrorMsg("Please provide the Job Description.");
            return;
        }

        if (resumeTab === 'upload' && !selectedFile) {
            setErrorMsg("Please select or drop a PDF resume, or switch to 'Paste Text' tab.");
            return;
        }

        if (resumeTab === 'text' && !resumeText.trim() && !selfDescription.trim()) {
            setErrorMsg("Please enter your resume text or candidate background.");
            return;
        }

        setIsAnalyzing(true);
        setAnalysisStep(0);

        // Step ticker interval for engaging feedback
        const interval = setInterval(() => {
            setAnalysisStep(prev => (prev < 3 ? prev + 1 : prev));
        }, 3500);

        try {
            const response = await generateReport({
                file: resumeTab === 'upload' ? selectedFile : null,
                resumeText: resumeTab === 'text' ? resumeText : "",
                selfDescription,
                jobDescription
            });

            clearInterval(interval);
            const reportId = response.data?._id;
            if (reportId) {
                navigate(`/report/${reportId}`);
            } else {
                navigate('/');
            }
        } catch (err) {
            clearInterval(interval);
            setIsAnalyzing(false);
            setErrorMsg(err?.response?.data?.message || err?.message || "Analysis failed. Please verify inputs and try again.");
        }
    };

    return (
        <div className="analysis-setup-page animate-fade-in">
            {/* Header */}
            <div className="setup-header">
                <h1>Analysis Setup</h1>
                <p>Configure your profile and target role for a precision AI compatibility scan and ATS optimization.</p>
            </div>

            {errorMsg && (
                <div className="setup-alert-error">
                    <span className="material-symbols-outlined">error</span>
                    <span>{errorMsg}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="setup-form">
                {/* Section 1: Resume Input */}
                <section className="form-section card">
                    <div className="section-title-row">
                        <span className="material-symbols-outlined filled icon-teal">upload_file</span>
                        <h2>1. Your Resume</h2>
                    </div>

                    {/* Tab Switcher */}
                    <div className="tab-pill-container">
                        <button
                            type="button"
                            className={`tab-pill ${resumeTab === 'upload' ? 'active' : ''}`}
                            onClick={() => setResumeTab('upload')}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>picture_as_pdf</span>
                            <span>Upload PDF Resume</span>
                        </button>
                        <button
                            type="button"
                            className={`tab-pill ${resumeTab === 'text' ? 'active' : ''}`}
                            onClick={() => setResumeTab('text')}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>text_snippet</span>
                            <span>Paste Resume Text</span>
                        </button>
                    </div>

                    {resumeTab === 'upload' ? (
                        <div className="upload-zone-wrapper">
                            {!selectedFile ? (
                                <div
                                    className={`file-drop-area ${isDragging ? 'dragging' : ''}`}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept=".pdf,application/pdf"
                                        style={{ display: 'none' }}
                                    />
                                    <div className="drop-icon-circle">
                                        <span className="material-symbols-outlined">cloud_upload</span>
                                    </div>
                                    <div className="drop-text">
                                        <p className="primary-text">
                                            Drop your resume here or <span className="browse-link">browse</span>
                                        </p>
                                        <p className="sub-text">Supports PDF (Max 5MB)</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="file-chip-card">
                                    <div className="file-chip-left">
                                        <span className="material-symbols-outlined file-chip-icon">description</span>
                                        <div>
                                            <p className="file-chip-name">{selectedFile.name}</p>
                                            <p className="file-chip-size">{(selectedFile.size / 1024).toFixed(1)} KB • Ready for scan</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-chip-remove"
                                        onClick={() => setSelectedFile(null)}
                                        title="Remove file"
                                    >
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="textarea-wrapper">
                            <label className="input-label">Resume Text / CV Markdown</label>
                            <textarea
                                className="styled-textarea"
                                rows={7}
                                placeholder="Paste your complete resume text, work experience, projects, education, and technical competencies here..."
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                            />
                        </div>
                    )}
                </section>

                {/* Section 2: Target Job Description */}
                <section className="form-section card">
                    <div className="section-title-row">
                        <span className="material-symbols-outlined filled icon-teal">work</span>
                        <h2>2. Target Job Description</h2>
                    </div>

                    <div className="textarea-container-relative">
                        <div className="textarea-header-bar">
                            <label className="input-label">Job Posting / JD Requirements</label>
                            <button
                                type="button"
                                className="btn-quick-paste"
                                onClick={handleQuickPaste}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>content_paste</span>
                                <span>Quick Paste</span>
                            </button>
                        </div>
                        <textarea
                            className="styled-textarea"
                            rows={8}
                            required
                            placeholder="Paste the target job description here. CareerCompat AI will extract required tech stacks, seniority expectations, soft skills, and ATS criteria..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />
                    </div>

                    <div className="pro-tip-box">
                        <span className="material-symbols-outlined icon-tip">lightbulb</span>
                        <p>
                            <strong>Pro Tip:</strong> Including the company's "Requirements", "Tech Stack", and "Responsibilities" sections produces the most accurate ATS optimization and interview questions.
                        </p>
                    </div>
                </section>

                {/* Section 3: Candidate Context (Optional) */}
                <section className="form-section card">
                    <div className="section-title-row">
                        <span className="material-symbols-outlined filled icon-teal">psychology</span>
                        <h2>3. Candidate Bio / Extra Context <span className="optional-tag">(Optional)</span></h2>
                    </div>
                    <textarea
                        className="styled-textarea"
                        rows={3}
                        placeholder="Any additional background, career goals, target salary/seniority, or specific projects you want emphasized..."
                        value={selfDescription}
                        onChange={(e) => setSelfDescription(e.target.value)}
                    />
                </section>

                {/* Action Submit Button */}
                <div className="setup-submit-wrapper">
                    <button
                        type="submit"
                        className="btn btn-primary btn-submit-scan"
                        disabled={isAnalyzing}
                    >
                        <span>Analyze Compatibility & ATS Fit</span>
                        <span className="material-symbols-outlined filled">bolt</span>
                    </button>
                    <p className="engine-tagline">Powered by PulseEngine AI v4.2 • Powered by Gemini 3.8</p>
                </div>
            </form>

            {/* Engaging Analysis Loading Modal Overlay */}
            {isAnalyzing && (
                <div className="analysis-overlay">
                    <div className="analysis-modal card">
                        <div className="modal-spinner-ring">
                            <span className="material-symbols-outlined animate-spin icon-spin">progress_activity</span>
                        </div>
                        <h3>Analyzing Compatibility</h3>
                        <p className="step-description">{analysisStepsText[analysisStep]}</p>

                        <div className="step-indicators">
                            {analysisStepsText.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`step-bar ${idx <= analysisStep ? 'active' : ''}`}
                                />
                            ))}
                        </div>

                        <span className="ai-status-hint">Please wait ~15-20 seconds while Gemini processes your resume.</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalysisSetup;
