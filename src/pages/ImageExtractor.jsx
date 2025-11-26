import { useRef, useState, useEffect, useMemo, useLayoutEffect } from "react";
import namer from "color-namer";
import tinycolor from "tinycolor2";
import defaultImage from "../assets/example.jpeg";
import "../ImageExtractor.css";
import SEO from '../components/SEO';

/**
 * ImageColorExtractor — draggable eyedroppers + zoom lens
 * Now constrained to the viewport height so the page never scrolls.
 */
export default function ImageColorExtractor() {
  const visibleCanvasRef = useRef(null);
  const hiddenCanvasRef = useRef(null);
  const overlayRef = useRef(null);
  const lensCanvasRef = useRef(null); // magnifier canvas
  const imgRef = useRef(null);

  const [imageURL, setImageURL] = useState(defaultImage);
  const [droppers, setDroppers] = useState([]); // {id,x,y,color,name,locked}
  const [activeId, setActiveId] = useState(null);
  const [count, setCount] = useState(5);
  const [lens, setLens] = useState({ visible: false, vx: 0, vy: 0 });
  const [availH, setAvailH] = useState(0); // available content height (px)
  const maxDroppers = 12

  // Computed square size for right-column swatches so the page never scrolls
  const tileSize = useMemo(() => {
    const gaps = Math.max(0, count - 1) * 3; // 8px gap between squares
    const s = Math.floor((availH - gaps) / Math.max(1, count));
    return Math.max(100, s || 100);
  }, [availH, count]);

  // Keep a Set of hex colors to bias initial placement toward unique swatches
  const sampledInitColors = useMemo(() => new Set(), [imageURL]);

  // Helper: bottom navbar height (now floating, so we use a fixed offset)
  const getBottomOffset = () => 100;

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
    setAvailH(availableHeight);

    // Width constraint from container
    const maxW = container.clientWidth - 40; // padding

    // Scale by both constraints, never upscale above 1
    const scale = Math.min(maxW / img.width, availableHeight / img.height, 1);

    // Visible canvas: scaled draw
    vis.width = Math.round(img.width * scale);
    vis.height = Math.round(img.height * scale);
    vctx.clearRect(0, 0, vis.width, vis.height);
    vctx.drawImage(img, 0, 0, vis.width, vis.height);

    // Hidden canvas: full-resolution for accurate sampling
    hid.width = img.width;
    hid.height = img.height;
    hctx.clearRect(0, 0, hid.width, hid.height);
    hctx.drawImage(img, 0, 0);

    // Lens canvas static size
    if (lensCanvas) {
      lensCanvas.width = 140;
      lensCanvas.height = 140;
    }

    // Align overlay to the canvas box so dropper coords match
    alignOverlay();
  };

  // Force overlay alignment after DOM updates (e.g. when availH changes container size)
  useLayoutEffect(() => {
    alignOverlay();
  }, [availH]);

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

    // Normalize to [0,1] then scale to hidden canvas pixels
    const nx = Math.min(Math.max(vx / rect.width, 0), 1);
    const ny = Math.min(Math.max(vy / rect.height, 0), 1);
    const hx = Math.min(Math.max(Math.floor(nx * hid.width), 0), hid.width - 1);
    const hy = Math.min(Math.max(Math.floor(ny * hid.height), 0), hid.height - 1);

    const pixel = hctx.getImageData(hx, hy, 1, 1).data; // [r,g,b,a]
    const color = tinycolor({ r: pixel[0], g: pixel[1], b: pixel[2] }).toHexString();
    const name = namer(color).ntc[0].name;
    return { color, name, hx, hy };
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

  const addDropper = () => setCount((n) => Math.min(maxDroppers, n + 1));
  const removeDropper = () => setCount((n) => Math.max(2, n - 1));

  // Randomize: re-seed droppers with fresh unique positions/colors for current count
  const randomizeDroppers = () => {
    sampledInitColors.clear();
    seedDroppers(count);
  };

  const toggleLock = (id) =>
    setDroppers((prev) => prev.map((d) => (d.id === id ? { ...d, locked: !d.locked } : d)));


  // Derived list for right column (kept in same order as droppers)
  const extracted = droppers.map(({ color, name, id }) => ({ color, name, id }));

  return (
    <div className="w-100 d-flex flex-column" style={{ height: "calc(100vh - 300px)", overflow: "auto", background: "#f3f4f6" }}>
      <SEO
        title="Image to Color Palette Extractor"
        description="Extract beautiful color palettes from any image. Upload your photo and automatically generate a color scheme based on its dominant colors."
        keywords="image color picker, extract colors from image, photo palette generator, color finder, hex code extractor"
        url="/image-extractor"
      />

      {/* Hero Section */}
      <div className="ie-hero flex-shrink-0">
        <div className="ie-hero-title">Image Color Extractor</div>
        <div className="ie-hero-subtitle">
          Drag the droppers to extract precise colors from your image.
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-4 flex-grow-1" style={{ minHeight: 0 }}>
        <div className="row g-4" style={{ height: "calc(100vh - 300px)" }}>

          {/* Left: Canvas Panel */}
          <div className="col-12 col-md-7">
            <div className="ie-glass-panel">
              <div className="ie-canvas-container">
                <canvas ref={visibleCanvasRef} className="d-block rounded-3 shadow-sm" style={{ display: "block" }} />

                {/* Hidden canvas for accurate sampling */}
                <canvas ref={hiddenCanvasRef} className="d-none" aria-hidden="true" />

                {/* Eyedropper overlay */}
                <div ref={overlayRef} className="position-absolute" style={{ pointerEvents: "none" }}>
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

                  {/* Zoom lens canvas moved to root */}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Color List Panel */}
          <div className="col-12 col-md-5">
            <div className="ie-glass-panel">
              <div className="ie-swatch-grid">
                {extracted.map(({ color, name, id }, i) => (
                  <div
                    key={id}
                    className="ie-swatch-card"
                    style={{
                      width: tileSize,
                      height: tileSize,
                      background: color,
                      flexGrow: 1,
                      minWidth: '100px'
                    }}
                    onClick={() => navigator.clipboard.writeText(color)}
                    title="Click to copy hex"
                  >
                    <div className="ie-swatch-badge">#{i + 1}</div>
                    <div className="ie-swatch-info">
                      <div className="fw-bold text-truncate">{name}</div>
                      <div className="opacity-75 font-monospace small">{color}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Controls Bar */}
      <div className="ie-controls-bar">
        <div className="ie-control-group">
          <input
            type="file"
            id="file-upload"
            className="d-none"
            onChange={handleUpload}
            accept="image/*"
          />
          <label htmlFor="file-upload" className="ie-btn ie-btn-primary" style={{ cursor: 'pointer' }}>
            <i className="bi bi-upload"></i> Upload Image
          </label>
        </div>

        <div className="ie-control-group">
          <button className="ie-btn" onClick={removeDropper} disabled={count <= 2}>
            <i className="bi bi-dash-lg"></i>
          </button>
          <span className="fw-bold text-dark" style={{ minWidth: '30px', textAlign: 'center' }}>{count}</span>
          <button className="ie-btn" onClick={addDropper} disabled={count >= maxDroppers}>
            <i className="bi bi-plus-lg"></i>
          </button>
        </div>

        <div className="ie-control-group">
          <button className="ie-btn" onClick={randomizeDroppers}>
            <i className="bi bi-shuffle"></i> Randomize
          </button>
        </div>
      </div>

      {/* Zoom lens canvas - Fixed position to avoid clipping */}
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
    </div>
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
