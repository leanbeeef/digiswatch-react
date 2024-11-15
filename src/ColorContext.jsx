// src/ColorContext.jsx

import React, { createContext, useState } from 'react';
import { generatePalette } from './utils/paletteGenerators';

export const ColorContext = createContext();

const ColorProvider = ({ children }) => {
  const [currentPalette, setCurrentPalette] = useState([]);

  // Function to update the palette based on color and harmony type
  const handleColorChange = (color, harmonyType = 'monochromatic') => {
    const newPalette = generatePalette(color, harmonyType);
    setCurrentPalette(newPalette);
  };

  return (
    <ColorContext.Provider value={{ currentPalette, handleColorChange }}>
      {children}
    </ColorContext.Provider>
  );
};

export default ColorProvider;
