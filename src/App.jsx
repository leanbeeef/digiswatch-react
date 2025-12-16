// src/App.jsx

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import AppRail from './components/AppRail';
import AppCommandPalette from './components/AppCommandPalette';
import GlobalPaletteTray from './components/GlobalPaletteTray';
import { PaletteWorkspaceProvider } from './contexts/PaletteWorkspaceContext';
import './index.css';

const DESKTOP_MIN_WIDTH = 1024;

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
  const [isMobileBlocked, setIsMobileBlocked] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < DESKTOP_MIN_WIDTH;
  });

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
      setIsMobileBlocked(window.innerWidth < DESKTOP_MIN_WIDTH);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const hideGlobalTray =
    location.pathname.startsWith('/home') ||
    location.pathname.startsWith('/feed') ||
    location.pathname.startsWith('/popular-palettes') ||
    location.pathname.startsWith('/color-season') ||
    location.pathname.startsWith('/palette-generator') ||
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/signup') ||
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/u/');

  const shellClass = hideGlobalTray ? 'app-shell immersive-shell' : 'app-shell immersive-shell has-global-tray';

  if (isMobileBlocked) {
    return (
      <div className="mobile-blocker">
        <div className="mobile-blocker__card">
          <div className="mobile-blocker__badge">Desktop only</div>
          <h1 className="mobile-blocker__title">Digiswatch works best on desktop</h1>
          <p className="mobile-blocker__body">
            The mobile experience is temporarily paused while we finish responsive updates. Please switch to a larger
            screen to continue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <PwaSplash show={showSplash} onDone={handleSplashDone} />
      <AppTopBar />
      <div className="app-shell__body">
        <AppRail />
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
      {!hideGlobalTray && <GlobalPaletteTray />}
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
