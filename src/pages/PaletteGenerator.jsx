// src/pages/PaletteGenerator.jsx
import React, { useState, useEffect } from 'react';
import { Container, Button, Toast, Modal } from 'react-bootstrap';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ColorDataCard from '../components/ColorDataCard';
import ColorHarmonyCard from '../components/ColorHarmonyCard';
import ColorContextCard from '../components/ColorContextCard';
import { getColorContext } from '../utils/getColorContext';
import '../styles/dashboard.css';
import {
    generateRandomPalette,
    generateMonochromatic,
    generateAnalogous,
    generateComplementary,
    generateSplitComplementary,
    generateTriadic,
    generateTetradic,
} from '../utils/paletteGenerators';
import { getColorInfo } from '../utils/ColorConversions';
import namer from 'color-namer';
import tinycolor from 'tinycolor2';
import { TinyColor } from '@ctrl/tinycolor';
import { exportPaletteAsCSS, exportPaletteAsJSON, exportPaletteAsText, exportPaletteAsSVG, exportPaletteAsImage } from '../utils/exportPalette';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import 'bootstrap-icons/font/bootstrap-icons.css';
import SEO from '../components/SEO';

const getTextColor = (bg) => {
    return tinycolor.readability(bg, "#FFFFFF") >= 4.5 ? "#FFFFFF" : "#000000";
};

