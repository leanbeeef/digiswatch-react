import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDrag } from 'react-dnd';
import type { BoardItem } from './types';

const DRAG_TYPE = 'BOARD_ITEM';

type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
const TEXT_FONTS = [
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Montserrat', value: '"Montserrat", sans-serif' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
  { label: 'Roboto Mono', value: '"Roboto Mono", monospace' },
];

const computeResize = (
  handle: ResizeHandle,
  rect: { x: number; y: number; width: number; height: number },
  dx: number,
  dy: number
) => {
  let { x, y, width, height } = rect;

  if (handle.includes('e')) {
    width = rect.width + dx;
  }
  if (handle.includes('s')) {
    height = rect.height + dy;
  }
  if (handle.includes('w')) {
    width = rect.width - dx;
    x = rect.x + dx;
  }
  if (handle.includes('n')) {
    height = rect.height - dy;
    y = rect.y + dy;
  }

  if (width < MIN_SIZE) {
    const delta = MIN_SIZE - width;
    if (handle.includes('w')) {
      x -= delta;
    }
    width = MIN_SIZE;
  }

  if (height < MIN_SIZE) {
    const delta = MIN_SIZE - height;
    if (handle.includes('n')) {
      y -= delta;
    }
    height = MIN_SIZE;
  }

  return { x, y, width, height };
};

