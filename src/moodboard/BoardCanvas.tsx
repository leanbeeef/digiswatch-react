import React from 'react';
import { useDrop } from 'react-dnd';
import BoardItemView, { DRAG_TYPE } from './BoardItemView';
import type { BoardItem } from './types';

type BoardCanvasProps = {
  width: number;
  height: number;
  items: BoardItem[];
  selectedIds: string[];
  onSelect: (id: string | null, multi?: boolean) => void;
  onMoveItem: (id: string, x: number, y: number) => void;
  onMoveGroup: (groupId: string, dx: number, dy: number) => void;
  onResizeItem: (id: string, x: number, y: number, width: number, height: number) => void;
  onUpdateItem: (id: string, patch: Partial<BoardItem>) => void;
  onDeleteItem: (id: string) => void;
  onBringToFront: (id: string) => void;
  onRotateItem: (id: string, rotation: number) => void;
  zoom: number;
  gridSize: number;
};

const BoardCanvas: React.FC<BoardCanvasProps> = ({
  width,
  height,
  items,
  selectedIds,
  onSelect,
  onMoveItem,
  onMoveGroup,
  onResizeItem,
  onUpdateItem,
  onDeleteItem,
  onBringToFront,
  onRotateItem,
  zoom,
  gridSize,
}) => {
  const [, dropRef] = useDrop<
    { id: string; x: number; y: number },
    void,
    unknown
  >(() => ({
    accept: DRAG_TYPE,
    drop: (dragItem, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (!delta) return;
      const nextX = dragItem.x + delta.x / zoom;
      const nextY = dragItem.y + delta.y / zoom;
      const dragged = items.find((i) => i.id === dragItem.id);
      if (dragged?.groupId) {
        onMoveGroup(dragged.groupId, delta.x / zoom, delta.y / zoom);
      } else {
        onMoveItem(dragItem.id, nextX, nextY);
      }
    },
  }), [onMoveItem, onMoveGroup, zoom, items]);

  return (
    <div
      ref={dropRef}
      className="bg-white border rounded-4 position-relative"
      style={{
        width: '100%',
        maxWidth: width,
        height,
        overflow: 'hidden',
        backgroundImage:
          'linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px)',
        backgroundSize: `${gridSize}px ${gridSize}px`,
      }}
      onMouseDown={(e) => {
        // Only clear selection when clicking the empty canvas without modifiers.
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        if (e.target !== e.currentTarget) return;
        onSelect(null);
      }}
    >
      {items.length === 0 ? (
        <div className="h-100 w-100 d-flex flex-column align-items-center justify-content-center text-muted">
          <div className="mb-2 fw-semibold">Drop items here</div>
          <div className="small text-secondary">Add colors, images, or notes from the sidebar.</div>
        </div>
      ) : null}
      {items.map((item) => (
        <BoardItemView
          key={item.id}
          item={item}
          selected={selectedIds.includes(item.id)}
          onSelect={onSelect}
          onResize={onResizeItem}
          onUpdate={onUpdateItem}
          onDelete={onDeleteItem}
          onBringToFront={onBringToFront}
          onRotate={onRotateItem}
        />
      ))}
    </div>
  );
};

export default BoardCanvas;
