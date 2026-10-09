import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router';
import {
    getReports,
    startMockInterview,
    getMockSession,
    saveMockProgress,
    evaluateMockInterview
} from '../services/interview.api.js';
import ScoreRing from '../components/ScoreRing.jsx';
import './MockInterviewRoom.scss';

const MockInterviewRoom = () => {
    const { sessionId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const reportIdParam = searchParams.get('reportId');

    // Setup state
    const [reportsList, setReportsList] = useState([]);
    const [selectedReportId, setSelectedReportId] = useState(reportIdParam || '');
    const [customRole, setCustomRole] = useState('');
    const [customJd, setCustomJd] = useState('');
    const [customResume, setCustomResume] = useState('');
    const [isStarting, setIsStarting] = useState(false);

    // Active session state
    const [session, setSession] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { [id]: "answer text" }
    const [loadingSession, setLoadingSession] = useState(false);
    const [isSubmittingEval, setIsSubmittingEval] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);

    // Audio & Speech states
    const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
    const [isListeningMic, setIsListeningMic] = useState(false);
    const recognitionRef = useRef(null);

    // 1. Initial Data Loading: Reports list or existing session
    useEffect(() => {
        const init = async () => {
            if (sessionId) {
                // Resume existing session
                setLoadingSession(true);
                try {
                    const res = await getMockSession(sessionId);
                    setSession(res.data);
                    // Populate answers
                    const ansMap = {};
                    res.data?.questions?.forEach(q => {
                        ansMap[q.id] = q.userAnswer || '';
                    });
                    setAnswers(ansMap);
                } catch (err) {
                    console.error("Failed to load interview session:", err);
                } finally {
                    setLoadingSession(false);
                }
            } else {
                // Load reports to pick from
                try {
                    const res = await getReports();
                    const list = res.data || [];
                    setReportsList(list);
                    if (!selectedReportId && list.length > 0) {
                        setSelectedReportId(list[0]._id);
                    }
                } catch (err) {
                    console.error("Failed to load reports:", err);
                }
            }
        };

        init();
    }, [sessionId]);

    // 2. Timer during in-progress interview
    useEffect(() => {
        let interval = null;
        if (session && session.status === 'in-progress') {
            interval = setInterval(() => {
                setTimerSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [session?.status]);

    // Format timer
    const formatTimer = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // 3. Start New Mock Interview
    const handleStartInterview = async () => {
        setIsStarting(true);
        try {
            const payload = selectedReportId
                ? { reportId: selectedReportId }
                : {
                    roleTitle: customRole || "Target Role",
                    jobDescription: customJd,
                    resume: customResume
                };

            const res = await startMockInterview(payload);
            const createdSession = res.data;
            if (createdSession?._id) {
                navigate(`/mock-interview/${createdSession._id}`);
                setSession(createdSession);
                setCurrentIndex(0);
                const ansMap = {};
                createdSession.questions.forEach(q => {
                    ansMap[q.id] = '';
                });
                setAnswers(ansMap);
            }
        } catch (err) {
            alert(err?.response?.data?.message || "Failed to start mock interview.");
        } finally {
            setIsStarting(false);
        }
    };

    // 4. Autosave answer changes
    const handleAnswerChange = (qId, text) => {
        setAnswers(prev => ({ ...prev, [qId]: text }));
    };

    const handleSaveProgress = async () => {
        if (!session?._id) return;
        const answerList = Object.entries(answers).map(([id, userAnswer]) => ({
            id: Number(id),
            userAnswer
        }));
        try {
            await saveMockProgress(session._id, answerList);
        } catch (err) {
            console.error("Autosave failed:", err);
        }
    };

    // 5. Speech Synthesis (AI reads question aloud)
    const handleSpeakQuestion = (text) => {
        if (!('speechSynthesis' in window)) {
            alert("Text-to-speech is not supported in this browser.");
            return;
        }

        if (isSpeakingQuestion) {
            window.speechSynthesis.cancel();
            setIsSpeakingQuestion(false);
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsSpeakingQuestion(false);
        utterance.onerror = () => setIsSpeakingQuestion(false);
        setIsSpeakingQuestion(true);
        window.speechSynthesis.speak(utterance);
    };

    // 6. Speech Recognition (Speech to Text microphone input)
    const handleToggleMic = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice speech recognition is not supported in this browser. Please use Chrome or Edge, or type your answer.");
            return;
        }

        if (isListeningMic) {
            recognitionRef.current?.stop();
            setIsListeningMic(false);
            return;
        }

        const currentQ = session?.questions[currentIndex];
        if (!currentQ) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListeningMic(true);
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript + ' ';
                }
            }
            if (finalTranscript) {
                setAnswers(prev => ({
                    ...prev,
                    [currentQ.id]: (prev[currentQ.id] ? prev[currentQ.id] + ' ' : '') + finalTranscript.trim()
                }));
            }
        };

        recognition.onerror = (err) => {
            console.error("Mic error:", err);
            setIsListeningMic(false);
        };

        recognition.onend = () => {
            setIsListeningMic(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    // 7. Complete & Evaluate Interview
    const handleFinishInterview = async () => {
        if (!window.confirm("Are you ready to submit your interview for AI performance scoring?")) {
            return;
        }

        // Stop speech & mic
        if (isSpeakingQuestion) window.speechSynthesis.cancel();
        if (isListeningMic) recognitionRef.current?.stop();

        setIsSubmittingEval(true);
        const answerList = Object.entries(answers).map(([id, userAnswer]) => ({
            id: Number(id),
            userAnswer
        }));

        try {
            const res = await evaluateMockInterview(session._id, answerList);
            setSession(res.data);
        } catch (err) {
            alert(err?.response?.data?.message || "Failed to evaluate interview.");
        } finally {
            setIsSubmittingEval(false);
        }
    };

    /* =========================================================================
       VIEW 1: Setup / Launch Mode (When no session active)
       ========================================================================= */
    if (!sessionId && !session) {
        return (
            <div className="mock-interview-setup animate-fade-in">
                <div className="setup-hero card">
                    <div className="hero-text-wrap">
                        <span className="badge badge-success">AI Simulation Room</span>
                        <h1>AI Mock Interview Simulator</h1>
                        <p>
                            Practice realistic interviews tailored to your target job description. The AI interviewer will ask 6 questions:
                            2 Technical questions on the stack, 2 Resume-based questions on your experience, and 2 Behavioral questions evaluated via the STAR method.
                        </p>
                    </div>

                    <div className="format-pills-row">
                        <div className="format-pill">
                            <span className="material-symbols-outlined">terminal</span>
                            <span>2 Technical Questions</span>
                        </div>
                        <div className="format-pill">
                            <span className="material-symbols-outlined">description</span>
                            <span>2 Resume-Based Questions</span>
                        </div>
                        <div className="format-pill">
                            <span className="material-symbols-outlined">groups</span>
                            <span>2 Behavioral Questions</span>
                        </div>
                        <div className="format-pill">
                            <span className="material-symbols-outlined">mic</span>
                            <span>Voice or Text Input</span>
                        </div>
                    </div>
                </div>

                <div className="launch-options-card card">
                    <h3>Select Role to Interview For</h3>

                    {reportsList.length > 0 ? (
                        <div className="launch-selector-section">
                            <label className="input-label">Choose from your scanned reports:</label>
                            <div className="reports-selection-list">
                                {reportsList.map(r => (
                                    <div
                                        key={r._id}
                                        className={`report-select-card ${selectedReportId === r._id ? 'selected' : ''}`}
                                        onClick={() => setSelectedReportId(r._id)}
                                    >
                                        <div className="radio-circle">
                                            {selectedReportId === r._id && <div className="radio-dot" />}
                                        </div>
                                        <div className="report-select-details">
                                            <strong>{r.roleTitle || "Target Role"}</strong>
                                            <span>Match Score: {r.matchScore}% • Scanned {new Date(r.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="manual-inputs-section">
                            <p className="no-reports-hint">No reports found. You can enter details below to start immediately:</p>
                            <div className="form-group">
                                <label className="input-label">Target Role Title</label>
                                <input
                                    type="text"
                                    className="styled-input"
                                    placeholder="e.g. Senior Full Stack Engineer"
                                    value={customRole}
                                    onChange={(e) => setCustomRole(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="input-label">Job Description</label>
                                <textarea
                                    className="styled-textarea"
                                    rows={4}
                                    placeholder="Paste job description requirements..."
                                    value={customJd}
                                    onChange={(e) => setCustomJd(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="input-label">Resume / Skills Text</label>
                                <textarea
                                    className="styled-textarea"
                                    rows={4}
                                    placeholder="Paste your resume text or core skills..."
                                    value={customResume}
                                    onChange={(e) => setCustomResume(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div className="launch-action-bar">
                        <button
                            className="btn btn-primary btn-lg btn-start-interview"
                            onClick={handleStartInterview}
                            disabled={isStarting}
                        >
                            {isStarting ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    <span>Generating Interview Questions...</span>
                                </>
                            ) : (
                                <>
                                    <span>Launch Interview</span>
                                    <span className="material-symbols-outlined filled">play_arrow</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loadingSession) {
        return (
            <div className="session-loading card animate-fade-in">
                <span className="material-symbols-outlined animate-spin icon-spin">progress_activity</span>
                <h3>Loading Interview Session...</h3>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="session-loading card animate-fade-in">
                <h3>Interview session not found</h3>
                <Link to="/mock-interview" className="btn btn-primary">Start New Interview</Link>
            </div>
        );
    }

    /* =========================================================================
       VIEW 3: Completed Scorecard & Performance Evaluation Report
       ========================================================================= */
    if (session.status === 'completed') {
        const evalData = session.overallEvaluation;
        const questionsList = session.questions || [];

        return (
            <div className="mock-evaluation-page animate-fade-in">
                {/* Top Action Nav */}
                <div className="eval-top-bar">
                    <Link to="/" className="back-link">
                        <span className="material-symbols-outlined">arrow_back</span>
                        <span>Back to Dashboard</span>
                    </Link>
                    <div className="eval-actions">
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={() => navigate('/mock-interview')}
                        >
                            <span className="material-symbols-outlined">replay</span>
                            <span>Take Another Interview</span>
                        </button>
                    </div>
                </div>

                {/* Scorecard Hero */}
                <div className="eval-hero-card card">
                    <div className="eval-hero-gauge">
                        <ScoreRing
                            score={evalData?.overallScore || 0}
                            size={140}
                            strokeWidth={11}
                            label="OVERALL"
                        />
                    </div>

                    <div className="eval-hero-content">
                        <div className="eval-title-row">
                            <h1>Interview Performance Scorecard</h1>
                            <span className={`badge ${
                                evalData?.verdict === 'Strong Hire' ? 'badge-success' :
                                evalData?.verdict === 'Hire' ? 'badge-success' :
                                evalData?.verdict === 'Borderline' ? 'badge-warning' : 'badge-danger'
                            }`}>
                                Recommendation: {evalData?.verdict || 'Needs Improvement'}
                            </span>
                        </div>

                        <p className="eval-role-sub">
                            Role: <strong>{session.roleTitle}</strong> • Evaluated by AI Bar Raiser
                        </p>

                        <p className="eval-summary-text">
                            {evalData?.summary || "Interview evaluation completed. Review your score breakdown and question-by-question analysis below."}
                        </p>
                    </div>
                </div>

                {/* 3 Core Metric Breakdown Cards */}
                <div className="metrics-triad-grid">
                    <div className="metric-box card">
                        <div className="metric-box-top">
                            <span className="material-symbols-outlined icon-metric">terminal</span>
                            <span className="metric-score-data">{evalData?.technicalScore || 0}%</span>
                        </div>
                        <h4>Technical Depth</h4>
                        <p>Correctness, architectural soundness, and engineering precision.</p>
                    </div>

                    <div className="metric-box card">
                        <div className="metric-box-top">
                            <span className="material-symbols-outlined icon-metric">record_voice_over</span>
                            <span className="metric-score-data">{evalData?.communicationScore || 0}%</span>
                        </div>
                        <h4>Communication & Clarity</h4>
                        <p>Structure, conciseness, articulation, and problem breakdown.</p>
                    </div>

                    <div className="metric-box card">
                        <div className="metric-box-top">
                            <span className="material-symbols-outlined icon-metric">psychology</span>
                            <span className="metric-score-data">{evalData?.behavioralScore || 0}%</span>
                        </div>
                        <h4>Behavioral & STAR Fit</h4>
                        <p>Collaboration, conflict handling, and ownership demonstrated.</p>
                    </div>
                </div>

                {/* Strengths & Improvements Dual Cards */}
                <div className="feedback-split-grid">
                    <div className="feedback-card card strengths-card">
                        <div className="feedback-card-header">
                            <span className="material-symbols-outlined filled icon-green">check_circle</span>
                            <h3>Key Strengths Demonstrated</h3>
                        </div>
                        <ul className="feedback-list">
                            {evalData?.strengths?.map((str, i) => (
                                <li key={i}>{str}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="feedback-card card improvements-card">
                        <div className="feedback-card-header">
                            <span className="material-symbols-outlined filled icon-amber">flag</span>
                            <h3>Critical Areas for Improvement</h3>
                        </div>
                        <ul className="feedback-list">
                            {evalData?.improvements?.map((imp, i) => (
                                <li key={i}>{imp}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Question by Question Detailed Breakdown */}
                <div className="questions-evaluation-section">
                    <div className="section-title-wrap">
                        <span className="material-symbols-outlined filled icon-teal">quiz</span>
                        <h2>Question-by-Question Deep Dive</h2>
                    </div>

                    <div className="evaluated-questions-list">
                        {questionsList.map((q, idx) => (
                            <div key={idx} className="evaluated-q-card card">
                                <div className="q-card-top-row">
                                    <div className="q-card-type-wrap">
                                        <span className="badge badge-neutral">
                                            {q.type.toUpperCase()} #{idx + 1}
                                        </span>
                                        <h3 className="q-text">{q.question}</h3>
                                    </div>
                                    <div className="q-score-badge">
                                        <span className="q-score-val">{q.score !== null ? `${q.score}%` : 'N/A'}</span>
                                        <span className="q-score-lbl">SCORE</span>
                                    </div>
                                </div>

                                {/* Candidate Answer */}
                                <div className="candidate-answer-box">
                                    <span className="box-label">Your Submitted Answer:</span>
                                    <p className="answer-text">
                                        {q.userAnswer ? `"${q.userAnswer}"` : <em className="skipped-tag">No answer provided / skipped.</em>}
                                    </p>
                                </div>

                                {/* AI Feedback */}
                                {q.feedback && (
                                    <div className="ai-feedback-box">
                                        <span className="box-label feedback-label">
                                            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>psychology</span>
                                            AI Evaluation & Feedback:
                                        </span>
                                        <p className="feedback-text">{q.feedback}</p>
                                    </div>
                                )}

                                {/* Masterclass Model Answer */}
                                {q.idealAnswer && (
                                    <div className="ideal-answer-box">
                                        <span className="box-label ideal-label">
                                            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>stars</span>
                                            Exemplar Model Answer:
                                        </span>
                                        <p className="ideal-text">{q.idealAnswer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    /* =========================================================================
       VIEW 2: Interactive Interview Room (status === 'in-progress')
       ========================================================================= */
    const questions = session.questions || [];
    const currentQ = questions[currentIndex] || questions[0];
    const totalQuestions = questions.length;
    const currentAnswer = answers[currentQ?.id] || '';

    const handleNext = () => {
        handleSaveProgress();
        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        handleSaveProgress();
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    return (
        <div className="mock-interview-room animate-fade-in">
            {/* Top Navigation & Status Bar */}
            <div className="room-header card">
                <div className="room-header-left">
                    <span className="role-tag">{session.roleTitle || "Target Role"}</span>
                    <div className="timer-badge">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>timer</span>
                        <span>{formatTimer(timerSeconds)}</span>
                    </div>
                </div>

                <div className="room-header-center">
                    <span className="question-counter">Question {currentIndex + 1} of {totalQuestions}</span>
                    <div className="progress-track">
                        <div
                            className="progress-fill"
                            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="room-header-right">
                    <button
                        className="btn btn-outline btn-sm"
                        onClick={handleSaveProgress}
                        title="Save current progress"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>save</span>
                        <span>Autosave</span>
                    </button>
                    <button
                        className="btn btn-primary btn-sm btn-submit-early"
                        onClick={handleFinishInterview}
                        disabled={isSubmittingEval}
                    >
                        {isSubmittingEval ? 'Grading...' : 'Finish Interview'}
                    </button>
                </div>
            </div>

            {/* Main Stage: Question Prompt & Answer Area */}
            <div className="interview-stage card">
                {/* Question Box */}
                <div className="question-stage-box">
                    <div className="question-stage-top">
                        <span className={`badge ${
                            currentQ?.type === 'technical' ? 'badge-primary-custom' :
                            currentQ?.type === 'resume-based' ? 'badge-warning' : 'badge-success'
                        }`}>
                            {currentQ?.type?.toUpperCase()}
                        </span>

                        <button
                            type="button"
                            className={`btn-tts-listen ${isSpeakingQuestion ? 'speaking' : ''}`}
                            onClick={() => handleSpeakQuestion(currentQ?.question)}
                            title="Listen to question via Text-to-Speech"
                        >
                            <span className="material-symbols-outlined">
                                {isSpeakingQuestion ? 'volume_up' : 'volume_mute'}
                            </span>
                            <span>{isSpeakingQuestion ? 'Stop Audio' : 'Listen'}</span>
                        </button>
                    </div>

                    <h2 className="current-question-text">{currentQ?.question}</h2>

                    {currentQ?.context && (
                        <p className="question-context-hint">
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>info</span>
                            <span>{currentQ.context}</span>
                        </p>
                    )}
                </div>

                {/* Candidate Answer Box */}
                <div className="answer-stage-box">
                    <div className="answer-header-row">
                        <label className="answer-label">Your Response:</label>
                        <div className="input-mode-toggles">
                            <button
                                type="button"
                                className={`btn-mic-toggle ${isListeningMic ? 'listening' : ''}`}
                                onClick={handleToggleMic}
                            >
                                <span className="material-symbols-outlined">
                                    {isListeningMic ? 'mic' : 'mic_none'}
                                </span>
                                <span>{isListeningMic ? 'Listening (Speak now)...' : 'Use Voice Input'}</span>
                            </button>
                        </div>
                    </div>

                    <textarea
                        className="answer-textarea"
                        rows={7}
                        placeholder={
                            currentQ?.type === 'behavioral'
                                ? "Structure your answer: Situation (context), Task (objective), Action (what you specifically did), and Result (quantifiable impact)..."
                                : "Provide a thorough technical explanation, edge cases, trade-offs, and examples..."
                        }
                        value={currentAnswer}
                        onChange={(e) => handleAnswerChange(currentQ?.id, e.target.value)}
                    />

                    <div className="answer-footer-row">
                        <span className="word-count">
                            {currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0} words
                        </span>
                        {currentQ?.expectedKeyPoints && currentQ.expectedKeyPoints.length > 0 && (
                            <span className="key-points-tip">
                                Key expectations: {currentQ.expectedKeyPoints.slice(0, 2).join(", ")}
                            </span>
                        )}
                    </div>
                </div>

                {/* Navigation Stepper Controls */}
                <div className="stage-controls-row">
                    <button
                        className="btn btn-outline"
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        <span>Previous Question</span>
                    </button>

                    {currentIndex < totalQuestions - 1 ? (
                        <button
                            className="btn btn-primary"
                            onClick={handleNext}
                        >
                            <span>Next Question</span>
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    ) : (
                        <button
                            className="btn btn-secondary btn-complete-finish"
                            onClick={handleFinishInterview}
                            disabled={isSubmittingEval}
                        >
                            {isSubmittingEval ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    <span>AI Committee Scoring Your Answers...</span>
                                </>
                            ) : (
                                <>
                                    <span>Submit & Score Interview</span>
                                    <span className="material-symbols-outlined filled">done_all</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Evaluation Loading Modal */}
            {isSubmittingEval && (
                <div className="eval-loading-overlay">
                    <div className="eval-loading-modal card">
                        <span className="material-symbols-outlined animate-spin icon-spin">progress_activity</span>
                        <h3>Evaluating Your Interview</h3>
                        <p>The AI Hiring Committee is reviewing technical precision, STAR behavioral depth, and communication clarity...</p>
                        <span className="timer-hint">Takes ~15-20 seconds. Please do not close this window.</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MockInterviewRoom;
