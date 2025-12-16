// Expanded palettes grouped by INDUSTRY categories.
// Each item has: industry, name, colors (6 hex values)

const popularPalettes = [
  // -----------------------------
  // Tech (consumer, SaaS, apps)
  // -----------------------------
  {
    industry: 'Tech',
    name: 'SaaS Trust Blue',
    colors: ['#0B1F3B', '#123B73', '#1D4ED8', '#3B82F6', '#93C5FD', '#F8FAFC'],
  },
  {
    industry: 'Tech',
    name: 'Teal Product UI',
    colors: ['#062E2E', '#0B4F4F', '#0F766E', '#14B8A6', '#5EEAD4', '#ECFEFF'],
  },
  {
    industry: 'Tech',
    name: 'Modern Gradient Core',
    colors: ['#2E1065', '#5B21B6', '#7C3AED', '#06B6D4', '#22C55E', '#F8FAFC'],
  },
  {
    industry: 'Tech',
    name: 'Dark Mode Neon Accents',
    colors: ['#0B0F19', '#111827', '#334155', '#22D3EE', '#A3E635', '#F472B6'],
  },
  {
    industry: 'Tech',
    name: 'Minimal Blue Gray',
    colors: ['#0F172A', '#1E293B', '#334155', '#64748B', '#CBD5E1', '#F1F5F9'],
  },

  // -----------------------------
  // Finance (banking, fintech, insurance)
  // -----------------------------
  {
    industry: 'Finance',
    name: 'Institutional Navy',
    colors: ['#06162A', '#0B2A4A', '#123C66', '#1E5A8A', '#7AA7C7', '#F5F7FA'],
  },
  {
    industry: 'Finance',
    name: 'Growth Green',
    colors: ['#052E1B', '#0B4D2A', '#166534', '#22C55E', '#86EFAC', '#F0FDF4'],
  },
  {
    industry: 'Finance',
    name: 'Premium Gold Accent',
    colors: ['#0B1020', '#1F2937', '#374151', '#8E7224', '#D4AF37', '#FFF7D6'],
  },
  {
    industry: 'Finance',
    name: 'Clean Fintech Teal',
    colors: ['#062A2A', '#0B4B4B', '#0F766E', '#2DD4BF', '#99F6E4', '#F0FDFA'],
  },

  // -----------------------------
  // Healthcare (clinics, pharma, wellness)
  // -----------------------------
  {
    industry: 'Healthcare',
    name: 'Clinical Blue White',
    colors: ['#081B33', '#0B3C7A', '#2563EB', '#60A5FA', '#DBEAFE', '#FFFFFF'],
  },
  {
    industry: 'Healthcare',
    name: 'Calm Teal Mint',
    colors: ['#052E2B', '#0B5D57', '#0F766E', '#34D399', '#BBF7D0', '#F0FDF4'],
  },
  {
    industry: 'Healthcare',
    name: 'Soft Pastel Care',
    colors: ['#F8FAFC', '#E0F2FE', '#E0E7FF', '#DCFCE7', '#FFE4E6', '#FFF7ED'],
  },
  {
    industry: 'Healthcare',
    name: 'Modern Hospital Neutral',
    colors: ['#0F172A', '#334155', '#64748B', '#CBD5E1', '#E2E8F0', '#F8FAFC'],
  },

  // -----------------------------
  // Cybersecurity
  // -----------------------------
  {
    industry: 'Cybersecurity',
    name: 'Threat Intel Dark Cyan',
    colors: ['#070A12', '#0B1220', '#111827', '#0EA5E9', '#22D3EE', '#E2E8F0'],
  },
  {
    industry: 'Cybersecurity',
    name: 'Secure Lime Accent',
    colors: ['#05070D', '#0B1220', '#1F2937', '#A3E635', '#D9F99D', '#F8FAFC'],
  },
  {
    industry: 'Cybersecurity',
    name: 'Purple Signal',
    colors: ['#05050B', '#111827', '#312E81', '#7C3AED', '#C4B5FD', '#F8FAFC'],
  },

  // -----------------------------
  // Retail (general, ecommerce)
  // -----------------------------
  {
    industry: 'Retail',
    name: 'Sale Red Energy',
    colors: ['#2B0A0A', '#7F1D1D', '#DC2626', '#F97316', '#FDE68A', '#FFF7ED'],
  },
  {
    industry: 'Retail',
    name: 'Bold Contrast Retail',
    colors: ['#0B0B0B', '#FFFFFF', '#FF2D2D', '#0B5CFF', '#FFD400', '#00C853'],
  },
  {
    industry: 'Retail',
    name: 'Premium Boutique Mono',
    colors: ['#0B0B0B', '#1F1F1F', '#3A3A3A', '#BDBDBD', '#EFEFEF', '#FFFFFF'],
  },

  // -----------------------------
  // Food & Beverage
  // -----------------------------
  {
    industry: 'Food & Beverage',
    name: 'Fast Food Punch',
    colors: ['#7A0B0B', '#E11D48', '#F97316', '#FACC15', '#FFF1C2', '#FFF7ED'],
  },
  {
    industry: 'Food & Beverage',
    name: 'Organic Market',
    colors: ['#1B4332', '#2D6A4F', '#40916C', '#74C69D', '#D8F3DC', '#F6FFF8'],
  },
  {
    industry: 'Food & Beverage',
    name: 'Coffee Roastery',
    colors: ['#2A1F14', '#4B3824', '#6B4F31', '#8A6A45', '#DCC7AA', '#FFF7ED'],
  },
  {
    industry: 'Food & Beverage',
    name: 'Craft Citrus',
    colors: ['#6B2F0F', '#C2410C', '#F97316', '#FBBF24', '#84CC16', '#ECFCCB'],
  },

  // -----------------------------
  // Beauty & Fashion
  // -----------------------------
  {
    industry: 'Beauty & Fashion',
    name: 'Blush Beauty',
    colors: ['#FFF1F2', '#FFE4E6', '#FDA4AF', '#FB7185', '#BE123C', '#1F2937'],
  },
  {
    industry: 'Beauty & Fashion',
    name: 'Luxury Black Gold',
    colors: ['#0B0B0B', '#1F2937', '#374151', '#8E7224', '#D4AF37', '#FFF7D6'],
  },
  {
    industry: 'Beauty & Fashion',
    name: 'Streetwear Neon Accent',
    colors: ['#0A0A0F', '#111827', '#374151', '#00E5FF', '#FF4FD8', '#A3E635'],
  },

  // -----------------------------
  // Home & Interior
  // -----------------------------
  {
    industry: 'Home & Interior',
    name: 'Warm Neutral Home',
    colors: ['#2A2420', '#5C4B3E', '#8A7360', '#C9B9A6', '#EFE8E1', '#FFFDF8'],
  },
  {
    industry: 'Home & Interior',
    name: 'Sage + Clay',
    colors: ['#1F3A2E', '#2D6A4F', '#84A98C', '#CAD2C5', '#CB997E', '#FFF1E6'],
  },
  {
    industry: 'Home & Interior',
    name: 'Scandi Airy',
    colors: ['#0F172A', '#475569', '#94A3B8', '#E2E8F0', '#F1F5F9', '#FFFFFF'],
  },

  // -----------------------------
  // Real Estate & Construction
  // -----------------------------
  {
    industry: 'Real Estate & Construction',
    name: 'Property Trust',
    colors: ['#081A33', '#123B73', '#1E5A8A', '#94A3B8', '#E2E8F0', '#FFFFFF'],
  },
  {
    industry: 'Real Estate & Construction',
    name: 'Construction Hi-Vis',
    colors: ['#0B0B0B', '#1F2937', '#F59E0B', '#FDE047', '#F97316', '#FFFFFF'],
  },
  {
    industry: 'Real Estate & Construction',
    name: 'Architect Neutral',
    colors: ['#111827', '#334155', '#64748B', '#CBD5E1', '#E5E7EB', '#FAFAFA'],
  },

  // -----------------------------
  // Travel & Hospitality
  // -----------------------------
  {
    industry: 'Travel & Hospitality',
    name: 'Ocean + Sand',
    colors: ['#062A4A', '#0B4F6C', '#2A9D8F', '#8ECAE6', '#F4A261', '#FFF7ED'],
  },
  {
    industry: 'Travel & Hospitality',
    name: 'Boutique Jewel',
    colors: ['#0B1020', '#1D3557', '#2A9D8F', '#E9C46A', '#9B2226', '#F8FAFC'],
  },
  {
    industry: 'Travel & Hospitality',
    name: 'Sunset Resort',
    colors: ['#7A0B2A', '#E11D48', '#FB7185', '#FDBA74', '#FDE68A', '#FFF7ED'],
  },

  // -----------------------------
  // Education & EdTech
  // -----------------------------
  {
    industry: 'Education & EdTech',
    name: 'Friendly Primaries',
    colors: ['#EF4444', '#3B82F6', '#FACC15', '#22C55E', '#A855F7', '#F8FAFC'],
  },
  {
    industry: 'Education & EdTech',
    name: 'Trustworthy Learning',
    colors: ['#0B1F3B', '#1D4ED8', '#0F766E', '#22C55E', '#93C5FD', '#F8FAFC'],
  },
  {
    industry: 'Education & EdTech',
    name: 'Soft Study Pastels',
    colors: ['#EEF2FF', '#E0F2FE', '#ECFDF3', '#FFF7ED', '#FFE4E6', '#F8FAFC'],
  },

  // -----------------------------
  // Media, Advertising & Entertainment
  // -----------------------------
  {
    industry: 'Media & Advertising',
    name: 'Neon Campaign',
    colors: ['#0B0B12', '#111827', '#FF2D55', '#7C3AED', '#00E5FF', '#A3E635'],
  },
  {
    industry: 'Media & Advertising',
    name: 'Vibrant Complementary',
    colors: ['#1D4ED8', '#60A5FA', '#F97316', '#FDBA74', '#0F172A', '#F8FAFC'],
  },
  {
    industry: 'Media & Advertising',
    name: 'Festival Gradient Mix',
    colors: ['#7C3AED', '#EC4899', '#F97316', '#FACC15', '#22C55E', '#06B6D4'],
  },

  // -----------------------------
  // Nonprofit & Sustainability
  // -----------------------------
  {
    industry: 'Nonprofit & Sustainability',
    name: 'Earth + Leaf',
    colors: ['#1B4332', '#2D6A4F', '#74C69D', '#D8F3DC', '#8A6A45', '#FFF7ED'],
  },
  {
    industry: 'Nonprofit & Sustainability',
    name: 'Clean Impact Blue',
    colors: ['#0B2A4A', '#123B73', '#2563EB', '#93C5FD', '#E0F2FE', '#FFFFFF'],
  },
  {
    industry: 'Nonprofit & Sustainability',
    name: 'Warm Community',
    colors: ['#7A2E0B', '#C2410C', '#F97316', '#FDE68A', '#22C55E', '#F8FAFC'],
  },
];

export default popularPalettes;
