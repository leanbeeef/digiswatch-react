import { useEffect, useState } from 'react';
import { Form, Button, Modal, Badge } from 'react-bootstrap';
import SEO from '../components/SEO';
import LayoutContainer from '../components/LayoutContainer';
import '../styles/dashboard.css';
import '../styles/layout.css';

const ContrastChecker = () => {
    const [bgColor, setBgColor] = useState('#1a1a2e');
    const [textColor, setTextColor] = useState('#eaeaea');
    const [contrastRatio, setContrastRatio] = useState(0);
    const [showReportModal, setShowReportModal] = useState(false);
    const [previewText, setPreviewText] = useState('The quick brown fox');
    const [previewTextSmall, setPreviewTextSmall] = useState('jumps over the lazy dog');

    const wcagLevels = {
        normalAA: 4.5,
        normalAAA: 7,
        largeAA: 3,
        largeAAA: 4.5,
        uiComponent: 3,
    };

    useEffect(() => {
        const bgRGB = hexToRgb(bgColor);
        const textRGB = hexToRgb(textColor);
        const bgLum = calculateLuminance(bgRGB);
        const textLum = calculateLuminance(textRGB);
        setContrastRatio(calculateContrastRatio(textLum, bgLum));
    }, [bgColor, textColor]);

    const calculateContrastRatio = (fgLum, bgLum) => {
        const lighter = Math.max(fgLum, bgLum);
        const darker = Math.min(fgLum, bgLum);
        return (lighter + 0.05) / (darker + 0.05);
    };

    const calculateLuminance = ({ r, g, b }) => {
        const a = [r, g, b].map((v) => {
            const channel = v / 255;
            return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
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
        setBgColor(textColor);
        setTextColor(bgColor);
    };

    const copyRatio = () => {
        navigator.clipboard.writeText(`${contrastRatio.toFixed(2)}:1`);
    };

    const getPassFail = (ratio, threshold) => ratio >= threshold;

    const PassBadge = ({ pass, label }) => (
        <div
            className="d-flex align-items-center justify-content-between py-2 px-3 rounded-3 mb-2"
            style={{
                background: pass ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${pass ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            }}
        >
            <span className="fw-medium">{label}</span>
            <Badge bg={pass ? 'success' : 'danger'} className="px-3 py-2">
                {pass ? 'Pass' : 'Fail'}
            </Badge>
        </div>
    );

    const problematic = (() => {
        const bg = hexToRgb(bgColor);
        const text = hexToRgb(textColor);
        const isRedGreen = (bg.r > 150 && bg.g < 100 && text.g > 150 && text.r < 100) ||
            (text.r > 150 && text.g < 100 && bg.g > 150 && bg.r < 100);
        const isBlueYellow = (bg.b > 150 && bg.r < 100 && bg.g < 100 && text.r > 150 && text.g > 150) ||
            (text.b > 150 && text.r < 100 && text.g < 100 && bg.r > 150 && bg.g > 150);
        return { isRedGreen, isBlueYellow };
    })();

    return (
        <>
            <LayoutContainer
                headerContent={
                    <div className="d-flex w-100 justify-content-between align-items-center flex-wrap gap-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-primary-subtle text-primary-emphasis px-3 py-2">
                                    Contrast Checker
                                </span>
                                <span className="text-muted small">WCAG 2.1 quick scan</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <div
                                    className="rounded-circle border"
                                    style={{ width: 28, height: 28, background: textColor }}
                                ></div>
                                <i className="bi bi-arrow-left-right text-muted"></i>
                                <div
                                    className="rounded-circle border"
                                    style={{ width: 28, height: 28, background: bgColor }}
                                ></div>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <div
                                className="px-3 py-2 rounded-3 fw-bold rounded-pill"
                                style={{
                                    background:
                                        contrastRatio >= 4.5
                                            ? 'rgba(16, 185, 129, 0.14)'
                                            : 'rgba(239, 68, 68, 0.14)',
                                    color: contrastRatio >= 4.5 ? '#047857' : '#b91c1c',
                                }}
                            >
                                {contrastRatio.toFixed(2)}:1
                            </div>
                            <Button className='rounded-pill' variant="outline-secondary" size="sm" onClick={swapColors}>
                                <i className="bi bi-arrow-down-up me-1"></i>
                                Swap
                            </Button>
                            <Button className='rounded-pill' variant="primary" size="sm" onClick={() => setShowReportModal(true)}>
                                <i className="bi bi-file-earmark-text me-1"></i>
                                Report
                            </Button>
                        </div>
                    </div>
                }
                workbench={
                    <section className="container-fluid py-3">
                        <SEO
                            title="Color Contrast Checker & Accessibility Tool"
                            description="Check color contrast ratios between foreground and background colors to ensure your design meets WCAG accessibility standards."
                            keywords="contrast checker, accessibility, wcag, color contrast, readability, web accessibility"
                            url="/contrastchecker"
                        />

                        <div className="contrast-grid dashboard-grid">
                            <div className="contrast-card">
                                <div className="dashboard-card h-100">
                                    <div className="dashboard-card-header">
                                        <div>
                                            <p className="dashboard-card-kicker">Live preview</p>
                                            <h5 className="dashboard-card-title mb-0">Readability check</h5>
                                        </div>
                                    </div>
                                    <div
                                        className="rounded-4 p-4 mb-3 border"
                                        style={{
                                            background: bgColor,
                                            borderColor: 'rgba(0,0,0,0.06)',
                                            minHeight: 180,
                                        }}
                                    >
                                        <h4
                                            style={{
                                                color: textColor,
                                                fontSize: 'clamp(1.2rem, 2vw, 1.8rem)',
                                                marginBottom: '0.35rem',
                                            }}
                                        >
                                            {previewText || 'Large text preview...'}
                                        </h4>
                                        <p
                                            style={{
                                                color: textColor,
                                                fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
                                                marginBottom: 0,
                                                opacity: 0.9,
                                            }}
                                        >
                                            {previewTextSmall || 'Small text preview...'}
                                        </p>
                                    </div>
                                    <div className="d-flex flex-column gap-2">
                                        <Form.Group>
                                            <Form.Label className="small fw-semibold text-muted">Large text</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={previewText}
                                                onChange={(e) => setPreviewText(e.target.value)}
                                                placeholder="Large text..."
                                                maxLength={40}
                                            />
                                        </Form.Group>
                                        <Form.Group>
                                            <Form.Label className="small fw-semibold text-muted">Small text</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={previewTextSmall}
                                                onChange={(e) => setPreviewTextSmall(e.target.value)}
                                                placeholder="Small text..."
                                                maxLength={50}
                                            />
                                        </Form.Group>
                                    </div>
                                </div>
                            </div>

                            <div className="contrast-card">
                                <div className="dashboard-card h-100">
                                    <div className="dashboard-card-header">
                                        <div>
                                            <p className="dashboard-card-kicker">Inputs</p>
                                            <h5 className="dashboard-card-title mb-0">Choose colors</h5>
                                        </div>
                                    </div>
                                    <div className="d-flex flex-column gap-3">
                                        <div>
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <Form.Label className="small fw-semibold text-muted mb-0">Text color</Form.Label>
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="p-0 small"
                                                    onClick={() => setTextColor('#0f172a')}
                                                >
                                                    Reset
                                                </Button>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <Form.Control
                                                    type="color"
                                                    value={textColor}
                                                    onChange={(e) => setTextColor(e.target.value)}
                                                    style={{
                                                        width: '48px',
                                                        height: '48px',
                                                        padding: '3px',
                                                        cursor: 'pointer',
                                                        borderRadius: '10px',
                                                    }}
                                                />
                                                <Form.Control
                                                    type="text"
                                                    value={textColor.toUpperCase()}
                                                    onChange={(e) => setTextColor(e.target.value)}
                                                    className="font-monospace"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <Form.Label className="small fw-semibold text-muted mb-0">Background</Form.Label>
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="p-0 small"
                                                    onClick={() => setBgColor('#f8fafc')}
                                                >
                                                    Reset
                                                </Button>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <Form.Control
                                                    type="color"
                                                    value={bgColor}
                                                    onChange={(e) => setBgColor(e.target.value)}
                                                    style={{
                                                        width: '48px',
                                                        height: '48px',
                                                        padding: '3px',
                                                        cursor: 'pointer',
                                                        borderRadius: '10px',
                                                    }}
                                                />
                                                <Form.Control
                                                    type="text"
                                                    value={bgColor.toUpperCase()}
                                                    onChange={(e) => setBgColor(e.target.value)}
                                                    className="font-monospace"
                                                />
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-3" style={{ background: '#f0f9ff', border: '1px solid #dbeafe' }}>
                                            <h6 className="fw-bold small mb-2">
                                                <i className="bi bi-lightbulb me-1 text-info"></i>
                                                Quick tips
                                            </h6>
                                            <ul className="small text-muted mb-0 ps-3">
                                                <li>Aim for 4.5:1 minimum for body text</li>
                                                <li>Large text (18pt+) only needs 3:1</li>
                                                <li>Test with real content, not just "Aa"</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="contrast-card">
                                <div className="dashboard-card h-100">
                                    <div className="dashboard-card-header d-flex justify-content-between align-items-center">
                                        <div>
                                            <p className="dashboard-card-kicker">WCAG 2.1</p>
                                            <h5 className="dashboard-card-title mb-0">Compliance</h5>
                                        </div>
                                        <Button variant="outline-secondary" size="sm" onClick={copyRatio}>
                                            Copy ratio
                                        </Button>
                                    </div>
                                    <div
                                        className="text-center mb-3 p-4 rounded-3"
                                        style={{
                                            background: contrastRatio >= 4.5 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                        }}
                                    >
                                        <h2 className="fw-bold mb-1">{contrastRatio.toFixed(2)}:1</h2>
                                        <p className="text-muted mb-0">Contrast ratio</p>
                                    </div>

                                    <div className="d-flex flex-column">
                                        <PassBadge pass={getPassFail(contrastRatio, wcagLevels.normalAA)} label="Normal Text AA (4.5:1)" />
                                        <PassBadge pass={getPassFail(contrastRatio, wcagLevels.normalAAA)} label="Normal Text AAA (7:1)" />
                                        <PassBadge pass={getPassFail(contrastRatio, wcagLevels.largeAA)} label="Large Text AA (3:1)" />
                                        <PassBadge pass={getPassFail(contrastRatio, wcagLevels.largeAAA)} label="Large Text AAA (4.5:1)" />
                                        <PassBadge pass={getPassFail(contrastRatio, wcagLevels.uiComponent)} label="UI Components (3:1)" />
                                    </div>

                                    {(problematic.isRedGreen || problematic.isBlueYellow) && (
                                        <div className="mt-3 p-3 rounded-3" style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                                            <div className="d-flex align-items-center gap-2">
                                                <i className="bi bi-exclamation-triangle text-warning"></i>
                                                <span className="fw-medium">Color vision warning</span>
                                            </div>
                                            <small className="text-muted d-block mt-1">
                                                This combination may be difficult for users with color blindness.
                                            </small>
                                        </div>
                                    )}

                                    <Button
                                        variant="primary"
                                        className="w-100 mt-4"
                                        onClick={() => setShowReportModal(true)}
                                    >
                                        <i className="bi bi-file-earmark-text me-2"></i>
                                        View accessibility report
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>
                }
                contextPanel={null}
                paletteTray={null}
            />

            <Modal show={showReportModal} onHide={() => setShowReportModal(false)} size="lg" centered>
                <Modal.Header closeButton style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <Modal.Title className="fw-bold">
                        <i className="bi bi-universal-access me-2"></i>
                        Accessibility Report
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
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

                    <h5 className="fw-bold mb-3">WCAG 2.1 Summary</h5>
                    <div className="row g-3 mb-4">
                        {[
                            { label: 'AA', size: 'Normal', pass: getPassFail(contrastRatio, wcagLevels.normalAA) },
                            { label: 'AAA', size: 'Normal', pass: getPassFail(contrastRatio, wcagLevels.normalAAA) },
                            { label: 'AA', size: 'Large', pass: getPassFail(contrastRatio, wcagLevels.largeAA) },
                            { label: 'AAA', size: 'Large', pass: getPassFail(contrastRatio, wcagLevels.largeAAA) },
                        ].map((item) => (
                            <div key={`${item.label}-${item.size}`} className="col-6 col-md-3">
                                <div className={`text-center p-3 rounded-3 ${item.pass ? 'bg-success-subtle' : 'bg-danger-subtle'}`}>
                                    <div className="fw-bold">{item.label}</div>
                                    <small>{item.size}</small>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h5 className="fw-bold mb-3">
                        <i className="bi bi-info-circle me-2"></i>
                        Information Conveyance
                    </h5>
                    <div className="mb-4 p-3 rounded-3" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                        <ul className="mb-0 ps-3">
                            <li className="mb-2"><strong>Don't rely on color alone</strong> — add icons, patterns, or text labels.</li>
                            <li className="mb-2"><strong>Provide text alternatives</strong> — charts should include legends or direct labels.</li>
                            <li className="mb-2"><strong>Use multiple visual cues</strong> — combine color with shape, size, or position.</li>
                            <li><strong>Test with grayscale</strong> — if information is lost, add non-color cues.</li>
                        </ul>
                    </div>

                    <h5 className="fw-bold mb-3">
                        <i className="bi bi-eye-slash me-2"></i>
                        Color Combinations to Avoid
                    </h5>
                    <div className="p-3 rounded-3" style={{ background: '#fef3c7', border: '1px solid #fcd34d' }}>
                        <p className="mb-3 text-muted small">These combinations are difficult for colorblind users:</p>
                        <div className="row g-2">
                            {[
                                { label: 'Red/Green', swatches: ['#ef4444', '#22c55e'] },
                                { label: 'Green/Brown', swatches: ['#22c55e', '#ca8a04'] },
                                { label: 'Blue/Purple', swatches: ['#3b82f6', '#a855f7'] },
                                { label: 'Cyan/Gray', swatches: ['#06b6d4', '#d1d5db'] },
                            ].map(({ label, swatches }) => (
                                <div key={label} className="col-6 col-md-3">
                                    <div className="d-flex align-items-center gap-2 p-2 rounded bg-white">
                                        <div style={{ width: 20, height: 20, background: swatches[0], borderRadius: 4 }}></div>
                                        <div style={{ width: 20, height: 20, background: swatches[1], borderRadius: 4 }}></div>
                                        <small>{label}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

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
        </>
    );
};

export default ContrastChecker;
