import React from 'react';

const SkillGapCard = ({ skill, severity = 'medium', recommendation }) => {
    let borderColor = 'var(--secondary)';
    let badgeClass = 'badge-success';
    let badgeLabel = 'LOW';

    if (severity === 'high') {
        borderColor = 'var(--error)';
        badgeClass = 'badge-danger';
        badgeLabel = 'HIGH PRIORITY';
    } else if (severity === 'medium') {
        borderColor = 'var(--tertiary)';
        badgeClass = 'badge-warning';
        badgeLabel = 'MEDIUM';
    }

    return (
        <div style={{
            backgroundColor: 'var(--surface-card)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--outline-variant)',
            borderLeft: `4px solid ${borderColor}`,
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem',
            marginBottom: '0.75rem',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
        }}>
            <div style={{ flex: 1 }}>
                <h4 style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    marginBottom: '0.25rem'
                }}>
                    {skill}
                </h4>
                {recommendation && (
                    <p style={{
                        fontSize: '0.85rem',
                        color: 'var(--on-surface-variant)',
                        lineHeight: 1.45
                    }}>
                        {recommendation}
                    </p>
                )}
            </div>
            <span className={`badge ${badgeClass}`} style={{ flexShrink: 0, marginTop: '2px' }}>
                {badgeLabel}
            </span>
        </div>
    );
};

export default SkillGapCard;
