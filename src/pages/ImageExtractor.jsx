import { useRef, useState, useEffect, useMemo } from "react";
import namer from "color-namer";
import tinycolor from "tinycolor2";
import defaultImage from "../assets/example.jpeg"; // keep your existing asset

/**
 * ImageColorExtractor — redesigned with draggable eyedroppers per sampled color
 * + Zoom loupe with crosshair to aid precise picking
 */
export default function ImageColorExtractor() {
  const visibleCanvasRef = useRef(null);
  const hiddenCanvasRef = useRef(null);
  const overlayRef = useRef(null);
  const lensCanvasRef = useRef(null); // magnifier canvas

  const [imageURL, setImageURL] = useState(defaultImage);
  const [droppers, setDroppers] = useState([]); // {id,x,y,color,name,locked}
  const [activeId, setActiveId] = useState(null);
  const [count, setCount] = useState(5);
  const [lens, setLens] = useState({ visible: false, vx: 0, vy: 0 });
  const maxDroppers = 10;

  // Keep a Set of hex colors to bias initial placement toward unique swatches
  const sampledInitColors = useMemo(() => new Set(), [imageURL]);

  // Load image into canvases
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // helps with local/dev cases
    img.src = imageURL;
    img.onload = () => {
      const vis = visibleCanvasRef.current;
      const hid = hiddenCanvasRef.current;
      if (!vis || !hid) return; // guard
      const vctx = vis.getContext("2d");
      const hctx = hid.getContext("2d");

      // Fit the visible canvas to container width, preserving aspect ratio
      const container = vis.parentElement; // .canvas-shell
      const maxW = container.clientWidth;
      const scale = Math.min(1, maxW / img.width);
      vis.width = Math.round(img.width * scale);
      vis.height = Math.round(img.height * scale);
      vctx.clearRect(0, 0, vis.width, vis.height);
      vctx.drawImage(img, 0, 0, vis.width, vis.height);

      // Hidden canvas keeps full-resolution pixels to avoid sampling blur
      hid.width = img.width;
      hid.height = img.height;
      hctx.clearRect(0, 0, hid.width, hid.height);
      hctx.drawImage(img, 0, 0);

      // Prepare lens canvas
      const lensCanvas = lensCanvasRef.current;
      if (lensCanvas) {
        lensCanvas.width = 140;
        lensCanvas.height = 140;
      }

      // Seed droppers fresh on new image
      seedDroppers(count);
    };
  }, [imageURL]);

  // When count changes (and not due to image change), adjust droppers list
  useEffect(() => {
    if (!hiddenCanvasRef.current || !visibleCanvasRef.current) return;
    // Ensure we have exactly `count` droppers
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

  // Draw the zoom lens: sample from hidden canvas around (hx,hy) and draw to lens canvas with crosshair
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
    lctx.drawImage(
      hid,
      sx,
      sy,
      srcSize,
      srcSize,
      0,
      0,
      lensCanvas.width,
      lensCanvas.height
    );

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

    // Border
    lctx.strokeStyle = "rgba(0,0,0,.35)";
    lctx.lineWidth = 2;
    lctx.strokeRect(0.5, 0.5, lensCanvas.width - 1, lensCanvas.height - 1);

    // Position the lens near the pointer (offset so it doesn't cover it)
    const offset = 16;
    setLens({ visible: true, vx: vx + offset, vy: vy - (lensCanvas.height + offset) });
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
          drawLens(hx, hy, clampedX, clampedY);
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

  const toggleLock = (id) =>
    setDroppers((prev) => prev.map((d) => (d.id === id ? { ...d, locked: !d.locked } : d)));

  const copyHex = async (hex) => {
    try {
      await navigator.clipboard.writeText(hex);
    } catch (e) {
      // no-op in environments without clipboard permission
    }
  };

  // Derived list for right column (kept in same order as droppers)
  const extracted = droppers.map(({ color, name, id }) => ({ color, name, id }));

  return (
    <div className="w-full min-h-screen flex flex-col items-center pt-5">
      {/* Main */}
      <div className="container mx-auto px-4 py-6">
        <div className="row g-4">
          {/* Left: Canvas with overlay */}
          <div className="col-md-7">
            <div className="canvas-shell position-relative rounded-3 shadow-sm" style={{ background: "#f6f7fb" }}>
              <canvas ref={visibleCanvasRef} className="d-block w-100 rounded-3" style={{ display: "block" }} />

              {/* Hidden canvas for accurate sampling (must be in the DOM) */}
              <canvas ref={hiddenCanvasRef} className="d-none" aria-hidden="true" />

              {/* Eyedropper overlay */}
              <div ref={overlayRef} className="position-absolute top-0 start-0 w-100 h-100" style={{ pointerEvents: "none" }}>
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
                    borderRadius: 100,
                    boxShadow: "0 6px 18px rgba(0,0,0,.25)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right: Color list */}
          <div className="col-md-5">
            <div className="d-flex flex-column gap-2">
              {extracted.map(({ color, name, id }, i) => (
                <div
                  key={id}
                  className="d-flex align-items-center justify-content-between rounded-3 shadow-sm px-3 py-2"
                  style={{ background: color, color: tinycolor(color).isDark() ? "#fff" : "#111" }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-light text-dark me-2">{i + 1}</span>
                    <div className="fw-semibold text-uppercase small">{name}</div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <code className="small">{color}</code>
                    <button className="btn btn-sm btn-outline-light border-0" onClick={() => copyHex(color)}>
                      Copy
                    </button>
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
            <button className="btn btn-secondary btn-sm rounded-circle" onClick={removeDropper} disabled={count <= 2}>
              −
            </button>
            <span className="navbar-text small">Current Droppers: <strong>{count}</strong></span>
            <button className="btn btn-secondary btn-sm rounded-circle" onClick={addDropper} disabled={count >= maxDroppers}>
              +
            </button>
          </div>
        </div>
      </nav>

      <style>{`
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