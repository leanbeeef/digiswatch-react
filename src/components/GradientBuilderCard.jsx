import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, ButtonGroup, Form } from 'react-bootstrap';
import DashboardCard from './DashboardCard';
import chroma from 'chroma-js';

const GradientBuilderPreview = ({ color, colorInfo }) => {
    let background = 'linear-gradient(90deg, #ccc, #eee)';
    if (color) {
        try {
            const base = chroma(color);
            const end = base.set('hsl.h', '+180');
            background = `linear-gradient(90deg, ${base.css()}, ${end.css()})`;
        } catch (e) { }
    }

    return (
        <div style={{
            background: background,
            height: '100%',
            minHeight: '60px',
            width: '100%',
            borderRadius: '0',
            border: '1px solid rgba(0,0,0,0.1)'
        }}></div>
    );
};

const GradientBuilderDetail = ({ color, colorInfo }) => {
    const [gradientType, setGradientType] = useState('linear');
    const [gradientAngle, setGradientAngle] = useState(90);
    const [gradientStops, setGradientStops] = useState(5);
    const [useHarmony, setUseHarmony] = useState(false);
    const [harmonyType, setHarmonyType] = useState('complementary');
    const [copied, setCopied] = useState(false);

    const generateGradientColors = () => {
        if (!color) {
            return ['#d1d5db', '#9ca3af', '#6b7280'];
        }

        try {
            const baseColor = chroma(color);
            let endColor;

            if (useHarmony) {
                switch (harmonyType) {
                    case 'complementary':
                        endColor = baseColor.set('hsl.h', '+180');
                        break;
                    case 'analogous':
                        endColor = baseColor.set('hsl.h', '+30');
                        break;
                    case 'triadic':
                        endColor = baseColor.set('hsl.h', '+120');
                        break;
                    case 'monochromatic':
                        endColor = baseColor.set('oklch.l', baseColor.get('oklch.l') > 0.5 ? '-0.3' : '+0.3');
                        break;
                    default:
                        endColor = baseColor.set('hsl.h', '+180');
                }

                return chroma.scale([baseColor, endColor])
                    .mode('oklch')
                    .colors(gradientStops);
            } else {
                const lightColor = baseColor.set('oklch.l', Math.min(baseColor.get('oklch.l') + 0.3, 0.95));
                const darkColor = baseColor.set('oklch.l', Math.max(baseColor.get('oklch.l') - 0.3, 0.15));

                return chroma.scale([lightColor, baseColor, darkColor])
                    .mode('oklch')
                    .colors(gradientStops);
            }
        } catch (e) {
            console.error('Error generating gradient colors', e);
            return ['#d1d5db', '#9ca3af', '#6b7280'];
        }
    };

    const generateGradientCSS = () => {
        const colors = generateGradientColors();
        const colorStops = colors.map((c, i) => {
            const position = (i / (colors.length - 1)) * 100;
            return `${c} ${position.toFixed(1)}%`;
        }).join(', ');

        switch (gradientType) {
            case 'linear':
                return `linear-gradient(${gradientAngle}deg, ${colorStops})`;
            case 'radial':
                return `radial-gradient(circle, ${colorStops})`;
            case 'conic':
                return `conic-gradient(from ${gradientAngle}deg, ${colorStops})`;
            default:
                return `linear-gradient(${gradientAngle}deg, ${colorStops})`;
        }
    };

    const handleCopyCSS = () => {
        const css = `background: ${generateGradientCSS()};`;
        navigator.clipboard.writeText(css);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadSVG = () => {
        const colors = generateGradientColors();
        const stops = colors.map((c, i) => {
            const offset = (i / (colors.length - 1)) * 100;
            return `<stop offset="${offset}%" stop-color="${c}" />`;
        }).join('\n        ');

        let gradientDef;
        if (gradientType === 'linear') {
            const rad = (gradientAngle * Math.PI) / 180;
            const x2 = 50 + 50 * Math.cos(rad);
            const y2 = 50 + 50 * Math.sin(rad);
            gradientDef = `<linearGradient id="grad" x1="50%" y1="50%" x2="${x2}%" y2="${y2}%">
        ${stops}
      </linearGradient>`;
        } else if (gradientType === 'radial') {
            gradientDef = `<radialGradient id="grad" cx="50%" cy="50%" r="50%">
        ${stops}
      </radialGradient>`;
        } else {
            gradientDef = `<linearGradient id="grad">
        ${stops}
      </linearGradient>`;
        }

        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${gradientDef}
  </defs>
  <rect width="400" height="400" fill="url(#grad)" />
</svg>`;

        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'gradient.svg';
        a.click();
        URL.revokeObjectURL(url);
    };

    const gradientStyle = {
        background: generateGradientCSS(),
        minHeight: '120px',
        borderRadius: '8px'
    };

    return (
        <React.Fragment>
            <div style={{ ...gradientStyle, width: '100%', boxShadow: 'var(--card-shadow-sm)' }}></div>

            <div className="mb-3">
                <label className="form-label text-muted small">Type</label>
                <ButtonGroup size="sm" className="w-100">
                    <Button
                        variant={gradientType === 'linear' ? 'primary' : 'outline-primary'}
                        onClick={() => setGradientType('linear')}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        Linear
                    </Button>
                    <Button
                        variant={gradientType === 'radial' ? 'primary' : 'outline-primary'}
                        onClick={() => setGradientType('radial')}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        Radial
                    </Button>
                    <Button
                        variant={gradientType === 'conic' ? 'primary' : 'outline-primary'}
                        onClick={() => setGradientType('conic')}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        Conic
                    </Button>
                </ButtonGroup>
            </div>

            {(gradientType === 'linear' || gradientType === 'conic') && (
                <div className="mb-3">
                    <label className="form-label text-muted small">
                        Angle: {gradientAngle}°
                    </label>
                    <Form.Range
                        min="0"
                        max="360"
                        value={gradientAngle}
                        onChange={(e) => setGradientAngle(parseInt(e.target.value))}
                        onMouseDown={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            <div className="mb-3">
                <label className="form-label text-muted small">
                    Color Stops: {gradientStops}
                </label>
                <Form.Range
                    min="2"
                    max="10"
                    value={gradientStops}
                    onChange={(e) => setGradientStops(parseInt(e.target.value))}
                    onMouseDown={(e) => e.stopPropagation()}
                />
            </div>

            <div className="mb-3">
                <Form.Check
                    type="switch"
                    id="use-harmony"
                    label="Use Color Harmony"
                    checked={useHarmony}
                    onChange={(e) => setUseHarmony(e.target.checked)}
                    onMouseDown={(e) => e.stopPropagation()}
                />
            </div>

            {useHarmony && (
                <div className="mb-3">
                    <label className="form-label text-muted small">Harmony Type</label>
                    <Form.Select
                        size="sm"
                        value={harmonyType}
                        onChange={(e) => setHarmonyType(e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <option value="complementary">Complementary</option>
                        <option value="analogous">Analogous</option>
                        <option value="triadic">Triadic</option>
                        <option value="monochromatic">Monochromatic</option>
                    </Form.Select>
                </div>
            )}

            <div className="d-flex gap-2">
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handleCopyCSS}
                    className="flex-fill"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <i className={`bi ${copied ? 'bi-check-lg' : 'bi-clipboard'} me-1`}></i>
                    {copied ? 'Copied!' : 'Copy CSS'}
                </Button>
                <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleDownloadSVG}
                    className="flex-fill"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <i className="bi bi-download me-1"></i>
                    SVG
                </Button>
            </div>
        </React.Fragment>
    );
};

const GradientBuilderCard = ({ color, colorInfo, index, moveCard, isExpanded, onToggleExpand }) => {
    return (
        <DashboardCard
            title="Gradient Builder"
            index={index}
            moveCard={moveCard}
            isExpanded={isExpanded}
            onToggle={onToggleExpand}
            previewContent={<GradientBuilderPreview color={color} colorInfo={colorInfo} />}
        >
            <Card.Body>
                <GradientBuilderDetail color={color} colorInfo={colorInfo} />
            </Card.Body>
        </DashboardCard>
    );
};

export { GradientBuilderPreview, GradientBuilderDetail };
export default GradientBuilderCard;
