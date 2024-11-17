// src/pages/PaletteGenerator.jsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Toast, Modal } from 'react-bootstrap';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Sidebar from '../components/Sidebar';
import ColorInfoModal from '../components/ColorInfoModal';
import CopyOptions from '../components/CopyOptions';
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
import { FaLock, FaLockOpen, FaPaintBrush } from 'react-icons/fa';
import {
    exportPaletteAsCSS,
    exportPaletteAsJSON,
    exportPaletteAsText,
    exportPaletteAsSVG,
    exportPaletteAsImage,
} from '../utils/exportPalette';
import { HexColorPicker } from "react-colorful";


import { doc, setDoc, collection } from 'firebase/firestore'; // Firestore imports
import { db } from '../firebase'; // Import Firestore configuration
import { useAuth } from '../AuthContext'; // Import authentication context

const ItemType = 'CARD';

const getTextColor = (backgroundColor) => {
    const whiteContrast = tinycolor.readability(backgroundColor, "#FFFFFF");
    return whiteContrast >= 4.5 ? "#FFFFFF" : "#000000";
};

const DraggableCard = ({ color, colorName, textColor, index, moveCard, onClick, onCopy, isLocked, onEditColor, toggleLock, updateColor }) => {
    const ref = React.useRef(null);

    const [{ isDragging }, drag, dragPreview] = useDrag({
        type: ItemType,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: ItemType,
        hover: (item) => {
            if (item.index !== index) {
                moveCard(item.index, index);
                item.index = index;
            }
        },
    });

    dragPreview(drop(ref));

    return (
        <Col
            ref={ref}
            xs={12}
            sm={6}
            md={4}
            lg={2}
            className="p-0 d-flex"
            style={{
                opacity: isDragging ? 0.5 : 1,
            }}
        >
            <Card
                style={{ backgroundColor: color, color: textColor }}
                className="w-100 text-center d-flex flex-column justify-content-center full-height-minus-header"
            >
                <Card.Body className="d-flex flex-column justify-content-center">
                    <Button
                        variant="link"
                        className="drag-handle mb-5"
                        style={{ color: textColor, fontSize: '1.8em' }}
                        ref={drag}
                    >
                        <i className="fas fa-grip-vertical"></i>
                    </Button>
                    <Card.Text className="fw-bold" style={{ color: textColor, fontSize: '1.5em' }}>{colorName}</Card.Text>
                    <Card.Text className="small" style={{ color: textColor, fontSize: '1.2em' }}>{color}</Card.Text>
                    <div className="d-flex justify-content-center">
                        <Button variant="link" style={{ color: textColor, fontSize: '1.2em' }} onClick={toggleLock}>
                            {isLocked ? <FaLock /> : <FaLockOpen />}
                        </Button>
                        <Button
                            variant="link"
                            style={{ color: textColor, fontSize: '1.2em' }}
                            onClick={() => onClick(color)} // Trigger the info modal
                        >
                            <i className="fas fa-info-circle"></i>
                        </Button>
                        <Button
                            variant="link"
                            style={{ color: textColor, fontSize: '1.2em' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onCopy();
                            }}
                        >
                            <i className="fas fa-copy"></i>
                        </Button>
                        <Button
                            variant="link"
                            style={{ color: textColor, fontSize: '1.2em' }}
                            onClick={() => onEditColor(index)} // Open the color picker for this swatch
                        >
                            <FaPaintBrush />
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Col>
    );
};

