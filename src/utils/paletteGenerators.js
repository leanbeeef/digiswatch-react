// src/utils/paletteGenerators.js

import { TinyColor } from '@ctrl/tinycolor';

export const generateMonochromatic = (hex) => {
  let colors = [];
  const tinyColor = new TinyColor(hex);
  for (let i = -4; i <= 3; i++) {
    colors.push(tinyColor.clone().brighten(i * 10).toHexString());
  }
  return colors.slice(0, 6);
};

// Generate 6-color Analogous Palette
export const generateAnalogous = (hex) => {
  const tinyColor = new TinyColor(hex);
  return [
    tinyColor.clone().spin(-30).toHexString(),
    tinyColor.clone().spin(-15).toHexString(),
    hex,
    tinyColor.clone().spin(15).toHexString(),
    tinyColor.clone().spin(30).toHexString(),
    tinyColor.clone().spin(45).toHexString(), // Added a 45-degree variation to reach 6 colors
  ];
};

// Generate 6-color Complementary Palette
export const generateComplementary = (hex) => {
  const tinyColor = new TinyColor(hex);
  const complement = tinyColor.clone().complement().toHexString();
  return [
    hex,
    tinyColor.clone().lighten(20).toHexString(),
    tinyColor.clone().darken(20).toHexString(),
    complement,
    new TinyColor(complement).lighten(20).toHexString(),
    new TinyColor(complement).darken(20).toHexString(),
  ]; // Adds lightened and darkened versions to reach 6 colors
};

// Generate 6-color Split Complementary Palette
export const generateSplitComplementary = (hex) => {
  const tinyColor = new TinyColor(hex);
  return [
    tinyColor.clone().spin(-150).toHexString(),
    tinyColor.clone().spin(-120).toHexString(),
    hex,
    tinyColor.clone().spin(120).toHexString(),
    tinyColor.clone().spin(150).toHexString(),
    tinyColor.clone().spin(180).toHexString(), // Extending range to reach 6 colors
  ];
};

// Generate 6-color Triadic Palette
export const generateTriadic = (hex) => {
  const tinyColor = new TinyColor(hex);
  return [
    tinyColor.clone().spin(120).toHexString(),
    tinyColor.clone().spin(90).toHexString(),
    hex,
    tinyColor.clone().spin(-90).toHexString(),
    tinyColor.clone().spin(-120).toHexString(),
    tinyColor.clone().spin(-150).toHexString(), // Extending range to reach 6 colors
  ];
};

// Generate 6-color Tetradic Palette
export const generateTetradic = (hex) => {
  const tinyColor = new TinyColor(hex);
  return [
    hex,
    tinyColor.clone().spin(90).toHexString(),
    tinyColor.clone().spin(180).toHexString(),
    tinyColor.clone().spin(270).toHexString(),
    tinyColor.clone().spin(45).toHexString(),
    tinyColor.clone().spin(135).toHexString(), // Additional variations for 6 colors
  ];
};


export const generateRandomPalette = () => {
  const palette = [];
  while (palette.length < 6) {
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    if (!palette.includes(randomColor)) {
      palette.push(randomColor);
    }
  }
  return palette;
};

// Exporting all palette types for easy access
export const generatePalette = (hex, paletteType) => {
  switch (paletteType) {
    case 'monochromatic':
      return generateMonochromatic(hex);
    case 'analogous':
      return generateAnalogous(hex);
    case 'complementary':
      return generateComplementary(hex);
    case 'splitComplementary':
      return generateSplitComplementary(hex);
    case 'triadic':
      return generateTriadic(hex);
    case 'tetradic':
      return generateTetradic(hex);
    default:
      return generateMonochromatic(hex);
  }
};
