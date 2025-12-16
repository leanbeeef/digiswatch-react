// ColourLovers + mock fallback for trending palettes, enriched with brand/category + image query.

const mockTrending = [
  {
    name: "Aurora Grid",
    colors: ["#0C1A34", "#14365F", "#1E8BC3", "#E3F2FF", "#F4B41A"],
    category: "B2B SaaS",
    brand: {
      name: "Northline Systems",
      industry: "B2B SaaS",
      tagline: "Enterprise dashboards with calm confidence",
    },
    imageQuery: "business dashboard minimal",
  },
  {
    name: "Citrus Bloom",
    colors: ["#0D1B1E", "#0F766E", "#22C55E", "#FFD166", "#FFF4D6"],
    category: "Wellness",
    brand: {
      name: "Bloom Studio",
      industry: "Wellness & Lifestyle",
      tagline: "Fresh, approachable, rooted in nature",
    },
    imageQuery: "fresh citrus wellness",
  },
  {
    name: "Noir Social",
    colors: ["#0B1021", "#1E2235", "#3E4C59", "#F3F4F6", "#C084FC"],
    category: "Media",
    brand: {
      name: "Signal Collective",
      industry: "Media / Social",
      tagline: "Premium dark UI with bold accents",
    },
    imageQuery: "night city lights abstract",
  },
  {
    name: "Coastal Retail",
    colors: ["#0D3B66", "#3D5A80", "#98C1D9", "#E0FBFC", "#EE6C4D"],
    category: "E-commerce",
    brand: {
      name: "Harbor & Co.",
      industry: "Retail / E-commerce",
      tagline: "Modern coastal vibes for product storytelling",
    },
    imageQuery: "coastal product flatlay",
  },
  {
    name: "Minimal Luxe",
    colors: ["#0B0C10", "#1F2833", "#C5C6C7", "#F0F5FF", "#FFD3A4"],
    category: "Brand",
    brand: {
      name: "Atelier Nova",
      industry: "Brand & Identity",
      tagline: "Understated luxury with soft highlights",
    },
    imageQuery: "minimal luxury branding",
  },
];

const INDUSTRIES = [
  "B2B SaaS",
  "E-commerce",
  "Creative Studio",
  "Media",
  "Wellness",
  "Fintech",
  "Education",
  "Hospitality",
];

const buildBrand = (name, index = 0) => {
  const industry = INDUSTRIES[index % INDUSTRIES.length];
  return {
    name: `${name} Studio`,
    industry,
    tagline: `A ${industry.toLowerCase()} look curated by ColourLovers.`,
  };
};

export const fetchTrendingPalettes = async () => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);
    const endpoint = "https://www.colourlovers.com/api/palettes/top?format=json&numResults=24";
    let res = await fetch(endpoint, { signal: controller.signal });
    // CORS fallback via proxy if needed
    if (!res.ok || res.type === "opaque") {
      const proxied = `https://api.allorigins.win/raw?url=${encodeURIComponent(endpoint)}`;
      res = await fetch(proxied, { signal: controller.signal });
    }
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`ColourLovers API error: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return mockTrending;

    return data.map((item, idx) => {
      const brand = buildBrand(item.title || "ColourLovers", idx);
      const category = brand.industry;
      return {
        name: item.title || `Palette ${idx + 1}`,
        colors: (item.colors || [])
          .map((c) => (c.startsWith("#") ? c : `#${c}`))
          .slice(0, 8),
        brand,
        category,
        imageQuery: item.title || category,
        imageUrl: item.imageUrl, // ColourLovers preview
      };
    });
  } catch (err) {
    console.warn("Falling back to mock trending palettes:", err?.message || err);
    return mockTrending;
  }
};

export default fetchTrendingPalettes;
