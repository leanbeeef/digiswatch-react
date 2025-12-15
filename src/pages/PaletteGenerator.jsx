// src/pages/PaletteGenerator.jsx
import { useEffect, useRef, useState } from "react";
import { Button, Toast, Modal } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import SharePalette from "../components/SharePalette";
import LayoutContainer from "../components/LayoutContainer";
import PaletteTray from "../components/PaletteTray";
import ColorEditorDrawer from "../components/ColorEditorDrawer";
import DashboardSettings from "../components/DashboardSettings";
import DashboardCardSlot from "../components/DashboardCardSlot";
import CardDetailModal from "../components/CardDetailModal";
import { CARD_REGISTRY, DEFAULT_SLOTS } from "../components/CardRegistry";
import { DensityProvider, useDensity } from "../contexts/DensityContext";
import { getColorContext } from "../utils/getColorContext";
import "../styles/dashboard.css";
import "../styles/exportModal.css";
import "../styles/layout.css";
import "../styles/context-panel.css";
import "../styles/palette-tray.css";
import "../styles/dashboard-grid.css";
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
const OWNER_EMAIL = "jodrey48@gmail.com, heather@velsoft.com";
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

const TUTORIAL_STEPS = [
  {
    title: "Pick a swatch",
    body: "Click any palette swatch on the left to load its data, harmonies, and context on the dashboard.",
    tips: ["Drag swatches to reorder", "Tap the lock to keep a color while shuffling"],
  },
  {
    title: "Generate colors",
    body: "Use the AI prompt to request a vibe (10/day). Or click the shuffle button to spin up a random set.",
    tips: ["Short prompts work best", "Locked colors stay put when shuffling"],
  },
  {
    title: "Fine-tune quickly",
    body: "Open the color drawer by clicking a swatch to tweak HSL/OKLCH, then drag cards to reorder your tools.",
    tips: ["Expand/collapse cards to focus", "Switch Masonry/Stacked to suit your layout"],
  },
  {
    title: "Check accessibility",
    body: "Use Contrast & Accessibility cards to verify WCAG scores and see readable text pairs automatically.",
    tips: ["Try dark/light modes in the visualizer", "Keep ratios ≥ 4.5 for body text"],
  },
  {
    title: "Share or export",
    body: "Save palettes to your account, share a link, or export as CSS, JSON, SVG, PNG, or Text.",
    tips: ["Name the palette before saving", "Exports respect your current order"],
  },
];

const getTextColor = (bg) => {
  return tinycolor.readability(bg, "#FFFFFF") >= 4.5 ? "#FFFFFF" : "#000000";
};

