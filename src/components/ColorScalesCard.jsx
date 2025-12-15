// src/components/ColorScalesCard.jsx
import React, { useState } from 'react';
import { Card, Button, ButtonGroup, Form } from 'react-bootstrap';
import DashboardCard from './DashboardCard';
import chroma from 'chroma-js';

export const ColorScalesPreview = ({ color, isTall }) => {
    // Generate simplest scale for preview
    const scale = React.useMemo(() => {
        if (!color) return [];
        try {
            const baseColor = chroma(color);
            const [l, c, h] = baseColor.oklch();
            // Show more steps if tall
            const steps = isTall ? 17 : 9;
            return Array.from({ length: steps }, (_, i) => {
                const lightness = 0.95 - (i / (steps - 1)) * 0.90;
                return chroma.oklch(lightness, c, h).hex();
            });
        } catch (e) { return []; }
    }, [color, isTall]);

    if (isTall) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', height: '100%', borderRadius: '0', overflow: 'hidden' }}>
                {scale.map((c, i) => (
                    <div key={i} style={{ flex: 1, background: c, width: '100%' }}></div>
                ))}
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', gap: '0', height: '100%', minHeight: '48px', borderRadius: '0', overflow: 'hidden' }}>
            {scale.map((c, i) => (
                <div key={i} style={{ flex: 1, background: c }}></div>
            ))}
        </div>
    );
};

export const ColorScalesDetail = ({ color }) => {
    const [scaleType, setScaleType] = useState('uniform');
    const [steps, setSteps] = useState(9); // 50, 100, 200, ... 900
    const [exportFormat, setExportFormat] = useState('tailwind');
    const [copied, setCopied] = useState(false);

    // Generate color scale
    const generateScale = () => {
        if (!color) return [];

        try {
            const baseColor = chroma(color);

            if (scaleType === 'uniform') {
                // Uniform OKLCH lightness scale
                const [l, c, h] = baseColor.oklch();
                return Array.from({ length: steps }, (_, i) => {
                    const lightness = 0.95 - (i / (steps - 1)) * 0.85; // 95% to 10%
                    return chroma.oklch(lightness, c, h).hex();
                });
            } else {
                // WCAG-aware scale (better contrast ratios)
                return chroma.scale([
                    chroma(color).set('oklch.l', 0.95),
                    chroma(color),
                    chroma(color).set('oklch.l', 0.15)
                ])
                    .mode('oklch')
                    .colors(steps);
            }
        } catch (e) {
            console.error('Error generating scale:', e);
            return [];
        }
    };

    const scale = generateScale();
    const scaleNumbers = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

    // Generate export code
    const generateExportCode = () => {
        const colors = scale;
        const numbers = scaleNumbers.slice(0, steps);

        switch (exportFormat) {
            case 'tailwind':
                const tailwindColors = numbers.map((num, i) =>
                    `  ${num}: '${colors[i]}'`
                ).join(',\n');
                return `colors: {\n  brand: {\n${tailwindColors}\n  }\n}`;

            case 'css':
                const cssVars = numbers.map((num, i) =>
                    `  --color-brand-${num}: ${colors[i]};`
                ).join('\n');
                return `:root {\n${cssVars}\n}`;

            case 'json':
                const jsonObj = {};
                numbers.forEach((num, i) => {
                    jsonObj[num] = colors[i];
                });
                return JSON.stringify({ brand: jsonObj }, null, 2);

            default:
                return colors.join('\n');
        }
    };

    const handleCopyCode = () => {
        const code = generateExportCode();
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card.Body>
            {/* Scale Type */}
            <div className="mb-3">
                <label className="form-label text-muted small">Scale Type</label>
                <ButtonGroup size="sm" className="w-100">
                    <Button
                        variant={scaleType === 'uniform' ? 'primary' : 'outline-primary'}
                        onClick={() => setScaleType('uniform')}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        Uniform
                    </Button>
                    <Button
                        variant={scaleType === 'wcag' ? 'primary' : 'outline-primary'}
                        onClick={() => setScaleType('wcag')}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        WCAG-Aware
                    </Button>
                </ButtonGroup>
            </div>

            {/* Number of Steps */}
            <div className="mb-3">
                <label className="form-label text-muted small">
                    Steps: {steps}
                </label>
                <Form.Range
                    min="5"
                    max="11"
                    value={steps}
                    onChange={(e) => setSteps(parseInt(e.target.value))}
                    onMouseDown={(e) => e.stopPropagation()}
                />
            </div>

            {/* Color Scale Preview */}
            <div className="mb-3">
                {scale.map((c, i) => (
                    <div
                        key={i}
                        className="d-flex align-items-center mb-1"
                        style={{ gap: '0.5rem' }}
                    >
                        <div
                            style={{
                                width: '40px',
                                height: '32px',
                                background: c,
                                borderRadius: '4px',
                                border: '1px solid var(--dashboard-border)',
                                flexShrink: 0
                            }}
                        ></div>
                        <small className="text-muted" style={{ width: '50px' }}>
                            {scaleNumbers[i]}
                        </small>
                        <code style={{ fontSize: '0.75rem', flex: 1 }}>{c}</code>
                    </div>
                ))}
            </div>

            {/* Export Format */}
            <div className="mb-3">
                <label className="form-label text-muted small">Export Format</label>
                <Form.Select
                    size="sm"
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <option value="tailwind">Tailwind Config</option>
                    <option value="css">CSS Variables</option>
                    <option value="json">JSON Tokens</option>
                </Form.Select>
            </div>

            {/* Export Code Preview */}
            <div className="mb-3">
                <pre style={{
                    fontSize: '0.7rem',
                    background: 'var(--dashboard-bg)',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    maxHeight: '120px',
                    overflow: 'auto',
                    margin: 0
                }}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <code>{generateExportCode()}</code>
                </pre>
            </div>

            {/* Copy Button */}
            <Button
                variant="primary"
                size="sm"
                onClick={handleCopyCode}
                className="w-100"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <i className={`bi ${copied ? 'bi-check-lg' : 'bi-clipboard'} me-1`}></i>
                {copied ? 'Copied!' : 'Copy Code'}
            </Button>
        </Card.Body>
    );
};

const ColorScalesCard = ({ color, colorInfo, index, moveCard, isExpanded, onToggleExpand }) => {
    return (
        <DashboardCard
            index={index}
            title="Color Scales"
            moveCard={moveCard}
            isExpanded={isExpanded}
            onToggle={onToggleExpand}
            previewContent={<ColorScalesPreview color={color} />}
        >
            <ColorScalesDetail color={color} />
        </DashboardCard>
    );
};

export default ColorScalesCard;
