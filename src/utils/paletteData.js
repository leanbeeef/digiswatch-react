// Example popular palettes data
const popularPalettes = [
    {
        name: 'Sunset',
        colors: ['#ff6b6b', '#ff8c42', '#ffd700', '#ffcc29', '#ffaa33', '#ff6f61'],
    },
    {
        name: 'Ocean Blue',
        colors: ['#004e92', '#4286f4', '#00b4db', '#0083b0', '#0052cc', '#4a90e2'],
    },
    {
        name: 'Forest Greens',
        colors: ['#0b3d0b', '#004d00', '#008f00', '#00cc00', '#00e600', '#29a329'],
    },
    {
        name: 'Purple Hues',
        colors: ['#6a0dad', '#9b30ff', '#800080', '#dda0dd', '#e066ff', '#ba55d3'],
    },
    {
        name: 'Vintage Pastels',
        colors: ['#f4e1d2', '#e8c1c1', '#c5a3a3', '#a1a3c5', '#c1c1e8', '#d2e1f4'],
    },
    {
        name: 'Earth Tones',
        colors: ['#a0522d', '#cd853f', '#deb887', '#f5deb3', '#e0c097', '#c19a6b'],
    },
    {
        name: 'Neon Lights',
        colors: ['#ff6ec7', '#ff33cc', '#cc33ff', '#9933ff', '#6699ff', '#33ccff'],
    },
    {
        name: 'Warm Autumn',
        colors: ['#ff7f50', '#ff6347', '#ff4500', '#db7093', '#e9967a', '#f08080'],
    },
    {
        name: 'Cool Winter',
        colors: ['#4682b4', '#5f9ea0', '#6495ed', '#00ced1', '#1e90ff', '#87cefa'],
    },
    {
        name: 'Monochrome Grays',
        colors: ['#111111', '#222222', '#333333', '#444444', '#555555', '#666666'],
    },
    {
        name: 'Fresh Spring',
        colors: ['#98fb98', '#00fa9a', '#00ff7f', '#7fff00', '#7cfc00', '#adff2f'],
    },
    {
        name: 'Pastel Rainbow',
        colors: ['#ffd1dc', '#ffe4e1', '#e6e6fa', '#e0ffff', '#e0ffe0', '#ffffe0'],
    },
    {
        name: 'Bold Primary',
        colors: ['#ff0000', '#0000ff', '#ffff00', '#00ff00', '#ff00ff', '#00ffff'],
    },
    {
        name: 'Elegant Neutrals',
        colors: ['#f5f5f5', '#e0e0e0', '#cccccc', '#b3b3b3', '#999999', '#808080'],
    },
    {
        name: 'Chocolate Delight',
        colors: ['#7b3f00', '#a0522d', '#8b4513', '#d2691e', '#cd853f', '#f4a460'],
    },
    {
        name: 'Tropical Paradise',
        colors: ['#ff4500', '#ff8c00', '#ffd700', '#7cfc00', '#00fa9a', '#00ffff'],
    },
    {
        name: 'Muted Earth',
        colors: ['#806b63', '#a68b79', '#c3a697', '#e0c6b5', '#f7e6d3', '#d9cab3'],
    },
    {
        name: 'Royal Gold',
        colors: ['#ffd700', '#daa520', '#b8860b', '#ff8c00', '#ff7f50', '#ff6347'],
    },
    {
        name: 'Minimalist Blue',
        colors: ['#dbe9ee', '#a9cfd8', '#79b1c1', '#4f94af', '#266b8e', '#1b4f72'],
    },
    {
        name: 'Floral Bouquet',
        colors: ['#ffb6c1', '#ff69b4', '#db7093', '#ff1493', '#c71585', '#d8bfd8'],
    },
    {
        name: 'Fiery Reds',
        colors: ['#ff0000', '#e60000', '#cc0000', '#b30000', '#990000', '#800000'],
    },
    {
        name: 'Soft Pinks',
        colors: ['#ffe4e1', '#ffccd5', '#ffb6c1', '#ff9999', '#ff7f7f', '#ff6666'],
    },
    {
        name: 'Deep Blues',
        colors: ['#00008b', '#0000cd', '#0000ff', '#1e90ff', '#4169e1', '#6495ed'],
    },
    {
        name: 'Golden Yellows',
        colors: ['#fff8dc', '#ffebcd', '#ffe4b5', '#ffd700', '#ffc107', '#ffb300'],
    },
    {
        name: 'Nature Greens',
        colors: ['#006400', '#008000', '#228b22', '#2e8b57', '#3cb371', '#66cdaa'],
    },
    {
        name: 'Citrus Tones',
        colors: ['#ff4500', '#ff6347', '#ff7f50', '#ffa07a', '#ff8c00', '#ffd700'],
    },
    {
        name: 'Royal Purples',
        colors: ['#4b0082', '#800080', '#8a2be2', '#9932cc', '#ba55d3', '#9400d3'],
    },
    {
        name: 'Metallics',
        colors: ['#c0c0c0', '#d4af37', '#b87333', '#e5e4e2', '#aaa9ad', '#d3d3d3'],
    },
    {
        name: 'Earthy Browns',
        colors: ['#8b4513', '#a0522d', '#cd853f', '#deb887', '#d2b48c', '#f4a460'],
    },
    {
        name: 'Ocean Waves',
        colors: ['#006994', '#008cba', '#00bfff', '#1e90ff', '#87cefa', '#add8e6'],
    },
    {
        name: 'Sunrise',
        colors: ['#ff5e62', '#ff9966', '#ffba92', '#ffd1b3', '#ffe4c4', '#fff0e0'],
    },
    {
        name: 'Moss Greens',
        colors: ['#556b2f', '#6b8e23', '#808000', '#9acd32', '#adff2f', '#bdb76b'],
    },
    {
        name: 'Berry Tones',
        colors: ['#8b0000', '#a52a2a', '#b22222', '#dc143c', '#ff0000', '#ff6347'],
    },
    {
        name: 'Ice Blues',
        colors: ['#e0ffff', '#afeeee', '#b0e0e6', '#add8e6', '#87ceeb', '#87cefa'],
    },
    {
        name: 'Lavender Fields',
        colors: ['#e6e6fa', '#d8bfd8', '#dda0dd', '#da70d6', '#ba55d3', '#9932cc'],
    },
    {
        name: 'Bright Oranges',
        colors: ['#ff7f00', '#ff8c00', '#ffa500', '#ffb347', '#ffcc33', '#ffdb58'],
    },
    {
        name: 'Pale Pastels',
        colors: ['#fdfd96', '#ffffe0', '#e0ffff', '#e0ffe0', '#e6e6fa', '#ffe4e1'],
    },
    {
        name: 'Classic Blacks',
        colors: ['#000000', '#0a0a0a', '#141414', '#1f1f1f', '#2a2a2a', '#333333'],
    },
    {
        name: 'Sunflower',
        colors: ['#fffacd', '#ffeb3b', '#ffd700', '#ffc107', '#ffb300', '#ffa000'],
    },
    {
        name: 'Mint Fresh',
        colors: ['#f5fffa', '#e0fff0', '#ccffe6', '#b3ffda', '#99ffcc', '#80ffbf'],
    },
    {
        name: 'Urban Chic',
        colors: ['#2c3e50', '#34495e', '#7f8c8d', '#95a5a6', '#bdc3c7', '#ecf0f1'],
    },
    {
        name: 'Vibrant Violet',
        colors: ['#ee82ee', '#da70d6', '#dda0dd', '#ba55d3', '#9932cc', '#9400d3'],
    },
    {
        name: 'Lime Punch',
        colors: ['#32cd32', '#9acd32', '#adff2f', '#7fff00', '#7cfc00', '#76ff7a'],
    },
    {
        name: 'Peachy Keen',
        colors: ['#ffe5b4', '#ffdab9', '#ffcba4', '#ffb347', '#ffa07a', '#ff8c69'],
    },
    {
        name: 'Midnight Blues',
        colors: ['#191970', '#000080', '#00008b', '#0000cd', '#0000ff', '#1e90ff'],
    },
    {
        name: 'Rustic Reds',
        colors: ['#8b0000', '#a52a2a', '#b22222', '#bc8f8f', '#cd5c5c', '#d2691e'],
    },
    {
        name: 'Creams and Beiges',
        colors: ['#fffdd0', '#fff8dc', '#faebd7', '#f5f5dc', '#f5f5f5', '#f0ead6'],
    },
    {
        name: 'Cobalt Blues',
        colors: ['#0047ab', '#0050d4', '#0059ff', '#0062ff', '#006bff', '#0074ff'],
    },
    {
        name: 'Sunny Days',
        colors: ['#fff700', '#ffea00', '#ffd700', '#ffca00', '#ffbd00', '#ffb000'],
    },
    {
        name: 'Earth Greens',
        colors: ['#556b2f', '#6b8e23', '#808000', '#9acd32', '#adff2f', '#006400'],
    },
    {
        name: 'Dusty Roses',
        colors: ['#c08081', '#d1a3a4', '#e4c4c5', '#f0d8d9', '#fad4d5', '#ffe4e1'],
    },
    {
        name: 'Crisp Morning',
        colors: ['#a8dadc', '#457b9d', '#1d3557', '#f1faee', '#e63946', '#2a9d8f'],
    },
    {
        name: 'Golden Hour',
        colors: ['#ffcb69', '#ffa600', '#ff8c42', '#e76f51', '#d62828', '#f4a261'],
    },
    {
        name: 'Spring Meadow',
        colors: ['#b2dfdb', '#80cbc4', '#4db6ac', '#26a69a', '#00796b', '#004d40'],
    },
    {
        name: 'Vintage Blues',
        colors: ['#6e7f80', '#536872', '#708090', '#536878', '#36454f', '#2f4f4f'],
    },
    {
        name: 'Soft Sunrise',
        colors: ['#fdd5b1', '#f7b267', '#f28c28', '#f26d21', '#f0580b', '#d94e1f'],
    },
    {
        name: 'Cool Glacier',
        colors: ['#cce7f0', '#99d1e9', '#66c3e6', '#33afe3', '#009ae0', '#007bbd'],
    },
    {
        name: 'Berry Harvest',
        colors: ['#6a0572', '#a4508b', '#e57a94', '#f29c9c', '#f6bd8f', '#fae1c0'],
    },
    {
        name: 'Desert Sands',
        colors: ['#edc9af', '#e0b589', '#d2a679', '#c19a6b', '#b8860b', '#a0522d'],
    },
    {
        name: 'Ocean Breeze',
        colors: ['#4e9fcf', '#3699c3', '#2389aa', '#20778f', '#1c6576', '#184d5b'],
    },
    {
        name: 'Mint Lavender',
        colors: ['#e6f7f1', '#caf1e1', '#b1ebe5', '#99d8d8', '#8c9ef3', '#9075f2'],
    },
    {
        name: 'Forest Canopy',
        colors: ['#355e3b', '#468847', '#5b9c5a', '#6fb56c', '#88d87d', '#a8ec9d'],
    },
    {
        name: 'Midnight Shadows',
        colors: ['#3c3f41', '#28292b', '#1c1d1f', '#151618', '#0f1012', '#090a0b'],
    },
    {
        name: 'Coral Reef',
        colors: ['#ff7f50', '#ff6f61', '#ff5e62', '#ff4e50', '#ff3e50', '#ff2e50'],
    },
    {
        name: 'Pastel Serenity',
        colors: ['#d1c4e9', '#b39ddb', '#9575cd', '#7e57c2', '#673ab7', '#5e35b1'],
    },
    {
        name: 'Spiced Cider',
        colors: ['#b65a27', '#dc7633', '#e59866', '#f0b27a', '#f8c471', '#fad7a0'],
    },
    {
        name: 'Frosted Greens',
        colors: ['#d4e157', '#aed581', '#81c784', '#66bb6a', '#4caf50', '#388e3c'],
    },
    {
        name: 'Electric Dusk',
        colors: ['#6a0572', '#9c27b0', '#ce93d8', '#ba68c8', '#ab47bc', '#8e24aa'],
    },
    {
        name: 'Citrus Punch',
        colors: ['#ff9f43', '#ff6b6b', '#ff3f34', '#ffc048', '#ffdd59', '#ffc312'],
    },
    {
        name: 'Cloudy Skies',
        colors: ['#90a4ae', '#b0bec5', '#cfd8dc', '#eceff1', '#e0e0e0', '#bdbdbd'],
    },
    {
        name: 'Royal Jewels',
        colors: ['#512b58', '#9c1b1b', '#e63946', '#ffb400', '#ffcb69', '#db2d43'],
    },
    {
        name: 'Sandy Shores',
        colors: ['#f5deb3', '#edd9a3', '#d6b57d', '#c8a165', '#ae8953', '#8b6c42'],
    },
    {
        name: 'Crisp Autumn',
        colors: ['#d1495b', '#e76f51', '#f4a261', '#e9c46a', '#2a9d8f', '#264653'],
    },
    {
        name: 'Jungle Vibes',
        colors: ['#184d47', '#233329', '#39603d', '#4d774e', '#6c9a8b', '#96c8a2'],
    },
    {
        name: 'Subtle Earth',
        colors: ['#9e8050', '#a98a60', '#c7a677', '#d7b58b', '#e5c29f', '#f2ddbb'],
    },
    {
        name: 'Arctic Winter',
        colors: ['#d8eefe', '#b0d4fd', '#87bbfc', '#5ca1fb', '#3488fa', '#0c6df9'],
    },
    {
        name: 'Neon Glow',
        colors: ['#ff00ff', '#ff4da6', '#ff73c0', '#ff8ccd', '#ff99d9', '#ffb3ec'],
    },
    {
        name: 'Golden Wheat',
        colors: ['#e0c097', '#d2b48c', '#c9a66b', '#be9355', '#b28048', '#a5703a'],
    },
    {
        name: 'City Lights',
        colors: ['#242424', '#3e3e3e', '#505050', '#636363', '#767676', '#8a8a8a'],
    },
    {
        name: 'Soft Mauve',
        colors: ['#e7d4e8', '#d4c2d8', '#c0b0c9', '#aa9db8', '#948ca8', '#7d7998'],
    },
    {
        name: 'Tropical Sunset',
        colors: ['#ff7e67', '#f06c63', '#e3595f', '#d7455b', '#c83257', '#ba1f53'],
    },
    {
        name: 'Spring Garden',
        colors: ['#b0e57c', '#d8e69d', '#e0f2a1', '#edf6c4', '#e6f0b6', '#d4e57c'],
    },
    {
        name: 'Rustic Charm',
        colors: ['#8c5c4c', '#9d6d5e', '#b27d70', '#c49082', '#e2b9a4', '#efd4c1'],
    },
    {
        name: 'Bold Cosmos',
        colors: ['#ff4757', '#3742fa', '#5352ed', '#70a1ff', '#1e90ff', '#1b84db'],
    },
    {
        name: 'Amber Glow',
        colors: ['#e9c46a', '#f4a261', '#e76f51', '#d1495b', '#c44536', '#9e2a2b'],
    },
    {
        name: 'Frozen Lilac',
        colors: ['#e6e6fa', '#d8bfd8', '#dda0dd', '#ba55d3', '#9932cc', '#8a2be2'],
    },
];

export default popularPalettes;