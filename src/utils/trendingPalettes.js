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

const categorizeByName = (name = "") => {
  const lower = name.toLowerCase();
  for (const entry of KEYWORD_MAP) {
    if (entry.words.some((w) => lower.includes(w))) {
      return entry.cat;
    }
  }
  return "Advertising + Media + Entertainment";
};

export const fetchTrendingPalettes = async () => {
  const categorized = paletteData.map((p, idx) => {
    const cat = categorizeByName(p.name || "");
    return {
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

  return filled;
};

export default fetchTrendingPalettes;
