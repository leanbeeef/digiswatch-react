// src/components/ColorContextCard.jsx
// Displays color context: emotional, cultural, industry, and mood information

import React from 'react';
import DashboardCard from './DashboardCard';
import '../styles/dashboard.css';

export const ColorContextPreview = ({ color, contextData }) => {
    if (!contextData) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: color || '#ccc' }}></div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#999' }}>No Context Data</span>
                </div>
            </div>
        );
    }
    const { emotional, moods } = contextData;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%', justifyContent: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: color, flexShrink: 0 }}></div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.2 }}>{emotional?.description?.split('.')[0] || 'Context'}</span>
                    <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Based on psychological associations</span>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {moods?.slice(0, 4).map((mood, i) => (
                    <span key={i} style={{ fontSize: '0.75rem', background: '#f5f5f4', color: '#57534e', padding: '4px 8px', borderRadius: '0', fontWeight: 500 }}>{mood}</span>
                ))}
            </div>
        </div>
    );
};

export const ColorContextDetail = ({ contextData }) => {
    if (!contextData) return <div className="p-3 text-muted">No context data available for this color.</div>;

    const { emotional, cultural, industry, moods } = contextData;

    return (
        <React.Fragment>
            {/* Emotional Context */}
            {emotional && (
                <div className="context-section">
                    <h4 className="context-section-title">Emotional Meaning</h4>
                    <p className="context-section-content">{emotional.description}</p>
                    <div className="context-tags" style={{ marginTop: '0.5rem' }}>
                        <span className="context-tag">{emotional.temperature}</span>
                        <span className="context-tag">{emotional.energy}</span>
                    </div>
                </div>
            )}

            {/* Cultural Symbolism */}
            {cultural && (
                <div className="context-section">
                    <h4 className="context-section-title">Cultural Symbolism</h4>
                    <div style={{ marginBottom: '0.5rem' }}>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--dashboard-text)' }}>
                            Western:
                        </strong>
                        <p className="context-section-content" style={{ marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                            {cultural.western}
                        </p>
                    </div>
                    <div>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--dashboard-text)' }}>
                            Eastern:
                        </strong>
                        <p className="context-section-content" style={{ marginTop: '0.25rem' }}>
                            {cultural.eastern}
                        </p>
                    </div>
                </div>
            )}

            {/* Industry Usage */}
            {industry && (
                <div className="context-section">
                    <h4 className="context-section-title">Industry Usage</h4>
                    <div className="context-tags">
                        {industry.examples.map((example, idx) => (
                            <span key={idx} className="context-tag">{example}</span>
                        ))}
                    </div>
                    {industry.note && (
                        <p className="context-section-content" style={{ marginTop: '0.5rem' }}>
                            {industry.note}
                        </p>
                    )}
                </div>
            )}

            {/* Mood Descriptors */}
            {moods && moods.length > 0 && (
                <div className="context-section">
                    <h4 className="context-section-title">Mood</h4>
                    <div className="context-tags">
                        {moods.map((mood, idx) => (
                            <span key={idx} className="context-tag">{mood}</span>
                        ))}
                    </div>
                </div>
            )}
        </React.Fragment>
    );
};

const ColorContextCard = ({ color, contextData, index, moveCard, isExpanded, onToggleExpand }) => {
    return (
        <DashboardCard
            id="color-context"
            title="Color Context"
            isDraggable={true}
            index={index}
            moveCard={moveCard}
            isExpanded={isExpanded}
            onToggle={onToggleExpand}
            previewContent={<ColorContextPreview color={color} contextData={contextData} />}
        >
            <ColorContextDetail contextData={contextData} />
        </DashboardCard>
    );
};

export default ColorContextCard;
