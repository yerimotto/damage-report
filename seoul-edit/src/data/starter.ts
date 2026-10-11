import type { AppData, Category, Piece } from '../types'

const piece = (id: string, name: string, category: Category): Piece => ({
  id,
  name,
  category,
  image: `/pieces/${id}.png`,
})

export const starterData: AppData = {
  version: 1,
  trip: {
    title: 'December in Seoul',
    tempRange: '−7° / 2°',
    startDate: '2026-12-10',
    endDate: '2026-12-17',
  },
  pieces: [
    piece('shearling-jacket', 'Shearling jacket', 'Outer'),
    piece('leather-coat', 'Fur-collar leather coat', 'Outer'),
    piece('cream-puffer', 'Cream puffer', 'Outer'),
    piece('cream-knit', 'Cream knit', 'Tops'),
    piece('black-turtleneck', 'Black turtleneck', 'Tops'),
    piece('grey-knit', 'Grey knit', 'Tops'),
    piece('black-jeans', 'Black straight jeans', 'Bottoms'),
    piece('flared-trousers', 'Flared trousers', 'Bottoms'),
    piece('sheepskin-boots', 'Sheepskin boots', 'Shoes'),
    piece('western-boots', 'Western boots', 'Shoes'),
    piece('tan-tote', 'Tan tote', 'Bags'),
    piece('wool-scarf', 'Wool scarf', 'Extras'),
    piece('leather-gloves', 'Leather gloves', 'Extras'),
    piece('gold-hoops', 'Gold hoops', 'Extras'),
  ],
  fits: [
    {
      id: 'fit-1',
      name: 'Fit 1',
      pieceIds: ['shearling-jacket', 'cream-knit', 'black-jeans', 'sheepskin-boots', 'tan-tote', 'wool-scarf', 'gold-hoops'],
      note: 'Café crawl in Seongsu — soft, warm, all day on foot.',
      dates: [],
    },
    {
      id: 'fit-2',
      name: 'Fit 2',
      pieceIds: ['leather-coat', 'black-turtleneck', 'flared-trousers', 'western-boots', 'tan-tote', 'leather-gloves', 'gold-hoops'],
      note: 'Hannam galleries, then a long dinner.',
      dates: [],
    },
    {
      id: 'fit-3',
      name: 'Fit 3',
      pieceIds: ['cream-puffer', 'grey-knit', 'black-jeans', 'sheepskin-boots', 'wool-scarf', 'leather-gloves'],
      note: 'The −7° day: Gyeongbokgung and the palace walk.',
      dates: [],
    },
    {
      id: 'fit-4',
      name: 'Fit 4',
      pieceIds: ['shearling-jacket', 'black-turtleneck', 'flared-trousers', 'western-boots', 'gold-hoops'],
      note: 'Euljiro bars — a little seventies.',
      dates: [],
    },
    {
      id: 'fit-5',
      name: 'Fit 5',
      pieceIds: ['leather-coat', 'cream-knit', 'black-jeans', 'western-boots', 'tan-tote', 'wool-scarf'],
      note: 'Shopping in Myeongdong, hands free.',
      dates: [],
    },
    {
      id: 'fit-6',
      name: 'Fit 6',
      pieceIds: ['cream-puffer', 'cream-knit', 'flared-trousers', 'sheepskin-boots', 'tan-tote', 'leather-gloves', 'gold-hoops'],
      note: 'Han River at dusk — tonal cream on cream.',
      dates: [],
    },
  ],
}
