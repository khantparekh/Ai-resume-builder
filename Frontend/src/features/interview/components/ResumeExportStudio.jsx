import React, { useState, useMemo } from 'react';
import './ResumeExportStudio.scss';

/**
 * Strips stray markdown characters and cleans up text
 */
function cleanText(str = '') {
    if (!str) return '';
    return str
        .replace(/^#+\s*/, '')
        .replace(/^\s*[-*•]\s+/, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .trim();
}

/**
 * Parses markdown resume text into clean, structured sections
 */
function parseResumeData(markdown = '', defaultRole = '', defaultUser = null, atsData = null) {
    const data = {
        name: defaultUser?.username || 'Candidate Name',
        title: defaultRole || 'Target Role',
        email: defaultUser?.email || 'candidate@example.com',
        phone: '+1 (555) 019-2834',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/candidate',
        github: 'github.com/candidate',
        summary: atsData?.suggestedSummary || '',
        skills: {
            hard: atsData?.skillsSectionRecommendation?.hardSkills || [],
            tools: atsData?.skillsSectionRecommendation?.toolsAndFrameworks || [],
            soft: atsData?.skillsSectionRecommendation?.softSkills || []
        },
        experience: [],
        projects: [],
        education: []
    };

    if (!markdown) {
        if (atsData?.experienceBulletPoints && atsData.experienceBulletPoints.length > 0) {
            data.experience.push({
                role: defaultRole || 'Professional Role',
                company: 'Primary Experience',
                dates: 'Recent',
                location: '',
                bullets: atsData.experienceBulletPoints.map(b => cleanText(b.improvedBullet))
            });
        }
        return data;
    }

    const lines = markdown.split('\n');
    let currentSection = 'header';
    let currentJob = null;
    let currentProject = null;

    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i].trim();
        if (!rawLine) continue;

        // Check if top candidate name (# John Doe)
        if (rawLine.startsWith('# ') && currentSection === 'header') {
            data.name = cleanText(rawLine);
            continue;
        }

        const lower = rawLine.toLowerCase();

        // Detect section headers (## Section)
        if (rawLine.startsWith('## ') || rawLine.startsWith('### ')) {
            const h = lower.replace(/^#+\s+/, '').trim();
            if (h.includes('summary') || h.includes('profile') || h.includes('objective') || h.includes('about')) {
                currentSection = 'summary';
                continue;
            } else if (h.includes('skill') || h.includes('technologies') || h.includes('competencies') || h.includes('stack')) {
                currentSection = 'skills';
                continue;
            } else if (h.includes('experience') || h.includes('employment') || h.includes('work') || h.includes('history')) {
                currentSection = 'experience';
                continue;
            } else if (h.includes('project')) {
                currentSection = 'projects';
                continue;
            } else if (h.includes('education') || h.includes('degree') || h.includes('academic') || h.includes('certification')) {
                currentSection = 'education';
                continue;
            }
        }

        // Section: Header info
        if (currentSection === 'header') {
            if (rawLine.includes('@')) {
                const parts = rawLine.split('|').map(p => cleanText(p));
                parts.forEach(p => {
                    if (p.includes('@')) data.email = p;
                    else if (p.match(/\d{3}/)) data.phone = p;
                    else if (p.toLowerCase().includes('linkedin')) data.linkedin = p;
                    else if (p.toLowerCase().includes('github')) data.github = p;
                    else if (p.includes(',')) data.location = p;
                });
            } else if (!data.title || data.title === 'Target Role') {
                data.title = cleanText(rawLine);
            }
            continue;
        }

        // Section: Summary
        if (currentSection === 'summary') {
            if (!data.summary) {
                data.summary = cleanText(rawLine);
            } else {
                data.summary += ' ' + cleanText(rawLine);
            }
            continue;
        }

        // Section: Skills
        if (currentSection === 'skills') {
            const cleaned = cleanText(rawLine);
            if (cleaned.includes(':')) {
                const [cat, list] = cleaned.split(':');
                const items = list.split(',').map(s => cleanText(s)).filter(Boolean);
                const catLower = cat.toLowerCase();
                if (catLower.includes('tool') || catLower.includes('framework') || catLower.includes('cloud')) {
                    data.skills.tools.push(...items);
                } else if (catLower.includes('soft') || catLower.includes('leadership')) {
                    data.skills.soft.push(...items);
                } else {
                    data.skills.hard.push(...items);
                }
            } else {
                const items = cleaned.split(',').map(s => cleanText(s)).filter(Boolean);
                data.skills.hard.push(...items);
            }
            continue;
        }

        // Section: Experience
        if (currentSection === 'experience') {
            // Is this a role / job title heading? (e.g. ### Senior Developer at Acme (2021-2024) or bold role)
            if (rawLine.startsWith('### ') || rawLine.startsWith('**') || (!rawLine.startsWith('*') && !rawLine.startsWith('-') && (rawLine.includes('–') || rawLine.includes('-') || rawLine.includes('|') || rawLine.toLowerCase().includes('engineer') || rawLine.toLowerCase().includes('developer')))) {
                if (currentJob && currentJob.bullets.length > 0) {
                    data.experience.push(currentJob);
                }
                const cleaned = cleanText(rawLine);
                let role = cleaned;
                let company = '';
                let dates = '';

                if (cleaned.includes('|')) {
                    const parts = cleaned.split('|').map(p => cleanText(p));
                    role = parts[0] || 'Software Professional';
                    company = parts[1] || '';
                    dates = parts[2] || '';
                } else if (cleaned.includes(' at ')) {
                    const parts = cleaned.split(' at ');
                    role = cleanText(parts[0]);
                    company = cleanText(parts[1] || '');
                }

                currentJob = {
                    role: role || defaultRole || 'Software Professional',
                    company: company || 'Technology Company',
                    dates: dates || '2022 – Present',
                    bullets: []
                };
            } else if (rawLine.startsWith('*') || rawLine.startsWith('-') || rawLine.startsWith('•')) {
                const bulletText = cleanText(rawLine);
                if (bulletText) {
                    if (!currentJob) {
                        currentJob = {
                            role: defaultRole || 'Software Professional',
                            company: 'Primary Role',
                            dates: '2022 – Present',
                            bullets: []
                        };
                    }
                    currentJob.bullets.push(bulletText);
                }
            }
            continue;
        }

        // Section: Projects
        if (currentSection === 'projects') {
            if (rawLine.startsWith('### ') || rawLine.startsWith('**')) {
                if (currentProject) data.projects.push(currentProject);
                currentProject = {
                    title: cleanText(rawLine),
                    bullets: []
                };
            } else if (rawLine.startsWith('*') || rawLine.startsWith('-') || rawLine.startsWith('•')) {
                const bulletText = cleanText(rawLine);
                if (bulletText) {
                    if (!currentProject) currentProject = { title: 'Featured Technical Project', bullets: [] };
                    currentProject.bullets.push(bulletText);
                }
            }
            continue;
        }

        // Section: Education
        if (currentSection === 'education') {
            const cleaned = cleanText(rawLine);
            if (cleaned) {
                data.education.push(cleaned);
            }
        }
    }

    if (currentJob && currentJob.bullets.length > 0) {
        data.experience.push(currentJob);
    }
    if (currentProject) {
        data.projects.push(currentProject);
    }

    // Deduplicate skills
    data.skills.hard = Array.from(new Set(data.skills.hard));
    data.skills.tools = Array.from(new Set(data.skills.tools));
    data.skills.soft = Array.from(new Set(data.skills.soft));

    // If no experience was parsed from markdown but ATS bullet points exist, construct rich experience
    if (data.experience.length === 0 && atsData?.experienceBulletPoints && atsData.experienceBulletPoints.length > 0) {
        data.experience.push({
            role: defaultRole || 'Professional Role',
            company: 'Primary Professional Experience',
            dates: 'Recent Accomplishments',
            bullets: atsData.experienceBulletPoints.map(b => cleanText(b.improvedBullet))
        });
    }

    if (data.education.length === 0) {
        data.education.push("Bachelor of Science in Computer Science / Engineering", "Relevant Coursework: Data Structures, Algorithms, Distributed Systems");
    }

    return data;
}

const ResumeExportStudio = ({ report, atsData, user }) => {
    // Format options: 'ats-standard' | 'modern-executive' | 'original-enhanced'
    const [format, setFormat] = useState('ats-standard');
    const [fontSize, setFontSize] = useState('standard'); // 'compact' | 'standard' | 'spacious'
    const [isEditingContact, setIsEditingContact] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    // Parse structured resume data
    const parsedData = useMemo(() => {
        return parseResumeData(
            atsData?.optimizedResumeMarkdown || report?.resume || '',
            report?.roleTitle || '',
            user,
            atsData
        );
    }, [atsData?.optimizedResumeMarkdown, report?.resume, report?.roleTitle, user, atsData]);

    // Candidate contact details state
    const [candidateInfo, setCandidateInfo] = useState({
        name: parsedData.name,
        title: parsedData.title,
        email: parsedData.email,
        phone: parsedData.phone,
        location: parsedData.location,
        linkedin: parsedData.linkedin,
        github: parsedData.github
    });

    const [customSummary, setCustomSummary] = useState(
        atsData?.suggestedSummary || parsedData.summary || ''
    );

    // AI Improved Bullets
    const bulletRewrites = atsData?.experienceBulletPoints || [];
    const skillsHard = parsedData.skills.hard.length > 0 ? parsedData.skills.hard : (atsData?.skillsSectionRecommendation?.hardSkills || []);
    const skillsTools = parsedData.skills.tools.length > 0 ? parsedData.skills.tools : (atsData?.skillsSectionRecommendation?.toolsAndFrameworks || []);
    const skillsSoft = parsedData.skills.soft.length > 0 ? parsedData.skills.soft : (atsData?.skillsSectionRecommendation?.softSkills || []);

    // ONE-BUTTON EXPORT PDF: Opens isolated high-resolution print window / iframe
    const handleOneButtonExportPdf = () => {
        const resumeEl = document.getElementById('printable-resume-doc');
        if (!resumeEl) {
            window.print();
            return;
        }

        let printIframe = document.getElementById('resume-print-iframe');
        if (!printIframe) {
            printIframe = document.createElement('iframe');
            printIframe.id = 'resume-print-iframe';
            printIframe.style.position = 'fixed';
            printIframe.style.right = '0';
            printIframe.style.bottom = '0';
            printIframe.style.width = '0';
            printIframe.style.height = '0';
            printIframe.style.border = '0';
            document.body.appendChild(printIframe);
        }

        const doc = printIframe.contentWindow.document;
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8" />
                <title>${candidateInfo.name} - Resume (ATS)</title>
                <style>
                    @page {
                        size: letter portrait;
                        margin: 14mm 15mm 14mm 15mm;
                    }
                    * {
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                    }
                    body {
                        font-family: 'Calibri', 'Arial', -apple-system, sans-serif;
                        color: #111111;
                        background: #ffffff;
                        font-size: ${fontSize === 'compact' ? '9.5pt' : fontSize === 'spacious' ? '11pt' : '10.2pt'};
                        line-height: ${fontSize === 'compact' ? '1.3' : fontSize === 'spacious' ? '1.5' : '1.4'};
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .resume-paper-document {
                        width: 100% !important;
                        max-width: 100% !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                    .enhanced-banner, .preview-meta-bar, .studio-control-panel {
                        display: none !important;
                    }
                    /* Typography & standard ATS sections */
                    .candidate-name {
                        font-size: 20pt;
                        font-weight: 700;
                        color: #000000;
                        text-align: center;
                        text-transform: uppercase;
                        letter-spacing: 0.02em;
                        margin-bottom: 2pt;
                    }
                    .candidate-headline {
                        font-size: 11pt;
                        font-weight: 600;
                        color: #333333;
                        text-align: center;
                        margin-bottom: 4pt;
                    }
                    .contact-line {
                        font-size: 9pt;
                        color: #444444;
                        text-align: center;
                        margin-bottom: 12pt;
                    }
                    .contact-line .sep {
                        margin: 0 4pt;
                        color: #888888;
                    }
                    .doc-section, .executive-section, .enhanced-section {
                        margin-bottom: 10pt;
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                    .section-title, .section-header-tag, .enhanced-title {
                        font-size: 10.5pt;
                        font-weight: 700;
                        color: #000000;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        border-bottom: 1px solid #222222;
                        padding-bottom: 2pt;
                        margin-bottom: 5pt;
                    }
                    .summary-paragraph, .executive-summary-text, .enhanced-content {
                        text-align: justify;
                        color: #222222;
                        margin-bottom: 5pt;
                    }
                    .ats-skills-list {
                        list-style: none;
                        padding-left: 0;
                    }
                    .ats-skills-list li {
                        margin-bottom: 3pt;
                    }
                    .job-heading-row, .role-meta-header {
                        display: flex;
                        justify-content: space-between;
                        font-weight: 700;
                        color: #000000;
                        margin-bottom: 3pt;
                    }
                    .job-title {
                        font-weight: 700;
                    }
                    .job-dates {
                        font-weight: 600;
                        color: #444444;
                    }
                    ul.job-bullets, ul.enhanced-bullets, ul.executive-bullets-list {
                        padding-left: 14pt;
                        margin-bottom: 6pt;
                    }
                    ul.job-bullets li, ul.enhanced-bullets li {
                        margin-bottom: 3pt;
                        color: #222222;
                    }
                    .raw-doc-line {
                        margin-bottom: 3pt;
                    }
                </style>
            </head>
            <body>
                ${resumeEl.innerHTML}
            </body>
            </html>
        `);
        doc.close();

        setTimeout(() => {
            printIframe.contentWindow.focus();
            printIframe.contentWindow.print();
        }, 300);
    };

    // Download plain text ATS formatted resume (.txt)
    const handleDownloadTxt = () => {
        let txt = `${candidateInfo.name.toUpperCase()}\n`;
        txt += `${candidateInfo.title}\n`;
        txt += `${candidateInfo.email} | ${candidateInfo.phone} | ${candidateInfo.location} | ${candidateInfo.linkedin}\n\n`;
        txt += `========================================================================\n`;
        txt += `PROFESSIONAL SUMMARY\n`;
        txt += `========================================================================\n`;
        txt += `${customSummary}\n\n`;

        txt += `========================================================================\n`;
        txt += `CORE COMPETENCIES & TECHNICAL SKILLS\n`;
        txt += `========================================================================\n`;
        if (skillsHard.length) txt += `• Core Technologies: ${skillsHard.join(', ')}\n`;
        if (skillsTools.length) txt += `• Tools, Cloud & Frameworks: ${skillsTools.join(', ')}\n`;
        if (skillsSoft.length) txt += `• Methodologies & Leadership: ${skillsSoft.join(', ')}\n`;
        txt += `\n`;

        txt += `========================================================================\n`;
        txt += `PROFESSIONAL EXPERIENCE\n`;
        txt += `========================================================================\n`;
        if (parsedData.experience.length > 0) {
            parsedData.experience.forEach(exp => {
                txt += `${exp.role.toUpperCase()} | ${exp.company} (${exp.dates})\n`;
                exp.bullets.forEach(b => {
                    txt += `  • ${b}\n`;
                });
                txt += `\n`;
            });
        }

        if (parsedData.projects.length > 0) {
            txt += `========================================================================\n`;
            txt += `TECHNICAL PROJECTS\n`;
            txt += `========================================================================\n`;
            parsedData.projects.forEach(p => {
                txt += `${p.title}\n`;
                p.bullets.forEach(b => {
                    txt += `  • ${b}\n`;
                });
                txt += `\n`;
            });
        }

        if (parsedData.education.length > 0) {
            txt += `========================================================================\n`;
            txt += `EDUCATION & CREDENTIALS\n`;
            txt += `========================================================================\n`;
            parsedData.education.forEach(ed => {
                txt += `• ${ed}\n`;
            });
        }

        const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${candidateInfo.name.replace(/\s+/g, '_')}_ATS_Resume.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Download clean Markdown
    const handleDownloadMd = () => {
        const md = atsData?.optimizedResumeMarkdown || customSummary;
        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${candidateInfo.name.replace(/\s+/g, '_')}_ATS_Resume.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCopyAll = () => {
        let txt = `${candidateInfo.name}\n${candidateInfo.email} | ${candidateInfo.phone}\n\nSUMMARY:\n${customSummary}`;
        navigator.clipboard.writeText(txt);
        setCopySuccess('Resume summary copied to clipboard!');
        setTimeout(() => setCopySuccess(''), 2500);
    };

    return (
        <div className="resume-export-studio">
            {/* Control & Configuration Panel */}
            <div className="studio-control-panel card">
                <div className="control-header-row">
                    <div>
                        <h2>ATS Resume Studio & Exporter</h2>
                        <p>Generate, customize, and export an ATS-compliant, high-pass-rate resume in your preferred format.</p>
                    </div>

                    <div className="primary-export-actions">
                        <button
                            type="button"
                            className="btn btn-primary btn-one-button-export"
                            onClick={handleOneButtonExportPdf}
                            title="Export clean, publication-grade ATS vector PDF"
                        >
                            <span className="material-symbols-outlined">picture_as_pdf</span>
                            <span>One-Button Export PDF</span>
                        </button>
                    </div>
                </div>

                <div className="control-options-grid">
                    {/* Format Selector */}
                    <div className="option-column">
                        <label className="option-label">Select Resume Format:</label>
                        <div className="format-toggle-group">
                            <button
                                type="button"
                                className={`format-pill-btn ${format === 'ats-standard' ? 'active' : ''}`}
                                onClick={() => setFormat('ats-standard')}
                            >
                                <span className="material-symbols-outlined">rule_folder</span>
                                <div>
                                    <span className="pill-title">ATS Classic (Recommended)</span>
                                    <span className="pill-desc">Single-column, standard headers, 100% parser compatible</span>
                                </div>
                            </button>

                            <button
                                type="button"
                                className={`format-pill-btn ${format === 'modern-executive' ? 'active' : ''}`}
                                onClick={() => setFormat('modern-executive')}
                            >
                                <span className="material-symbols-outlined">work</span>
                                <div>
                                    <span className="pill-title">Executive Modern</span>
                                    <span className="pill-desc">Sleek styling with competency chips & metric highlights</span>
                                </div>
                            </button>

                            <button
                                type="button"
                                className={`format-pill-btn ${format === 'original-enhanced' ? 'active' : ''}`}
                                onClick={() => setFormat('original-enhanced')}
                            >
                                <span className="material-symbols-outlined">auto_fix_high</span>
                                <div>
                                    <span className="pill-title">Original Enhanced</span>
                                    <span className="pill-desc">Your original resume structure infused with AI updates</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Secondary Toggles & Actions */}
                    <div className="option-column flex-column">
                        <div className="font-scale-control">
                            <label className="option-label">Page Density Scale:</label>
                            <div className="density-buttons">
                                <button
                                    type="button"
                                    className={`btn-density ${fontSize === 'compact' ? 'active' : ''}`}
                                    onClick={() => setFontSize('compact')}
                                >
                                    Compact (1-Page)
                                </button>
                                <button
                                    type="button"
                                    className={`btn-density ${fontSize === 'standard' ? 'active' : ''}`}
                                    onClick={() => setFontSize('standard')}
                                >
                                    Standard
                                </button>
                                <button
                                    type="button"
                                    className={`btn-density ${fontSize === 'spacious' ? 'active' : ''}`}
                                    onClick={() => setFontSize('spacious')}
                                >
                                    Spacious
                                </button>
                            </div>
                        </div>

                        <div className="secondary-buttons-row">
                            <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => setIsEditingContact(!isEditingContact)}
                            >
                                <span className="material-symbols-outlined">edit</span>
                                <span>{isEditingContact ? 'Hide Details Editor' : 'Edit Contact & Summary'}</span>
                            </button>

                            <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={handleDownloadTxt}
                                title="Download standard text format for copy-pasting into ATS job application boxes"
                            >
                                <span className="material-symbols-outlined">text_snippet</span>
                                <span>Download ATS .TXT</span>
                            </button>

                            <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={handleDownloadMd}
                            >
                                <span className="material-symbols-outlined">code</span>
                                <span>Download .MD</span>
                            </button>

                            <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={handleCopyAll}
                            >
                                <span className="material-symbols-outlined">content_copy</span>
                                <span>Copy Text</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Edit Contact Details Form Drawer */}
                {isEditingContact && (
                    <div className="contact-editor-drawer animate-fade-in">
                        <h4>Customize Personal Header & Information:</h4>
                        <div className="editor-fields-grid">
                            <div className="field-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={candidateInfo.name}
                                    onChange={(e) => setCandidateInfo({ ...candidateInfo, name: e.target.value })}
                                />
                            </div>
                            <div className="field-group">
                                <label>Target Role / Headline</label>
                                <input
                                    type="text"
                                    value={candidateInfo.title}
                                    onChange={(e) => setCandidateInfo({ ...candidateInfo, title: e.target.value })}
                                />
                            </div>
                            <div className="field-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={candidateInfo.email}
                                    onChange={(e) => setCandidateInfo({ ...candidateInfo, email: e.target.value })}
                                />
                            </div>
                            <div className="field-group">
                                <label>Phone Number</label>
                                <input
                                    type="text"
                                    value={candidateInfo.phone}
                                    onChange={(e) => setCandidateInfo({ ...candidateInfo, phone: e.target.value })}
                                />
                            </div>
                            <div className="field-group">
                                <label>Location (City, State / Remote)</label>
                                <input
                                    type="text"
                                    value={candidateInfo.location}
                                    onChange={(e) => setCandidateInfo({ ...candidateInfo, location: e.target.value })}
                                />
                            </div>
                            <div className="field-group">
                                <label>LinkedIn / Portfolio URL</label>
                                <input
                                    type="text"
                                    value={candidateInfo.linkedin}
                                    onChange={(e) => setCandidateInfo({ ...candidateInfo, linkedin: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="field-group full-width">
                            <label>Professional Summary (ATS Optimized):</label>
                            <textarea
                                rows={3}
                                value={customSummary}
                                onChange={(e) => setCustomSummary(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {copySuccess && (
                    <div className="copy-toast-banner animate-fade-in">
                        <span className="material-symbols-outlined">check_circle</span>
                        <span>{copySuccess}</span>
                    </div>
                )}
            </div>

            {/* Document Paper Preview Section */}
            <div className="preview-container">
                <div className="preview-meta-bar">
                    <span className="live-badge">
                        <span className="live-dot"></span>
                        Document Preview ({format === 'ats-standard' ? 'ATS Standard Single Column' : format === 'modern-executive' ? 'Executive Modern Styling' : 'Original Resume + AI Enhancements'})
                    </span>
                    <span className="ats-compliance-tag">
                        <span className="material-symbols-outlined">verified</span>
                        ATS Compatibility Score: {atsData?.atsScore || 85}%
                    </span>
                </div>

                {/* Printable Resume Paper Document */}
                <div
                    id="printable-resume-doc"
                    className={`resume-paper-document format-${format} density-${fontSize}`}
                >
                    {/* FORMAT 1: ATS CLASSIC (Maximum ATS Parser Compatibility) */}
                    {format === 'ats-standard' && (
                        <div className="ats-classic-layout">
                            <header className="resume-header">
                                <h1 className="candidate-name">{candidateInfo.name}</h1>
                                <p className="candidate-headline">{candidateInfo.title}</p>
                                <div className="contact-line">
                                    <span>{candidateInfo.email}</span>
                                    <span className="sep">•</span>
                                    <span>{candidateInfo.phone}</span>
                                    <span className="sep">•</span>
                                    <span>{candidateInfo.location}</span>
                                    {candidateInfo.linkedin && (
                                        <>
                                            <span className="sep">•</span>
                                            <span>{candidateInfo.linkedin}</span>
                                        </>
                                    )}
                                </div>
                            </header>

                            {/* Summary */}
                            {customSummary && (
                                <section className="doc-section">
                                    <h2 className="section-title">PROFESSIONAL SUMMARY</h2>
                                    <p className="summary-paragraph">{customSummary}</p>
                                </section>
                            )}

                            {/* Skills Section */}
                            {(skillsHard.length > 0 || skillsTools.length > 0 || skillsSoft.length > 0) && (
                                <section className="doc-section">
                                    <h2 className="section-title">TECHNICAL SKILLS & CORE COMPETENCIES</h2>
                                    <ul className="ats-skills-list">
                                        {skillsHard.length > 0 && (
                                            <li>
                                                <strong>Core Technical Skills:</strong> {skillsHard.join(', ')}
                                            </li>
                                        )}
                                        {skillsTools.length > 0 && (
                                            <li>
                                                <strong>Tools, Cloud & Frameworks:</strong> {skillsTools.join(', ')}
                                            </li>
                                        )}
                                        {skillsSoft.length > 0 && (
                                            <li>
                                                <strong>Methodologies & Leadership:</strong> {skillsSoft.join(', ')}
                                            </li>
                                        )}
                                    </ul>
                                </section>
                            )}

                            {/* Professional Experience */}
                            <section className="doc-section">
                                <h2 className="section-title">PROFESSIONAL EXPERIENCE</h2>
                                {parsedData.experience.length > 0 ? (
                                    parsedData.experience.map((exp, idx) => (
                                        <div key={idx} className="job-entry">
                                            <div className="job-heading-row">
                                                <span className="job-title">{exp.role} {exp.company ? `— ${exp.company}` : ''}</span>
                                                <span className="job-dates">{exp.dates}</span>
                                            </div>
                                            <ul className="job-bullets">
                                                {exp.bullets.map((b, bIdx) => (
                                                    <li key={bIdx}>{b}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))
                                ) : bulletRewrites.length > 0 ? (
                                    <div className="job-entry">
                                        <div className="job-heading-row">
                                            <span className="job-title">{candidateInfo.title}</span>
                                            <span className="job-dates">Recent Track Record</span>
                                        </div>
                                        <ul className="job-bullets">
                                            {bulletRewrites.map((b, i) => (
                                                <li key={i}>{cleanText(b.improvedBullet)}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : null}
                            </section>

                            {/* Projects */}
                            {parsedData.projects.length > 0 && (
                                <section className="doc-section">
                                    <h2 className="section-title">KEY TECHNICAL PROJECTS</h2>
                                    {parsedData.projects.map((proj, pIdx) => (
                                        <div key={pIdx} className="job-entry">
                                            <div className="job-heading-row">
                                                <span className="job-title">{proj.title}</span>
                                            </div>
                                            <ul className="job-bullets">
                                                {proj.bullets.map((b, bIdx) => (
                                                    <li key={bIdx}>{b}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </section>
                            )}

                            {/* Education */}
                            {parsedData.education.length > 0 && (
                                <section className="doc-section">
                                    <h2 className="section-title">EDUCATION & CREDENTIALS</h2>
                                    {parsedData.education.map((ed, eIdx) => (
                                        <p key={eIdx} className="raw-doc-line">• {ed}</p>
                                    ))}
                                </section>
                            )}
                        </div>
                    )}

                    {/* FORMAT 2: MODERN EXECUTIVE */}
                    {format === 'modern-executive' && (
                        <div className="modern-executive-layout">
                            <header className="executive-header">
                                <div className="header-primary-col">
                                    <h1 className="candidate-name">{candidateInfo.name}</h1>
                                    <p className="candidate-role-badge">{candidateInfo.title}</p>
                                </div>
                                <div className="header-contact-col">
                                    <div className="contact-item">
                                        <span className="label">EMAIL:</span> {candidateInfo.email}
                                    </div>
                                    <div className="contact-item">
                                        <span className="label">PHONE:</span> {candidateInfo.phone}
                                    </div>
                                    <div className="contact-item">
                                        <span className="label">LOCATION:</span> {candidateInfo.location}
                                    </div>
                                    {candidateInfo.linkedin && (
                                        <div className="contact-item">
                                            <span className="label">LINK:</span> {candidateInfo.linkedin}
                                        </div>
                                    )}
                                </div>
                            </header>

                            <div className="header-accent-bar"></div>

                            {/* Executive Summary */}
                            {customSummary && (
                                <section className="executive-section">
                                    <h3 className="section-header-tag">EXECUTIVE PROFILE</h3>
                                    <p className="executive-summary-text">{customSummary}</p>
                                </section>
                            )}

                            {/* Skill Competency Tags */}
                            {(skillsHard.length > 0 || skillsTools.length > 0) && (
                                <section className="executive-section">
                                    <h3 className="section-header-tag">KEY COMPETENCIES & STACK</h3>
                                    <div className="modern-skill-chips-row">
                                        {[...skillsHard, ...skillsTools].map((skill, idx) => (
                                            <span key={idx} className="modern-skill-chip">{skill}</span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Experience Section */}
                            <section className="executive-section">
                                <h3 className="section-header-tag">PROFESSIONAL IMPACT</h3>
                                {parsedData.experience.length > 0 ? (
                                    parsedData.experience.map((exp, idx) => (
                                        <div key={idx} className="executive-role-card">
                                            <div className="role-meta-header">
                                                <div>
                                                    <h4 className="role-title">{exp.role}</h4>
                                                    <span className="company-sub">{exp.company}</span>
                                                </div>
                                                <span className="date-badge">{exp.dates}</span>
                                            </div>
                                            <ul className="executive-bullets-list">
                                                {exp.bullets.map((b, bIdx) => (
                                                    <li key={bIdx} className="bullet-row">
                                                        <span className="bullet-icon">▸</span>
                                                        <span className="bullet-text">{b}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))
                                ) : bulletRewrites.length > 0 ? (
                                    <div className="executive-role-card">
                                        <div className="role-meta-header">
                                            <h4 className="role-title">{candidateInfo.title}</h4>
                                            <span className="date-badge">Demonstrated Impact</span>
                                        </div>
                                        <ul className="executive-bullets-list">
                                            {bulletRewrites.map((b, i) => (
                                                <li key={i} className="bullet-row">
                                                    <span className="bullet-icon">▸</span>
                                                    <span className="bullet-text">{cleanText(b.improvedBullet)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : null}
                            </section>

                            {/* Education */}
                            {parsedData.education.length > 0 && (
                                <section className="executive-section">
                                    <h3 className="section-header-tag">EDUCATION & CREDENTIALS</h3>
                                    {parsedData.education.map((ed, idx) => (
                                        <p key={idx} className="raw-doc-line">{ed}</p>
                                    ))}
                                </section>
                            )}
                        </div>
                    )}

                    {/* FORMAT 3: ORIGINAL STRUCTURE ENHANCED */}
                    {format === 'original-enhanced' && (
                        <div className="original-enhanced-layout">
                            <header className="original-header">
                                <h1 className="name">{candidateInfo.name}</h1>
                                <p className="contacts">
                                    {candidateInfo.email} | {candidateInfo.phone} | {candidateInfo.location} | {candidateInfo.linkedin}
                                </p>
                            </header>

                            <div className="original-body-content">
                                {customSummary && (
                                    <div className="enhanced-section">
                                        <h3 className="enhanced-title">Professional Summary</h3>
                                        <p className="enhanced-content">{customSummary}</p>
                                    </div>
                                )}

                                {(skillsHard.length > 0 || skillsTools.length > 0) && (
                                    <div className="enhanced-section">
                                        <h3 className="enhanced-title">Core Technical Expertise</h3>
                                        <p className="enhanced-content">
                                            <strong>Key Technologies:</strong> {[...skillsHard, ...skillsTools].join(', ')}
                                            {skillsSoft.length > 0 && (
                                                <span><br /><strong>Methodologies & Leadership:</strong> {skillsSoft.join(', ')}</span>
                                            )}
                                        </p>
                                    </div>
                                )}

                                <div className="enhanced-section">
                                    <h3 className="enhanced-title">Work Experience & Quantified Impact</h3>
                                    {parsedData.experience.length > 0 ? (
                                        parsedData.experience.map((exp, idx) => (
                                            <div key={idx} className="job-entry-enhanced">
                                                <div className="job-heading-row">
                                                    <strong>{exp.role} — {exp.company}</strong>
                                                    <span>{exp.dates}</span>
                                                </div>
                                                <ul className="enhanced-bullets">
                                                    {exp.bullets.map((b, bIdx) => (
                                                        <li key={bIdx}>{b}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))
                                    ) : bulletRewrites.length > 0 ? (
                                        <ul className="enhanced-bullets">
                                            {bulletRewrites.map((b, i) => (
                                                <li key={i}>{cleanText(b.improvedBullet)}</li>
                                            ))}
                                        </ul>
                                    ) : null}
                                </div>

                                {parsedData.education.length > 0 && (
                                    <div className="enhanced-section">
                                        <h3 className="enhanced-title">Education</h3>
                                        {parsedData.education.map((ed, idx) => (
                                            <p key={idx} className="enhanced-content">• {ed}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResumeExportStudio;
