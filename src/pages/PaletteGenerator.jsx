// src/pages/PaletteGenerator.jsx

import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async"; // npm i react-helmet-async
import { Container, Row, Col, Card, Button, Toast, Modal } from "react-bootstrap";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Sidebar from "../components/Sidebar";
import ColorInfoModal from "../components/ColorInfoModal";
import CopyOptions from "../components/CopyOptions";
import {
  generateRandomPalette,
  generateMonochromatic,
  generateAnalogous,
  generateComplementary,
  generateSplitComplementary,
  generateTriadic,
  generateTetradic,
} from "../utils/paletteGenerators";
import { getColorInfo } from "../utils/ColorConversions";
import namer from "color-namer";
import tinycolor from "tinycolor2";
import { TinyColor } from "@ctrl/tinycolor";
import {
  exportPaletteAsCSS,
  exportPaletteAsJSON,
  exportPaletteAsText,
  exportPaletteAsSVG,
  exportPaletteAsImage,
} from "../utils/exportPalette";
import { HexColorPicker } from "react-colorful";

import "bootstrap-icons/font/bootstrap-icons.css";
import { doc, setDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

const ItemType = "CARD";

const getTextColor = (backgroundColor) => {
  const whiteContrast = tinycolor.readability(backgroundColor, "#FFFFFF");
  return whiteContrast >= 4.5 ? "#FFFFFF" : "#000000";
};

const DraggableCard = ({
  color,
  colorName,
  textColor,
  index,
  moveCard,
  onClick,
  onCopy,
  isLocked,
  onEditColor,
  toggleLock,
}) => {
  const ref = React.useRef(null);

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: ItemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (item) => {
      if (item.index !== index) {
        moveCard(item.index, index);
        item.index = index;
      }
    },
  });

  dragPreview(drop(ref));

  return (
    <Col
      ref={ref}
      xs={12}
      sm={6}
      md={4}
      lg={2}
      role="listitem"
      aria-label={`${colorName} ${color}`}
      className="p-0 d-flex"
      style={{ opacity: isDragging ? 1 : 1 }}
    >
      <Card
        style={{ backgroundColor: color, color: textColor }}
        className="w-100 text-center d-flex flex-column justify-content-center full-height-minus-header"
      >
        <Card.Body
          className="d-flex flex-column mt-5 pt-5 position-relative"
          style={{ height: "100%" }}
        >
          {/* Hex and Name */}
          <Card.Text
            className="fw-medium text-center text-uppercase"
            style={{ color: textColor, fontSize: "1.8em" }}
          >
            {color}
          </Card.Text>
          <Card.Text
            className="text-center"
            style={{ color: textColor, fontSize: "1.2em" }}
          >
            {colorName}
          </Card.Text>

          {/* Controls — visible on hover/focus via CSS (d-none -> show on :hover or :focus-within) */}
          <div
            className="position-absolute top-50 start-50 translate-middle d-none flex-column gap-2 card-actions"
            style={{ zIndex: 10 }}
          >
            <Button
              variant="link"
              className="bi-grip-horizontal"
              style={{ color: textColor, fontSize: "1.3em" }}
              ref={drag}
              aria-label="Drag to reorder"
              title="Drag to reorder"
            />
            <Button
              variant="link"
              style={{ color: textColor, fontSize: "1.3em" }}
              onClick={toggleLock}
              aria-label={isLocked ? "Unlock swatch" : "Lock swatch"}
              title={isLocked ? "Unlock swatch" : "Lock swatch"}
            >
              {isLocked ? <i className="bi bi-lock-fill" /> : <i className="bi bi-unlock" />}
            </Button>
            <Button
              variant="link"
              style={{ color: textColor, fontSize: "1.3em" }}
              onClick={() => onClick(color)}
              aria-label="Open color info"
              title="Color info"
            >
              <i className="bi bi-info-circle" />
            </Button>
            <Button
              variant="link"
              style={{ color: textColor, fontSize: "1.3em" }}
              onClick={(e) => {
                e.stopPropagation();
                onCopy();
              }}
              aria-label="Copy color formats"
              title="Copy"
            >
              <i className="bi bi-copy" />
            </Button>
            <Button
              variant="link"
              style={{ color: textColor, fontSize: "1.5em" }}
              onClick={() => onEditColor(index)}
              aria-label="Edit color"
              title="Edit color"
            >
              <i className="bi bi-palette" />
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
};

