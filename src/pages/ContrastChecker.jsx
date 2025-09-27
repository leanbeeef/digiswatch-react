import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Card } from 'react-bootstrap';
import Footer from '../components/Footer';

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
        <section>
        <Container className="py-5 mb-5">
            <Row className='column-gap-3'>
                <Col className='p-5 rounded shadow-sm'>
                    <h3>Choose Colors</h3>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Text color</Form.Label>
                            <div className="d-flex align-items-center">
                                <Form.Control
                                    type="color"
                                    value={textColor}
                                    onChange={(e) => setTextColor(e.target.value)}
                                    className="me-2"
                                />
                                <Form.Control
                                    type="text"
                                    value={textColor.toUpperCase()}
                                    onChange={(e) => setTextColor(e.target.value)}
                                />
                            </div>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Background color</Form.Label>
                            <div className="d-flex align-items-center">
                                <Form.Control
                                    type="color"
                                    value={bgColor}
                                    onChange={(e) => setBgColor(e.target.value)}
                                    className="me-2"
                                />
                                <Form.Control
                                    type="text"
                                    value={bgColor.toUpperCase()}
                                    onChange={(e) => setBgColor(e.target.value)}
                                />
                            </div>
                        </Form.Group>
                    </Form>
                    <div
                        className="d-flex flex-column p-4 mt-5 rounded justify-content-center align-items-center shadow-sm"
                        style={{
                            backgroundColor: bgColor,
                            color: textColor,
                            minHeight: '200px',
                        }}
                    >
                        <h4 style={{ color: textColor }}>This is a preview of large text.</h4>
                        <p style={{ color: textColor }}>This is a preview of smaller text.</p>
                    </div>
                </Col>
                <Col className='d-flex justify-content-center align-items-center rounded shadow-sm'
                    style={{
                        backgroundColor: getBackgroundColor(contrastScore),
                        color: '#000000', // Adjust text color for readability
                    }}
                >
                    <Card
                        className="p-4 w-100"
                        style={{
                            backgroundColor: getBackgroundColor(contrastScore),
                            color: '#000000', // Adjust text color for readability
                        }}
                    >
                        <h1 className="text-center">Score: {contrastScore}</h1>
                        <h5 className="text-center">Large text: {largeTextRating}</h5>
                        <p className="text-center">Small text: {smallTextRating}</p>
                        <p className="text-center">{contrastDescription}</p>
                    </Card>
                </Col>
            </Row>
        </Container>
        <Footer></Footer>
        </section>
    );
};


export default ContrastChecker;
