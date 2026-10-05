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
export const LOCATIONS = [
  {
    id: 'about',
    name: 'Revan’s home',
    subtitle: 'Meet the maker',
    x: 180,
    y: 185,
    doorX: 180,
    doorY: 262,
    color: 0xc67855,
  },
  {
    id: 'projects',
    name: 'The workshop',
    subtitle: 'Things I’ve built',
    x: 475,
    y: 155,
    doorX: 475,
    doorY: 245,
    color: 0xbc6654,
  },
  {
    id: 'skills',
    name: 'The library',
    subtitle: 'Tools of the trade',
    x: 760,
    y: 185,
    doorX: 760,
    doorY: 262,
    color: 0x718b97,
  },
  {
    id: 'experience',
    name: 'Memory hall',
    subtitle: 'My journey & certificates',
    x: 230,
    y: 435,
    doorX: 230,
    doorY: 505,
    color: 0x8c7770,
  },
  {
    id: 'contact',
    name: 'The post office',
    subtitle: 'Say hello',
    x: 690,
    y: 435,
    doorX: 690,
    doorY: 505,
    color: 0xb16f59,
  },
];
export const OBSTACLES = LOCATIONS.map((l) => ({
  x: l.x - 65,
  y: l.y - 50,
  w: 130,
  h: l.doorY - l.y + 35,
}));
export function drawWorld(ctx) {
  const r = (x, y, w, h, c) => {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
  };
  let seed = 87;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  r(0, 0, 960, 640, '#71936a');
  for (let y = 0; y < 640; y += 16)
    for (let x = 0; x < 960; x += 16) {
      const v = rand();
      if (v > 0.63) r(x + 3, y + 5, 5, 2, '#81a174');
      if (v > 0.82) {
        r(x + 9, y + 9, 2, 4, '#567d56');
        r(x + 7, y + 11, 6, 1, '#567d56');
      }
    }
  // Paths lead to every doorway; stone plaza in the center.
  r(160, 270, 625, 40, '#cebb91');
  r(455, 228, 40, 340, '#cebb91');
  r(180, 486, 545, 40, '#cebb91');
  for (const l of LOCATIONS)
    r(l.doorX - 20, l.doorY, 40, l.y < 300 ? 45 : 25, '#cebb91');
  r(405, 295, 140, 100, '#b1aa8a');
  for (let y = 297; y < 393; y += 16)
    for (let x = 407; x < 543; x += 20) {
      r(x, y, 17, 13, rand() > 0.5 ? '#c2b99c' : '#aaa68a');
    }
  for (let i = 0; i < 270; i++) {
    const x = Math.floor(rand() * 960),
      y = Math.floor(rand() * 640);
    if (
      (y > 270 && y < 310 && x > 160 && x < 785) ||
      (x > 455 && x < 495 && y > 230 && y < 565) ||
      (y > 486 && y < 526 && x > 180 && x < 725)
    )
      r(x, y, 3, 2, '#b9a981');
  }
  // A pond with a wooden bridge.
  r(785, 375, 116, 100, '#536f5c');
  r(793, 367, 92, 116, '#536f5c');
  r(794, 381, 98, 84, '#7aafb0');
  r(808, 372, 65, 103, '#7aafb0');
  for (let i = 0; i < 22; i++)
    r(805 + rand() * 72, 385 + rand() * 70, 12, 2, '#a1c8ba');
  r(775, 415, 128, 27, '#684e3c');
  for (let x = 777; x < 901; x += 10) r(x, 417, 8, 21, '#b99b6a');
  r(775, 412, 128, 4, '#dec496');
  // Fences around the edge.
  for (let x = 45; x < 920; x += 28) {
    r(x, 55, 5, 22, '#b1a078');
    r(x, 62, 28, 4, '#c6b28a');
    r(x, 72, 28, 3, '#9f8965');
  }
  for (let x = 45; x < 920; x += 28) {
    r(x, 595, 5, 22, '#b1a078');
    r(x, 602, 28, 4, '#c6b28a');
  }
  function tree(x, y, s = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    r(-17, 11, 43, 9, '#314e3e50');
    r(0, 0, 8, 25, '#796346');
    r(-19, -32, 45, 35, '#355f47');
    r(-13, -45, 33, 20, '#416f4f');
    r(-25, -20, 53, 18, '#3b674a');
    r(-13, -35, 25, 5, '#57815a');
    r(-19, -13, 15, 4, '#57815a');
    ctx.restore();
  }
  for (const [x, y, s] of [
    [70, 150, 1.4],
    [88, 385, 1.5],
    [365, 170, 1],
    [865, 180, 1.4],
    [900, 310, 1],
    [70, 520, 1],
    [385, 460, 1],
    [570, 470, 1],
    [850, 550, 1.2],
    [335, 555, 0.8],
    [585, 110, 0.9],
    [300, 95, 0.8],
    [595, 580, 0.7],
  ])
    tree(x, y, s);
  // Roofs, windows, signs and planters.
  for (const l of LOCATIONS) {
    const x = l.x - 65,
      y = l.y - 35,
      roof = '#' + l.color.toString(16).padStart(6, '0');
    r(x + 4, y + 42, 136, 65, '#3c543e40');
    r(x, y, 130, 90, '#e1cea3');
    r(x, y + 75, 130, 15, '#b9a47f');
    r(x - 10, y - 12, 150, 37, roof);
    r(x, y - 27, 130, 15, roof);
    r(x + 13, y - 37, 104, 10, roof);
    r(x + 28, y - 44, 74, 7, roof);
    for (let row = 0; row < 3; row++)
      for (let col = 0; col < 8; col++)
        r(
          x - 6 + col * 18 + (row % 2) * 5,
          y - 10 + row * 11,
          14,
          2,
          '#ffffff25',
        );
    r(x - 12, y + 23, 154, 5, '#694e40');
    r(x + 94, y - 45, 13, 24, '#ab9274');
    r(x + 91, y - 47, 19, 5, '#cab492');
    for (const wx of [x + 14, x + 91]) {
      r(wx, y + 40, 26, 25, '#7c6851');
      r(wx + 3, y + 43, 20, 18, '#739e99');
      r(wx + 12, y + 43, 2, 18, '#e4d2a7');
      r(wx + 3, y + 51, 20, 2, '#e4d2a7');
      r(wx - 3, y + 65, 32, 4, '#b6996e');
    }
    r(l.x - 13, y + 45, 26, 45, '#725843');
    r(l.x - 10, y + 49, 20, 39, '#8d6d4e');
    r(l.x + 6, y + 69, 3, 3, '#e1b860');
    r(l.x - 21, y + 90, 42, 6, '#dcc99f');
    r(x + 5, y + 79, 19, 12, '#a06748');
    r(x + 4, y + 74, 22, 7, '#497b52');
    r(x + 8, y + 71, 4, 5, '#e5b567');
    r(x + 15, y + 70, 4, 5, '#cb837c');
    if (l.id === 'projects') {
      r(x + 10, y + 39, 32, 28, '#404f48');
      r(x + 14, y + 43, 24, 18, '#a0bcb0');
      r(x + 20, y + 47, 13, 2, '#eff0cf');
    }
    if (l.id === 'contact') {
      r(x + 130, y + 69, 12, 24, '#73533f');
      r(x + 122, y + 58, 28, 16, '#b45f51');
      r(x + 125, y + 63, 17, 3, '#e2c89c');
    }
  }
  // Fountain, noticeboard, mushrooms and flowers.
  r(452, 332, 44, 29, '#697d77');
  r(459, 326, 30, 29, '#8bb9b3');
  r(468, 316, 12, 31, '#c4c7af');
  r(464, 313, 20, 6, '#dcd8bf');
  r(456, 361, 37, 4, '#788579');
  r(340, 324, 6, 34, '#786247');
  r(378, 324, 6, 34, '#786247');
  r(336, 307, 52, 32, '#72553c');
  r(341, 312, 42, 21, '#d9c49a');
  r(346, 316, 24, 2, '#a28b69');
  r(346, 322, 31, 2, '#a28b69');
  for (let i = 0; i < 65; i++) {
    const x = 60 + rand() * 850,
      y = 90 + rand() * 480;
    if (
      OBSTACLES.some(
        (o) =>
          x > o.x - 20 &&
          x < o.x + o.w + 20 &&
          y > o.y - 30 &&
          y < o.y + o.h + 10,
      ) ||
      (x > 400 && x < 550) ||
      (y > 265 && y < 315) ||
      (y > 480 && y < 530)
    )
      continue;
    r(x, y, 2, 6, '#4e7850');
    r(x - 2, y - 1, 6, 4, rand() > 0.5 ? '#edce89' : '#dba19b');
    r(x, y, 2, 2, '#f2e0ae');
  }
}
