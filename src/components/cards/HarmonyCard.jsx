// src/components/cards/HarmonyCard.jsx
// Displays color harmonies (complementary, analogous, triadic, etc.)

import React from 'react';
import DashboardCard from '../DashboardCard';

const harmonyTypes = ['complementary', 'analogous', 'triadic', 'tetradic', 'splitComplementary', 'monochromatic'];
const harmonyLabels = {
    complementary: 'Complementary',
    analogous: 'Analogous',
    triadic: 'Triadic',
    tetradic: 'Tetradic',
    splitComplementary: 'Split Comp.',
    monochromatic: 'Monochromatic'
};

const renderSwatches = (colors, size = '100%') => (
    <div style={{ display: 'flex', gap: '0', width: '100%', height: '24px', borderRadius: '0', overflow: 'hidden' }}>
        {colors?.map((color, idx) => (
            <div
                key={idx}
                style={{
                    flex: 1,
                    background: color,
                    borderRight: '1px solid rgba(0,0,0,0.05)'
                }}
                title={color}
            />
        ))}
    </div>
);

export const HarmonyPreview = ({ harmonies }) => {
    if (!harmonies) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', justifyContent: 'center' }}>
            {harmonyTypes.slice(0, 3).map(type => harmonies[type] && (
                <div key={type} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.05em' }}>
                        {harmonyLabels[type]}
                    </div>
                    {renderSwatches(harmonies[type], '100%')}
                </div>
            ))}
        </div>
    );
};

export const HarmonyDetail = ({ harmonies, onHarmonySelect }) => {
    if (!harmonies) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {harmonyTypes.map(type => harmonies[type] && (
                <div
                    key={type}
                    onClick={() => onHarmonySelect && onHarmonySelect(harmonies[type])}
                    style={{
                        padding: '0.75rem',
                        background: '#f9fafb',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}
                >
                    <div style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#374151',
                        marginBottom: '0.5rem'
                    }}>
                        {harmonyLabels[type]}
                    </div>
                    {renderSwatches(harmonies[type], '36px')}
                    <div style={{
                        fontSize: '0.7rem',
                        color: '#9ca3af',
                        marginTop: '0.5rem'
                    }}>
                        Click to apply this harmony to your palette
                    </div>
                </div>
            ))}
        </div>
    );
};

const HarmonyCard = ({ harmonies, onHarmonySelect, isExpanded, onToggle }) => {
    if (!harmonies) {
        return null;
    }

    return (
        <DashboardCard
            id="harmony"
            title="Color Harmonies"
            isExpanded={isExpanded}
            onToggle={onToggle}
            previewContent={<HarmonyPreview harmonies={harmonies} />}
        >
            <HarmonyDetail harmonies={harmonies} onHarmonySelect={onHarmonySelect} />
        </DashboardCard>
    );
};

export default HarmonyCard;