const PaletteGenerator = () => {
  const [currentPalette, setCurrentPalette] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [colorInfo, setColorInfo] = useState({});
  const [colorHarmonies, setColorHarmonies] = useState({});
  const [showCopyOptions, setShowCopyOptions] = useState(false);
  const [selectedColorInfo, setSelectedColorInfo] = useState(null);
  const [selectedSwatchIndex, setSelectedSwatchIndex] = useState(null);
  const [newColor, setNewColor] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [paletteName, setPaletteName] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const pageUrl = "https://digiswatch.io/palette-generator";
  const ogImage = "https://digiswatch.io/og-image.png";

  useEffect(() => {
    handleGenerate(); // initial palette
  }, []);

  const handleOpenColorPicker = (index) => {
    setSelectedSwatchIndex(index);
    setNewColor(currentPalette[index].hex);
  };

  const handleSaveColorChange = () => {
    setCurrentPalette((prev) =>
      prev.map((c, i) =>
        i === selectedSwatchIndex
          ? {
              ...c,
              hex: newColor,
              name: namer(newColor).ntc[0].name,
              textColor: getTextColor(newColor),
            }
          : c
      )
    );
    setSelectedSwatchIndex(null);
    setNewColor(null);
  };

  const handleSavePalette = async () => {
    if (!currentUser) {
      setToastMessage("You must be logged in to save palettes.");
      setShowToast(true);
      return;
    }
    setShowModal(true);
  };

  const handleExport = (format) => {
    switch (format) {
      case "png":
      case "jpeg":
        exportPaletteAsImage(format);
        break;
      case "css":
        exportPaletteAsCSS(currentPalette);
        break;
      case "json":
        exportPaletteAsJSON(currentPalette);
        break;
      case "txt":
        exportPaletteAsText(currentPalette);
        break;
      case "svg":
        exportPaletteAsSVG(currentPalette);
        break;
      default:
        alert("Invalid export format.");
        break;
    }
  };

  const handleModalSave = async () => {
    if (!paletteName) {
      setToastMessage("Palette name cannot be empty.");
      setShowToast(true);
      return;
    }
    try {
      const paletteRef = doc(collection(db, "users", currentUser.uid, "createdPalettes"));
      await setDoc(paletteRef, {
        name: paletteName,
        colors: currentPalette.map((c) => c.hex),
        createdAt: new Date().toISOString(),
      });
      setToastMessage("Palette saved successfully!");
      setShowToast(true);
      setPaletteName("");
      setShowModal(false);
    } catch (error) {
      console.error("Error saving palette:", error);
      setToastMessage("Failed to save the palette. Please try again.");
      setShowToast(true);
    }
  };

  const handleGenerate = () => {
    setCurrentPalette((prev) => {
      if (prev.length === 0) {
        const fresh = generateRandomPalette();
        return fresh.map((hex) => ({
          hex,
          name: namer(hex).ntc[0].name,
          textColor: getTextColor(hex),
          locked: false,
        }));
      }
      const fresh = generateRandomPalette();
      return prev.map((c, i) =>
        c.locked
          ? c
          : {
              hex: fresh[i],
              name: namer(fresh[i]).ntc[0].name,
              textColor: getTextColor(fresh[i]),
              locked: false,
            }
      );
    });
  };

  const toggleLock = (index) => {
    setCurrentPalette((prev) => prev.map((c, i) => (i === index ? { ...c, locked: !c.locked } : c)));
  };

  const moveCard = (fromIndex, toIndex) => {
    setCurrentPalette((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const handleColorClick = (color) => {
    setSelectedColor(color);
    setIsModalOpen(true);
    setColorInfo(getColorInfo(color));
    setColorHarmonies({
      analogous: generateAnalogous(color),
      monochromatic: generateMonochromatic(color),
      complementary: generateComplementary(color),
      splitComplementary: generateSplitComplementary(color),
      triadic: generateTriadic(color),
      tetradic: generateTetradic(color),
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedColor(null);
    setColorInfo({});
    setColorHarmonies({});
  };

  const handleHarmonyClick = (harmonyColors) => {
    const updatedPalette = harmonyColors.map((c) => {
      const hex = new TinyColor(c).toHexString();
      const nameResult = namer(hex).ntc[0];
      const textColor = getTextColor(hex);
      return { hex, name: nameResult.name, textColor };
    });
    setCurrentPalette(updatedPalette);
  };

  const handleOpenCopyOptions = (colorObj) => {
    const info = getColorInfo(colorObj.hex);
    setSelectedColorInfo(info);
    setShowCopyOptions(true);
  };

  const handleCloseCopyOptions = () => setShowCopyOptions(false);

  const ldJson = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "DigiSwatch – Color Palette Generator",
    url: pageUrl,
    applicationCategory: "DesignApplication",
    operatingSystem: "Any",
    description:
      "Free online color palette generator. Build harmonious color schemes, lock swatches, explore complementary/triadic palettes, and export to CSS, JSON, SVG, or image.",
    keywords:
      "color palette generator,color scheme maker,random palettes,complementary colors,triadic,tetradic,export CSS,palette tool",
    creator: { "@type": "Organization", name: "DigiSwatch", url: "https://digiswatch.io/" },
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <section>
        {/* Route-level SEO head */}
        <Helmet>
          <title>DigiSwatch Color Palette Generator – Create & Export Color Schemes</title>
          <meta
            name="description"
            content="Free online color palette generator. Generate harmonious color schemes, lock your favorites, explore complementary and triadic palettes, and export to CSS, JSON, SVG, or PNG."
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
            content="DigiSwatch Color Palette Generator – Create & Export Color Schemes"
          />
          <meta
            property="og:description"
            content="Generate and edit color palettes, lock swatches, preview contrast, and export in multiple formats."
          />
          <meta property="og:image" content={ogImage} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            content="DigiSwatch Color Palette Generator – Create & Export Color Schemes"
          />
          <meta
            name="twitter:description"
            content="Free color palette generator for designers. Explore harmonies and export your palettes."
          />
          <meta name="twitter:image" content={ogImage} />

          {/* Optional keywords */}
          <meta
            name="keywords"
            content="color palette generator,color scheme generator,triadic,tetradic,analogous,complementary,export css,json,svg,png"
          />

          {/* JSON-LD */}
          <script type="application/ld+json">{JSON.stringify(ldJson)}</script>
        </Helmet>

        <Container fluid className="p-0 d-flex flex-column" style={{ minHeight: "100vh" }}>
          <Sidebar show={showSidebar} onClose={() => setShowSidebar(false)} onGenerate={handleGenerate} />

          {/* Page Intro */}
          <header className="py-4 text-center" style={{ backgroundColor: "#fff" }}>
            <h1 className="fw-bold">Free Online Color Palette Generator</h1>
            <p className="text-muted m-0">
              Generate harmonious color schemes, lock swatches, explore complementary or triadic palettes,
              and export to CSS, JSON, SVG, or image.
            </p>
          </header>

          {/* Swatches */}
          <main>
            <Row
              id="palette-display"
              role="list"
              aria-label="Generated color palette swatches"
              className="flex-grow-1 justify-content-center m-0"
              style={{ display: "flex" }}
            >
              {currentPalette.map((colorObj, index) => (
                <DraggableCard
                  key={`${colorObj.hex}-${index}`}
                  index={index}
                  color={colorObj.hex}
                  colorName={colorObj.name}
                  textColor={colorObj.textColor}
                  isLocked={colorObj.locked}
                  moveCard={moveCard}
                  onClick={handleColorClick}
                  onCopy={() => handleOpenCopyOptions(colorObj)}
                  toggleLock={() => toggleLock(index)}
                  onEditColor={handleOpenColorPicker}
                />
              ))}
            </Row>
          </main>

          {/* Copy Formats */}
          {selectedColorInfo && (
            <CopyOptions show={showCopyOptions} onClose={handleCloseCopyOptions} colorInfo={selectedColorInfo} />
          )}

          {/* Inline Color Picker Modal (simple center overlay) */}
          {selectedSwatchIndex !== null && (
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 1100,
                background: "#fff",
                padding: "1rem",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                width: "320px",
              }}
              role="dialog"
              aria-modal="true"
              aria-label="Edit color"
            >
              <HexColorPicker className="w-100" color={newColor} onChange={setNewColor} />
              <div className="mt-3">
                <div className="mb-2">
                  <label className="form-label">HEX</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    placeholder="#000000"
                    aria-label="Hex value"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">RGB</label>
                  <input
                    type="text"
                    className="form-control"
                    value={tinycolor(newColor).toRgbString()}
                    onChange={(e) => {
                      const rgb = e.target.value;
                      if (tinycolor(rgb).isValid()) setNewColor(tinycolor(rgb).toHexString());
                    }}
                    placeholder="rgb(0, 0, 0)"
                    aria-label="RGB value"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">HSL</label>
                  <input
                    type="text"
                    className="form-control"
                    value={tinycolor(newColor).toHslString()}
                    onChange={(e) => {
                      const hsl = e.target.value;
                      if (tinycolor(hsl).isValid()) setNewColor(tinycolor(hsl).toHexString());
                    }}
                    placeholder="hsl(0, 0%, 0%)"
                    aria-label="HSL value"
                  />
                </div>
              </div>
              <div className="d-flex justify-content-between">
                <Button variant="secondary" onClick={() => setSelectedSwatchIndex(null)}>
                  Cancel
                </Button>
                <Button variant="primary" className="ms-2" onClick={handleSaveColorChange}>
                  Save
                </Button>
              </div>
            </div>
          )}

          {/* Color Info Modal */}
          <ColorInfoModal
            isModalOpen={isModalOpen}
            closeModal={closeModal}
            selectedColor={selectedColor}
            colorInfo={colorInfo}
            colorHarmonies={colorHarmonies}
            handleHarmonyClick={handleHarmonyClick}
          />

          {/* FAB Menu */}
          <div
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              zIndex: 1050,
            }}
          >
            <Button
              variant="primary"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label={isMenuOpen ? "Close menu" : "Open actions menu"}
              style={{
                borderRadius: "50%",
                width: "60px",
                height: "60px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                backgroundColor: "#007bff",
              }}
            >
              <i className={`bi ${isMenuOpen ? "bi-x" : "bi-plus"}`} style={{ fontSize: "1.5rem", color: "white" }} />
            </Button>

            {isMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  bottom: "80px",
                  right: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                <Button
                  variant="primary"
                  onClick={handleGenerate}
                  aria-label="Generate new palette"
                  title="Generate"
                  style={{
                    borderRadius: "50%",
                    width: "50px",
                    height: "50px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <i className="bi bi-arrow-clockwise" style={{ fontSize: "1.2rem", color: "white" }} />
                </Button>

                <Button
                  variant="primary"
                  onClick={() => setShowExportModal(true)}
                  aria-label="Export palette"
                  title="Export"
                  style={{
                    borderRadius: "50%",
                    width: "50px",
                    height: "50px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <i className="bi bi-download" style={{ fontSize: "1.2rem", color: "white" }} />
                </Button>

                <Button
                  variant="primary"
                  onClick={handleSavePalette}
                  aria-label="Save palette"
                  title="Save"
                  style={{
                    borderRadius: "50%",
                    width: "50px",
                    height: "50px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <i className="bi bi-floppy" style={{ fontSize: "1.2rem", color: "white" }} />
                </Button>
              </div>
            )}
          </div>

          {/* Save Palette Modal */}
          <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Save Palette</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Enter a name for your palette:</p>
              <input
                type="text"
                className="form-control"
                value={paletteName}
                onChange={(e) => setPaletteName(e.target.value)}
                placeholder="Palette Name"
                aria-label="Palette name"
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleModalSave}>
                Save
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Export Modal */}
          <Modal show={showExportModal} onHide={() => setShowExportModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Export Palette</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Select a format to export your palette:</p>
              <div className="d-flex flex-wrap">
                {[
                  ["PNG", "png"],
                  ["JPEG", "jpeg"],
                  ["CSS", "css"],
                  ["JSON", "json"],
                  ["Text", "txt"],
                  ["SVG", "svg"],
                ].map(([label, fmt]) => (
                  <Button
                    key={fmt}
                    variant="outline-primary"
                    className="m-2"
                    onClick={() => {
                      handleExport(fmt);
                      setShowExportModal(false);
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowExportModal(false)}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Toast Notification */}
          <Toast
            onClose={() => setShowToast(false)}
            show={showToast}
            delay={3000}
            autohide
            style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1050 }}
          >
            <Toast.Header className="text-bg-primary" closeButton={false}>
              <strong className="me-auto">Notification</strong>
              <button
                type="button"
                className="btn-close bold"
                style={{ filter: "invert(1)" }}
                aria-label="Close"
                onClick={() => setShowToast(false)}
              />
            </Toast.Header>
            <Toast.Body aria-live="polite">{toastMessage}</Toast.Body>
          </Toast>
        </Container>
      </section>
    </DndProvider>
  );
};

export default PaletteGenerator;
