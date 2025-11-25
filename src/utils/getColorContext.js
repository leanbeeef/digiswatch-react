// src/utils/getColorContext.js
// Static color context data generator
// Built to be easily swappable with an API integration

import { TinyColor } from '@ctrl/tinycolor';

/**
 * Analyzes a color and returns contextual information including
 * emotional associations, cultural symbolism, industry usage, and mood descriptors
 * 
 * @param {string} color - Hex color string
 * @returns {Object} Context data with emotional, cultural, industry, and mood information
 * 
 * To integrate with an API:
 * 1. Replace the function body with an API call
 * 2. Keep the same return structure
 * 3. Example: return await fetch(`/api/color-context?hex=${color}`).then(r => r.json())
 */
export const getColorContext = (color) => {
    const tinyColor = new TinyColor(color);
    const hsl = tinyColor.toHsl();
    const hue = hsl.h;
    const saturation = hsl.s;
    const lightness = hsl.l;

    // Determine color family based on hue
    const colorFamily = getColorFamily(hue);

    // Get emotional associations based on color properties
    const emotional = getEmotionalContext(colorFamily, saturation, lightness);

    // Get cultural symbolism
    const cultural = getCulturalContext(colorFamily);

    // Get industry usage examples
    const industry = getIndustryContext(colorFamily, saturation, lightness);

    // Get mood descriptors
    const moods = getMoodDescriptors(colorFamily, saturation, lightness);

    return {
        emotional,
        cultural,
        industry,
        moods,
    };
};

// Helper: Determine color family from hue
const getColorFamily = (hue) => {
    if (hue >= 0 && hue < 15) return 'red';
    if (hue >= 15 && hue < 45) return 'orange';
    if (hue >= 45 && hue < 75) return 'yellow';
    if (hue >= 75 && hue < 150) return 'green';
    if (hue >= 150 && hue < 200) return 'cyan';
    if (hue >= 200 && hue < 260) return 'blue';
    if (hue >= 260 && hue < 330) return 'purple';
    return 'red'; // 330-360 wraps back to red
};

// Emotional context data
const getEmotionalContext = (family, saturation, lightness) => {
    const emotionalData = {
        red: {
            base: 'Passionate, energetic, and bold. Associated with excitement, urgency, and love.',
            warm: true,
        },
        orange: {
            base: 'Enthusiastic, creative, and friendly. Evokes warmth, playfulness, and optimism.',
            warm: true,
        },
        yellow: {
            base: 'Cheerful, optimistic, and attention-grabbing. Symbolizes happiness and sunshine.',
            warm: true,
        },
        green: {
            base: 'Balanced, natural, and calming. Represents growth, health, and harmony.',
            warm: false,
        },
        cyan: {
            base: 'Refreshing, clean, and modern. Evokes clarity, communication, and technology.',
            warm: false,
        },
        blue: {
            base: 'Trustworthy, calm, and professional. Associated with stability, peace, and reliability.',
            warm: false,
        },
        purple: {
            base: 'Creative, luxurious, and imaginative. Symbolizes royalty, wisdom, and spirituality.',
            warm: false,
        },
    };

    const baseData = emotionalData[family];
    let intensityNote = '';

    if (saturation < 0.2) {
        intensityNote = ' Muted and subtle, conveying sophistication and restraint.';
    } else if (saturation > 0.7) {
        intensityNote = ' Highly saturated, creating strong visual impact and vibrancy.';
    }

    let lightnessNote = '';
    if (lightness < 0.3) {
        lightnessNote = ' Dark tones add depth, seriousness, and elegance.';
    } else if (lightness > 0.7) {
        lightnessNote = ' Light tones feel airy, gentle, and approachable.';
    }

    return {
        description: baseData.base + intensityNote + lightnessNote,
        temperature: baseData.warm ? 'Warm' : 'Cool',
        energy: saturation > 0.5 ? 'High Energy' : 'Low Energy',
    };
};

// Cultural symbolism data
const getCulturalContext = (family) => {
    const culturalData = {
        red: {
            western: 'Love, passion, danger, excitement',
            eastern: 'Good fortune, celebration, prosperity, joy',
        },
        orange: {
            western: 'Creativity, enthusiasm, adventure',
            eastern: 'Happiness, transformation, spiritual enlightenment',
        },
        yellow: {
            western: 'Optimism, caution, intellect',
            eastern: 'Royalty, power, prosperity, sacredness',
        },
        green: {
            western: 'Nature, growth, freshness, money',
            eastern: 'Fertility, new beginnings, harmony, youth',
        },
        cyan: {
            western: 'Technology, cleanliness, communication',
            eastern: 'Healing, protection, immortality',
        },
        blue: {
            western: 'Trust, stability, professionalism, calm',
            eastern: 'Immortality, spirituality, advancement',
        },
        purple: {
            western: 'Royalty, luxury, creativity, wisdom',
            eastern: 'Nobility, spirituality, mystery, magic',
        },
    };

    return culturalData[family];
};

// Industry usage examples
const getIndustryContext = (family, saturation, lightness) => {
    const industryData = {
        red: ['Food & Beverage', 'Entertainment', 'Retail', 'Sports'],
        orange: ['Technology Startups', 'Creative Agencies', 'Children\'s Products', 'Fitness'],
        yellow: ['Energy', 'Transportation', 'Food Services', 'Logistics'],
        green: ['Environmental', 'Health & Wellness', 'Finance', 'Agriculture'],
        cyan: ['Technology', 'Healthcare', 'Communication', 'Clean Tech'],
        blue: ['Finance', 'Healthcare', 'Technology', 'Corporate Services'],
        purple: ['Beauty & Cosmetics', 'Luxury Brands', 'Creative Industries', 'Spirituality'],
    };

    const baseIndustries = industryData[family];

    // Adjust based on saturation and lightness
    let note = '';
    if (lightness < 0.3 && saturation > 0.5) {
        note = ' Often used for premium, high-end positioning.';
    } else if (lightness > 0.7 && saturation < 0.5) {
        note = ' Common in wellness, healthcare, and approachable brands.';
    }

    return {
        examples: baseIndustries,
        note,
    };
};

// Mood descriptors
const getMoodDescriptors = (family, saturation, lightness) => {
    const moodData = {
        red: ['Passionate', 'Energetic', 'Bold', 'Exciting', 'Urgent'],
        orange: ['Playful', 'Creative', 'Friendly', 'Warm', 'Adventurous'],
        yellow: ['Cheerful', 'Optimistic', 'Bright', 'Happy', 'Lively'],
        green: ['Calm', 'Natural', 'Balanced', 'Refreshing', 'Harmonious'],
        cyan: ['Clear', 'Modern', 'Fresh', 'Clean', 'Crisp'],
        blue: ['Trustworthy', 'Stable', 'Professional', 'Serene', 'Reliable'],
        purple: ['Creative', 'Luxurious', 'Mystical', 'Imaginative', 'Regal'],
    };

    let baseMoods = [...moodData[family]];

    // Add saturation-based moods
    if (saturation < 0.2) {
        baseMoods.push('Sophisticated', 'Subtle');
    } else if (saturation > 0.7) {
        baseMoods.push('Vibrant', 'Dynamic');
    }

    // Add lightness-based moods
    if (lightness < 0.3) {
        baseMoods.push('Elegant', 'Serious');
    } else if (lightness > 0.7) {
        baseMoods.push('Gentle', 'Airy');
    }

    // Return up to 7 unique moods
    return [...new Set(baseMoods)].slice(0, 7);
};

export default getColorContext;
