// src/components/ColorContextCard.jsx
// Displays color context: emotional, cultural, industry, and mood information

import React from 'react';
import DashboardCard from './DashboardCard';
import '../styles/dashboard.css';

const ColorContextCard = ({ color, contextData, index, moveCard, isExpanded, onToggleExpand }) => {
    if (!contextData) return null;

    const { emotional, cultural, industry, moods } = contextData;

    return (
        <DashboardCard
            id="color-context"
            title="Color Context"
            isDraggable={true}
            index={index}
            moveCard={moveCard}
            isExpanded={isExpanded}
            onToggle={onToggleExpand}
        >
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
        </DashboardCard>
    );
};

export default ColorContextCard;
