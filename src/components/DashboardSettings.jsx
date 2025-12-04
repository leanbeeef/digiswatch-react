// src/components/DashboardSettings.jsx
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { CARD_DEFINITIONS, CARD_CATEGORIES, getAllCards } from '../utils/cardRegistry';
import '../styles/dashboardSettings.css';

const DashboardSettings = ({ show, onHide, visibleCards, onToggleCard }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Group cards by category
    const groupedCards = {};
    Object.values(CARD_CATEGORIES).forEach(category => {
        groupedCards[category] = getAllCards().filter(card => card.category === category);
    });

    // Filter cards based on search
    const filterCards = (cards) => {
        if (!searchTerm) return cards;
        return cards.filter(card =>
            card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            card.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const categoryLabels = {
        [CARD_CATEGORIES.ESSENTIAL]: 'Essential',
        [CARD_CATEGORIES.DESIGN]: 'Design Tools',
        [CARD_CATEGORIES.ACCESSIBILITY]: 'Accessibility',
        [CARD_CATEGORIES.CREATIVE]: 'Creative',
        [CARD_CATEGORIES.EXPORT]: 'Export & History'
    };

    const implementedCards = getAllCards().filter(c => c.implemented);
    const implementedIds = implementedCards.map(c => c.id);
    const visibleSet = new Set(
        Array.isArray(visibleCards)
            ? visibleCards.filter(id => typeof id === 'string')
            : []
    );
    const visibleCount = implementedIds.filter(id => visibleSet.has(id)).length;
    const totalImplemented = implementedCards.length;

    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="dashboard-settings-modal">
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="bi bi-grid-3x3-gap me-2"></i>
                    Dashboard Cards
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Summary */}
                <div className="settings-summary mb-3">
                    <span className="text-muted">
                        <strong>{visibleCount}</strong> of <strong>{totalImplemented}</strong> cards visible
                    </span>
                </div>

                {/* Search */}
                <Form.Control
                    type="text"
                    placeholder="Search cards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-4"
                />

                {/* Card Categories */}
                {Object.entries(groupedCards).map(([category, cards]) => {
                    const filteredCards = filterCards(cards);
                    if (filteredCards.length === 0) return null;

                    return (
                        <div key={category} className="card-category mb-4">
                            <h6 className="category-title text-uppercase text-muted mb-3">
                                {categoryLabels[category]}
                            </h6>
                            <div className="card-list">
                                {filteredCards.map(card => {
                                    const isVisible = visibleCards.includes(card.id);
                                    const isDisabled = !card.implemented;

                                    return (
                                        <div
                                            key={card.id}
                                            className={`card-item ${isDisabled ? 'disabled' : ''}`}
                                            onClick={() => !isDisabled && onToggleCard(card.id)}
                                        >
                                            <div className="card-item-left">
                                                <Form.Check
                                                    type="checkbox"
                                                    checked={isVisible}
                                                    disabled={isDisabled}
                                                    onChange={() => !isDisabled && onToggleCard(card.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <i className={`${card.icon} card-icon`}></i>
                                                <div className="card-info">
                                                    <div className="card-title-row">
                                                        {card.title}
                                                        {isDisabled && (
                                                            <span className="badge bg-secondary ms-2">Coming Soon</span>
                                                        )}
                                                    </div>
                                                    <div className="card-description text-muted">
                                                        {card.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DashboardSettings;
