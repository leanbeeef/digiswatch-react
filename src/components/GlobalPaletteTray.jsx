import React, { useState } from 'react';
import PaletteTray from './PaletteTray';
import { usePaletteWorkspace } from '../contexts/PaletteWorkspaceContext';

// Shared palette tray that lives at the App shell level so palettes persist across pages.
const GlobalPaletteTray = () => {
  const {
    palette,
    selectedColor,
    setSelectedColor,
    toggleLock,
    moveColor,
    addRandomColor,
  } = usePaletteWorkspace();
  const [draggingIndex, setDraggingIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggingIndex(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(index));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer && (e.dataTransfer.dropEffect = 'move');
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggingIndex !== null) {
      moveColor(draggingIndex, index);
    }
    setDraggingIndex(null);
  };

  const handleDragEnd = () => setDraggingIndex(null);

  return (
    <div className="global-palette-tray">
      <PaletteTray
        palette={palette}
        activeColor={selectedColor}
        onSwatchSelect={setSelectedColor}
        onColorClick={setSelectedColor}
        onToggleLock={toggleLock}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
        draggingIndex={draggingIndex}
        onAddColor={addRandomColor}
      />
    </div>
  );
};

export default GlobalPaletteTray;
