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

            {/* Color Formats - Vertical List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {[...colorFormats ].map((format, idx) => (
                    <div key={format.label} className="data-row" style={{
                        borderBottom: idx !== 7 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                        padding: '0.6rem 0.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span className="data-label" style={{ fontSize: '0.8rem', width: '60px' }}>{format.label}</span>
                        <div className="data-value" style={{ fontSize: '0.85rem', flex: 1, justifyContent: 'flex-end' }}>
                            <span style={{ fontFamily: 'monospace', marginRight: '0.5rem' }}>{format.value}</span>
                            <button
                                className="copy-btn"
                                onClick={() => copyToClipboard(format.value, format.label)}
                                title={`Copy ${format.label}`}
                                style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', borderRadius: 5 }}
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
