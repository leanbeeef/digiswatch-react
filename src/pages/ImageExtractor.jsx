// src/pages/ImageColorExtractor.jsx

import React, { useRef, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async"; // npm i react-helmet-async
import "../styles/ImageColorExtractor.css";
import defaultImage from "../assets/example.jpeg";
import namer from "color-namer";
import tinycolor from "tinycolor2";

const ImageColorExtractor = () => {
  const visibleCanvasRef = useRef(null);
  const hiddenCanvasRef = useRef(null);
  const [currentDroppers, setCurrentDroppers] = useState([]);
  const [extractedColors, setExtractedColors] = useState([]);
  const [counter, setCounter] = useState(5);
  const maxDroppers = 10;

  // Initialize a Set to track sampled colors
  const sampledColors = new Set();

  const pageUrl = "https://digiswatch.io/image-color-extractor";
  const ogImage = "https://digiswatch.io/og-image.png";

  const ldJson = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "DigiSwatch – Image Color Extractor",
    "url": pageUrl,
    "applicationCategory": "DesignApplication",
    "operatingSystem": "Any",
    "description":
      "Free image color extractor. Pick colors from a photo, generate a palette, get hex codes and names, and build accessible color schemes.",
    "keywords":
      "image color extractor, pick colors from image, photo color palette, extract hex from image, color picker from image, palette from photo",
    "creator": {
      "@type": "Organization",
      "name": "DigiSwatch",
      "url": "https://digiswatch.io/"
    }
  };

  const processImageUpload = (imageURL) => {
    const visibleCanvas = visibleCanvasRef.current;
    const hiddenCanvas = hiddenCanvasRef.current;
    const image = new Image();
    // Ensure CORS-safe drawing for user uploads if needed
    image.crossOrigin = "anonymous";
    image.src = imageURL;
    image.onload = () => {
      const ctxVisible = visibleCanvas.getContext("2d");
      const ctxHidden = hiddenCanvas.getContext("2d");

      visibleCanvas.width = image.width;
      visibleCanvas.height = image.height;
      ctxVisible.drawImage(image, 0, 0);

      hiddenCanvas.width = image.width;
      hiddenCanvas.height = image.height;
      ctxHidden.drawImage(image, 0, 0);

      initializeEyeDroppers(visibleCanvas, 5);
    };
  };

  useEffect(() => {
    // Load the default image when the component mounts
    processImageUpload(defaultImage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => processImageUpload(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const initializeEyeDroppers = (canvas, dropperCount) => {
    clearDroppers();
    const newDroppers = [];
    for (let i = 0; i < dropperCount; i++) {
      const dropper = createDropper(canvas);
      if (dropper) {
        newDroppers.push(dropper);
      }
    }
    setCurrentDroppers(newDroppers);
  };

  const createDropper = (canvas) => {
    const canvasRect = canvas.getBoundingClientRect();
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loops

    while (attempts < maxAttempts) {
      const x = Math.random() * canvasRect.width;
      const y = Math.random() * canvasRect.height;

      // Get sampled color and name from the canvas
      const { color, name } = sampleColorFromCanvas(canvas, x, y);

      if (!sampledColors.has(color)) {
        sampledColors.add(color); // Add the unique color to the set
        return {
          id: Date.now() + Math.random(),
          x,
          y,
          color, // Hex color value
          name // Color name
        };
      }

      attempts++;
    }

    // If unable to find a unique color after maxAttempts, return null
    console.warn("Max attempts reached: Unable to find a unique color.");
    return null;
  };

  const sampleColorFromCanvas = (canvas, x, y) => {
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const canvasX = (x * canvas.width) / rect.width;
    const canvasY = (y * canvas.height) / rect.height;
    const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;

    // Convert pixel to hex color using tinycolor2
    const color = tinycolor({ r: pixel[0], g: pixel[1], b: pixel[2] }).toHexString();

    // Get color name using color-namer
    const name = namer(color).ntc[0].name;

    return { color, name }; // Return both color and name
  };

  const clearDroppers = () => {
    setCurrentDroppers([]);
    setExtractedColors([]);
    sampledColors.clear(); // Clear the Set of sampled colors
  };

  const addDropper = () => {
    if (counter < maxDroppers) {
      setCounter((prevCounter) => prevCounter + 1);
      const dropper = createDropper(visibleCanvasRef.current);
      if (dropper) {
        setCurrentDroppers((prevDroppers) => [...prevDroppers, dropper]);
      }
    }
  };

  const removeDropper = () => {
    if (counter > 2) {
      setCounter((prevCounter) => prevCounter - 1);
      setCurrentDroppers((prevDroppers) => prevDroppers.slice(0, -1));
    }
  };

  const extractColors = () => {
    const colors = currentDroppers.map((dropper) => ({
      color: dropper.color,
      name: dropper.name
    }));
    setExtractedColors(colors);
  };

  useEffect(() => {
    extractColors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDroppers]);

  return (
    <div className="d-flex my-5 justify-content-center align-items-center">
      {/* Route-level SEO head */}
      <Helmet>
        <title>Image Color Extractor – Pick Colors From Any Photo | DigiSwatch</title>
        <meta
          name="description"
          content="Free image color extractor. Upload a photo to pick colors, generate a palette, get hex codes and names, and build accessible color schemes."
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
          content="Image Color Extractor – Pick Colors From Any Photo | DigiSwatch"
        />
        <meta
          property="og:description"
          content="Extract colors from images, create palettes, and copy hex codes instantly. Perfect for UI/UX, branding, and graphic design."
        />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Image Color Extractor – Pick Colors From Any Photo | DigiSwatch"
        />
        <meta
          name="twitter:description"
          content="Upload a photo and generate a color palette with hex codes and names. Free and fast."
        />
        <meta name="twitter:image" content={ogImage} />

        {/* Optional keywords */}
        <meta
          name="keywords"
          content="image color extractor,pick colors from image,photo color palette,extract hex from image,color picker from photo,palette from image,color scheme from picture"
        />

        {/* Structured Data */}
        <script type="application/ld+json">{JSON.stringify(ldJson)}</script>
      </Helmet>

      <div className="container image-color-extractor">
        {/* Page intro (H1 and SEO-supporting copy) */}
        <div className="row mb-3">
          <div className="col-12 text-center">
            <h1 className="fw-bold">Image Color Extractor</h1>
            <p className="text-muted mb-0">
              Upload a photo to pick colors, generate a palette, copy hex codes and names, and
              build accessible color schemes for web design and branding.
            </p>
          </div>
        </div>

        <div className="row row-gap-1">
          {/* Left column: Controls and canvas */}
          <div className="col-md-6">
            <div className="d-flex justify-content-center canvas-container rounded">
              <canvas
                ref={visibleCanvasRef}
                className="visible-canvas"
                role="img"
                aria-label="Canvas preview for extracting colors from the uploaded image"
              />
              <canvas
                ref={hiddenCanvasRef}
                className="hidden-canvas"
                style={{ display: "none" }}
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Right column: Extracted colors */}
          <div className="col-md-6">
            <h2 className="h5 fw-semibold mb-3">Extracted Colors</h2>
            <div className="extracted-colors">
              {extractedColors.map((colorObj, index) => (
                <div
                  key={index}
                  className="color-swatch d-flex align-items-center justify-content-between"
                  style={{
                    backgroundColor: colorObj.color,
                    color: tinycolor(colorObj.color).isDark() ? "#fff" : "#000",
                    padding: "15px"
                  }}
                >
                  <span>{colorObj.name}</span>
                  <span>{colorObj.color}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <nav className="navbar navbar-light bg-primary fixed-bottom">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          {/* File Upload Input */}
          <input
            type="file"
            className="form-control form-control-sm w-50"
            onChange={handleImageUpload}
            accept="image/*"
            aria-label="Upload an image to extract colors"
          />

          {/* Controls for Dropper Count */}
          <div className="d-flex align-items-center bg-white rounded">
            <button
              className="btn bi-dash-circle-fill me-2"
              onClick={removeDropper}
              disabled={counter <= 2}
              aria-label="Decrease droppers"
              title="Decrease droppers"
            />
            <span className="navbar-text me-2">
              Current Droppers: <strong>{counter}</strong>
            </span>
            <button
              className="btn bi bi-plus-circle-fill fw-bold"
              onClick={addDropper}
              disabled={counter >= maxDroppers}
              aria-label="Increase droppers"
              title="Increase droppers"
            />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default ImageColorExtractor;
