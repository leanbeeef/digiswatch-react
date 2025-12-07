// src/components/ColorDataCard.jsx
// Displays comprehensive color data with copy functionality

import React from 'react';
import DashboardCard from './DashboardCard';
import tinycolor from 'tinycolor2';
import '../styles/dashboard.css';

const ColorDataCard = ({ color, colorInfo, index, moveCard, isExpanded, onToggleExpand }) => {
    const [copiedFormat, setCopiedFormat] = React.useState(null);

    const copyToClipboard = (value, format) => {
        navigator.clipboard.writeText(value).then(() => {
            setCopiedFormat(format);
            setTimeout(() => setCopiedFormat(null), 2000);
        });
    };

    // Calculate contrast ratios
    const contrastWithWhite = tinycolor.readability(color, '#FFFFFF');
    const contrastWithBlack = tinycolor.readability(color, '#000000');

    const colorFormats = [
        { label: 'HEX', value: colorInfo.hex },
        { label: 'RGB', value: colorInfo.rgb },
        { label: 'HSL', value: colorInfo.hsl },
        { label: 'OKLCH', value: colorInfo.oklch },
        { label: 'LAB', value: colorInfo.lab },
        { label: 'CMYK', value: colorInfo.cmyk },
        { label: 'HSV', value: colorInfo.hsv },
    ];

    return (
        <DashboardCard
            id="color-data"
            title="Color Data"
            isDraggable={true}
            index={index}
            moveCard={moveCard}
            isExpanded={isExpanded}
            onToggle={onToggleExpand}
            previewContent={
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: color, border: '1px solid var(--dashboard-border)' }}></div>
                    <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 600 }}>
                        {colorInfo.hex}
                    </div>
                </div>
            }
        >
            {/* Color Preview */}
            <div className="color-preview-swatch" style={{ backgroundColor: color }}>
                <div className="color-preview-overlay">{colorInfo.hex}</div>
            </div>

            {/* Color Formats */}
            <div style={{ marginBottom: '1rem' }}>
                {colorFormats.map((format) => (
                    <div key={format.label} className="data-row">
                        <span className="data-label">{format.label}</span>
                        <div className="data-value">
                            <span>{format.value}</span>
                            <button
                                className="copy-btn"
                                onClick={() => copyToClipboard(format.value, format.label)}
                                title={`Copy ${format.label}`}
                            >
                                {copiedFormat === format.label ? (
                                    <i className="bi bi-check"></i>
                                ) : (
                                    <i className="bi bi-copy"></i>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Contrast Preview
            <div className="contrast-preview">
                <div
                    className="contrast-box"
                    style={{
                        backgroundColor: color,
                        color: '#FFFFFF',
                        border: '1px solid rgba(0,0,0,0.1)',
                    }}
                >
                    On White
                    <span className="contrast-ratio">{contrastWithWhite.toFixed(2)}:1</span>
                </div>
                <div
                    className="contrast-box"
                    style={{
                        backgroundColor: color,
                        color: '#000000',
                        border: '1px solid rgba(0,0,0,0.1)',
                    }}
                >
                    On Black
                    <span className="contrast-ratio">{contrastWithBlack.toFixed(2)}:1</span>
                </div>
            </div> */}
        </DashboardCard>
    );
};

export default ColorDataCard;
