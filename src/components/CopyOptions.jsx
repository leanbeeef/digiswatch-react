// src/components/CopyOptions.jsx

import React from 'react';
import { Modal, Button, Row, Col } from 'react-bootstrap';
import { copyColorToClipboard } from '../utils/clipboard';

const CopyOptions = ({ show, onClose, colorInfo }) => {
  const copyModes = [
    { mode: 'HEX', code: colorInfo.hex, icon: 'fas fa-hashtag' },
    { mode: 'RGB', code: colorInfo.rgb, icon: 'fas fa-palette' },
    { mode: 'HSL', code: colorInfo.hsl, icon: 'fas fa-adjust' },
    { mode: 'LAB', code: colorInfo.lab, icon: 'fas fa-flask' },
    { mode: 'CMYK', code: colorInfo.cmyk, icon: 'fas fa-tint' },
    { mode: 'YPbPr', code: colorInfo.ypbpr, icon: 'fas fa-tv' },
    { mode: 'xvYCC', code: colorInfo.xvycc, icon: 'fas fa-expand' },
    { mode: 'HSV', code: colorInfo.hsv, icon: 'fas fa-sun' },
  ];

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Copy Color Code</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-2">
          {copyModes.map((mode, index) => (
            <Col xs={6} key={index} className="d-flex justify-content-center">
              <Button
                variant="outline-primary"
                className="w-100 d-flex flex-column align-items-center py-3"
                onClick={() => copyColorToClipboard(mode.code)}
              >
                <i className={`${mode.icon} mb-1`}></i>
                <div className="fw-bold">{mode.mode}</div>
              </Button>
            </Col>
          ))}
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CopyOptions;
