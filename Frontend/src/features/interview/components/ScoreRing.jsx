import React from 'react';

const ScoreRing = ({ score = 0, size = 150, strokeWidth = 11, label = "MATCH", sublabel = "" }) => {
    const validScore = Math.min(100, Math.max(0, Math.round(score || 0)));
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (validScore / 100) * circumference;

    // Pick stroke color based on score
    let strokeColor = "#006a61"; // Teal (high)
    let badgeBg = "rgba(0, 106, 97, 0.1)";
    if (validScore < 50) {
        strokeColor = "#ba1a1a"; // Red
        badgeBg = "rgba(186, 26, 26, 0.1)";
    } else if (validScore < 75) {
        strokeColor = "#d97705"; // Amber
        badgeBg = "rgba(217, 119, 5, 0.1)";
    }

    return (
        <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg
                width={size}
                height={size}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            >
                {/* Background Ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="#e5eeff"
                    strokeWidth={strokeWidth}
                />
                {/* Progress Ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{
                        transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.4s ease'
                    }}
                />
            </svg>

            {/* Inner Content */}
            <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
            }}>
                <span style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: `${size * 0.24}px`,
                    fontWeight: 700,
                    lineHeight: 1,
                    color: 'var(--primary)',
                    letterSpacing: '-0.02em'
                }}>
                    {validScore}%
                </span>
                {label && (
                    <span style={{
                        fontFamily: 'var(--font-data)',
                        fontSize: `${Math.max(10, size * 0.08)}px`,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        color: 'var(--on-surface-variant)',
                        marginTop: '4px',
                        textTransform: 'uppercase'
                    }}>
                        {label}
                    </span>
                )}
                {sublabel && (
                    <span style={{
                        fontSize: '11px',
                        color: strokeColor,
                        fontWeight: 600
                    }}>
                        {sublabel}
                    </span>
                )}
            </div>
        </div>
    );
};

export default ScoreRing;
