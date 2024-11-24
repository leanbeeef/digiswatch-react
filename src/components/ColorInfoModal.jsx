// src/components/ColorInfoModal.jsx

import React from 'react';
import { Modal, Button, Row, Col, Accordion } from 'react-bootstrap';
import { copyColorToClipboard, showPopupMessage } from '../utils/clipboard';

const ColorInfoModal = ({ isModalOpen, closeModal, selectedColor, colorInfo, colorHarmonies, handleHarmonyClick }) => {
    // Function to generate CSS gradient code from colors array
    const generateGradientCSS = (colors) => `linear-gradient(90deg, ${colors.join(', ')})`;

    return (
        <Modal show={isModalOpen} onHide={closeModal} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Color Information</Modal.Title>
            </Modal.Header>
            <Modal.Body className="px-4">
                {selectedColor && (
                    <Accordion defaultActiveKey="0">
                        {/* Color Codes Section */}
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Color Codes</Accordion.Header>
                            <Accordion.Body>
                                <Row className="text-center mb-4">
                                    <Col xs={6} className="d-flex justify-content-between align-items-center">
                                        <p className="mb-0"><strong>HEX:</strong> {colorInfo.hex}</p>
                                        <Button
                                            variant="link"
                                            onClick={() => {
                                                copyColorToClipboard(colorInfo.hex); // Triggers the copy function
                                                showPopupMessage(`Copied ${colorInfo.hex} to clipboard!`); // Show the copy message
                                            }}
                                            className="p-0"
                                        >
                                            <i className="fas fa-copy"></i>
                                        </Button>
                                    </Col>
                                    <Col xs={6} className="d-flex justify-content-between align-items-center">
                                        <p className="mb-0"><strong>RGB:</strong> {colorInfo.rgb}</p>
                                        <Button variant="link"
                                            onClick={() => {
                                                copyColorToClipboard(colorInfo.hex); // Triggers the copy function
                                                showPopupMessage(`Copied ${colorInfo.hex} to clipboard!`); // Show the copy message
                                            }} className="p-0">
                                            <i className="fas fa-copy"></i>
                                        </Button>
                                    </Col>
                                    <Col xs={6} className="d-flex justify-content-between align-items-center mt-2">
                                        <p className="mb-0"><strong>HSL:</strong> {colorInfo.hsl}</p>
                                        <Button variant="link"
                                            onClick={() => {
                                                copyColorToClipboard(colorInfo.hex); // Triggers the copy function
                                                showPopupMessage(`Copied ${colorInfo.hex} to clipboard!`); // Show the copy message
                                            }} className="p-0">
                                            <i className="fas fa-copy"></i>
                                        </Button>
                                    </Col>
                                    <Col xs={6} className="d-flex justify-content-between align-items-center mt-2">
                                        <p className="mb-0"><strong>LAB:</strong> {colorInfo.lab}</p>
                                        <Button variant="link"
                                            onClick={() => {
                                                copyColorToClipboard(colorInfo.hex); // Triggers the copy function
                                                showPopupMessage(`Copied ${colorInfo.hex} to clipboard!`); // Show the copy message
                                            }} className="p-0">
                                            <i className="fas fa-copy"></i>
                                        </Button>
                                    </Col>
                                    <Col xs={6} className="d-flex justify-content-between align-items-center mt-2">
                                        <p className="mb-0"><strong>CMYK:</strong> {colorInfo.cmyk}</p>
                                        <Button variant="link"
                                            onClick={() => {
                                                copyColorToClipboard(colorInfo.hex); // Triggers the copy function
                                                showPopupMessage(`Copied ${colorInfo.hex} to clipboard!`); // Show the copy message
                                            }} className="p-0">
                                            <i className="fas fa-copy"></i>
                                        </Button>
                                    </Col>
                                    <Col xs={6} className="d-flex justify-content-between align-items-center mt-2">
                                        <p className="mb-0"><strong>YPbPr:</strong> {colorInfo.ypbpr}</p>
                                        <Button variant="link" onClick={() => copyColorToClipboard(colorInfo.ypbpr)} className="p-0">
                                            <i className="fas fa-copy"></i>
                                        </Button>
                                    </Col>
                                    <Col xs={6} className="d-flex justify-content-between align-items-center mt-2">
                                        <p className="mb-0"><strong>xvYCC:</strong> {colorInfo.xvycc}</p>
                                        <Button variant="link"
                                            onClick={() => {
                                                copyColorToClipboard(colorInfo.hex); // Triggers the copy function
                                                showPopupMessage(`Copied ${colorInfo.hex} to clipboard!`); // Show the copy message
                                            }} className="p-0">
                                            <i className="fas fa-copy"></i>
                                        </Button>
                                    </Col>
                                    <Col xs={6} className="d-flex justify-content-between align-items-center mt-2">
                                        <p className="mb-0"><strong>HSV:</strong> {colorInfo.hsv}</p>
                                        <Button variant="link"
                                            onClick={() => {
                                                copyColorToClipboard(colorInfo.hex); // Triggers the copy function
                                                showPopupMessage(`Copied ${colorInfo.hex} to clipboard!`); // Show the copy message
                                            }} className="p-0">
                                            <i className="fas fa-copy"></i>
                                        </Button>
                                    </Col>
                                </Row>

                            </Accordion.Body>
                        </Accordion.Item>

                        {/* Color Harmonies Section */}
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Color Harmonies</Accordion.Header>
                            <Accordion.Body>
                                <p className="small mb-3 text-center">(Click on a harmony to display it on the palette!)</p>
                                <Row>
                                    {Object.entries(colorHarmonies).map(([type, colors]) => (
                                        <Col xs={6} key={type} className="mb-4">
                                            <h6 className="text-muted">{type.charAt(0).toUpperCase() + type.slice(1)}</h6>
                                            <div className="d-flex flex-wrap">
                                                {colors.map((color, index) => (
                                                    <div
                                                        key={index}
                                                        className="rounded"
                                                        style={{
                                                            backgroundColor: color,
                                                            width: `calc(100% / ${colors.length})`,
                                                            height: '30px',
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={() => handleHarmonyClick(colors)}
                                                    />
                                                ))}
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            </Accordion.Body>
                        </Accordion.Item>

                        {/* Gradient Options Section */}
                        <Accordion.Item eventKey="2">
                            <Accordion.Header>Gradient Options</Accordion.Header>
                            <Accordion.Body>
                                <p className="small mb-3 text-center">(Click on a gradient to copy the CSS!)</p>
                                <Row>
                                    {Object.entries(colorHarmonies).map(([type, colors]) => (
                                        <Col xs={6} className="mb-3" key={`${type}-gradient`}>
                                            <div
                                                className="gradient-preview rounded"
                                                style={{
                                                    background: generateGradientCSS(colors),
                                                    height: '40px',
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => copyColorToClipboard(generateGradientCSS(colors))}
                                            />
                                            <h6 className="text-muted mt-2 mb-0">{type.charAt(0).toUpperCase() + type.slice(1)} Gradient</h6>
                                        </Col>
                                    ))}
                                </Row>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={closeModal}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ColorInfoModal;
