/**
 * Towns named on the Areas page and in the LocalBusiness schema.
 * EDIT THIS LIST. It is a starting point for roughly a 40 mile radius of
 * Lymm, not a statement of where you have actually worked.
 */
export const areaGroups = [
  {
    name: 'Cheshire',
    towns: [
      'Lymm', 'Warrington', 'Altrincham', 'Knutsford', 'Wilmslow', 'Alderley Edge',
      'Northwich', 'Middlewich', 'Sandbach', 'Congleton', 'Macclesfield', 'Poynton',
      'Nantwich', 'Crewe', 'Chester', 'Frodsham', 'Runcorn', 'Widnes', 'Tarporley',
    ],
  },
  {
    name: 'Greater Manchester',
    towns: [
      'Manchester', 'Sale', 'Stockport', 'Cheadle', 'Didsbury', 'Urmston', 'Salford',
      'Bolton', 'Bury', 'Wigan', 'Leigh', 'Oldham', 'Rochdale',
    ],
  },
  {
    name: 'Merseyside and Lancashire',
    towns: [
      'Liverpool', 'St Helens', 'Wirral', 'Southport', 'Ormskirk', 'Chorley', 'Preston',
    ],
  },
  {
    name: 'North Wales',
    towns: ['Wrexham', 'Mold', 'Flint', 'Deeside', 'Ruthin', 'Denbigh', 'Llandudno', 'Colwyn Bay'],
  },
];

export const allTowns = areaGroups.flatMap((g) => g.towns);
