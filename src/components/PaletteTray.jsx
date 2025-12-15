// src/components/PaletteTray.jsx
// Collapsible palette tray at bottom of screen

import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import tinycolor from 'tinycolor2';
import '../styles/palette-tray.css';

const PaletteTray = ({
    palette = [],
    onColorClick,
    onSwatchSelect,
    activeColor,
    onToggleLock,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    draggingIndex = null
}) => {
    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('paletteTrayCollapsed') === 'true';
        }
        return true; // Default to collapsed
    });

    // Persist collapsed state
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('paletteTrayCollapsed', String(collapsed));
        }
    }, [collapsed]);

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    // Calculate summary stats
    const passCount = palette.filter(c => {
        const whiteContrast = tinycolor.readability(c.hex, '#ffffff');
        const blackContrast = tinycolor.readability(c.hex, '#000000');
        return whiteContrast >= 4.5 || blackContrast >= 4.5;
    }).length;

    const warningCount = palette.length - passCount;

    return (
        <div className={`palette-tray ${collapsed ? 'is-collapsed' : 'is-expanded'}`}>
            {/* Resize handle / toggle button */}
            <button
                className="palette-tray-toggle"
                onClick={toggleCollapsed}
                aria-label={collapsed ? 'Expand palette' : 'Collapse palette'}
                title={collapsed ? 'Expand palette' : 'Collapse palette'}
            >
                <i className={`bi bi-chevron-${collapsed ? 'up' : 'down'}`}></i>
            </button>

            {/* Summary badge (visible when collapsed) */}
            {collapsed && (
                <div className="palette-tray-summary">
                    <span className="summary-item">
                        <i className="bi bi-palette-fill"></i>
                        {palette.length} colors
                    </span>
                    <span className="summary-divider">•</span>
                    <span className="summary-item">
                        <i className="bi bi-check-circle-fill text-success"></i>
                        {passCount} AA
                    </span>
                    {warningCount > 0 && (
                        <>
                            <span className="summary-divider">•</span>
                            <span className="summary-item">
                                <i className="bi bi-exclamation-triangle-fill text-warning"></i>
                                {warningCount} warnings
                            </span>
                        </>
                    )}
                </div>
            )}

            {/* Swatches */}
            <div className="palette-tray-swatches">
                {palette.map((color, index) => (
                    <div
                        key={index}
                        className={`palette-swatch ${draggingIndex === index ? 'is-dragging' : ''} ${color.hex === activeColor ? 'is-active' : ''}`}
                        style={{ backgroundColor: color.hex }}
                        draggable
                        onDragStart={(e) => onDragStart && onDragStart(e, index)}
                        onDragOver={(e) => onDragOver && onDragOver(e)}
                        onDrop={(e) => onDrop && onDrop(e, index)}
                        onDragEnd={() => onDragEnd && onDragEnd()}
                        title={collapsed ? `${color.hex} - ${color.name}` : ''}
                        onClick={() => onSwatchSelect && onSwatchSelect(color.hex, index)}
                    >
                        {!collapsed && (
                            <>
                                <div className="swatch-content">
                                    <div className="swatch-info" style={{ color: color.textColor }}>
                                        <div className="swatch-hex">{color.hex}</div>
                                        <div className="swatch-name">{color.name}</div>
                                    </div>
                                    <div className="swatch-actions">
                                        <button
                                            className="swatch-action-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onColorClick && onColorClick(color.hex, index);
                                            }}
                                            style={{ color: color.textColor }}
                                            title="Open Swatch Studio"
                                        >
                                            <i className="bi bi-arrows-fullscreen"></i>
                                        </button>
                                        <button
                                            className="swatch-action-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleLock && onToggleLock(index);
                                            }}
                                            style={{ color: color.textColor }}
                                            title={color.locked ? 'Unlock color' : 'Lock color'}
                                        >
                                            <i className={`bi bi-${color.locked ? 'lock-fill' : 'unlock'}`}></i>
                                        </button>
                                    </div>
                                </div>
                                <button
                                    className="swatch-copy-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(color.hex);
                                    }}
                                    style={{ color: color.textColor }}
                                    title="Copy hex code"
                                >
                                    <i className="bi bi-clipboard"></i>
                                </button>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PaletteTray;
