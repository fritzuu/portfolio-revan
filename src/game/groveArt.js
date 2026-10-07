export const GROVE_PATH = [
  [1700, 955],
  [1900, 955],
  [1940, 935],
  [1980, 910],
  [2020, 890],
  [2140, 890],
  [2180, 920],
  [2220, 950],
  [2260, 990],
  [2300, 1025],
  [2390, 1025],
];
// Original grove art uses the town's stepped silhouettes and three-tone shading.
export const GROVE_PROPS = [
  ...[
    [1740, 795],
    [1830, 790],
    [1920, 795],
    [2180, 790],
    [2290, 795],
    [2400, 820],
    [1750, 885],
    [1770, 1040],
    [1850, 1080],
    [1960, 1080],
    [2110, 1085],
    [2250, 1090],
    [2390, 1070],
    [2420, 935],
  ].map(([x, y], i) => ({ type: 'groveTree', x, y, variant: i % 4 })),
  { type: 'groveHollow', x: 2210, y: 875, variant: 1 },
  { type: 'groveHollow', x: 2340, y: 1085, variant: 3 },
  ...[
    [1830, 858],
    [1860, 1025],
    [2240, 853],
    [2320, 900],
    [2215, 1035],
  ].map(([x, y], i) => ({ type: 'groveStump', x, y, variant: i })),
  ...[
    [1805, 1000],
    [2300, 1060],
  ].map(([x, y], i) => ({ type: 'groveLog', x, y, variant: i })),
  ...[
    [1870, 830],
    [2260, 920],
    [2375, 977],
    [1930, 1040],
  ].map(([x, y], i) => ({ type: 'groveRock', x, y, variant: i })),
  ...[
    [1785, 835],
    [1815, 885],
    [1820, 1018],
    [1885, 1070],
    [1920, 814],
    [2240, 817],
    [2285, 892],
    [2360, 947],
    [2280, 1080],
    [1970, 1065],
    [2140, 1055],
    [2400, 1015],
  ].map(([x, y], i) => ({
    type: i % 3 ? 'groveBrush' : 'groveMushrooms',
    x,
    y,
    variant: i,
    solid: false,
  })),
  ...[
    [1880, 927],
    [2160, 805],
    [2220, 1000],
  ].map(([x, y]) => ({ type: 'groveLantern', x, y })),
];
export const GROVE_LIGHTS = GROVE_PROPS.filter(
  (p) => p.type === 'groveLantern',
);
function rect(c, x, y, w, h, color) {
  c.fillStyle = color;
  c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}
