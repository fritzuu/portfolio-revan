// Original garden pixel art. Palette, stepped silhouettes and wood details match town art.
const COLORS = ['#f28daa', '#ffd184', '#b9a7e3', '#f3b5a0'];
function rect(c, x, y, w, h, color) {
  c.fillStyle = color;
  c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}
function bloom(c, x, y, color, size = 2) {
  rect(c, x, y + 3 * size, size, 4 * size, '#427c59');
  rect(c, x - 2 * size, y + 5 * size, 2 * size, size, '#6bb87a');
  rect(c, x + size, y + 4 * size, 2 * size, size, '#83ce8c');
  rect(c, x - size, y, 3 * size, 3 * size, color);
  rect(c, x - 2 * size, y + size, 5 * size, size, color);
  rect(c, x, y + size, size, size, '#fff1ce');
}
export function drawGardenProp(c, p) {
  const { x, y, type } = p;
  if (type === 'gardenBush') {
    rect(c, x - 24, y - 5, 48, 9, '#345d4933');
    for (const [dx, dy, w, h, col] of [
      [-24, -19, 46, 19, '#318a62'],
      [-17, -27, 31, 12, '#318a62'],
      [-18, -21, 29, 15, '#65be78'],
      [9, -19, 14, 13, '#4dac70'],
      [-10, -28, 15, 8, '#78ce8b'],
    ])
      rect(c, x + dx, y + dy, w, h, col);
    for (let i = 0; i < 5; i++)
      bloom(c, x - 16 + i * 7, y - 20 - (i % 2) * 5, COLORS[p.variant % 4], 1);
  } else if (type === 'gardenFern') {
    rect(c, x - 1, y - 20, 3, 23, '#3a7557');
    for (let i = 0; i < 4; i++) {
      rect(c, x - 15 + i * 3, y - 9 - i * 4, 15 - i * 3, 3, '#4dac70');
      rect(c, x + 2, y - 11 - i * 4, 13 - i * 3, 3, '#78ce8b');
      rect(c, x - 15 + i * 3, y - 12 - i * 4, 3, 3, '#65be78');
    }
  } else if (type === 'gardenFlowers') {
    for (let i = 0; i < 7; i++)
      bloom(
        c,
        x - 22 + i * 7,
        y - 15 - (i % 3) * 3,
        COLORS[(p.variant + (i % 2)) % 4],
        1.5,
      );
  } else if (type === 'gardenSunflowers') {
    for (let i = 0; i < 3; i++) {
      const xx = x - 14 + i * 14,
        yy = y - 32 - (i % 2) * 8;
      rect(c, xx, yy + 8, 3, y - yy - 5, '#427c59');
      rect(c, xx - 7, yy + 19, 7, 4, '#65be78');
      rect(c, xx + 3, yy + 15, 6, 4, '#83ce8c');
      rect(c, xx - 4, yy, 10, 10, '#ffd184');
      rect(c, xx - 6, yy + 3, 14, 4, '#ffd184');
      rect(c, xx - 1, yy + 3, 4, 4, '#a77645');
      rect(c, xx - 3, yy + 1, 4, 2, '#fff1ce');
    }
  } else if (type === 'gardenPot') {
    rect(c, x - 10, y + 2, 23, 4, '#345d4933');
    rect(c, x - 8, y - 11, 17, 14, '#bc775a');
    rect(c, x - 11, y - 13, 23, 5, '#edaa7b');
    rect(c, x - 5, y - 8, 3, 8, '#f4c19a');
    for (let i = 0; i < 3; i++)
      bloom(
        c,
        x - 7 + i * 6,
        y - 29 - (i % 2) * 4,
        COLORS[(p.variant + i) % 4],
        1.5,
      );
  } else if (type === 'gatePillar') {
    rect(c, x - 16, y + 5, 32, 7, '#345d4933');
    rect(c, x - 12, y - 6, 24, 18, '#78867b');
    rect(c, x - 9, y - 3, 18, 9, '#c6c5a7');
    rect(c, x - 12, y + 9, 24, 3, '#647968');
    rect(c, x - 8, y - 71, 16, 66, '#76583e');
    rect(c, x - 5, y - 68, 10, 62, '#b28b5a');
    rect(c, x - 4, y - 65, 3, 55, '#d6b57d');
    rect(c, x + 4, y - 63, 2, 56, '#8e6948');
    rect(c, x - 13, y - 73, 26, 7, '#e2d0a4');
    rect(c, x - 10, y - 79, 20, 6, '#92724d');
    for (let i = 0; i < 3; i++) {
      rect(c, x + (i % 2 ? -8 : 6), y - 42 + i * 12, 3, 10, '#389b6c');
      rect(c, x + (i % 2 ? -13 : 6), y - 38 + i * 12, 7, 4, '#78ce8b');
    }
  } else if (type === 'gardenArch') {
    rect(c, x - 72, y - 83, 144, 9, '#5b674c');
    rect(c, x - 67, y - 91, 134, 8, '#76583e');
    rect(c, x - 60, y - 94, 120, 4, '#d6b57d');
    rect(c, x - 65, y - 87, 130, 3, '#e2d0a4');
    for (let i = 0; i < 9; i++)
      rect(c, x - 61 + i * 15, y - 84, 5, 9, '#b28b5a');
    rect(c, x - 40, y - 74, 80, 20, '#76583e');
    rect(c, x - 37, y - 71, 74, 14, '#e2d0a4');
    c.fillStyle = '#52664c';
    c.font = 'bold 9px monospace';
    c.textAlign = 'center';
    c.fillText('JEKEK’S GARDEN', x, y - 61);
    c.textAlign = 'left';
    for (let i = 0; i < 10; i++) {
      const xx = x - 67 + i * 14,
        yy = y - 94 + (i % 3) * 3;
      rect(c, xx, yy, 11, 7, '#318a62');
      rect(c, xx + 2, yy - 2, 7, 4, '#78ce8b');
      if (i % 2 === 0) bloom(c, xx + 4, yy - 4, COLORS[i % 4], 1);
    }
  }
}
export const GARDEN_PROPS = [
  ...[
    [1715, 300],
    [1715, 395],
    [1715, 550],
    [1890, 255],
    [2150, 250],
    [2395, 310],
    [2395, 435],
    [2395, 550],
    [1935, 245],
    [2130, 575],
    [1895, 575],
    [2190, 575],
    [2180, 245],
    [2250, 255],
  ].map(([x, y], i) => ({
    type: 'tree',
    x,
    y,
    s: i % 3 === 0 ? 0.85 : 0.75,
    variant: i % 5 === 0 ? 'blossom' : i % 5 === 3 ? 'lilac' : 'green',
  })),
  ...[
    [1750, 280],
    [1800, 265],
    [1985, 255],
    [2050, 255],
    [2310, 275],
    [2360, 285],
    [1745, 505],
    [1790, 550],
    [1950, 560],
    [2020, 565],
    [2260, 560],
    [2320, 555],
    [2380, 505],
  ].map(([x, y], i) => ({
    type: 'gardenBush',
    x,
    y,
    variant: i % 4,
    solid: false,
  })),
  ...[
    [1750, 335],
    [1750, 360],
    [1745, 530],
    [1780, 535],
    [1915, 275],
    [2010, 265],
    [2080, 275],
    [2280, 535],
    [2330, 535],
    [2360, 365],
    [2360, 395],
    [2080, 550],
    [2230, 550],
    [1870, 570],
    [1970, 365],
    [1960, 430],
    [2090, 370],
    [2190, 425],
  ].map(([x, y], i) => ({
    type: 'gardenFlowers',
    x,
    y,
    variant: i % 4,
    solid: false,
  })),
  ...[
    [1750, 420],
    [1755, 450],
    [1840, 560],
    [2040, 550],
    [2345, 425],
    [2320, 555],
    [1950, 375],
    [2170, 385],
  ].map(([x, y]) => ({ type: 'gardenFern', x, y, solid: false })),
  ...[
    [1815, 272],
    [2030, 262],
    [2280, 278],
    [1940, 390],
    [2075, 390],
    [2230, 558],
  ].map(([x, y]) => ({ type: 'gardenSunflowers', x, y, solid: false })),
  { type: 'gardenPot', x: 1551, y: 550, variant: 0, solid: false },
  { type: 'gardenPot', x: 1630, y: 550, variant: 1, solid: false },
  { type: 'gardenArch', x: 1590, y: 510, solid: false },
  { type: 'gatePillar', x: 1537, y: 510 },
  { type: 'gatePillar', x: 1644, y: 510 },
];
export function drawGardenGround(c) {
  const r = (x, y, w, h, col) => rect(c, x, y, w, h, col);
  // Stepped meadow edges blend into the town rather than forming a flat rounded box.
  r(1680, 282, 770, 270, '#86bf8c');
  r(1700, 258, 730, 322, '#86bf8c');
  r(1740, 242, 645, 352, '#86bf8c');
  r(1705, 290, 718, 265, '#9bd7a0');
  r(1745, 267, 635, 303, '#9bd7a0');
  for (let i = 0; i < 90; i++) {
    const x = 1725 + ((i * 83) % 680),
      y = 280 + ((i * 47) % 280);
    r(x, y, 3, 5, i % 3 ? '#82c28b' : '#b6e2b1');
    r(x + 4, y + 3, 3, 2, '#82c28b');
  }
  // Rasterized broad trail follows the existing snake circuit without adding walls.
  const points = [
    [1670, 480],
    [1750, 480],
    [1785, 440],
    [1795, 345],
    [1850, 305],
    [2020, 300],
    [2160, 288],
    [2310, 325],
    [2345, 405],
    [2310, 485],
    [2170, 510],
    [1950, 508],
    [1900, 510],
  ];
  const trail = (size, color) => {
    for (let j = 1; j < points.length; j++) {
      const [ax, ay] = points[j - 1],
        [bx, by] = points[j];
      const steps = Math.ceil(Math.hypot(bx - ax, by - ay) / 4);
      for (let i = 0; i <= steps; i++) {
        const x = Math.round((ax + ((bx - ax) * i) / steps) / 4) * 4,
          y = Math.round((ay + ((by - ay) * i) / steps) / 4) * 4;
        r(x - size / 2, y - size / 2, size, size, color);
      }
    }
  };
  trail(36, '#bcab82');
  trail(28, '#e5cea3');
  for (let i = 0; i < 35; i++) {
    const j = i % (points.length - 1),
      a = points[j],
      b = points[j + 1],
      f = ((i * 7) % 10) / 10;
    r(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, 3, 2, '#d2b98d');
  }
  // Three planted islands create clear activity pockets, with low walkable flowers.
  for (const [x, y, w, h] of [
    [1865, 350, 120, 90],
    [2055, 350, 155, 110],
    [1960, 535, 145, 34],
  ]) {
    r(x + 8, y - 4, w - 16, h + 8, '#70ac7e');
    r(x, y, w, h, '#70ac7e');
    r(x + 4, y + 3, w - 8, h - 6, '#89c68f');
    for (let i = 0; i < 12; i++)
      bloom(
        c,
        x + 12 + ((i * 19) % (w - 24)),
        y + 12 + ((i * 13) % (h - 18)),
        COLORS[i % 4],
        1,
      );
  }
  // Existing resting rock keeps its exact solid footprint, now shaded and textured.
  r(1994, 413, 75, 8, '#345d4933');
  r(2000, 390, 62, 28, '#78867b');
  r(2005, 386, 50, 22, '#c6c5a7');
  r(2008, 387, 38, 3, '#e2d8b7');
  r(2037, 400, 11, 3, '#99a78d');
  r(2000, 411, 62, 6, '#697d70');
  for (const [x, y] of [
    [1910, 475],
    [1950, 465],
    [2110, 465],
    [2150, 470],
  ]) {
    r(x, y, 22, 10, '#78867b');
    r(x + 2, y - 2, 18, 9, '#c6c5a7');
    r(x + 5, y, 10, 2, '#e2d8b7');
  }
  // Small seedling nursery beside the gardener's watering route.
  r(2268, 551, 72, 19, '#987857');
  r(2272, 548, 64, 17, '#c3a073');
  for (let i = 0; i < 7; i++) {
    r(2276 + i * 8, 552, 3, 8, '#427c59');
    r(2273 + i * 8, 550, 8, 3, '#83ce8c');
  }
}
export function drawGardenGateLeaves(g, open) {
  const w = Math.max(2, Math.round(40 * (1 - open)));
  for (const x of [1550, 1630 - w]) {
    g.fillStyle(0x76583e);
    g.fillRect(x, 482, w, 4);
    g.fillRect(x, 502, w, 4);
    for (let i = 2; i < w; i += 8) {
      g.fillStyle(0xb28b5a);
      g.fillRect(x + i, 480, 4, 25);
      g.fillStyle(0xd6b57d);
      g.fillRect(x + i, 481, 1, 21);
    }
    g.lineStyle(3, 0x92724d);
    g.lineBetween(x, 501, x + w, 486);
  }
  if (open < 0.4) {
    g.fillStyle(0xffd184);
    g.fillRect(1587, 491, 6, 4);
  }
}
