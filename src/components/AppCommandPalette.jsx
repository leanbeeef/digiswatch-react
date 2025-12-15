import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

const commands = [
  { label: 'Home', path: '/home', icon: 'bi-house' },
  { label: 'Palette Generator', path: '/palette-generator', icon: 'bi-speedometer2' },
  { label: 'Popular Palettes', path: '/popular-palettes', icon: 'bi-fire' },
  { label: 'Contrast Checker', path: '/contrastchecker', icon: 'bi-eye' },
  { label: 'Image Extractor', path: '/imagecolorextractor', icon: 'bi-eyedropper' },
  { label: 'Color Season', path: '/color-season', icon: 'bi-brush' },
  { label: 'Live Feed', path: '/feed', icon: 'bi-people' },
  { label: 'Profile', path: '/profile', icon: 'bi-person-circle' },
];

const AppCommandPalette = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return commands.filter((cmd) => cmd.label.toLowerCase().includes(q));
  }, [query]);

  const handleSelect = (cmd) => {
    navigate(cmd.path);
    onClose?.();
  };

  const handleKeyDown = (event) => {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose?.();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, Math.max(filtered.length - 1, 0)));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const cmd = filtered[activeIndex];
      if (cmd) handleSelect(cmd);
    }
  };

  if (!open) return null;

  return (
    <div className="command-palette-backdrop" onClick={onClose}>
      <div
        className="command-palette"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="command-palette__input">
          <i className="bi bi-search"></i>
          <input
            autoFocus
            placeholder="Go to a tool…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search commands"
          />
          <span className="command-palette__hint">Esc to close</span>
        </div>
        <div className="command-palette__list">
          {filtered.length === 0 && (
            <div className="command-palette__empty">No matches</div>
          )}
          {filtered.map((cmd, idx) => (
            <button
              key={cmd.path}
              className={`command-palette__item ${idx === activeIndex ? 'is-active' : ''}`}
              onClick={() => handleSelect(cmd)}
            >
              <i className={`bi ${cmd.icon}`}></i>
              <span>{cmd.label}</span>
              <span className="command-palette__path">{cmd.path}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppCommandPalette;
