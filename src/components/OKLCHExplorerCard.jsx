// src/components/OKLCHExplorerCard.jsx
import React, { useState, useEffect } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import DashboardCard from './DashboardCard';
import chroma from 'chroma-js';

export const OKLCHExplorerPreview = ({ color, l, c, h }) => {
    // Determine display values: use props if valid, otherwise derive from color
    let displayL = l, displayC = c, displayH = h;

    // If props are undefined (initial load or detached), try to derive from color
    if (color && (l === undefined || l === null)) {
        try {
            const [lightness, chromaVal, hue] = chroma(color).oklch();
            displayL = lightness;
            displayC = chromaVal;
            displayH = hue;
        } catch (e) { }
    }

    const oklchString = displayL !== undefined
        ? `oklch(${displayL.toFixed(2)} ${displayC.toFixed(3)} ${Math.round(displayH)})`
        : 'Invalid Color';

    // Contrast check for text color
    const textColor = color && chroma.valid(color)
        ? (chroma.contrast(color, 'white') > 4.5 ? 'white' : 'black')
        : 'black';

    return (
        <div style={{
            background: color,
            width: '100%',
            height: '100%',
            minHeight: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: textColor,
            textAlign: 'center'
        }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                {color}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8, fontFamily: 'monospace' }}>
                {oklchString}
            </div>
        </div>
    );
};

export const OKLCHExplorerDetail = ({
    color,
    l, setL,
    c, setC,
    h, setH,
    deltaE,
    oklchString,
    handleCopy,
    copied
}) => {

    const getDeltaEDescription = () => {
        if (deltaE < 1) return 'Imperceptible';
        if (deltaE < 2) return 'Barely noticeable';
        if (deltaE < 5) return 'Noticeable';
        if (deltaE < 10) return 'Significant';
        return 'Very different';
    };

    return (
        <div>
            <Card.Body>
                {/* Color Comparison */}
                <div className="d-flex gap-2 mb-3">
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div
                            style={{
                                background: color,
                                height: '80px',
                                borderRadius: '0',
                                border: '1px solid var(--dashboard-border)',
                                marginBottom: '0.5rem'
                            }}
                        ></div>
                        <small className="text-muted">Original</small>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div
                            style={{
                                background: oklchString,
                                height: '80px',
                                borderRadius: '0',
                                border: '2px solid var(--dashboard-accent)',
                                marginBottom: '0.5rem'
                            }}
                        ></div>
                        <small className="text-muted">Adjusted</small>
                    </div>
                </div>

                {/* Delta E Display */}
                <div className="mb-3 p-2 bg-light rounded-0 text-center">
                    <small className="text-muted d-block">Perceptual Difference (ΔE)</small>
                    <strong style={{ fontSize: '1.25rem', color: 'var(--dashboard-accent)' }}>
                        {deltaE.toFixed(2)}
                    </strong>
                    <small className="d-block text-muted">{getDeltaEDescription()}</small>
                </div>

                {/* Lightness Slider */}
                <div className="mb-3">
                    <label className="form-label d-flex justify-content-between">
                        <span className="text-muted small">Lightness (L)</span>
                        <span className="text-muted small">{(l * 100).toFixed(0)}%</span>
                    </label>
                    <Form.Range
                        min="0"
                        max="1"
                        step="0.01"
                        value={l}
                        onChange={(e) => setL(parseFloat(e.target.value))}
                        onMouseDown={(e) => e.stopPropagation()}
                    />
                </div>

                {/* Chroma Slider */}
                <div className="mb-3">
                    <label className="form-label d-flex justify-content-between">
                        <span className="text-muted small">Chroma (C)</span>
                        <span className="text-muted small">{c.toFixed(3)}</span>
                    </label>
                    <Form.Range
                        min="0"
                        max="0.4"
                        step="0.001"
                        value={c}
                        onChange={(e) => setC(parseFloat(e.target.value))}
                        onMouseDown={(e) => e.stopPropagation()}
                    />
                </div>

                {/* Hue Slider */}
                <div className="mb-3">
                    <label className="form-label d-flex justify-content-between">
                        <span className="text-muted small">Hue (H)</span>
                        <span className="text-muted small">{Math.round(h)}°</span>
                    </label>
                    <Form.Range
                        min="0"
                        max="360"
                        step="1"
                        value={h}
                        onChange={(e) => setH(parseFloat(e.target.value))}
                        onMouseDown={(e) => e.stopPropagation()}
                    />
                </div>

                {/* Value & Copy Row */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
                    <div className="p-2 bg-light rounded-0 d-flex align-items-center" style={{ flex: 1, border: '1px solid var(--dashboard-border)' }}>
                        <code style={{ fontSize: '0.85rem', color: 'var(--dashboard-text)' }}>
                            oklch({(l * 100).toFixed(1)}% {c.toFixed(3)} {Math.round(h)})
                        </code>
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleCopy}
                        style={{ borderRadius: 0, minWidth: '80px' }}
                    >
                        <i className={`bi ${copied ? 'bi-check-lg' : 'bi-clipboard'} me-1`}></i>
                        {copied ? 'Copied' : `Copy`}
                    </Button>
                </div>
            </Card.Body>
        </div>
    );
};

