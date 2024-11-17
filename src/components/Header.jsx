// src/components/Header.jsx

import React from 'react';
import { Navbar, Container, Button } from 'react-bootstrap';
import logoLight from '../assets/ds_hz_black.svg';

const Header = ({ onOpenSidebar }) => {
  return (
    <Navbar bg="light" expand="lg" className="py-3">
      <Container fluid className="d-flex align-items-center justify-content-between">
        {/* Logo and Sidebar Toggle Button */}
        <div className="d-flex align-items-center">
          <Navbar.Brand href="/" className="d-flex align-items-center me-2">
            <img
              src={logoLight}
              alt="DigiSwatch Logo"
              height="40"
            />
          </Navbar.Brand>
          <Button
            variant="outline-primary"
            className="d-flex align-items-center ms-2 d-lg-none"
            onClick={onOpenSidebar}
            aria-label="Open Sidebar"
          >
            <i className="fas fa-bars"></i>
          </Button>
        </div>

        {/* Sidebar Toggle Button for larger screens */}
        <Button
          variant="outline-primary"
          className="d-none d-lg-flex align-items-center sidebar-toggle-btn"
          onClick={onOpenSidebar}
          aria-label="Open Sidebar"
        >
          <i className="fas fa-bars"></i>
        </Button>
      </Container>
    </Navbar>
  );
};

export default Header;
