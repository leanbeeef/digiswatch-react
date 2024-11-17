// utils/exportPalette.js
import html2canvas from 'html2canvas';

export function exportPaletteAsImage(format, currentPalette) {
    const paletteDisplay = document.getElementById('palette-display');
    if (!paletteDisplay) {
        alert('No palette display available to export as image.');
        return;
    }

    // Get all text elements within the palette display
    const colorTexts = paletteDisplay.querySelectorAll('.card-text');
    const colorButtons = paletteDisplay.querySelectorAll('.btn');
    const originalDisplay = [];

    // Hide color information temporarily
    colorTexts.forEach((el, index) => {
        originalDisplay[index] = el.style.display;
        el.style.display = 'none';
    });
    colorButtons.forEach((el, index) => {
        originalDisplay[index] = el.style.display;
        el.style.display = 'none';
    });

    // Capture the canvas
    html2canvas(paletteDisplay).then((canvas) => {
        // Restore original styles
        colorTexts.forEach((el, index) => {
            el.style.display = originalDisplay[index];
        });
        colorButtons.forEach((el, index) => {
            el.style.display = originalDisplay[index];
        });

        // Trigger download
        const link = document.createElement('a');
        link.download = `palette.${format}`;
        link.href = canvas.toDataURL(`image/${format}`);
        link.click();
    });
}


export function exportPaletteAsCSS(currentPalette) {
    let cssContent = ':root {\n';
    currentPalette.forEach((color, index) => {
        cssContent += `  --color-${index + 1}: ${color.hex};\n`;
    });
    cssContent += '}';
    downloadFile(cssContent, 'palette.css', 'text/css');
}

export function exportPaletteAsJSON(currentPalette) {
    const jsonContent = JSON.stringify(currentPalette, null, 2);
    downloadFile(jsonContent, 'palette.json', 'application/json');
}

export function exportPaletteAsText(currentPalette) {
    const textContent = currentPalette.map((color) => color.hex).join('\n');
    downloadFile(textContent, 'palette.txt', 'text/plain');
}

export function exportPaletteAsSVG(currentPalette) {
    const swatchWidth = 100;
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${currentPalette.length * swatchWidth}" height="100">\n`;
    currentPalette.forEach((color, index) => {
        svgContent += `<rect x="${index * swatchWidth}" y="0" width="${swatchWidth}" height="100" fill="${color.hex}" />\n`;
    });
    svgContent += '</svg>';
    downloadFile(svgContent, 'palette.svg', 'image/svg+xml');
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
}
