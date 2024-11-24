// src/components/Footer.jsx

import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import logoFooterLight from '../assets/ds_stack_black.svg';
import logoFooterDark from '../assets/ds_stack_white.svg';

const Footer = () => {
  return (
    <footer className="bg-light py-4">
      <Container>
        <Row>
          <Col md={4} className="d-flex flex-column text-center text-md-start mb-3 mb-md-0">
            <img className='p-2 mb-2' src={logoFooterLight} alt="DigiSwatch Footer Logo" width="150" />
            <p className="mt-2">Your Digital Palette Playground. Explore and create color palettes effortlessly.</p>
          </Col>
          <Col md={4} className="text-center mb-3 mb-md-0">
            <h5>Quick Links</h5>
            <Nav className="flex-column">
              <Nav.Link href="/palette-generator">Palette Generator</Nav.Link>
              <Nav.Link href="/popular-palettes">Popular Colors</Nav.Link>
              <Nav.Link href="/contrast-checker">Contrast Checker</Nav.Link>
              <Nav.Link href="/image-extractor">Image Extractor</Nav.Link>
              <Nav.Link href="/text-extractor">Text Extractor</Nav.Link>
            </Nav>
          </Col>
          <Col md={4} className="text-center text-md-end">
            <h5>Follow Us</h5>
            <div className="d-flex justify-content-center justify-content-md-end">
              <a href="https://twitter.com" target="_blank" className="me-3"><i className="fab fa-twitter fa-lg"></i></a>
              <a href="https://instagram.com" target="_blank" className="me-3"><i className="fab fa-instagram fa-lg"></i></a>
              <a href="https://linkedin.com" target="_blank"><i className="fab fa-linkedin fa-lg"></i></a>
            </div>
          </Col>
        </Row>
        <div className="text-center mt-3">
          <p>&copy; 2024 DigiSwatch. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
