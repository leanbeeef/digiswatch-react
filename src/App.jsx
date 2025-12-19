// src/App.jsx

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Footer from './components/Footer';
import PaletteGenerator from './pages/PaletteGenerator';
import PopularPalettes from './pages/PopularPalettes';
import ColorProvider from './ColorContext';
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import LiveFeed from "./pages/LiveFeed";
import Home from "./pages/Home";
import ContrastChecker from "./pages/ContrastChecker";
import ImageColorExtractor from './pages/ImageExtractor';
import ColorSeason from './pages/ColorSeason';
import MoodBoardPage from './moodboard/MoodBoardPage';
import PwaSplash from './components/PwaSplash';
import AppTopBar from './components/AppTopBar';
import AppRail, { NAV_ITEMS } from './components/AppRail';
import AppCommandPalette from './components/AppCommandPalette';
import GlobalPaletteTray from './components/GlobalPaletteTray';
import { PaletteWorkspaceProvider } from './contexts/PaletteWorkspaceContext';
import './index.css';

const DESKTOP_MIN_WIDTH = 1024;

const MobileNavMenu = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className={`mobile-nav ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <button className="mobile-nav__backdrop" onClick={onClose} aria-label="Close menu overlay" />
      <div className="mobile-nav__sheet" role="menu">
        <div className="mobile-nav__header">
          <span>Explore</span>
          <button className="ghost-btn" onClick={onClose} aria-label="Close menu">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="mobile-nav__list">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                className={`mobile-nav__item ${active ? 'is-active' : ''}`}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                role="menuitem"
                aria-pressed={active}
              >
                <div className="mobile-nav__item-icon">
                  <i className={`bi ${item.icon}`}></i>
                </div>
                <div className="mobile-nav__item-text">
                  <span className="mobile-nav__item-label">{item.label}</span>
                  <span className="mobile-nav__item-path">{item.path}</span>
                </div>
                <i className="bi bi-chevron-right mobile-nav__item-caret"></i>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const AppShell = () => {
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      return !localStorage.getItem('pwaSplashSeen');
    } catch {
      return true;
    }
  });
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < DESKTOP_MIN_WIDTH;
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleSplashDone = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('pwaSplashSeen', '1');
      } catch {
        // ignore storage errors and just hide the splash
      }
    }
    setShowSplash(false);
  };

  const shouldShowFooter = false; // footer hidden to maximize workspace
  const [showCommand, setShowCommand] = useState(false);

  React.useEffect(() => {
    const handleKey = (event) => {
      const isCmdK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (isCmdK) {
        event.preventDefault();
        setShowCommand(true);
      }
      if (event.key === 'Escape') {
        setShowCommand(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < DESKTOP_MIN_WIDTH);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen]);

  React.useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const isPaletteGenerator = location.pathname.startsWith('/palette-generator');
  const shouldHideBaseTray =
    location.pathname.startsWith('/home') ||
    location.pathname.startsWith('/feed') ||
    location.pathname.startsWith('/popular-palettes') ||
    location.pathname.startsWith('/color-season') ||
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/signup') ||
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/u/');

  const showGlobalTray = !shouldHideBaseTray && (!isMobile || isPaletteGenerator);
  const shellClass = showGlobalTray ? 'app-shell immersive-shell has-global-tray' : 'app-shell immersive-shell';

  return (
    <div className={shellClass}>
      <PwaSplash show={showSplash} onDone={handleSplashDone} />
      <AppTopBar
        showMenuButton={isMobile}
        isMenuOpen={mobileNavOpen}
        onMenuToggle={() => setMobileNavOpen((open) => !open)}
      />
      {isMobile && <MobileNavMenu open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />}
      <div className="app-shell__body">
        {!isMobile && <AppRail />}
        <main className="app-main immersive-main">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/palette-generator" element={<PaletteGenerator />} />
            <Route path="/popular-palettes" element={<PopularPalettes />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/u/:userId" element={<PublicProfile />} />
            <Route path="/feed" element={<LiveFeed />} />
            <Route path="/contrastchecker" element={<ContrastChecker />} />
            <Route path="/imagecolorextractor" element={<ImageColorExtractor />} />
            <Route path="/color-season" element={<ColorSeason />} />
            <Route path="/mood-board" element={<MoodBoardPage />} />
            {/* <Route path="/ai-palette-generator" element={<AIPaletteGenerator />} /> */}
          </Routes>
        </main>
        <AppCommandPalette open={showCommand} onClose={() => setShowCommand(false)} />
      </div>
      {showGlobalTray && <GlobalPaletteTray />}
      {shouldShowFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <ColorProvider>
      <AuthProvider>
        <PaletteWorkspaceProvider>
          <Router>
            <AppShell />
          </Router>
        </PaletteWorkspaceProvider>
      </AuthProvider>
    </ColorProvider>
  );
}

export default App;
