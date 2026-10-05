// Hand-authored districts: broad connecting streets and decorations anchored to gardens.
export const WORLD_SIZE = { width: 1600, height: 1100 };
export const LOCATIONS = [
  {
    id: 'about',
    name: 'About Revan',
    subtitle: 'Meet the developer',
    x: 160,
    y: 220,
    w: 280,
    h: 190,
    doorX: 300,
    doorY: 410,
    color: '#b9cabe',
  },
  {
    id: 'projects',
    name: 'Project studio',
    subtitle: 'Things I’ve built',
    x: 640,
    y: 220,
    w: 320,
    h: 190,
    doorX: 800,
    doorY: 410,
    color: '#dcc394',
  },
  {
    id: 'skills',
    name: 'Tech library',
    subtitle: 'Tools & services',
    x: 1120,
    y: 220,
    w: 280,
    h: 190,
    doorX: 1260,
    doorY: 410,
    color: '#abc4c8',
  },
  {
    id: 'experience',
    name: 'Memory museum',
    subtitle: 'Experience & certificates',
    x: 640,
    y: 810,
    w: 320,
    h: 150,
    doorX: 800,
    doorY: 960,
    color: '#cac2b8',
  },
  {
    id: 'contact',
    name: 'Post & coffee',
    subtitle: 'Let’s build together',
    x: 1120,
    y: 810,
    w: 280,
    h: 150,
    doorX: 1260,
    doorY: 960,
    color: '#d0ada0',
  },
];
export const ACTIVITIES = [
  {
    id: 'fishing',
    name: 'Moonwater Dock',
    subtitle: 'Cast a line, discover a world',
    doorX: 300,
    doorY: 740,
  },
  {
    id: 'shop',
    name: 'Mira’s Tackle Shop',
    subtitle: 'Sell fish & upgrade your rod',
    doorX: 520,
    doorY: 860,
  },
  {
    id: 'rift',
    name: 'Astral Crossing',
    subtitle: 'Unlock after finding 12 species',
    doorX: 800,
    doorY: 65,
  },
];
export const DESTINATIONS = [...LOCATIONS, ...ACTIVITIES];
export const GARDENS = [
  { x: 75, y: 270, w: 65, h: 120 },
  { x: 470, y: 270, w: 95, h: 120 },
  { x: 1000, y: 270, w: 85, h: 120 },
  { x: 1430, y: 270, w: 95, h: 120 },
  { x: 600, y: 550, w: 65, h: 175 },
  { x: 935, y: 550, w: 65, h: 175 },
  { x: 1110, y: 535, w: 310, h: 200 },
];
export const PROPS = [
  ...[
    [107, 335, 0.7],
    [515, 335, 0.8],
    [1040, 335, 0.8],
    [1477, 335, 0.8],
    [632, 590, 0.7],
    [632, 710, 0.7],
    [967, 590, 0.7],
    [967, 710, 0.7],
    [1150, 610, 0.8],
    [1380, 610, 0.8],
    [120, 950, 0.9],
    [1480, 950, 0.9],
  ].map(([x, y, s]) => ({ type: 'tree', x, y, s })),
  ...[
    [700, 530],
    [830, 530],
    [700, 735],
    [830, 735],
    [1180, 670],
    [1280, 670],
  ].map(([x, y]) => ({ type: 'bench', x, y })),
  ...[
    [190, 460],
    [400, 460],
    [690, 460],
    [895, 460],
    [1150, 460],
    [1360, 460],
    [90, 890],
    [365, 890],
    [665, 1020],
    [920, 1020],
    [1150, 1020],
    [1370, 1020],
  ].map(([x, y]) => ({ type: 'lamp', x, y })),
  ...[
    [1170, 570],
    [1330, 570],
  ].map(([x, y]) => ({ type: 'table', x, y })),
  ...[
    [445, 875],
    [445, 904],
  ].map(([x, y]) => ({ type: 'crate', x, y })),
  { type: 'board', x: 480, y: 820 },
  { type: 'stall', x: 560, y: 870 },
  ...[
    [200, 500],
    [380, 500],
    [1120, 740],
    [1380, 740],
  ].map(([x, y]) => ({ type: 'flowers', x, y })),
];
export const propBounds = (p) => {
  const { x, y, s = 1, type } = p;
  if (type === 'tree')
    return { x: x - 13 * s, y: y - 8 * s, w: 27 * s, h: 30 * s };
  if (type === 'bench') return { x, y: y + 2, w: 72, h: 29 };
  if (type === 'lamp') return { x: x + 5, y: y - 4, w: 16, h: 15 };
  if (type === 'table') return { x: x - 25, y: y + 9, w: 53, h: 29 };
  if (type === 'board') return { x, y: y + 20, w: 44, h: 25 };
  if (type === 'stall') return { x: x - 40, y: y - 10, w: 80, h: 38 };
  if (type === 'flowers') return { x: x - 15, y: y - 5, w: 30, h: 18 };
  return { x, y, w: 24, h: 20 };
};
export const OBSTACLES = [
  ...LOCATIONS.map((l) => ({
    x: l.x - 4,
    y: l.y - 17,
    w: l.w + 8,
    h: l.h + 17,
  })),
  { x: 0, y: 0, w: 739, h: 171 },
  { x: 862, y: 0, w: 738, h: 171 },
  // The dock is a real walkable gap in the lake, not paint over a water collider.
  { x: 85, y: 530, w: 400, h: 200 },
  { x: 85, y: 730, w: 155, h: 135 },
  { x: 360, y: 730, w: 125, h: 135 },
  { x: 735, y: 600, w: 130, h: 105 },
  ...PROPS.map(propBounds),
];
// Large circuits connect districts, with occasional bench/garden stops.
export const NPC_ROUTES = [
  [
    { x: 300, y: 470 },
    { x: 520, y: 470 },
    { x: 560, y: 920 },
    { x: 300, y: 910 },
  ],
  [
    { x: 800, y: 470 },
    { x: 1010, y: 470 },
    { x: 1040, y: 980 },
    { x: 800, y: 1010 },
  ],
  [
    { x: 1260, y: 470 },
    { x: 1480, y: 490 },
    { x: 1460, y: 990 },
    { x: 1040, y: 790 },
  ],
  [
    { x: 560, y: 790 },
    { x: 690, y: 780 },
    { x: 710, y: 575 },
    { x: 890, y: 575 },
    { x: 910, y: 780 },
  ],
  [
    { x: 1040, y: 500 },
    { x: 1260, y: 750 },
    { x: 1490, y: 750 },
    { x: 1480, y: 470 },
  ],
  [
    { x: 190, y: 490 },
    { x: 65, y: 500 },
    { x: 65, y: 890 },
    { x: 400, y: 940 },
    { x: 560, y: 800 },
  ],
];
export const NPC_COUNT = 15;
