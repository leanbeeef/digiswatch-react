// src/components/ContextPanel.jsx
// Context-aware tabbed panel showing Evaluate, Generate, or Output tools

import React, { useState, useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import tinycolor from 'tinycolor2';
import AccessibilityCard from './AccessibilityCard';
import ColorDataCard from './ColorDataCard';
import ColorContextCard from './ColorContextCard';
import ColorHarmonyCard from './ColorHarmonyCard';
import ColorScalesCard from './ColorScalesCard';
import OKLCHExplorerCard from './OKLCHExplorerCard';
import GradientBuilderCard from './GradientBuilderCard';
import ColorVisualizerCard from './ColorVisualizerCard';
import '../styles/context-panel.css';

const ContextPanel = ({
    selectedColor,
    colorInfo,
    palette,
    harmonies,
    context,
    onHarmonySelect,
    onColorChange,
    isOpen = true,
    onToggle,
    hideHeader = false,
    activeTab: controlledActiveTab,
    onTabChange,
}) => {
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('rightPanelActiveTab') || 'evaluate';
        }
        return 'evaluate';
    });

    // Keep local state in sync with controlled prop
    useEffect(() => {
        if (controlledActiveTab && controlledActiveTab !== activeTab) {
            setActiveTab(controlledActiveTab);
        }
    }, [controlledActiveTab]);

    const currentTab = controlledActiveTab || activeTab;

    const handleTabSelect = (key) => {
        if (onTabChange) {
            onTabChange(key);
        } else {
            setActiveTab(key);
        }
    };

    // Persist active tab
    useEffect(() => {
        if (typeof window !== 'undefined' && !controlledActiveTab) {
            localStorage.setItem('rightPanelActiveTab', currentTab);
        }
    }, [currentTab, controlledActiveTab]);

    // Auto-switch to Evaluate tab when color is selected
    useEffect(() => {
        if (selectedColor && currentTab === 'evaluate') {
            // Already on evaluate, no change needed
        }
    }, [selectedColor, currentTab]);

    const renderAtAGlance = () => {
        const passCount = palette?.filter(c => {
            // Simple check: does it pass AA on white or black?
            const whiteContrast = tinycolor.readability(c.hex, '#ffffff');
            const blackContrast = tinycolor.readability(c.hex, '#000000');
            return whiteContrast >= 4.5 || blackContrast >= 4.5;
        }).length || 0;

        return (
            <div className="context-at-a-glance">
                <div className="glance-header">
                    <i className="bi bi-speedometer2"></i>
                    <h4>At a Glance</h4>
                </div>
                <div className="glance-stats">
                    <div className="glance-stat">
                        <span className="glance-label">Colors</span>
                        <span className="glance-value">{palette?.length || 0}</span>
                    </div>
                    <div className="glance-stat">
                        <span className="glance-label">AA Pass</span>
                        <span className="glance-value">{passCount}</span>
                    </div>
                    <div className="glance-stat">
                        <span className="glance-label">Warnings</span>
                        <span className="glance-value">{palette?.length - passCount || 0}</span>
                    </div>
                </div>
                <p className="glance-hint">
                    <i className="bi bi-info-circle"></i>
                    Select a swatch to see detailed contrast analysis and color data
                </p>
            </div>
        );
    };

    const renderEvaluateTab = () => {
        if (!selectedColor || !colorInfo) {
            return renderAtAGlance();
        }

        return (
            <div className="context-tab-content">
                <ColorDataCard
                    color={selectedColor}
                    colorInfo={colorInfo}
                    isExpanded={true}

                />
                <AccessibilityCard
                    color={selectedColor}
                    colorInfo={colorInfo}
                    isExpanded={true}

                />
                <ColorContextCard
                    color={selectedColor}
                    contextData={context}
                    isExpanded={true}

                />
            </div>
        );
    };

    const renderGenerateTab = () => {
        if (!selectedColor || !colorInfo) {
            return renderAtAGlance();
        }

        return (
            <div className="context-tab-content">
                <ColorHarmonyCard
                    baseColor={selectedColor}
                    colorHarmonies={harmonies}
                    onHarmonySelect={onHarmonySelect}
                    isExpanded={true}

                />
                <ColorScalesCard
                    color={selectedColor}
                    colorInfo={colorInfo}
                    isExpanded={true}

                />
                <OKLCHExplorerCard
                    color={selectedColor}
                    colorInfo={colorInfo}
                    isExpanded={true}

                />
            </div>
        );
    };

    const renderOutputTab = () => {
        if (!selectedColor || !colorInfo) {
            return renderAtAGlance();
        }

        return (
            <div className="context-tab-content">
                <GradientBuilderCard
                    color={selectedColor}
                    colorInfo={colorInfo}
                    isExpanded={true}

                />
                <ColorVisualizerCard
                    palette={palette}
                    isExpanded={true}

                />
            </div>
        );
    };

    return (
        <div className={`context-panel ${isOpen ? 'is-open' : ''}`}>
            {/* Mobile toggle button */}
            {onToggle && (
                <button
                    className="context-panel-toggle mobile-only"
                    onClick={onToggle}
                    aria-label={isOpen ? 'Close panel' : 'Open panel'}
                >
                    <i className={`bi bi-${isOpen ? 'x-lg' : 'chevron-up'}`}></i>
                </button>
            )}

            {/* Header with selected swatch + tabs */}
            {!hideHeader && (
                <div className="context-panel-header">
                    <div className="context-panel-heading">
                        <div className="context-selected-chip">
                            <span
                                className="chip-dot"
                                style={{ backgroundColor: selectedColor || '#d7dbe3' }}
                                aria-hidden="true"
                            ></span>
                            <div className="chip-text">
                                <span className="chip-label">Selected</span>
                                <span className="chip-value">
                                    {selectedColor ? selectedColor.toUpperCase() : 'Pick a swatch'}
                                </span>
                            </div>
                        </div>
                        <Nav
                            variant="tabs"
                            activeKey={currentTab}
                            onSelect={handleTabSelect}
                            className="context-tab-nav"
                        >
                            <Nav.Item>
                                <Nav.Link eventKey="evaluate">
                                    <i className="bi bi-shield-check"></i>
                                    <span>Evaluate</span>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="generate">
                                    <i className="bi bi-palette"></i>
                                    <span>Generate</span>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="output">
                                    <i className="bi bi-download"></i>
                                    <span>Output</span>
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </div>
                </div>
            )}

            {/* Tab content */}
            <div className="context-panel-body">
                {currentTab === 'evaluate' && renderEvaluateTab()}
                {currentTab === 'generate' && renderGenerateTab()}
                {currentTab === 'output' && renderOutputTab()}
            </div>
        </div>
    );
};

export default ContextPanel;