export function drawGroveProp(c, p) {
  const { x, y, type, variant = 0 } = p;
  const r = (a, b, w, h, color) => rect(c, x + a, y + b, w, h, color);
  const outline = '#38454c',
    shade = '#657078',
    bark = '#98a0a2',
    light = '#c5c8bc';
  if (type === 'groveTree' || type === 'groveHollow') {
    const hollow = type === 'groveHollow';
    const bend = [-6, 9, -12, 5][variant % 4];
    r(-27, 5, 57, 11, '#35495033');
    // Roots meet the same narrow collision footprint as the visible trunk.
    r(-23, 9, 47, 5, outline);
    r(-16, 4, 31, 8, shade);
    r(-21, 9, 15, 2, bark);
    r(5, 9, 15, 2, bark);
    const width = hollow ? 26 : 14;
    r(-width / 2, -39, width, 50, outline);
    r(-width / 2 + 3, -37, width - 6, 45, shade);
    r(-width / 2 + 3, -36, Math.max(4, width - 11), 43, bark);
    r(-width / 2 + 4, -33, 2, 25, light);
    r(bend - 7, -64, hollow ? 20 : 14, 31, outline);
    r(bend - 4, -61, hollow ? 13 : 8, 26, shade);
    r(bend - 4, -61, 4, 22, bark);
    const paths = [
      [
        [bend, -40],
        [-17, -48],
        [-27, -61],
        [-39, -67],
        [-40, -83],
      ],
      [
        [bend + 3, -53],
        [19, -58],
        [27, -74],
        [39, -82],
        [44, -95],
      ],
      [
        [bend, -62],
        [bend - 3, -78],
        [bend + (variant % 2 ? 12 : -12), -90],
        [bend + (variant % 2 ? 16 : -7), -102],
      ],
    ];
    if (variant % 2)
      paths[0] = [
        [bend, -43],
        [-15, -54],
        [-23, -70],
        [-41, -75],
        [-47, -88],
      ];
    if (variant % 3 === 2)
      paths[1] = [
        [bend, -48],
        [20, -45],
        [34, -57],
        [45, -62],
        [47, -74],
      ];
    // Tapering stair-step curves, with broken tips, instead of uniform pipe-like forks.
    for (const layer of [0, 1])
      for (const points of paths)
        for (let i = 1; i < points.length; i++) {
          const [ax, ay] = points[i - 1],
            [bx, by] = points[i];
          const steps = Math.ceil(
            Math.max(Math.abs(bx - ax), Math.abs(by - ay)) / 2,
          );
          for (let step = 0; step <= steps; step++) {
            const progress = step / steps;
            const width = Math.max(
              3,
              12 - ((i - 1 + progress) / (points.length - 1)) * 9,
            );
            const size = layer ? Math.max(1, width - 4) : width;
            r(
              ax + (bx - ax) * progress - size / 2 - (layer ? 1 : 0),
              ay + (by - ay) * progress - size / 2,
              size,
              size,
              layer ? bark : outline,
            );
          }
        }
    r(bend - 3, -59, 3, 12, light);
    r(-4, -19, 4, 6, shade);
    for (let i = 0; i < 4; i++) r(-2 + (i % 2) * 5, -27 + i * 9, 2, 5, shade);
    if (hollow) {
      r(-7, -32, 16, 22, outline);
      r(-4, -37, 10, 31, outline);
      r(-3, -31, 8, 20, '#283942');
      r(5, -29, 2, 19, '#a9afb0');
      r(-11, -4, 3, 11, '#748887');
    }
  } else if (type === 'groveStump') {
    r(-15, 4, 31, 7, '#35495033');
    r(-12, -12, 25, 19, outline);
    r(-9, -9, 19, 14, shade);
    r(-8, -8, 5, 12, bark);
    r(3, -8, 3, 13, '#7e8585');
    r(-14, -16, 29, 7, outline);
    r(-10, -15, 21, 5, '#c0bca4');
    r(-5, -14, 10, 2, '#858875');
    r(-1, -14, 3, 3, shade);
  } else if (type === 'groveLog') {
    r(-38, 7, 80, 7, '#35495033');
    r(-37, -8, 75, 19, outline);
    r(-34, -5, 69, 13, shade);
    r(-33, -5, 67, 5, bark);
    r(-27, -4, 38, 2, light);
    r(-9, 3, 28, 3, outline);
    r(26, -9, 13, 21, outline);
    r(28, -6, 8, 15, '#c0bca4');
    r(30, -3, 4, 9, '#8e9184');
    r(31, 0, 2, 3, shade);
    r(-18, -15, 9, 9, outline);
    r(-15, -15, 4, 8, bark);
    r(-28, 4, 8, 3, '#758d82');
  } else if (type === 'groveRock') {
    r(-19, 3, 40, 6, '#35495033');
    r(-19, -13, 38, 18, outline);
    r(-12, -22, 25, 13, outline);
    r(-15, -12, 30, 12, '#737e8c');
    r(-9, -19, 19, 12, '#a7abb5');
    r(-12, -10, 10, 5, '#9a9fa8');
    r(2, -18, 3, 7, outline);
    r(-2, -11, 7, 3, outline);
    r(-3, -10, 3, 9, outline);
  } else if (type === 'groveLantern') {
    r(-10, 5, 20, 5, '#35495033');
    r(-3, -49, 6, 56, outline);
    r(-1, -47, 2, 49, bark);
    r(-2, -51, 23, 4, outline);
    r(15, -49, 3, 7, shade);
    r(9, -43, 16, 22, outline);
    r(12, -40, 10, 15, '#b1a5cc');
    r(13, -38, 4, 12, '#ded1ea');
    r(8, -23, 18, 4, shade);
    r(11, -47, 12, 4, bark);
  } else if (type === 'groveMushrooms') {
    for (let i = 0; i < 3; i++) {
      const xx = -15 + i * 12,
        yy = -5 - (i % 2) * 7;
      r(xx, yy, 3, 8, '#b7b6bc');
      r(xx - 4, yy - 4, 11, 5, '#665879');
      r(xx - 2, yy - 6, 7, 3, '#9380a8');
      r(xx - 1, yy - 5, 2, 2, '#d0b6d0');
    }
  } else if (type === 'groveBrush') {
    for (let i = 0; i < 5; i++) {
      const xx = -17 + i * 8,
        height = 7 + ((variant + i) % 3) * 4;
      r(xx, -height, 3, height + 2, '#507477');
      r(xx - 4, -height + 3, 5, 3, '#7c9691');
      r(xx + 2, -height + 6, 4, 2, '#6e878d');
    }
    r(-11, 2, 5, 2, '#b3a694');
    r(9, 4, 4, 2, '#a89da4');
  }
}
export function drawGroveGround(c) {
  const r = (x, y, w, h, color) => rect(c, x, y, w, h, color);
  r(1720, 785, 720, 280, '#587a7b');
  r(1740, 765, 680, 320, '#587a7b');
  r(1770, 748, 620, 353, '#587a7b');
  for (let row = 0; row < 13; row++)
    for (let col = 0; col < 25; col++) {
      const x = 1750 + col * 26,
        y = 771 + row * 24;
      r(x, y, 16 + (col % 3) * 3, 9, (col + row) % 3 ? '#608386' : '#638685');
      if ((col * 3 + row) % 7 === 0) {
        r(x + 5, y + 12, 3, 4, '#849b95');
        r(x + 8, y + 15, 4, 2, '#849b95');
      }
    }
  // Broad stepped path: west entrance -> central moon court -> southeast exit.
  const path = GROVE_PATH;
  for (let i = 1; i < path.length; i++) {
    const [ax, ay] = path[i - 1],
      [bx, by] = path[i];
    for (let t = 0; t <= 1; t += 0.1) {
      const x = Math.round((ax + (bx - ax) * t) / 4) * 4,
        y = Math.round((ay + (by - ay) * t) / 4) * 4;
      r(x - 29, y - 25, 58, 50, '#788c90');
      r(x - 25, y - 21, 50, 42, '#a1aaa3');
    }
  }
  // Walkable paving and rune stones do not create invisible ring obstacles.
  r(1970, 822, 160, 99, '#788994');
  r(1984, 808, 132, 127, '#788994');
  r(1997, 800, 106, 141, '#788994');
  r(1987, 834, 126, 70, '#adb7b2');
  r(2000, 819, 100, 100, '#adb7b2');
  r(2018, 810, 64, 118, '#adb7b2');
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8,
      x = 2050 + Math.cos(a) * 88,
      y = 869 + Math.sin(a) * 66;
    r(x - 8, y - 5, 16, 10, '#455766');
    r(x - 6, y - 7, 12, 9, '#aeb4b8');
    r(x - 4, y - 6, 5, 2, '#d4d4c4');
    if (i % 2 === 0) {
      r(x - 1, y - 4, 2, 5, '#8e7eab');
      r(x - 3, y - 2, 6, 2, '#8e7eab');
    }
  }
  // Moon mosaic retains Dream Grove's identity even before Darkrai appears.
  for (const [x, y, w, h] of [
    [2026, 846, 35, 6],
    [2018, 852, 30, 7],
    [2014, 859, 24, 14],
    [2018, 873, 30, 7],
    [2026, 880, 35, 6],
  ])
    r(x, y, w, h, '#e0d9bd');
  r(2040, 858, 20, 16, '#adb7b2');
}

