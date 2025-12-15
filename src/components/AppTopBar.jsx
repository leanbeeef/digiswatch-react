import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import favicon from '/favicon.svg';

const AppTopBar = ({ onCommand }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const sectionLabel = location.pathname === '/' ? 'Home' : location.pathname.replace('/', '') || 'Home';

  return (
    <header className="app-topbar">
      <div className="app-topbar__left" onClick={() => navigate('/home')} role="button" aria-label="Go home">
        <div className="app-topbar__logo">
          <img src={favicon} alt="Logo" className="app-topbar__mark-img" />
          <span className="app-topbar__wordmark">DigiSwatch</span>
        </div>
        <span className="app-topbar__section">{sectionLabel}</span>
      </div>
      <div className="app-topbar__actions">
        <button className="ghost-btn" onClick={onCommand} aria-label="Open command palette">
          <i className="bi bi-command"></i>
          <span className="d-none d-md-inline">Command</span>
        </button>
        <button className="ghost-btn" onClick={() => navigate('/profile')} aria-label="Profile">
          <i className="bi bi-person-circle"></i>
        </button>
      </div>
    </header>
  );
};

export default AppTopBar;
