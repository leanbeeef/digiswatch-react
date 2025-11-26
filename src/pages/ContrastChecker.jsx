import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Card } from 'react-bootstrap';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const ContrastChecker = () => {
    const [bgColor, setBgColor] = useState('#000000');
    const [textColor, setTextColor] = useState('#ffffff');
    const [contrastScore, setContrastScore] = useState(0);
    const [largeTextRating, setLargeTextRating] = useState('');
    const [smallTextRating, setSmallTextRating] = useState('');
    const [contrastDescription, setContrastDescription] = useState('');

    useEffect(() => {
        // Function to check contrast
        const checkContrast = () => {
            const bgColorRGB = hexToRgb(bgColor);
            const textColorRGB = hexToRgb(textColor);
            const bgLuminance = calculateLuminance(bgColorRGB);
            const textLuminance = calculateLuminance(textColorRGB);

            const largeTextContrast = calculateContrastRatio(textLuminance, bgLuminance);
            const smallTextContrast = largeTextContrast * 0.8;

            setContrastScore(largeTextContrast.toFixed(2));
            setLargeTextRating(getTextRating(largeTextContrast));
            setSmallTextRating(getTextRating(smallTextContrast));
            setContrastDescription(generateContrastDescription(largeTextContrast));
        };
        checkContrast();
    }, [bgColor, textColor]);

    // Function to determine background color based on contrast score
    const getBackgroundColor = (contrastScore) => {
        if (contrastScore >= 4.5) {
            return '#d4edda'; // Light green for pass
        }
        return '#f8d7da'; // Light red for fail
    };

    // Helper functions
    const calculateContrastRatio = (fgLuminance, bgLuminance) => {
        return (
            (Math.max(fgLuminance, bgLuminance) + 0.05) /
            (Math.min(fgLuminance, bgLuminance) + 0.05)
        );
    };

    const calculateLuminance = ({ r, g, b }) => {
        const a = [r, g, b].map((v) => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    };

    const getTextRating = (contrast) => {
        if (contrast >= 7) return '★★★★★';
        if (contrast >= 4.5) return '★★★★☆';
        if (contrast >= 3) return '★★★☆☆';
        return '★★☆☆☆';
    };

    const generateContrastDescription = (score) => {
        if (score >= 7) return 'Great contrast for both small and large text.';
        if (score >= 4.5) return 'Good contrast for large text; adequate for small text.';
        if (score >= 3) return 'Passable contrast for large text, but may be hard to read.';
        return 'Poor contrast, may be very hard to read.';
    };

    const hexToRgb = (hex) => {
        const bigint = parseInt(hex.slice(1), 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255,
        };
    };

    return (
        <section className="ds-hero" style={{ minHeight: 'calc(100vh - 82px)' }}>
            <SEO
                title="Color Contrast Checker & Accessibility Tool"
                description="Check color contrast ratios between foreground and background colors to ensure your design meets WCAG accessibility standards."
                keywords="contrast checker, accessibility, wcag, color contrast, readability, web accessibility"
                url="/contrast-checker"
            />
            <Container className="py-5 mb-5">
                <Row>
                    <Col xs={12} lg={6} className='p-5 rounded-4 glass-card border border-1 border-white'>
                        <h3 className="mb-4">Choose Colors</h3>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Text color</Form.Label>
                                <div className="d-flex align-items-center">
                                    <Form.Control
                                        type="color"
                                        value={textColor}
                                        onChange={(e) => setTextColor(e.target.value)}
                                        className="me-2"
                                        style={{ width: '60px', height: '40px' }}
                                    />
                                    <Form.Control
                                        type="text"
                                        value={textColor.toUpperCase()}
                                        onChange={(e) => setTextColor(e.target.value)}
                                        className="rounded-3"
                                    />
                                </div>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label className="fw-semibold">Background color</Form.Label>
                                <div className="d-flex align-items-center">
                                    <Form.Control
                                        type="color"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="me-2"
                                        style={{ width: '60px', height: '40px' }}
                                    />
                                    <Form.Control
                                        type="text"
                                        value={bgColor.toUpperCase()}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="rounded-3"
                                    />
                                </div>
                            </Form.Group>
                        </Form>
                        <div
                            className="d-flex flex-column p-4 mt-4 rounded-3 justify-content-center align-items-center"
                            style={{
                                backgroundColor: bgColor,
                                color: textColor,
                                minHeight: '200px',
                                border: '1px solid rgba(255,255,255,0.2)',
                            }}
                        >
                            <h4 style={{ color: textColor }}>This is a preview of large text.</h4>
                            <p style={{ color: textColor }}>This is a preview of smaller text.</p>
                        </div>
                    </Col>
                    <Col xs={12} lg={6} className='d-flex justify-content-center align-items-center rounded-4 glass-card border border-1 border-white'
                        style={{
                            backgroundColor: getBackgroundColor(contrastScore),
                            color: '#000000',
                        }}
                    >
                        <div className="p-4 w-100">
                            <h1 className="text-center fw-bold mb-3">Score: {contrastScore}</h1>
                            <div className="text-center mb-3" style={{ fontSize: '2rem' }}>
                                {largeTextRating}
                            </div>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="fw-semibold">Large text:</span>
                                    <span>{largeTextRating}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-semibold">Small text:</span>
                                    <span>{smallTextRating}</span>
                                </div>
                            </div>
                            <p className="text-center mt-4 text-dark-50">{contrastDescription}</p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};


export default ContrastChecker;
