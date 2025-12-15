// src/components/cards/AccessibilityCard.jsx
// Displays accessibility scores and contrast ratios

import React from 'react';
import tinycolor from 'tinycolor2';

const AccessibilityCard = ({ color }) => {
    if (!color) return null;

    const whiteContrast = tinycolor.readability(color, '#ffffff');
    const blackContrast = tinycolor.readability(color, '#000000');

    const getScore = (contrast) => {
        if (contrast >= 7) return 'AAA';
        if (contrast >= 4.5) return 'AA';
        if (contrast >= 3) return 'AA Large';
        return 'Fail';
    };

    const whiteScore = getScore(whiteContrast);
    const blackScore = getScore(blackContrast);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
            {/* White Background */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: color,
                        borderRadius: '4px',
                        border: '1px solid rgba(0,0,0,0.1)'
                    }} />
                    <span style={{ fontSize: '0.9rem', color: '#000000', fontWeight: 500 }}>
                        text on white
                    </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: whiteContrast >= 4.5 ? '#059669' : '#dc2626' }}>
                        {whiteScore}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                        {whiteContrast.toFixed(2)}:1
                    </div>
                </div>
            </div>

            {/* Black Background */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem',
                backgroundColor: '#000000',
                border: '1px solid #e5e7eb',
                borderRadius: '6px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: color,
                        borderRadius: '4px',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }} />
                    <span style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 500 }}>
                        text on black
                    </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: blackContrast >= 4.5 ? '#059669' : '#dc2626' }}>
                        {blackScore}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                        {blackContrast.toFixed(2)}:1
                    </div>
                </div>
            </div>
        </div>
    );
};

// Detail view component
export const AccessibilityDetail = ({ color }) => {
    // We can reuse the logic or expand it for the modal
    // For now, let's just make a more detailed version
    if (!color) return null;

    const whiteContrast = tinycolor.readability(color, '#ffffff');
    const blackContrast = tinycolor.readability(color, '#000000');

    // Helper for guidelines
    const passes = (ratio, level) => {
        const d = level === 'AA' ? 4.5 : 7.0;
        const l = level === 'AA' ? 3.0 : 4.5; // Large text
        return {
            normal: ratio >= d,
            large: ratio >= l
        };
    };

    const wAA = passes(whiteContrast, 'AA');
    const wAAA = passes(whiteContrast, 'AAA');
    const bAA = passes(blackContrast, 'AA');
    const bAAA = passes(blackContrast, 'AAA');

    const Row = ({ bg, text, contrast, aa, aaa }) => (
        <div style={{
            padding: '1rem',
            background: bg,
            color: text,
            borderRadius: '8px',
            marginBottom: '1rem',
            border: bg === '#ffffff' ? '1px solid #e5e7eb' : 'none'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>Background: {bg}</span>
                <span style={{ fontWeight: 600 }}>Contrast: {contrast.toFixed(2)}:1</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <h5 style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.25rem' }}>Normal Text</h5>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <i className={`bi ${aa.normal ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}
                            style={{ color: aa.normal ? '#10B981' : '#EF4444' }}></i>
                        <span>WCAG AA</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <i className={`bi ${aaa.normal ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}
                            style={{ color: aaa.normal ? '#10B981' : '#EF4444' }}></i>
                        <span>WCAG AAA</span>
                    </div>
                    <p style={{ marginTop: '0.5rem', fontSize: '1rem' }}>
                        The quick brown fox jumps over the lazy dog.
                    </p>
                </div>
                <div>
                    <h5 style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.25rem' }}>Large Text</h5>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <i className={`bi ${aa.large ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}
                            style={{ color: aa.large ? '#10B981' : '#EF4444' }}></i>
                        <span>WCAG AA</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <i className={`bi ${aaa.large ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}
                            style={{ color: aaa.large ? '#10B981' : '#EF4444' }}></i>
                        <span>WCAG AAA</span>
                    </div>
                    <p style={{ marginTop: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        The quick brown fox jumps over the lazy dog.
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#374151' }}>Contrast Analysis</h4>
            <Row bg="#ffffff" text={color} contrast={whiteContrast} aa={wAA} aaa={wAAA} />
            <Row bg="#000000" text={color} contrast={blackContrast} aa={bAA} aaa={bAAA} />
        </div>
    );
};

export default AccessibilityCard;
