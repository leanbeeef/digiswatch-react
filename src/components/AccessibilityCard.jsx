// src/components/AccessibilityCard.jsx
import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import DashboardCard from './DashboardCard';
import tinycolor from 'tinycolor2';

// Helper functions moved out or kept if simple. 
// For complexity, I'll keep helper logic inside components or duplicated cleanly.

const checkCompliance = (ratio) => ({
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
    aaaLarge: ratio >= 4.5
});

export const AccessibilityPreview = ({ color }) => {
    const contrastWhite = tinycolor.readability(color, '#ffffff');
    const contrastBlack = tinycolor.readability(color, '#000000');

    // Summary logic
    const bestRatio = Math.max(contrastWhite, contrastBlack);
    const bestBg = contrastWhite > contrastBlack ? 'white' : 'black';
    const bestCompliance = checkCompliance(bestRatio);

    let level = 'Fail';
    if (bestCompliance.aaaNormal) level = 'AAA';
    else if (bestCompliance.aaNormal) level = 'AA';
    else if (bestCompliance.aaaLarge) level = 'AAA Large';
    else if (bestCompliance.aaLarge) level = 'AA Large';

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', height: '100%', justifyContent: 'flex-start' }}>
            <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '5px',
                background: color,
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}>
                <i className="bi bi-universal-access" style={{
                    color: bestBg === 'white' ? '#fff' : '#000',
                    fontSize: '2rem'
                }}></i>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>
                    {level}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '4px' }}>
                    Highest Contrast: <strong>{bestRatio.toFixed(1)}:1</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    WCAG 2.1 Standard
                </div>
            </div>
        </div>
    );
};

export const AccessibilityDetail = ({ color }) => {
    // Calculate contrast ratios
    const contrastWhite = tinycolor.readability(color, '#ffffff');
    const contrastBlack = tinycolor.readability(color, '#000000');

    const whiteCompliance = checkCompliance(contrastWhite);
    const blackCompliance = checkCompliance(contrastBlack);

    const renderLargePreview = (bgColor, label, ratio, compliance) => (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid var(--dashboard-border)', borderRadius: '5px'  }}>
            {/* Visual Preview */}
            <div style={{
                flex: 1,
                background: bgColor,
                color: color,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '120px',
                padding: '1rem',
                borderRadius: '5px 5px 0px 0px'
            }}>
                <span style={{ fontSize: '3.5rem', fontWeight: 700, lineHeight: 1 }}>Aa</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 500, marginTop: '0.5rem' }}>Text Preview</span>
            </div>

            {/* Data Footer */}
            <div style={{ padding: '1rem', background: 'var(--dashboard-surface)', borderTop: '1px solid var(--dashboard-border)', borderRadius: '0px 0px 5px 5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem', borderRadius: '0px 0px 5px 5px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#666' }}>On {label}</span>
                    <span style={{ fontWeight: 800, fontSize: '1.4rem', fontFamily: 'monospace' }}>{ratio.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, textAlign: 'center', padding: '4px', background: compliance.aaNormal ? '#dcfce7' : '#fee2e2', color: compliance.aaNormal ? '#166534' : '#991b1b', fontSize: '0.8rem', fontWeight: 700, borderRadius: 5 }}>
                        AA {compliance.aaNormal ? 'PASS' : 'FAIL'}
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', padding: '4px', background: compliance.aaaNormal ? '#dcfce7' : '#fee2e2', color: compliance.aaaNormal ? '#166534' : '#991b1b', fontSize: '0.8rem', fontWeight: 700, borderRadius: 5 }}>
                        AAA {compliance.aaaNormal ? 'PASS' : 'FAIL'}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', gap: '0', height: '100%', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                {renderLargePreview('#ffffff', 'White', contrastWhite, whiteCompliance)}
                {renderLargePreview('#000000', 'Black', contrastBlack, blackCompliance)}
            </div>
        </div>
    );
};

const AccessibilityCard = ({ color, colorInfo, index, moveCard, isExpanded, onToggleExpand, onClose, isDraggable }) => {
    return (
        <DashboardCard
            index={index}
            title="Accessibility"
            moveCard={moveCard}
            isExpanded={isExpanded}
            onToggle={onToggleExpand}
            onClose={onClose}
            isDraggable={isDraggable}
            previewContent={<AccessibilityPreview color={color} />}
        >
            <AccessibilityDetail color={color} />
        </DashboardCard>
    );
};

export default AccessibilityCard;
