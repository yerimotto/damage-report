/**
 * The Seoul Edit: trips, the shared closet, and the starter fits from closet.json.
 * Images are relative to prototype/; the published single-file build swaps
 * them for embedded copies.
 */
window.SE_DATA = {
  /* One capsule per trip, in date order. The closet is shared; fits belong to a trip.
     Temperatures are typical lows / highs for the month. */
  TRIPS: [
    { id: 'tokyo-nov', emoji: '🍡', city: 'Tokyo', month: 'November', tempRange: '8° / 17°', startDate: '2026-11-12', endDate: '2026-11-18' },
    { id: 'seoul-dec', emoji: '⛄', city: 'Seoul', month: 'December', tempRange: '−7° / 2°', startDate: '2026-12-10', endDate: '2026-12-17' },
    { id: 'paris-dec', emoji: '🥐', city: 'Paris', month: 'December', tempRange: '3° / 8°', startDate: '2026-12-20', endDate: '2026-12-27' }
  ],
  START_TRIP: 'seoul-dec',

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
    { id: 'fit-1', tripId: 'seoul-dec', name: 'Fit 1', note: 'Brown wool coat over cream knit. Swap in the raw denim for a sharper version.', dates: [],
      pieceIds: ['brown-wool-coat', 'cream-vneck-knit', 'mid-wash-wide-jeans', 'black-leather-tote'] },
    { id: 'fit-2', tripId: 'seoul-dec', name: 'Fit 2', note: 'All black with a fur jacket and a brown suede bag.', dates: [],
      pieceIds: ['shearling-fur-jacket', 'black-turtleneck', 'black-straight-jeans', 'brown-suede-hobo'] },
    { id: 'fit-3', tripId: 'seoul-dec', name: 'Fit 3', note: 'Long black coat, cream knit, dark denim and loafers.', dates: [],
      pieceIds: ['black-wool-coat', 'cream-vneck-knit', 'raw-denim-wide-jeans', 'black-leather-tote', 'brown-suede-loafers'] },
    { id: 'fit-4', tripId: 'seoul-dec', name: 'Fit 4', note: 'Leather trench, polo knit and suede skirt with riding boots.', dates: [],
      pieceIds: ['leather-trench', 'brown-polo-knit', 'beige-suede-skirt', 'riding-boots', 'two-tone-scarf', 'wool-bucket-hat'] },

    /* Tokyo runs mild: lighter layers, loafers and heeled boots. */
    { id: 'tokyo-1', tripId: 'tokyo-nov', name: 'Fit 1', note: 'Suede fur-trim jacket and cream knit for dinner in Ginza.', dates: [],
      pieceIds: ['suede-fur-trim-jacket', 'cream-vneck-knit', 'raw-denim-wide-jeans', 'pointed-heel-boots', 'brown-suede-hobo'] },
    { id: 'tokyo-2', tripId: 'tokyo-nov', name: 'Fit 2', note: 'Leather trench and loafers for a day in Daikanyama.', dates: [],
      pieceIds: ['leather-trench', 'black-crewneck', 'mid-wash-wide-jeans', 'brown-suede-loafers', 'black-leather-tote'] },
    { id: 'tokyo-3', tripId: 'tokyo-nov', name: 'Fit 3', note: 'Shearling jacket and the bucket hat for a late night in Shimokitazawa.', dates: [],
      pieceIds: ['shearling-fur-jacket', 'brown-polo-knit', 'black-straight-jeans', 'brown-suede-loafers', 'wool-bucket-hat'] },

    /* Paris is cold and grey: suede, wool and a scarf. */
    { id: 'paris-1', tripId: 'paris-dec', name: 'Fit 1', note: 'Seventies suede in Saint-Germain: fur trim, suede skirt, riding boots.', dates: [],
      pieceIds: ['suede-fur-trim-jacket', 'black-turtleneck', 'beige-suede-skirt', 'riding-boots', 'brown-suede-hobo', 'two-tone-scarf'] },
    { id: 'paris-2', tripId: 'paris-dec', name: 'Fit 2', note: 'All black for the Marais at night.', dates: [],
      pieceIds: ['black-wool-coat', 'black-turtleneck', 'black-straight-jeans', 'pointed-heel-boots', 'black-leather-tote'] },
    { id: 'paris-3', tripId: 'paris-dec', name: 'Fit 3', note: 'Brown on brown: wool coat, polo knit and loafers.', dates: [],
      pieceIds: ['brown-wool-coat', 'brown-polo-knit', 'raw-denim-wide-jeans', 'brown-suede-loafers', 'black-leather-tote', 'two-tone-scarf'] },
  ]
};
