// src/App.jsx

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import { AuthProvider } from './AuthContext'; // Adjust the path to where your AuthContext is located
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import PaletteGenerator from './pages/PaletteGenerator';
import PopularPalettes from './pages/PopularPalettes';
import ColorProvider from './ColorContext';
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Profile from "./pages/Profile"
import PublicProfile from "./pages/PublicProfile"
import LiveFeed from "./pages/LiveFeed"
import Home from "./pages/Home"
import ContrastChecker from "./pages/ContrastChecker"
import ImageColorExtractor from './pages/ImageExtractor';
import ColorSeason from './pages/ColorSeason';
import MoodBoardPage from './moodboard/MoodBoardPage';
import PwaSplash from './components/PwaSplash';
import './index.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      return !localStorage.getItem('pwaSplashSeen');
    } catch {
      return true;
    }
  });

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

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

  return (
    <ColorProvider> {/* Wrap the entire app in ColorProvider */}
      <AuthProvider>
        <Router>
          <div className="full-page">
            <PwaSplash show={showSplash} onDone={handleSplashDone} />
            <Header onOpenSidebar={openSidebar} />
            <Sidebar show={sidebarOpen} onClose={closeSidebar} />
            <main className="main-content full-height-minus-header overflow-hidden">
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
                {/* Add other routes as needed */}
              </Routes>
            </main>
            <ConditionalFooter />
          </div>
        </Router>
      </AuthProvider>
    </ColorProvider>
  );
}

// This component will conditionally render the Footer based on the current path
const ConditionalFooter = () => {
  const location = useLocation();

  // List of routes where you want the footer to be displayed
  const footerRoutes = ['/pop', '/another-route'];

  return footerRoutes.includes(location.pathname) ? <Footer /> : null;
};

export default App;
