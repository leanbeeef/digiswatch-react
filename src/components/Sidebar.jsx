import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext'; // Import the authentication context
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Sidebar = ({ show, onClose }) => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [themePref, setThemePref] = useState('system');

  const applyTheme = (mode) => {
    const root = document.documentElement;
    if (mode === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', mode);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('themePreference');
    const initial = stored || 'system';
    setThemePref(initial);
    applyTheme(initial);
  }, []);

  useEffect(() => {
    applyTheme(themePref);
    localStorage.setItem('themePreference', themePref);
  }, [themePref]);

  const cycleTheme = () => {
    setThemePref((prev) => {
      if (prev === 'system') return 'light';
      if (prev === 'light') return 'dark';
      return 'system';
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/'); // Redirect to home after logout
      onClose(); // Close the sidebar
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    onClose(); // Close the sidebar
  };

  return (
    <div
      className={`sidebar d-flex flex-column flex-shrink-0 p-3 ${show ? 'sidebar-show' : 'sidebar-hidden'
        }`}
      style={{
        width: '280px',
        height: '100vh',
        position: 'fixed',
        zIndex: '2000',
        top: '0',
        right: '0',
        transition: 'transform 0.3s ease-in-out',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className='d-flex align-items-center justify-content-between container-fluid'>
        {/* Close Button */}
        <a
          href="/"
          className="d-flex align-items-center  mb-md-0 me-md-auto link-dark text-decoration-none"
        >
          <img src='favicon.ico' className='me-2'></img>
        </a>

        <button
          className="btn-close btn-close-outline"
          aria-label="Close"
          onClick={onClose}
        ></button>

      </div>
      {/* <div className="d-flex align-items-center justify-content-between my-3 px-1">
        <span className="text-muted small">Theme</span>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
          onClick={cycleTheme}
          title="Toggle theme (system / light / dark)"
        >
          {themePref === 'light' && <i className="bi bi-sun-fill"></i>}
          {themePref === 'dark' && <i className="bi bi-moon-stars-fill"></i>}
          {themePref === 'system' && <i className="bi bi-laptop"></i>}
          <span className="text-capitalize">{themePref}</span>
        </button>
      </div> */}
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
        <button
          type="button"
          className="nav-link link-dark text-start w-100"
          aria-current="page"
          onClick={() => handleNavigate('/home')}
        >
          <i className="bi bi-house me-2"></i>
          Home
        </button>
      </li>
      <li>
        <button
          type="button"
          className="nav-link link-dark text-start w-100"
          onClick={() => handleNavigate('/palette-generator')}
        >
          <i className="bi bi-speedometer2 me-2"></i>
          Palette Generator
        </button>
      </li>
        {/* <li>
          <a
            href="#"
            className="nav-link link-dark"
            onClick={() => handleNavigate('/ai-palette-generator')}
          >
            <i className="bi bi-stars me-2"></i>
            AI Palette Generator
          </a>
        </li> */}
        <li>
        <button
          type="button"
          className="nav-link link-dark text-start w-100"
          onClick={() => handleNavigate('/popular-palettes')}
        >
          <i className="bi bi-fire me-2"></i>
          Popular Palettes
        </button>
      </li>
      <li>
        <button
          type="button"
          className="nav-link link-dark text-start w-100"
          onClick={() => handleNavigate('/contrastchecker')}
        >
          <i className="bi bi-spellcheck me-2"></i>
          Contrast Checker
        </button>
      </li>
      <li>
        <button
          type="button"
          className="nav-link link-dark text-start w-100"
          onClick={() => handleNavigate('/imagecolorextractor')}
        >
          <i className="bi bi-eyedropper me-2"></i>
          Image Color Extractor
        </button>
      </li>
      <li>
        <button
          type="button"
          className="nav-link link-dark text-start w-100"
          onClick={() => handleNavigate('/color-season')}
        >
          <i className="bi bi-brush me-2"></i>
          Color Season
        </button>
      </li>
        {/* <li>
          <a
            href="#"
            className="nav-link link-dark"
            onClick={() => handleNavigate('/color-season')}
          >
            <i className="bi bi-palette2 me-2"></i>
            Color Season
          </a>
        </li> */}
      </ul>
      <hr />
      <div className="dropdown">
        {currentUser ? (
          <>
            <button
              type="button"
              className="d-flex align-items-center link-dark text-decoration-none dropdown-toggle btn btn-link p-0"
              id="dropdownUser2"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img
                src={currentUser.avatar || 'https://via.placeholder.com/32'}
                alt="User Avatar"
                width="32"
                height="32"
                className="rounded-circle me-2"
              />
              <strong>{currentUser.username || 'User'}</strong>
            </button>
            <div
              className="dropdown-menu text-small shadow"
              aria-labelledby="dropdownUser2"
              style={{ zIndex: 2050 }}
            >
              <div>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => handleNavigate('/profile')}
                >
                  <i className="bi bi-person-circle me-2"></i>
                  Profile
                </button>
              </div>
              {/* <div>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={() => handleNavigate('/settings')}
                >
                  <i className="bi bi-gear-wide me-2"></i>
                  Settings
                </a>
              </div> */}
              <div>
                <hr className="dropdown-divider" />
              </div>
              <div className='d-inline-flex'>
                <button className="dropdown-item" type="button" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-left me-2"></i>
                  Sign out
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              className="d-flex align-items-center link-dark text-decoration-none btn btn-link p-0"
              onClick={() => handleNavigate('/login')}
            >
              Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
