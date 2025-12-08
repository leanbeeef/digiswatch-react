import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import html2canvas from 'html2canvas';
import BoardCanvas from './BoardCanvas';
import type { BoardItem, BoardItemType, MoodBoard } from './types';
import { loadCurrentMoodBoard, saveCurrentMoodBoard } from './storage';
import { useImageUpload } from './useImageUpload';

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
const MIN_SIZE = 80;
const GRID_SIZE = 20;

const createInitialBoard = (): MoodBoard => {
  const timestamp = new Date().toISOString();
  const starterItems: BoardItem[] = [
    {
      id: 'starter-color',
      type: 'color',
      colorHex: '#7c3aed',
      label: 'Accent violet',
      x: 120,
      y: 120,
      width: 220,
      height: 220,
      zIndex: 1,
      rotation: 0,
    },
    {
      id: 'starter-text',
      type: 'text',
      content: 'Drag me around.\nAdd more colors, images, or notes next.',
      align: 'left',
      fontFamily: 'Inter, sans-serif',
      fontSize: 16,
      textColor: '#111827',
      textBgTransparent: false,
      x: 380,
      y: 100,
      width: 280,
      height: 160,
      zIndex: 2,
      rotation: 0,
    },
    {
      id: 'starter-image',
      type: 'image',
      src: 'https://images.pexels.com/photos/262508/pexels-photo-262508.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1200',
      alt: 'Starter inspiration',
      x: 720,
      y: 180,
      width: 300,
      height: 220,
      zIndex: 3,
      rotation: 0,
    },
  ];
  return {
    id: 'current',
    name: 'Mood board',
    createdAt: timestamp,
    updatedAt: timestamp,
    items: starterItems,
  };
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const SHAPES = [
  { id: 'shape-rect', label: 'Rectangle', color: '#111827', radius: 4, width: 240, height: 140 },
  { id: 'shape-pill', label: 'Pill', color: '#0d6efd', radius: 32, width: 260, height: 120 },
  { id: 'shape-circle', label: 'Circle', color: '#f97316', radius: 9999, width: 180, height: 180 },
  { id: 'shape-square', label: 'Square', color: '#10b981', radius: 12, width: 200, height: 200 },
  { id: 'shape-card', label: 'Card', color: '#f8fafc', radius: 16, width: 320, height: 180, borderColor: '#e2e8f0' },
];

const TEMPLATES = [
  {
    id: 'template-duo',
    label: 'Duo image + text',
    build: (add: (item: BoardItem) => void) => {
      const now = Date.now();
      add({
        id: `template-img-${now}`,
        type: 'image',
        src: 'https://images.pexels.com/photos/2698519/pexels-photo-2698519.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1200',
        alt: 'Template image',
        x: 140,
        y: 140,
        width: 360,
        height: 260,
        zIndex: 1,
        rotation: 0,
      });
      add({
        id: `template-text-${now}`,
        type: 'text',
        content: '<strong>Headline</strong><br/>Supporting copy goes here.',
        align: 'left',
        fontFamily: 'Inter, sans-serif',
        fontSize: 18,
        textColor: '#0f172a',
        textBgTransparent: true,
        x: 540,
        y: 180,
        width: 320,
        height: 160,
        zIndex: 2,
        rotation: 0,
      });
    },
  },
  {
    id: 'template-grid',
    label: '3-up grid',
    build: (add: (item: BoardItem) => void) => {
      const colors = ['#f97316', '#22c55e', '#6366f1'];
      colors.forEach((c, idx) => {
        add({
          id: `template-color-${Date.now()}-${idx}`,
          type: 'color',
          colorHex: c,
          label: c.toUpperCase(),
          x: 120 + idx * 220,
          y: 140,
          width: 180,
          height: 240,
          zIndex: 1 + idx,
          rotation: 0,
        });
      });
    },
  },
];

const MoodBoardPage: React.FC = () => {
  const [board, setBoard] = useState<MoodBoard>(() => loadCurrentMoodBoard() || createInitialBoard());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { upload, status: uploadStatus, error: uploadError } = useImageUpload();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    saveCurrentMoodBoard(board);
  }, [board]);

  const itemCount = board.items.length;
  const selectedItem = selectedIds.length ? board.items.find((i) => i.id === selectedIds[0]) || null : null;

  const sortedItems = useMemo(
    () => [...board.items].sort((a, b) => a.zIndex - b.zIndex),
    [board.items]
  );

  const createItem = (type: BoardItemType, payload: Partial<BoardItem>) => {
    const now = new Date().toISOString();
    const newId = `${type}-${Date.now()}`;

    setBoard((prev) => {
      const nextZ = Math.max(0, ...prev.items.map((i) => i.zIndex), 0) + 1;
      const base: BoardItem = {
        id: newId,
        type,
        x: 80,
        y: 80,
        width: 220,
        height: 160,
        zIndex: nextZ,
        ...payload,
      } as BoardItem;

      return {
        ...prev,
        items: [...prev.items, base],
        updatedAt: now,
      };
    });
    setSelectedIds([newId]);
  };

  const updateItem = (id: string, patch: Partial<BoardItem>) => {
    setBoard((prev) => {
      const items = prev.items.map((item) => {
        if (item.id !== id) return item;
        return { ...item, ...patch };
      });
      return { ...prev, items, updatedAt: new Date().toISOString() };
    });
  };

  const snap = (val: number) => Math.round(val / GRID_SIZE) * GRID_SIZE;

  const handleMoveItem = (id: string, nextX: number, nextY: number) => {
    setBoard((prev) => {
      const items = prev.items.map((item) => {
        if (item.id !== id) return item;
        const snappedX = snap(nextX);
        const snappedY = snap(nextY);
        const safeX = clamp(snappedX, 0, Math.max(0, CANVAS_WIDTH - item.width));
        const safeY = clamp(snappedY, 0, Math.max(0, CANVAS_HEIGHT - item.height));
        return { ...item, x: safeX, y: safeY };
      });
      return { ...prev, items, updatedAt: new Date().toISOString() };
    });
  };

  const handleRotateItem = (id: string, rotation: number) => {
    updateItem(id, { rotation });
  };

  const handleResizeItem = (id: string, x: number, y: number, width: number, height: number) => {
    setBoard((prev) => {
      const items = prev.items.map((item) => {
        if (item.id !== id) return item;

        let nextX = snap(x);
        let nextY = snap(y);
        let nextW = snap(width);
        let nextH = snap(height);

        // Clamp to canvas bounds
        if (nextX < 0) {
          nextW += nextX;
          nextX = 0;
        }
        if (nextY < 0) {
          nextH += nextY;
          nextY = 0;
        }

        const maxRight = CANVAS_WIDTH;
        const maxBottom = CANVAS_HEIGHT;

        if (nextX + nextW > maxRight) {
          nextW = maxRight - nextX;
        }

        if (nextY + nextH > maxBottom) {
          nextH = maxBottom - nextY;
        }

        nextW = Math.max(MIN_SIZE, nextW);
        nextH = Math.max(MIN_SIZE, nextH);

        return { ...item, x: nextX, y: nextY, width: nextW, height: nextH };
      });

      return { ...prev, items, updatedAt: new Date().toISOString() };
    });
  };

  const bringToFront = (id: string) => {
    const maxZ = Math.max(0, ...board.items.map((i) => i.zIndex), 0) + 1;
    updateItem(id, { zIndex: maxZ });
  };

  const deleteItem = (id: string) => {
    setBoard((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleAddText = () => {
    createItem('text', {
      content: 'New note',
      fontFamily: 'Inter, sans-serif',
      fontSize: 16,
      textColor: '#111827',
      textBgTransparent: false,
      width: 260,
      height: 160,
      x: 120,
      y: 120,
      rotation: 0,
    });
  };

  const handleAddColor = (hex: string) => {
    const normalized = hex.startsWith('#') ? hex : `#${hex}`;
    createItem('color', {
      colorHex: normalized,
      width: 180,
      height: 180,
      x: 160,
      y: 160,
      label: normalized.toUpperCase(),
      rotation: 0,
    });
  };

  const handleUploadFile = async (file: File | null) => {
    if (!file) return;
    try {
      const url = await upload(file);
      setYourLibrary((prev) => [url, ...prev].slice(0, 50));
      createItem('image', {
        src: url,
        alt: 'Mood board image',
        width: 320,
        height: 220,
        x: 200,
        y: 200,
        rotation: 0,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const [colorInput, setColorInput] = useState('#7c3aed');
  const [activeLibraryTab, setActiveLibraryTab] = useState<'images' | 'shapes' | 'templates' | 'your'>('images');
  const [activeToolTab, setActiveToolTab] = useState<'tools' | 'library'>('tools');
  const [yourLibrary, setYourLibrary] = useState<string[]>([]);
  const [assetSearch, setAssetSearch] = useState('interior design');
  const [assetResults, setAssetResults] = useState<string[]>([]);
  const [assetLoading, setAssetLoading] = useState(false);
  const [assetError, setAssetError] = useState<string | null>(null);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAlignMenu, setShowAlignMenu] = useState(false);
  const [showGroupMenu, setShowGroupMenu] = useState(false);

  const handleSelectItem = (id: string | null, multi?: boolean) => {
    if (!id) {
      setSelectedIds([]);
      return;
    }
    if (multi) {
      setSelectedIds((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        return [...prev, id];
      });
    } else {
      setSelectedIds([id]);
    }
  };

  const handleMoveGroup = (groupId: string, dx: number, dy: number) => {
    setBoard((prev) => {
      const items = prev.items.map((item) => {
        if (item.groupId !== groupId) return item;
        const safeX = clamp(item.x + dx, 0, Math.max(0, CANVAS_WIDTH - item.width));
        const safeY = clamp(item.y + dy, 0, Math.max(0, CANVAS_HEIGHT - item.height));
        return { ...item, x: safeX, y: safeY };
      });
      return { ...prev, items, updatedAt: new Date().toISOString() };
    });
  };

  const handleAddLibraryAsset = (assetSrc: string) => {
    createItem('image', {
      src: assetSrc,
      alt: 'Library asset',
      width: 320,
      height: 220,
      x: 220,
      y: 220,
      rotation: 0,
    });
  };

  const searchPexels = async () => {
    const apiKey = import.meta.env.VITE_PEXELS_API_KEY;
    if (!apiKey) {
      setAssetError('Missing PEXELS API key (set VITE_PEXELS_API_KEY).');
      return;
    }
    setAssetLoading(true);
    setAssetError(null);
    try {
      const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(assetSearch)}&per_page=24`, {
        headers: {
          Authorization: apiKey as string,
        },
      });
      if (!res.ok) {
        throw new Error(`Pexels search failed (${res.status})`);
      }
      const data = await res.json();
      const urls: string[] = (data?.photos || []).map((p: any) => p?.src?.large || p?.src?.medium).filter(Boolean);
      setAssetResults(urls);
    } catch (err: any) {
      setAssetError(err?.message || 'Search failed');
    } finally {
      setAssetLoading(false);
    }
  };

  const handleAddShape = (shapeId: string) => {
    const shape = SHAPES.find((s) => s.id === shapeId);
    if (!shape) return;
    createItem('color', {
      colorHex: shape.color,
      label: undefined,
      width: shape.width,
      height: shape.height,
      x: 200,
      y: 200,
      rotation: 0,
      radius: shape.radius,
      borderColor: shape.borderColor,
    });
  };

  const applyTemplate = (templateId: string) => {
    const tpl = TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    const now = new Date().toISOString();
    setBoard((prev) => {
      const items: BoardItem[] = [];
      const add = (item: BoardItem) => items.push(item);
      tpl.build(add);
      return {
        ...prev,
        items: [...prev.items, ...items],
        updatedAt: now,
      };
    });
  };

  const handleExportPng = async () => {
    const node = boardRef.current;
    if (!node) return;
    const canvas = await html2canvas(node, { backgroundColor: '#ffffff', scale: 2 });
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'mood-board.png';
    link.click();
  };

  const alignSelected = (direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    const ids = selectedIds;
    if (ids.length < 2) return;
    const selectedItems = board.items.filter((i) => ids.includes(i.id));
    if (!selectedItems.length) return;
    const minX = Math.min(...selectedItems.map((i) => i.x));
    const maxX = Math.max(...selectedItems.map((i) => i.x + i.width));
    const minY = Math.min(...selectedItems.map((i) => i.y));
    const maxY = Math.max(...selectedItems.map((i) => i.y + i.height));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setBoard((prev) => {
      const items = prev.items.map((item) => {
        if (!ids.includes(item.id)) return item;
        let nextX = item.x;
        let nextY = item.y;
        if (direction === 'left') nextX = minX;
        if (direction === 'right') nextX = maxX - item.width;
        if (direction === 'center') nextX = centerX - item.width / 2;
        if (direction === 'top') nextY = minY;
        if (direction === 'bottom') nextY = maxY - item.height;
        if (direction === 'middle') nextY = centerY - item.height / 2;
        return {
          ...item,
          x: snap(clamp(nextX, 0, CANVAS_WIDTH - item.width)),
          y: snap(clamp(nextY, 0, CANVAS_HEIGHT - item.height)),
        };
      });
      return { ...prev, items, updatedAt: new Date().toISOString() };
    });
  };

  const groupSelected = () => {
    if (selectedIds.length < 2) return;
    const groupId = `group-${Date.now()}`;
    setBoard((prev) => {
      const items = prev.items.map((item) => {
        if (!selectedIds.includes(item.id)) return item;
        return { ...item, groupId };
      });
      return { ...prev, items, updatedAt: new Date().toISOString() };
    });
  };

  const ungroupSelected = () => {
    if (!selectedIds.length) return;
    setBoard((prev) => {
      const items = prev.items.map((item) => {
        if (!selectedIds.includes(item.id)) return item;
        const patch: Partial<BoardItem> = { ...item };
        delete (patch as any).groupId;
        return { ...patch };
      });
      return { ...prev, items, updatedAt: new Date().toISOString() };
    });
  };

  return (
    <div className="container-fluid py-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h1 className="h4 mb-1">Mood board</h1>
          <p className="text-muted mb-0">Arrange colors, images, notes.</p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="btn-group">
            <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))}>-</button>
            <span className="btn btn-outline-secondary btn-sm disabled">{Math.round(zoom * 100)}%</span>
            <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2)))}>+</button>
          </div>
          <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>Reset view</button>
          <div className="position-relative">
            <button
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center justify-content-center"
              type="button"
              onClick={() => setShowLayerMenu((s) => !s)}
            >
              <i className="bi bi-layers"></i>
            </button>
            {showLayerMenu && (
              <div className="dropdown-menu show p-2" style={{ minWidth: 220, maxHeight: 240, overflowY: 'auto' }}>
                <div className="small text-muted mb-1">Layers</div>
                {sortedItems.map((item) => (
                  <button
                    key={item.id}
                    className={`dropdown-item ${selectedIds.includes(item.id) ? 'active' : ''}`}
                    type="button"
                    onClick={() => { handleSelectItem(item.id); setShowLayerMenu(false); }}
                  >
                    {item.type.toUpperCase()} - {item.id}
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedIds.length > 1 && (
            <div className="position-relative">
              <button
                className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center justify-content-center"
                type="button"
                onClick={() => setShowAlignMenu((s) => !s)}
              >
                <i className="bi bi-layout-three-columns"></i>
              </button>
              {showAlignMenu && (
                <div className="dropdown-menu show p-2" style={{ minWidth: 180 }}>
                  <div className="small text-muted mb-1">Align selected</div>
                  <div className="d-grid gap-1">
                    <button className="dropdown-item" type="button" onClick={() => { alignSelected('left'); setShowAlignMenu(false); }}>Left</button>
                    <button className="dropdown-item" type="button" onClick={() => { alignSelected('center'); setShowAlignMenu(false); }}>Horizontal center</button>
                    <button className="dropdown-item" type="button" onClick={() => { alignSelected('right'); setShowAlignMenu(false); }}>Right</button>
                    <button className="dropdown-item" type="button" onClick={() => { alignSelected('top'); setShowAlignMenu(false); }}>Top</button>
                    <button className="dropdown-item" type="button" onClick={() => { alignSelected('middle'); setShowAlignMenu(false); }}>Vertical center</button>
                    <button className="dropdown-item" type="button" onClick={() => { alignSelected('bottom'); setShowAlignMenu(false); }}>Bottom</button>
                  </div>
                </div>
              )}
            </div>
          )}
          {selectedIds.length > 1 && (
            <div className="position-relative">
              <button
                className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center justify-content-center"
                type="button"
                onClick={() => setShowGroupMenu((s) => !s)}
              >
                <i className="bi bi-collection"></i>
              </button>
              {showGroupMenu && (
                <div className="dropdown-menu show p-2" style={{ minWidth: 140 }}>
                  <button className="dropdown-item" type="button" onClick={() => { groupSelected(); setShowGroupMenu(false); }}>Group</button>
                  <button className="dropdown-item" type="button" onClick={() => { ungroupSelected(); setShowGroupMenu(false); }}>Ungroup</button>
                </div>
              )}
            </div>
          )}
          <div className="position-relative">
            <button
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center justify-content-center"
              type="button"
              onClick={() => setShowExportMenu((s) => !s)}
            >
              <i className="bi bi-download"></i>
            </button>
            {showExportMenu && (
              <div className="dropdown-menu show p-2" style={{ minWidth: 160 }}>
                <button className="dropdown-item" type="button" onClick={() => { handleExportPng(); setShowExportMenu(false); }}>
                  Export PNG
                </button>
                <div className="dropdown-item text-muted small">SVG/PDF coming soon</div>
              </div>
            )}
          </div>
          <span className="badge bg-secondary">{itemCount} items</span>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-3 col-xl-2">
          <div className="tool-panel h-100 d-flex flex-column gap-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-uppercase small text-muted">Workspace</div>
                <div className="fw-semibold text-dark">Tools & Library</div>
              </div>
              <i className="bi bi-stars text-primary fs-5"></i>
            </div>

            <ul className="nav nav-pills mb-2">
              {['tools', 'library'].map((tab) => (
                <li className="nav-item" key={tab}>
                  <button
                    className={`nav-link ${activeToolTab === tab ? 'active' : ''} text-capitalize`}
                    type="button"
                    onClick={() => setActiveToolTab(tab as any)}
                  >
                    {tab}
                  </button>
                </li>
              ))}
            </ul>

            {activeToolTab === 'tools' && (
              <div className="d-flex flex-column gap-3 flex-grow-1">
                <div className="d-grid gap-2">
                  <button className="btn btn-primary w-100" type="button" onClick={handleAddText}>
                    <i className="bi bi-fonts me-1"></i> Add text
                  </button>
                  <button className="btn btn-outline-primary w-100" type="button" onClick={() => handleAddColor(colorInput)}>
                    <i className="bi bi-palette me-1"></i> Add color
                  </button>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="color"
                      className="form-control form-control-color flex-shrink-0"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      title="Pick color"
                    />
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      placeholder="#aabbcc"
                    />
                  </div>
                </div>

                <div className="tool-section">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <label className="form-label mb-0 fw-semibold">Upload image</label>
                    {uploadStatus === 'uploading' ? <span className="badge bg-light text-muted">Uploading...</span> : null}
                  </div>
                  <div className="d-flex gap-2">
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={(e) => handleUploadFile(e.target.files?.[0] || null)}
                      disabled={uploadStatus === 'uploading'}
                    />
                  </div>
                  {uploadError ? <div className="text-danger small mt-1">{uploadError}</div> : null}
                </div>
              </div>
            )}

            {activeToolTab === 'library' && (
              <div className="tool-section flex-grow-1 d-flex flex-column">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h3 className="h6 text-uppercase text-muted mb-0">Library</h3>
                  <i className="bi bi-collection"></i>
                </div>
                <ul className="nav nav-pills mb-2">
                  {['images', 'shapes', 'templates', 'your'].map((tab) => (
                    <li className="nav-item" key={tab}>
                      <button
                        className={`nav-link ${activeLibraryTab === tab ? 'active' : ''} text-capitalize`}
                        type="button"
                        onClick={() => setActiveLibraryTab(tab as any)}
                      >
                        {tab}
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="library-scroll flex-grow-1">
                  {activeLibraryTab === 'images' && (
                    <>
                      <div className="d-flex gap-2 mb-2">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={assetSearch}
                          onChange={(e) => setAssetSearch(e.target.value)}
                          placeholder="Search Pexels (e.g. interior design)"
                        />
                        <button
                          className="btn btn-primary btn-sm"
                          type="button"
                          onClick={searchPexels}
                          disabled={assetLoading}
                        >
                          {assetLoading ? '...' : <i className="bi bi-search"></i>}
                        </button>
                      </div>
                      {assetError ? <div className="text-danger small mb-2">{assetError}</div> : null}
                      {assetResults.length === 0 ? (
                        <div className="text-muted small">Search Pexels to load images.</div>
                      ) : (
                        <div className="masonry-grid">
                          {assetResults.map((src, idx) => (
                            <div
                              key={`img-${idx}`}
                              className="masonry-item"
                              role="button"
                              tabIndex={0}
                              onClick={() => handleAddLibraryAsset(src)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddLibraryAsset(src)}
                              style={{ cursor: 'pointer' }}
                            >
                              <img src={src} alt="Asset" className="w-100 rounded-3" style={{ display: 'block', width: '100%' }} />
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {activeLibraryTab === 'shapes' && (
                    SHAPES.map((shape) => (
                      <div key={shape.id} className="d-flex align-items-center gap-2 border rounded-3 p-2 mb-2">
                        <div
                          style={{
                            width: 52,
                            height: 52,
                            background: shape.color,
                            borderRadius: shape.radius,
                            border: shape.borderColor ? `1px solid ${shape.borderColor}` : undefined,
                          }}
                        />
                        <div className="flex-grow-1 d-flex align-items-center justify-content-between">
                          <div className="small fw-semibold">{shape.label}</div>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            type="button"
                            onClick={() => handleAddShape(shape.id)}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ))
                  )}

                  {activeLibraryTab === 'templates' && (
                    TEMPLATES.map((tpl) => (
                      <div key={tpl.id} className="d-flex align-items-center gap-2 border rounded-3 p-2 mb-2">
                        <div className="flex-grow-1">
                          <div className="small fw-semibold mb-1">{tpl.label}</div>
                          <div className="text-muted small">Adds multiple items</div>
                        </div>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          type="button"
                          onClick={() => applyTemplate(tpl.id)}
                        >
                          Add
                        </button>
                      </div>
                    ))
                  )}

                  {activeLibraryTab === 'your' && (
                    yourLibrary.length === 0 ? (
                      <div className="text-muted small">Upload images to see them here.</div>
                    ) : (
                      <div className="masonry-grid">
                        {yourLibrary.map((src, idx) => (
                          <div
                            key={`${src}-${idx}`}
                            className="masonry-item"
                            role="button"
                            tabIndex={0}
                            onClick={() => handleAddLibraryAsset(src)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddLibraryAsset(src)}
                            style={{ cursor: 'pointer' }}
                          >
                            <img src={src} alt="Your asset" className="w-100 rounded-3" style={{ display: 'block', width: '100%' }} />
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="col-12 col-lg-7 col-xl-8">
          <div
            className="border rounded-3 bg-light position-relative"
            style={{ minHeight: CANVAS_HEIGHT, overflow: 'hidden' }}
            onMouseDown={(e) => {
              if (e.button === 1 || e.nativeEvent.metaKey || e.nativeEvent.ctrlKey || e.nativeEvent.altKey || e.nativeEvent.shiftKey || e.nativeEvent.buttons === 4 || e.nativeEvent.buttons === 2) return;
              if (e.buttons === 1 && e.nativeEvent.shiftKey === false && e.nativeEvent.ctrlKey === false && e.nativeEvent.metaKey === false) {
                // allow selection clearing
              }
            }}
          >
            <div
              ref={boardRef}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                backgroundImage:
                  'linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px)',
                backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
              }}
              onMouseDown={(e) => {
                if (e.button === 1 || e.nativeEvent.altKey) {
                  setIsPanning(true);
                  setLastPanPoint({ x: e.clientX, y: e.clientY });
                } else {
                  setSelectedIds([]);
                }
              }}
              onMouseMove={(e) => {
                if (!isPanning || !lastPanPoint) return;
                const dx = e.clientX - lastPanPoint.x;
                const dy = e.clientY - lastPanPoint.y;
                setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
                setLastPanPoint({ x: e.clientX, y: e.clientY });
              }}
              onMouseUp={() => {
                setIsPanning(false);
                setLastPanPoint(null);
              }}
              onMouseLeave={() => {
                setIsPanning(false);
                setLastPanPoint(null);
              }}
            >
              <DndProvider backend={HTML5Backend}>
                <BoardCanvas
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  items={sortedItems}
                  selectedIds={selectedIds}
                  onSelect={handleSelectItem}
                  onMoveItem={handleMoveItem}
                  onMoveGroup={handleMoveGroup}
                  onResizeItem={handleResizeItem}
                  onUpdateItem={updateItem}
                  onDeleteItem={(id) => {
                    deleteItem(id);
                    setSelectedIds((prev) => prev.filter((x) => x !== id));
                  }}
                  onBringToFront={bringToFront}
                  onRotateItem={handleRotateItem}
                  zoom={zoom}
                  gridSize={GRID_SIZE}
                />
              </DndProvider>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-2 col-xl-2">
          <div className="border rounded-3 p-3 bg-white h-100">
            <h2 className="h6 text-uppercase text-muted mb-3">Inspector</h2>
            {selectedItem ? (
              <div className="d-flex flex-column gap-3">
                <div className="small text-muted">ID: {selectedItem.id}</div>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-secondary btn-sm w-100" type="button" onClick={() => bringToFront(selectedItem.id)}>Bring to front</button>
                  <button className="btn btn-outline-danger btn-sm w-100" type="button" onClick={() => { deleteItem(selectedItem.id); setSelectedIds((prev) => prev.filter((x) => x !== selectedItem.id)); }}>Delete</button>
                </div>

                {selectedItem.type === 'text' && (
                  <>
                    <div>
                      <label className="form-label small fw-semibold">Font family</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={selectedItem.fontFamily || ''}
                        onChange={(e) => updateItem(selectedItem.id, { fontFamily: e.target.value || undefined })}
                        placeholder="Google font, e.g. Inter"
                      />
                    </div>
                    <div className="d-flex gap-2">
                      <div className="flex-grow-1">
                        <label className="form-label small fw-semibold">Size</label>
                        <input
                          type="number"
                          min={8}
                          max={120}
                          className="form-control form-control-sm"
                          value={selectedItem.fontSize || 16}
                          onChange={(e) => updateItem(selectedItem.id, { fontSize: Number(e.target.value) || 16 })}
                        />
                      </div>
                      <div>
                        <label className="form-label small fw-semibold">Color</label>
                        <input
                          type="color"
                          className="form-control form-control-color"
                          value={selectedItem.textColor || '#111827'}
                          onChange={(e) => updateItem(selectedItem.id, { textColor: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                      <span className="small text-muted">Align</span>
                      <div className="btn-group btn-group-sm">
                        {(['left', 'center', 'right'] as const).map((align) => (
                          <button
                            key={align}
                            className={`btn btn-outline-secondary ${selectedItem.align === align ? 'active' : ''}`}
                            type="button"
                            onClick={() => updateItem(selectedItem.id, { align })}
                          >
                            {align === 'left' && <i className="bi bi-text-left"></i>}
                            {align === 'center' && <i className="bi bi-text-center"></i>}
                            {align === 'right' && <i className="bi bi-text-right"></i>}
                          </button>
                        ))}
                      </div>
                      <div className="form-check ms-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="text-bg-toggle"
                          checked={!selectedItem.textBgTransparent}
                          onChange={(e) => updateItem(selectedItem.id, { textBgTransparent: !e.target.checked })}
                        />
                        <label className="form-check-label small" htmlFor="text-bg-toggle">Fill background</label>
                      </div>
                    </div>
                  </>
                )}

                {selectedItem.type === 'color' && (
                  <div>
                    <label className="form-label small fw-semibold">Label</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={selectedItem.label || ''}
                      onChange={(e) => updateItem(selectedItem.id, { label: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                )}

                {selectedItem.type === 'image' && (
                  <div>
                    <label className="form-label small fw-semibold">Alt text</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={selectedItem.alt || ''}
                      onChange={(e) => updateItem(selectedItem.id, { alt: e.target.value })}
                      placeholder="Describe image"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted small">Select an item to edit its properties.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodBoardPage;
