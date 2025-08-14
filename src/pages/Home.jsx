// src/pages/Home.jsx

import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; // npm i react-helmet-async
import popularPalettes from '../utils/paletteData';
import Footer from '../components/Footer';

const Home = () => {
  const navigate = useNavigate();

  const ldJson = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "DigiSwatch",
    "url": "https://digiswatch.io/",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "Any",
    "description": "Free online color palette generator to create custom color schemes, explore complementary and random palettes, and save or share your favorites.",
    "keywords": "color palette generator,color scheme maker,custom palettes,complementary colors,random palettes,branding colors,UI UX colors",
    "creator": {
      "@type": "Organization",
      "name": "DigiSwatch",
      "url": "https://digiswatch.io/"
    }
  };

  return (
    <section className="home-page" style={{ backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      {/* Page-head SEO */}
      <Helmet>
        <title>DigiSwatch – Free Online Color Palette Generator & Color Schemes</title>
        <meta
          name="description"
          content="DigiSwatch is a free color palette generator for designers. Build custom color schemes, save and share palettes, and find perfect matching colors."
        />
        <link rel="canonical" href="https://digiswatch.io/" />
        <meta name="robots" content="index,follow" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="DigiSwatch" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:url" content="https://digiswatch.io/" />
        <meta property="og:title" content="DigiSwatch – Free Online Color Palette Generator & Color Schemes" />
        <meta
          property="og:description"
          content="Free color palette generator to create custom color schemes. Explore random and complementary palettes, then save and share your favorites."
        />
        <meta property="og:image" content="https://digiswatch.io/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DigiSwatch – Free Online Color Palette Generator & Color Schemes" />
        <meta
          name="twitter:description"
          content="Create custom color schemes instantly. Explore random & complementary palettes, then save and share."
        />
        <meta name="twitter:image" content="https://digiswatch.io/og-image.png" />

        {/* Optional keywords (low impact, harmless) */}
        <meta
          name="keywords"
          content="color palette generator,color scheme maker,custom palettes,accessible color palettes,complementary colors,random color palettes,web design color schemes,ui ux palettes,branding color generator,color picker tool"
        />

        {/* JSON-LD */}
        <script type="application/ld+json">{JSON.stringify(ldJson)}</script>
      </Helmet>

      <Container fluid>
        {/* Hero Section (H1 for primary keyword) */}
        <div className="hero-section text-center py-5" style={{ backgroundColor: '#ffffff' }}>
          <h1 className="display-4 fw-bold">Free Online Color Palette Generator</h1>
          <p className="lead text-muted mt-3">
            DigiSwatch is a fast, easy-to-use color palette generator for designers, artists, and creators.
            Instantly build harmonious color schemes, explore random or complementary palettes, and save your favorites for any project.
          </p>
          <Button
            variant="primary"
            className="mt-4"
            size="lg"
            onClick={() => navigate('/palette-generator')}
            aria-label="Start generating color palettes with DigiSwatch"
          >
            Start Generating Palettes
          </Button>
        </div>

        {/* Benefits / SEO-rich subheadings */}
        <section className="features-overview py-5">
          <Container>
            <Row className="gy-4">
              <Col xs={12} md={6} lg={3}>
                <h2 className="h4 fw-semibold">Create Color Palettes Instantly</h2>
                <p className="text-muted mb-0">
                  Use our free color palette generator to craft custom color schemes in seconds.
                  Choose your own colors or let DigiSwatch suggest harmonious combinations.
                </p>
              </Col>
              <Col xs={12} md={6} lg={3}>
                <h2 className="h4 fw-semibold">Explore Random & Complementary Schemes</h2>
                <p className="text-muted mb-0">
                  Discover fresh ideas with random palettes, or find perfect complementary colors for your web design and branding.
                </p>
              </Col>
              <Col xs={12} md={6} lg={3}>
                <h2 className="h4 fw-semibold">Save & Share Your Favorite Palettes</h2>
                <p className="text-muted mb-0">
                  Keep your best color combinations at your fingertips and share them with teammates, clients, or your community.
                </p>
              </Col>
              <Col xs={12} md={6} lg={3}>
                <h2 className="h4 fw-semibold">Built for Designers & Creators</h2>
                <p className="text-muted mb-0">
                  Perfect for UI/UX, branding, and graphic design. Start with a seed color, lock hues, and export palettes your way.
                </p>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Popular Palettes Preview */}
        <section className="popular-palettes-preview py-5">
          <h2 className="text-center mb-4">Popular Palettes</h2>
          <p className="text-center text-muted">
            Browse some of the most loved color palettes created by our community.
          </p>
          <Row className="justify-content-center">
            {popularPalettes.slice(0, 3).map((palette, index) => (
              <Col xs={12} sm={6} md={4} lg={3} className="mb-4" key={index}>
                <Card className="shadow-sm border-0">
                  <Card.Body className="d-flex flex-column align-items-center">
                    <h3 className="h6 mb-3 text-center">{palette.name}</h3>
                    <div className="palette-display d-flex w-100 mb-3" role="img" aria-label={`${palette.name} color palette`}>
                      {palette.colors.map((color, idx) => (
                        <div
                          key={idx}
                          style={{
                            backgroundColor: color,
                            flex: 1,
                            height: '40px',
                            borderRadius:
                              idx === 0
                                ? '8px 0 0 8px'
                                : idx === palette.colors.length - 1
                                ? '0 8px 8px 0'
                                : '0',
                          }}
                          title={color}
                          aria-label={color}
                        />
                      ))}
                    </div>
                    <Button variant="outline-primary" size="sm" onClick={() => navigate('/popular-palettes')}>
                      Explore More
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/* Palette Generator Preview (internal link with keyword for relevance) */}
        <section className="palette-generator-preview py-5" style={{ backgroundColor: '#ffffff' }}>
          <Row className="justify-content-center align-items-center">
            <Col xs={12} lg={4} className="text-center text-md-start">
              <h2>Try the DigiSwatch Color Palette Generator</h2>
              <p className="mt-3 w-100">
                Use our palette generator to craft stunning color schemes tailored to your projects.
                Lock colors, explore harmonies, and save your work for later.
              </p>
              <Button variant="primary" size="lg" onClick={() => navigate('/palette-generator')}>
                Open the Color Palette Generator
              </Button>
            </Col>
            <Col xs={12} lg={6} className="text-center mt-4 mt-md-0">
              <img
                src="/palette-generator-preview.png"
                alt="DigiSwatch color palette generator preview"
                className="img-fluid rounded shadow"
                loading="lazy"
              />
            </Col>
          </Row>
          <Row className="py-5"></Row>
        </section>
      </Container>

      <Footer />
    </section>
  );
};

export default Home;
