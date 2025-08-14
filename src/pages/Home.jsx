// src/pages/Home.jsx

import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import popularPalettes from '../utils/paletteData'; // Assume this is an array of popular palette data
import Footer from '../components/Footer'

const Home = () => {
  const navigate = useNavigate();

  return (
    <section className="home-page" style={{ backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <Container fluid>
        {/* Hero Section */}
        <div className="hero-section text-center py-5" style={{ backgroundColor: '#ffffff' }}>
          <h1 className="display-4 fw-bold">Welcome to DigiSwatch</h1>
          <p className="lead text-muted mt-3">
            Unlock the power of color with DigiSwatch. Create, explore, and save beautiful color palettes for web design, branding, and more!
          </p>
          <Button
            variant="primary"
            className="mt-4"
            size="lg"
            onClick={() => navigate('/palette-generator')}
          >
            Start Generating Palettes
          </Button>
        </div>

        {/* Popular Palettes Preview */}
        <section className="popular-palettes-preview py-5">
          <h2 className="text-center mb-4">Popular Palettes</h2>
          <p className="text-center text-muted">
            Browse some of the most loved palettes created by our community.
          </p>
          <Row className="justify-content-center">
            {popularPalettes.slice(0, 3).map((palette, index) => (
              <Col xs={12} sm={6} md={4} lg={3} className="mb-4" key={index}>
                <Card className="shadow-sm border-0">
                  <Card.Body className="d-flex flex-column align-items-center">
                    <h5 className="mb-3 text-center">{palette.name}</h5>
                    <div className="palette-display d-flex w-100 mb-3">
                      {palette.colors.map((color, idx) => (
                        <div
                          key={idx}
                          style={{
                            backgroundColor: color,
                            flex: 1,
                            height: '40px',
                            borderRadius: idx === 0 ? '8px 0 0 8px' : idx === palette.colors.length - 1 ? '0 8px 8px 0' : '0',
                          }}
                          title={color}
                        ></div>
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

        {/* Palette Generator Preview */}
        <section className="palette-generator-preview py-5" style={{ backgroundColor: '#ffffff' }}>
          <Row className="justify-content-center align-items-center">
            <Col xs={12} lg={4} className="text-center text-md-start">
              <h2>Create Custom Palettes Effortlessly</h2>
              <p className="mt-3 w-100">
                Use our Palette Generator to craft stunning color schemes tailored to your projects. Lock colors, explore harmonies, and save your work.
              </p>
              <Button variant="primary" size="lg" onClick={() => navigate('/palette-generator')}>
                Try the Generator
              </Button>
            </Col>
            <Col xs={12} lg={6} className="text-center mt-4 mt-md-0 ">
              <img
                src="/palette-generator-preview.png" // Replace with an actual image path
                alt="Palette Generator Preview"
                className="img-fluid rounded shadow"
              />
            </Col>
          </Row>
          <Row className="py-5"></Row>
        </section>
      </Container>
      <Footer></Footer> 
    </section>
  );
};

export default Home;
