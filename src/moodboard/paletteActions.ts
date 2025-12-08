import type { MoodBoard } from './types';
import { loadCurrentMoodBoard, saveCurrentMoodBoard } from './storage';

/**
 * Stub helper to add a palette's colors as rows to the current mood board.
 * This keeps the wiring point ready for palette views without coupling to their state yet.
 */
export const addPaletteToMoodBoard = (colors: string[]): MoodBoard | null => {
  const existing = loadCurrentMoodBoard();
  if (!existing) return null;

  const now = new Date().toISOString();
  const baseZ = Math.max(0, ...existing.items.map((i) => i.zIndex), 0);
  const newItems = colors.map((hex, index) => ({
    id: `palette-${Date.now()}-${index}`,
    type: 'color' as const,
    colorHex: hex,
    label: hex.toUpperCase(),
    x: 60,
    y: 40 + index * 120,
    width: 220,
    height: 100,
    zIndex: baseZ + index + 1,
  }));

  const nextBoard: MoodBoard = {
    ...existing,
    items: [...existing.items, ...newItems],
    updatedAt: now,
  };

  saveCurrentMoodBoard(nextBoard);
  return nextBoard;
};
