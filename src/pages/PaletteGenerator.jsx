// src/pages/PaletteGenerator.jsx
import React, { useEffect, useRef, useState } from "react";
import { Container, Button, Toast, Modal } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { motion, AnimatePresence } from "framer-motion"; // ADD THIS
import SharePalette from "../components/SharePalette";
import ColorDataCard from "../components/ColorDataCard";
import ColorHarmonyCard from "../components/ColorHarmonyCard";
import ColorContextCard from "../components/ColorContextCard";
import GradientBuilderCard from "../components/GradientBuilderCard";
import OKLCHExplorerCard from "../components/OKLCHExplorerCard"; // ADD THIS
import ColorScalesCard from "../components/ColorScalesCard"; // ADD THIS
import ColorVisualizerCard from "../components/ColorVisualizerCard"; // ADD THIS
import AccessibilityCard from "../components/AccessibilityCard";
import DashboardSettings from "../components/DashboardSettings"; // ADD THIS
import { getColorContext } from "../utils/getColorContext";
import {
  CARD_TYPES,
  getDefaultVisibleCards,
  getImplementedCards,
} from "../utils/cardRegistry"; // ADD THIS
import "../styles/dashboard.css";
import "../styles/exportModal.css";
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
import { doc, setDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import "bootstrap-icons/font/bootstrap-icons.css";
import SEO from "../components/SEO";

// Prefer explicit Worker URL to avoid 405s from the static host; env override for local/dev.
const deriveApiBase = () => {
  const envBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  const workerBase = "https://palette-ai-proxy.jodrey48.workers.dev";
  if (envBase) return envBase;

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.endsWith("digiswatch.io")) {
      return workerBase; // hit the Worker directly in production
    }
  }
  return workerBase;
};
const API_BASE = deriveApiBase();
const AI_COOLDOWN_MS = 8000;
const AI_TIMEOUT_MS = 12000;
const MAX_PROMPT_LENGTH = 180;
const MIN_PROMPT_LENGTH = 6;
const OWNER_EMAIL = "jodrey48@gmail.com";
const aiLockOverlayStyle = {
  position: "absolute",
  inset: 0,
  background: "rgba(0,0,0,0.25)",
  backdropFilter: "blur(3px)",
  WebkitBackdropFilter: "blur(3px)",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#f5d776",
  fontWeight: 600,
  gap: "8px",
  cursor: "pointer",
  zIndex: 2,
};

const getTextColor = (bg) => {
  return tinycolor.readability(bg, "#FFFFFF") >= 4.5 ? "#FFFFFF" : "#000000";
};

