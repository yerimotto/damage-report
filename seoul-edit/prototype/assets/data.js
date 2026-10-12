/**
 * The Seoul Edit: starter closet and fits, from closet.json.
 * Images are relative to prototype/; the published single-file build swaps
 * them for embedded copies.
 */
window.SE_DATA = {
  TRIP: { title: 'December in Seoul', tempRange: '−7° / 2°', startDate: '2026-12-10', endDate: '2026-12-17' },

  PIECES: [
    { id: 'brown-wool-coat', name: 'Brown wool coat', category: 'Outer', image: 'pieces/brown-wool-coat.webp' },
    { id: 'black-wool-coat', name: 'Black wool coat', category: 'Outer', image: 'pieces/black-wool-coat.webp' },
    { id: 'leather-trench', name: 'Leather trench', category: 'Outer', image: 'pieces/leather-trench.webp' },
    { id: 'shearling-fur-jacket', name: 'Shearling fur jacket', category: 'Outer', image: 'pieces/shearling-fur-jacket.webp' },
    { id: 'suede-fur-trim-jacket', name: 'Suede fur-trim jacket', category: 'Outer', image: 'pieces/suede-fur-trim-jacket.webp' },
    { id: 'cream-vneck-knit', name: 'Cream V-neck knit', category: 'Tops', image: 'pieces/cream-vneck-knit.webp' },
    { id: 'black-turtleneck', name: 'Black turtleneck', category: 'Tops', image: 'pieces/black-turtleneck.webp' },
    { id: 'black-crewneck', name: 'Black crewneck', category: 'Tops', image: 'pieces/black-crewneck.webp' },
    { id: 'brown-polo-knit', name: 'Brown polo knit', category: 'Tops', image: 'pieces/brown-polo-knit.webp' },
    { id: 'mid-wash-wide-jeans', name: 'Mid-wash wide jeans', category: 'Bottoms', image: 'pieces/mid-wash-wide-jeans.webp' },
    { id: 'raw-denim-wide-jeans', name: 'Raw denim wide jeans', category: 'Bottoms', image: 'pieces/raw-denim-wide-jeans.webp' },
    { id: 'black-straight-jeans', name: 'Black straight jeans', category: 'Bottoms', image: 'pieces/black-straight-jeans.webp' },
    { id: 'beige-suede-skirt', name: 'Beige suede skirt', category: 'Bottoms', image: 'pieces/beige-suede-skirt.webp' },
    { id: 'riding-boots', name: 'Riding boots', category: 'Shoes', image: 'pieces/riding-boots.webp' },
    { id: 'pointed-heel-boots', name: 'Pointed heel boots', category: 'Shoes', image: 'pieces/pointed-heel-boots.webp' },
    { id: 'brown-suede-loafers', name: 'Brown suede loafers', category: 'Shoes', image: 'pieces/brown-suede-loafers.webp' },
    { id: 'black-leather-tote', name: 'Black leather tote', category: 'Bags', image: 'pieces/black-leather-tote.webp' },
    { id: 'brown-suede-hobo', name: 'Brown suede hobo', category: 'Bags', image: 'pieces/brown-suede-hobo.webp' },
    { id: 'two-tone-scarf', name: 'Two-tone wool scarf', category: 'Extras', image: 'pieces/two-tone-scarf.webp' },
    { id: 'wool-bucket-hat', name: 'Wool bucket hat', category: 'Extras', image: 'pieces/wool-bucket-hat.webp' },
  ],

  FITS: [
    { id: 'fit-1', name: 'Fit 1', note: 'Brown wool coat over cream knit. Swap in the raw denim for a sharper version.', dates: [],
      pieceIds: ['brown-wool-coat', 'cream-vneck-knit', 'mid-wash-wide-jeans', 'black-leather-tote'] },
    { id: 'fit-2', name: 'Fit 2', note: 'All black with a fur jacket and a brown suede bag.', dates: [],
      pieceIds: ['shearling-fur-jacket', 'black-turtleneck', 'black-straight-jeans', 'brown-suede-hobo'] },
    { id: 'fit-3', name: 'Fit 3', note: 'Long black coat, cream knit, dark denim and loafers.', dates: [],
      pieceIds: ['black-wool-coat', 'cream-vneck-knit', 'raw-denim-wide-jeans', 'black-leather-tote', 'brown-suede-loafers'] },
    { id: 'fit-4', name: 'Fit 4', note: 'Leather trench, polo knit and suede skirt with riding boots.', dates: [],
      pieceIds: ['leather-trench', 'brown-polo-knit', 'beige-suede-skirt', 'riding-boots', 'two-tone-scarf', 'wool-bucket-hat'] },
  ]
};
