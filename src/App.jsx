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
import Home from "./pages/Home"
import ContrastChecker from "./pages/ContrastChecker"
import ImageColorExtractor from './pages/ImageExtractor';
import ColorSeason from './pages/ColorSeason';
import AIPaletteGenerator from './pages/AIPaletteGenerator';
import './index.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <ColorProvider> {/* Wrap the entire app in ColorProvider */}
      <AuthProvider>
        <Router>
          <div className="full-page">
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
                <Route path="/contrastchecker" element={<ContrastChecker />} />
                <Route path="/imagecolorextractor" element={<ImageColorExtractor />} />
                <Route path="/color-season" element={<ColorSeason />} />
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
