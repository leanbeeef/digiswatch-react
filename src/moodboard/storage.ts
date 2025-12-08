import type { MoodBoard } from './types';

const STORAGE_KEY = 'moodBoard.current';

export const loadCurrentMoodBoard = (): MoodBoard | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MoodBoard;
  } catch {
    return null;
  }
};

export const saveCurrentMoodBoard = (board: MoodBoard): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  } catch {
    // ignore storage errors
  }
};
