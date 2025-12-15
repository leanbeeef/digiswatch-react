// src/components/LayoutContainer.jsx
// Main layout container for the dashboard with 3 regions: workbench, context panel, and palette tray
// Now supports resizable context panel

import React, { useState, useEffect } from 'react';
import ResizeHandle from './ResizeHandle';
import '../styles/layout.css';

const LayoutContainer = ({
    children,
    workbench,
    contextPanel,
    paletteTray,
    headerContent
}) => {
    const [contextWidth, setContextWidth] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('contextPanelWidth');
            return stored ? parseInt(stored, 10) : 380;
        }
        return 380;
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('contextPanelWidth', contextWidth);
        }
    }, [contextWidth]);

    return (
        <div className="palette-layout-container" style={{ gridTemplateRows: paletteTray ? 'auto 1fr auto' : 'auto 1fr' }}>
            {/* Optional header for actions/toolbar */}
            {headerContent && (
                <div className="palette-layout-header">
                    {headerContent}
                </div>
            )}

            {/* Main content area with workbench and context panel */}
            <div
                className="palette-layout-body"
                style={{
                    gridTemplateColumns: contextPanel ? `1fr ${contextWidth}px` : '1fr'
                }}
            >
                {/* Center workbench - Primary work area */}
                <div className="palette-layout-workbench">
                    {workbench}
                </div>

                {/* Right context panel - Conditional Render */}
                {contextPanel && (
                    <div
                        className="palette-layout-context"
                        style={{
                            width: `${contextWidth}px`,
                            position: 'relative'
                        }}
                    >
                        <ResizeHandle
                            onResize={setContextWidth}
                            defaultWidth={380}
                            minWidth={300}
                            maxWidth={1600}
                        />
                        {contextPanel}
                    </div>
                )}
            </div>

            {/* Bottom palette tray - Collapsible palette strip */}
            <div className="palette-layout-tray">
                {paletteTray}
            </div>

            {/* Fallback for children prop if needed */}
            {children}
        </div>
    );
};

export default LayoutContainer;
