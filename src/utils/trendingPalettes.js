import paletteData from "./paletteData";

const CATEGORY_NAMES = [
  "Tech (consumer + SaaS)",
  "Fintech + Banking + Insurance",
  "Healthcare + Pharma",
  "Cybersecurity",
  "Retail (general)",
  "Food + Beverage",
  "Beauty + Fashion",
  "Home + Furniture + Interior",
  "Real Estate + Construction",
  "Automotive",
  "Travel + Hospitality",
  "Education + EdTech",
  "Advertising + Media + Entertainment",
  "Nonprofit + Sustainability",
];

const KEYWORD_MAP = [
  { cat: "Tech (consumer + SaaS)", words: ["tech", "ocean", "blue", "modern", "digital", "neon", "matrix"] },
  { cat: "Fintech + Banking + Insurance", words: ["bank", "fin", "navy", "finance", "money"] },
  { cat: "Healthcare + Pharma", words: ["health", "care", "med", "aqua", "calm"] },
  { cat: "Cybersecurity", words: ["cyber", "dark", "security", "noir"] },
  { cat: "Retail (general)", words: ["retail", "shop", "market"] },
  { cat: "Food + Beverage", words: ["sunset", "forest", "spice", "citrus", "berry", "coffee"] },
  { cat: "Beauty + Fashion", words: ["rose", "blush", "fashion", "velvet"] },
  { cat: "Home + Furniture + Interior", words: ["earth", "terra", "stone", "sand"] },
  { cat: "Real Estate + Construction", words: ["brick", "steel", "build"] },
  { cat: "Automotive", words: ["auto", "drive", "sport", "carbon"] },
  { cat: "Travel + Hospitality", words: ["ocean", "sunset", "coast", "sky", "travel"] },
  { cat: "Education + EdTech", words: ["learn", "bright", "primary"] },
  { cat: "Advertising + Media + Entertainment", words: ["pop", "vivid", "media", "neon", "pulse"] },
  { cat: "Nonprofit + Sustainability", words: ["forest", "green", "earth", "eco"] },
];

const CURATED = {
  "Tech (consumer + SaaS)": [
    { name: "SaaS Primary", colors: ["#0B1B3F", "#0F4C81", "#20A4F3", "#7BDFF2", "#E1F5FE", "#CFD8DC"] },
  ],
  "Fintech + Banking + Insurance": [
    { name: "Fin Growth", colors: ["#0A2342", "#12355B", "#1B4B82", "#1E6F5C", "#7AC74F", "#F1F5F9"] },
  ],
  "Healthcare + Pharma": [
    { name: "Calm Care", colors: ["#0E4C92", "#1FA2BF", "#4DD0E1", "#A7E0DC", "#E5F3F5", "#F8FDFF"] },
  ],
  "Cybersecurity": [
    { name: "Secure Pulse", colors: ["#0B0C10", "#15171F", "#1F2833", "#0EB1D2", "#4DE2EC", "#9EF8FF"] },
  ],
  "Retail (general)": [
    { name: "Retail Rush", colors: ["#B71C1C", "#E53935", "#FB8C00", "#FFCA28", "#212121", "#F5F5F5"] },
  ],
  "Food + Beverage": [
    { name: "Harvest Table", colors: ["#9B1B30", "#D7263D", "#F4A261", "#F6C28B", "#8F9779", "#F7F1E1"] },
  ],
  "Beauty + Fashion": [
    { name: "Runway Luxe", colors: ["#111111", "#2D2A32", "#7F5AF0", "#D4AF37", "#F1E8E6", "#FFFFFF"] },
  ],
  "Home + Furniture + Interior": [
    { name: "Modern Habitat", colors: ["#3E2723", "#6D4C41", "#A1887F", "#D7CCC8", "#ECE0D1", "#F6F0E9"] },
  ],
  "Real Estate + Construction": [
    { name: "Builder Trust", colors: ["#0D1B2A", "#1B263B", "#415A77", "#E0E1DD", "#FCA311", "#FFC857"] },
  ],
  "Automotive": [
    { name: "Performance", colors: ["#0B0C10", "#1F2833", "#C5C6C7", "#66FCF1", "#45A29E", "#F44336"] },
  ],
  "Travel + Hospitality": [
    { name: "Sunrise Jet", colors: ["#0D3B66", "#1E5F74", "#57A773", "#F4D35E", "#EE964B", "#F6F1E9"] },
  ],
  "Education + EdTech": [
    { name: "Campus Bright", colors: ["#0D47A1", "#1565C0", "#00BFA6", "#FFB300", "#FF6F00", "#F5F5F5"] },
  ],
  "Advertising + Media + Entertainment": [
    { name: "Neon Stage", colors: ["#0D0B1E", "#3A0CA3", "#7209B7", "#F72585", "#4CC9F0", "#F8F9FA"] },
  ],
  "Nonprofit + Sustainability": [
    { name: "Earth Steward", colors: ["#0B3D02", "#2E7D32", "#66BB6A", "#A5D6A7", "#DCE775", "#F9FBE7"] },
  ],
};

