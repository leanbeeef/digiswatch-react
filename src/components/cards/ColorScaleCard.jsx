// src/components/cards/ColorScaleCard.jsx
// Displays tints and shades of the selected color

import React from 'react';
import tinycolor from 'tinycolor2';

const ColorScaleCard = ({ color }) => {
    if (!color) return null;

    const generateScale = (hex) => {
        const scale = [];
        // 3 shades
        for (let i = 3; i > 0; i--) {
            scale.push(tinycolor(hex).darken(i * 10).toHexString());
        }
        // Original
        scale.push(hex);
        // 3 tints
        for (let i = 1; i <= 3; i++) {
            scale.push(tinycolor(hex).lighten(i * 10).toHexString());
        }
        return scale;
    };

    const scale = generateScale(color);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
            <div style={{ display: 'flex', height: '60px', borderRadius: '8px', overflow: 'hidden' }}>
                {scale.map((c, i) => (
                    <div
                        key={i}
                        style={{
                            flex: 1,
                            backgroundColor: c,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title={c}
                    >
                        {c === color && (
                            <div style={{
                                width: '6px',
                                height: '6px',
                                background: tinycolor.readability(c, '#fff') > 3 ? '#fff' : '#000',
                                borderRadius: '50%'
                            }} />
                        )}
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
                <span>Darker</span>
                <span>Original</span>
                <span>Lighter</span>
            </div>
        </div>
    );
};

export const ColorScaleDetail = ({ color }) => {
    if (!color) return null;

    const generateSteps = (hex, type) => {
        const steps = [];
        for (let i = 1; i <= 10; i++) {
            const c = type === 'tint'
                ? tinycolor(hex).lighten(i * 5).toHexString()
                : tinycolor(hex).darken(i * 5).toHexString();
            steps.push(c);
        }
        return steps;
    };

    const tints = generateSteps(color, 'tint');
    const shades = generateSteps(color, 'shade');

    const SwatchRow = ({ colors, title }) => (
        <div style={{ marginBottom: '1.5rem' }}>
            <h5 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#374151' }}>{title}</h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))', gap: '0.5rem' }}>
                {colors.map((c, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center' }}>
                        <div style={{
                            width: '100%',
                            aspectRatio: '1',
                            background: c,
                            borderRadius: '6px',
                            border: '1px solid rgba(0,0,0,0.05)',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }} />
                        <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#6b7280' }}>
                            {c}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div>
            <div style={{
                padding: '1rem',
                background: '#f3f4f6',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
            }}>
                <div style={{ width: '60px', height: '60px', background: color, borderRadius: '6px' }} />
                <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Base Color</h4>
                    <code style={{ fontSize: '0.9rem', color: '#6b7280' }}>{color}</code>
                </div>
            </div>

            <SwatchRow colors={tints} title="Tints (Lightening)" />
            <SwatchRow colors={shades} title="Shades (Darkening)" />
        </div>
    );
};

export default ColorScaleCard;
