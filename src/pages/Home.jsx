// src/pages/Home.jsx
// Refreshed look & feel for DigiSwatch Home (keeps react-bootstrap)

import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import popularPalettes from "../utils/paletteData";
import Footer from "../components/Footer";
import { Helmet } from "react-helmet-async";

const Home = () => {
  const navigate = useNavigate();

  return (
    <section className="home-page bg-light" style={{ minHeight: "100vh" }}>
      <Helmet>
        <title>
          DigiSwatch – Free Color Palette Generator & Popular Color Schemes
        </title>
        <meta
          name="description"
          content="Create and save beautiful color palettes with DigiSwatch. Lock colors, explore harmonies, check contrast, export palettes, and browse community favorites."
        />
        <link rel="canonical" href="https://www.digiswatch.com/" />

        {/* Open Graph for link unfurling */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="DigiSwatch – Color Palette Generator"
        />
        <meta
          property="og:description"
          content="Craft striking palettes, test accessibility, and explore popular color schemes."
        />
        <meta property="og:url" content="https://www.digiswatch.com/" />
        <meta
          property="og:image"
          content="https://www.digiswatch.com/og-cover.png"
        />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="DigiSwatch – Color Palette Generator"
        />
        <meta
          name="twitter:description"
          content="Create, explore, and save palettes for web and branding."
        />
        <meta
          name="twitter:image"
          content="https://www.digiswatch.com/og-cover.png"
        />

        {/* Robots */}
        <meta name="robots" content="index,follow,max-image-preview:large" />

        {/* JSON-LD: Organization + WebSite + SearchAction */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "DigiSwatch",
            url: "https://www.digiswatch.com/",
            logo: "https://www.digiswatch.com/logo.png",
            sameAs: [
              "https://twitter.com/digiswatch",
              "https://www.linkedin.com/company/digiswatch",
            ],
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "DigiSwatch",
            url: "https://www.digiswatch.com/",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://www.digiswatch.com/search?q={query}",
              "query-input": "required name=query",
            },
          })}
        </script>
        {/* Optional: SoftwareApplication—helps AI systems categorize you */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "DigiSwatch",
            applicationCategory: "DesignApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          })}
        </script>
      </Helmet>
      {/* HERO */}
      <div className="ds-hero text-center text-md-start position-relative overflow-hidden">
        <Container>
          <Row className="align-items-center py-5">
            <Col md={7} className="order-2 order-md-1">
              <Badge
                bg="dark"
                className="mb-3 fw-normal rounded-pill ds-hero-badge"
              >
                Your color playground
              </Badge>
              <h1 className="display-4 fw-bold lh-tight mb-3">
                Welcome to <span className="gradient-text">DigiSwatch</span>
              </h1>
              <p className="lead text-dark-50 mb-4">
                Craft striking palettes, explore harmonies, and save your
                favorites. Color theory tools without the theory headache.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Button
                  size="lg"
                  className="ds-cta"
                  onClick={() => navigate("/palette-generator")}
                >
                  Start Generating
                </Button>
                <Button
                  size="lg"
                  variant="outline-dark"
                  onClick={() => navigate("/popular-palettes")}
                >
                  Browse Popular
                </Button>
              </div>
            </Col>
            <Col md={5} className="order-1 order-md-2 text-center mb-4 mb-md-0">
              <div className="preview-frame shadow-sm">
                <img
                  src="/palette-generator-preview.png"
                  alt="Palette Generator Preview"
                  className="img-fluid rounded-4"
                />
              </div>
            </Col>
          </Row>
        </Container>
        {/* soft shapes */}
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      {/* VALUE STRIP */}
      <Container className="py-4">
        <Row className="g-3 text-center small text-muted">
          <Col xs={12} md>
            <div className="feature-chip">Lock & shuffle colors</div>
          </Col>
          <Col xs={12} md>
            <div className="feature-chip">Harmony & contrast tools</div>
          </Col>
          <Col xs={12} md>
            <div className="feature-chip">Export to PNG / JSON</div>
          </Col>
          <Col xs={12} md>
            <div className="feature-chip">Save & share palettes</div>
          </Col>
        </Row>
      </Container>

      {/* POPULAR PALETTES */}
      <section className="py-5">
        <Container>
          <div className="d-flex align-items-end justify-content-between mb-3">
            <div>
              <h2 className="h1 fw-bold mb-1">Popular Palettes</h2>
              <p className="text-muted mb-0">
                Community picks with excellent contrast and vibe.
              </p>
            </div>
            <Button
              variant="link"
              className="text-decoration-none"
              onClick={() => navigate("/popular-palettes")}
            >
              See all →
            </Button>
          </div>

          <Row className="g-4">
            {popularPalettes.slice(0, 6).map((palette, index) => (
              <Col xs={12} sm={6} lg={4} key={index}>
                <Card className="glass-card h-100 border-0">
                  <Card.Body>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <h5 className="mb-0">{palette.name}</h5>
                      {palette.tags?.slice(0, 2).map((t, i) => (
                        <Badge bg="secondary" key={i} className="ms-2">
                          {t}
                        </Badge>
                      ))}
                    </div>

                    <div className="palette-row rounded-4 overflow-hidden mb-3">
                      {palette.colors.map((color, idx) => (
                        <div
                          key={idx}
                          className="palette-swatch"
                          style={{ backgroundColor: color }}
                          title={color}
                        ></div>
                      ))}
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                      {palette.colors.map((c, i) => (
                        <code key={i} className="hex-chip">
                          {c}
                        </code>
                      ))}
                    </div>
                  </Card.Body>
                  <Card.Footer className="bg-transparent border-0 pt-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        {palette.colors.length} colors
                      </small>
                      <Button
                        size="sm"
                        variant="outline-dark"
                        onClick={() => navigate("/popular-palettes")}
                      >
                        Explore
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* GENERATOR PROMO */}
      <section className="generator-cta py-5 position-relative overflow-hidden">
        <Container>
          <Row className="align-items-center gy-4">
            <Col lg={7}>
              <h2 className="display-6 fw-bold mb-2">
                Create custom palettes effortlessly
              </h2>
              <p className="lead text-dark-50 mb-4">
                Lock hues, explore harmonies, and test accessibility — all in
                one fast, friendly interface.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="ds-cta"
                  onClick={() => navigate("/palette-generator")}
                >
                  Try the Generator
                </Button>
                <Button
                  size="lg"
                  variant="outline-dark"
                  onClick={() => navigate("/contrastchecker")}
                >
                  Contrast Checker
                </Button>
              </div>
            </Col>
            <Col lg={5} className="text-center">
              <img
                src="/palette-generator-preview.png"
                alt="Generator"
                className="img-fluid rounded-4 shadow-sm"
              />
            </Col>
          </Row>
        </Container>
        <div className="grain"></div>
      </section>

      <Footer />
    </section>
  );
};

export default Home;
