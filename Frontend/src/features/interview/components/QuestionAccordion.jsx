import React, { useState } from 'react';

const QuestionAccordion = ({ type = 'technical', question, intention, answer, index }) => {
    const [isOpen, setIsOpen] = useState(false);

    const isTechnical = type === 'technical';
    const iconName = isTechnical ? 'terminal' : 'groups';
    const typeLabel = isTechnical ? 'Technical' : 'Behavioral';

    return (
        <div style={{
            backgroundColor: 'var(--surface-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--outline-variant)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
            marginBottom: '0.75rem',
            transition: 'border-color 0.2s'
        }}>
            {/* Header / Clickable Toggle */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    backgroundColor: isOpen ? 'var(--surface-container-low)' : 'transparent',
                    transition: 'background-color 0.2s'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, paddingRight: '1rem' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isTechnical ? 'var(--primary)' : 'var(--secondary)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            {iconName}
                        </span>
                    </div>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                            <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                                {typeLabel} #{index}
                            </span>
                        </div>
                        <h4 style={{
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            color: 'var(--primary)',
                            lineHeight: 1.35
                        }}>
                            {question}
                        </h4>
                    </div>
                </div>

                <span
                    className="material-symbols-outlined"
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                        color: 'var(--on-surface-variant)',
                        flexShrink: 0
                    }}
                >
                    expand_more
                </span>
            </div>

            {/* Collapsible Content */}
            {isOpen && (
                <div style={{
                    padding: '1.25rem',
                    backgroundColor: 'var(--surface-container-low)',
                    borderTop: '1px solid var(--outline-variant)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    {intention && (
                        <div style={{
                            backgroundColor: '#ffffff',
                            padding: '0.85rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--outline-variant)'
                        }}>
                            <span style={{
                                display: 'block',
                                fontFamily: 'var(--font-data)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: 'var(--on-surface-variant)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                marginBottom: '0.3rem'
                            }}>
                                Interviewer Intention:
                            </span>
                            <p style={{ fontSize: '0.875rem', color: 'var(--on-surface)', lineHeight: 1.45 }}>
                                {intention}
                            </p>
                        </div>
                    )}

                    {answer && (
                        <div style={{
                            backgroundColor: '#ffffff',
                            padding: '0.85rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--outline-variant)',
                            borderLeft: '3px solid var(--secondary)'
                        }}>
                            <span style={{
                                display: 'block',
                                fontFamily: 'var(--font-data)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: 'var(--secondary)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                marginBottom: '0.3rem'
                            }}>
                                Recommended Strategy & Key Points:
                            </span>
                            <p style={{ fontSize: '0.875rem', color: 'var(--on-surface)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                                {answer}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuestionAccordion;
