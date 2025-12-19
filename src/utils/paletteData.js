// Expanded palettes grouped by INDUSTRY categories.
// Each item has: industry, name, colors (6 hex values)

const popularPalettes = [
  // -----------------------------
  // Tech (consumer, SaaS, apps) - 15 palettes
  // -----------------------------
  { industry: 'Tech', name: 'SaaS Trust Blue', colors: ['#0B1F3B', '#123B73', '#1D4ED8', '#3B82F6', '#93C5FD', '#F8FAFC'] },
  { industry: 'Tech', name: 'Teal Product UI', colors: ['#062E2E', '#0B4F4F', '#0F766E', '#14B8A6', '#5EEAD4', '#ECFEFF'] },
  { industry: 'Tech', name: 'Modern Gradient Core', colors: ['#2E1065', '#5B21B6', '#7C3AED', '#06B6D4', '#22C55E', '#F8FAFC'] },
  { industry: 'Tech', name: 'Dark Mode Neon Accents', colors: ['#0B0F19', '#111827', '#334155', '#22D3EE', '#A3E635', '#F472B6'] },
  { industry: 'Tech', name: 'Minimal Blue Gray', colors: ['#0F172A', '#1E293B', '#334155', '#64748B', '#CBD5E1', '#F1F5F9'] },
  { industry: 'Tech', name: 'Electric Indigo Cloud', colors: ['#0A1030', '#1C2D6B', '#4338CA', '#6366F1', '#A5B4FC', '#E0E7FF'] },
  { industry: 'Tech', name: 'Vaporwave Terminal', colors: ['#0B1020', '#1F2937', '#6EE7B7', '#34D399', '#A78BFA', '#F9A8D4'] },
  { industry: 'Tech', name: 'Productivity Mint UI', colors: ['#081C2E', '#0F3D3E', '#1F7A8C', '#45DFB1', '#C7F9CC', '#F5FFFB'] },
  { industry: 'Tech', name: 'Infra Console', colors: ['#050810', '#0B1220', '#1F2937', '#22D3EE', '#38BDF8', '#E0F2FE'] },
  { industry: 'Tech', name: 'AI Orchid Circuit', colors: ['#120B2E', '#2E1A47', '#7C3AED', '#C084FC', '#F5D0FE', '#F8FAFC'] },
  { industry: 'Tech', name: 'Data Viz Sunrise', colors: ['#0B1020', '#14364A', '#1D5F8A', '#2DD4BF', '#F59E0B', '#FEF9C3'] },
  { industry: 'Tech', name: 'Retro Terminal Green', colors: ['#050C08', '#0F2414', '#1D3B24', '#22C55E', '#84E1BC', '#ECFDF3'] },
  { industry: 'Tech', name: 'Midnight Lagoon', colors: ['#0B1C2C', '#12394E', '#1E6091', '#16A3A8', '#83EAF1', '#F2F8FA'] },
  { industry: 'Tech', name: 'Solar Flare UI', colors: ['#1B0B2E', '#341A50', '#EB5E28', '#F59E0B', '#FFE066', '#FFF4E6'] },
  { industry: 'Tech', name: 'Frosted Glass UI', colors: ['#0F172A', '#1E293B', '#475569', '#7DD3FC', '#E2E8F0', '#FFFFFF'] },

  // -----------------------------
  // Finance (banking, fintech, insurance) - 15 palettes
  // -----------------------------
  { industry: 'Finance', name: 'Institutional Navy', colors: ['#06162A', '#0B2A4A', '#123C66', '#1E5A8A', '#7AA7C7', '#F5F7FA'] },
  { industry: 'Finance', name: 'Growth Green', colors: ['#052E1B', '#0B4D2A', '#166534', '#22C55E', '#86EFAC', '#F0FDF4'] },
  { industry: 'Finance', name: 'Premium Gold Accent', colors: ['#0B1020', '#1F2937', '#374151', '#8E7224', '#D4AF37', '#FFF7D6'] },
  { industry: 'Finance', name: 'Clean Fintech Teal', colors: ['#062A2A', '#0B4B4B', '#0F766E', '#2DD4BF', '#99F6E4', '#F0FDFA'] },
  { industry: 'Finance', name: 'Platinum Ledger', colors: ['#0A1424', '#10263D', '#1F3B57', '#5F7999', '#C7D2FE', '#F8FAFC'] },
  { industry: 'Finance', name: 'Sapphire Equity', colors: ['#0A1A3F', '#0F2E66', '#1C458A', '#3B82F6', '#93C5FD', '#EAF2FF'] },
  { industry: 'Finance', name: 'Emerald Portfolio', colors: ['#0A2614', '#134023', '#1E5633', '#34D399', '#9AE6B4', '#F0FFF4'] },
  { industry: 'Finance', name: 'Monochrome Statement', colors: ['#0B0B0B', '#1F1F1F', '#343A40', '#6C757D', '#CED4DA', '#F8F9FA'] },
  { industry: 'Finance', name: 'Trustline Gray Blue', colors: ['#0D1726', '#1C2F45', '#2C4A68', '#6B8AA7', '#BFD3E6', '#F4F8FB'] },
  { industry: 'Finance', name: 'Fintech Sunrise', colors: ['#0A1F33', '#0F3D57', '#1E6091', '#34D399', '#F59E0B', '#FDF6E3'] },
  { industry: 'Finance', name: 'Wealth Capsule', colors: ['#0C111D', '#1A2234', '#233952', '#3ECF8E', '#D4AF37', '#F7F3E9'] },
  { industry: 'Finance', name: 'Insurance Calm', colors: ['#081C2C', '#0E304A', '#164B6A', '#5AA6C8', '#B8DCEB', '#F8FAFC'] },
  { industry: 'Finance', name: 'Venture Slate', colors: ['#0D1117', '#161B22', '#26303D', '#58A6FF', '#A5D6FF', '#E6EEF7'] },
  { industry: 'Finance', name: 'Dividend Olive', colors: ['#131814', '#1F2A1E', '#324336', '#86EFAC', '#E5F7DD', '#FAFDF8'] },
  { industry: 'Finance', name: 'High Net Contrast', colors: ['#0D0D0D', '#102A43', '#1D4ED8', '#C026D3', '#F59E0B', '#FFFFFF'] },

  // -----------------------------
  // Healthcare (clinics, pharma, wellness) - 15 palettes
  // -----------------------------
  { industry: 'Healthcare', name: 'Clinical Blue White', colors: ['#081B33', '#0B3C7A', '#2563EB', '#60A5FA', '#DBEAFE', '#FFFFFF'] },
  { industry: 'Healthcare', name: 'Calm Teal Mint', colors: ['#052E2B', '#0B5D57', '#0F766E', '#34D399', '#BBF7D0', '#F0FDF4'] },
  { industry: 'Healthcare', name: 'Soft Pastel Care', colors: ['#F8FAFC', '#E0F2FE', '#E0E7FF', '#DCFCE7', '#FFE4E6', '#FFF7ED'] },
  { industry: 'Healthcare', name: 'Modern Hospital Neutral', colors: ['#0F172A', '#334155', '#64748B', '#CBD5E1', '#E2E8F0', '#F8FAFC'] },
  { industry: 'Healthcare', name: 'Fresh Scrubs', colors: ['#0A2E36', '#0E5668', '#1D9AAA', '#5BD6E5', '#C4F1F9', '#FFFFFF'] },
  { industry: 'Healthcare', name: 'Herbal Wellness', colors: ['#0C2F2E', '#0E5E5A', '#189BA3', '#65C18C', '#D3EBCD', '#F4F9F6'] },
  { industry: 'Healthcare', name: 'Pediatric Pastel', colors: ['#FDF2F8', '#FFE4E6', '#E0F2FE', '#E9D5FF', '#C7D2FE', '#0F172A'] },
  { industry: 'Healthcare', name: 'Wellness Sunrise', colors: ['#0B223A', '#0F3E5A', '#1E5F74', '#F59E0B', '#FDE68A', '#F8FAFC'] },
  { industry: 'Healthcare', name: 'Laboratory Violet', colors: ['#0C1022', '#1E1B4B', '#4338CA', '#A78BFA', '#DDD6FE', '#F8FAFC'] },
  { industry: 'Healthcare', name: 'Dental Fresh', colors: ['#0A2A2A', '#0F4F4F', '#34D399', '#99F6E4', '#E0F2FE', '#FFFFFF'] },
  { industry: 'Healthcare', name: 'Calm Gray Linen', colors: ['#111827', '#374151', '#6B7280', '#D1D5DB', '#E5E7EB', '#F9FAFB'] },
  { industry: 'Healthcare', name: 'Radiology Cyan', colors: ['#071018', '#0F1F2E', '#133C55', '#1F7A8C', '#76B6D8', '#E5F6FF'] },
  { industry: 'Healthcare', name: 'Herbal Leaf', colors: ['#15222A', '#23403D', '#3A7D71', '#55C595', '#C1EED9', '#F8FEFA'] },
  { industry: 'Healthcare', name: 'Healthcare Coral', colors: ['#0B1B2B', '#143D4F', '#1E5F74', '#F97316', '#FDBA74', '#FFE8D9'] },
  { industry: 'Healthcare', name: 'Mindful Lavender', colors: ['#1A1029', '#3C1E5D', '#6D28D9', '#C4B5FD', '#EDE9FE', '#FFFFFF'] },

  // -----------------------------
  // Cybersecurity - 15 palettes
  // -----------------------------
  { industry: 'Cybersecurity', name: 'Threat Intel Dark Cyan', colors: ['#070A12', '#0B1220', '#111827', '#0EA5E9', '#22D3EE', '#E2E8F0'] },
  { industry: 'Cybersecurity', name: 'Secure Lime Accent', colors: ['#05070D', '#0B1220', '#1F2937', '#A3E635', '#D9F99D', '#F8FAFC'] },
  { industry: 'Cybersecurity', name: 'Purple Signal', colors: ['#05050B', '#111827', '#312E81', '#7C3AED', '#C4B5FD', '#F8FAFC'] },
  { industry: 'Cybersecurity', name: 'Matrix Teal', colors: ['#050B10', '#0B1324', '#0F2736', '#0EA5E9', '#22D3EE', '#67E8F9'] },
  { industry: 'Cybersecurity', name: 'Midnight Firewall', colors: ['#050407', '#0F0A14', '#24112B', '#F43F5E', '#FB7185', '#FDF2F8'] },
  { industry: 'Cybersecurity', name: 'Quantum Purple', colors: ['#070711', '#131229', '#2D1B69', '#7C3AED', '#A78BFA', '#EDE9FE'] },
  { industry: 'Cybersecurity', name: 'Infrared Alert', colors: ['#0A0A0A', '#1F1F1F', '#B91C1C', '#F97316', '#FACC15', '#FEFCE8'] },
  { industry: 'Cybersecurity', name: 'Blue Team', colors: ['#071019', '#0D1F2E', '#123A59', '#2563EB', '#60A5FA', '#E0F2FE'] },
  { industry: 'Cybersecurity', name: 'Stealth Glacier', colors: ['#030712', '#0B1220', '#111827', '#38BDF8', '#67E8F9', '#E0F7FF'] },
  { industry: 'Cybersecurity', name: 'Secure Lime Wire', colors: ['#05080D', '#0B141E', '#1F2A3D', '#84CC16', '#D9F99D', '#F7FEE7'] },
  { industry: 'Cybersecurity', name: 'Dark Ops Violet', colors: ['#050308', '#0B0A12', '#1F172A', '#5B21B6', '#E879F9', '#F5EAFE'] },
  { industry: 'Cybersecurity', name: 'Cloud WAF', colors: ['#050915', '#0C1624', '#12283F', '#06B6D4', '#22C55E', '#E5F9F6'] },
  { industry: 'Cybersecurity', name: 'PenTest Sunset', colors: ['#0A0C18', '#0F1A2E', '#122D40', '#FB923C', '#FACC15', '#FFF7ED'] },
  { industry: 'Cybersecurity', name: 'Encryption Amber', colors: ['#0C0A0F', '#1C1725', '#33294A', '#F59E0B', '#FDE68A', '#FFF8E1'] },
  { industry: 'Cybersecurity', name: 'Neon Grid', colors: ['#0A0A0A', '#101820', '#22313F', '#00F5D4', '#7CFFCB', '#F8FEFF'] },

  // -----------------------------
  // Retail (general, ecommerce) - 15 palettes
  // -----------------------------
  { industry: 'Retail', name: 'Sale Red Energy', colors: ['#2B0A0A', '#7F1D1D', '#DC2626', '#F97316', '#FDE68A', '#FFF7ED'] },
  { industry: 'Retail', name: 'Bold Contrast Retail', colors: ['#0B0B0B', '#FFFFFF', '#FF2D2D', '#0B5CFF', '#FFD400', '#00C853'] },
  { industry: 'Retail', name: 'Premium Boutique Mono', colors: ['#0B0B0B', '#1F1F1F', '#3A3A3A', '#BDBDBD', '#EFEFEF', '#FFFFFF'] },
  { industry: 'Retail', name: 'Fresh Market', colors: ['#1B4332', '#2D6A4F', '#52B788', '#B7E4C7', '#FFC300', '#FFF9DB'] },
  { industry: 'Retail', name: 'Urban Street', colors: ['#0F0F0F', '#1F1F1F', '#FF0054', '#FFBE0B', '#3A86FF', '#FFFFFF'] },
  { industry: 'Retail', name: 'Minimal Monoline', colors: ['#121212', '#2E2E2E', '#7A7A7A', '#CFCFCF', '#F7F7F7', '#FFFFFF'] },
  { industry: 'Retail', name: 'Department Sunrise', colors: ['#102542', '#243B55', '#F25F5C', '#FFE066', '#F7FFF7', '#FFFFFF'] },
  { industry: 'Retail', name: 'Pop Shop', colors: ['#0B132B', '#1C2541', '#3A506B', '#5BC0BE', '#FDE74C', '#F4F4F4'] },
  { industry: 'Retail', name: 'Denim & Mustard', colors: ['#0D1B2A', '#1B263B', '#415A77', '#E0E1DD', '#E3B23C', '#F5F3E6'] },
  { industry: 'Retail', name: 'Candy Aisle', colors: ['#FEFAE0', '#F6BD60', '#F28482', '#84A59D', '#F5CAC3', '#6D6875'] },
  { industry: 'Retail', name: 'Premium Retail', colors: ['#0A0A0A', '#1C1C1C', '#7353BA', '#F2C14E', '#F78154', '#F7F7F7'] },
  { industry: 'Retail', name: 'Tech Retail', colors: ['#0D1B2A', '#1B263B', '#0FA3B1', '#F29E4C', '#F4D35E', '#EAEAEA'] },
  { industry: 'Retail', name: 'Outdoor Outfitters', colors: ['#1B3A4B', '#28536B', '#4C7D7E', '#B8DBD9', '#E5E3E8', '#F3F9FB'] },
  { industry: 'Retail', name: 'Farmer Market', colors: ['#3A2C1A', '#5B3D27', '#8C6A43', '#C4A484', '#F1E3D3', '#F7F6F3'] },
  { industry: 'Retail', name: 'Luxe Minimal', colors: ['#0E1111', '#2B303A', '#474B57', '#BDC6CF', '#E9EEF3', '#FFFFFF'] },

  // -----------------------------
  // Food & Beverage - 15 palettes
  // -----------------------------
  { industry: 'Food & Beverage', name: 'Fast Food Punch', colors: ['#7A0B0B', '#E11D48', '#F97316', '#FACC15', '#FFF1C2', '#FFF7ED'] },
  { industry: 'Food & Beverage', name: 'Organic Market', colors: ['#1B4332', '#2D6A4F', '#40916C', '#74C69D', '#D8F3DC', '#F6FFF8'] },
  { industry: 'Food & Beverage', name: 'Coffee Roastery', colors: ['#2A1F14', '#4B3824', '#6B4F31', '#8A6A45', '#DCC7AA', '#FFF7ED'] },
  { industry: 'Food & Beverage', name: 'Craft Citrus', colors: ['#6B2F0F', '#C2410C', '#F97316', '#FBBF24', '#84CC16', '#ECFCCB'] },
  { industry: 'Food & Beverage', name: 'Vineyard Reserve', colors: ['#2C0E37', '#512B58', '#B06AB3', '#F17F29', '#F6C28B', '#FCEFEF'] },
  { industry: 'Food & Beverage', name: 'Summer Smoothie', colors: ['#FFC6FF', '#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#A0C4FF'] },
  { industry: 'Food & Beverage', name: 'Farmhouse Brunch', colors: ['#4F3B2B', '#8A5A44', '#D4A373', '#EED9C4', '#FAEDCD', '#FFF7ED'] },
  { industry: 'Food & Beverage', name: 'Spice Bazaar', colors: ['#3A0F0F', '#6E0D25', '#A61B34', '#E36414', '#F6AA1C', '#F2E8CF'] },
  { industry: 'Food & Beverage', name: 'Tropical Cooler', colors: ['#0B3C5D', '#1C7293', '#65C3BA', '#9AE6B4', '#F4D35E', '#FFF7ED'] },
  { industry: 'Food & Beverage', name: 'Street Food Night', colors: ['#0F0F0F', '#1C1C1C', '#D7263D', '#F46036', '#2E294E', '#F2F3F4'] },
  { industry: 'Food & Beverage', name: 'Tea House', colors: ['#2E2A25', '#4F4A45', '#7D7461', '#BFA18F', '#E8D7C1', '#FAF5EB'] },
  { industry: 'Food & Beverage', name: 'Coastal Seafood', colors: ['#0F1B2C', '#0E3B43', '#357266', '#7BBFA3', '#E9E3D0', '#FFF9ED'] },
  { industry: 'Food & Beverage', name: 'Citrus Grove', colors: ['#1B4332', '#2D6A4F', '#52B788', '#B7E4C7', '#FFB703', '#FFF3C4'] },
  { industry: 'Food & Beverage', name: 'Chocolate Artisan', colors: ['#2B211D', '#3E302B', '#5A4338', '#8D6B5A', '#C4A484', '#F7EFE8'] },
  { industry: 'Food & Beverage', name: 'Matcha Bakery', colors: ['#1F2F26', '#2D4734', '#4F7C57', '#8FB996', '#CFE7CF', '#F7FDF9'] },

  // -----------------------------
  // Beauty & Fashion - 15 palettes
  // -----------------------------
  { industry: 'Beauty & Fashion', name: 'Blush Beauty', colors: ['#FFF1F2', '#FFE4E6', '#FDA4AF', '#FB7185', '#BE123C', '#1F2937'] },
  { industry: 'Beauty & Fashion', name: 'Luxury Black Gold', colors: ['#0B0B0B', '#1F2937', '#374151', '#8E7224', '#D4AF37', '#FFF7D6'] },
  { industry: 'Beauty & Fashion', name: 'Streetwear Neon Accent', colors: ['#0A0A0F', '#111827', '#374151', '#00E5FF', '#FF4FD8', '#A3E635'] },
  { industry: 'Beauty & Fashion', name: 'Desert Rose', colors: ['#3D1F2F', '#5C2B3A', '#B23A48', '#E86A92', '#F9C5D1', '#FEF1F5'] },
  { industry: 'Beauty & Fashion', name: 'Cool Girl Denim', colors: ['#0E1A2B', '#1B3358', '#274690', '#576CA8', '#9DBCF5', '#F4F7FF'] },
  { industry: 'Beauty & Fashion', name: 'Velvet Noir', colors: ['#0A0A0F', '#141421', '#1F1F33', '#8E44AD', '#E84393', '#F8E9F4'] },
  { industry: 'Beauty & Fashion', name: 'Pastel Street', colors: ['#FAF3DD', '#C8D5B9', '#8FC0A9', '#68B0AB', '#696D7D', '#0B132B'] },
  { industry: 'Beauty & Fashion', name: 'Glam Quartz', colors: ['#1B1A17', '#2E2D2B', '#C4B7A6', '#E5DCC3', '#F2E9E4', '#FFFFFF'] },
  { industry: 'Beauty & Fashion', name: 'Sunset Runway', colors: ['#2B0B2E', '#4C1D95', '#9333EA', '#F97316', '#FACC15', '#FFF7ED'] },
  { industry: 'Beauty & Fashion', name: 'Monochrome Editorial', colors: ['#0F0F0F', '#1F1F1F', '#4B4B4B', '#9E9E9E', '#E0E0E0', '#FFFFFF'] },
  { industry: 'Beauty & Fashion', name: 'Retro Sport', colors: ['#12263A', '#F26A8D', '#F49D37', '#76C893', '#E6E6E6', '#FFFFFF'] },
  { industry: 'Beauty & Fashion', name: 'Glowstick Party', colors: ['#0D0B1E', '#2E0F4D', '#7C3AED', '#F72585', '#FFDD00', '#F9F7F3'] },
  { industry: 'Beauty & Fashion', name: 'Minimal Nude', colors: ['#1C1A18', '#332F2C', '#7A5C5C', '#C7A27C', '#EAD7C2', '#F7EFE5'] },
  { industry: 'Beauty & Fashion', name: 'Urban Neon', colors: ['#0A0A0A', '#161616', '#00E5FF', '#FF2D55', '#FFD166', '#F5F5F5'] },
  { industry: 'Beauty & Fashion', name: 'Coastal Chic', colors: ['#0F172A', '#2D3A4A', '#4A5D73', '#A3C4BC', '#E8E9EB', '#FFFFFF'] },

  // -----------------------------
  // Home & Interior - 15 palettes
  // -----------------------------
  { industry: 'Home & Interior', name: 'Warm Neutral Home', colors: ['#2A2420', '#5C4B3E', '#8A7360', '#C9B9A6', '#EFE8E1', '#FFFDF8'] },
  { industry: 'Home & Interior', name: 'Sage + Clay', colors: ['#1F3A2E', '#2D6A4F', '#84A98C', '#CAD2C5', '#CB997E', '#FFF1E6'] },
  { industry: 'Home & Interior', name: 'Scandi Airy', colors: ['#0F172A', '#475569', '#94A3B8', '#E2E8F0', '#F1F5F9', '#FFFFFF'] },
  { industry: 'Home & Interior', name: 'Cozy Hearth', colors: ['#2E1D16', '#4B2E24', '#7A4C39', '#B08968', '#E6CCB2', '#FAF0E6'] },
  { industry: 'Home & Interior', name: 'Desert Adobe', colors: ['#3D2A22', '#6D4C3D', '#A68A64', '#D9C5A0', '#F2E8CF', '#FFFDF6'] },
  { industry: 'Home & Interior', name: 'Coastal Cottage', colors: ['#0E2433', '#2E5266', '#5C8C87', '#A6C3B8', '#E3F2F9', '#FFFFFF'] },
  { industry: 'Home & Interior', name: 'Modern Terracotta', colors: ['#3E2F2B', '#6B4E4A', '#A8715A', '#D6A77A', '#F0D8C0', '#F8F5F1'] },
  { industry: 'Home & Interior', name: 'Smoky Slate', colors: ['#0F172A', '#1F2937', '#4B5563', '#9CA3AF', '#E5E7EB', '#F9FAFB'] },
  { industry: 'Home & Interior', name: 'Rainy Day', colors: ['#1C1F26', '#343A40', '#566572', '#A3B5C6', '#DFE6ED', '#F7F9FC'] },
  { industry: 'Home & Interior', name: 'Botanical Study', colors: ['#223029', '#385946', '#6B8F71', '#B8C4BB', '#E8EEE5', '#FFFFFF'] },
  { industry: 'Home & Interior', name: 'Scandi Forest', colors: ['#233329', '#395B50', '#6F9A8D', '#C9DABF', '#F4F1ED', '#FFFFFF'] },
  { industry: 'Home & Interior', name: 'Minimal Clay', colors: ['#1F1B18', '#3A302A', '#725B52', '#BFA58A', '#E8DCC8', '#FDF8F3'] },
  { industry: 'Home & Interior', name: 'Urban Loft', colors: ['#1B1F2A', '#2F3545', '#4B5566', '#8892B0', '#C5CEE0', '#F0F4FA'] },
  { industry: 'Home & Interior', name: 'Moody Library', colors: ['#221B1A', '#3B2F2D', '#5F4B45', '#A27B5C', '#DCC3A1', '#FBF3E4'] },
  { industry: 'Home & Interior', name: 'Soft Linen', colors: ['#2C2A27', '#4B4842', '#A69F8F', '#D8D2C4', '#EFEAE2', '#FFFFFF'] },

  // -----------------------------
  // Real Estate & Construction - 15 palettes
  // -----------------------------
  { industry: 'Real Estate & Construction', name: 'Property Trust', colors: ['#081A33', '#123B73', '#1E5A8A', '#94A3B8', '#E2E8F0', '#FFFFFF'] },
  { industry: 'Real Estate & Construction', name: 'Construction Hi-Vis', colors: ['#0B0B0B', '#1F2937', '#F59E0B', '#FDE047', '#F97316', '#FFFFFF'] },
  { industry: 'Real Estate & Construction', name: 'Architect Neutral', colors: ['#111827', '#334155', '#64748B', '#CBD5E1', '#E5E7EB', '#FAFAFA'] },
  { industry: 'Real Estate & Construction', name: 'Urban Developer', colors: ['#0B1D2C', '#123850', '#1E5A74', '#4C7D8D', '#B7CBD6', '#FFFFFF'] },
  { industry: 'Real Estate & Construction', name: 'Blueprint', colors: ['#08192F', '#0F2E4A', '#1D4B73', '#3D6EA6', '#7FB2E5', '#EAF2FC'] },
  { industry: 'Real Estate & Construction', name: 'Earth Builder', colors: ['#231F1A', '#3B322A', '#6B4C3B', '#A8795E', '#D8B89C', '#F3E9DD'] },
  { industry: 'Real Estate & Construction', name: 'Concrete Minimal', colors: ['#0F172A', '#1F2937', '#475569', '#94A3B8', '#CBD5E1', '#F8FAFC'] },
  { industry: 'Real Estate & Construction', name: 'Copper Crane', colors: ['#1B1A17', '#332F2B', '#A25B28', '#D98E48', '#F6C453', '#FFF8E1'] },
  { industry: 'Real Estate & Construction', name: 'Slate Skyline', colors: ['#101820', '#1F2A36', '#2E3F53', '#607289', '#A5B4C3', '#E5EAF0'] },
  { industry: 'Real Estate & Construction', name: 'Green Build', colors: ['#102A1C', '#16402A', '#2E6A3F', '#59A970', '#B7E0C2', '#F1F9F4'] },
  { industry: 'Real Estate & Construction', name: 'Luxury Tower', colors: ['#0B0F1A', '#141B2D', '#223559', '#B08968', '#E6CCB2', '#F8F1E7'] },
  { industry: 'Real Estate & Construction', name: 'Marina Estate', colors: ['#0A1A2F', '#10365F', '#2A9D8F', '#8AB4F8', '#E0F2FE', '#FFFFFF'] },
  { industry: 'Real Estate & Construction', name: 'Suburban Warmth', colors: ['#2B211D', '#4B372F', '#7D5A4F', '#B49580', '#E2D5C3', '#FCF8F3'] },
  { industry: 'Real Estate & Construction', name: 'Industrial Yellow', colors: ['#0F141A', '#1F2A32', '#343E46', '#F59E0B', '#FCD34D', '#FFF6DD'] },
  { industry: 'Real Estate & Construction', name: 'Granite Ridge', colors: ['#191D24', '#2B3440', '#4B5563', '#9CA3AF', '#D6D9DE', '#F7F8FA'] },

  // -----------------------------
  // Travel & Hospitality - 15 palettes
  // -----------------------------
  { industry: 'Travel & Hospitality', name: 'Ocean + Sand', colors: ['#062A4A', '#0B4F6C', '#2A9D8F', '#8ECAE6', '#F4A261', '#FFF7ED'] },
  { industry: 'Travel & Hospitality', name: 'Boutique Jewel', colors: ['#0B1020', '#1D3557', '#2A9D8F', '#E9C46A', '#9B2226', '#F8FAFC'] },
  { industry: 'Travel & Hospitality', name: 'Sunset Resort', colors: ['#7A0B2A', '#E11D48', '#FB7185', '#FDBA74', '#FDE68A', '#FFF7ED'] },
  { industry: 'Travel & Hospitality', name: 'Coastal Escape', colors: ['#06223A', '#0B3753', '#256D85', '#52B69A', '#FFE066', '#FFF7ED'] },
  { industry: 'Travel & Hospitality', name: 'Mountain Lodge', colors: ['#1C1F26', '#343A40', '#6C584C', '#A68A64', '#D9C5A0', '#F3ECE2'] },
  { industry: 'Travel & Hospitality', name: 'City Break', colors: ['#0F172A', '#1E293B', '#334155', '#D946EF', '#F59E0B', '#F8FAFC'] },
  { industry: 'Travel & Hospitality', name: 'Santorini', colors: ['#0B2447', '#19376D', '#576CBC', '#A5D7E8', '#FFE9A0', '#FFFFFF'] },
  { industry: 'Travel & Hospitality', name: 'Safari Sunset', colors: ['#2B1A0F', '#4E2D1A', '#8C511F', '#D2691E', '#F4A259', '#F7E9D7'] },
  { industry: 'Travel & Hospitality', name: 'Tropical Resort', colors: ['#0B3B4A', '#16697A', '#489FB5', '#82C0CC', '#F6AE2D', '#F7F7FF'] },
  { industry: 'Travel & Hospitality', name: 'Nordic Aurora', colors: ['#0A182A', '#112D4E', '#3F72AF', '#8EE3EF', '#EDF6F9', '#FFFFFF'] },
  { industry: 'Travel & Hospitality', name: 'Desert Caravan', colors: ['#3D1F1A', '#6A2C25', '#A44A3F', '#DA7635', '#F3B15C', '#FFF4E6'] },
  { industry: 'Travel & Hospitality', name: 'Harbor Morning', colors: ['#0E1E2F', '#1B3A4B', '#2E6171', '#7EA8BE', '#CDE6F5', '#FFFFFF'] },
  { industry: 'Travel & Hospitality', name: 'Rainforest Retreat', colors: ['#102720', '#1B4332', '#2D6A4F', '#74C69D', '#C9E4C5', '#F7FFF7'] },
  { industry: 'Travel & Hospitality', name: 'Urban Boutique', colors: ['#171321', '#2C2A3E', '#514663', '#F2545B', '#FDBF60', '#F5F5F5'] },
  { industry: 'Travel & Hospitality', name: 'Alpine Air', colors: ['#0A1B2A', '#19324A', '#507DBC', '#A1C6EA', '#E2EFF7', '#FFFFFF'] },

  // -----------------------------
  // Education & EdTech - 15 palettes
  // -----------------------------
  { industry: 'Education & EdTech', name: 'Friendly Primaries', colors: ['#EF4444', '#3B82F6', '#FACC15', '#22C55E', '#A855F7', '#F8FAFC'] },
  { industry: 'Education & EdTech', name: 'Trustworthy Learning', colors: ['#0B1F3B', '#1D4ED8', '#0F766E', '#22C55E', '#93C5FD', '#F8FAFC'] },
  { industry: 'Education & EdTech', name: 'Soft Study Pastels', colors: ['#EEF2FF', '#E0F2FE', '#ECFDF3', '#FFF7ED', '#FFE4E6', '#F8FAFC'] },
  { industry: 'Education & EdTech', name: 'Primary Slate', colors: ['#0F172A', '#1D4ED8', '#F59E0B', '#FACC15', '#22C55E', '#FFFFFF'] },
  { industry: 'Education & EdTech', name: 'STEM Lab', colors: ['#0B1B3F', '#12355B', '#1D5D9B', '#0EA5E9', '#67E8F9', '#E0F2FE'] },
  { industry: 'Education & EdTech', name: 'Chalkboard', colors: ['#0B0C10', '#1F2833', '#C5C6C7', '#66FCF1', '#45A29E', '#FFFFFF'] },
  { industry: 'Education & EdTech', name: 'Campus Quad', colors: ['#243B53', '#3E5C76', '#5C7C99', '#9FB3C8', '#D9E2EC', '#F8FAFC'] },
  { industry: 'Education & EdTech', name: 'Teacher Pet', colors: ['#7C3AED', '#F472B6', '#F59E0B', '#22C55E', '#3B82F6', '#FFFFFF'] },
  { industry: 'Education & EdTech', name: 'Study Hall', colors: ['#0F172A', '#334155', '#F97316', '#FDBA74', '#FCD34D', '#FFF7ED'] },
  { industry: 'Education & EdTech', name: 'EdTech Mint', colors: ['#081C2E', '#0F3D3E', '#1F7A8C', '#45DFB1', '#C7F9CC', '#F5FFFB'] },
  { industry: 'Education & EdTech', name: 'Science Fair', colors: ['#0B132B', '#1C2541', '#3A506B', '#5BC0BE', '#FDE74C', '#FFFFFF'] },
  { industry: 'Education & EdTech', name: 'Library Wood', colors: ['#2F2A25', '#57493D', '#7F6856', '#B89B82', '#E8DCC6', '#FAF5EE'] },
  { industry: 'Education & EdTech', name: 'Recess Pastels', colors: ['#FFE3E3', '#E0F2FE', '#ECFDF3', '#FFF7ED', '#F3E8FF', '#0F172A'] },
  { industry: 'Education & EdTech', name: 'Dorm Night', colors: ['#0F172A', '#1E293B', '#334155', '#E11D48', '#F59E0B', '#F8FAFC'] },
  { industry: 'Education & EdTech', name: 'Global Classroom', colors: ['#0B3B36', '#0E5E6F', '#3FA7D6', '#6AD5CB', '#F3D250', '#F8F9FA'] },

  // -----------------------------
  // Media, Advertising & Entertainment - 15 palettes
  // -----------------------------
  { industry: 'Media & Advertising', name: 'Neon Campaign', colors: ['#0B0B12', '#111827', '#FF2D55', '#7C3AED', '#00E5FF', '#A3E635'] },
  { industry: 'Media & Advertising', name: 'Vibrant Complementary', colors: ['#1D4ED8', '#60A5FA', '#F97316', '#FDBA74', '#0F172A', '#F8FAFC'] },
  { industry: 'Media & Advertising', name: 'Festival Gradient Mix', colors: ['#7C3AED', '#EC4899', '#F97316', '#FACC15', '#22C55E', '#06B6D4'] },
  { industry: 'Media & Advertising', name: 'Pop Art', colors: ['#0D0D0D', '#161616', '#FF595E', '#FFCA3A', '#8AC926', '#1982C4'] },
  { industry: 'Media & Advertising', name: 'Candy Gradient', colors: ['#2E1065', '#7C3AED', '#EC4899', '#FB7185', '#F59E0B', '#FEF3C7'] },
  { industry: 'Media & Advertising', name: 'Spotlight', colors: ['#0B1020', '#1D3557', '#A8DADC', '#F1FAEE', '#E63946', '#F6E6E4'] },
  { industry: 'Media & Advertising', name: 'Streaming Glow', colors: ['#0A0A0F', '#111827', '#2DD4BF', '#06B6D4', '#F43F5E', '#F9A8D4'] },
  { industry: 'Media & Advertising', name: 'Purple Pulse', colors: ['#0F0A1F', '#321C64', '#6639A6', '#F25F5C', '#F5B700', '#F6F6F9'] },
  { industry: 'Media & Advertising', name: 'Citrus Pop', colors: ['#13293D', '#006494', '#247BA0', '#F4D35E', '#EE964B', '#F2F4F3'] },
  { industry: 'Media & Advertising', name: 'Neon Billboard', colors: ['#050505', '#0B1220', '#312E81', '#F72585', '#4CC9F0', '#F7F7FF'] },
  { industry: 'Media & Advertising', name: 'Festival Lights', colors: ['#1B2A49', '#3D518C', '#6A8EAE', '#F4E9CD', '#FF6B6B', '#FFE66D'] },
  { industry: 'Media & Advertising', name: 'Viral Loop', colors: ['#0B1220', '#1F2937', '#22D3EE', '#A78BFA', '#F472B6', '#F8FAFC'] },
  { industry: 'Media & Advertising', name: 'Media Sunset', colors: ['#0A2239', '#1D3C59', '#416788', '#F45B69', '#F7B801', '#F9F7F3'] },
  { industry: 'Media & Advertising', name: 'Cinematic Noir', colors: ['#0B0B0C', '#16171B', '#2C2F36', '#9B2226', '#E07A5F', '#F4F1EA'] },
  { industry: 'Media & Advertising', name: 'Creative Studio', colors: ['#0D1B2A', '#1B263B', '#415A77', '#E0E1DD', '#FFC857', '#F7F3E9'] },

  // -----------------------------
  // Nonprofit & Sustainability - 15 palettes
  // -----------------------------
  { industry: 'Nonprofit & Sustainability', name: 'Earth + Leaf', colors: ['#1B4332', '#2D6A4F', '#74C69D', '#D8F3DC', '#8A6A45', '#FFF7ED'] },
  { industry: 'Nonprofit & Sustainability', name: 'Clean Impact Blue', colors: ['#0B2A4A', '#123B73', '#2563EB', '#93C5FD', '#E0F2FE', '#FFFFFF'] },
  { industry: 'Nonprofit & Sustainability', name: 'Warm Community', colors: ['#7A2E0B', '#C2410C', '#F97316', '#FDE68A', '#22C55E', '#F8FAFC'] },
  { industry: 'Nonprofit & Sustainability', name: 'Forest Steward', colors: ['#0B3621', '#134E39', '#207561', '#6DB193', '#C2EABD', '#F7FFF7'] },
  { industry: 'Nonprofit & Sustainability', name: 'Solar Hope', colors: ['#10212B', '#1B3B4D', '#276678', '#F59E0B', '#FCD34D', '#FFF7E6'] },
  { industry: 'Nonprofit & Sustainability', name: 'River Clean', colors: ['#0B1F32', '#0F3F5B', '#1D5F8A', '#2DD4BF', '#9AE6B4', '#E0F2FE'] },
  { industry: 'Nonprofit & Sustainability', name: 'Urban Garden', colors: ['#1C1F1A', '#2E332B', '#4F6F52', '#86A789', '#C5DDB1', '#F5F8EC'] },
  { industry: 'Nonprofit & Sustainability', name: 'Coral Reef', colors: ['#0A2239', '#1D3C59', '#416788', '#5FBFF9', '#F45D01', '#FFE8D6'] },
  { industry: 'Nonprofit & Sustainability', name: 'Community Block', colors: ['#2C1A1D', '#583D3F', '#8E6C88', '#C6A9B0', '#F2D7D9', '#FFF5F7'] },
  { industry: 'Nonprofit & Sustainability', name: 'Clean Water', colors: ['#0B132B', '#1C2541', '#3A506B', '#5BC0BE', '#86EFD0', '#F7FFF7'] },
  { industry: 'Nonprofit & Sustainability', name: 'Green Jobs', colors: ['#0F1B2C', '#16324F', '#1E4B3F', '#2D6A4F', '#8DDB8C', '#EEF8EC'] },
  { industry: 'Nonprofit & Sustainability', name: 'Prairie Sky', colors: ['#1B2A41', '#324A5F', '#4A6D82', '#7AB8BF', '#CDEDF6', '#FFFFFF'] },
  { industry: 'Nonprofit & Sustainability', name: 'Rain Collector', colors: ['#0A0F1C', '#1C2A38', '#274156', '#45B69C', '#E4FDE1', '#F8FBFF'] },
  { industry: 'Nonprofit & Sustainability', name: 'Earth Clay', colors: ['#2E2A25', '#4F473E', '#7C6A58', '#B49A7D', '#DECBB7', '#F8F1EB'] },
  { industry: 'Nonprofit & Sustainability', name: 'Night Market', colors: ['#0D0F0E', '#1E231F', '#384036', '#9FB8A0', '#DDE5D3', '#F8FBF4'] },

  // -----------------------------
  // Automotive - 15 palettes
  // -----------------------------
  { industry: 'Automotive', name: 'Track Day Red', colors: ['#0B0C10', '#1F2833', '#C3073F', '#950740', '#6F2232', '#F1F2F6'] },
  { industry: 'Automotive', name: 'Electric Blue EV', colors: ['#0A192F', '#112D4E', '#3F72AF', '#00A8E8', '#7FDBFF', '#E2EFF7'] },
  { industry: 'Automotive', name: 'Heritage Racing', colors: ['#0B1B2B', '#1C3A5F', '#2E5984', '#F2A541', '#F29F05', '#F8F3E9'] },
  { industry: 'Automotive', name: 'Carbon Fiber', colors: ['#0D0D0D', '#1F1F1F', '#343434', '#5C5C5C', '#A3A3A3', '#E6E6E6'] },
  { industry: 'Automotive', name: 'Offroad Olive', colors: ['#1A2613', '#2F4F1B', '#4A7C32', '#8AB446', '#C7E59E', '#F4F9E9'] },
  { industry: 'Automotive', name: 'Sunset Cruiser', colors: ['#2C1B18', '#4B2E2B', '#7E4B3A', '#D67D3E', '#F4A259', '#F8E9D1'] },
  { industry: 'Automotive', name: 'Luxury Sedan', colors: ['#0E141A', '#1C2B36', '#2E4558', '#B89B72', '#E8D5B7', '#FFFFFF'] },
  { industry: 'Automotive', name: 'Sport Luxe', colors: ['#0B0B0F', '#141421', '#1F1F33', '#F2C14E', '#F78154', '#FFFFFF'] },
  { industry: 'Automotive', name: 'Circuit Neon', colors: ['#050708', '#0F172A', '#1E293B', '#00D4FF', '#7CFFCB', '#E9F5FF'] },
  { industry: 'Automotive', name: 'Rally Dust', colors: ['#2B1D16', '#463229', '#6E4E37', '#A17452', '#D9B08C', '#F4E4CC'] },
  { industry: 'Automotive', name: 'Coastal Drive', colors: ['#0D1B2A', '#1B263B', '#415A77', '#78A1BB', '#E0E1DD', '#FFFFFF'] },
  { industry: 'Automotive', name: 'Studio Matte', colors: ['#111318', '#191E24', '#262C36', '#70798C', '#C9D1D9', '#F5F7FA'] },
  { industry: 'Automotive', name: 'Vintage Convertible', colors: ['#2B211D', '#4B372F', '#7D5A4F', '#C08A5D', '#E6BE8A', '#F9EFE3'] },
  { industry: 'Automotive', name: 'Neon Garage', colors: ['#0A0A0A', '#161616', '#FF0054', '#00F5D4', '#FEE440', '#F5F5F5'] },
  { industry: 'Automotive', name: 'Alpine Rally', colors: ['#0A1B2A', '#112E42', '#1C4C73', '#54A0FF', '#A1C9F1', '#F2F7FD'] },
];

export default popularPalettes;
