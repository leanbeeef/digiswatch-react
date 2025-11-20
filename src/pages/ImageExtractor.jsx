import { useRef, useState, useEffect, useMemo, useLayoutEffect } from "react";
import namer from "color-namer";
import tinycolor from "tinycolor2";
import defaultImage from "../assets/example.jpeg"; // keep your existing asset

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
  const maxDroppers = 10;

  // Computed square size for right-column swatches so the page never scrolls
  const tileSize = useMemo(() => {
    const gaps = Math.max(0, count - 1) * 3; // 8px gap between squares
    const s = Math.floor((availH - gaps) / Math.max(1, count));
    return Math.max(120, s || 120);
  }, [availH, count]);

  // Keep a Set of hex colors to bias initial placement toward unique swatches
  const sampledInitColors = useMemo(() => new Set(), [imageURL]);

  // Helper: bottom navbar height
  const getBottomH = () => document.querySelector("nav.fixed-bottom")?.offsetHeight || 0;

  // Fit canvases to viewport without page scroll
  const layoutAndDraw = () => {
    const vis = visibleCanvasRef.current;
    const hid = hiddenCanvasRef.current;
    const lensCanvas = lensCanvasRef.current;
    const img = imgRef.current;
    if (!vis || !hid || !img) return;

    const vctx = vis.getContext("2d");
    const hctx = hid.getContext("2d");

    // Available height = viewport - container top - bottom nav - small padding
    const container = vis.parentElement; // .canvas-shell
    const rectTop = container.getBoundingClientRect().top;
    const bottomH = getBottomH();
    const availableHeight = Math.min(500, Math.max(120, window.innerHeight - rectTop - bottomH - 16));
    setAvailH(availableHeight);

    // Width constraint from container
    const maxW = container.clientWidth;

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
    const offset = 16;
    let lx = vx + offset;
    let ly = vy - (lensCanvas.height + offset);
    const minX = 8;
    const minY = 8;
    const maxX = window.innerWidth - lensCanvas.width - 8;
    const maxY = window.innerHeight - getBottomH() - lensCanvas.height - 8;
    if (ly < minY) ly = vy + offset; // flip below if there's no room above
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
    <div className="w-100" style={{ height: "100vh", overflow: "hidden" }}>
      {/* Main */}
      <div className="container px-4 py-3" style={{ height: `calc(100vh - ${getBottomH()}px)` }}>
        <div className="row g-3" style={{ height: "100%" }}>
          {/* Left: Canvas with overlay */}
          <div className="col-md-7 d-flex" style={{ minHeight: 0 }}>
            <div className="canvas-shell position-relative rounded-3 shadow-sm flex-grow-1 d-flex justify-content-center align-items-center" style={{ background: "#f6f7fb", height: availH, overflow: "hidden" }}>
              <canvas ref={visibleCanvasRef} className="d-block rounded-3" style={{ display: "block" }} />

              {/* Hidden canvas for accurate sampling (must be in the DOM) */}
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

                {/* Zoom lens canvas */}
                <canvas
                  ref={lensCanvasRef}
                  className={`position-absolute ${lens.visible ? "" : "d-none"}`}
                  style={{
                    left: lens.vx,
                    top: lens.vy,
                    width: 140,
                    height: 140,
                    pointerEvents: "none",
                    background: "#fff",
                    borderRadius: 12,
                    boxShadow: "0 6px 18px rgba(0,0,0,.25)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right: Color list */}
          <div className="col-md-5 d-flex py-5" style={{ minHeight: 0 }}>
            <div className="d-flex flex-wrap w-100  align-items-start" style={{ maxHeight: availH, overflow: "hidden", gap: 8, flex: 1, alignContent: 'start' }}>
              {extracted.map(({ color, name, id }, i) => (
                <div key={id} className="position-relative d-flex align-items-center justify-content-center" style={{ width: tileSize, height: tileSize, background: color, color: tinycolor(color).isDark() ? "#fff" : "#111", boxShadow: "0 2px 8px rgba(0,0,0,.2)", borderRadius: 6 }}>
                  <div className="position-absolute top-0 start-0 m-1 badge bg-light text-dark">{i + 1}</div>
                  <div className="position-absolute bottom-0 start-0 end-0 px-2 py-1" style={{ fontSize: 11, background: "rgba(0,0,0,0.25)", color: "#fff" }}>
                    <span className="text-truncate d-block" title={name}>{name}</span>
                    <span className="opacity-75">{color}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <nav className="navbar navbar-light bg-primary fixed-bottom py-2">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <input type="file" className="form-control form-control-sm w-50" onChange={handleUpload} />

          <div className="d-flex align-items-center bg-white rounded-pill px-2 py-1 gap-2 shadow-sm">
            <button className="btn btn-sm btn-outline-secondary" onClick={removeDropper} disabled={count <= 2}>
              −
            </button>
            <span className="navbar-text small">Current Droppers: <strong>{count}</strong></span>
            <button className="btn btn-sm btn-outline-secondary" onClick={addDropper} disabled={count >= maxDroppers}>
              +
            </button>
            <button className="btn btn-sm btn-outline-primary ms-2" onClick={randomizeDroppers}>
              Randomize
            </button>
          </div>
        </div>
      </nav>

      <style>{`
        html, body, #root { height: 100%; }
        body { overflow: hidden; }
        .dropper {
          width: 26px; height: 26px; border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,.25);
          border: 2px solid #fff; cursor: grab; position: absolute;
          transform: translate(-50%, -50%);
        }
        .dropper.active { cursor: grabbing; }
        .dropper .ring { position:absolute; inset:-6px; border-radius:50%; border:2px dashed rgba(0,0,0,.25); }
        .dropper .nub { position:absolute; bottom:-10px; left:50%; transform:translateX(-50%);
          width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #fff; filter: drop-shadow(0 1px 2px rgba(0,0,0,.2)); }
        .dropper .lock { position:absolute; top:-28px; left:50%; transform:translateX(-50%);
          background:#111; color:#fff; border-radius:10px; font-size:10px; line-height:1; padding:4px 6px; white-space:nowrap; }
      `}</style>
    </div>
  );
}

function Dropper({ d, idx, active, onPointerDown, onToggleLock }) {
  const { x, y, color, locked } = d;
  return (
    <div
      className={`dropper ${active ? "active" : ""}`}
      style={{ left: x, top: y, background: color, pointerEvents: locked ? "auto" : "auto" }}
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
      <div className="ring" />
      <div className="nub" />
      <div className="lock" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ opacity: 0.8 }}>#{idx + 1}</span>
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