const PaletteGenerator = () => {
    const [currentPalette, setCurrentPalette] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedColor, setSelectedColor] = useState(null);
    const [colorInfo, setColorInfo] = useState({});
    const [colorHarmonies, setColorHarmonies] = useState({});
    const [showCopyOptions, setShowCopyOptions] = useState(false);
    const [selectedColorInfo, setSelectedColorInfo] = useState(null);
    const [selectedSwatchIndex, setSelectedSwatchIndex] = useState(null);
    const [newColor, setNewColor] = useState(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const { currentUser } = useAuth(); // Get the current logged-in user
    const [showModal, setShowModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [paletteName, setPaletteName] = useState('');
    const [showExportModal, setShowExportModal] = useState(false);
    const [showButtonContainer, setShowButtonContainer] = useState(true);


    useEffect(() => {
        handleGenerate(); // Generate the initial palette
    }, []);

    const handleOpenColorPicker = (index) => {
        setSelectedSwatchIndex(index);
        setNewColor(currentPalette[index].hex);
    };

    const handleSaveColorChange = () => {
        setCurrentPalette((prevPalette) =>
            prevPalette.map((color, i) =>
                i === selectedSwatchIndex
                    ? {
                        ...color,
                        hex: newColor,
                        name: namer(newColor).ntc[0].name,
                        textColor: getTextColor(newColor),
                    }
                    : color
            )
        );
        setSelectedSwatchIndex(null);
        setNewColor(null);
    };

    const handleSavePalette = async () => {
        if (!currentUser) {
            setToastMessage('You must be logged in to save palettes.');
            setShowToast(true);
            return;
        }

        setShowModal(true); // Open the modal for input
    };

    const handleExport = (format) => {
        switch (format) {
            case 'png':
            case 'jpeg':
                exportPaletteAsImage(format);
                break;
            case 'css':
                exportPaletteAsCSS(currentPalette);
                break;
            case 'json':
                exportPaletteAsJSON(currentPalette);
                break;
            case 'txt':
                exportPaletteAsText(currentPalette);
                break;
            case 'svg':
                exportPaletteAsSVG(currentPalette);
                break;
            default:
                alert('Invalid export format.');
                break;
        }
    };

    const handleModalSave = async () => {
        if (!paletteName) {
            setToastMessage('Palette name cannot be empty.');
            setShowToast(true);
            return;
        }

        try {
            const paletteRef = doc(collection(db, 'users', currentUser.uid, 'createdPalettes'));
            await setDoc(paletteRef, {
                name: paletteName,
                colors: currentPalette.map((color) => color.hex),
                createdAt: new Date().toISOString(),
            });

            setToastMessage('Palette saved successfully!');
            setShowToast(true);
            setPaletteName(''); // Clear input
            setShowModal(false); // Close modal
        } catch (error) {
            console.error('Error saving palette:', error);
            setToastMessage('Failed to save the palette. Please try again.');
            setShowToast(true);
        }
    };

    // Generate a random palette
    const handleGenerate = () => {
        setCurrentPalette((prevPalette) => {
            // If no previous palette exists, generate a fresh one
            if (prevPalette.length === 0) {
                const newPalette = generateRandomPalette();
                return newPalette.map((color) => ({
                    hex: color,
                    name: namer(color).ntc[0].name,
                    textColor: getTextColor(color),
                    locked: false, // Default to unlocked
                }));
            }

            // Otherwise, generate new colors only for unlocked slots
            const newPalette = generateRandomPalette();
            return prevPalette.map((color, index) =>
                color.locked
                    ? color // Keep locked colors
                    : {
                        hex: newPalette[index],
                        name: namer(newPalette[index]).ntc[0].name,
                        textColor: getTextColor(newPalette[index]),
                        locked: false,
                    }
            );
        });
    };


    const toggleLock = (index) => {
        setCurrentPalette((prevPalette) =>
            prevPalette.map((color, i) =>
                i === index ? { ...color, locked: !color.locked } : color
            )
        );
    };

    const moveCard = (fromIndex, toIndex) => {
        setCurrentPalette((prevPalette) => {
            const updatedPalette = [...prevPalette];
            const [movedColor] = updatedPalette.splice(fromIndex, 1);
            updatedPalette.splice(toIndex, 0, movedColor);
            return updatedPalette;
        });
    };

    const handleColorClick = (color) => {
        setSelectedColor(color);
        setIsModalOpen(true);

        setColorInfo(getColorInfo(color));

        setColorHarmonies({
            analogous: generateAnalogous(color),
            monochromatic: generateMonochromatic(color),
            complementary: generateComplementary(color),
            splitComplementary: generateSplitComplementary(color),
            triadic: generateTriadic(color),
            tetradic: generateTetradic(color),
        });
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedColor(null);
        setColorInfo({});
        setColorHarmonies({});
    };

    const handleHarmonyClick = (harmonyColors) => {
        const updatedPalette = harmonyColors.map(color => {
            const hex = new TinyColor(color).toHexString();
            const nameResult = namer(hex).ntc[0];
            const textColor = getTextColor(hex);

            return { hex, name: nameResult.name, textColor };
        });

        setCurrentPalette(updatedPalette);
    };

    const handleOpenCopyOptions = (colorObj) => {
        const colorInfo = getColorInfo(colorObj.hex);
        setSelectedColorInfo(colorInfo);
        setShowCopyOptions(true);
    };

    const handleCloseCopyOptions = () => {
        setShowCopyOptions(false);
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <Container fluid className="p-0 d-flex flex-column" style={{ height: '100%' }}>
                <Sidebar
                    show={showSidebar}
                    onClose={() => setShowSidebar(false)}
                    onGenerate={handleGenerate}
                />
                <Row id="palette-display" className="flex-grow-1 justify-content-center m-0" style={{ display: 'flex' }}>
                    {currentPalette.map((colorObj, index) => (
                        <DraggableCard
                            key={`${colorObj.hex}-${index}`}
                            index={index}
                            color={colorObj.hex}
                            colorName={colorObj.name}
                            textColor={colorObj.textColor}
                            isLocked={colorObj.locked}
                            moveCard={moveCard}
                            onClick={handleColorClick}
                            onCopy={() => handleOpenCopyOptions(colorObj)}
                            toggleLock={() => toggleLock(index)}
                            onEditColor={handleOpenColorPicker}
                        />
                    ))}
                </Row>

                {selectedColorInfo && (
                    <CopyOptions
                        show={showCopyOptions}
                        onClose={handleCloseCopyOptions}
                        colorInfo={selectedColorInfo}
                    />
                )}

                {selectedSwatchIndex !== null && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 1100,
                            background: '#fff',
                            padding: '1rem',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            width: '300px',
                        }}
                    >
                        <HexColorPicker className='w-100' color={newColor} onChange={setNewColor} />

                        {/* Color Input Fields */}
                        <div className="mt-3">
                            <div className="mb-2">
                                <label className="form-label">HEX</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newColor}
                                    onChange={(e) => setNewColor(e.target.value)}
                                    placeholder="#000000"
                                />
                            </div>
                            <div className="mb-2">
                                <label className="form-label">RGB</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={tinycolor(newColor).toRgbString()}
                                    onChange={(e) => {
                                        const rgb = e.target.value;
                                        if (tinycolor(rgb).isValid()) setNewColor(tinycolor(rgb).toHexString());
                                    }}
                                    placeholder="rgb(0, 0, 0)"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">HSL</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={tinycolor(newColor).toHslString()}
                                    onChange={(e) => {
                                        const hsl = e.target.value;
                                        if (tinycolor(hsl).isValid()) setNewColor(tinycolor(hsl).toHexString());
                                    }}
                                    placeholder="hsl(0, 0%, 0%)"
                                />
                            </div>
                        </div>

                        {/* Save/Cancel Buttons */}
                        <div className="d-flex justify-content-between">
                            <Button variant="secondary" onClick={() => setSelectedSwatchIndex(null)}>
                                Cancel
                            </Button>
                            <Button variant="primary" className="ms-2" onClick={handleSaveColorChange}>
                                Save
                            </Button>
                        </div>
                    </div>
                )}


                <ColorInfoModal
                    isModalOpen={isModalOpen}
                    closeModal={closeModal}
                    selectedColor={selectedColor}
                    colorInfo={colorInfo}
                    colorHarmonies={colorHarmonies}
                    handleHarmonyClick={handleHarmonyClick}
                />

                <div
                    style={{
                        position: 'fixed',
                        bottom: '300px',
                        right: '0',
                        zIndex: 900,
                        background: '#007bff', // Blue background for the tab
                        borderRadius: '5px 0 0 5px',
                        padding: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        height: 150,
                        width: 25,
                    }}
                    onClick={() => setShowButtonContainer((prev) => !prev)}
                >
                    {showButtonContainer ? (
                        <i className="fas fa-minus" style={{ color: 'white', fontSize: '1rem' }}></i>
                    ) : (
                        <i className="fas fa-plus" style={{ color: 'white', fontSize: '1rem' }}></i>
                    )}

                    {showButtonContainer && (
                        <div
                            style={{
                                position: 'fixed',
                                bottom: '20px',
                                right: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px', // Space between buttons
                                zIndex: 1050,
                            }}
                        >
                            <Button
                                variant="primary"
                                onClick={() => setShowExportModal(true)}
                                style={{
                                    borderRadius: '50%',
                                    width: '60px',
                                    height: '60px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                }}
                            >
                                <i className="fas fa-download" style={{ fontSize: '1.5rem', color: 'white' }}></i>
                            </Button>

                            <Button
                                variant="primary"
                                onClick={handleGenerate}
                                style={{
                                    borderRadius: '50%',
                                    width: '60px',
                                    height: '60px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                }}
                            >
                                <i className="fas fa-redo" style={{ fontSize: '1.5rem', color: 'white' }}></i>
                            </Button>

                            <Button
                                variant="primary"
                                className="save-palette-btn"
                                onClick={handleSavePalette}
                                style={{
                                    borderRadius: '50%',
                                    width: '60px',
                                    height: '60px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                }}
                            >
                                <i className="fas fa-save" style={{ fontSize: '1.5rem', color: 'white' }}></i>
                            </Button>
                        </div>
                    )}
                </div>



                {/* Save Palette Modal */}
                <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Save Palette</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Enter a name for your palette:</p>
                        <input
                            type="text"
                            className="form-control"
                            value={paletteName}
                            onChange={(e) => setPaletteName(e.target.value)}
                            placeholder="Palette Name"
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleModalSave}>
                            Save
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Export Modal */}
                <Modal show={showExportModal} onHide={() => setShowExportModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Export Palette</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Select a format to export your palette:</p>
                        <div className="d-flex flex-wrap">
                            <Button
                                variant="outline-primary"
                                className="m-2"
                                onClick={() => {
                                    handleExport('png');
                                    setShowExportModal(false);
                                }}
                            >
                                PNG
                            </Button>
                            <Button
                                variant="outline-primary"
                                className="m-2"
                                onClick={() => {
                                    handleExport('jpeg');
                                    setShowExportModal(false);
                                }}
                            >
                                JPEG
                            </Button>
                            <Button
                                variant="outline-primary"
                                className="m-2"
                                onClick={() => {
                                    handleExport('css');
                                    setShowExportModal(false);
                                }}
                            >
                                CSS
                            </Button>
                            <Button
                                variant="outline-primary"
                                className="m-2"
                                onClick={() => {
                                    handleExport('json');
                                    setShowExportModal(false);
                                }}
                            >
                                JSON
                            </Button>
                            <Button
                                variant="outline-primary"
                                className="m-2"
                                onClick={() => {
                                    handleExport('txt');
                                    setShowExportModal(false);
                                }}
                            >
                                Text
                            </Button>
                            <Button
                                variant="outline-primary"
                                className="m-2"
                                onClick={() => {
                                    handleExport('svg');
                                    setShowExportModal(false);
                                }}
                            >
                                SVG
                            </Button>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowExportModal(false)}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Toast Notification */}
                <Toast
                    onClose={() => setShowToast(false)}
                    show={showToast}
                    delay={3000}
                    autohide
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        zIndex: 1050,
                    }}
                >
                    <Toast.Header className="text-bg-primary" closeButton={false}>
                        <strong className="me-auto">Notification</strong>
                        <button
                            type="button"
                            className="btn-close bold"
                            style={{ filter: 'invert(1)' }} // Makes it white
                            aria-label="Close"
                            onClick={() => setShowToast(false)}
                        ></button>
                    </Toast.Header>
                    <Toast.Body>{toastMessage}</Toast.Body>
                </Toast>
            </Container>
        </DndProvider>
    );
};

export default PaletteGenerator;
