// src/components/OKLCHExplorerCard.jsx
import React, { useState, useEffect } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import DashboardCard from './DashboardCard';
import chroma from 'chroma-js';

const OKLCHExplorerCard = ({ color, colorInfo, index, moveCard, isExpanded, onToggleExpand, onClose, isDraggable }) => {
    const [l, setL] = useState(0.5);
    const [c, setC] = useState(0.1);
    const [h, setH] = useState(0);
    const oklchString = `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(4)} ${h.toFixed(1)}deg)`;
    const [deltaE, setDeltaE] = useState(0);
    const [copied, setCopied] = useState(false);

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

    // Update adjusted color when sliders change
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
            console.error('Error creating OKLCH color:', e);
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

    // Format delta E description
    const getDeltaEDescription = () => {
        if (deltaE < 1) return 'Imperceptible';
        if (deltaE < 2) return 'Barely noticeable';
        if (deltaE < 5) return 'Noticeable';
        if (deltaE < 10) return 'Significant';
        return 'Very different';
    };

    return (
        <DashboardCard
            index={index}
            title="OKLCH Explorer"
            moveCard={moveCard}
            isExpanded={isExpanded}
            onToggle={onToggleExpand}
            onClose={onClose}
            isDraggable={isDraggable}
            extraHeaderActions={isExpanded ? (
                <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleReset}
                    title="Reset OKLCH sliders to selected color"
                >
                    <i className="bi bi-arrow-counterclockwise"></i>
                </Button>
            ) : null}
            previewContent={
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: color, border: '1px solid var(--dashboard-border)' }}></div>
                    <div style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                        L:{l.toFixed(2)} C:{c.toFixed(3)} H:{h.toFixed(1)}
                    </div>
                </div>
            }
        >
            <Card.Body>
                {/* Color Comparison */}
                <div className="d-flex gap-2 mb-3">
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div
                            style={{
                                background: color,
                                height: '80px',
                                borderRadius: '8px',
                                border: '2px solid var(--dashboard-border)',
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
                                borderRadius: '8px',
                                border: '2px solid var(--dashboard-accent)',
                                marginBottom: '0.5rem'
                            }}
                        ></div>
                        <small className="text-muted">Adjusted</small>
                    </div>
                </div>

                {/* Delta E Display */}
                <div className="mb-3 p-2 bg-light rounded text-center">
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

                {/* OKLCH Values Display */}
                <div className="mb-3 p-2 bg-light rounded">
                    <code style={{ fontSize: '0.85rem' }}>
                        oklch({(l * 100).toFixed(1)}% {c.toFixed(3)} {Math.round(h)})
                    </code>
                    
                </div>

                {/* Copy Button */}
                <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCopy}
                    className="w-100"
                >
                    <i className={`bi ${copied ? 'bi-check-lg' : 'bi-clipboard'} me-1`}></i>
                    {copied ? 'Copied!' : `Copy`}
                </Button>
            </Card.Body>
        </DashboardCard>
    );
};

export default OKLCHExplorerCard;
