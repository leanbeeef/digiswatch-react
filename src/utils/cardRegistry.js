// src/utils/cardRegistry.js

/**
 * Dashboard Card Registry System
 * Centralized configuration for all dashboard cards
 */

export const CARD_TYPES = {
    // Existing cards
    COLOR_DATA: 'color-data',
    COLOR_HARMONY: 'color-harmony',
    COLOR_CONTEXT: 'color-context',

    // New cards (to be implemented)
    VISUALIZER: 'visualizer',
    GRADIENT_BUILDER: 'gradient-builder',
    OKLCH_EXPLORER: 'oklch-explorer',
    COLOR_SCALES: 'color-scales',
    ACCESSIBILITY: 'accessibility',
    HARMONIZER: 'harmonizer',
    PATTERNS: 'patterns',
    BRAND_INSIGHTS: 'brand-insights',
    EXPORT_HUB: 'export-hub',
    HISTORY: 'history'
};

export const CARD_CATEGORIES = {
    ESSENTIAL: 'essential',
    DESIGN: 'design',
    ACCESSIBILITY: 'accessibility',
    CREATIVE: 'creative',
    EXPORT: 'export'
};

export const CARD_DEFINITIONS = {
    [CARD_TYPES.COLOR_DATA]: {
        id: CARD_TYPES.COLOR_DATA,
        title: 'Color Data',
        description: 'View color values in all formats',
        icon: 'bi-palette-fill',
        defaultVisible: true,
        priority: 1,
        category: CARD_CATEGORIES.ESSENTIAL,
        implemented: true
    },
    [CARD_TYPES.COLOR_HARMONY]: {
        id: CARD_TYPES.COLOR_HARMONY,
        title: 'Color Harmonies',
        description: 'Explore color relationships',
        icon: 'bi-bezier2',
        defaultVisible: true,
        priority: 2,
        category: CARD_CATEGORIES.ESSENTIAL,
        implemented: true
    },
    [CARD_TYPES.COLOR_CONTEXT]: {
        id: CARD_TYPES.COLOR_CONTEXT,
        title: 'Color Context',
        description: 'Meanings and associations',
        icon: 'bi-lightbulb',
        defaultVisible: true,
        priority: 3,
        category: CARD_CATEGORIES.ESSENTIAL,
        implemented: true
    },
    [CARD_TYPES.VISUALIZER]: {
        id: CARD_TYPES.VISUALIZER,
        title: 'Color Visualizer',
        description: 'Preview in UI contexts',
        icon: 'bi-eye',
        defaultVisible: false,
        priority: 4,
        category: CARD_CATEGORIES.DESIGN,
        implemented: true
    },
    [CARD_TYPES.GRADIENT_BUILDER]: {
        id: CARD_TYPES.GRADIENT_BUILDER,
        title: 'Gradient Builder',
        description: 'Create smooth gradients',
        icon: 'bi-pentagon',
        defaultVisible: false,
        priority: 5,
        category: CARD_CATEGORIES.DESIGN,
        implemented: true
    },
    [CARD_TYPES.OKLCH_EXPLORER]: {
        id: CARD_TYPES.OKLCH_EXPLORER,
        title: 'OKLCH Explorer',
        description: 'Adjust L/C/H values',
        icon: 'bi-sliders',
        defaultVisible: false,
        priority: 6,
        category: CARD_CATEGORIES.DESIGN,
        implemented: true
    },
    [CARD_TYPES.COLOR_SCALES]: {
        id: CARD_TYPES.COLOR_SCALES,
        title: 'Color Scales',
        description: 'Generate tint & shade scales',
        icon: 'bi-bar-chart-steps',
        defaultVisible: false,
        priority: 7,
        category: CARD_CATEGORIES.DESIGN,
        implemented: true
    },
    [CARD_TYPES.ACCESSIBILITY]: {
        id: CARD_TYPES.ACCESSIBILITY,
        title: 'Accessibility',
        description: 'WCAG contrast & suggestions',
        icon: 'bi-universal-access',
        defaultVisible: false,
        priority: 8,
        category: CARD_CATEGORIES.ACCESSIBILITY,
        implemented: false
    },
    [CARD_TYPES.HARMONIZER]: {
        id: CARD_TYPES.HARMONIZER,
        title: 'Palette Harmonizer',
        description: 'AI palette suggestions',
        icon: 'bi-stars',
        defaultVisible: false,
        priority: 9,
        category: CARD_CATEGORIES.DESIGN,
        implemented: false
    },
    [CARD_TYPES.PATTERNS]: {
        id: CARD_TYPES.PATTERNS,
        title: 'Pattern Swatches',
        description: 'Apply to textures & patterns',
        icon: 'bi-grid-3x3',
        defaultVisible: false,
        priority: 10,
        category: CARD_CATEGORIES.CREATIVE,
        implemented: false
    },
    [CARD_TYPES.BRAND_INSIGHTS]: {
        id: CARD_TYPES.BRAND_INSIGHTS,
        title: 'Brand Insights',
        description: 'Mood & industry matching',
        icon: 'bi-graph-up',
        defaultVisible: false,
        priority: 11,
        category: CARD_CATEGORIES.CREATIVE,
        implemented: false
    },
    [CARD_TYPES.EXPORT_HUB]: {
        id: CARD_TYPES.EXPORT_HUB,
        title: 'Export Hub',
        description: 'Export to all formats',
        icon: 'bi-download',
        defaultVisible: false,
        priority: 12,
        category: CARD_CATEGORIES.EXPORT,
        implemented: false
    },
    [CARD_TYPES.HISTORY]: {
        id: CARD_TYPES.HISTORY,
        title: 'Palette History',
        description: 'Undo/redo & variants',
        icon: 'bi-clock-history',
        defaultVisible: false,
        priority: 13,
        category: CARD_CATEGORIES.EXPORT,
        implemented: false
    }
};

/**
 * Get all cards sorted by priority
 */
export const getAllCards = () => {
    return Object.values(CARD_DEFINITIONS).sort((a, b) => a.priority - b.priority);
};

/**
 * Get cards by category
 */
export const getCardsByCategory = (category) => {
    return Object.values(CARD_DEFINITIONS)
        .filter(card => card.category === category)
        .sort((a, b) => a.priority - b.priority);
};

/**
 * Get default visible card IDs
 */
export const getDefaultVisibleCards = () => {
    return Object.values(CARD_DEFINITIONS)
        .filter(card => card.defaultVisible)
        .map(card => card.id);
};

/**
 * Get only implemented cards
 */
export const getImplementedCards = () => {
    return Object.values(CARD_DEFINITIONS)
        .filter(card => card.implemented)
        .sort((a, b) => a.priority - b.priority);
};
