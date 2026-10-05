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
    ctx.fillRect(x + a, y + b, w, h);
  };
  r(5, 28, 20, 4, '#233d3270');
  if (gender === 'female') {
    r(6, 3, 20, 18, '#49362f');
    r(5, 12, 4, 11, '#49362f');
    r(24, 12, 4, 11, '#49362f');
  }
  r(9, 5, 15, 12, SKINS[skin]);
  r(7, 2, 19, 6, '#49362f');
  r(6, 6, 5, 6, '#49362f');
  if (direction !== 'up') {
    r(direction === 'left' ? 10 : 14, 10, 2, 2, '#2c3435');
    r(direction === 'right' ? 22 : 21, 10, 2, 2, '#2c3435');
    r(16, 15, 5, 1, '#b47459');
  }
  r(9, 18, 15, 10, OUTFITS[outfit]);
  r(7, 18, 3, 9, SKINS[skin]);
  r(24, 18, 3, 9, SKINS[skin]);
  r(14, 18, 4, 3, '#fff1cb');
  r(10, 28, 6, 4, '#35475a');
  r(19, 28, 5, 4, '#35475a');
  r(9, 31 + (frame % 2), 7, 3, '#3c302c');
  r(19, 31 - (frame % 2), 7, 3, '#3c302c');
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
    y: 870,
    w: 330,
    h: 150,
    doorX: 315,
    doorY: 1020,
    color: '#cec4b2',
  },
  {
    id: 'contact',
    name: 'Post & coffee',
    subtitle: 'Let’s build together',
    x: 1080,
    y: 840,
    w: 300,
    h: 180,
    doorX: 1230,
    doorY: 1020,
    color: '#c7ad91',
  },
];
export const OBSTACLES = [
  ...LOCATIONS.map((l) => ({ x: l.x, y: l.y - 15, w: l.w, h: l.h + 15 })),
  { x: 0, y: 0, w: 745, h: 170 },
  { x: 855, y: 0, w: 745, h: 170 },
  { x: 95, y: 490, w: 370, h: 290 },
  { x: 680, y: 600, w: 130, h: 115 },
];
export function drawWorld(ctx) {
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
  // Layered tree canopies use clusters rather than flat shapes.
  function tree(x, y, s = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    r(-27, 7, 58, 13, '#263e3450');
    r(-4, -22, 11, 43, '#6f4d36');
    r(-1, -18, 3, 35, '#a47c4f');
    r(-33, -61, 64, 44, '#2d5736');
    r(-26, -75, 48, 22, '#2d5736');
    r(-40, -48, 75, 28, '#345f36');
    r(-26, -68, 49, 42, '#427943');
    r(-17, -77, 29, 15, '#4d8544');
    r(-32, -48, 22, 23, '#4a8445');
    r(3, -59, 26, 26, '#386b39');
    for (let i = 0; i < 40; i++) {
      const xx = -24 + random() * 45,
        yy = -66 + random() * 36;
      r(xx, yy, 5, 3, random() > 0.6 ? '#60964b' : '#4b8040');
    }
    r(-14, -65, 16, 4, '#73a157');
    ctx.restore();
  }
  for (const [x, y, s] of [
    [72, 315, 1],
    [485, 280, 1.2],
    [1020, 310, 1.1],
    [1460, 350, 1.3],
    [542, 545, 0.8],
    [961, 545, 0.8],
    [1140, 575, 0.9],
    [1400, 650, 1],
    [545, 740, 0.9],
    [965, 740, 0.9],
    [60, 950, 1.1],
    [550, 1000, 1],
    [1485, 1000, 1],
    [1090, 730, 0.8],
    [1380, 190, 0.8],
    [360, 210, 0.65],
  ])
    tree(x, y, s);
  function bench(x, y) {
    r(x + 2, y + 8, 72, 14, '#35434270');
    r(x, y, 72, 23, '#506166');
    r(x + 5, y + 3, 62, 4, '#c4a477');
    r(x + 5, y + 10, 62, 4, '#d2b484');
    r(x + 5, y + 17, 62, 4, '#b99566');
    r(x + 4, y + 21, 5, 9, '#424f50');
    r(x + 63, y + 21, 5, 9, '#424f50');
  }
  function lamp(x, y) {
    r(x + 4, y + 4, 24, 7, '#39453e40');
    r(x + 10, y - 57, 5, 65, '#4a5655');
    r(x + 3, y - 64, 20, 5, '#39464a');
    r(x + 5, y - 83, 16, 20, '#3a474b');
    r(x + 8, y - 79, 10, 13, '#e9d9a8');
    r(x + 4, y - 86, 18, 4, '#3a474b');
    r(x + 8, y - 89, 10, 3, '#3a474b');
    r(x + 6, y + 7, 13, 3, '#37474a');
  }
  for (let x = 60; x < 1550; x += 230) {
    if (x > 720 && x < 870) continue;
    bench(x, 192);
    lamp(x + 85, 202);
  }
  bench(590, 520);
  bench(825, 520);
  bench(590, 755);
  bench(825, 755);
  lamp(610, 575);
  lamp(845, 575);
  lamp(610, 810);
  lamp(845, 810);
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
  // Cafe terrace with parasols, chairs, and tables.
  for (const [x, y] of [
    [1170, 670],
    [1340, 555],
  ]) {
    r(x - 15, y + 24, 34, 14, '#4d554b55');
    r(x - 12, y + 15, 25, 17, '#b89965');
    r(x - 20, y + 12, 7, 18, '#755d49');
    r(x + 18, y + 12, 7, 18, '#755d49');
    r(x, y - 27, 3, 60, '#695b44');
    r(x - 35, y - 34, 74, 15, '#e2d0a4');
    r(x - 24, y - 44, 52, 10, '#e2d0a4');
    r(x - 10, y - 51, 24, 7, '#d2b988');
    r(x - 35, y - 23, 74, 5, '#b67457');
    for (let xx = x - 30; xx < x + 35; xx += 18)
      r(xx, y - 34, 8, 15, '#b67457');
  }
  // Crates, notice boards and pavement plaques.
  r(850, 445, 44, 30, '#644f3a');
  r(854, 449, 36, 22, '#dabd83');
  r(855, 475, 4, 15, '#765c40');
  r(886, 475, 4, 15, '#765c40');
  r(860, 454, 24, 2, '#7c7055');
  r(860, 460, 20, 2, '#7c7055');
  for (const [x, y] of [
    [1050, 465],
    [1050, 480],
    [1400, 870],
  ]) {
    r(x, y, 24, 20, '#99744e');
    r(x + 2, y + 2, 20, 16, '#b79769');
    r(x + 4, y + 3, 3, 15, '#8d6d4c');
    r(x + 17, y + 3, 3, 15, '#8d6d4c');
  }
  r(1155, 798, 135, 25, '#52625c');
  ctx.fillStyle = '#e3d8b5';
  ctx.font = '12px monospace';
  ctx.fillText('SEND A HELLO →', 1168, 815);
  // Architectural floor mosaics add rhythm to the main boulevard.
  for (let y = 445; y < 1080; y += 40)
    for (const x of [590, 870]) {
      r(x, y, 28, 28, '#768f8f');
      r(x + 3, y + 3, 22, 22, '#8ba3a0');
      r(x + 7, y + 7, 14, 14, '#7b9696');
      r(x + 10, y + 10, 8, 8, '#98ada5');
    }
}
