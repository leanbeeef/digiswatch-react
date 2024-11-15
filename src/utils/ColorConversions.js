// src/utils/ColorConversions.js

import { TinyColor } from '@ctrl/tinycolor';
import chroma from 'chroma-js';

// Convert HEX to RGB string
export const hexToRgbString = (hex) => {
  const tinyColor = new TinyColor(hex);
  const rgb = tinyColor.toRgb();
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
};

// Convert HEX to HSL string
export const hexToHslString = (hex) => {
  const tinyColor = new TinyColor(hex);
  const hsl = tinyColor.toHsl();
  return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%)`;
};

// Convert HEX to CMYK string
export const hexToCmykString = (hex) => {
  const cmyk = chroma(hex).cmyk();
  return `cmyk(${(cmyk[0] * 100).toFixed(2)}%, ${(cmyk[1] * 100).toFixed(2)}%, ${(cmyk[2] * 100).toFixed(2)}%, ${(cmyk[3] * 100).toFixed(2)}%)`;
};

// Convert HEX to LAB string
export const hexToLabString = (hex) => {
  const lab = chroma(hex).lab();
  return `lab(${lab.map(value => value.toFixed(2)).join(', ')})`;
};

// Convert HEX to YPbPr (Custom function based on YPbPr formula)
export const hexToYpbprString = (hex) => {
  const { r, g, b } = new TinyColor(hex).toRgb();
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const pb = -0.168736 * r - 0.331264 * g + 0.5 * b;
  const pr = 0.5 * r - 0.418688 * g - 0.081312 * b;
  return `YPbPr(${y.toFixed(2)}, ${pb.toFixed(2)}, ${pr.toFixed(2)})`;
};

// Convert HEX to xvYCC (Custom function based on xvYCC color space formula)
export const hexToXvYccString = (hex) => {
  const { r, g, b } = new TinyColor(hex).toRgb();
  const scale = 1.25; // xvYCC extends the range by 25%
  const xvY = scale * (0.299 * r + 0.587 * g + 0.114 * b);
  const xvU = scale * (-0.14713 * r - 0.28886 * g + 0.436 * b);
  const xvV = scale * (0.615 * r - 0.51499 * g - 0.10001 * b);
  return `xvYCC(${xvY.toFixed(2)}, ${xvU.toFixed(2)}, ${xvV.toFixed(2)})`;
};

// Convert HEX to HSV string
export const hexToHsvString = (hex) => {
  const tinyColor = new TinyColor(hex);
  const hsv = tinyColor.toHsv();
  return `hsv(${Math.round(hsv.h)}, ${Math.round(hsv.s * 100)}%, ${Math.round(hsv.v * 100)}%)`;
};

// Main function to gather all color formats
export const getColorInfo = (color) => {
  return {
    hex: new TinyColor(color).toHexString().toUpperCase(),
    rgb: hexToRgbString(color),
    hsl: hexToHslString(color),
    cmyk: hexToCmykString(color),
    lab: hexToLabString(color),
    ypbpr: hexToYpbprString(color),
    xvycc: hexToXvYccString(color),
    hsv: hexToHsvString(color),
  };
};
