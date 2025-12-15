// src/components/CardDetailModal.jsx
// Modal for displaying expanded card content

import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const CardDetailModal = ({ show, onHide, title, children }) => {
    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {children}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CardDetailModal;