const OKLCHExplorerCard = ({ color, colorInfo, index, moveCard, isExpanded, onToggleExpand, onClose, isDraggable }) => {
    const [l, setL] = useState(0.5);
    const [c, setC] = useState(0.1);
    const [h, setH] = useState(0);
    const [deltaE, setDeltaE] = useState(0);
    const [copied, setCopied] = useState(false);

    const oklchString = `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(4)} ${h.toFixed(1)}deg)`;

    // Initialize from selected color
    useEffect(() => {
        if (color) {
            try {
                const chromaColor = chroma(color);
                const [lightness, chromaVal, hue] = chromaColor.oklch();
                setL(lightness || 0.5);
                setC(chromaVal || 0.1);
                setH(hue || 0);
            } catch (e) {
                console.error('Error parsing color:', e);
            }
        }
    }, [color]);

    // Update adjusted color when sliders change (Delta E calculation)
    useEffect(() => {
        try {
            const newColor = chroma.oklch(l, c, h);

            // Calculate Delta E (perceptual difference)
            if (color) {
                const originalColor = chroma(color);
                const delta = chroma.deltaE(originalColor, newColor);
                setDeltaE(delta);
            }
        } catch (e) {
            // console.error('Error creating OKLCH color:', e);
        }
    }, [l, c, h, color]);

    const handleCopy = () => {
        navigator.clipboard.writeText(oklchString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReset = () => {
        if (color) {
            const chromaColor = chroma(color);
            const [lightness, chromaVal, hue] = chromaColor.oklch();
            setL(lightness || 0.5);
            setC(chromaVal || 0.1);
            setH(hue || 0);
        }
    };

    const resetAction = (
        <button
            className="dashboard-card-action-btn"
            onClick={handleReset}
            title="Reset to original color"
            style={{ borderRadius: 0, fontSize: '0.9rem', padding: '4px 8px' }}
        >
            <i className="bi bi-arrow-counterclockwise"></i>
        </button>
    );

    return (
        <DashboardCard
            index={index}
            title="OKLCH Explorer"
            moveCard={moveCard}
            isExpanded={isExpanded}
            onToggle={onToggleExpand}
            onClose={onClose}
            isDraggable={isDraggable}
            previewContent={<OKLCHExplorerPreview color={color} l={l} c={c} h={h} />}
            extraHeaderActions={resetAction}
        >
            <OKLCHExplorerDetail
                color={color}
                l={l} setL={setL}
                c={c} setC={setC}
                h={h} setH={setH}
                deltaE={deltaE}
                oklchString={oklchString}
                handleCopy={handleCopy}
                copied={copied}
            />
        </DashboardCard>
    );
};

export default OKLCHExplorerCard;
