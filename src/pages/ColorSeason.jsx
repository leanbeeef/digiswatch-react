import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/ColorSeason.css';
import SEO from '../components/SEO';
import tinycolor from 'tinycolor2';
import namer from 'color-namer';
import * as faceapi from 'face-api.js';

const filterPalette = (colors) => colors.filter((c) => {
    const lower = c.toLowerCase();
    return lower !== '#000000' && lower !== '#ffffff';
});

const buildRingGradient = (colors) => {
    const filtered = filterPalette(colors);
    const total = filtered.length;
    if (!total) return 'conic-gradient(#eee, #ddd)';
    const stops = filtered.map((c, i) => {
        const start = (i / total) * 100;
        const end = ((i + 1) / total) * 100;
        return `${c} ${start}% ${end}%`;
    }).join(', ');
    return `conic-gradient(${stops})`;
};

// Expanded Season Data
const SEASONS = {
    Spring: {
        description: "Fresh, warm, and bright. You shine in clear, warm colors like coral, peach, and golden yellow.",
        fullPalette: [
            '#FF6B6B', '#FF9F43', '#FECA57', '#1DD1A1', '#54A0FF',
            '#FF8E72', '#F368E0', '#00D2D3', '#FFD700', '#FFA502',
            '#7BED9F', '#70A1FF'
        ],
        makeup: {
            lipstick: ['#FF6B6B', '#FF8E72', '#FF9F43'],
            blush: ['#FF9F43', '#FECA57', '#FF6B6B'],
            eyeshadow: ['#54A0FF', '#5F27CD', '#1DD1A1'],
            eyeliner: ['#8B4513', '#556B2F', '#A0522D'],
            nailPolish: ['#FF7F50', '#FFD700', '#FF69B4'],
            bronzer: ['#CD853F', '#DAA520']
        }
    },
    Summer: {
        description: "Cool, soft, and delicate. Muted, cool tones like lavender, powder blue, and soft rose look best on you.",
        fullPalette: [
            '#FDA7DF', '#D980FA', '#B53471', '#12CBC4', '#1289A7',
            '#C4E538', '#9980FA', '#5758BB', '#FD79A8', '#81ECEC',
            '#74B9FF', '#A29BFE'
        ],
        makeup: {
            lipstick: ['#FDA7DF', '#D980FA', '#B53471'],
            blush: ['#FDA7DF', '#9980FA', '#D980FA'],
            eyeshadow: ['#12CBC4', '#1289A7', '#0652DD'],
            eyeliner: ['#2F3542', '#57606F', '#747D8C'],
            nailPolish: ['#D980FA', '#FDA7DF', '#A29BFE'],
            bronzer: ['#A4B0BE', '#CED6E0']
        }
    },
    Autumn: {
        description: "Warm, rich, and earthy. Deep, golden tones like rust, olive, and mustard enhance your natural glow.",
        fullPalette: [
            '#D35400', '#E67E22', '#C0392B', '#2C3A47', '#58B19F',
            '#E1B12C', '#F39C12', '#A3CB38', '#B33771', '#6D214F',
            '#182C61', '#F97F51'
        ],
        makeup: {
            lipstick: ['#D35400', '#E67E22', '#C0392B'],
            blush: ['#E67E22', '#D35400', '#F39C12'],
            eyeshadow: ['#2C3A47', '#58B19F', '#E1B12C'],
            eyeliner: ['#2C3A47', '#1B1464', '#006266'],
            nailPolish: ['#D35400', '#833471', '#6D214F'],
            bronzer: ['#E67E22', '#D35400']
        }
    },
    Winter: {
        description: "Cool, bold, and sharp. High contrast and vivid colors like true red, emerald, and royal blue suit you perfectly.",
        fullPalette: [
            '#ED4C67', '#833471', '#6F1E51', '#1B1464', '#006266',
            '#5758BB', '#9980FA', '#0652DD', '#12CBC4', '#C4E538',
            '#000000', '#FFFFFF'
        ],
        makeup: {
            lipstick: ['#ED4C67', '#833471', '#6F1E51'],
            blush: ['#ED4C67', '#B53471', '#833471'],
            eyeshadow: ['#1B1464', '#006266', '#5758BB'],
            eyeliner: ['#000000', '#1B1464', '#2C3A47'],
            nailPolish: ['#ED4C67', '#000000', '#FFFFFF'],
            bronzer: ['#535C68', '#2F3542']
        }
    }
};

