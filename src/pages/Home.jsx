// src/pages/Home.jsx
// Updated home experience to align with course design and improve mobile CTA behavior

import { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../PopularPalettes.css';
import SEO from '../components/SEO';
import popularPalettes from '../utils/paletteData';

const Home = () => {
  const navigate = useNavigate();
  const heroPalettes = useMemo(
    () => [
      { name: 'Studio Sunset', colors: ['#0f172a', '#1f3b73', '#2563eb', '#22c55e', '#fbbf24', '#f8fafc'] },
      { name: 'Neon Signal', colors: ['#0b1021', '#ff3d71', '#ffb700', '#7c3aed', '#0ea5e9', '#fef9c3'] },
      { name: 'Desert Bloom', colors: ['#1b1f3b', '#f97316', '#fcd34d', '#34d399', '#a5b4fc', '#f3f4f6'] },
      { name: 'Nordic Air', colors: ['#0f172a', '#1d4ed8', '#38bdf8', '#22d3ee', '#a7f3d0', '#f1f5f9'] },
    ],
    []
  );
  const [demoIndex, setDemoIndex] = useState(0);
  const activeDemo = heroPalettes[demoIndex];

  const metrics = useMemo(
    () => [
      { label: 'Palettes generated', start: 12000, end: 60000, divisor: 1000, suffix: 'k+' },
      { label: 'Contrast checks', start: 50000, end: 120000, divisor: 1000, suffix: 'k' },
      { label: 'Avg. export time', start: 9, end: 4, suffix: 's' },
    ],
    []
  );
  const [animatedMetrics, setAnimatedMetrics] = useState(metrics.map((metric) => metric.start));

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const formatMetricValue = (value, metric) => {
    if (!metric) return value;
    if (metric.divisor) {
      const rounded = Math.round(value / metric.divisor);
      return `${rounded}${metric.suffix || ''}`;
    }
    const rounded = metric.decimals ? value.toFixed(metric.decimals) : Math.round(value);
    return `${rounded}${metric.suffix || ''}`;
  };

  const toolCards = [
    {
      title: 'Palette Generator',
      description: 'Lock favorite colors, shuffle the rest, and export to every format we use in the course.',
      badge: 'Core tool',
      cta: () => navigate('/palette-generator'),
      chips: ['Lock & shuffle', 'Export PNG/SVG/JSON', 'Keyboard friendly'],
    },
    {
      title: 'Contrast Checker',
      description: 'Validate AA/AAA contrast without leaving your flow. Great for the accessibility module.',
      badge: 'Accessibility',
      cta: () => navigate('/contrastchecker'),
      chips: ['WCAG AA/AAA', 'Live previews', 'Copy-safe pairs'],
    },
    {
      title: 'Image Extractor',
      description: 'Pull palettes from your inspiration shots and send them straight to the generator.',
      badge: 'Inspiration',
      cta: () => navigate('/imagecolorextractor'),
      chips: ['Smart sampling', 'One-click export', 'Course presets'],
    },
  ];

  const generatorFeatures = [
    { icon: 'bi-magic', title: 'Smart shuffle', copy: 'Shuffle unlocked swatches while keeping locks intact.' },
    { icon: 'bi-sliders2', title: 'Harmony presets', copy: 'Analogous, triadic, split-complimentary, tetradic in one tap.' },
    { icon: 'bi-eye', title: 'Contrast view', copy: 'Inline WCAG checks so you catch issues before export.' },
    { icon: 'bi-bezier', title: 'Gradient builder', copy: 'Craft smooth ramps and copy CSS instantly.' },
    { icon: 'bi-diagram-3', title: 'OKLCH explorer', copy: 'Tweak perceptual lightness/chroma for stable palettes.' },
    { icon: 'bi-box-arrow-up', title: 'Export kits', copy: 'Hand off as CSS, SVG, PNG, JSON, or text tokens.' },
  ];

  const handleOpenInGenerator = (palette) => {
    navigate('/palette-generator', { state: { palette } });
  };

  const handleCopy = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // noop if clipboard not available
    }
  };

  const shuffleDemo = () => {
    setDemoIndex((prev) => (prev + 1) % heroPalettes.length);
  };

  useEffect(() => {
    const id = setInterval(() => {
      setDemoIndex((prev) => (prev + 1) % heroPalettes.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const duration = 1200;
    const startTime = performance.now();
    let frame;

    const animateMetrics = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = easeOutCubic(progress);

      setAnimatedMetrics(
        metrics.map((metric) => metric.start + (metric.end - metric.start) * eased)
      );

      if (progress < 1) {
        frame = requestAnimationFrame(animateMetrics);
      }
    };

    frame = requestAnimationFrame(animateMetrics);
    return () => cancelAnimationFrame(frame);
  }, [metrics]);

  return (
    <>
      <SEO
        title="Free Color Palette Generator & Popular Color Schemes"
        description="DigiSwatch is your digital color palette playground. Generate custom color schemes, explore trending palettes, check contrast ratios, and create accessible designs."
        keywords="color palette generator, popular color palettes, design colors, contrast checker, accessible color schemes, DigiSwatch"
        url="/"
      />

      <section className="home-shell">
        {/* HERO */}
        <header className="ds-hero home-hero split-hero text-center text-md-start position-relative overflow-hidden" role="banner">
          <Container>
            <Row className="align-items-center gy-4">
              <Col lg={6} className="order-2 order-lg-1">
                <Badge bg="dark" className="mb-3 fw-normal rounded-pill ds-hero-badge">
                  Course-ready tools
                </Badge>
                <motion.h1
                  className="display-5 fw-bold lh-tight mb-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Design bold palettes without the guesswork in <span className="gradient-text">DigiSwatch</span>
                </motion.h1>
                <p className="lead text-dark-50 mb-4">
                  The generator, checker, and palette library from the course live together here. Spin, lock, and ship palettes that are already classroom-approved.
                </p>
                <nav aria-label="Primary actions">
                  <div className="d-flex gap-3 flex-wrap hero-actions">
                    <Button size="lg" className="btn-neo" onClick={() => navigate('/palette-generator')}>
                      Start generating
                    </Button>
                    <Button size="lg" className="btn-ghost" onClick={() => navigate('/popular-palettes')}>
                      Browse popular
                    </Button>
                  </div>
                </nav>
                <div className="d-flex flex-wrap gap-2 mt-4">
                  {['Lock & shuffle', 'Contrast built-in', 'Export for dev handoff'].map((item) => (
                    <span key={item} className="pill-chip">
                      {item}
                    </span>
                  ))}
                </div>
                <div className="hero-metrics d-flex gap-3 flex-wrap mt-4">
                  {metrics.map((metric, index) => {
                    const currentValue = animatedMetrics[index] ?? metric.start;
                    return (
                      <div key={metric.label} className="metric-chip">
                        <div className="metric-value">{formatMetricValue(currentValue, metric)}</div>
                        <div className="metric-label">{metric.label}</div>
                      </div>
                    );
                  })}
                </div>
              </Col>
              <Col lg={6} className="order-1 order-lg-2">
                <div className="hero-visual position-relative">
                  <div className="hero-orb"></div>
                  <motion.div
                    className="home-preview card-floating shadow-sm live-demo-card"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="pulse-dot" aria-hidden="true"></span>
                          <p className="text-uppercase small mb-0 text-dark-50">Live mini generator</p>
                        </div>
                        <h3 className="h4 mb-0">{activeDemo?.name}</h3>
                      </div>
                      <Badge bg="secondary">Auto-play</Badge>
                    </div>
                    <div className="palette-row rounded-4 overflow-hidden mb-3" role="img" aria-label={`Live palette ${activeDemo?.name}`}>
                      <AnimatePresence initial={false} mode="wait">
                        <motion.div
                          key={activeDemo?.name}
                          className="d-flex w-100 h-100"
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.3 }}
                        >
                          {activeDemo?.colors.map((color) => (
                            <div key={color} className="palette-swatch" style={{ backgroundColor: color }} title={color}></div>
                          ))}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {activeDemo?.colors.map((c) => (
                        <code key={c} className="hex-chip">
                          {c}
                        </code>
                      ))}
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      <Button size="sm" className="btn-ghost" onClick={shuffleDemo}>
                        <i className="bi bi-shuffle me-1"></i>Shuffle
                      </Button>
                      <Button size="sm" className="btn-neo" onClick={() => handleOpenInGenerator(activeDemo)}>
                        Open in generator
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </Col>
            </Row>
          </Container>
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
        </header>

        {/* GENERATOR FEATURES */}
        <Container className="py-4 py-md-5" as="section" aria-label="Palette generator highlights">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
              <div>
                <h2 className="h3 fw-bold mb-1">What you can do in the generator</h2>
                <p className="text-muted mb-0">Quick hits from the course exercises, front and center.</p>
              </div>
              <Button className="btn-ghost" size="lg" onClick={() => navigate('/palette-generator')}>
                Open generator
              </Button>
            </div>
          <Row className="g-3 g-md-4">
            {generatorFeatures.map((item) => (
              <Col key={item.title} xs={12} sm={6} lg={4}>
                <Card className="feature-card h-100">
                  <Card.Body className="d-flex gap-3 align-items-start">
                    <div className="icon-circle">
                      <i className={`bi ${item.icon}`} aria-hidden="true"></i>
                    </div>
                    <div>
                      <h3 className="h6 fw-bold mb-1">{item.title}</h3>
                      <p className="text-muted mb-0 small">{item.copy}</p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>

        {/* TOOL GRID */}
        <Container className="py-5" as="section" aria-label="Course tools">
          <Row className="g-4">
            {toolCards.map((tool) => (
              <Col key={tool.title} xs={12} md={4}>
                <Card className="tool-card h-100">
                  <Card.Body className="d-flex flex-column gap-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <Badge bg="light" text="dark" className="border fw-semibold">
                        {tool.badge}
                      </Badge>
                      <i className="bi bi-arrow-up-right-square text-muted" aria-hidden="true"></i>
                    </div>
                    <div>
                      <h3 className="h4 mb-2">{tool.title}</h3>
                      <p className="text-muted mb-0">{tool.description}</p>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {tool.chips.map((chip) => (
                        <span key={chip} className="pill-chip muted">
                          {chip}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto">
                      <Button className="btn-neo w-100" size="lg" onClick={tool.cta}>
                        Open {tool.title}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>

        {/* POPULAR PALETTES */}
        <section className="py-5" aria-labelledby="popular-palettes-heading">
          <Container>
            <div className="d-flex align-items-end justify-content-between mb-3 flex-wrap gap-3">
              <div>
                <h2 id="popular-palettes-heading" className="h1 fw-bold mb-1">
                  Popular palettes
                </h2>
                <p className="text-muted mb-0">Community picks that keep contrast and vibe in balance.</p>
              </div>
              <Button variant="link" className="text-decoration-none px-0" onClick={() => navigate('/popular-palettes')}>
                See all
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

                      <div className="d-flex flex-wrap gap-2 mt-3">
                        {palette.colors.map((c, i) => (
                          <code key={i} className="hex-chip">
                            {c}
                          </code>
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

        {/* COLOR SEASON HIGHLIGHT */}
        <section className="py-5">
          <Container>
            <div className="season-card d-lg-flex align-items-center gap-4 p-4 p-md-5">
              <div className="flex-grow-1">
                <h2 className="h2 fw-bold mb-2">Find your color season</h2>
                <p className="lead text-dark-50 mb-3">
                  Run the Color Season tool from the course to match palettes to personal tones, then jump straight into the generator with the picks.
                </p>
                <div className="d-flex flex-wrap gap-3 hero-actions">
                  <Button size="lg" className="btn-neo" onClick={() => navigate('/color-season')}>
                    Explore Color Season
                  </Button>
                  <Button size="lg" className="btn-ghost" onClick={() => navigate('/palette-generator')}>
                    Open generator
                  </Button>
                </div>
              </div>
              <div className="season-chip-grid mt-4 mt-lg-0">
                {[
                  { name: 'Spring', swatch: '#f7b267' },
                  { name: 'Summer', swatch: '#5fa8d3' },
                  { name: 'Autumn', swatch: '#d97706' },
                  { name: 'Winter', swatch: '#1e293b' },
                ].map((item) => (
                  <div key={item.name} className="season-chip">
                    <span className="chip-dot" style={{ backgroundColor: item.swatch }}></span>
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* GENERATOR PROMO */}
        <section className="generator-cta py-5 position-relative overflow-hidden" aria-labelledby="generator-heading">
          <Container>
            <Row className="align-items-center gy-4">
              <Col lg={7}>
                <h2 id="generator-heading" className="display-6 fw-bold mb-2">
                  Create custom palettes effortlessly
                </h2>
                <p className="lead text-dark-50 mb-4">
                  Lock hues, explore harmonies, and test accessibility--all in one fast, friendly interface.
                </p>
                <div className="d-flex flex-wrap gap-3 hero-actions">
                  <Button size="lg" className="btn-neo" onClick={() => navigate('/palette-generator')}>
                    Try the generator
                  </Button>
                  <Button size="lg" className="btn-ghost" onClick={() => navigate('/contrastchecker')}>
                    Contrast checker
                  </Button>
                </div>
              </Col>
              <Col lg={5} className="text-center">
                <img
                  src="/palette-generator-preview.png"
                  alt="Screenshot of the DigiSwatch generator tool"
                  className="img-fluid rounded-4 shadow-sm"
                  loading="lazy"
                />
              </Col>
            </Row>
          </Container>
          <div className="grain"></div>
        </section>
      </section>
    </>
  );
};

export default Home;
