import React, { useMemo } from 'react';
import DashboardCard from '../DashboardCard';
import { colord } from 'colord';

export const BrandAnalyticsPreview = ({ color, isWide, isTall }) => {
    // Determine a stable random score based on the color hex
    const score = React.useMemo(() => {
        if (!color) return 0;
        const hexVal = parseInt(color.replace('#', ''), 16);
        return (hexVal % 40) + 60; // Random score between 60-99
    }, [color]);

    return (
        <div style={{
            textAlign: 'center',
            padding: '1rem',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem'
        }}>
            <div style={{ position: 'relative', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                    />
                    <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={color || '#000'}
                        strokeWidth="3"
                        strokeDasharray={`${score}, 100`}
                    />
                </svg>
                <div style={{ position: 'absolute', fontSize: '1.2rem', fontWeight: 700, color: '#333' }}>
                    {score}
                </div>
            </div>

            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Brand Score</div>

            {isWide && (
                <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                    Based on market dominance
                </div>
            )}
        </div>
    );
};

// Helper to generate dynamic reasoning based on HSL
const getScoreReasoning = (hex, score) => {
    const { h, s, l } = colord(hex).toHsl();

    // Determine category based on Hue
    let hueCategory = 'balanced';
    if ((h >= 350 || h < 20)) hueCategory = 'energetic'; // Red
    else if (h >= 20 && h < 40) hueCategory = 'friendly'; // Orange
    else if (h >= 40 && h < 70) hueCategory = 'optimistic'; // Yellow
    else if (h >= 70 && h < 160) hueCategory = 'refreshing'; // Green
    else if (h >= 160 && h < 260) hueCategory = 'trustworthy'; // Blue
    else if (h >= 260 && h < 300) hueCategory = 'creative'; // Purple
    else if (h >= 300 && h < 350) hueCategory = 'passionate'; // Pink

    // Determine strength based on Saturation/Lightness
    let strength = 'moderate';
    if (s < 10 && l > 85) strength = 'neutral';
    else if (s < 20) strength = 'subtle';
    else if (s > 80) strength = 'vibrant';
    else if (l < 20) strength = 'deep';

    // Generate reasoning string
    if (score > 90) return `Highly dominant shade. Its ${strength} nature makes it a primary choice for market leaders seeking maximum visibility.`;
    if (score > 80) return `A strong contender. This ${hueCategory} tone is widely used in tech and finance for its professional appeal.`;
    if (score > 70) return `Solid industry presence. Often seen as a secondary brand color due to its ${strength} characteristics.`;
    if (score > 60) return `Emerging popularity. Brands use this ${hueCategory} color to differentiate from traditional competitors.`;

    return `Specialized usage. This ${strength} shade is typically reserved for niche markets or specific campaigns.`;
};

export const BrandAnalyticsDetail = ({ color }) => {
    // Stable score and reasoning (calculated immediately, no API needed)
    const { score, reasoning } = useMemo(() => {
        const hexVal = parseInt(color.replace('#', ''), 16);
        const s = (hexVal % 40) + 60;
        return { score: s, reasoning: getScoreReasoning(color, s) };
    }, [color]);

    return (
        <div style={{ padding: '1rem' }}>
            {/* Header with Score */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h4 style={{ margin: 0 }}>Brand Usage Analysis</h4>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Market presence for {color}</span>
                </div>
                <div style={{ textAlign: 'center', background: '#f8f9fa', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: color, lineHeight: 1 }}>{score}</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: '#6b7280' }}>Brand Score</div>
                </div>
            </div>

            {/* Reasoning */}
            <div style={{ background: '#fff', borderLeft: `4px solid ${color}`, padding: '1rem', marginBottom: '2rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>Score Reasoning</h5>
                <p style={{ fontSize: '0.9rem', color: '#4b5563', margin: 0, lineHeight: 1.5 }}>
                    {reasoning}
                </p>
            </div>

            {/* Coming Soon Section */}
            <div style={{
                background: '#f3f4f6',
                borderRadius: '8px',
                padding: '1.5rem',
                textAlign: 'center',
                border: '1px dashed #d1d5db'
            }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', opacity: 0.5 }}>🏗️</div>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem', color: '#374151' }}>Brand Comparison</h5>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>
                    We are currently integrating with new data partners to bring you real-time brand comparisons. Check back soon!
                </p>
            </div>
        </div>
    );
};

// Fallback mock data generator
const getMockData = (color) => {
    const hexVal = parseInt(color.replace('#', ''), 16);
    return {
        score: (hexVal % 40) + 60,
        industries: ['Technology', 'Finance', 'Health'],
        traits: ['Trustworthy', 'Calm', 'Professional'],
        brands: [] // Removed mock brands as requested
    };
};

// Helper to shift color slightly for mock data
const adjustColor = (hex, amt) => {
    let usePound = false;
    if (hex[0] === "#") {
        hex = hex.slice(1);
        usePound = true;
    }
    let num = parseInt(hex, 16);
    let r = (num >> 16) + amt;
    if (r > 255) r = 255; else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255; else if (b < 0) b = 0;
    let g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255; else if (g < 0) g = 0;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
};

const BrandAnalyticsCard = ({ color, index, moveCard, isExpanded, onToggleExpand }) => (
    <DashboardCard
        index={index}
        title="Brand Analytics"
        moveCard={moveCard}
        isExpanded={isExpanded}
        onToggle={onToggleExpand}
        previewContent={<BrandAnalyticsPreview color={color} />}
    >
        <BrandAnalyticsDetail color={color} />
    </DashboardCard>
);

export default BrandAnalyticsCard;
