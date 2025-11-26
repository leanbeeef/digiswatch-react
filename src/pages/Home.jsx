// src/pages/Home.jsx
// Refreshed look & feel for DigiSwatch Home (SEO + AI-search optimized)

import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import popularPalettes from '../utils/paletteData';
import Footer from '../components/Footer';

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="Free Color Palette Generator & Popular Color Schemes"
        description="DigiSwatch is your digital color palette playground. Generate custom color schemes, explore trending palettes, check contrast ratios, and create accessible designs."
        keywords="color palette generator, popular color palettes, design colors, contrast checker, accessible color schemes, DigiSwatch"
        url="/"
      />

      <section className="home-page bg-light" style={{ minHeight: '100vh' }}>
        {/* HERO */}
        <header className="ds-hero text-center text-md-start position-relative overflow-hidden" role="banner">
          <Container>
            <Row className="align-items-center py-5">
              <Col md={7} className="order-2 order-md-1">
                <Badge bg="dark" className="mb-3 fw-normal rounded-pill ds-hero-badge">Your color playground</Badge>
                <h1 className="display-4 fw-bold lh-tight mb-3">
                  Welcome to <span className="gradient-text">DigiSwatch</span>
                </h1>
                <p className="lead text-dark-50 mb-4">
                  Craft striking palettes, explore harmonies, and save your favorites. Color theory tools without the theory headache.
                </p>
                <nav aria-label="Primary actions">
                  <div className="d-flex gap-3 flex-wrap">
                    <Button size="lg" className="ds-cta" onClick={() => navigate('/palette-generator')}>Start Generating</Button>
                    <Button size="lg" variant="outline-dark" onClick={() => navigate('/popular-palettes')}>Browse Popular</Button>
                  </div>
                </nav>
              </Col>
              <Col md={5} className="order-1 order-md-2 text-center mb-4 mb-md-0">
                <div className="preview-frame shadow-sm">
                  <img src="/palette-generator-preview.png" alt="Preview of DigiSwatch Palette Generator interface" className="img-fluid rounded-4" loading="lazy" />
                </div>
              </Col>
            </Row>
          </Container>
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
        </header>

        {/* VALUE STRIP */}
        <Container className="py-5" as="section" aria-label="Core features">
          <Row className="g-4 text-center">
            <Col xs={12} md>
              <div className="feature-card shadow-sm p-4 rounded-4 h-100">
                <i className="bi bi-lock-fill text-primary fs-2 mb-2"></i>
                <h3 className="h6 fw-bold mb-1">Lock & Shuffle</h3>
                <p className="small text-muted mb-0">Keep favorite hues steady while exploring random combos.</p>
              </div>
            </Col>
            <Col xs={12} md>
              <div className="feature-card shadow-sm p-4 rounded-4 h-100">
                <i className="bi bi-sliders text-success fs-2 mb-2"></i>
                <h3 className="h6 fw-bold mb-1">Harmony Tools</h3>
                <p className="small text-muted mb-0">Check contrast and generate harmonious sets effortlessly.</p>
              </div>
            </Col>
            <Col xs={12} md>
              <div className="feature-card shadow-sm p-4 rounded-4 h-100">
                <i className="bi bi-download text-danger fs-2 mb-2"></i>
                <h3 className="h6 fw-bold mb-1">Export Formats</h3>
                <p className="small text-muted mb-0">Download palettes as PNG, SVG, JSON and more for your projects.</p>
              </div>
            </Col>
            <Col xs={12} md>
              <div className="feature-card shadow-sm p-4 rounded-4 h-100">
                <i className="bi bi-share text-warning fs-2 mb-2"></i>
                <h3 className="h6 fw-bold mb-1">Save & Share</h3>
                <p className="small text-muted mb-0">Keep palettes in your library and share with teammates.</p>
              </div>
            </Col>
          </Row>
        </Container>

        {/* POPULAR PALETTES */}
        <section className="py-5" aria-labelledby="popular-palettes-heading">
          <Container>
            <div className="d-flex align-items-end justify-content-between mb-3">
              <div>
                <h2 id="popular-palettes-heading" className="h1 fw-bold mb-1">Popular Palettes</h2>
                <p className="text-muted mb-0">Community picks with excellent contrast and vibe.</p>
              </div>
              <Button variant="link" className="text-decoration-none" onClick={() => navigate('/popular-palettes')}>See all →</Button>
            </div>

            <Row className="g-4">
              {popularPalettes.slice(0, 6).map((palette, index) => (
                <Col xs={12} sm={6} lg={4} key={index}>
                  <Card className="glass-card h-100 border-0">
                    <Card.Body>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <h3 className="h5 mb-0">{palette.name}</h3>
                        {palette.tags?.slice(0, 2).map((t, i) => (
                          <Badge bg="secondary" key={i} className="ms-2">{t}</Badge>
                        ))}
                      </div>

                      <div className="palette-row rounded-4 overflow-hidden mb-3" role="img" aria-label={`Color palette: ${palette.colors.join(', ')}`}>
                        {palette.colors.map((color, idx) => (
                          <div key={idx} className="palette-swatch" style={{ backgroundColor: color }} title={color}></div>
                        ))}
                      </div>

                      <div className="d-flex flex-wrap gap-2">
                        {palette.colors.map((c, i) => (
                          <code key={i} className="hex-chip">{c}</code>
                        ))}
                      </div>
                    </Card.Body>
                    <Card.Footer className="bg-transparent border-0 pt-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">{palette.colors.length} colors</small>
                        <Button size="sm" variant="outline-dark" onClick={() => navigate('/popular-palettes')}>Explore</Button>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* GENERATOR PROMO */}
        <section className="generator-cta py-5 position-relative overflow-hidden" aria-labelledby="generator-heading">
          <Container>
            <Row className="align-items-center gy-4">
              <Col lg={7}>
                <h2 id="generator-heading" className="display-6 fw-bold mb-2">Create custom palettes effortlessly</h2>
                <p className="lead text-dark-50 mb-4">Lock hues, explore harmonies, and test accessibility — all in one fast, friendly interface.</p>
                <div className="d-flex flex-wrap gap-3">
                  <Button size="lg" className="ds-cta" onClick={() => navigate('/palette-generator')}>Try the Generator</Button>
                  <Button size="lg" variant="outline-dark" onClick={() => navigate('/contrast-checker')}>Contrast Checker</Button>
                </div>
              </Col>
              <Col lg={5} className="text-center">
                <img src="/palette-generator-preview.png" alt="Screenshot of the DigiSwatch generator tool" className="img-fluid rounded-4 shadow-sm" loading="lazy" />
              </Col>
            </Row>
          </Container>
          <div className="grain"></div>
        </section>

        <Footer />
      </section>
    </>
  );
};

export default Home;