// src/components/ResizeHandle.jsx
// Draggable handle for resizing the context panel

import React, { useState, useEffect, useCallback } from 'react';
import '../styles/resize-handle.css';

const ResizeHandle = ({ onResize, defaultWidth = 380, minWidth = 300, maxWidth = 600 }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;

        const containerWidth = window.innerWidth;
        const newWidth = containerWidth - e.clientX;
        const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));

        onResize(constrainedWidth);
    }, [isDragging, minWidth, maxWidth, onResize]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleDoubleClick = useCallback(() => {
        onResize(defaultWidth);
    }, [defaultWidth, onResize]);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div
            className={`resize-handle ${isDragging ? 'dragging' : ''}`}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
            role="separator"
            aria-label="Resize context panel"
            aria-valuenow={defaultWidth}
            aria-valuemin={minWidth}
            aria-valuemax={maxWidth}
        >
            <div className="resize-handle-grip">
                <div className="resize-handle-line" />
                <div className="resize-handle-line" />
                <div className="resize-handle-line" />
            </div>
        </div>
    );
};

export default ResizeHandle;
