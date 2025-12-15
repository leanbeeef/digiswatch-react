import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

const navItems = [
  { path: '/home', icon: 'bi-house', label: 'Home' },
  { path: '/palette-generator', icon: 'bi-palette', label: 'Generator' },
  { path: '/contrastchecker', icon: 'bi-border-style', label: 'Contrast' },
  { path: '/imagecolorextractor', icon: 'bi-droplet', label: 'Extract' },
  { path: '/color-season', icon: 'bi-circle-half', label: 'Season' },
  { path: '/feed', icon: 'bi-people', label: 'Feed' },
];

const AppRail = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="app-rail" aria-label="Primary">
      {navItems.map((item) => {
        const active = location.pathname.startsWith(item.path);
        return (
          <button
            key={item.path}
            className={`app-rail__item ${active ? 'is-active' : ''}`}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
            aria-pressed={active}
            title={item.label}
          >
            <i className={`bi ${item.icon}`}></i>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default AppRail;
