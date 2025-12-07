import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Card, Button, Modal, Badge } from 'react-bootstrap';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const ContrastChecker = () => {
    const [bgColor, setBgColor] = useState('#1a1a2e');
    const [textColor, setTextColor] = useState('#eaeaea');
    const [contrastRatio, setContrastRatio] = useState(0);
    const [showReportModal, setShowReportModal] = useState(false);
    const [previewText, setPreviewText] = useState('The quick brown fox');
    const [previewTextSmall, setPreviewTextSmall] = useState('jumps over the lazy dog');

    // WCAG Compliance thresholds
    const wcagLevels = {
        normalAA: 4.5,
        normalAAA: 7,
        largeAA: 3,
        largeAAA: 4.5,
        uiComponent: 3
    };

    useEffect(() => {
        const bgRGB = hexToRgb(bgColor);
        const textRGB = hexToRgb(textColor);
        const bgLum = calculateLuminance(bgRGB);
        const textLum = calculateLuminance(textRGB);
        const ratio = calculateContrastRatio(textLum, bgLum);
        setContrastRatio(ratio);
    }, [bgColor, textColor]);

    // Helper functions
    const calculateContrastRatio = (fgLum, bgLum) => {
        const lighter = Math.max(fgLum, bgLum);
        const darker = Math.min(fgLum, bgLum);
        return (lighter + 0.05) / (darker + 0.05);
    };

    const calculateLuminance = ({ r, g, b }) => {
        const a = [r, g, b].map((v) => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    };

    const hexToRgb = (hex) => {
        const cleanHex = hex.replace('#', '');
        const bigint = parseInt(cleanHex, 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255,
        };
    };

    const swapColors = () => {
        const temp = bgColor;
        setBgColor(textColor);
        setTextColor(temp);
    };

    const copyRatio = () => {
        navigator.clipboard.writeText(`${contrastRatio.toFixed(2)}:1`);
    };

    const getPassFail = (ratio, threshold) => ratio >= threshold;

    const PassBadge = ({ pass, label }) => (
        <div className="d-flex align-items-center justify-content-between py-2 px-3 rounded-3 mb-2"
            style={{
                background: pass ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${pass ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
            }}>
            <span className="fw-medium">{label}</span>
            <Badge bg={pass ? 'success' : 'danger'} className="px-3 py-2">
                {pass ? '✓ Pass' : '✗ Fail'}
            </Badge>
        </div>
    );

    // Color blindness problematic combinations
    const isProblematic = () => {
        const bg = hexToRgb(bgColor);
        const text = hexToRgb(textColor);

        // Check for red-green combinations
        const isRedGreen = (bg.r > 150 && bg.g < 100 && text.g > 150 && text.r < 100) ||
            (text.r > 150 && text.g < 100 && bg.g > 150 && bg.r < 100);

        // Check for blue-yellow combinations
        const isBlueYellow = (bg.b > 150 && bg.r < 100 && bg.g < 100 && text.r > 150 && text.g > 150) ||
            (text.b > 150 && text.r < 100 && text.g < 100 && bg.r > 150 && bg.g > 150);

        return { isRedGreen, isBlueYellow };
    };

    const problematic = isProblematic();

    return (
        <section className="ds-hero" style={{ minHeight: 'calc(100vh - 82px)', background: '#f8f9fa' }}>
            <SEO
                title="Color Contrast Checker & Accessibility Tool"
                description="Check color contrast ratios between foreground and background colors to ensure your design meets WCAG accessibility standards."
                keywords="contrast checker, accessibility, wcag, color contrast, readability, web accessibility"
                url="/contrastchecker"
            />

            <Container className="py-4">
                <div className="mb-4 overflow-hidden shadow-lg" style={{
                    position: 'sticky',
                    top: '1rem',
                    zIndex: 10,
                    background: bgColor,
                    borderRadius: '20px',
                    border: '2px solid rgba(0,0,0,0.05)'
                }}>
                    <div className="p-4 p-md-5 text-center">
                        <h1 style={{ color: textColor, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: '0.5rem' }}>
                            {previewText || 'Large text preview...'}
                        </h1>
                        <p style={{ color: textColor, fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', marginBottom: 0, opacity: 0.85 }}>
                            {previewTextSmall || 'Small text preview...'}
                        </p>
                    </div>
                </div>

                <Row className="g-4">
                    {/* Color Pickers Column */}
                    <Col xs={12} lg={6}>
                        <div style={{
                            background: '#ffffff',
                            borderRadius: '20px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                            padding: '1.25rem'
                        }}>
                            <h5 className="mb-3 fw-bold">Choose Colors</h5>

                            {/* Preview Text - Large */}
                            <div className="mb-2">
                                <label className="fw-semibold small mb-1 d-block">Large Text</label>
                                <Form.Control
                                    type="text"
                                    value={previewText}
                                    onChange={(e) => setPreviewText(e.target.value)}
                                    placeholder="Large text..."
                                    maxLength={40}
                                    className="rounded-3"
                                    style={{ fontSize: '0.95rem' }}
                                />
                            </div>

                            {/* Preview Text - Small */}
                            <div className="mb-3">
                                <label className="fw-semibold small mb-1 d-block">Small Text</label>
                                <Form.Control
                                    type="text"
                                    value={previewTextSmall}
                                    onChange={(e) => setPreviewTextSmall(e.target.value)}
                                    placeholder="Small text..."
                                    maxLength={50}
                                    className="rounded-3"
                                    style={{ fontSize: '0.95rem' }}
                                />
                            </div>

                            {/* Text Color */}
                            <div className="mb-3">
                                <label className="fw-semibold small mb-1 d-block">Text Color</label>
                                <div className="d-flex align-items-center gap-2">
                                    <Form.Control
                                        type="color"
                                        value={textColor}
                                        onChange={(e) => setTextColor(e.target.value)}
                                        style={{ width: '48px', height: '48px', padding: '3px', cursor: 'pointer', borderRadius: '10px' }}
                                    />
                                    <Form.Control
                                        type="text"
                                        value={textColor.toUpperCase()}
                                        onChange={(e) => setTextColor(e.target.value)}
                                        className="rounded-3 flex-grow-1 font-monospace"
                                        style={{ fontSize: '0.95rem' }}
                                    />
                                </div>
                            </div>

                            {/* Swap Button */}
                            <div className="text-center my-2">
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={swapColors}
                                    className="rounded-pill px-3"
                                >
                                    <i className="bi bi-arrow-down-up me-1"></i>
                                    Swap
                                </Button>
                            </div>

                            {/* Background Color */}
                            <div>
                                <label className="fw-semibold small mb-1 d-block">Background Color</label>
                                <div className="d-flex align-items-center gap-2">
                                    <Form.Control
                                        type="color"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        style={{ width: '48px', height: '48px', padding: '3px', cursor: 'pointer', borderRadius: '10px' }}
                                    />
                                    <Form.Control
                                        type="text"
                                        value={bgColor.toUpperCase()}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="rounded-3 flex-grow-1 font-monospace"
                                        style={{ fontSize: '0.95rem' }}
                                    >
                                    </Form.Control>
                                </div>
                            </div>

                            {/* Color Formats
                            <div className="mt-4 pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                                <h6 className="fw-bold small mb-2">Color Formats</h6>
                                <div className="small text-muted">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span>Text RGB:</span>
                                        <code>{`rgb(${parseInt(textColor.slice(1, 3), 16)}, ${parseInt(textColor.slice(3, 5), 16)}, ${parseInt(textColor.slice(5, 7), 16)})`}</code>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>BG RGB:</span>
                                        <code>{`rgb(${parseInt(bgColor.slice(1, 3), 16)}, ${parseInt(bgColor.slice(3, 5), 16)}, ${parseInt(bgColor.slice(5, 7), 16)})`}</code>
                                    </div>
                                </div>
                            </div> */}

                            {/* Quick Tips */}
                            <div className="mt-3 p-3" style={{ background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                                <h6 className="fw-bold small mb-2">
                                    <i className="bi bi-lightbulb me-1 text-info"></i>
                                    Quick Tips
                                </h6>
                                <ul className="small text-muted mb-0 ps-3" style={{ fontSize: '0.8rem' }}>
                                    <li>Aim for 4.5:1 minimum for body text</li>
                                    <li>Large text (18pt+) only needs 3:1</li>
                                    <li>Test with real content, not just "Aa"</li>
                                </ul>
                            </div>
                        </div>
                    </Col>
                    {/* Results Column */}
                    <Col xs={12} lg={6}>
                        <div style={{
                            background: '#ffffff',
                            borderRadius: '20px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                            padding: '1.5rem'
                        }}>
                            {/* Contrast Ratio Display */}
                            <div className="text-center mb-4 p-4" style={{
                                borderRadius: '16px',
                                background: contrastRatio >= 4.5 ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
                            }}>
                                <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                                    <h2 className="mb-0 fw-bold" style={{ fontSize: '2.5rem' }}>
                                        {contrastRatio.toFixed(2)}:1
                                    </h2>
                                    {/* <Button
                                        variant="link"
                                        className="p-0 text-muted"
                                        onClick={copyRatio}
                                        title="Copy ratio"
                                    >
                                        <i className="bi bi-clipboard"></i>
                                    </Button> */}
                                </div>
                                <p className="mb-0 text-muted">Contrast Ratio</p>
                            </div>

                            {/* WCAG Compliance Badges */}
                            <h5 className="fw-bold mb-3">WCAG 2.1 Compliance</h5>

                            <PassBadge pass={getPassFail(contrastRatio, wcagLevels.normalAA)} label="Normal Text AA (4.5:1)" />
                            <PassBadge pass={getPassFail(contrastRatio, wcagLevels.normalAAA)} label="Normal Text AAA (7:1)" />
                            <PassBadge pass={getPassFail(contrastRatio, wcagLevels.largeAA)} label="Large Text AA (3:1)" />
                            <PassBadge pass={getPassFail(contrastRatio, wcagLevels.largeAAA)} label="Large Text AAA (4.5:1)" />
                            <PassBadge pass={getPassFail(contrastRatio, wcagLevels.uiComponent)} label="UI Components (3:1)" />

                            {/* Colorblind Warnings */}
                            {(problematic.isRedGreen || problematic.isBlueYellow) && (
                                <div className="mt-3 p-3 rounded-3" style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="bi bi-exclamation-triangle text-warning"></i>
                                        <span className="fw-medium">Color Vision Warning</span>
                                    </div>
                                    <small className="text-muted d-block mt-1">
                                        This combination may be difficult for users with color blindness.
                                    </small>
                                </div>
                            )}

                            {/* Report Button */}
                            <Button
                                variant="primary"
                                className="w-100 mt-4 py-3 rounded-3"
                                onClick={() => setShowReportModal(true)}
                            >
                                <i className="bi bi-file-earmark-text me-2"></i>
                                View Accessibility Report
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* Accessibility Report Modal */}
            <Modal show={showReportModal} onHide={() => setShowReportModal(false)} size="lg" centered>
                <Modal.Header closeButton style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <Modal.Title className="fw-bold">
                        <i className="bi bi-universal-access me-2"></i>
                        Accessibility Report
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {/* Current Colors Summary */}
                    <div className="mb-4 p-3 rounded-3" style={{ background: '#f8fafc' }}>
                        <div className="d-flex align-items-center gap-3 flex-wrap">
                            <div className="d-flex align-items-center gap-2">
                                <div style={{ width: 24, height: 24, background: textColor, borderRadius: 4, border: '1px solid #ccc' }}></div>
                                <span className="font-monospace small">{textColor.toUpperCase()}</span>
                            </div>
                            <span className="text-muted">on</span>
                            <div className="d-flex align-items-center gap-2">
                                <div style={{ width: 24, height: 24, background: bgColor, borderRadius: 4, border: '1px solid #ccc' }}></div>
                                <span className="font-monospace small">{bgColor.toUpperCase()}</span>
                            </div>
                            <Badge bg={contrastRatio >= 4.5 ? 'success' : 'danger'} className="ms-auto">
                                {contrastRatio.toFixed(2)}:1
                            </Badge>
                        </div>
                    </div>

                    {/* WCAG Summary */}
                    <h5 className="fw-bold mb-3">WCAG 2.1 Summary</h5>
                    <div className="row g-3 mb-4">
                        <div className="col-6 col-md-3">
                            <div className={`text-center p-3 rounded-3 ${getPassFail(contrastRatio, wcagLevels.normalAA) ? 'bg-success-subtle' : 'bg-danger-subtle'}`}>
                                <div className="fw-bold">AA</div>
                                <small>Normal</small>
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className={`text-center p-3 rounded-3 ${getPassFail(contrastRatio, wcagLevels.normalAAA) ? 'bg-success-subtle' : 'bg-danger-subtle'}`}>
                                <div className="fw-bold">AAA</div>
                                <small>Normal</small>
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className={`text-center p-3 rounded-3 ${getPassFail(contrastRatio, wcagLevels.largeAA) ? 'bg-success-subtle' : 'bg-danger-subtle'}`}>
                                <div className="fw-bold">AA</div>
                                <small>Large</small>
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className={`text-center p-3 rounded-3 ${getPassFail(contrastRatio, wcagLevels.largeAAA) ? 'bg-success-subtle' : 'bg-danger-subtle'}`}>
                                <div className="fw-bold">AAA</div>
                                <small>Large</small>
                            </div>
                        </div>
                    </div>

                    {/* Information Conveyance */}
                    <h5 className="fw-bold mb-3">
                        <i className="bi bi-info-circle me-2"></i>
                        Information Conveyance
                    </h5>
                    <div className="mb-4 p-3 rounded-3" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                        <ul className="mb-0 ps-3">
                            <li className="mb-2"><strong>Don't rely on color alone</strong> – Use icons, patterns, or text labels alongside color to convey meaning.</li>
                            <li className="mb-2"><strong>Provide text alternatives</strong> – Color-coded charts should include legends or direct labels.</li>
                            <li className="mb-2"><strong>Use multiple visual cues</strong> – Combine color with shape, size, or position for better accessibility.</li>
                            <li><strong>Test with grayscale</strong> – If information is lost in grayscale, add non-color cues.</li>
                        </ul>
                    </div>

                    {/* Color Combinations to Avoid */}
                    <h5 className="fw-bold mb-3">
                        <i className="bi bi-eye-slash me-2"></i>
                        Color Combinations to Avoid
                    </h5>
                    <div className="p-3 rounded-3" style={{ background: '#fef3c7', border: '1px solid #fcd34d' }}>
                        <p className="mb-3 text-muted small">These combinations are difficult for colorblind users:</p>
                        <div className="row g-2">
                            <div className="col-6 col-md-3">
                                <div className="d-flex align-items-center gap-2 p-2 rounded bg-white">
                                    <div style={{ width: 20, height: 20, background: '#ef4444', borderRadius: 4 }}></div>
                                    <div style={{ width: 20, height: 20, background: '#22c55e', borderRadius: 4 }}></div>
                                    <small>Red/Green</small>
                                </div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="d-flex align-items-center gap-2 p-2 rounded bg-white">
                                    <div style={{ width: 20, height: 20, background: '#22c55e', borderRadius: 4 }}></div>
                                    <div style={{ width: 20, height: 20, background: '#ca8a04', borderRadius: 4 }}></div>
                                    <small>Green/Brown</small>
                                </div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="d-flex align-items-center gap-2 p-2 rounded bg-white">
                                    <div style={{ width: 20, height: 20, background: '#3b82f6', borderRadius: 4 }}></div>
                                    <div style={{ width: 20, height: 20, background: '#a855f7', borderRadius: 4 }}></div>
                                    <small>Blue/Purple</small>
                                </div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="d-flex align-items-center gap-2 p-2 rounded bg-white">
                                    <div style={{ width: 20, height: 20, background: '#06b6d4', borderRadius: 4 }}></div>
                                    <div style={{ width: 20, height: 20, background: '#d1d5db', borderRadius: 4 }}></div>
                                    <small>Cyan/Gray</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations */}
                    {!getPassFail(contrastRatio, wcagLevels.normalAA) && (
                        <div className="mt-4 p-3 rounded-3" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                            <h6 className="fw-bold mb-2">
                                <i className="bi bi-lightbulb me-2"></i>
                                Recommendations
                            </h6>
                            <ul className="mb-0 ps-3 small">
                                <li>Increase the lightness difference between your colors</li>
                                <li>Try a darker background or lighter text (or vice versa)</li>
                                <li>Aim for at least 4.5:1 for normal text readability</li>
                            </ul>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ borderTop: '1px solid #e5e7eb' }}>
                    <Button variant="secondary" onClick={() => setShowReportModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </section >
    );
};

export default ContrastChecker;
