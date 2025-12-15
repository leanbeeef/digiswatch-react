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

export const ColorVisualizerPreview = ({ palette = [], isWide, isTall }) => {
    // Basic preview showing just the swatches and "Palette mockups" label
    const swatches = useMemo(() => {
        const hexes = palette.map((c) => normalizeHex(c?.hex || c)).filter(Boolean);
        return hexes.length ? hexes : fallbackPalette;
    }, [palette]);

    // Use raw SVGs for preview
    // Logic: 1 col = 1 mockup. 2 col or 2 row = 2 mockups.
    const showTwo = isWide || isTall;

    // Generate colored SVGs for the preview
    // We repurpose the baseMockups logic here, selecting just the first one
    const previewMockups = useMemo(() => {
        const mockups = [mockup1Raw]; // Always use just the first one (Hero style)

        return mockups.map(raw =>
            applyPaletteToSvg(raw, swatches, { respectProtected: false })
        );
    }, [swatches]);

    return (
        <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0', overflow: 'hidden' }}>
            {previewMockups.map((svgContent, index) => (
                <div
                    key={index}
                    style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <div
                        className="mockup-img"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                        role="img"
                        aria-label="Palette preview mockup"
                        dangerouslySetInnerHTML={{ __html: svgContent.replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ') }}
                    />
                </div>
            ))}
        </div>
    );
};

export const ColorVisualizerDetail = ({ palette = [] }) => {
    const [activeIndex, setActiveIndex] = useState(0);
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

    return (
        <div className="palette-visualizer">
            <div className="mockup-controls">
                <div className="mockup-nav">
                    <button
                        type="button"
                        className="mockup-nav-btn"
                        onClick={() => setActiveIndex((prev) => (prev - 1 + mockups.length) % mockups.length)}
                    >
                        ‹
                    </button>
                    <button
                        type="button"
                        className="mockup-nav-btn"
                        onClick={() => setActiveIndex((prev) => (prev + 1) % mockups.length)}
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

        </div>
    );
};

const ColorVisualizerCard = ({ palette = [], index, moveCard, isExpanded, onToggleExpand }) => {
    return (
        <DashboardCard
            index={index}
            title="Palette Visualizer"
            moveCard={moveCard}
            isExpanded={isExpanded}
            onToggle={onToggleExpand}
            previewContent={<ColorVisualizerPreview palette={palette} />}
        >
            <ColorVisualizerDetail palette={palette} />
        </DashboardCard>
    );
};

export default ColorVisualizerCard;
