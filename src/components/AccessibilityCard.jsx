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
                borderRadius: '0',
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

    const getBadgeVariant = (passes) => passes ? 'success' : 'danger';

    const renderComplianceRow = (bgColor, bgLabel, ratio, compliance) => (
        <div className="mb-3 p-3 border rounded" style={{ background: 'var(--dashboard-surface)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center gap-2">
                    <div
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            background: bgColor,
                            border: '2px solid var(--dashboard-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: color,
                            fontWeight: 'bold',
                            fontSize: '0.85rem'
                        }}
                    >
                        A
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                            On {bgLabel}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--dashboard-text-muted)' }}>
                            Ratio: {ratio.toFixed(2)}:1
                        </div>
                    </div>
                </div>
            </div>

            <div className="d-flex flex-wrap gap-2">
                <div style={{ flex: '1 1 45%' }}>
                    <small className="text-muted d-block mb-1">Normal Text</small>
                    <div className="d-flex gap-1">
                        <Badge bg={getBadgeVariant(compliance.aaNormal)} style={{ fontSize: '0.7rem' }}>
                            AA {compliance.aaNormal ? '✓' : '✗'}
                        </Badge>
                        <Badge bg={getBadgeVariant(compliance.aaaNormal)} style={{ fontSize: '0.7rem' }}>
                            AAA {compliance.aaaNormal ? '✓' : '✗'}
                        </Badge>
                    </div>
                </div>
                <div style={{ flex: '1 1 45%' }}>
                    <small className="text-muted d-block mb-1">Large Text</small>
                    <div className="d-flex gap-1">
                        <Badge bg={getBadgeVariant(compliance.aaLarge)} style={{ fontSize: '0.7rem' }}>
                            AA {compliance.aaLarge ? '✓' : '✗'}
                        </Badge>
                        <Badge bg={getBadgeVariant(compliance.aaaLarge)} style={{ fontSize: '0.7rem' }}>
                            AAA {compliance.aaaLarge ? '✓' : '✗'}
                        </Badge>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <Card.Body>
            <div className="mb-3">
                <small className="text-muted d-block mb-2">
                    WCAG 2.1 Contrast Compliance
                </small>
            </div>

            {renderComplianceRow('#ffffff', 'White', contrastWhite, whiteCompliance)}
            {renderComplianceRow('#000000', 'Black', contrastBlack, blackCompliance)}

            <div className="mt-3 p-2 rounded" style={{ background: '#f8f9fa', fontSize: '0.75rem' }}>
                <div className="mb-2" style={{ fontWeight: 600 }}>
                    <i className="bi bi-info-circle me-1"></i>
                    WCAG Guidelines
                </div>
                <div style={{ color: 'var(--dashboard-text-muted)' }}>
                    <div>• Normal text: AA requires 4.5:1, AAA requires 7:1</div>
                    <div>• Large text (18pt+): AA requires 3:1, AAA requires 4.5:1</div>
                </div>
            </div>
        </Card.Body>
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
