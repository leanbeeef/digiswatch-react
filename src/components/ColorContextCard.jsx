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
                    <div style={{ width: '16px', height: '16px', borderRadius: '0', background: color || '#ccc' }}></div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#999' }}>No Context Data</span>
                </div>
            </div>
        );
    }
    const { emotional, moods } = contextData;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%', justifyContent: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '0', background: color, flexShrink: 0 }}></div>
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

    const cardStyle = {
        border: '1px solid var(--dashboard-border)',
        padding: '1rem',
        background: 'var(--dashboard-surface)',
        height: '100%',
        display: 'flex',
        borderRadius: '6px',
        flexDirection: 'column',
        justifyContent: 'space-between'
    };

    const titleStyle = {
        fontSize: '0.95rem',
        fontWeight: 700,
        marginBottom: '0.5rem',
        color: 'var(--dashboard-text)'
    };

    const textStyle = {
        fontSize: '0.9rem',
        lineHeight: 1.5,
        color: 'var(--dashboard-text-muted)'
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.7rem', height: '100%' }}>
            {/* Emotional Context */}
            {emotional && (
                <div style={cardStyle}>
                    <div>
                        <h4 style={titleStyle}>Emotional</h4>
                        <p style={textStyle}>{emotional.description}</p>
                    </div>

                </div>
            )}

            {/* Mood Descriptors */}
            {moods && moods.length > 0 && (
                <div style={cardStyle}>
                    <div>
                        <h4 style={titleStyle}>Mood</h4>
                        <div className="context-tags" style={{ gap: '6px' }}>
                            {moods.slice(0, 8).map((mood, idx) => (
                                <span key={idx} className="context-tag" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>{mood}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Cultural Symbolism */}
            {cultural && (
                <div style={{ ...cardStyle, gridColumn: 'span 2' }}>
                    <h4 style={titleStyle}>Cultural Symbolism</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--dashboard-text)', display: 'block', marginBottom: '4px' }}>Western</strong>
                            <p style={textStyle}>{cultural.western}</p>
                        </div>
                        <div>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--dashboard-text)', display: 'block', marginBottom: '4px' }}>Eastern</strong>
                            <p style={textStyle}>{cultural.eastern}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Industry Usage */}
            {industry && (
                <div style={{ ...cardStyle, gridColumn: 'span 2' }}>
                    <div>
                        <h4 style={titleStyle}>Industry Usage</h4>
                        <div className="context-tags" style={{ gap: '6px' }}>
                            {industry.examples.map((example, idx) => (
                                <span key={idx} className="context-tag" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>{example}</span>
                            ))}
                        </div>
                    </div>
                    {industry.note && (
                        <p style={{ ...textStyle, marginTop: '0.75rem', fontStyle: 'italic', fontSize: '0.85rem' }}>Note: {industry.note}</p>
                    )}
                </div>
            )}
        </div>
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
