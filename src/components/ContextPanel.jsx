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
    onToggle
}) => {
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('rightPanelActiveTab') || 'evaluate';
        }
        return 'evaluate';
    });

    // Persist active tab
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('rightPanelActiveTab', activeTab);
        }
    }, [activeTab]);

    // Auto-switch to Evaluate tab when color is selected
    useEffect(() => {
        if (selectedColor && activeTab === 'evaluate') {
            // Already on evaluate, no change needed
        }
    }, [selectedColor]);

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
                    onToggleExpand={() => { }}
                />
                <AccessibilityCard
                    color={selectedColor}
                    colorInfo={colorInfo}
                    isExpanded={true}
                    onToggleExpand={() => { }}
                />
                <ColorContextCard
                    color={selectedColor}
                    contextData={context}
                    isExpanded={true}
                    onToggleExpand={() => { }}
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
                    onToggleExpand={() => { }}
                />
                <ColorScalesCard
                    color={selectedColor}
                    colorInfo={colorInfo}
                    isExpanded={true}
                    onToggleExpand={() => { }}
                />
                <OKLCHExplorerCard
                    color={selectedColor}
                    colorInfo={colorInfo}
                    isExpanded={true}
                    onToggleExpand={() => { }}
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
                    onToggleExpand={() => { }}
                />
                <ColorVisualizerCard
                    palette={palette}
                    isExpanded={true}
                    onToggleExpand={() => { }}
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

            {/* Tab navigation */}
            <div className="context-panel-header">
                <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab}>
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

            {/* Tab content */}
            <div className="context-panel-body">
                {activeTab === 'evaluate' && renderEvaluateTab()}
                {activeTab === 'generate' && renderGenerateTab()}
                {activeTab === 'output' && renderOutputTab()}
            </div>
        </div>
    );
};

export default ContextPanel;