const PaletteGenerator = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const { density, toggleDensity } = useDensity();
  const isOwner = currentUser?.email === OWNER_EMAIL;
  // Dashboard Card Handlers
  const handleCardClick = (cardId) => {
    setSelectedCardId(cardId);
    setDetailModalOpen(true);
  };

  const handleSwapClick = (index) => {
    setSwappingSlotIndex(index);
    setSwapModalOpen(true);
  };

  const handleSwapConfirm = (newCardId) => {
    const newSlots = [...cardSlots];
    newSlots[swappingSlotIndex] = newCardId;
    setCardSlots(newSlots);
    setSwapModalOpen(false);
    setSwappingSlotIndex(null);
  };

  const getCardProps = (cardId) => {
    switch (cardId) {
      case 'color-info': return { color: selectedColor, colorInfo };
      case 'harmony': return { harmonies, onHarmonySelect: handleHarmonySelect };
      case 'accessibility': return { color: selectedColor };
      case 'scale': return { color: selectedColor };
      case 'oklch': return { color: selectedColor };
      case 'gradient': return { color: selectedColor };
      case 'visualizer': return { palette };
      case 'color-context': return { color: selectedColor, contextData: context };
      case 'brand-analytics': return { color: selectedColor };
      default: return { color: selectedColor };
    }
  };

  const [palette, setPalette] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [showColorEditor, setShowColorEditor] = useState(false);
  const [editingColorIndex, setEditingColorIndex] = useState(null);
  const [colorInfo, setColorInfo] = useState(null);
  const [harmonies, setHarmonies] = useState(null);
  const [context, setContext] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [paletteName, setPaletteName] = useState("");
  const [toast, setToast] = useState({ show: false, message: "" });
  const [draggingPaletteIndex, setDraggingPaletteIndex] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiStatus, setAiStatus] = useState("idle"); // idle | loading | success | error
  const [aiError, setAiError] = useState("");
  const [paletteDescription, setPaletteDescription] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [aiUsesLeft, setAiUsesLeft] = useState(10);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [visibleCards, setVisibleCards] = useState([]);

  // Dashboard State
  const [cardSlots, setCardSlots] = useState(() => {
    const saved = localStorage.getItem('dashboardSlots');
    let slots = saved ? JSON.parse(saved) : DEFAULT_SLOTS;
    // Migration: Ensure we have enough slots for the new layout (7 items)
    if (slots.length < DEFAULT_SLOTS.length) {
      slots = [...slots, ...DEFAULT_SLOTS.slice(slots.length)];
    }
    return slots;
  });
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [swappingSlotIndex, setSwappingSlotIndex] = useState(null);

  // Persist slots
  useEffect(() => {
    localStorage.setItem('dashboardSlots', JSON.stringify(cardSlots));
  }, [cardSlots]);
  const aiCooldownTimerRef = useRef(null);
  const lastAiRequestRef = useRef(0);
  const showAiError = (message) => {
    setAiError(message);
    setToast({ show: true, message });
  };
  const requireAuthToast = () => {
    setShowAuthModal(true);
  };
  const startTutorial = () => {
    setTutorialStep(0);
    setShowTutorial(true);
  };
  const closeTutorial = () => setShowTutorial(false);
  const nextTutorial = () =>
    setTutorialStep((step) => Math.min(step + 1, TUTORIAL_STEPS.length - 1));
  const prevTutorial = () =>
    setTutorialStep((step) => Math.max(step - 1, 0));

  const handleToggleCard = (cardId) => {
    setVisibleCards((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId]
    );
  };

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
      const response = await fetch(`${API_BASE || ""}/api/generate-palette-from-prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: sanitizedPrompt }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        console.error("AI prompt response error", response.status, errorBody);
        throw new Error(errorBody || "Failed to generate palette");
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
        let friendly = "Could not generate palette from prompt. Please try again shortly.";
        const msg = (error?.message || "").trim();
        if (msg) {
          try {
            const parsed = JSON.parse(msg);
            friendly = parsed?.error || friendly;
          } catch {
            friendly = msg;
          }
        }
        showAiError(friendly);
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

  useEffect(() => {
    if (editingColorIndex !== null && !palette[editingColorIndex]) {
      setShowColorEditor(false);
      setEditingColorIndex(null);
    }
  }, [palette, editingColorIndex]);

  // Show tutorial once per browser
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "ds_seen_palette_tutorial_v1";
    const seen = localStorage.getItem(key);
    if (!seen) {
      setShowTutorial(true);
      localStorage.setItem(key, "true");
    }
  }, []);

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

  const handlePaletteColorClick = (colorHex, index) => {
    handleColorClick(colorHex);
    setEditingColorIndex(index);
    setShowColorEditor(true);
  };

  const updateColorAtIndex = (index, nextHex) => {
    const normalizedHex = new TinyColor(nextHex).toHexString();
    setPalette((prev) =>
      prev.map((c, i) =>
        i === index
          ? {
            ...c,
            hex: normalizedHex,
            name: namer(normalizedHex).ntc[0].name,
            textColor: getTextColor(normalizedHex),
          }
          : c
      )
    );
    handleColorClick(normalizedHex);
  };

  const handleColorEditorChange = (nextHex) => {
    if (editingColorIndex === null) return;
    updateColorAtIndex(editingColorIndex, nextHex);
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
      console.log("handleSave: start", {
        uid: currentUser.uid,
        paletteName,
        colors: palette.map((c) => c.hex),
        description: paletteDescription,
      });
      await setDoc(
        doc(collection(db, "users", currentUser.uid, "createdPalettes")),
        {
          name: paletteName,
          colors: palette.map((c) => c.hex),
          createdAt: new Date().toISOString(),
          visibility: "public", // default to public so community can see it
          description: paletteDescription || "",
          ownerId: currentUser.uid,
          ownerName:
            currentUser.displayName ||
            currentUser.email?.split("@")[0] ||
            "Creator",
          ownerAvatar: currentUser.avatar || currentUser.photoURL || "",
          ownerEmail: currentUser.email || "",
        }
      );
      setToast({ show: true, message: "Palette saved successfully!" });
      setPaletteName("");
      setPaletteDescription("");
      setShowSaveModal(false);
    } catch (error) {
      console.error("handleSave: failed", error);
      setToast({
        show: true,
        message: `Failed to save palette: ${error?.message || "unknown error"}`,
      });
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

  return (
    <DndProvider backend={HTML5Backend}>
      <SEO
        title="Color Palette Generator"
        description="Create custom color palettes with our advanced generator. Lock colors, explore harmonies like monochromatic and complementary, and export to CSS, JSON, or Image."
        keywords="color palette generator, color schemes, monochromatic, complementary, triadic, tetradic, export palette, css colors"
        url="/palette-generator"
      />
      <LayoutContainer
        headerContent={
          <div className="d-flex justify-content-between align-items-center w-100 gap-3">
            {/* AI Prompt */}
            <div className="flex-grow-1" style={{ maxWidth: '600px', position: 'relative' }}>
              {!currentUser && (
                <div
                  style={{
                    ...aiLockOverlayStyle,
                    borderRadius: '6px',
                  }}
                  onClick={() => setShowAuthModal(true)}
                  role="button"
                  aria-label="Sign in to use AI generation"
                >
                  <i className="bi bi-lock-fill" style={{ fontSize: '0.9rem' }}></i>
                  <span style={{ fontSize: '0.8rem' }}>Sign in</span>
                </div>
              )}
              <form
                onSubmit={handleGenerateWithPrompt}
                style={{ filter: !currentUser ? 'blur(2px)' : 'none', display: 'flex', gap: '0.5rem' }}
              >
                <input
                  type="text"
                  className="form-control"
                  placeholder="Describe a palette..."
                  value={aiPrompt}
                  maxLength={MAX_PROMPT_LENGTH}
                  onChange={(e) => {
                    setAiPrompt(e.target.value);
                    if (aiError) setAiError('');
                  }}
                  disabled={aiStatus === 'loading' || !currentUser}
                  aria-label="Describe a palette to generate with AI"
                />
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={
                    !currentUser ||
                    !aiPrompt.trim() ||
                    aiStatus === 'loading' ||
                    cooldownSeconds > 0 ||
                    aiUsesLeft <= 0
                  }
                  title={
                    !currentUser
                      ? 'Sign in to use AI (10/day)'
                      : aiUsesLeft <= 0
                        ? 'Limit reached'
                        : cooldownSeconds > 0
                          ? 'Cooling down...'
                          : 'Generate'
                  }
                >
                  {aiStatus === 'loading' ? (
                    <i className="bi bi-hourglass-split"></i>
                  ) : (
                    <i className="bi bi-stars"></i>
                  )}
                </Button>
              </form>
            </div>

            {/* Action buttons */}
            <div className="d-flex gap-2 align-items-center">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={generatePalette}
                title="Generate New Palette"
              >
                <i className="bi bi-arrow-clockwise"></i>
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={openSaveModal}
                title="Save Palette"
              >
                <i className="bi bi-floppy"></i>
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowShareModal(true)}
                title="Share Palette"
                disabled={palette.length === 0}
              >
                <i className="bi bi-share"></i>
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowExportModal(true)}
                title="Export Palette"
              >
                <i className="bi bi-download"></i>
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={startTutorial}
                title="Tutorial"
              >
                <i className="bi bi-question-circle"></i>
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={toggleDensity}
                title={`Density: ${density === 'comfortable' ? 'Comfortable' : 'Compact'}`}
                aria-label="Toggle density mode"
              >
                <i className={`bi bi-${density === 'comfortable' ? 'layout-text-window-reverse' : 'layout-text-window'}`}></i>
              </Button>
            </div>
          </div>
        }
        workbench={
          <div className="dashboard-grid">
            {palette.length > 0 && selectedColor ? (
              cardSlots.map((cardId, index) => {
                const cardDef = CARD_REGISTRY[cardId];
                if (!cardDef) return null;

                const Preview = cardDef.Preview;
                const props = getCardProps(cardId);

                // Asymmetric 6-column grid logic with Vertical Card:
                // Row 1: Span 2, Span 2, Span 1, Vert Span 1 (Indices 0, 1, 2, 3)
                // Row 2: Span 3, Span 2, (Vert continues) (Indices 4, 5)
                // Row 3: Span 6 (Index 6)

                let className = '';

                if (index === 0 || index === 1) {
                  className = 'col-span-2';
                } else if (index === 2) {
                  className = ''; // Span 1
                } else if (index === 3) {
                  className = 'row-span-2'; // Vertical card in col 6
                } else if (index === 4) {
                  className = 'col-span-3';
                } else if (index === 5) {
                  className = 'col-span-2';
                } else if (index === 6) {
                  className = 'col-span-6 only-visible-4k';
                }

                // Adaptive props
                const isWide = [0, 1, 4, 5, 6].includes(index);
                const isTall = index === 3;

                return (
                  <DashboardCardSlot
                    key={`${cardId}-${index}`}
                    cardType={cardId}
                    title={cardDef.title}
                    icon={cardDef.icon}
                    isPremium={cardDef.isPremium}
                    previewContent={<Preview {...props} isWide={isWide} isTall={isTall} />}
                    onCardClick={() => handleCardClick(cardId)}
                    onSwapClick={() => handleSwapClick(index)}
                    className={className}
                  />
                );
              })
            ) : (
              <div className="dashboard-empty-state">
                <i className="bi bi-palette"></i>
                <h4>Generate a palette to get started</h4>
                <p>Click the shuffle button or describe a palette with AI</p>
              </div>
            )}
          </div>
        }
        paletteTray={
          < PaletteTray
            palette={palette}
            onColorClick={handlePaletteColorClick}
            onSwatchSelect={handleColorClick}
            activeColor={selectedColor}
            onToggleLock={toggleLock}
            onDragStart={handlePaletteDragStart}
            onDragOver={handlePaletteDragOver}
            onDrop={handlePaletteDrop}
            onDragEnd={handlePaletteDragEnd}
            draggingIndex={draggingPaletteIndex}
          />
        }
      />

      {/* Modals */}
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
          <textarea
            className="form-control mt-3"
            value={paletteDescription}
            onChange={(e) => setPaletteDescription(e.target.value)}
            placeholder="Add a short description (optional)"
            rows={3}
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

      {/* Detail Modal */}
      {selectedCardId && CARD_REGISTRY[selectedCardId] && (
        <CardDetailModal
          show={detailModalOpen}
          onHide={() => setDetailModalOpen(false)}
          title={CARD_REGISTRY[selectedCardId].title}
        >
          {(() => {
            const Detail = CARD_REGISTRY[selectedCardId].Detail;
            const props = getCardProps(selectedCardId);
            return <Detail {...props} />;
          })()}
        </CardDetailModal>
      )}

      {/* Swap Modal */}
      <Modal show={swapModalOpen} onHide={() => setSwapModalOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Customize Dashboard</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-grid gap-2">
            {Object.values(CARD_REGISTRY).map(card => (
              <Button
                key={card.id}
                variant="outline-light"
                className="d-flex align-items-center gap-3 p-3 text-start border"
                style={{ color: '#1f2937' }}
                onClick={() => handleSwapConfirm(card.id)}
              >
                <i className={`bi ${card.icon} fs-4 text-primary`}></i>
                <div>
                  <div className="fw-bold d-flex align-items-center gap-2">
                    {card.title}
                    {card.isPremium && <span className="badge bg-warning text-dark" style={{ fontSize: '0.6em' }}>PRO</span>}
                  </div>
                  <div className="small text-muted">Click to select</div>
                </div>
              </Button>
            ))}
          </div>
        </Modal.Body>
      </Modal>

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
      {
        showShareModal && (
          <SharePalette
            show={showShareModal}
            onClose={() => setShowShareModal(false)}
            palette={{
              name: paletteName || "DigiSwatch Palette",
              colors: palette.map((c) => c.hex),
            }}
            shareUrl={() => {
              const payload = {
                name: paletteName || "DigiSwatch Palette",
                colors: palette.map((c) => c.hex),
              };
              const encoded = encodeURIComponent(btoa(JSON.stringify(payload)));
              return `${window.location.origin}/palette-generator?palette=${encoded}`;
            }}
          />
        )
      }
      <ColorEditorDrawer
        show={showColorEditor}
        color={
          editingColorIndex !== null && palette[editingColorIndex]
            ? palette[editingColorIndex].hex
            : selectedColor || "#7b5bff"
        }
        onClose={() => setShowColorEditor(false)}
        onChange={handleColorEditorChange}
      />

      {
        showTutorial && (
          <div className="tutorial-overlay" role="dialog" aria-modal="true">
            <div className="tutorial-card">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="tutorial-step-badge">
                    Step {tutorialStep + 1} of {TUTORIAL_STEPS.length}
                  </div>
                  <h5 className="mb-2">{TUTORIAL_STEPS[tutorialStep].title}</h5>
                </div>
                <Button
                  variant="light"
                  size="sm"
                  onClick={closeTutorial}
                  className="dashboard-icon-btn"
                  aria-label="Close tutorial"
                >
                  <i className="bi bi-x-lg"></i>
                </Button>
              </div>

              <p className="text-muted mb-3">{TUTORIAL_STEPS[tutorialStep].body}</p>

              {TUTORIAL_STEPS[tutorialStep].tips && (
                <ul className="tutorial-tip-list">
                  {TUTORIAL_STEPS[tutorialStep].tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              )}

              <div className="tutorial-progress mb-3" aria-hidden="true">
                <div
                  className="tutorial-progress-bar"
                  style={{
                    width: `${Math.round(
                      ((tutorialStep + 1) / TUTORIAL_STEPS.length) * 100
                    )}%`,
                  }}
                ></div>
              </div>

              <div className="tutorial-nav">
                <Button
                  variant="light"
                  onClick={prevTutorial}
                  disabled={tutorialStep === 0}
                >
                  <i className="bi bi-arrow-left-short me-1"></i> Back
                </Button>
                <div className="flex-grow-1" />
                <Button
                  variant="primary"
                  onClick={
                    tutorialStep === TUTORIAL_STEPS.length - 1
                      ? closeTutorial
                      : nextTutorial
                  }
                >
                  {tutorialStep === TUTORIAL_STEPS.length - 1 ? "Done" : "Next"}
                </Button>
              </div>
            </div>
          </div>
        )
      }
    </DndProvider >
  );
};

// Wrap with DensityProvider at export level so useDensity hook works inside component
const PaletteGeneratorWithDensity = () => (
  <DensityProvider>
    <PaletteGenerator />
  </DensityProvider>
);

export default PaletteGeneratorWithDensity;
