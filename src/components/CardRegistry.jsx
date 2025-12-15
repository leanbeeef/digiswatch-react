// src/components/CardRegistry.jsx
// Registry of all available dashboard cards

import { ColorInfoPreview, ColorInfoDetail } from './cards/ColorInfoCard';
import { HarmonyPreview, HarmonyDetail } from './cards/HarmonyCard';
import { AccessibilityPreview, AccessibilityDetail } from './AccessibilityCard';
import { ColorScalesPreview, ColorScalesDetail } from './ColorScalesCard';
import { OKLCHExplorerPreview, OKLCHExplorerDetail } from './OKLCHExplorerCard';
import { GradientBuilderPreview, GradientBuilderDetail } from './GradientBuilderCard';
import { ColorVisualizerPreview, ColorVisualizerDetail } from './ColorVisualizerCard';
import { ColorContextPreview, ColorContextDetail } from './ColorContextCard';
import { BrandAnalyticsPreview, BrandAnalyticsDetail } from './cards/BrandAnalyticsCard';

// Card definitions
export const CARD_REGISTRY = {
    'color-info': {
        id: 'color-info',
        title: 'Color Data',
        icon: 'bi-droplet',
        Preview: ColorInfoPreview,
        Detail: ColorInfoDetail,
        isPremium: false
    },
    'harmony': {
        id: 'harmony',
        title: 'Harmony',
        icon: 'bi-palette',
        Preview: HarmonyPreview,
        Detail: HarmonyDetail,
        isPremium: false
    },
    'accessibility': {
        id: 'accessibility',
        title: 'Accessibility',
        icon: 'bi-universal-access',
        Preview: AccessibilityPreview,
        Detail: AccessibilityDetail,
        isPremium: false
    },
    'scale': {
        id: 'scale',
        title: 'Color Scales',
        icon: 'bi-layers',
        Preview: ColorScalesPreview,
        Detail: ColorScalesDetail,
        isPremium: false
    },
    'oklch': {
        id: 'oklch',
        title: 'OKLCH Explorer',
        icon: 'bi-sliders',
        Preview: OKLCHExplorerPreview,
        Detail: OKLCHExplorerDetail,
        isPremium: false
    },
    'gradient': {
        id: 'gradient',
        title: 'Gradient Builder',
        icon: 'bi-activity',
        Preview: GradientBuilderPreview,
        Detail: GradientBuilderDetail,
        isPremium: false
    },
    'visualizer': {
        id: 'visualizer',
        title: 'Visualizer',
        icon: 'bi-window-sidebar',
        Preview: ColorVisualizerPreview,
        Detail: ColorVisualizerDetail,
        isPremium: false
    },
    'color-context': {
        id: 'color-context',
        title: 'Color Context',
        icon: 'bi-info-circle',
        Preview: ColorContextPreview,
        Detail: ColorContextDetail,
        isPremium: false
    },
    'brand-analytics': {
        id: 'brand-analytics',
        title: 'Brand Analytics',
        icon: 'bi-graph-up',
        Preview: BrandAnalyticsPreview,
        Detail: BrandAnalyticsDetail,
        isPremium: false
    }
};

export const DEFAULT_SLOTS = [
    'color-info',
    'harmony',
    'accessibility',
    'scale',
    'brand-analytics',
    'visualizer',
    'oklch'
];