const PaletteGenerator = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const isOwner = currentUser?.email === OWNER_EMAIL;
  const [palette, setPalette] = useState([]);
  // dashboardActive is no longer needed as it's always visible, but we'll keep the logic simple
  const [selectedColor, setSelectedColor] = useState(null);
  const [colorInfo, setColorInfo] = useState(null);
  const [harmonies, setHarmonies] = useState(null);
  const [context, setContext] = useState(null);
  const [cardOrder, setCardOrder] = useState(() => {
    if (typeof window !== "undefined") {
      const storedOrder = localStorage.getItem("dashboardCardOrder");
      if (storedOrder) {
        try {
          const parsed = JSON.parse(storedOrder);
          // Merge with implemented cards to include newly added cards
          const implemented = getImplementedCards().map((card) => card.id);
          const newCards = implemented.filter((id) => !parsed.includes(id));
          return [...parsed, ...newCards];
        } catch (e) {
          console.warn("Failed to parse stored card order, resetting.", e);
        }
      }
    }
    return getImplementedCards().map((card) => card.id);
  });
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [visibleCards, setVisibleCards] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("dashboardVisibleCards");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Older versions stored an array of booleans; ensure we only keep string IDs
          if (
            Array.isArray(parsed) &&
            parsed.every((item) => typeof item === "string")
          ) {
            // Merge with default visible cards to include newly added default-visible cards
            const defaults = getDefaultVisibleCards();
            const merged = Array.from(new Set([...parsed, ...defaults]));
            return merged;
          }
        } catch (e) {
          console.warn("Failed to parse stored visible cards, resetting.", e);
        }
      }
    }
    return getDefaultVisibleCards();
  });
  const [paletteName, setPaletteName] = useState("");
  const [toast, setToast] = useState({ show: false, message: "" });
  const [expandedCards, setExpandedCards] = useState({});
  const [dashboardView, setDashboardView] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("dashboardView");
      if (stored === "masonry" || stored === "stacked") return stored;
    }
    return "masonry";
  });
  const [draggingPaletteIndex, setDraggingPaletteIndex] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMobileToolbar, setShowMobileToolbar] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiStatus, setAiStatus] = useState("idle"); // idle | loading | success | error
  const [aiError, setAiError] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [aiUsesLeft, setAiUsesLeft] = useState(10);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const aiCooldownTimerRef = useRef(null);
  const lastAiRequestRef = useRef(0);
  const showAiError = (message) => {
    setAiError(message);
    setToast({ show: true, message });
  };
  const requireAuthToast = () => {
    setShowAuthModal(true);
  };

  // Save visible cards to localStorage
  useEffect(() => {
    localStorage.setItem("dashboardVisibleCards", JSON.stringify(visibleCards));
  }, [visibleCards]);

  // Save dashboard view preference
  useEffect(() => {
    localStorage.setItem("dashboardView", dashboardView);
  }, [dashboardView]);

  // Save card order to localStorage
  useEffect(() => {
    localStorage.setItem("dashboardCardOrder", JSON.stringify(cardOrder));
  }, [cardOrder]);

  // Load palette passed from navigation (e.g., Popular Palettes)
  useEffect(() => {
    const incoming = location.state?.palette;
    if (incoming && incoming.colors && incoming.colors.length) {
      const formatted = incoming.colors.map((hex) => ({
        hex,
        name: namer(hex).ntc[0].name,
        textColor: getTextColor(hex),
        locked: false,
      }));
      setPalette(formatted);
      setPaletteName(incoming.name || "");
      setTimeout(() => {
        handleColorClick(incoming.colors[0]);
      }, 0);
    }
  }, [location.state]);

  // Load palette from query param (?palette=base64json) for share links
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const encoded = params.get("palette");
    if (!encoded) return;
    try {
      const decoded = JSON.parse(atob(decodeURIComponent(encoded)));
      if (
        decoded?.colors &&
        Array.isArray(decoded.colors) &&
        decoded.colors.length
      ) {
        const formatted = decoded.colors.map((hex) => ({
          hex,
          name: namer(hex).ntc[0].name,
          textColor: getTextColor(hex),
          locked: false,
        }));
        setPalette(formatted);
        setPaletteName(decoded.name || "");
        setTimeout(() => {
          handleColorClick(decoded.colors[0]);
        }, 0);
      }
    } catch (err) {
      console.warn("Failed to parse shared palette", err);
    }
  }, [location.search]);

  // Generate an initial palette so the dashboard isn't empty (only if nothing was passed in)
  useEffect(() => {
    const incoming = location.state?.palette;
    if (
      palette.length === 0 &&
      !(incoming && incoming.colors && incoming.colors.length)
    ) {
      generatePalette();
    }
  }, [palette.length, location.state]);

  const generatePalette = () => {
    setPalette((prevPalette) => {
      let newPaletteData;
      // If no previous palette, generate fresh
      if (prevPalette.length === 0) {
        const newPalette = generateRandomPalette();
        newPaletteData = newPalette.map((hex) => ({
          hex,
          name: namer(hex).ntc[0].name,
          textColor: getTextColor(hex),
          locked: false,
        }));
      } else {
        // Keep locked colors, regenerate unlocked ones
        const newPalette = generateRandomPalette();
        newPaletteData = prevPalette.map((color, index) =>
          color.locked
            ? color
            : {
              hex: newPalette[index],
              name: namer(newPalette[index]).ntc[0].name,
              textColor: getTextColor(newPalette[index]),
              locked: false,
            }
        );
      }

      // If no color is selected (or the selected color is gone/changed), select the first one
      // We'll just select the first color of the new palette to be safe and ensure dashboard is populated
      if (newPaletteData.length > 0) {
        // We need to defer this slightly or just call the handler directly
        // But we can't call the handler inside the state updater.
        // So we'll use a timeout or effect.
        // Actually, simpler: just set the state here if we can, but we can't set other state here.
        // We'll use a separate effect or just call it after setting palette.
      }
      return newPaletteData;
    });
  };

  useEffect(() => {
    return () => {
      if (aiCooldownTimerRef.current) {
        clearInterval(aiCooldownTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isOwner) {
      setAiUsesLeft(Infinity);
      return;
    }
    const key = `aiPromptUses_${currentUser?.uid || "guest"}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!Number.isNaN(parsed)) {
        setAiUsesLeft(Math.max(0, parsed));
        return;
      }
    }
    setAiUsesLeft(10);
  }, [currentUser, isOwner]);

  const persistAiUses = (next) => {
    if (typeof window === "undefined" || isOwner) return;
    const key = `aiPromptUses_${currentUser?.uid || "guest"}`;
    localStorage.setItem(key, String(next));
  };

  const startAICooldown = () => {
    lastAiRequestRef.current = Date.now();
    if (aiCooldownTimerRef.current) {
      clearInterval(aiCooldownTimerRef.current);
    }
    setCooldownSeconds(Math.ceil(AI_COOLDOWN_MS / 1000));
    aiCooldownTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - lastAiRequestRef.current;
      const remaining = Math.max(
        0,
        Math.ceil((AI_COOLDOWN_MS - elapsed) / 1000)
      );
      setCooldownSeconds(remaining);
      if (remaining <= 0 && aiCooldownTimerRef.current) {
        clearInterval(aiCooldownTimerRef.current);
        aiCooldownTimerRef.current = null;
      }
    }, 500);
  };

  const applyPaletteFromColors = (colors) => {
    if (!Array.isArray(colors) || colors.length === 0) {
      throw new Error("No colors returned from AI prompt");
    }
    const normalized = colors
      .filter(Boolean)
      .slice(0, 8)
      .map((hex) => {
        const normalizedHex = new TinyColor(hex).toHexString();
        return {
          hex: normalizedHex,
          name: namer(normalizedHex).ntc[0].name,
          textColor: getTextColor(normalizedHex),
          locked: false,
        };
      });
    if (!normalized.length) {
      throw new Error("No usable colors returned from AI prompt");
    }
    setPalette(normalized);
    setTimeout(() => handleColorClick(normalized[0].hex), 0);
  };

  const handleGenerateWithPrompt = async (event) => {
    event?.preventDefault?.();
    if (!currentUser) {
      requireAuthToast();
      return;
    }
    const sanitizedPrompt = aiPrompt.trim().replace(/\s+/g, " ");
    if (sanitizedPrompt.length < MIN_PROMPT_LENGTH) {
      showAiError(
        `Add at least ${MIN_PROMPT_LENGTH} characters to describe the palette.`
      );
      return;
    }
    if (aiStatus === "loading") return;
    if (cooldownSeconds > 0) {
      showAiError(
        "Please wait for the cooldown to finish before requesting another palette."
      );
      return;
    }
    if (!isOwner && aiUsesLeft <= 0) {
      showAiError("AI prompt limit reached (10 uses).");
      return;
    }

    setAiStatus("loading");
    setAiError("");
    if (!isOwner) {
      setAiUsesLeft((prev) => {
        const next = Math.max(0, prev - 1);
        persistAiUses(next);
        return next;
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    try {
      const response = await fetch(
        `${API_BASE || ""}/api/generate-palette-from-prompt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: sanitizedPrompt }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate palette");
      }

      const data = await response.json();
      const colors =
        data?.colors || data?.palette?.colors || data?.palette || [];
      applyPaletteFromColors(colors);
      setAiStatus("success");
    } catch (error) {
      console.error("AI prompt generation failed", error);
      setAiStatus("error");
      if (error.name === "AbortError") {
        showAiError("Request timed out. Please try again in a moment.");
      } else {
        showAiError(
          "Could not generate palette from prompt. Please try again shortly."
        );
      }
    } finally {
      clearTimeout(timeoutId);
      startAICooldown();
      setTimeout(() => setAiStatus("idle"), 800);
    }
  };

  // Effect to select the first color when palette changes if no selection or invalid
  useEffect(() => {
    if (palette.length > 0) {
      // If currently selected color is not in the new palette (by hex), or nothing selected
      // For simplicity in this "always on" dashboard, let's just select the first color if nothing is selected
      // or if we just generated a fresh palette.
      // Actually, let's just always select the first color on generation if we want to be simple,
      // but users might want to keep their selection if locked.
      // For now, let's just ensure *something* is selected.
      if (!selectedColor || !palette.find((c) => c.hex === selectedColor)) {
        handleColorClick(palette[0].hex);
      }
    }
  }, [palette]);

  const handleColorClick = (color) => {
    setSelectedColor(color);
    setColorInfo(getColorInfo(color));
    setHarmonies({
      analogous: generateAnalogous(color),
      monochromatic: generateMonochromatic(color),
      complementary: generateComplementary(color),
      splitComplementary: generateSplitComplementary(color),
      triadic: generateTriadic(color),
      tetradic: generateTetradic(color),
    });
    setContext(getColorContext(color));
  };

  const handleHarmonySelect = (harmonyColors) => {
    setPalette(
      harmonyColors.map((hex) => ({
        hex: new TinyColor(hex).toHexString(),
        name: namer(hex).ntc[0].name,
        textColor: getTextColor(hex),
        locked: false,
      }))
    );
    // We don't close dashboard anymore
  };

  const toggleLock = (index) => {
    setPalette((prev) =>
      prev.map((c, i) => (i === index ? { ...c, locked: !c.locked } : c))
    );
  };

  const movePaletteColor = (from, to) => {
    setPalette((prev) => {
      if (
        from === to ||
        from < 0 ||
        to < 0 ||
        from >= prev.length ||
        to >= prev.length
      )
        return prev;
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
  };

  const handlePaletteDragStart = (e, index) => {
    setDraggingPaletteIndex(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
    }
  };

  const handlePaletteDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer && (e.dataTransfer.dropEffect = "move");
  };

  const handlePaletteDrop = (e, index) => {
    e.preventDefault();
    if (draggingPaletteIndex !== null) {
      movePaletteColor(draggingPaletteIndex, index);
    }
    setDraggingPaletteIndex(null);
  };

  const handlePaletteDragEnd = () => setDraggingPaletteIndex(null);

  const openSaveModal = () => {
    if (!currentUser) {
      setToast({ show: true, message: "Please log in to save palettes." });
      return;
    }
    setShowSaveModal(true);
  };

  const handleSave = async () => {
    if (!currentUser) {
      setToast({ show: true, message: "Please log in to save palettes" });
      return;
    }
    if (!paletteName) {
      setToast({ show: true, message: "Please enter a palette name" });
      return;
    }
    try {
      await setDoc(
        doc(collection(db, "users", currentUser.uid, "createdPalettes")),
        {
          name: paletteName,
          colors: palette.map((c) => c.hex),
          createdAt: new Date().toISOString(),
          visibility: "public", // default to public so community can see it
        }
      );
      setToast({ show: true, message: "Palette saved successfully!" });
      setPaletteName("");
      setShowSaveModal(false);
    } catch (error) {
      setToast({ show: true, message: "Failed to save palette" });
    }
  };

  const handleExport = (format) => {
    switch (format) {
      case "png":
      case "jpeg":
        exportPaletteAsImage(format);
        break;
      case "css":
        exportPaletteAsCSS(palette);
        break;
      case "json":
        exportPaletteAsJSON(palette);
        break;
      case "txt":
        exportPaletteAsText(palette);
        break;
      case "svg":
        exportPaletteAsSVG(palette);
        break;
    }
    setShowExportModal(false);
  };

  const toggleCardExpand = (cardId) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const handleToggleCard = (cardId) => {
    setVisibleCards((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      }
      // Ensure uniqueness and valid ids
      const next = [...prev, cardId].filter((id) => typeof id === "string");
      return Array.from(new Set(next));
    });
  };

  const isCardVisible = (cardType) => {
    return visibleCards.includes(cardType);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <SEO
        title="Color Palette Generator"
        description="Create custom color palettes with our advanced generator. Lock colors, explore harmonies like monochromatic and complementary, and export to CSS, JSON, or Image."
        keywords="color palette generator, color schemes, monochromatic, complementary, triadic, tetradic, export palette, css colors"
        url="/palette-generator"
      />
      <Container fluid className="p-0 palette-generator-container">
        {/* Palette Display - Vertical Stack on Left (Desktop) / Horizontal Top (Mobile) */}
        <div id="palette-display" className="palette-sidebar">
          {palette.map((color, index) => (
            <div
              key={`${color.hex}-${index}`}
              className="palette-card-item"
              style={{
                backgroundColor: color.hex,
                color: color.textColor,
              }}
              onClick={() => handleColorClick(color.hex)}
              draggable
              onDragStart={(e) => handlePaletteDragStart(e, index)}
              onDragOver={handlePaletteDragOver}
              onDrop={(e) => handlePaletteDrop(e, index)}
              onDragEnd={handlePaletteDragEnd}
            >
              <div
                className="palette-drag-handle desktop-only"
                title="Drag to reorder"
              >
                <i className="bi bi-grip-vertical"></i>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <h5
                  style={{ margin: 0, fontWeight: "bold", fontSize: "1.1rem" }}
                >
                  {color.hex}
                </h5>
                <p style={{ margin: 0, fontSize: "0.85rem" }}>{color.name}</p>
              </div>
              <Button
                variant={color.locked ? "warning" : "light"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLock(index);
                }}
                id="lock-button"
              >
                <i
                  className={color.locked ? "bi bi-lock-fill" : "bi bi-unlock"}
                ></i>
              </Button>
              <div
                className="palette-reorder-mobile mobile-only"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="light"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => movePaletteColor(index, index - 1)}
                  aria-label="Move color up"
                >
                  <i className="bi bi-arrow-up"></i>
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  disabled={index === palette.length - 1}
                  onClick={() => movePaletteColor(index, index + 1)}
                  aria-label="Move color down"
                >
                  <i className="bi bi-arrow-down"></i>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard - Always Visible on Right (Desktop) / Bottom (Mobile) */}
        <div className="palette-dashboard-area">
          {colorInfo ? (
            <>
              <div className="dashboard-sticky">
                <div className="dashboard-header-row">
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      color: "var(--dashboard-text)",
                    }}
                  >
                    Dashboard
                  </h3>

                  {/* AI Prompt - Inline */}

                  <div className="dashboard-prompt-inline" style={{ position: "relative" }}>
                    {!currentUser && (
                      <div
                        style={{
                          ...aiLockOverlayStyle,
                          borderRadius: "6px",
                        }}
                        onClick={() => setShowAuthModal(true)}
                        role="button"
                        aria-label="Sign in to use AI generation"
                      >
                        <i className="bi bi-lock-fill" style={{ fontSize: "0.9rem" }}></i>
                        <span style={{ fontSize: "0.8rem" }}>Sign in</span>
                      </div>
                    )}

                    <form
                      onSubmit={handleGenerateWithPrompt}
                      style={{ filter: !currentUser ? "blur(2px)" : "none" }}
                    >
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Describe a palette..."
                        value={aiPrompt}
                        maxLength={MAX_PROMPT_LENGTH}
                        onChange={(e) => {
                          setAiPrompt(e.target.value);
                          if (aiError) setAiError("");
                        }}
                        disabled={aiStatus === "loading" || !currentUser}
                        aria-label="Describe a palette to generate with AI"
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        type="submit"
                        disabled={
                          !currentUser ||
                          !aiPrompt.trim() ||
                          aiStatus === "loading" ||
                          cooldownSeconds > 0 ||
                          aiUsesLeft <= 0
                        }
                        title={
                          !currentUser
                            ? "Sign in to use AI (10/day)"
                            : aiUsesLeft <= 0
                              ? "Limit reached"
                              : cooldownSeconds > 0
                                ? "Cooling down..."
                                : "Generate"
                        }
                        className="dashboard-icon-btn"
                        aria-label="Generate palette from prompt"
                      >
                        {aiStatus === "loading" ? (
                          <i className="bi bi-hourglass-split"></i>
                        ) : (
                          <i className="bi bi-stars"></i>
                        )}
                      </Button>
                    </form>
                  </div>

                  <div className="dashboard-action-bar">

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowSettingsModal(true)}
                      title="Manage Cards"
                      className="dashboard-icon-btn"
                    >
                      <i className="bi bi-sliders"></i>
                    </Button>
                    <Button
                      variant={
                        dashboardView === "masonry"
                          ? "primary"
                          : "outline-secondary"
                      }
                      size="sm"
                      onClick={() => setDashboardView("masonry")}
                      title="Masonry view"
                      className="dashboard-icon-btn mobile-hidden"
                      aria-label="Masonry view"
                    >
                      <i className="bi bi-grid-3x3-gap"></i>
                    </Button>
                    <Button
                      variant={
                        dashboardView === "stacked"
                          ? "primary"
                          : "outline-secondary"
                      }
                      size="sm"
                      onClick={() => setDashboardView("stacked")}
                      title="Stacked view"
                      className="dashboard-icon-btn mobile-hidden"
                      aria-label="Stacked view"
                    >
                      <i className="bi bi-view-stacked"></i>
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={generatePalette}
                      title="Generate New Palette"
                      className="dashboard-icon-btn"
                    >
                      <i className="bi bi-arrow-clockwise"></i>
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={openSaveModal}
                      title="Save Palette"
                      className="dashboard-icon-btn"
                    >
                      <i className="bi bi-floppy"></i>
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => setShowShareModal(true)}
                      title="Share Palette"
                      disabled={palette.length === 0}
                      className="dashboard-icon-btn"
                    >
                      <i className="bi bi-share"></i>
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => setShowExportModal(true)}
                      title="Export Palette"
                      className="dashboard-icon-btn"
                    >
                      <i className="bi bi-download"></i>
                    </Button>
                  </div>

                  {/* Mobile Toolbar Toggle */}
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowMobileToolbar(!showMobileToolbar)}
                    className="mobile-toolbar-toggle dashboard-icon-btn"
                    aria-label="Open tools"
                  >
                    <i className="bi bi-three-dots-vertical"></i>
                  </Button>
                </div>
              </div>

              {/* Mobile Toolbar Popout */}
              <div
                className={`mobile-toolbar-backdrop ${showMobileToolbar ? 'is-open' : ''}`}
                onClick={() => setShowMobileToolbar(false)}
              />
              <div className={`mobile-toolbar-popout ${showMobileToolbar ? 'is-open' : ''}`}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => { setShowSettingsModal(true); setShowMobileToolbar(false); }}
                  title="Manage Cards"
                >
                  <i className="bi bi-sliders me-2"></i>Cards
                </Button>
                {/* <Button
                  variant={dashboardView === "masonry" ? "primary" : "outline-secondary"}
                  size="sm"
                  onClick={() => { setDashboardView("masonry"); setShowMobileToolbar(false); }}
                >
                  <i className="bi bi-grid-3x3-gap me-2"></i>Masonry
                </Button>
                <Button
                  variant={dashboardView === "stacked" ? "primary" : "outline-secondary"}
                  size="sm"
                  onClick={() => { setDashboardView("stacked"); setShowMobileToolbar(false); }}
                >
                  <i className="bi bi-view-stacked me-2"></i>Stacked
                </Button> */}
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => { generatePalette(); setShowMobileToolbar(false); }}
                >
                  <i className="bi bi-arrow-clockwise "></i>
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => { openSaveModal(); setShowMobileToolbar(false); }}
                >
                  <i className="bi bi-floppy "></i>
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => { setShowShareModal(true); setShowMobileToolbar(false); }}
                  disabled={palette.length === 0}
                >
                  <i className="bi bi-share "></i>
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => { setShowExportModal(true); setShowMobileToolbar(false); }}
                >
                  <i className="bi bi-download me-2"></i>Export
                </Button>
              </div>
              <div
                className={`dashboard-grid ${dashboardView === "stacked" ? "dashboard-grid-stacked" : ""
                  }`}
              >
                <AnimatePresence>
                  {cardOrder.map((cardId, index) => {
                    if (!isCardVisible(cardId)) return null;
                    const isExpanded = !!expandedCards[cardId];
                    const commonProps = {
                      index,
                      moveCard: (from, to) => {
                        setCardOrder((prev) => {
                          const updated = [...prev];
                          const [moved] = updated.splice(from, 1);
                          updated.splice(to, 0, moved);
                          return updated;
                        });
                      },
                      isExpanded,
                      onToggleExpand: () => toggleCardExpand(cardId),
                    };

                    const motionProps = {
                      layout: true,
                      initial: { opacity: 0, scale: 0.95 },
                      animate: { opacity: 1, scale: 1 },
                      exit: { opacity: 0, scale: 0.95 },
                      transition: {
                        type: "spring",
                        stiffness: 250,
                        damping: 20,
                      },
                      style: { width: "100%" },
                    };

                    switch (cardId) {
                      case CARD_TYPES.COLOR_DATA:
                        return (
                          <motion.div key={cardId} {...motionProps}>
                            <ColorDataCard
                              color={selectedColor}
                              colorInfo={colorInfo}
                              {...commonProps}
                            />
                          </motion.div>
                        );
                      case CARD_TYPES.COLOR_HARMONY:
                        return (
                          <motion.div key={cardId} {...motionProps}>
                            <ColorHarmonyCard
                              baseColor={selectedColor}
                              colorHarmonies={harmonies}
                              onHarmonySelect={handleHarmonySelect}
                              {...commonProps}
                            />
                          </motion.div>
                        );
                      case CARD_TYPES.COLOR_CONTEXT:
                        return (
                          <motion.div key={cardId} {...motionProps}>
                            <ColorContextCard
                              color={selectedColor}
                              contextData={context}
                              {...commonProps}
                            />
                          </motion.div>
                        );
                      case CARD_TYPES.VISUALIZER:
                        return (
                          <motion.div key={cardId} {...motionProps}>
                            <ColorVisualizerCard
                              palette={palette}
                              {...commonProps}
                            />
                          </motion.div>
                        );
                      case CARD_TYPES.GRADIENT_BUILDER:
                        return (
                          <motion.div key={cardId} {...motionProps}>
                            <GradientBuilderCard
                              color={selectedColor}
                              colorInfo={colorInfo}
                              {...commonProps}
                            />
                          </motion.div>
                        );
                      case CARD_TYPES.OKLCH_EXPLORER:
                        return (
                          <motion.div key={cardId} {...motionProps}>
                            <OKLCHExplorerCard
                              color={selectedColor}
                              colorInfo={colorInfo}
                              {...commonProps}
                            />
                          </motion.div>
                        );
                      case CARD_TYPES.COLOR_SCALES:
                        return (
                          <motion.div key={cardId} {...motionProps}>
                            <ColorScalesCard
                              color={selectedColor}
                              colorInfo={colorInfo}
                              {...commonProps}
                            />
                          </motion.div>
                        );
                      case CARD_TYPES.ACCESSIBILITY:
                        return (
                          <motion.div key={cardId} {...motionProps}>
                            <AccessibilityCard
                              color={selectedColor}
                              colorInfo={colorInfo}
                              {...commonProps}
                            />
                          </motion.div>
                        );
                      default:
                        return null;
                    }
                  })}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="d-flex flex-column justify-content-center align-items-center h-100 text-muted">
              <i
                className="bi bi-palette"
                style={{ fontSize: "3rem", marginBottom: "1rem" }}
              ></i>
              <h4>Select a color to view details</h4>
            </div>
          )}
        </div>

        {/* Save Modal */}
        <Modal
          show={showSaveModal}
          onHide={() => setShowSaveModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Save Palette</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input
              type="text"
              className="form-control"
              value={paletteName}
              onChange={(e) => setPaletteName(e.target.value)}
              placeholder="Enter palette name"
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowSaveModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Export Modal */}
        <Modal
          show={showExportModal}
          onHide={() => setShowExportModal(false)}
          centered
          contentClassName="export-modal"
        >
          <Modal.Header closeButton className="border-0">
            <div className="w-100">
              <p className="share-chip">Export palette</p>
              <h4 className="share-title mb-0">Choose a format</h4>
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="export-grid">
              {[
                { label: "PNG", icon: "bi bi-image" },
                { label: "JPEG", icon: "bi bi-file-earmark-image" },
                { label: "SVG", icon: "bi bi-vector-pen" },
                { label: "CSS", icon: "bi bi-file-earmark-code" },
                { label: "JSON", icon: "bi bi-braces" },
                { label: "Text", icon: "bi bi-file-earmark-text" },
              ].map((item) => (
                <button
                  key={item.label}
                  className="export-card"
                  onClick={() => handleExport(item.label.toLowerCase())}
                >
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button
              variant="secondary"
              onClick={() => setShowExportModal(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Dashboard Settings Modal */}
        <DashboardSettings
          show={showSettingsModal}
          onHide={() => setShowSettingsModal(false)}
          visibleCards={visibleCards}
          onToggleCard={handleToggleCard}
        />

        {/* Toast */}
        <Toast
          show={toast.show}
          onClose={() => setToast({ show: false, message: "" })}
          delay={3000}
          autohide
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 1100,
          }}
        >
          <Toast.Header>
            <strong className="me-auto">Notification</strong>
          </Toast.Header>
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
        <Modal
          show={showAuthModal}
          onHide={() => setShowAuthModal(false)}
          centered
          size="md"
          backdrop="static"
          contentClassName="glass-card"
        >
          <div style={{ borderRadius: "8px", overflow: "hidden" }}>
            <div
              style={{
                background:
                  "linear-gradient(120deg, #1b1f3a 0%, #2d3d7a 55%, #0b1329 100%)",
                color: "#f8f9ff",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "12px",
                  background: "rgba(255, 215, 128, 0.22)",
                  display: "grid",
                  placeItems: "center",
                  color: "#f5d776",
                  fontSize: "1.45rem",
                }}
              >
                <i className="bi bi-lock-fill"></i>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "1rem",
                    letterSpacing: "0.2px",
                    fontWeight: 700,
                  }}
                >
                  Unlock AI + saving
                </div>
                <div style={{ opacity: 0.88, fontSize: "0.9rem" }}>
                  Sign in to access premium tools and keep your palettes.
                </div>
              </div>
              {/* <div style={{
                                marginLeft: 'auto',
                                padding: '8px 14px',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.14)',
                                fontSize: '0.82rem',
                                color: '#fffbea',
                                fontWeight: 700,
                            }}>
                                10 Prompts
                            </div> */}
            </div>
            <div style={{ background: "#f6f7fb", padding: "20px 24px 8px" }}>
              <div className="d-grid gap-2 mb-3">
                {[
                  {
                    icon: "bi-stars",
                    title: "AI palette generator",
                    desc: "Describe your idea and get a curated palette in seconds.",
                  },
                  {
                    icon: "bi-shield-check",
                    title: "Daily AI allowance",
                    desc: "10 generations per day to explore, iterate, and refine.",
                  },
                  {
                    icon: "bi-bookmark-heart",
                    title: "Save & reuse",
                    desc: "Store palettes to revisit, export, and share anytime.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="d-flex align-items-center gap-3 p-3 rounded-3"
                    style={{
                      background: "#ffffff",
                      border: "1px solid rgba(0,0,0,0.05)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div
                      className="rounded-3"
                      style={{
                        width: 52,
                        height: 52,
                        background: "#e9edff",
                        color: "#3f2ee8",
                        fontSize: "1.6rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i className={`bi ${item.icon}`}></i>
                    </div>
                    <div>
                      <div style={{ fontWeight: 800 }}>{item.title}</div>
                      <div className="text-muted small">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                padding: "0 24px 20px",
                display: "flex",
                gap: "10px",
                background: "#f6f7fb",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="secondary"
                onClick={() => setShowAuthModal(false)}
              >
                Maybe later
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowAuthModal(false);
                  window.location.href = "/signup";
                }}
              >
                Sign up
              </Button>
              <Button
                variant="outline-primary"
                onClick={() => {
                  setShowAuthModal(false);
                  window.location.href = "/login";
                }}
              >
                Log in
              </Button>
            </div>
          </div>
        </Modal>
        {showShareModal && (
          <SharePalette
            show={showShareModal}
            onClose={() => setShowShareModal(false)}
            palette={{
              name: paletteName || "Shared Palette",
              colors: palette.map((c) => c.hex),
            }}
            shareUrl={() => {
              const payload = {
                name: paletteName || "Shared Palette",
                colors: palette.map((c) => c.hex),
              };
              const encoded = encodeURIComponent(btoa(JSON.stringify(payload)));
              return `${window.location.origin}/palette-generator?palette=${encoded}`;
            }}
          />
        )}
      </Container>
    </DndProvider>
  );
};

export default PaletteGenerator;
