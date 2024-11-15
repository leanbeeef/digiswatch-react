// src/App.jsx

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import PaletteGenerator from './pages/PaletteGenerator';
import ColorProvider from './ColorContext';
import './index.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <ColorProvider> {/* Wrap the entire app in ColorProvider */}
      <Router>
        <div className="full-page">
          <Header onOpenSidebar={openSidebar} />
          <Sidebar show={sidebarOpen} onClose={closeSidebar} />
          <main className="main-content full-height-minus-header">
            <Routes>
              <Route path="/" element={<Navigate to="/palette-generator" replace />} />
              <Route path="/palette-generator" element={<PaletteGenerator />} />
              {/* Add other routes as needed */}
            </Routes>
          </main>
          <ConditionalFooter />
        </div>
      </Router>
    </ColorProvider>
  );
}

// This component will conditionally render the Footer based on the current path
const ConditionalFooter = () => {
  const location = useLocation();

  // List of routes where you want the footer to be displayed
  const footerRoutes = ['/another-route', '/another-route'];

  return footerRoutes.includes(location.pathname) ? <Footer /> : null;
};

export default App;
