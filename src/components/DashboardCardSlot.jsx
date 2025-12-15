// src/components/DashboardCardSlot.jsx
// A fixed card slot that can display different card types

import React from 'react';
import '../styles/dashboard-grid.css';

const DashboardCardSlot = ({
    cardType,
    title,
    icon,
    previewContent,
    onCardClick,
    onSwapClick,
    isPremium = false,
    className = ''
}) => {
    const handleSwapClick = (e) => {
        e.stopPropagation(); // Prevent card click when clicking swap button
        onSwapClick();
    };

    return (
        <div
            className={`dashboard-card ${isPremium ? 'premium' : ''} ${className}`}
            onClick={onCardClick}
        >
            <div className="dashboard-card-header">
                <div className="dashboard-card-title">
                    <i className={`bi ${icon} dashboard-card-icon`}></i>
                    {title}
                </div>
                <div className="dashboard-card-actions">
                    {isPremium && (
                        <div className="premium-badge">
                            <i className="bi bi-star-fill"></i>
                            Pro
                        </div>
                    )}
                    <button
                        className="dashboard-card-swap-btn"
                        onClick={handleSwapClick}
                        title="Change card type"
                        aria-label="Swap card content"
                    >
                        <i className="bi bi-arrow-repeat"></i>
                    </button>
                </div>
            </div>
            <div className="dashboard-card-content">
                {previewContent}
            </div>
        </div>
    );
};

export default DashboardCardSlot;
