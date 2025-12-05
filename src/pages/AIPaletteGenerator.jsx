import React, { useState, useEffect } from 'react';
import { Container, Button, Form, Spinner, Card, Modal, Toast } from 'react-bootstrap';
import SEO from '../components/SEO';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { doc, setDoc, collection } from 'firebase/firestore';
import tinycolor from 'tinycolor2';
import namer from 'color-namer';

// Pop culture prompts for initial random palette
const POP_CULTURE_PROMPTS = [
    "Star Wars - The Force",
    "Harry Potter - Gryffindor House",
    "Stranger Things - The Upside Down",
    "The Matrix - Digital Rain",
    "Avatar - Pandora's Bioluminescence",
    "Barbie - Dreamhouse",
    "Willy Wonka's Chocolate Factory",
    "The Little Mermaid - Under the Sea",
    "Blade Runner 2049 - Neon City",
    "The Great Gatsby - Art Deco Elegance",
    "Cyberpunk 2077 - Night City",
    "Studio Ghibli - Spirited Away Bathhouse"
];

const AIPaletteGenerator = () => {
    const { currentUser } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedPalette, setGeneratedPalette] = useState(null);
    const [error, setError] = useState(null);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [paletteName, setPaletteName] = useState('');
    const [toast, setToast] = useState({ show: false, message: '' });
    const [showExportModal, setShowExportModal] = useState(false);
   
    // Prefer relative /api on digiswatch.io (routed to the Worker); otherwise use env or direct Worker URL.
    const deriveApiBase = () => {
        const envBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
        if (typeof window !== 'undefined') {
            const host = window.location.hostname;
            if (host.endsWith('digiswatch.io')) {
                return ''; // relative hits the Worker route
            }
        }
        return envBase || 'https://palette-ai-proxy.jodrey48.workers.dev';
    };
    const API_BASE = deriveApiBase();

    const generatePaletteFromPrompt = async (promptText) => {
        setLoading(true);
        setError(null);
        setGeneratedPalette(null);

        try {
            const response = await fetch(`${API_BASE || ''}/api/generate-palette-from-prompt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: promptText }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate palette');
            }

            const data = await response.json();
            setGeneratedPalette(data);
        } catch (err) {
            console.error('Error generating palette:', err);
            setError('Failed to generate palette. Make sure the server is running.');
        } finally {
            setLoading(false);
        }
    };

    // Generate random palette on page load
    useEffect(() => {
        const randomPrompt = POP_CULTURE_PROMPTS[Math.floor(Math.random() * POP_CULTURE_PROMPTS.length)];
        setPrompt(randomPrompt);
        generatePaletteFromPrompt(randomPrompt);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a description for your palette');
            return;
        }

        generatePaletteFromPrompt(prompt);
    };

    const copyToClipboard = (hex) => {
        navigator.clipboard.writeText(hex);
    };

    const handleSave = async () => {
    if (!currentUser) {
        setToast({ show: true, message: 'Please log in to save palettes' });
        return;
    }

    if (!generatedPalette || !generatedPalette.colors || generatedPalette.colors.length === 0) {
        setToast({ show: true, message: 'No palette to save yet' });
        return;
    }

    if (!paletteName.trim()) {
        setToast({ show: true, message: 'Please enter a palette name' });
        return;
    }

    try {
        await setDoc(
            doc(collection(db, 'users', currentUser.uid, 'createdPalettes')),
            {
                name: paletteName.trim(),
                // colors are hex strings already
                colors: generatedPalette.colors,
                // optional: save the prompt too, useful for context
                prompt,
                createdAt: new Date().toISOString(),
            }
        );

        setToast({ show: true, message: 'Palette saved successfully!' });
        setPaletteName('');
        setShowSaveModal(false);
    } catch (error) {
        console.error('Error saving palette:', error);
        setToast({ show: true, message: 'Failed to save palette' });
    }
};

    const handleExport = (format) => {
        if (!generatedPalette || !generatedPalette.colors) return;

        const paletteName = prompt.substring(0, 50) || 'ai-palette';
        const colors = generatedPalette.colors;

        switch (format) {
            case 'css':
                exportAsCSS(colors, paletteName);
                break;
            case 'json':
                exportAsJSON(colors, paletteName);
                break;
            case 'text':
                exportAsText(colors, paletteName);
                break;
            case 'svg':
                exportAsSVG(colors, paletteName);
                break;
            case 'image':
                exportAsImage(colors, paletteName);
                break;
            default:
                break;
        }
        setShowExportModal(false);
    };

    const exportAsCSS = (colors, name) => {
        let cssContent = ':root {\n';
        colors.forEach((color, index) => {
            cssContent += `  --color-${index + 1}: ${color};\n`;
        });
        cssContent += '}';
        downloadFile(cssContent, `${name}.css`, 'text/css');
    };

    const exportAsJSON = (colors, name) => {
        const jsonContent = JSON.stringify({ colors, name }, null, 2);
        downloadFile(jsonContent, `${name}.json`, 'application/json');
    };

    const exportAsText = (colors, name) => {
        const textContent = colors.join('\n');
        downloadFile(textContent, `${name}.txt`, 'text/plain');
    };

    const exportAsSVG = (colors, name) => {
        const swatchWidth = 100;
        let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${colors.length * swatchWidth}" height="100">\n`;
        colors.forEach((color, index) => {
            svgContent += `<rect x="${index * swatchWidth}" y="0" width="${swatchWidth}" height="100" fill="${color}" />\n`;
        });
        svgContent += '</svg>';
        downloadFile(svgContent, `${name}.svg`, 'image/svg+xml');
    };

    const exportAsImage = (colors, name) => {
        const canvas = document.createElement('canvas');
        const swatchWidth = 100;
        canvas.width = colors.length * swatchWidth;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');

        colors.forEach((color, index) => {
            ctx.fillStyle = color;
            ctx.fillRect(index * swatchWidth, 0, swatchWidth, 100);
        });

        canvas.toBlob((blob) => {
            const link = document.createElement('a');
            link.download = `${name}.png`;
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(link.href);
        });
    };

    const downloadFile = (content, filename, contentType) => {
        const blob = new Blob([content], { type: contentType });
        const link = document.createElement('a');
        link.download = filename;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    };

    const getTextColor = (bg) => {
        return tinycolor.readability(bg, "#FFFFFF") >= 4.5 ? "#FFFFFF" : "#000000";
    };

    return (
        <div className="full-page ds-hero">
            <SEO
                title="AI Palette Generator - Create Colors from Ideas"
                description="Describe your idea and let AI generate a beautiful, harmonious color palette for your project."
                keywords="ai color palette, color generator, ai design, palette from text"
                url="/ai-palette-generator"
            />

            <div>
                <Container>
                    <div className="text-center py-5">
                        <h1 className="pp-hero-title mb-3">
                            <i className="bi bi-stars me-2"></i>
                            AI Palette Generator
                        </h1>
                        <p className="lead text-muted">Describe your vision and let AI create the perfect color palette</p>
                    </div>
                </Container>
            </div>

            <Container className="my-5">
                <div className="row">
                    <div className={generatedPalette ? "col-12 col-lg-5" : "col-12"}>
                        <Card className="glass-card shadow-sm p-4">
                            <Form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="h5">What's your idea?</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        placeholder="E.g., 'A sunset over the ocean', 'Modern tech startup', 'Cozy autumn café'..."
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        className="fs-5"
                                        disabled={loading}
                                    />
                                </Form.Group>

                                <div className="d-flex gap-3 flex-wrap">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={loading || !prompt.trim()}
                                        className="px-4 py-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner as="span" animation="border" size="sm" className="me-2" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-magic me-2"></i>
                                                Generate Palette
                                            </>
                                        )}
                                    </Button>

                                    {generatedPalette && (
                                        <>
                                            {currentUser && (
                                                <Button
                                                    variant="outline-primary"
                                                    onClick={() => setShowSaveModal(true)}
                                                    className="px-4 py-2"
                                                >
                                                    <i className="bi bi-save me-2"></i>
                                                    Save Palette
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline-secondary"
                                                onClick={() => setShowExportModal(true)}
                                                className="px-4 py-2"
                                            >
                                                <i className="bi bi-download me-2"></i>
                                                Export
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </Form>
                        </Card>
                    </div>

                    {generatedPalette && (
                        <div className="col-12 col-lg-7 mt-4 mt-lg-0">
                            <Card className="glass-card shadow-sm p-4 h-100">
                                <h3 className="mb-3">Your AI-Generated Palette</h3>
                                {generatedPalette.explanation && (
                                    <p className="text-muted mb-4">{generatedPalette.explanation}</p>
                                )}

                                {/* Horizontal Color Strip */}
                                <div className="palette-row rounded-3 shadow-sm mb-4" style={{ height: '120px', overflow: 'hidden' }}>
                                    {generatedPalette.colors.map((color, index) => (
                                        <div
                                            key={index}
                                            className="palette-swatch position-relative"
                                            style={{
                                                backgroundColor: color,
                                                cursor: 'pointer',
                                                transition: 'transform 0.2s',
                                            }}
                                            onClick={() => copyToClipboard(color)}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <div
                                                className="position-absolute top-50 start-50 translate-middle text-center w-100"
                                                style={{ color: getTextColor(color) }}
                                            >
                                                <div className="fw-bold small">{color.toUpperCase()}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Color Details Grid */}
                                <div className="row g-2">
                                    {generatedPalette.colors.map((color, index) => (
                                        <div key={index} className="col-6 col-md-4">
                                            <div className="d-flex align-items-center gap-2 p-2 rounded border">
                                                <div
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        backgroundColor: color,
                                                        borderRadius: '8px',
                                                        flexShrink: 0
                                                    }}
                                                />
                                                <div className="small">
                                                    <div className="fw-bold">{color.toUpperCase()}</div>
                                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                        {namer(color).ntc[0].name}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="text-center mt-3 text-muted small">
                                    <i className="bi bi-info-circle me-1"></i>
                                    Click the color strip above to copy hex codes
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </Container>

            {/* Export Modal */}
            <Modal show={showExportModal} onHide={() => setShowExportModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Export Palette</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-grid gap-2">
                        <Button variant="outline-primary" onClick={() => handleExport('css')}>
                            <i className="bi bi-filetype-css me-2"></i>
                            Export as CSS
                        </Button>
                        <Button variant="outline-primary" onClick={() => handleExport('json')}>
                            <i className="bi bi-filetype-json me-2"></i>
                            Export as JSON
                        </Button>
                        <Button variant="outline-primary" onClick={() => handleExport('text')}>
                            <i className="bi bi-filetype-txt me-2"></i>
                            Export as Text
                        </Button>
                        <Button variant="outline-primary" onClick={() => handleExport('svg')}>
                            <i className="bi bi-filetype-svg me-2"></i>
                            Export as SVG
                        </Button>
                        <Button variant="outline-primary" onClick={() => handleExport('image')}>
                            <i className="bi bi-file-image me-2"></i>
                            Export as Image
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Save Modal */}
            <Modal show={showSaveModal} onHide={() => setShowSaveModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Save Palette</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input
                        type="text"
                        className="form-control"
                        value={paletteName}
                        onChange={(e) => setPaletteName(e.target.value)}
                        placeholder="Enter palette name"
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowSaveModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>Save</Button>
                </Modal.Footer>
            </Modal>

            {/* Toast */}
                <Toast
                    show={toast.show}
                    onClose={() => setToast({ show: false, message: '' })}
                    delay={3000}
                    autohide
                    style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 1100 }}
                >
                    <Toast.Header>
                        <strong className="me-auto">Notification</strong>
                    </Toast.Header>
                    <Toast.Body>{toast.message}</Toast.Body>
                </Toast>
        </div>
    );
};

export default AIPaletteGenerator;
