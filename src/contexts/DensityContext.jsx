// src/contexts/DensityContext.jsx
// Context provider for density mode (Comfortable / Compact)

import React, { createContext, useContext, useState, useEffect } from 'react';

const DensityContext = createContext();

export const useDensity = () => {
    const context = useContext(DensityContext);
    if (!context) {
        throw new Error('useDensity must be used within a DensityProvider');
    }
    return context;
};

export const DensityProvider = ({ children }) => {
    const [density, setDensity] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('densityMode');
            return stored === 'compact' ? 'compact' : 'comfortable';
        }
        return 'comfortable';
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('densityMode', density);
            document.documentElement.setAttribute('data-density', density);
        }
    }, [density]);

    const toggleDensity = () => {
        setDensity((prev) => (prev === 'comfortable' ? 'compact' : 'comfortable'));
    };

    return (
        <DensityContext.Provider value={{ density, setDensity, toggleDensity }}>
            {children}
        </DensityContext.Provider>
    );
};
