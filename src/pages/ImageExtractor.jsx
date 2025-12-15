import { useRef, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Toast, Nav, Button } from "react-bootstrap";
import namer from "color-namer";
import tinycolor from "tinycolor2";
import defaultImage from "../assets/example.jpeg";
import "../ImageExtractor.css";
import "../styles/dashboard.css";
import "../styles/dashboard-grid.css";
import "../styles/layout.css";
import SEO from '../components/SEO';
import LayoutContainer from "../components/LayoutContainer";

/**
 * ImageColorExtractor — draggable eyedroppers + zoom lens
 * Constrained to the viewport height so the page never scrolls.
 */
export default function ImageColorExtractor() {
  const visibleCanvasRef = useRef(null);
  const hiddenCanvasRef = useRef(null);
  const overlayRef = useRef(null);
  const lensCanvasRef = useRef(null); // magnifier canvas
  const imgRef = useRef(null);
  const navigate = useNavigate();
  const extractRef = useRef(null);
  const paletteRef = useRef(null);

  const [imageURL, setImageURL] = useState(defaultImage);
  const [droppers, setDroppers] = useState([]); // {id,x,y,color,name,locked}
  const [activeId, setActiveId] = useState(null);
  const [count] = useState(6);
  const [lens, setLens] = useState({ visible: false, vx: 0, vy: 0 });
  const [toast, setToast] = useState({ show: false, message: "" });
  const [toolbarTab, setToolbarTab] = useState("extract");

  // Keep a Set of hex colors to bias initial placement toward unique swatches
  const sampledInitColors = useMemo(() => new Set(), [imageURL]);

  const paletteColors = useMemo(
    () => droppers.slice(0, 6).map(({ color, name, id }) => ({ color, name, id })),
    [droppers]
  );

  const paletteStats = useMemo(() => {
    if (!paletteColors.length) return null;
    const lightnessValues = paletteColors.map((p) => tinycolor(p.color).toHsl().l * 100);
    const avgLightness = Math.round(
      lightnessValues.reduce((sum, l) => sum + l, 0) / lightnessValues.length
    );
    const warmCount = paletteColors.filter((p) => {
      const h = tinycolor(p.color).toHsl().h;
      return h >= 0 && h < 180;
    }).length;
    const coolCount = paletteColors.length - warmCount;

    let bestPair = null;
    let bestContrast = 0;
    for (let i = 0; i < paletteColors.length; i++) {
      for (let j = i + 1; j < paletteColors.length; j++) {
        const c1 = paletteColors[i].color;
        const c2 = paletteColors[j].color;
        const readability = tinycolor.readability(c1, c2);
        if (readability > bestContrast) {
          bestContrast = readability;
          bestPair = { a: paletteColors[i], b: paletteColors[j], ratio: readability.toFixed(2) };
        }
      }
    }

    return { avgLightness, warmCount, coolCount, bestPair };
  }, [paletteColors]);

  const getReadableText = (bg) => {
    return tinycolor.readability(bg, "#0f172a") < 4 ? "#f8fafc" : "#0f172a";
  };

  const downloadDataUrl = (dataUrl, filename) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.click();
  };

  // Fit canvases to viewport without page scroll
  const layoutAndDraw = () => {
    const vis = visibleCanvasRef.current;
    const hid = hiddenCanvasRef.current;
    const lensCanvas = lensCanvasRef.current;
    const img = imgRef.current;
    if (!vis || !hid || !img) return;

    const vctx = vis.getContext("2d");
    const hctx = hid.getContext("2d");

    // Available height = container height (flex item) - padding
    const container = vis.parentElement; // .ie-canvas-container
    // We can just use the container's height since it's now controlled by flexbox
    const availableHeight = container.clientHeight - 20; // 20px padding
    // Width constraint from container
    const maxW = container.clientWidth - 40; // padding

    // Scale by both constraints, never upscale above 1
    const scale = Math.min(maxW / img.width, availableHeight / img.height, 1);

    // Visible canvas: scaled draw
    vis.width = Math.round(img.width * scale);
    vis.height = Math.round(img.height * scale);
    vctx.clearRect(0, 0, vis.width, vis.height);
    vctx.drawImage(img, 0, 0, vis.width, vis.height);

    // Hidden canvas: match visible size (trades a bit of sampling fidelity for speed/memory)
    hid.width = vis.width;
    hid.height = vis.height;
    hctx.clearRect(0, 0, hid.width, hid.height);
    hctx.drawImage(img, 0, 0, vis.width, vis.height);

    // Lens canvas static size
    if (lensCanvas) {
      lensCanvas.width = 140;
      lensCanvas.height = 140;
    }

    // Align overlay to the canvas box so dropper coords match
    alignOverlay();
  };

  const alignOverlay = () => {
    const vis = visibleCanvasRef.current;
    const overlay = overlayRef.current;
    const container = vis?.parentElement;
    if (!vis || !overlay || !container) return;

    const parentRect = container.getBoundingClientRect();
    const visRect = vis.getBoundingClientRect();

    overlay.style.left = `${visRect.left - parentRect.left}px`;
    overlay.style.top = `${visRect.top - parentRect.top}px`;
    overlay.style.width = `${vis.width}px`;
    overlay.style.height = `${vis.height}px`;
  };

  // Load image into canvases
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // helps with local/dev cases
    img.src = imageURL;
    img.onload = () => {
      imgRef.current = img;
      layoutAndDraw();
      // Seed droppers fresh on new image
      seedDroppers(count);
    };
  }, [imageURL]);

  // Re-layout on resize to keep within viewport
  useEffect(() => {
    const onResize = () => layoutAndDraw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // When count changes (and not due to image change), adjust droppers list
  useEffect(() => {
    if (!hiddenCanvasRef.current || !visibleCanvasRef.current) return;
    setDroppers((prev) => {
      if (prev.length === count) return prev;
      if (prev.length > count) return prev.slice(0, count);
      const needed = count - prev.length;
      const extras = Array.from({ length: needed }, () => createDropper());
      return [...prev, ...extras.filter(Boolean)];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const seedDroppers = (n) => {
    const seeded = [];
    for (let i = 0; i < n; i++) {
      const d = createDropper();
      if (d) seeded.push(d);
    }
    setDroppers(seeded);
  };

  const createDropper = () => {
    const vis = visibleCanvasRef.current;
    if (!vis) return null;
    const rect = vis.getBoundingClientRect();

    // Try a few times to find a unique initial color
    let attempts = 0;
    while (attempts < 80) {
      const x = Math.random() * rect.width; // CSS pixels over visible canvas
      const y = Math.random() * rect.height;
      const { color, name } = sampleAtVisibleCoords(x, y);
      if (!sampledInitColors.has(color)) {
        sampledInitColors.add(color);
        return { id: cryptoRandomId(), x, y, color, name, locked: false };
      }
      attempts++;
    }
    // fallback
    const x = rect.width / 2;
    const y = rect.height / 2;
    const { color, name } = sampleAtVisibleCoords(x, y);
    return { id: cryptoRandomId(), x, y, color, name, locked: false };
  };

  const cryptoRandomId = () => `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;

  // Convert visible-canvas CSS pixel coords -> hidden-canvas pixel coords and sample
  const sampleAtVisibleCoords = (vx, vy) => {
    const vis = visibleCanvasRef.current;
    const hid = hiddenCanvasRef.current;
    const hctx = hid.getContext("2d");
    const rect = vis.getBoundingClientRect();

    // Normalize to [0,1] then scale to hidden canvas pixels (using scaled hidden canvas for speed)
    const nx = Math.min(Math.max(vx / rect.width, 0), 1);
    const ny = Math.min(Math.max(vy / rect.height, 0), 1);
    const hx = Math.min(Math.max(Math.floor(nx * hid.width), 0), hid.width - 1);
    const hy = Math.min(Math.max(Math.floor(ny * hid.height), 0), hid.height - 1);

    const pixel = hctx.getImageData(hx, hy, 1, 1).data; // [r,g,b,a]
    const color = tinycolor({ r: pixel[0], g: pixel[1], b: pixel[2] }).toHexString();
    const name = namer(color).ntc[0].name;
    return { color, name, hx, hy };
  };

  const buildPaletteImage = () => {
    if (!paletteColors.length) return null;
    const swatchWidth = 170;
    const height = 160;
    const canvas = document.createElement("canvas");
    canvas.width = paletteColors.length * swatchWidth;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    paletteColors.forEach((p, i) => {
      const x = i * swatchWidth;
      ctx.fillStyle = p.color;
      ctx.fillRect(x, 0, swatchWidth, height - 42);
      ctx.fillStyle = getReadableText(p.color);
      ctx.font = "700 16px Inter, system-ui, -apple-system, sans-serif";
      ctx.fillText(`#${i + 1}`, x + 12, height - 60);
      ctx.font = "600 15px Inter, system-ui, -apple-system, sans-serif";
      ctx.fillText(p.color, x + 12, height - 36);
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({ blob, dataUrl: canvas.toDataURL("image/png") });
      }, "image/png");
    });
  };

  const buildCompositeShareImage = () => {
    if (!imgRef.current || !paletteColors.length) return null;
    const img = imgRef.current;
    const maxWidth = 960;
    const scale = Math.min(maxWidth / img.width, 1);
    const imgW = Math.round(img.width * scale);
    const imgH = Math.round(img.height * scale);
    const padding = 24;
    const targetWidth = Math.max(imgW, paletteColors.length * 140);
    const paletteHeight = 200;
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth + padding * 2;
    canvas.height = imgH + paletteHeight + padding * 2;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const imgX = (canvas.width - imgW) / 2;
    ctx.drawImage(img, imgX, padding, imgW, imgH);

    const swatchWidth = targetWidth / paletteColors.length;
    paletteColors.forEach((p, i) => {
      const x = padding + i * swatchWidth;
      const swatchHeight = paletteHeight - 48;
      ctx.fillStyle = p.color;
      ctx.fillRect(x, padding + imgH + 12, swatchWidth, swatchHeight);
      ctx.fillStyle = getReadableText(p.color);
      ctx.font = "700 15px Inter, system-ui, -apple-system, sans-serif";
      ctx.fillText(`#${i + 1}`, x + 10, padding + imgH + swatchHeight - 36);
      ctx.font = "600 14px Inter, system-ui, -apple-system, sans-serif";
      ctx.fillText(p.color, x + 10, padding + imgH + swatchHeight - 14);
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({ blob, dataUrl: canvas.toDataURL("image/png") });
      }, "image/png");
    });
  };

  // Draw the zoom lens and keep it on-screen (no page scroll)
  const drawLens = (hx, hy, vx, vy) => {
    const hid = hiddenCanvasRef.current;
    const lensCanvas = lensCanvasRef.current;
    if (!hid || !lensCanvas) return;
    const lctx = lensCanvas.getContext("2d");

    const srcSize = 28; // square sample in source pixels
    const half = Math.floor(srcSize / 2);
    const sx = Math.max(0, Math.min(hid.width - srcSize, hx - half));
    const sy = Math.max(0, Math.min(hid.height - srcSize, hy - half));

    // Clear & draw zoomed area
    lctx.clearRect(0, 0, lensCanvas.width, lensCanvas.height);
    lctx.imageSmoothingEnabled = false; // crisp pixels
    lctx.drawImage(hid, sx, sy, srcSize, srcSize, 0, 0, lensCanvas.width, lensCanvas.height);

    // Crosshair
    lctx.save();
    lctx.strokeStyle = "rgba(255,255,255,.9)";
    lctx.lineWidth = 1;
    lctx.beginPath();
    lctx.moveTo(lensCanvas.width / 2, 0);
    lctx.lineTo(lensCanvas.width / 2, lensCanvas.height);
    lctx.moveTo(0, lensCanvas.height / 2);
    lctx.lineTo(lensCanvas.width, lensCanvas.height / 2);
    lctx.stroke();
    lctx.restore();
    lctx.strokeStyle = "rgba(0,0,0,.35)";
    lctx.lineWidth = 2;
    lctx.strokeRect(0.5, 0.5, lensCanvas.width - 1, lensCanvas.height - 1);

    // Position near the pointer, but clamp to viewport so it never forces page scroll
    const offset = 20; // Distance from cursor
    // Center horizontally under the cursor, position below vertically
    let lx = vx - (lensCanvas.width / 2);
    let ly = vy + offset;

    const minX = 8;
    const minY = 8;
    const maxX = window.innerWidth - lensCanvas.width - 8;
    const maxY = window.innerHeight - 100 - lensCanvas.height - 8;

    // If no room below, flip to above
    if (ly > maxY) {
      ly = vy - (lensCanvas.height + offset);
    }

    lx = Math.max(minX, Math.min(maxX, lx));
    ly = Math.max(minY, Math.min(maxY, ly));

    setLens({ visible: true, vx: lx, vy: ly });
  };

  // Drag handling
  useEffect(() => {
    const onMove = (e) => {
      if (!activeId) return;
      const vis = visibleCanvasRef.current;
      const rect = vis.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const vx = clientX - rect.left;
      const vy = clientY - rect.top;

      setDroppers((prev) =>
        prev.map((d) => {
          if (d.id !== activeId || d.locked) return d;
          const clampedX = Math.min(Math.max(vx, 0), rect.width);
          const clampedY = Math.min(Math.max(vy, 0), rect.height);
          const { color, name, hx, hy } = sampleAtVisibleCoords(clampedX, clampedY);
          drawLens(hx, hy, clampedX + rect.left, clampedY + rect.top);
          return { ...d, x: clampedX, y: clampedY, color, name };
        })
      );
    };

    const stop = () => {
      setActiveId(null);
      setLens((l) => ({ ...l, visible: false }));
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", stop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", stop);
    };
  }, [activeId]);

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImageURL(ev.target.result);
    reader.readAsDataURL(file);
  };

  // Randomize: re-seed droppers with fresh unique positions/colors for current count
  const randomizeDroppers = () => {
    sampledInitColors.clear();
    seedDroppers(count);
  };

  const handleSendToGenerator = () => {
    if (!paletteColors.length) return;
    navigate("/palette-generator", {
      state: {
        palette: {
          name: "Image extracted palette",
          colors: paletteColors.map((p) => p.color),
        },
      },
    });
  };

  const handleExportPalette = async () => {
    const paletteImage = await buildPaletteImage();
    if (!paletteImage) return;
    downloadDataUrl(paletteImage.dataUrl, "extracted-palette.png");
    setToast({ show: true, message: "Palette exported as PNG." });
  };

  const handleSharePalette = async () => {
    try {
      const composite = await buildCompositeShareImage();
      if (!composite) return;
      const file = new File([composite.blob], "image-with-palette.png", {
        type: "image/png",
      });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Palette from my image",
          text: "Check out this palette I extracted with DigiSwatch.",
          files: [file],
        });
        setToast({ show: true, message: "Shared with your device tools." });
      } else {
        downloadDataUrl(composite.dataUrl, "image-with-palette.png");
        setToast({
          show: true,
          message: "Downloaded a share-ready image with your palette.",
        });
      }
    } catch (err) {
      console.error("Share failed", err);
      setToast({ show: true, message: "Unable to share right now." });
    }
  };

  const handleCopyHex = async (hex) => {
    try {
      await navigator.clipboard.writeText(hex);
      setToast({ show: true, message: `${hex} copied to clipboard` });
    } catch {
      setToast({ show: true, message: "Copy failed. Try again." });
    }
  };

  const toggleLock = (id) =>
    setDroppers((prev) => prev.map((d) => (d.id === id ? { ...d, locked: !d.locked } : d)));

    const scrollToSection = (ref) => {
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <LayoutContainer
        headerContent={
          <div className="d-flex align-items-center w-100 gap-3 flex-wrap generator-toolbar">
            <div className="context-selected-chip">
              <span className="chip-dot" style={{ backgroundColor: paletteColors[0]?.color || "#d7dbe3" }}></span>
              <div className="chip-text">
                <span className="chip-label">Palette</span>
                <span className="chip-value">{paletteColors.length} colors</span>
              </div>
            </div>

            <div className="toolbar-divider" aria-hidden="true"></div>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <input
                type="file"
                id="file-upload"
                className="d-none"
                onChange={handleUpload}
                accept="image/*"
              />
              <label htmlFor="file-upload" className="ie-btn ie-btn-primary" style={{ cursor: 'pointer' }}>
                <i className="bi bi-upload"></i> Upload
              </label>
              <Button className="ie-btn" variant="outline-secondary" onClick={randomizeDroppers}>
                <i className="bi bi-shuffle me-1"></i>
                Randomize
              </Button>
              <Button className="ie-btn" onClick={handleSendToGenerator} disabled={!paletteColors.length}>
                <i className="bi bi-arrow-up-right-square me-1"></i>
                Send to Generator
              </Button>
            </div>

            <div className="toolbar-divider" aria-hidden="true"></div>

            <div className="flex-grow-1 d-flex justify-content-center">
              <Nav
                variant="tabs"
                activeKey={toolbarTab}
                onSelect={(key) => {
                  setToolbarTab(key);
                  if (key === "extract") scrollToSection(extractRef);
                  if (key === "palette") scrollToSection(paletteRef);
                }}
                className="context-tab-nav"
              >
                <Nav.Item>
                  <Nav.Link eventKey="extract">
                    <i className="bi bi-droplet"></i>
                    <span>Extract</span>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="palette">
                    <i className="bi bi-collection"></i>
                    <span>Palette</span>
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </div>
          </div>
        }
        workbench={
          <div className="h-100 d-flex flex-column" style={{ minHeight: 0 }}>
            <SEO
              title="Image to Color Palette Extractor"
              description="Extract beautiful color palettes from any image. Upload your photo and automatically generate a color scheme based on its dominant colors."
              keywords="image color picker, extract colors from image, photo palette generator, color finder, hex code extractor"
              url="/image-extractor"
            />

            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}>
              <div className="col-span-3" ref={extractRef}>
                <div className="dashboard-card h-100">
                  <div className="dashboard-card-header">
                    <div>
                      <p className="dashboard-card-kicker">Step 1</p>
                      <h5 className="dashboard-card-title mb-0">Extract from image</h5>
                      <div className="text-muted small">Drag the droppers to sample pixels.</div>
                    </div>
                  </div>
                  <div className="ie-canvas-container" style={{ position: "relative", minHeight: 420 }}>
                    <canvas ref={visibleCanvasRef} className="d-block rounded-3 shadow-sm" style={{ display: "block", background: "#fff" }} />
                    <canvas ref={hiddenCanvasRef} className="d-none" aria-hidden="true" />
                    <div ref={overlayRef} className="position-absolute" style={{ pointerEvents: "auto" }}>
                      {droppers.map((d, idx) => (
                        <Dropper
                          key={d.id}
                          idx={idx}
                          d={d}
                          active={activeId === d.id}
                          onPointerDown={() => setActiveId(d.id)}
                          onToggleLock={() => toggleLock(d.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-3" ref={paletteRef}>
                <div className="dashboard-card h-100">
                  <div className="dashboard-card-header d-flex justify-content-between align-items-center">
                    <div>
                      <p className="dashboard-card-kicker">Step 2</p>
                      <h5 className="dashboard-card-title mb-0">Palette preview</h5>
                      <div className="text-muted small">Tap swatches to copy hex.</div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Button variant="outline-secondary" size="sm" onClick={handleExportPalette} disabled={!paletteColors.length}>
                        <i className="bi bi-download"></i>
                      </Button>
                      <Button variant="outline-secondary" size="sm" onClick={handleSharePalette} disabled={!paletteColors.length}>
                        <i className="bi bi-share"></i>
                      </Button>
                    </div>
                  </div>

                  <div className="ie-palette-strip mb-3">
                    {paletteColors.map((swatch, i) => (
                      <div
                        key={swatch.id || i}
                        className="ie-palette-swatch"
                        style={{ background: swatch.color, color: getReadableText(swatch.color) }}
                        title={`${swatch.name} · ${swatch.color}`}
                        onClick={() => handleCopyHex(swatch.color)}
                      >
                        <span className="fw-bold">#{i + 1}</span>
                        <span className="font-monospace small">{swatch.color}</span>
                      </div>
                    ))}
                  </div>

                  {paletteStats && (
                    <div className="ie-insights">
                      <div className="ie-insight-card">
                        <div className="ie-insight-label">Avg lightness</div>
                        <div className="ie-insight-value">{paletteStats.avgLightness}%</div>
                        <div className="ie-insight-bar">
                          <div
                            className="ie-insight-bar-fill"
                            style={{ width: `${paletteStats.avgLightness}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="ie-insight-card">
                        <div className="ie-insight-label">Warm / Cool</div>
                        <div className="ie-insight-pills">
                          <span className="ie-pill warm">Warm {paletteStats.warmCount}</span>
                          <span className="ie-pill cool">Cool {paletteStats.coolCount}</span>
                        </div>
                      </div>

                      {paletteStats.bestPair && (
                        <div className="ie-insight-card ie-pair-card">
                          <div className="ie-insight-label">Highest contrast pair</div>
                          <div className="ie-pair-swatches">
                            <span
                              className="ie-pair-swatch"
                              style={{ background: paletteStats.bestPair.a.color, color: getReadableText(paletteStats.bestPair.a.color) }}
                            >
                              {paletteStats.bestPair.a.color}
                            </span>
                            <i className="bi bi-arrow-left-right text-muted"></i>
                            <span
                              className="ie-pair-swatch"
                              style={{ background: paletteStats.bestPair.b.color, color: getReadableText(paletteStats.bestPair.b.color) }}
                            >
                              {paletteStats.bestPair.b.color}
                            </span>
                          </div>
                          <div className="text-muted small">WCAG ratio: {paletteStats.bestPair.ratio}:1</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        }
        contextPanel={null}
        paletteTray={null}
      />

      <Toast
        show={toast.show}
        onClose={() => setToast({ show: false, message: "" })}
        delay={2500}
        autohide
        style={{
          position: "fixed",
          bottom: "18px",
          right: "18px",
          zIndex: 1200,
          minWidth: "240px",
        }}
      >
        <Toast.Header closeButton>
          <strong className="me-auto">DigiSwatch</strong>
        </Toast.Header>
        <Toast.Body>{toast.message}</Toast.Body>
      </Toast>

      <canvas
        ref={lensCanvasRef}
        className={`position-fixed ${lens.visible ? "" : "d-none"}`}
        style={{
          left: lens.vx,
          top: lens.vy,
          width: 140,
          height: 140,
          pointerEvents: "none",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 6px 18px rgba(0,0,0,.25)",
          zIndex: 9999,
          border: "2px solid rgba(255,255,255,0.8)"
        }}
      />
    </>
  );
}

function Dropper({ d, idx, active, onPointerDown, onToggleLock }) {
  const { x, y, color, locked } = d;
  return (
    <div
      className={`ie-dropper ${active ? "active" : ""}`}
      style={{ left: x, top: y, background: color }}
      onMouseDown={(e) => {
        e.preventDefault();
        if (!locked) onPointerDown();
      }}
      onTouchStart={(e) => {
        e.preventDefault();
        if (!locked) onPointerDown();
      }}
      title={locked ? "Locked — click lock to unlock" : "Drag to sample"}
    >
      <div className="ie-dropper-ring" />
      <div className="ie-dropper-nub" />
      <div className="ie-dropper-lock">
        <span className="me-2">#{idx + 1}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock();
          }}
          className="btn btn-sm btn-dark py-0 px-1"
          style={{ fontSize: 10, lineHeight: 1 }}
        >
          {locked ? "Unlock" : "Lock"}
        </button>
      </div>
    </div>
  );
}
