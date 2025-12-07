// src/components/AccessibilityCard.jsx
import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import DashboardCard from './DashboardCard';
import tinycolor from 'tinycolor2';

const AccessibilityCard = ({ color, colorInfo, index, moveCard, isExpanded, onToggleExpand, onClose, isDraggable }) => {
    // Calculate contrast ratios
    const contrastWhite = tinycolor.readability(color, '#ffffff');
    const contrastBlack = tinycolor.readability(color, '#000000');

    // WCAG compliance thresholds
    const AA_NORMAL = 4.5;
    const AA_LARGE = 3;
    const AAA_NORMAL = 7;
    const AAA_LARGE = 4.5;

    // Check compliance
    const checkCompliance = (ratio) => ({
        aaNormal: ratio >= AA_NORMAL,
        aaLarge: ratio >= AA_LARGE,
        aaaNormal: ratio >= AAA_NORMAL,
        aaaLarge: ratio >= AAA_LARGE
    });

    const whiteCompliance = checkCompliance(contrastWhite);
    const blackCompliance = checkCompliance(contrastBlack);

    // Helper to get badge variant
    const getBadgeVariant = (passes) => passes ? 'success' : 'danger';

    // Helper to render compliance row
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

    // Summary for preview
    const getComplianceSummary = () => {
        const bestRatio = Math.max(contrastWhite, contrastBlack);
        const bestBg = contrastWhite > contrastBlack ? 'white' : 'black';
        const bestCompliance = contrastWhite > contrastBlack ? whiteCompliance : blackCompliance;

        let level = 'Fail';
        if (bestCompliance.aaaNormal) level = 'AAA';
        else if (bestCompliance.aaNormal) level = 'AA';
        else if (bestCompliance.aaaLarge) level = 'AAA Large';
        else if (bestCompliance.aaLarge) level = 'AA Large';

        return { level, ratio: bestRatio, bg: bestBg };
    };

    const summary = getComplianceSummary();

    return (
        <DashboardCard
            index={index}
            title="Accessibility"
            moveCard={moveCard}
            isExpanded={isExpanded}
            onToggle={onToggleExpand}
            onClose={onClose}
            isDraggable={isDraggable}
            previewContent={
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: color,
                        border: '1px solid var(--dashboard-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <i className="bi bi-universal-access" style={{
                            color: summary.bg === 'white' ? '#fff' : '#000',
                            fontSize: '1rem'
                        }}></i>
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: 600 }}>
                            {summary.level}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--dashboard-text-muted)' }}>
                            Best: {summary.ratio.toFixed(1)}:1
                        </div>
                    </div>
                </div>
            }
        >
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
        </DashboardCard>
    );
};

export default AccessibilityCard;
