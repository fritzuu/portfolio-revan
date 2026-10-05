// Original procedural pixel art. No third-party sprites or runtime image requests.
export const OUTFITS = ['#e7a54b', '#789ac4', '#c87972', '#87a875'];
export const SKINS = ['#f2c99f', '#c99066', '#8d5e46'];
export function drawCharacter(
  ctx,
  x,
  y,
  config = {},
  frame = 0,
  direction = 'down',
) {
  const { outfit = 0, skin = 0, gender = 'male' } = config;
  const r = (a, b, w, h, c) => {
    ctx.fillStyle = c;
    ctx.fillRect(Math.round(x + a), Math.round(y + b), w, h);
  };
  const swing = Math.sin((frame * Math.PI) / 4);
  r(5, 32, 20, 3, '#233d3230');
  y -= Math.abs(swing) * 1.2;
  if (gender === 'female') {
    r(6, 3, 20, 18, '#49362f');
    r(5, 12, 4, 11, '#49362f');
    r(24, 12, 4, 11, '#49362f');
  }
  r(9, 5, 15, 12, SKINS[skin]);
  r(7, 2, 19, 6, '#49362f');
  r(6, 6, 5, 6, '#49362f');
  if (direction === 'up') {
    r(9, 5, 15, 12, '#49362f');
    r(12, 7, 9, 2, '#60463a');
  } else if (direction === 'left' || direction === 'right') {
    const right = direction === 'right';
    r(right ? 22 : 10, 10, 2, 2, '#2c3435');
    r(right ? 24 : 7, 12, 3, 3, SKINS[skin]);
    r(right ? 8 : 20, 7, 5, 7, '#49362f');
    r(right ? 20 : 10, 15, 3, 1, '#b47459');
  } else {
    r(14, 10, 2, 2, '#2c3435');
    r(21, 10, 2, 2, '#2c3435');
    r(16, 15, 5, 1, '#b47459');
  }
  r(9, 18, 15, 10, OUTFITS[outfit]);
  r(7, 18 + swing * 2, 3, 9, SKINS[skin]);
  r(24, 18 - swing * 2, 3, 9, SKINS[skin]);
  if (direction !== 'up') r(14, 18, 4, 3, '#fff1cb');
  r(10, 28, 6, 4, '#35475a');
  r(19, 28, 5, 4, '#35475a');
  r(9, 31 + swing * 2, 7, 3, '#3c302c');
  r(19, 31 - swing * 2, 7, 3, '#3c302c');
}
export const WORLD_SIZE = { width: 1600, height: 1100 };
export const LOCATIONS = [
  {
    id: 'about',
    name: 'About Revan',
    subtitle: 'Meet the developer',
    x: 150,
    y: 230,
    w: 260,
    h: 180,
    doorX: 280,
    doorY: 410,
    color: '#b3c9c3',
  },
  {
    id: 'projects',
    name: 'Project studio',
    subtitle: 'Things I’ve built',
    x: 610,
    y: 230,
    w: 320,
    h: 170,
    doorX: 770,
    doorY: 400,
    color: '#ceb78e',
  },
  {
    id: 'skills',
    name: 'Tech library',
    subtitle: 'Tools & services',
    x: 1110,
    y: 230,
    w: 280,
    h: 190,
    doorX: 1250,
    doorY: 420,
    color: '#b4c7bd',
  },
  {
    id: 'experience',
    name: 'Memory museum',
    subtitle: 'Experience & certificates',
    x: 150,
    y: 820,
    w: 330,
    h: 150,
    doorX: 315,
    doorY: 970,
    color: '#cec4b2',
  },
  {
    id: 'contact',
    name: 'Post & coffee',
    subtitle: 'Let’s build together',
    x: 1080,
    y: 790,
    w: 300,
    h: 180,
    doorX: 1230,
    doorY: 970,
    color: '#c7ad91',
  },
];
// Every solid prop shares its visual placement and its foot-level collider.
export const PROPS = [
  ...[
    [72, 315, 1],
    [485, 280, 1.1],
    [1020, 310, 1],
    [1460, 350, 1.2],
    [542, 545, 0.8],
    [961, 545, 0.8],
    [1140, 575, 0.9],
    [1400, 650, 1],
    [545, 740, 0.9],
    [965, 740, 0.9],
    [60, 950, 1],
    [550, 1000, 1],
    [1485, 1000, 1],
    [1090, 730, 0.8],
  ].map(([x, y, s]) => ({ type: 'tree', x, y, s })),
  ...[60, 290, 520, 980, 1210, 1440].map((x) => ({ type: 'bench', x, y: 182 })),
  ...[
    [590, 520],
    [825, 520],
    [590, 755],
    [825, 755],
  ].map(([x, y]) => ({ type: 'bench', x, y })),
  ...[
    [145, 202],
    [375, 202],
    [605, 202],
    [1065, 202],
    [1295, 202],
    [1525, 202],
    [610, 575],
    [845, 575],
    [610, 810],
    [845, 810],
  ].map(([x, y]) => ({ type: 'lamp', x, y })),
  ...[
    [1170, 670],
    [1340, 555],
  ].map(([x, y]) => ({ type: 'table', x, y })),
  ...[
    [1050, 465],
    [1050, 490],
    [1400, 870],
  ].map(([x, y]) => ({ type: 'crate', x, y })),
  { type: 'board', x: 850, y: 445 },
];
export const propBounds = (p) => {
  const { x, y, s = 1, type } = p;
  if (type === 'tree')
    return { x: x - 13 * s, y: y - 8 * s, w: 27 * s, h: 30 * s };
  if (type === 'bench') return { x, y: y + 2, w: 72, h: 29 };
  if (type === 'lamp') return { x: x + 5, y: y - 4, w: 16, h: 15 };
  if (type === 'table') return { x: x - 25, y: y + 9, w: 53, h: 29 };
  if (type === 'board') return { x, y: y + 20, w: 44, h: 25 };
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
  { x: 81, y: 476, w: 398, h: 133 },
  { x: 180, y: 609, w: 299, h: 37 },
  { x: 81, y: 646, w: 398, h: 146 },
  { x: 666, y: 581, w: 154, h: 141 },
  ...PROPS.map(propBounds),
];
export function drawProp(ctx, p) {
  const { x, y, s = 1, type } = p;
  const r = (a, b, w, h, c) => {
    ctx.fillStyle = c;
    ctx.fillRect(a, b, w, h);
  };
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  if (type === 'tree') {
    r(-27, 7, 58, 13, '#263e3430');
    r(-4, -22, 11, 43, '#6f4d36');
    r(-1, -18, 3, 35, '#a47c4f');
    r(-33, -61, 64, 44, '#2d5736');
    r(-26, -75, 48, 22, '#2d5736');
    r(-40, -48, 75, 28, '#345f36');
    r(-26, -68, 49, 42, '#427943');
    r(-17, -77, 29, 15, '#4d8544');
    r(-32, -48, 22, 23, '#4a8445');
    r(3, -59, 26, 26, '#386b39');
    for (let i = 0; i < 32; i++)
      r(
        -24 + ((i * 17) % 45),
        -66 + ((i * 13) % 36),
        5,
        3,
        i % 3 ? '#4b8040' : '#60964b',
      );
    r(-14, -65, 16, 4, '#73a157');
  } else if (type === 'bench') {
    r(2, 8, 72, 14, '#35434240');
    r(0, 0, 72, 23, '#506166');
    for (let i = 0; i < 3; i++)
      r(5, 3 + i * 7, 62, 4, ['#c4a477', '#d2b484', '#b99566'][i]);
    r(4, 21, 5, 9, '#424f50');
    r(63, 21, 5, 9, '#424f50');
  } else if (type === 'lamp') {
    r(4, 4, 24, 7, '#39453e30');
    r(10, -57, 5, 65, '#4a5655');
    r(3, -64, 20, 5, '#39464a');
    r(5, -83, 16, 20, '#3a474b');
    r(8, -79, 10, 13, '#e9d9a8');
    r(4, -86, 18, 4, '#3a474b');
    r(8, -89, 10, 3, '#3a474b');
    r(6, 7, 13, 3, '#37474a');
  } else if (type === 'table') {
    r(-15, 24, 34, 14, '#4d554b40');
    r(-12, 15, 25, 17, '#b89965');
    r(-20, 12, 7, 18, '#755d49');
    r(18, 12, 7, 18, '#755d49');
    r(0, -27, 3, 60, '#695b44');
    r(-35, -34, 74, 15, '#e2d0a4');
    r(-24, -44, 52, 10, '#e2d0a4');
    r(-10, -51, 24, 7, '#d2b988');
    r(-35, -23, 74, 5, '#b67457');
    for (let xx = -30; xx < 35; xx += 18) r(xx, -34, 8, 15, '#b67457');
  } else if (type === 'board') {
    r(0, 0, 44, 30, '#644f3a');
    r(4, 4, 36, 22, '#dabd83');
    r(5, 30, 4, 15, '#765c40');
    r(36, 30, 4, 15, '#765c40');
    r(10, 9, 24, 2, '#7c7055');
    r(10, 15, 20, 2, '#7c7055');
  } else {
    r(0, 0, 24, 20, '#99744e');
    r(2, 2, 20, 16, '#b79769');
    r(4, 3, 3, 15, '#8d6d4c');
    r(17, 3, 3, 15, '#8d6d4c');
  }
  ctx.restore();
}
export function drawWorld(ctx, { baseOnly = false } = {}) {
  const r = (x, y, w, h, c) => {
    ctx.fillStyle = c;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };
  let seed = 176;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  r(0, 0, 1600, 1100, '#c0bbaa');
  // Individually shaded paving stones form a walkable city plaza.
  for (let y = 170; y < 1100; y += 22)
    for (let x = -12; x < 1600; x += 32) {
      const offset = (Math.floor(y / 22) % 2) * 16;
      const color = ['#c6c1b1', '#bdb8a8', '#c0bbaa', '#cbc5b3'][
        Math.floor(random() * 4)
      ];
      r(x + offset, y, 30, 20, color);
      r(x + offset, y, 30, 1, '#dad4c0');
      r(x + offset + 29, y, 1, 20, '#aaa593');
    }
  // A blue river runs along the northern promenade.
  function water(x, y, w, h) {
    r(x, y, w, h, '#348b9c');
    for (let yy = y; yy < y + h; yy += 8)
      for (let xx = x; xx < x + w; xx += 12) {
        r(
          xx,
          yy,
          11,
          6,
          ['#348b9c', '#3b94a4', '#2d8396', '#409bac'][
            Math.floor(random() * 4)
          ],
        );
        if (random() > 0.87) r(xx + 2, yy + 2, 7, 1, '#74b9c2');
      }
  }
  water(0, 0, 1600, 155);
  r(0, 155, 1600, 9, '#e0dcca');
  r(0, 164, 1600, 7, '#7d8f8e');
  r(741, 0, 118, 190, '#546363');
  r(750, 0, 100, 190, '#d5c8aa');
  for (let y = 0; y < 190; y += 14) {
    r(750, y, 100, 2, '#b9aa89');
    r(752, y + 2, 96, 1, '#e7d9ba');
  }
  r(739, 0, 9, 190, '#677f78');
  r(853, 0, 9, 190, '#677f78');
  for (let x = 20; x < 1600; x += 18) {
    if (x > 735 && x < 867) continue;
    r(x, 141, 3, 22, '#455e5d');
    r(x, 143, 18, 3, '#516d68');
  }
  // Lawn islands, borders, daisies and small patches of grass.
  function lawn(x, y, w, h) {
    r(x + 3, y + 4, w, h, '#858a72');
    r(x, y, w, h, '#467944');
    r(x + 5, y + 5, w - 10, h - 10, '#598b4b');
    for (let i = 0; i < (w * h) / 100; i++) {
      const xx = x + 7 + random() * (w - 14),
        yy = y + 7 + random() * (h - 14);
      r(xx, yy, 2, 3, random() > 0.5 ? '#6b9b56' : '#427b41');
      if (random() > 0.97) {
        r(xx - 1, yy, 4, 3, '#efdab5');
        r(xx, yy + 1, 2, 1, '#d4af57');
      }
    }
  }
  lawn(510, 465, 60, 300);
  lawn(925, 465, 70, 300);
  lawn(1090, 500, 390, 250);
  lawn(60, 195, 60, 250);
  // Rectangular garden lake; tiled banks and a small jetty.
  r(81, 476, 398, 316, '#6e7f79');
  r(86, 481, 388, 306, '#e4e0ce');
  water(95, 490, 370, 290);
  r(95, 773, 370, 7, '#2b6579');
  r(60, 609, 120, 37, '#665741');
  for (let x = 60; x < 180; x += 10) {
    r(x, 610, 8, 34, '#b99a65');
    r(x + 1, 613, 2, 28, '#c6aa78');
  }
  for (const [x, y] of [
    [155, 530],
    [390, 715],
    [265, 620],
  ]) {
    r(x, y, 17, 5, '#669b57');
    r(x + 4, y - 3, 8, 3, '#91b669');
    r(x + 7, y - 5, 3, 3, '#ddbf80');
  }
  // A central fountain with stone steps and tiled water.
  r(668, 588, 154, 140, '#4c62616b');
  r(666, 581, 154, 141, '#929f96');
  r(674, 589, 138, 125, '#d2d5bc');
  water(683, 600, 120, 105);
  r(702, 632, 82, 24, '#a3b8ad');
  r(709, 625, 68, 24, '#d5d6bd');
  r(735, 600, 15, 44, '#a6c0b8');
  r(727, 597, 32, 7, '#e3dfc6');
  r(733, 591, 20, 6, '#bacfc4');
  r(717, 653, 53, 3, '#6d979a');
  // Shop buildings, roof trim, floor-to-ceiling windows and striped awnings.
  for (const l of LOCATIONS) {
    const { x, y, w, h } = l;
    r(x + 12, y + 12, w + 5, h + 5, '#35443b55');
    r(x, y, w, h, l.color);
    r(x, y - 17, w, 22, '#52615c');
    r(x + 7, y - 12, w - 14, 7, '#88978a');
    r(x, y + h - 15, w, 15, '#908e7c');
    for (let yy = y + 8; yy < y + h - 20; yy += 14)
      for (let xx = x + 4; xx < x + w; xx += 28) {
        r(xx + (Math.floor(yy / 14) % 2) * 12, yy, 24, 1, '#ffffff20');
      }
    const doorW = 38;
    r(l.doorX - doorW / 2, y + h - 80, doorW, 80, '#42545a');
    r(l.doorX - 15, y + h - 75, 30, 68, '#548092');
    r(l.doorX - 12, y + h - 70, 6, 50, '#78a1ae');
    r(l.doorX + 8, y + h - 44, 3, 3, '#e1c380');
    for (let xx = x + 18; xx < x + w - 35; xx += 55) {
      if (Math.abs(xx - l.doorX) < 40) continue;
      r(xx, y + 48, 42, h - 78, '#596b70');
      r(xx + 4, y + 52, 34, h - 87, '#648b9b');
      r(xx + 8, y + 56, 6, h - 97, '#83a5b0');
      r(xx + 3, y + h - 48, 36, 4, '#b9c2b5');
      r(xx + 19, y + 51, 3, h - 85, '#bec6b9');
      r(xx, y + h - 28, 42, 5, '#d5d5c1');
    }
    r(x - 4, y + 27, w + 8, 19, '#e6d3ac');
    for (let xx = x - 4; xx < x + w + 4; xx += 22) {
      r(
        xx,
        y + 27,
        11,
        19,
        l.id === 'projects'
          ? '#c77654'
          : l.id === 'contact'
            ? '#ae6660'
            : '#62897c',
      );
    }
    r(x - 4, y + 45, w + 8, 5, '#425651');
    r(x + 24, y + 4, w - 48, 21, '#354c48');
    ctx.fillStyle = '#f5e5bc';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(l.name.toUpperCase(), x + w / 2, y + 19);
    ctx.textAlign = 'left';
    r(l.doorX - 26, l.doorY, 52, 8, '#e2dac0');
    r(l.doorX - 30, l.doorY + 8, 60, 5, '#aaa48c');
    for (const xx of [x + 7, x + w - 27]) {
      r(xx, y + h - 14, 21, 14, '#8d6650');
      r(xx - 2, y + h - 21, 25, 12, '#476e3c');
      for (let i = 0; i < 5; i++) {
        r(
          xx + i * 4,
          y + h - 23 + random() * 5,
          4,
          4,
          i % 2 ? '#ddac67' : '#d28577',
        );
      }
    }
  }
  if (!baseOnly)
    [...PROPS].sort((a, b) => a.y - b.y).forEach((p) => drawProp(ctx, p));
  r(1155, 1030, 135, 25, '#52625c');
  ctx.fillStyle = '#e3d8b5';
  ctx.font = '12px monospace';
  ctx.fillText('SEND A HELLO →', 1168, 1047);
  // Architectural floor mosaics add rhythm to the main boulevard.
  for (let y = 445; y < 1080; y += 40)
    for (const x of [590, 870]) {
      r(x, y, 28, 28, '#768f8f');
      r(x + 3, y + 3, 22, 22, '#8ba3a0');
      r(x + 7, y + 7, 14, 14, '#7b9696');
      r(x + 10, y + 10, 8, 8, '#98ada5');
    }
}
