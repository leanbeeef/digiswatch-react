// src/components/Sidebar.jsx

import React, { useState, useContext } from 'react';
import { Offcanvas, Button, Nav, Form, InputGroup, Dropdown, DropdownButton } from 'react-bootstrap';
import { ColorContext } from '../ColorContext'; // Import your context

const Sidebar = ({ show, onClose, onGenerate, onColorChange, onHarmonyChange, onBlindnessSimulate }) => {
  const [baseColor] = useState('#7E7E7E');
  const [selectedHarmony, setSelectedHarmony] = useState('monochromatic');
  const [harmonyDescription, setHarmonyDescription] = useState('Select a harmony type to see its description.');
  const [colorBlindnessType, setColorBlindnessType] = useState('None');
  const { handleColorChange } = useContext(ColorContext); // Use context to get color change handler

  // Harmony descriptions for display
  const harmonyDescriptions = {
    analogous: "Analogous colors are next to each other on the color wheel.",
    monochromatic: "Monochromatic colors are different shades of the same hue.",
    complementary: "Complementary colors are opposite each other on the color wheel.",
    splitComplementary: "Split complementary uses a base color and two adjacent colors of its complement.",
    triadic: "Triadic colors are evenly spaced around the color wheel.",
    tetradic: "Tetradic colors form a rectangle on the color wheel.",
  };

  const handleHarmonySelect = (harmony) => {
    setSelectedHarmony(harmony);
    setHarmonyDescription(harmonyDescriptions[harmony] || 'Select a harmony type to see its description.');
    onHarmonyChange(harmony); // Call the onHarmonyChange prop when harmony changes
  };

  return (
    <Offcanvas show={show} onHide={onClose} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Gadgets</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {/* Navigation Links */}
        <Nav className="flex-column mb-4">
          <Nav.Link href="/palette-generator">Palette Generator</Nav.Link>
          <Nav.Link href="/popular-palettes">Popular Palettes</Nav.Link>
          <Nav.Link href="/contrast-checker">Contrast Checker</Nav.Link>
          <Nav.Link href="/image-extractor">Image Color Extractor</Nav.Link>
          <Nav.Link href="/text-extractor">Image Text Extractor</Nav.Link>
        </Nav>

        {/* Generate Button */}
        <Button
          variant="primary"
          className="w-100 mb-3"
          onClick={() => {
            console.log('Generate button clicked');
            if (onGenerate) {
              onGenerate(); // Call the function passed from parent
            } else {
              console.warn('onGenerate is not defined'); // Log a warning if it's missing
            }
          }}
        >
          Generate
        </Button>

        {/* Login Button */}
        <Button variant="primary" className="mt-4 w-100">
          Login
        </Button>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default Sidebar;