const ColorSeason = () => {
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [season, setSeason] = useState(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [landmarks, setLandmarks] = useState(null);
    const [activeMakeup, setActiveMakeup] = useState({}); // kept for compatibility but unused now

    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const originalImageRef = useRef(null);

    // Load Face API Models
    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
            try {
                // Explicitly set backend to avoid "backend undefined" error
                // face-api.js bundles tfjs, but sometimes auto-detection fails in Vite
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                ]);
                setModelsLoaded(true);
                console.log('FaceAPI Models Loaded');
            } catch (error) {
                console.error('Error loading FaceAPI models:', error);
            }
        };
        loadModels();
    }, []);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target.result);
                setSeason(null);
                setLandmarks(null);
                setActiveMakeup({});
            };
            reader.readAsDataURL(file);
        }
    };
    const handleCameraCapture = (e) => {
        handleUpload(e);
    };

    useEffect(() => {
        if (image && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                originalImageRef.current = img;
                const size = Math.min(img.width, img.height);
                // We want to keep aspect ratio for face detection, but for the UI we used a square crop.
                // For makeup try-on, it's better to use the full image or a consistent scale.
                // Let's stick to the square crop for now to match the UI, but we need to be careful with landmarks.
                // Actually, for accurate landmarks, we should draw the full image or a scaled version.
                // Let's modify to draw the full image scaled to fit the container width (300px).

                // For simplicity and to match previous design, let's keep the square crop logic but ensure we detect on that.
                canvas.width = 300;
                canvas.height = 300;

                // Draw image covering the canvas (center crop)
                const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
                const x = (canvas.width / 2) - (img.width / 2) * scale;
                const y = (canvas.height / 2) - (img.height / 2) * scale;

                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            };
            img.src = image;
        }
    }, [image]);

    const analyzeColors = async () => {
        setAnalyzing(true);

        // 1. Detect Landmarks if models are loaded
        const canDetect = modelsLoaded
            && faceapi?.tf
            && typeof faceapi.tf.engine === 'function'
            && faceapi.tf.engine().backendName;

        if (canDetect && canvasRef.current) {
            try {
                const detections = await faceapi.detectSingleFace(canvasRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
                if (detections) {
                    setLandmarks(detections.landmarks);
                    console.log("Landmarks detected");
                } else {
                    console.warn("No face detected");
                }
            } catch (err) {
                console.error("Face detection error:", err);
            }
        } else {
            console.warn('Face detection skipped: TF backend not available.');
        }

        // 2. Color Analysis (Existing Logic)
        setTimeout(() => {
            if (!canvasRef.current) return;

            const ctx = canvasRef.current.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
            const data = imageData.data;

            let r = 0, g = 0, b = 0, count = 0;
            const startX = Math.floor(canvasRef.current.width * 0.25);
            const endX = Math.floor(canvasRef.current.width * 0.75);
            const startY = Math.floor(canvasRef.current.height * 0.25);
            const endY = Math.floor(canvasRef.current.height * 0.75);

            for (let y = startY; y < endY; y += 10) {
                for (let x = startX; x < endX; x += 10) {
                    const index = (y * canvasRef.current.width + x) * 4;
                    r += data[index];
                    g += data[index + 1];
                    b += data[index + 2];
                    count++;
                }
            }

            r = Math.floor(r / count);
            g = Math.floor(g / count);
            b = Math.floor(b / count);

            const avgColor = tinycolor({ r, g, b });
            const isWarm = avgColor.isLight() ? avgColor.toHsv().s > 0.3 : avgColor.toHsv().s > 0.4;
            const isLight = avgColor.getBrightness() > 128;

            if (isWarm && isLight) setSeason('Spring');
            else if (!isWarm && isLight) setSeason('Summer');
            else if (isWarm && !isLight) setSeason('Autumn');
            else setSeason('Winter');

            setAnalyzing(false);
        }, 1000);
    };

    // Palette helpers
    const getSeasonPalette = (seasonKey) => {
        if (!seasonKey) return [];
        return filterPalette(SEASONS[seasonKey].fullPalette).slice(0, 6);
    };

    const paletteColors = season ? getSeasonPalette(season) : [];

    const handleOpenInGenerator = () => {
        if (!season) return;
        navigate('/palette-generator', {
            state: {
                palette: {
                    name: `${season} Palette`,
                    colors: paletteColors,
                }
            }
        });
    };

    return (
        <div className="full-page">
            <SEO
                title="Color Season Analysis & Makeup Guide"
                description="Discover your seasonal color palette and get personalized makeup recommendations based on your unique features."
                keywords="color season, personal color analysis, makeup guide, spring summer autumn winter, color palette"
                url="/color-season"
            />

            <div className="cs-hero">
                <h1 className="pp-hero-title">Discover Your Color Season</h1>
                <p className="cs-hero-subtitle">Upload your photo to reveal your seasonal palette and find the perfect makeup shades to enhance your natural beauty.</p>
            </div>

            <Container className="cs-container">
                <div className={`cs-split-layout ${season ? 'active' : ''}`}>
                    {/* Left Panel: Image Upload */}
                    <div className="cs-left-panel">
                        <div className="cs-image-preview-container">
                            {season && (
                                <div
                                    className="cs-color-ring-band"
                                    style={{ background: buildRingGradient(paletteColors) }}
                                />
                            )}
                            {image ? (
                                <canvas ref={canvasRef} className="cs-canvas" />
                            ) : (
                                <div className="rounded-circle d-flex align-items-center justify-content-center h-100 bg-light text-muted">
                                    <i className="bi bi-person-bounding-box" style={{ fontSize: '4rem' }}></i>
                                </div>
                            )}
                        </div>

                        <div className="cs-controls">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleUpload}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                            <input
                                type="file"
                                ref={cameraInputRef}
                                onChange={handleCameraCapture}
                                accept="image/*"
                                capture="user"
                                style={{ display: 'none' }}
                            />
                            <button className="cs-btn cs-btn-secondary" onClick={() => fileInputRef.current.click()}>
                                {image ? 'Change Photo' : 'Upload Photo'}
                            </button>
                            <button className="cs-btn cs-btn-secondary" onClick={() => cameraInputRef.current.click()}>
                                Use Camera
                            </button>
                            {image && (
                                <button className="cs-btn cs-btn-primary" onClick={analyzeColors} disabled={analyzing || !modelsLoaded}>
                                    {analyzing ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Analyzing...</> : 'Analyze My Season'}
                                </button>
                            )}
                        </div>
                        {!modelsLoaded && <div className="text-muted mt-2 small">Loading AI Models...</div>}
                    </div>

                    {/* Right Panel: Season Results (Only visible when season is determined) */}
                    {season && (
                        <div className="cs-right-panel cs-results-section">
                            <h2 className="cs-season-title">Your Season is {season}</h2>
                            <p className="cs-season-desc">{SEASONS[season].description}</p>

                            <div className="d-flex align-items-center gap-2 cs-cta-row">
                                <h4 className="cs-section-header m-0">Your Color Palette</h4>
                                <button
                                    type="button"
                                    className="pp-action-ghost"
                                    onClick={handleOpenInGenerator}
                                    title="Open in Palette Generator"
                                >
                                    <img src="/favicon.ico" alt="Open in generator" height="16" width="16" />
                                    <span>Open</span>
                                </button>
                            </div>
                            <div className="cs-palette-strip">
                                {paletteColors.map((color, i) => (
                                    <div
                                        key={i}
                                        className="cs-palette-strip-swatch"
                                        style={{ backgroundColor: color }}
                                        onClick={() => navigator.clipboard.writeText(color)}
                                    >
                                        <div className="cs-palette-tooltip">{color}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                        {/* Bottom Section removed: Makeup suggestions */}
            </Container>
        </div>
    );
};

export default ColorSeason;
    