const loadedFonts = new Set<string>();
const loadGoogleFont = (family: string) => {
  const normalized = family.trim().replace(/['"]/g, '');
  if (!normalized || loadedFonts.has(normalized)) return;
  const href = `https://fonts.googleapis.com/css2?family=${normalized.replace(/\s+/g, '+')}:wght@400;600;700&display=swap`;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
  loadedFonts.add(normalized);
};

type BoardItemViewProps = {
  item: BoardItem;
  selected: boolean;
  onSelect: (id: string, multi?: boolean) => void;
  onResize: (id: string, x: number, y: number, width: number, height: number) => void;
  onUpdate: (id: string, patch: Partial<BoardItem>) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
  onRotate: (id: string, rotation: number) => void;
};

const MIN_SIZE = 80;

const BoardItemView: React.FC<BoardItemViewProps> = ({
  item,
  selected,
  onSelect,
  onResize,
  onUpdate,
  onDelete,
  onBringToFront,
  onRotate,
}) => {
  const richRef = useRef<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const [toolbarHeight, setToolbarHeight] = useState<number>(0);
  const [contentHeight, setContentHeight] = useState<number>(MIN_SIZE);
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: DRAG_TYPE,
    item: { id: item.id, x: item.x, y: item.y },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [item.id, item.x, item.y]);

  const isTransparentText = item.type === 'text' && item.textBgTransparent;
  const radius = item.type === 'color' && typeof item.radius === 'number' ? item.radius : 8;

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: item.x,
    top: item.y,
    width: item.width,
    height: item.height,
    zIndex: item.zIndex,
    border: isTransparentText ? (selected ? '2px solid #0d6efd' : '1px solid transparent') : (selected ? '2px solid #0d6efd' : '1px solid rgba(0,0,0,0.08)'),
    boxShadow: selected ? '0 0 0 6px rgba(13, 110, 253, 0.15)' : '0 2px 12px rgba(0,0,0,0.06)',
    borderRadius: radius,
    overflow: 'hidden',
    background: item.type === 'text' && item.textBgTransparent ? 'transparent' : '#fff',
    transform: `rotate(${item.rotation || 0}deg)`,
    transformOrigin: 'center center',
    cursor: 'move',
    opacity: isDragging ? 0.8 : 1,
    userSelect: 'none',
    transition: 'box-shadow 120ms ease, border 120ms ease',
  };

  const focusText = () => {
    if (item.type === 'text' && richRef.current) {
      richRef.current.focus();
      // move cursor to end
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(richRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  useEffect(() => {
    if (item.type === 'text' && item.fontFamily) {
      loadGoogleFont(item.fontFamily);
    }
  }, [item.type, item.fontFamily]);

  useLayoutEffect(() => {
    if (!selected) {
      setToolbarHeight(0);
      return;
    }
    setToolbarHeight(0);
  }, [selected, item.fontFamily, item.fontSize, item.align, item.textBgTransparent]);

  useEffect(() => {
    if (item.type !== 'text') return;
    const el = richRef.current;
    if (!el) return;
    if (el.innerHTML !== item.content) {
      el.innerHTML = item.content;
    }
    setContentHeight(el.scrollHeight);
  }, [item.type, item.content]);

  const snapHeightToContent = () => {
    if (item.type !== 'text' || !richRef.current) return;
    const inner = richRef.current.scrollHeight;
    const topPad = selected ? toolbarHeight + 12 : 12;
    const paddingBottom = 12;
    const desiredHeight = Math.max(MIN_SIZE, inner + topPad + paddingBottom);
    if (Math.abs(desiredHeight - item.height) > 2) {
      onResize(item.id, item.x, item.y, item.width, desiredHeight);
    }
  };

  const renderContent = () => {
    if (item.type === 'color') {
      return (
        <div
          className="h-100 w-100 d-flex flex-column justify-content-end"
          style={{
            background: item.colorHex,
            borderRadius: radius,
            border: item.borderColor ? `1px solid ${item.borderColor}` : 'none',
          }}
        >
          {item.label ? (
            <div className="bg-white bg-opacity-75 text-dark fw-semibold px-2 py-1 small">
              {item.label}
            </div>
          ) : null}
        </div>
      );
    }

    if (item.type === 'image') {
      return (
        <div className="h-100 w-100 bg-light">
          <img
            src={item.src}
            alt={item.alt || 'Board item'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            draggable={false}
          />
        </div>
      );
    }

    const topPadding = selected ? toolbarHeight + 12 : 12;
    return (
      <div
        className="h-100 w-100"
        style={{
          padding: `${topPadding}px 12px 12px 12px`,
          textAlign: item.align || 'left',
          background: item.textBgTransparent ? 'transparent' : '#fffef8',
          boxSizing: 'border-box',
        }}
      >
        <div
          ref={richRef}
          className="w-100"
          contentEditable
          suppressContentEditableWarning
          style={{
            outline: 'none',
            whiteSpace: 'pre-wrap',
            minHeight: 'auto',
            fontFamily: item.type === 'text' ? item.fontFamily || TEXT_FONTS[0].value : undefined,
            fontSize: item.type === 'text' ? `${item.fontSize || 16}px` : undefined,
            height: 'auto',
            display: 'block',
            color: item.type === 'text' ? item.textColor || '#111827' : undefined,
          }}
          onInput={() => {
            const html = richRef.current?.innerHTML || '';
            onUpdate(item.id, { content: html });
            if (richRef.current) {
              setContentHeight(richRef.current.scrollHeight);
            }
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onBlur={snapHeightToContent}
          onDoubleClick={(e) => {
            e.stopPropagation();
            focusText();
          }}
        />
      </div>
    );
  };

  const startResize = (handle: ResizeHandle) => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const startRect = { x: item.x, y: item.y, width: item.width, height: item.height };

    const handleMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const next = computeResize(handle, startRect, dx, dy);
      onResize(item.id, next.x, next.y, next.width, next.height);
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  const startRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!richRef.current?.parentElement) return;
    const rect = richRef.current.parentElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const handleMove = (moveEvent: MouseEvent) => {
      const angle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
      const deg = (angle * 180) / Math.PI + 90;
      onRotate(item.id, Math.round(deg));
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  const stopEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const execRichCommand = (command: string) => {
    if (richRef.current) {
      richRef.current.focus();
      document.execCommand(command, false);
      const html = richRef.current.innerHTML;
      onUpdate(item.id, { content: html });
    }
  };

  return (
    <div
      ref={dragRef}
      style={baseStyle}
      role="button"
      tabIndex={0}
      onMouseDown={(e) => {
        e.stopPropagation();
        const multi = e.metaKey || e.ctrlKey || e.shiftKey;
        onSelect(item.id, multi);
        // If multi-selecting, prevent initiating a drag so the selection sticks without moving.
        if (multi) {
          e.preventDefault();
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(item.id, e.metaKey || e.ctrlKey || e.shiftKey);
        focusText();
      }}
    >
      {renderContent()}
      {selected ? (
        <>
          {(['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'] as ResizeHandle[]).map((handle) => {
            const isCorner = handle.length === 2;
            const size = isCorner ? 14 : 12;
            const positions: Record<ResizeHandle, React.CSSProperties> = {
              nw: { top: -7, left: -7, cursor: 'nwse-resize' },
              ne: { top: -7, right: -7, cursor: 'nesw-resize' },
              sw: { bottom: -7, left: -7, cursor: 'nesw-resize' },
              se: { bottom: -7, right: -7, cursor: 'nwse-resize' },
              n: { top: -7, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' },
              s: { bottom: -7, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' },
              e: { right: -7, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' },
              w: { left: -7, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' },
            };
            return (
              <div
                key={handle}
                className="position-absolute bg-primary"
                style={{
                  width: size,
                  height: size,
                  borderRadius: 4,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                  ...positions[handle],
                }}
                onMouseDown={startResize(handle)}
                onClick={stopEvent}
              />
            );
            })}
          <div
            className="position-absolute"
            style={{
              top: -24,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: '#0d6efd',
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              cursor: 'grab',
            }}
            onMouseDown={startRotate}
            onClick={stopEvent}
          />
        </>
      ) : null}
    </div>
  );
};

export default BoardItemView;
export { DRAG_TYPE };
