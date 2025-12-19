import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import namer from 'color-namer';
import tinycolor from 'tinycolor2';
import { TinyColor } from '@ctrl/tinycolor';
import { generateRandomPalette } from '../utils/paletteGenerators';

const PaletteWorkspaceContext = createContext(null);
const STORAGE_KEY = 'ds_workspace_palette';
const MAX_COLORS = 10;

const getTextColor = (hex) => {
  return tinycolor.readability(hex, '#FFFFFF') >= 4.5 ? '#FFFFFF' : '#000000';
};

const formatColor = (hex) => {
  const normalizedHex = new TinyColor(hex).toHexString();
  return {
    hex: normalizedHex,
    name: namer(normalizedHex).ntc[0].name,
    textColor: getTextColor(normalizedHex),
    locked: false,
  };
};

const loadStoredPalette = () => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length) {
      return parsed.map((c) => ({
        ...formatColor(c.hex || c),
        locked: Boolean(c.locked),
      }));
    }
  } catch (err) {
    console.warn('Failed to load stored palette', err);
  }
  return null;
};

const createDefaultPalette = () => {
  const colors = generateRandomPalette(6);
  return colors.map(formatColor);
};

export const PaletteWorkspaceProvider = ({ children }) => {
  const [palette, setPalette] = useState(() => loadStoredPalette() || createDefaultPalette());
  const [selectedColor, setSelectedColor] = useState(() => (loadStoredPalette() || [])[0]?.hex || null);
  const [trayCollapsed, setTrayCollapsed] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('paletteTrayCollapsed') === 'true';
  });
  const [swatchStudioHandler, setSwatchStudioHandler] = useState(null);

  // Persist palette
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(palette));
    } catch (err) {
      console.warn('Failed to persist palette', err);
    }
  }, [palette]);

  // Keep a selected color in sync with palette changes
  useEffect(() => {
    if (!palette || palette.length === 0) {
      setSelectedColor(null);
      return;
    }
    if (!selectedColor || !palette.find((c) => c.hex === selectedColor)) {
      setSelectedColor(palette[0].hex);
    }
  }, [palette, selectedColor]);

  const setPaletteFromHexes = (hexes) => {
    if (!Array.isArray(hexes)) return;
    setPalette(hexes.filter(Boolean).slice(0, MAX_COLORS).map(formatColor));
  };

  const toggleLock = (index) => {
    setPalette((prev) =>
      prev.map((c, i) => (i === index ? { ...c, locked: !c.locked } : c))
    );
  };

  const removeColor = (index) => {
    setPalette((prev) => {
      if (prev.length <= 2 || index < 0 || index >= prev.length) return prev;
      const next = prev.filter((_, i) => i !== index);
      if (next.length && (!selectedColor || !next.find(c => c.hex === selectedColor))) {
        setSelectedColor(next[0].hex);
      }
      return next;
    });
  };

  const moveColor = (from, to) => {
    setPalette((prev) => {
      if (
        from === to ||
        from < 0 ||
        to < 0 ||
        from >= prev.length ||
        to >= prev.length
      ) {
        return prev;
      }
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
  };

  const addRandomColor = () => {
    setPalette((prev) => {
      if (prev.length >= MAX_COLORS) return prev;
      const randomHex = `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')}`;
      return [...prev, formatColor(randomHex)];
    });
  };

  const updateColorAtIndex = (index, nextHex) => {
    setPalette((prev) =>
      prev.map((c, i) =>
        i === index ? { ...formatColor(nextHex), locked: c.locked } : c
      )
    );
  };

  const value = useMemo(
    () => ({
      palette,
      setPalette,
      selectedColor,
      setSelectedColor,
      toggleLock,
      moveColor,
      addRandomColor,
      setPaletteFromHexes,
      updateColorAtIndex,
      removeColor,
      trayCollapsed,
      setTrayCollapsed,
      registerSwatchStudioHandler: (handler) => setSwatchStudioHandler(() => handler || null),
      triggerSwatchStudio: (hex, index) => {
        if (swatchStudioHandler) {
          swatchStudioHandler(hex, index);
        } else {
          setSelectedColor(hex);
        }
      },
    }),
    [palette, selectedColor, swatchStudioHandler, trayCollapsed]
  );

  return (
    <PaletteWorkspaceContext.Provider value={value}>
      {children}
    </PaletteWorkspaceContext.Provider>
  );
};

export const usePaletteWorkspace = () => {
  const ctx = useContext(PaletteWorkspaceContext);
  if (!ctx) {
    throw new Error('usePaletteWorkspace must be used within PaletteWorkspaceProvider');
  }
  return ctx;
};
