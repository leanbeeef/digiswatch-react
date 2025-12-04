// src/components/DashboardCard.jsx
// Wrapper component for all dashboard cards with consistent styling and interactions

import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import '../styles/dashboard.css';

const CARD_TYPE = 'DASHBOARD_CARD';

const DashboardCard = ({
    id,
    title,
    children,
    isExpanded = false,
    onToggle,
    onClose,
    isDraggable = true,
    index,
    moveCard,
    previewContent,
    extraHeaderActions = null,
}) => {
    const ref = React.useRef(null);

    const [{ isDragging }, drag, preview] = useDrag({
        type: CARD_TYPE,
        item: { id, index },
        canDrag: isDraggable,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: CARD_TYPE,
        hover: (item) => {
            if (!ref.current || !moveCard) return;

            const dragIndex = item.index;
            const hoverIndex = index;

            if (dragIndex === hoverIndex) return;

            moveCard(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    // Connect drop to the main container
    drop(ref);

    // Connect preview to the main container (so the whole card looks like it's dragging)
    preview(ref);

    return (
        <div
            ref={ref}
            className={`dashboard-card ${isExpanded ? 'is-expanded' : ''} ${isDragging ? 'is-dragging' : ''}`}
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            <div className="dashboard-card-header">
                <h3 className="dashboard-card-title">{title}</h3>
                <div className="dashboard-card-actions">
                    {extraHeaderActions}
                    {onToggle && (
                        <button
                            className="dashboard-card-action-btn"
                            onClick={onToggle}
                            title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                            <i className={`bi bi-${isExpanded ? 'arrows-angle-contract' : 'arrows-angle-expand'}`}></i>
                        </button>
                    )}
                    {isDraggable && (
                        <div
                            ref={drag}
                            className="dashboard-card-action-btn"
                            style={{ cursor: 'grab', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Drag to reorder"
                        >
                            <i className="bi bi-grip-vertical"></i>
                        </div>
                    )}
                    {onClose && (
                        <button
                            className="dashboard-card-action-btn"
                            onClick={onClose}
                            title="Close"
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>
                    )}
                </div>
            </div>
            <div className="dashboard-card-body">
                {!isExpanded && previewContent ? (
                    <div
                        className="dashboard-card-preview"
                        onClick={onToggle}
                        style={{ cursor: 'pointer' }}
                        title="Click to expand"
                    >
                        {previewContent}
                    </div>
                ) : (
                    children
                )}
            </div>
        </div>
    );
};

export default DashboardCard;
