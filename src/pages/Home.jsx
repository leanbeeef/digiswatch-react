// src/pages/Home.jsx
// Updated home experience to align with course design and improve mobile CTA behavior

import { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../PopularPalettes.css';
import '../styles/Home.css'; // New styles
import CommunityFeed from '../components/CommunityFeed';
import SEO from '../components/SEO';
import popularPalettes from '../utils/paletteData';
import dsGeneratorImg from '../assets/DS_generator.png';
import dsContrastImg from '../assets/DS_contrast.png';
import dsExtractorImg from '../assets/DS_extractor.png';
import dsPopularImg from '../assets/DS_popular.png'; // Using for Color Season

const Home = () => {
  const navigate = useNavigate();

  // Logic for the Popular Palettes cards (preserved)
  const handleOpenInGenerator = (palette) => {
    navigate('/palette-generator', { state: { palette } });
  };

  const handleCopy = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // noop
    }
  };

  const [oklch, setOklch] = useState({ l: 0.95, c: 0.05, h: 240 });

  useEffect(() => {
    // Randomize on mount
    setOklch({
      l: 0.90 + Math.random() * 0.08, // Keep it very light (90-98%) for contrast
      c: 0.05 + Math.random() * 0.1,  // Subtle to Vibrant (0.05-0.15)
      h: Math.floor(Math.random() * 360)
    });
  }, []);

  return (
    <>
      <SEO
        title="DigiSwatch - Modern Color Tools for Creators"
        description="DigiSwatch is your digital color palette playground. Generate custom color schemes, explore trending palettes, check contrast, and more."
        keywords="color palette generator, popular color palettes, design colors, contrast checker, accessible color schemes, DigiSwatch"
        url="/"
      />

      <div className="home-modern-wrapper">
        {/* MODERN HERO */}
        <section
          className="hero-modern"
          style={{
            backgroundColor: `oklch(${oklch.l} ${oklch.c} ${oklch.h})`,
            transition: 'background-color 0.1s ease', // Smooth transition while dragging
            '--hero-bg': 'none' // Override previous bg 
          }}
        >
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="hero-title">
                Master Color <br /> Without the Chaos.
              </h1>
              <p className="hero-desc">
                The all-in-one workspace for accessible, consistent, and beautiful color systems.
                Built on OKLCH for the modern web.
              </p>

              {/* OKLCH Controls */}
              <div className="oklch-hero-controls">
                <div className="oklch-control-group">
                  <label>L</label>
                  <input
                    type="range"
                    min="0.85"
                    max="0.99"
                    step="0.01"
                    value={oklch.l}
                    className="oklch-slider"
                    onChange={(e) => setOklch(p => ({ ...p, l: parseFloat(e.target.value) }))}
                  />
                  <span className="oklch-value">{Math.round(oklch.l * 100)}%</span>
                </div>
                <div className="oklch-control-group">
                  <label>C</label>
                  <input
                    type="range"
                    min="0"
                    max="0.3"
                    step="0.01"
                    value={oklch.c}
                    className="oklch-slider"
                    onChange={(e) => setOklch(p => ({ ...p, c: parseFloat(e.target.value) }))}
                  />
                  <span className="oklch-value">{oklch.c}</span>
                </div>
                <div className="oklch-control-group">
                  <label>H</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                    value={oklch.h}
                    className="oklch-slider"
                    onChange={(e) => setOklch(p => ({ ...p, h: parseInt(e.target.value) }))}
                  />
                  <span className="oklch-value">{oklch.h}</span>
                </div>
                <div className="oklch-control-group ms-2 border-start ps-3" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                  <small className="font-monospace text-muted" style={{ fontSize: '0.75em' }}>
                    oklch({Math.round(oklch.l * 100)}% {oklch.c} {oklch.h})
                  </small>
                </div>
              </div>

              <div className="hero-cta-group">
                <button className="btn-modern-primary" onClick={() => navigate('/palette-generator')}>
                  Open Generator
                </button>
                <button className="btn-modern-secondary" onClick={() => navigate('/popular-palettes')}>
                  Browse Library
                </button>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* BENTO GRID TOOLS */}
        <section className="bento-section">
          <Container>
            <div className="bento-grid">
              {/* Main Feature: Generator */}
              <div className="bento-card span-8 row-2" onClick={() => navigate('/palette-generator')} style={{ cursor: 'pointer', minHeight: '380px' }}>
                <img src={dsGeneratorImg} alt="" className="bento-bg-image" />
                <div className="bento-content">
                  <div className="d-flex justify-content-between w-100">
                    <div className="bento-icon-wrapper">
                      <i className="bi bi-palette"></i>
                    </div>
                    <div className="d-none d-md-block">
                      <i className="bi bi-arrow-right fs-4 text-muted"></i>
                    </div>
                  </div>
                  <div>
                    <h3>Palette Generator</h3>
                    <p className="mb-0" style={{ maxWidth: '80%' }}>Lock, shuffle, and fine-tune colors with our advanced editor. Export to CSS, JSON, and more in one click. The core tool for your workflow.</p>
                  </div>
                </div>
              </div>

              {/* Feature: AI */}
              <div className="bento-card span-4" onClick={() => navigate('/palette-generator')} style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #fff 0%, #f0f9ff 100%)' }}>
                <div className="bento-content">
                  <div>
                    <div className="bento-icon-wrapper text-primary bg-primary bg-opacity-10">
                      <i className="bi bi-stars"></i>
                    </div>
                    <h3>AI Gen</h3>
                    <p className="mb-0">Describe a vibe, get a palette. <br /> <span className="text-muted small">Powered by You.</span></p>
                  </div>
                </div>
              </div>

              {/* Feature: Contrast */}
              <div className="bento-card span-4" onClick={() => navigate('/contrastchecker')} style={{ cursor: 'pointer' }}>
                {/* <img src={dsContrastImg} alt="" className="bento-bg-image" /> */}
                <div className="bento-content">
                  <div>
                    <div className="bento-icon-wrapper">
                      <i className="bi bi-eye"></i>
                    </div>
                    <h3>Contrast Checker</h3>
                    <p className="mb-0">Validate WCAG AA/AAA scores instantly.</p>
                  </div>
                </div>
              </div>

              {/* Feature: Image Extractor */}
              <div className="bento-card span-6" onClick={() => navigate('/imagecolorextractor')} style={{ cursor: 'pointer' }}>
                {/* <img src={dsExtractorImg} alt="" className="bento-bg-image" /> */}
                <div className="bento-content">
                  <div className="d-flex align-items-center gap-4">
                    <div className="bento-icon-wrapper mb-0">
                      <i className="bi bi-image"></i>
                    </div>
                    <div>
                      <h3 className="mb-1">Image Extractor</h3>
                      <p className="mb-0">Pull precise colors from your inspiration.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature: Season */}
              <div className="bento-card span-6" onClick={() => navigate('/color-season')} style={{ cursor: 'pointer' }}>
                {/* <img src={dsPopularImg} alt="" className="bento-bg-image" /> */}
                <div className="bento-content">
                  <div className="d-flex align-items-center gap-4">
                    <div className="bento-icon-wrapper mb-0">
                      <i className="bi bi-person-bounding-box"></i>
                    </div>
                    <div>
                      <h3 className="mb-1">Color Season</h3>
                      <p className="mb-0">Find your personal palette match.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* POPULAR PALETTES (UNCHANGED STYLING) */}
        <section className="py-5" aria-labelledby="popular-palettes-heading">
          <Container>
            <div className="d-flex align-items-end justify-content-between mb-4 flex-wrap gap-3">
              <div>
                <h2 id="popular-palettes-heading" className="h2 fw-bold mb-1">
                  Trending Now
                </h2>
                <p className="text-muted mb-0">Community favorites, curated for you.</p>
              </div>
              <Button variant="link" className="text-decoration-none px-0 fw-semibold" onClick={() => navigate('/popular-palettes')}>
                View All <i className="bi bi-arrow-right ms-1"></i>
              </Button>
            </div>

            <Row className="g-4">
              {popularPalettes.slice(0, 6).map((palette, index) => (
                <Col xs={12} sm={6} lg={4} key={index}>
                  <div className="pp-card h-100">
                    <div className="pp-card-body">
                      <div className="pp-card-head">
                        <div className="pp-palette-name">{palette.name}</div>
                        <div className="d-flex gap-1">
                          {palette.tags?.slice(0, 2).map((t, i) => (
                            <Badge bg="light" text="dark" key={i}>
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="pp-color-strip" role="img" aria-label={`Color palette: ${palette.colors.join(', ')}`}>
                        {palette.colors.map((color, idx) => (
                          <div
                            key={idx}
                            className="pp-color-swatch"
                            style={{ backgroundColor: color }}
                            data-color={color}
                            onClick={() => handleCopy(color)}
                            title="Click to copy hex"
                          ></div>
                        ))}
                      </div>

                      <div className="pp-actions mt-3">
                        <button className="pp-action-ghost" onClick={() => handleOpenInGenerator(palette)}>
                          <i className="bi bi-rocket-takeoff-fill"></i>
                          <span>Explore</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* OKLCH MODERN */}
        <Container>
          <section className="oklch-section">
            <Row className="align-items-center gy-5">
              <Col lg={6}>
                <h2 className="display-6 fw-bold mb-4">Built on OKLCH.</h2>
                <p className="lead text-muted mb-5">
                  The future of color on the web is here. Access a wider gamut, predictable contrast, and uniform brightness.
                </p>
                <div className="d-flex gap-4">
                  <div className="d-flex flex-column">
                    <span className="fw-bold fs-4">30%</span>
                    <span className="text-muted small">More Colors</span>
                  </div>
                  <div className="d-flex flex-column">
                    <span className="fw-bold fs-4">100%</span>
                    <span className="text-muted small">Uniform</span>
                  </div>
                </div>
              </Col>
              <Col lg={6}>
                <div className="rounded-4 overflow-hidden shadow-sm border">
                  <div className="p-4 bg-white">
                    <label className="text-muted small fw-bold text-uppercase mb-2">OKLCH Gradient Spectrum</label>
                    <div style={{ height: '80px', borderRadius: '12px', background: 'linear-gradient(to right, oklch(60% 0.2 0), oklch(60% 0.2 120), oklch(60% 0.2 240))' }}></div>
                  </div>
                </div>
              </Col>
            </Row>
          </section>
        </Container>

        {/* COMMUNITY FEED */}
        <section className="py-5 bg-light">
          <Container>
            <CommunityFeed />
          </Container>
        </section>
      </div>
    </>
  );
};

export default Home;
