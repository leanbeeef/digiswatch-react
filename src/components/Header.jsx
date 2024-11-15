// src/components/Header.jsx

import React, { useState } from 'react';
import { Navbar, Container, Nav, Form, Button } from 'react-bootstrap';
import logoLight from '../assets/ds_hz_black.svg';
import logoDark from '../assets/ds_hz_white.svg';

const Header = ({ onOpenSidebar }) => {
  const [theme, setTheme] = useState('theme-light');

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
    document.documentElement.setAttribute('data-theme', e.target.value);
  };

  return (
    <Navbar bg="light" expand="lg" className="py-3">
      <Container fluid>
        <Navbar.Brand href="/">
          <img
            src={theme === 'theme-light' ? logoLight : logoDark}
            alt="DigiSwatch Logo"
            height="40"
          />
        </Navbar.Brand>
        <Nav className="ms-auto d-flex align-items-center">
          <Form.Select
            className="me-3 w-auto"
            value={theme}
            onChange={handleThemeChange}
            aria-label="Select Theme"
          >
            <option value="theme-light">Light</option>
            <option value="theme-dark">Dark</option>
          </Form.Select>
          <Button variant="outline-primary" onClick={onOpenSidebar}>
            Gadgets
          </Button>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;