const normalizeColor = (c) => (c?.startsWith("#") ? c : `#${c || "000000"}`).toUpperCase();

const tweakColor = (hex, seed = 0) => {
  const clean = normalizeColor(hex).replace("#", "");
  const num = parseInt(clean, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const delta = ((seed % 5) - 2) * 6; // -12 to +12
  const clamp = (v) => Math.max(0, Math.min(255, v + delta));
  const toHex = (v) => v.toString(16).padStart(2, "0");
  return `#${toHex(clamp(r))}${toHex(clamp(g))}${toHex(clamp(b))}`.toUpperCase();
};

const funName = (base, idx) => {
  const prefixes = [
    "Pixelated",
    "Coffee-Fueled",
    "Chaos Unicorn",
    "Snackable",
    "Meme-Ready",
    "Overcaffeinated",
    "Sneakerhead",
    "Happy Hour",
    "404 Not Found",
    "Ctrl+Z",
  ];
  const suffixes = [
    "Vibes",
    "Gradient",
    "Palette",
    "Swizzle",
    "Mix",
    "Moodboard",
    "Glow",
    "Refactor",
    "Hotfix",
    "Remix",
  ];
  const pre = prefixes[idx % prefixes.length];
  const suf = suffixes[(idx + 3) % suffixes.length];
  return `${pre} ${suf} (${base})`;
};

const categorizeByName = (name = "") => {
  const lower = name.toLowerCase();
  for (const entry of KEYWORD_MAP) {
    if (entry.words.some((w) => lower.includes(w))) {
      return entry.cat;
    }
  }
  return "Advertising + Media + Entertainment";
};

const mapIndustryToCategory = (industry = "", name = "") => {
  const val = (industry || name || "").toLowerCase();
  const starts = (s) => val.startsWith(s) || val.includes(s);

  if (starts("tech") || starts("saas")) return "Tech (consumer + SaaS)";
  if (starts("finance") || starts("fintech") || starts("bank") || starts("insur"))
    return "Fintech + Banking + Insurance";
  if (starts("health") || starts("pharma") || starts("med")) return "Healthcare + Pharma";
  if (starts("cyber")) return "Cybersecurity";
  if (starts("retail") || starts("shop") || starts("commerce")) return "Retail (general)";
  if (starts("food") || starts("bev") || starts("beverage")) return "Food + Beverage";
  if (starts("beauty") || starts("fashion")) return "Beauty + Fashion";
  if (starts("home") || starts("interior") || starts("furniture")) return "Home + Furniture + Interior";
  if (starts("real estate") || starts("construction") || starts("build"))
    return "Real Estate + Construction";
  if (starts("auto") || starts("ev") || starts("car")) return "Automotive";
  if (starts("travel") || starts("hospitality") || starts("hotel")) return "Travel + Hospitality";
  if (starts("education") || starts("edtech")) return "Education + EdTech";
  if (starts("media") || starts("advert") || starts("entertainment"))
    return "Advertising + Media + Entertainment";
  if (starts("nonprofit") || starts("sustain") || starts("eco") || starts("green"))
    return "Nonprofit + Sustainability";

  return categorizeByName(name);
};

export const fetchTrendingPalettes = async () => {
  const categorized = paletteData.map((p, idx) => {
    const cat = mapIndustryToCategory(p.industry || "", p.name || "");
    return {
      id: `${p.name || 'palette'}-${idx}`,
      name: p.name || `Palette ${idx + 1}`,
      colors: (p.colors || []).map(normalizeColor),
      category: cat,
      brand: null,
      imageUrl: null,
      imageQuery: p.name || cat,
    };
  });

  const filled = [...categorized];
  CATEGORY_NAMES.forEach((cat) => {
    const existing = filled.filter((p) => p.category === cat);
    if (existing.length < 2 && CURATED[cat]) {
      CURATED[cat].forEach((c, i) => {
        filled.push({
          name: `${c.name}`,
          colors: c.colors.map(normalizeColor),
          category: cat,
          brand: null,
          imageUrl: null,
          imageQuery: cat,
        });
      });
    }
  });

  // Ensure each category has at least 15 entries by cloning/rotating palettes
  CATEGORY_NAMES.forEach((cat) => {
    const pool = filled.filter((p) => p.category === cat);
    if (pool.length === 0) return;
    let idx = 0;
    while (filled.filter((p) => p.category === cat).length < 15) {
      const base = pool[idx % pool.length];
      const colors = (base.colors || []).map((c, i) => tweakColor(c, idx + i));
      const shift = (idx % colors.length) || 1;
      const rotated = colors.slice(shift).concat(colors.slice(0, shift)).slice(0, 6);
      filled.push({
        ...base,
        id: `${base.id || base.name || cat}-alt-${idx + 1}`,
        name: funName(base.name || cat, idx + 1),
        colors: rotated.map(normalizeColor),
      });
      idx += 1;
    }
  });

  return filled;
};

export default fetchTrendingPalettes;
