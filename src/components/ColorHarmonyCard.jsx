// src/components/ColorHarmonyCard.jsx
// Displays color harmony schemes with interactive swatches

import React from 'react';
import DashboardCard from './DashboardCard';
import '../styles/dashboard.css';

const ColorHarmonyCard = ({ baseColor, colorHarmonies, onHarmonySelect, index, moveCard, isExpanded, onToggleExpand }) => {
    const harmonyTypes = [
        { key: 'complementary', label: 'Complementary' },
        { key: 'analogous', label: 'Analogous' },
        { key: 'splitComplementary', label: 'Split Complementary' },
        { key: 'triadic', label: 'Triadic' },
        { key: 'tetradic', label: 'Square' },
        { key: 'monochromatic', label: 'Monochromatic' },
    ];

    const handleHarmonyClick = (colors) => {
        if (onHarmonySelect) {
            onHarmonySelect(colors);
        }
    };

    return (
        <DashboardCard
            id="color-harmony"
            title="Color Harmonies"
            isDraggable={true}
            index={index}
            moveCard={moveCard}
            isExpanded={isExpanded}
            onToggle={onToggleExpand}
        >
            <p style={{ fontSize: '0.85rem', color: 'var(--dashboard-text-muted)', marginBottom: '1rem' }}>
                Click any harmony to apply it to your palette
            </p>

            {harmonyTypes.map((harmonyType) => {
                const colors = colorHarmonies[harmonyType.key];
                if (!colors || colors.length === 0) return null;

                return (
                    <div key={harmonyType.key} className="harmony-group">
                        <div className="harmony-label">{harmonyType.label}</div>
                        <div
                            className="harmony-swatches"
                            onClick={() => handleHarmonyClick(colors)}
                            title={`Apply ${harmonyType.label} harmony to palette`}
                        >
                            {colors.map((color, idx) => (
                                <div
                                    key={idx}
                                    className="harmony-swatch"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </DashboardCard>
    );
};

export default ColorHarmonyCard;
