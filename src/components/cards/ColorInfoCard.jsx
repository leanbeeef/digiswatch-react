// src/components/cards/ColorInfoCard.jsx
// Displays technical color data (hex, RGB, HSL, OKLCH)

import React from 'react';
import DashboardCard from '../DashboardCard';

export const ColorInfoPreview = ({ color, colorInfo, isWide }) => {
    if (!color || !colorInfo) return null;

    if (isWide) {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) 2fr', gap: '1rem', height: '100%' }}>
                <div style={{
                    width: '100%',
                    height: '100%',
                    background: color,
                    borderRadius: '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colorInfo.textColor || '#000',
                    fontWeight: 'bold',
                    fontFamily: 'monospace'
                }}>
                    {color}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', alignContent: 'center' }}>
                    <div><strong className="text-muted">RGB:</strong> <span className="font-monospace">{colorInfo.rgb}</span></div>
                    <div><strong className="text-muted">HSL:</strong> <span className="font-monospace">{colorInfo.hsl}</span></div>
                    <div><strong className="text-muted">Name:</strong> <span>{colorInfo.name}</span></div>
                    <div><strong className="text-muted">Contrast:</strong> <span>{colorInfo.contrast || 'AA'}</span></div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', justifyContent: 'center' }}>
            <div style={{
                width: '100%',
                height: '100%',
                minHeight: '60px',
                background: color,
                borderRadius: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colorInfo.textColor || '#000',
                fontWeight: 'bold',
                fontFamily: 'monospace'
            }}>
                {color}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                <div><strong>RGB:</strong> {colorInfo.rgb || 'N/A'}</div>
                <div><strong>HSL:</strong> {colorInfo.hsl || 'N/A'}</div>
            </div>
        </div>
    );
};

export const ColorInfoDetail = ({ color, colorInfo }) => {
    if (!color || !colorInfo) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
                width: '100%',
                height: '100px',
                background: color,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colorInfo.textColor || '#000',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                fontFamily: 'monospace'
            }}>
                {color}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div>
                    <div style={{ fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>HEX</div>
                    <div style={{ fontFamily: 'monospace' }}>{color}</div>
                </div>
                <div>
                    <div style={{ fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>RGB</div>
                    <div style={{ fontFamily: 'monospace' }}>{colorInfo.rgb || 'N/A'}</div>
                </div>
                <div>
                    <div style={{ fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>HSL</div>
                    <div style={{ fontFamily: 'monospace' }}>{colorInfo.hsl || 'N/A'}</div>
                </div>
                <div>
                    <div style={{ fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>OKLCH</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{colorInfo.oklch || 'N/A'}</div>
                </div>
                <div>
                    <div style={{ fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>Name</div>
                    <div>{colorInfo.name || 'Unnamed'}</div>
                </div>
                <div>
                    <div style={{ fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>CMYK</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{colorInfo.cmyk || 'N/A'}</div>
                </div>
            </div>
        </div>
    );
};

const ColorInfoCard = ({ color, colorInfo, isExpanded, onToggle }) => {
    if (!color || !colorInfo) {
        return null;
    }

    return (
        <DashboardCard
            id="color-info"
            title="Color Data"
            isExpanded={isExpanded}
            onToggle={onToggle}
            previewContent={<ColorInfoPreview color={color} colorInfo={colorInfo} />}
        >
            <ColorInfoDetail color={color} colorInfo={colorInfo} />
        </DashboardCard>
    );
};

export default ColorInfoCard;
