// src/pages/ContrastChecker.jsx

import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async"; // npm i react-helmet-async
import { Container, Row, Col, Form, Card, Button } from "react-bootstrap";
import Footer from "../components/Footer";

const ContrastChecker = () => {
  const [bgColor, setBgColor] = useState("#000000");
  const [textColor, setTextColor] = useState("#ffffff");
  const [ratio, setRatio] = useState(0);
  const [desc, setDesc] = useState("");

  const pageUrl = "https://digiswatch.io/contrast-checker";
  const ogImage = "https://digiswatch.io/og-image.png";

  // ---------- Helpers ----------
  const isValidHex = (hex) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex);

  const normalizeHex = (hex) => {
    if (!hex) return "#000000";
    let h = hex.trim().toUpperCase();
    if (h[0] !== "#") h = `#${h}`;
    if (/^#[0-9A-F]{3}$/.test(h)) {
      // Expand shorthand #ABC -> #AABBCC
      h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
    }
    return isValidHex(h) ? h : "#000000";
  };

  const hexToRgb = (hex) => {
    const h = normalizeHex(hex).slice(1);
    const bigint = parseInt(h, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  const relativeLuminance = ({ r, g, b }) => {
    const srgb = [r, g, b].map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  };

  const contrastRatio = (hexA, hexB) => {
    const LA = relativeLuminance(hexToRgb(hexA));
    const LB = relativeLuminance(hexToRgb(hexB));
    const lighter = Math.max(LA, LB);
    const darker = Math.min(LA, LB);
    return (lighter + 0.05) / (darker + 0.05);
  };

  const wcagRatings = useMemo(() => {
    const r = Number(ratio);
    const normalAA = r >= 4.5;
    const normalAAA = r >= 7;
    const largeAA = r >= 3;
    const largeAAA = r >= 4.5;
    return { normalAA, normalAAA, largeAA, largeAAA };
  }, [ratio]);

  const scoreBg = (r) => (Number(r) >= 4.5 ? "#d4edda" : "#f8d7da");

  // ---------- Effects ----------
  useEffect(() => {
    const r = contrastRatio(textColor, bgColor);
    setRatio(Number.isFinite(r) ? Number(r.toFixed(2)) : 0);
  }, [bgColor, textColor]);

  useEffect(() => {
    const r = Number(ratio);
    let message = "Poor contrast, may be very hard to read.";
    if (r >= 7) message = "Excellent contrast: passes AAA for normal and large text.";
    else if (r >= 4.5) message = "Good contrast: passes AA for normal text, AAA for large text.";
    else if (r >= 3) message = "Passes AA for large text; fails for normal text.";
    setDesc(message);
  }, [ratio]);

  // ---------- Handlers ----------
  const handleTextHex = (val) => setTextColor(normalizeHex(val));
  const handleBgHex = (val) => setBgColor(normalizeHex(val));
  const swapColors = () => {
    setTextColor(bgColor);
    setBgColor(textColor);
  };

  return (
    <section>
      {/* Route-level SEO head */}
      <Helmet>
        <title>Contrast Checker (WCAG 2.2) – Accessible Color Contrast | DigiSwatch</title>
        <meta
          name="description"
          content="Free WCAG 2.2 contrast checker. Test text and background colors, get AA/AAA pass results for normal and large text, and preview accessibility in real-time."
        />
        <link rel="canonical" href={pageUrl} />
        <meta name="robots" content="index,follow" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="DigiSwatch" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:url" content={pageUrl} />
        <meta
          property="og:title"
          content="Contrast Checker (WCAG 2.2) – Accessible Color Contrast | DigiSwatch"
        />
        <meta
          property="og:description"
          content="Check color contrast ratios and see AA/AAA compliance for normal and large text. Instant preview and HEX inputs."
        />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Contrast Checker (WCAG 2.2) – Accessible Color Contrast | DigiSwatch"
        />
        <meta
          name="twitter:description"
          content="Test text and background colors for WCAG AA/AAA compliance with real-time previews."
        />
        <meta name="twitter:image" content={ogImage} />

        {/* Optional keywords */}
        <meta
          name="keywords"
          content="contrast checker, wcag contrast, color contrast ratio, aa aaa compliance, accessible colors, text background contrast, a11y"
        />

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "DigiSwatch – Contrast Checker",
              url: pageUrl,
              applicationCategory: "DesignApplication",
              operatingSystem: "Any",
              description:
                "Free WCAG 2.2 color contrast checker. Validate AA/AAA for normal and large text and preview styles in real time.",
              keywords:
                "contrast checker,wcag 2.2,color contrast ratio,aa,aaa,accessible colors,a11y",
              creator: {
                "@type": "Organization",
                name: "DigiSwatch",
                url: "https://digiswatch.io/",
              },
            }),
          }}
        />
      </Helmet>

      <Container className="py-5 mb-5">
        <Row className="mb-4">
          <Col className="text-center">
            <h1 className="fw-bold">Contrast Checker (WCAG 2.2)</h1>
            <p className="text-muted mb-0">
              Test text and background colors for AA/AAA accessibility. Supports HEX (#RGB/#RRGGBB),
              real-time preview, and clear pass/fail results for normal and large text.
            </p>
          </Col>
        </Row>

        <Row className="g-3">
          <Col md className="p-4 rounded shadow-sm">
            <h2 className="h5">Choose Colors</h2>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="textColorInput">Text color</Form.Label>
                <div className="d-flex align-items-center">
                  <Form.Control
                    id="textColorPicker"
                    type="color"
                    value={normalizeHex(textColor)}
                    onChange={(e) => handleTextHex(e.target.value)}
                    className="me-2"
                    aria-label="Text color picker"
                  />
                  <Form.Control
                    id="textColorInput"
                    type="text"
                    value={normalizeHex(textColor)}
                    onChange={(e) => handleTextHex(e.target.value)}
                    inputMode="text"
                    aria-label="Text color hex"
                    placeholder="#000000"
                    pattern="#?[0-9a-fA-F]{3,6}"
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label htmlFor="bgColorInput">Background color</Form.Label>
                <div className="d-flex align-items-center">
                  <Form.Control
                    id="bgColorPicker"
                    type="color"
                    value={normalizeHex(bgColor)}
                    onChange={(e) => handleBgHex(e.target.value)}
                    className="me-2"
                    aria-label="Background color picker"
                  />
                  <Form.Control
                    id="bgColorInput"
                    type="text"
                    value={normalizeHex(bgColor)}
                    onChange={(e) => handleBgHex(e.target.value)}
                    inputMode="text"
                    aria-label="Background color hex"
                    placeholder="#FFFFFF"
                    pattern="#?[0-9a-fA-F]{3,6}"
                  />
                </div>
              </Form.Group>

              <Button
                variant="outline-secondary"
                size="sm"
                onClick={swapColors}
                aria-label="Swap text and background colors"
              >
                Swap Colors
              </Button>
            </Form>

            <div
              className="d-flex flex-column p-4 mt-4 rounded justify-content-center align-items-center shadow-sm"
              style={{ backgroundColor: normalizeHex(bgColor), color: normalizeHex(textColor), minHeight: "200px" }}
            >
              <h3 className="h5" style={{ color: normalizeHex(textColor) }}>
                This is a preview of large text.
              </h3>
              <p style={{ color: normalizeHex(textColor) }}>This is a preview of smaller text.</p>
            </div>
          </Col>

          <Col
            md
            className="d-flex justify-content-center align-items-center rounded shadow-sm"
            style={{ backgroundColor: scoreBg(ratio), color: "#000" }}
          >
            <Card className="p-4 w-100" style={{ backgroundColor: scoreBg(ratio), color: "#000" }}>
              <h2 className="h5 text-center">Results</h2>

              <div className="text-center" aria-live="polite">
                <div className="display-6 fw-bold">Contrast Ratio: {ratio.toFixed(2)}:1</div>
                <p className="mb-3">{desc}</p>

                <div className="d-flex flex-column align-items-center">
                  <div className="mb-2">
                    <strong>Normal text:</strong>{" "}
                    {wcagRatings.normalAA ? "AA Pass" : "AA Fail"} •{" "}
                    {wcagRatings.normalAAA ? "AAA Pass" : "AAA Fail"}
                  </div>
                  <div className="mb-2">
                    <strong>Large text:</strong>{" "}
                    {wcagRatings.largeAA ? "AA Pass" : "AA Fail"} •{" "}
                    {wcagRatings.largeAAA ? "AAA Pass" : "AAA Fail"}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>

      <Footer />
    </section>
  );
};

export default ContrastChecker;
