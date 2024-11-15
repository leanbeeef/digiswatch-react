// src/pages/PaletteGenerator.jsx

import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
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

const ItemType = 'CARD';

const getTextColor = (backgroundColor) => {
    const whiteContrast = tinycolor.readability(backgroundColor, "#FFFFFF");
    return whiteContrast >= 4.5 ? "#FFFFFF" : "#000000";
};

const DraggableCard = ({ color, colorName, textColor, index, moveCard, onClick, onCopy }) => {
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
            className="p-0 d-flex"
            style={{
                flex: 1,
                opacity: isDragging ? 0.5 : 1,
            }}
        >
            <Card
                style={{ backgroundColor: color, color: textColor, borderRadius: '0' }}
                className="w-100 text-center d-flex flex-column justify-content-center full-height-minus-header"
                onClick={onClick}
            >
                <Card.Body className="d-flex flex-column justify-content-center">
                    <Card.Text className="fw-bold" style={{ color: textColor, fontSize: '1.5em' }}>{colorName}</Card.Text>
                    <Card.Text className="small" style={{ color: textColor, fontSize: '1.2em' }}>{color}</Card.Text>
                    <div className="d-flex justify-content-center">
                        <Button variant="link" style={{ color: textColor, fontSize: '1.2em' }}>
                            <i className="fas fa-info-circle"></i>
                        </Button>
                        <Button
                            variant="link"
                            className="drag-handle"
                            style={{ color: textColor, fontSize: '1.2em' }}
                            ref={drag}
                        >
                            <i className="fas fa-grip-vertical"></i>
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
    const [showSidebar, setShowSidebar] = useState(false);
    

    useEffect(() => {
        handleGenerate(); // Generate the initial palette
    }, []);

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

    const handleGenerate = () => {
        const newPalette = generateRandomPalette();
        setCurrentPalette(
            newPalette.map((color) => ({
                hex: color,
                name: namer(color).ntc[0].name,
                textColor: getTextColor(color),
            }))
        );
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <Container fluid className="p-0 d-flex flex-column" style={{ height: '100%' }}>
                <Sidebar
                    show={showSidebar}
                    onClose={() => setShowSidebar(false)}
                    onGenerate={handleGenerate}
                />
                <Row className="flex-grow-1 justify-content-center m-0" style={{ display: 'flex' }}>
                    {currentPalette.map((colorObj, index) => (
                        <DraggableCard
                            key={`${colorObj.hex}-${index}`}
                            index={index}
                            color={colorObj.hex}
                            colorName={colorObj.name}
                            textColor={colorObj.textColor}
                            moveCard={moveCard}
                            onClick={() => handleColorClick(colorObj.hex)}
                            onCopy={() => handleOpenCopyOptions(colorObj)}
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

                <ColorInfoModal
                    isModalOpen={isModalOpen}
                    closeModal={closeModal}
                    selectedColor={selectedColor}
                    colorInfo={colorInfo}
                    colorHarmonies={colorHarmonies}
                    handleHarmonyClick={handleHarmonyClick}
                />
            </Container>
        </DndProvider>
    );
};

export default PaletteGenerator;