const PaletteGenerator = () => {
    const { currentUser } = useAuth();
    const [palette, setPalette] = useState([]);
    // dashboardActive is no longer needed as it's always visible, but we'll keep the logic simple
    const [selectedColor, setSelectedColor] = useState(null);
    const [colorInfo, setColorInfo] = useState(null);
    const [harmonies, setHarmonies] = useState(null);
    const [context, setContext] = useState(null);
    const [cardOrder, setCardOrder] = useState([0, 1, 2]);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [paletteName, setPaletteName] = useState('');
    const [toast, setToast] = useState({ show: false, message: '' });
    const [expandedCards, setExpandedCards] = useState({ data: true, harmony: true, context: true });

    useEffect(() => {
        generatePalette();
    }, []);

    const generatePalette = () => {
        setPalette((prevPalette) => {
            let newPaletteData;
            // If no previous palette, generate fresh
            if (prevPalette.length === 0) {
                const newPalette = generateRandomPalette();
                newPaletteData = newPalette.map((hex) => ({
                    hex,
                    name: namer(hex).ntc[0].name,
                    textColor: getTextColor(hex),
                    locked: false,
                }));
            } else {
                // Keep locked colors, regenerate unlocked ones
                const newPalette = generateRandomPalette();
                newPaletteData = prevPalette.map((color, index) =>
                    color.locked
                        ? color
                        : {
                            hex: newPalette[index],
                            name: namer(newPalette[index]).ntc[0].name,
                            textColor: getTextColor(newPalette[index]),
                            locked: false,
                        }
                );
            }

            // If no color is selected (or the selected color is gone/changed), select the first one
            // We'll just select the first color of the new palette to be safe and ensure dashboard is populated
            if (newPaletteData.length > 0) {
                // We need to defer this slightly or just call the handler directly
                // But we can't call the handler inside the state updater.
                // So we'll use a timeout or effect. 
                // Actually, simpler: just set the state here if we can, but we can't set other state here.
                // We'll use a separate effect or just call it after setting palette.
            }
            return newPaletteData;
        });
    };

    // Effect to select the first color when palette changes if no selection or invalid
    useEffect(() => {
        if (palette.length > 0) {
            // If currently selected color is not in the new palette (by hex), or nothing selected
            // For simplicity in this "always on" dashboard, let's just select the first color if nothing is selected
            // or if we just generated a fresh palette.
            // Actually, let's just always select the first color on generation if we want to be simple, 
            // but users might want to keep their selection if locked.
            // For now, let's just ensure *something* is selected.
            if (!selectedColor || !palette.find(c => c.hex === selectedColor)) {
                handleColorClick(palette[0].hex);
            }
        }
    }, [palette]);


    const handleColorClick = (color) => {
        setSelectedColor(color);
        setColorInfo(getColorInfo(color));
        setHarmonies({
            analogous: generateAnalogous(color),
            monochromatic: generateMonochromatic(color),
            complementary: generateComplementary(color),
            splitComplementary: generateSplitComplementary(color),
            triadic: generateTriadic(color),
            tetradic: generateTetradic(color),
        });
        setContext(getColorContext(color));
    };

    const handleHarmonySelect = (harmonyColors) => {
        setPalette(harmonyColors.map(hex => ({
            hex: new TinyColor(hex).toHexString(),
            name: namer(hex).ntc[0].name,
            textColor: getTextColor(hex),
            locked: false
        })));
        // We don't close dashboard anymore
    };

    const toggleLock = (index) => {
        setPalette(prev => prev.map((c, i) => i === index ? { ...c, locked: !c.locked } : c));
    };

    const handleSave = async () => {
        if (!currentUser) {
            setToast({ show: true, message: 'Please log in to save palettes' });
            return;
        }
        if (!paletteName) {
            setToast({ show: true, message: 'Please enter a palette name' });
            return;
        }
        try {
            await setDoc(doc(collection(db, 'users', currentUser.uid, 'createdPalettes')), {
                name: paletteName,
                colors: palette.map(c => c.hex),
                createdAt: new Date().toISOString(),
            });
            setToast({ show: true, message: 'Palette saved successfully!' });
            setPaletteName('');
            setShowSaveModal(false);
        } catch (error) {
            setToast({ show: true, message: 'Failed to save palette' });
        }
    };

    const handleExport = (format) => {
        switch (format) {
            case 'png':
            case 'jpeg':
                exportPaletteAsImage(format);
                break;
            case 'css':
                exportPaletteAsCSS(palette);
                break;
            case 'json':
                exportPaletteAsJSON(palette);
                break;
            case 'txt':
                exportPaletteAsText(palette);
                break;
            case 'svg':
                exportPaletteAsSVG(palette);
                break;
        }
        setShowExportModal(false);
    };

    const moveCardOrder = (from, to) => {
        const newOrder = [...cardOrder];
        const [moved] = newOrder.splice(from, 1);
        newOrder.splice(to, 0, moved);
        setCardOrder(newOrder);
    };

    const toggleCardExpand = (cardId) => {
        setExpandedCards(prev => ({
            ...prev,
            [cardId]: !prev[cardId]
        }));
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <SEO
                title="Color Palette Generator"
                description="Create custom color palettes with our advanced generator. Lock colors, explore harmonies like monochromatic and complementary, and export to CSS, JSON, or Image."
                keywords="color palette generator, color schemes, monochromatic, complementary, triadic, tetradic, export palette, css colors"
                url="/palette-generator"
            />
            <Container fluid className="p-0 palette-generator-container">
                {/* Palette Display - Vertical Stack on Left (Desktop) / Horizontal Top (Mobile) */}
                <div id="palette-display" className="palette-sidebar">
                    {palette.map((color, index) => (
                        <div
                            key={`${color.hex}-${index}`}
                            className="palette-card-item"
                            style={{
                                backgroundColor: color.hex,
                                color: color.textColor
                            }}
                            onClick={() => handleColorClick(color.hex)}
                        >
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                                <h5 style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>{color.hex}</h5>
                                <p style={{ margin: 0, fontSize: '0.85rem' }}>{color.name}</p>
                            </div>
                            <Button
                                variant={color.locked ? 'warning' : 'light'}
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLock(index);
                                }}
                                id="lock-button"
                            >
                                <i className={color.locked ? 'bi bi-lock-fill' : 'bi bi-unlock'}></i>
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Dashboard - Always Visible on Right (Desktop) / Bottom (Mobile) */}
                <div className="palette-dashboard-area">
                    {colorInfo ? (
                        <>
                            <div style={{ /*marginBottom: '1rem'*/ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {/* <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Color Dashboard</h2> */}
                            </div>
                            <div className="dashboard-grid">
                                {cardOrder.map((idx) => {
                                    if (idx === 0) return (
                                        <ColorDataCard
                                            key="data"
                                            color={selectedColor}
                                            colorInfo={colorInfo}
                                            index={0}
                                            moveCard={moveCardOrder}

                                        />
                                    );
                                    if (idx === 1) return (
                                        <ColorHarmonyCard
                                            key="harmony"
                                            baseColor={selectedColor}
                                            colorHarmonies={harmonies}
                                            onHarmonySelect={handleHarmonySelect}
                                            index={1}
                                            moveCard={moveCardOrder}

                                        />
                                    );
                                    if (idx === 2) return (
                                        <ColorContextCard
                                            key="context"
                                            color={selectedColor}
                                            contextData={context}
                                            index={2}
                                            moveCard={moveCardOrder}

                                        />
                                    );
                                    return null;
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="d-flex flex-column justify-content-center align-items-center h-100 text-muted">
                            <i className="bi bi-palette" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
                            <h4>Select a color to view details</h4>
                        </div>
                    )}
                </div>

                {/* Floating Action Buttons */}
                <div className="fab-container" style={{ position: 'fixed', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 1050 }}>
                    <Button
                        variant="primary"
                        onClick={generatePalette}
                        style={{ borderRadius: '50%', width: '60px', height: '60px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                        title="Generate New Palette"
                    >
                        <i className="bi bi-arrow-clockwise" style={{ fontSize: '1.5rem' }}></i>
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => setShowSaveModal(true)}
                        style={{ borderRadius: '50%', width: '60px', height: '60px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                        title="Save Palette"
                        className="mobile-hidden"
                    >
                        <i className="bi bi-floppy" style={{ fontSize: '1.5rem' }}></i>
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => setShowExportModal(true)}
                        style={{ borderRadius: '50%', width: '60px', height: '60px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                        title="Export Palette"
                        className="mobile-hidden"
                    >
                        <i className="bi bi-download" style={{ fontSize: '1.5rem' }}></i>
                    </Button>
                </div>

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

                {/* Export Modal */}
                <Modal show={showExportModal} onHide={() => setShowExportModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Export Palette</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="d-flex flex-column gap-2">
                            {['PNG', 'JPEG', 'SVG', 'CSS', 'JSON', 'Text'].map(format => (
                                <Button key={format} variant="outline-primary" onClick={() => handleExport(format.toLowerCase())}>
                                    Export as {format}
                                </Button>
                            ))}
                        </div>
                    </Modal.Body>
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
            </Container>
        </DndProvider>
    );
};

export default PaletteGenerator;