export function drawGroveAtmosphere(
  { fog, runes, ash },
  time,
  darkness,
  visitor,
  reduced,
) {
  fog.clear();
  runes.clear();
  const t = reduced ? 0 : time / 1000;
  // Low, translucent horizontal wisps stay beneath actors and never hide a route.
  for (let i = 0; i < 5; i++) {
    const x = 1765 + i * 117 + Math.sin(t * 0.18 + i * 1.7) * 16;
    const y = 923 + (i % 3) * 43 + Math.sin(t * 0.12 + i) * 3;
    fog.fillStyle(0xc1c9cf, 0.055 + darkness * 0.035);
    fog.fillRect(Math.round(x), Math.round(y), 132, 7);
    fog.fillRect(Math.round(x + 18), Math.round(y - 4), 92, 4);
    fog.fillStyle(0xc1c9cf, 0.025 + darkness * 0.02);
    fog.fillRect(Math.round(x - 16), Math.round(y + 7), 158, 5);
  }
  const proximity = Math.max(
    0,
    1 - Math.hypot(visitor.x - 2050, visitor.y - 869) / 230,
  );
  const pulse = reduced ? 0.7 : 0.7 + Math.sin(t * 1.5) * 0.3;
  runes.fillStyle(0xb9a0dc, 0.025 + proximity * 0.035);
  runes.fillEllipse(2050, 869, 176, 129);
  for (let i = 0; i < 16; i += 2) {
    const a = (i * Math.PI) / 8;
    const x = Math.round(2050 + Math.cos(a) * 88),
      y = Math.round(869 + Math.sin(a) * 66);
    runes.fillStyle(
      0xd5b7ec,
      (0.08 + darkness * 0.13 + proximity * 0.36) * pulse,
    );
    runes.fillRect(x - 1, y - 4, 2, 5);
    runes.fillRect(x - 3, y - 2, 6, 2);
  }
  for (const p of GROVE_LIGHTS) {
    runes.fillStyle(0xb6a1d5, 0.025 + darkness * 0.055);
    runes.fillEllipse(p.x + 17, p.y - 20, 58, 46);
    runes.fillStyle(0xded1ea, 0.12 + darkness * 0.3);
    runes.fillRect(p.x + 13, p.y - 38, 4, 12);
  }
  if (!reduced) {
    for (let i = 0; i < 12; i++) {
      const phase = (t * 0.013 + i / 12) % 1;
      const x = 1780 + ((i * 73) % 620) + Math.sin(t * 0.3 + i) * 8;
      const y = 780 + phase * 280;
      ash.fillStyle(
        0xc9c4d0,
        Math.sin(phase * Math.PI) * (0.14 + darkness * 0.1),
      );
      ash.fillRect(Math.round(x), Math.round(y), 2, 2);
    }
  }
}
