// src/components/ColorVisualizerCard.jsx
// Palette-focused mockup visualizer for the dashboard
import React, { useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import DashboardCard from './DashboardCard';
import mockup1Raw from '../assets/mockup-1.svg?raw';
import mockup2Raw from '../assets/mockup-2.svg?raw';
import mockup4Raw from '../assets/mockup-4.svg?raw';
import mockup6Raw from '../assets/mockup-6.svg?raw';
import { parseSync, stringify } from 'svgson';
import { colord } from 'colord';

const fallbackPalette = ['#7c3aed', '#2563eb', '#22c55e', '#f59e0b', '#f43f5e'];

const normalizeHex = (hex) => hex?.toString().trim().toUpperCase();

// Only protect near-white values to avoid blowing out highlights/whitespace
const PROTECTED_HEX = new Set(
    ['#FFFFFF', '#FEFEFF', '#FEFFFB', '#FDFFFE', '#FDFDFD', '#FEFAFD', '#FEFBFD'].map(normalizeHex)
);

const brightness = (hex) => {
    const { r, g, b } = colord(hex).toRgb();
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const colorDistance = (hexA, hexB) => {
    const a = colord(hexA).toRgb();
    const b = colord(hexB).toRgb();
    const dr = a.r - b.r;
    const dg = a.g - b.g;
    const db = a.b - b.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
};

const isProtectedColor = (hex) => {
    if (PROTECTED_HEX.has(hex)) return true;
    const lightness = brightness(hex);
    if (lightness >= 245) return true; // protect near-white
    return false;
};

const extractUniqueHexes = (svg) => {
    const matches = svg.match(/#[0-9a-fA-F]{6}\b/g) || [];
    return Array.from(new Set(matches.map(normalizeHex)));
};

const applyPaletteToSvg = (svg, swatches, { respectProtected = true } = {}) => {
    if (!swatches.length) return svg;

    const paletteColors = swatches.map((c) => normalizeHex(colord(c).toHex()));
    if (!paletteColors.length) return svg;

    const hexRegex = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
    const matches = svg.match(hexRegex) || [];
    const uniqueColors = Array.from(new Set(matches.map((m) => normalizeHex(colord(m).toHex()))));

    const replacements = new Map();
    uniqueColors.forEach((color, idx) => {
        const isWhite = brightness(color) >= 245;
        if (respectProtected && (isProtectedColor(color) || isWhite)) return;
        const target = paletteColors[idx % paletteColors.length];
        replacements.set(color, target);
    });

    return svg.replace(hexRegex, (match) => {
        const normalized = normalizeHex(colord(match).toHex());
        if (replacements.has(normalized)) {
            return replacements.get(normalized);
        }
        return match;
    });
};

const ColorVisualizerCard = ({ palette = [], index, moveCard, isExpanded, onToggleExpand }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [showZoom, setShowZoom] = useState(false);
    const swatches = useMemo(() => {
        const hexes = palette.map((c) => normalizeHex(c?.hex || c)).filter(Boolean);
        return hexes.length ? hexes : fallbackPalette;
    }, [palette]);

    const baseMockups = useMemo(
        () => [
            { label: 'Design 1', svgRaw: mockup1Raw },
            { label: 'Design 2', svgRaw: mockup2Raw },
            { label: 'Design 3', svgRaw: mockup4Raw },
            { label: 'Design 4', svgRaw: mockup6Raw },
        ],
        []
    );

    const mockups = useMemo(
        () =>
            baseMockups.map((item) =>
                item.staticSrc
                    ? item
                    : {
                          ...item,
                          svg: applyPaletteToSvg(item.svgRaw, swatches, { respectProtected: false }),
                      }
            ),
        [baseMockups, swatches]
    );

    const selected = mockups[activeIndex % mockups.length];

    const previewContent = (
        <div className="visualizer-preview">
            <div className="visualizer-dot-row">
                {swatches.slice(0, 4).map((hex) => (
                    <span key={hex} className="visualizer-dot" style={{ background: hex }} />
                ))}
            </div>
            <div className="visualizer-preview-label">Palette mockups</div>
        </div>
    );

    return (
        <DashboardCard
            index={index}
            title="Palette Visualizer"
            moveCard={moveCard}
            isExpanded={isExpanded}
            onToggle={onToggleExpand}
            previewContent={previewContent}
            
        >
            <div className="palette-visualizer">
                <div className="mockup-controls">
                    <div className="mockup-nav">
                        <button
                            type="button"
                            className="mockup-nav-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveIndex((prev) => (prev - 1 + mockups.length) % mockups.length);
                            }}
                        >
                            ‹
                        </button>
                        <button
                            type="button"
                            className="mockup-nav-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveIndex((prev) => (prev + 1) % mockups.length);
                            }}
                        >
                            ›
                        </button>
                    </div>
                </div>

                <div className="mockup-grid single">
                    <div key={selected.label} className="mockup-frame">
                        {selected.staticSrc ? (
                            <div className="mockup-img" role="img" aria-label={`${selected.label} (unchanged)`}>
                                <img src={selected.staticSrc} alt={`${selected.label} mockup`} loading="lazy" />
                            </div>
                        ) : (
                            <div
                                className="mockup-img"
                                role="img"
                                aria-label={`${selected.label} colored with current palette`}
                                dangerouslySetInnerHTML={{ __html: selected.svg }}
                            />
                        )}
                        <div className="mockup-caption">
                            <span className="caption-dot" style={{ background: swatches[0] }} />
                            {selected.label}
                        </div>
                    </div>
                </div>
                <div className="visualizer-swatches">
                    {swatches.slice(0, 8).map((hex) => (
                        <div key={hex} className="visualizer-swatch">
                            <span className="visualizer-swatch-chip" style={{ background: hex }} />
                            <code>{hex}</code>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardCard>
    );
};

export default ColorVisualizerCard;
