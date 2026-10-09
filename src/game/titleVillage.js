import { drawProp } from './art.js';

export function titleTime(hour) {
  if (hour >= 5 && hour < 10) return 'morning';
  if (hour >= 10 && hour < 17) return 'day';
  if (hour >= 17 && hour < 19) return 'evening';
  return 'night';
}

const PALETTES = {
  morning: ['#abc9c8', '#e8d5ab', '#849f94', '#6c947b', '#679575', '#86ae7b'],
  day: ['#85becb', '#d9e6ce', '#7b9c96', '#5c9276', '#5a916b', '#7eaf79'],
  evening: ['#7c829f', '#dab19d', '#6c7888', '#5c7a78', '#4d7165', '#71917a'],
  night: ['#202f49', '#354860', '#354b60', '#334f54', '#2e5147', '#446854'],
};

export function drawTitleVillage(c, time) {
  const [sky, horizon, far, hill, grass, lightGrass] = PALETTES[time];
  const dark = time === 'night' || time === 'evening';
  const r = (x, y, w, h, color) => {
    c.fillStyle = color;
    c.fillRect(Math.round(x), Math.round(y), w, h);
  };
  const land = (points, color) => {
    c.fillStyle = color;
    c.beginPath();
    points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    c.fill();
  };
  r(0, 0, 640, 360, sky);
  r(0, 112, 640, 86, horizon);
  if (time === 'night') {
    for (let i = 0; i < 40; i++)
      r(
        (i * 83 + 19) % 640,
        (i * 37 + 12) % 119,
        i % 6 === 0 ? 2 : 1,
        2,
        '#d8dfca',
      );
    r(512, 35, 22, 22, '#e5dfbe');
    r(518, 31, 15, 30, '#e5dfbe');
    r(526, 31, 14, 20, sky);
  } else {
    r(489, 48, 24, 24, time === 'evening' ? '#e5ad80' : '#f0dfb3');
    r(485, 54, 32, 12, time === 'evening' ? '#e5ad80' : '#f0dfb3');
    for (const [x, y] of [
      [48, 42],
      [179, 76],
      [375, 30],
      [558, 97],
    ]) {
      r(x, y, 45, 7, '#d9e5d380');
      r(x + 9, y - 5, 22, 5, '#d9e5d380');
    }
  }
  land(
    [
      [0, 141],
      [48, 141],
      [48, 131],
      [95, 131],
      [95, 117],
      [142, 117],
      [142, 127],
      [211, 127],
      [211, 143],
      [265, 143],
      [265, 132],
      [340, 132],
      [340, 114],
      [397, 114],
      [397, 124],
      [450, 124],
      [450, 143],
      [519, 143],
      [519, 127],
      [588, 127],
      [588, 142],
      [640, 142],
      [640, 250],
      [0, 250],
    ],
    far,
  );
  land(
    [
      [0, 184],
      [50, 184],
      [50, 175],
      [113, 175],
      [113, 182],
      [177, 182],
      [177, 196],
      [245, 196],
      [245, 187],
      [320, 187],
      [320, 177],
      [398, 177],
      [398, 184],
      [460, 184],
      [460, 166],
      [549, 166],
      [549, 176],
      [640, 176],
      [640, 290],
      [0, 290],
    ],
    hill,
  );
  r(0, 224, 640, 136, grass);
  for (let i = 0; i < 85; i++)
    r((i * 67) % 640, 232 + ((i * 19) % 125), 5, 2, lightGrass);
  land(
    [
      [308, 236],
      [331, 236],
      [342, 268],
      [382, 301],
      [425, 360],
      [291, 360],
      [327, 310],
      [321, 279],
    ],
    '#b2a186',
  );
  land(
    [
      [0, 270],
      [67, 270],
      [67, 280],
      [130, 280],
      [130, 306],
      [98, 306],
      [98, 320],
      [0, 320],
    ],
    dark ? '#32576a' : '#4e98a5',
  );
  for (let i = 0; i < 14; i++)
    r(
      (i * 37) % 123,
      282 + ((i * 7) % 31),
      15,
      2,
      dark ? '#548396' : '#90bec0',
    );
  const house = (x, y, w, wall, roof) => {
    r(x - 3, y + 27, w + 8, 5, '#203c3240');
    r(x, y - 18, w, 47, '#394c46');
    r(x + 3, y - 15, w - 6, 42, wall);
    for (let row = 0; row < 8; row++) {
      const extra = -10 + row * 3;
      r(
        x - extra,
        y - 40 + row * 3,
        w + extra * 2,
        3,
        row % 2 ? roof : '#485453',
      );
    }
    r(x + 9, y - 7, 12, 14, '#36484b');
    r(x + 11, y - 5, 8, 10, dark ? '#e4c48a' : '#a2c1b6');
    r(x + w - 21, y - 7, 12, 14, '#36484b');
    r(x + w - 19, y - 5, 8, 10, dark ? '#e4c48a' : '#a2c1b6');
    r(x + w / 2 - 6, y + 8, 12, 21, '#5b5043');
    r(x + w / 2 - 3, y + 10, 6, 17, '#79654e');
    r(x + w - 17, y - 49, 7, 14, '#65706a');
    if (dark) {
      r(x + 8, y + 8, 14, 2, '#cfa875');
      r(x + w - 22, y + 8, 14, 2, '#cfa875');
    }
  };
  house(74, 246, 67, '#bcaa83', '#a46b59');
  house(466, 238, 77, '#a8b39c', '#657d8b');
  house(208, 236, 49, '#b9b69a', '#8b6e63');
  house(368, 225, 55, '#bdaf93', '#697d76');
  // Reuse the world's trees, outlines and stepped foliage shading.
  for (const [x, y, s] of [
    [18, 224, 0.72],
    [162, 227, 0.7],
    [287, 216, 0.52],
    [445, 219, 0.62],
    [585, 222, 0.9],
    [36, 344, 1.2],
    [611, 345, 1.1],
  ]) {
    c.save();
    if (dark) c.globalAlpha = 0.75;
    drawProp(c, { type: 'tree', x, y, s });
    c.restore();
  }
  // Fenced kitchen garden and rows of planted vegetables.
  r(452, 285, 114, 49, '#776a52');
  for (let y = 290; y < 330; y += 10)
    for (let x = 462; x < 560; x += 13) {
      r(x, y, 7, 4, dark ? '#63816a' : '#8aac6c');
      r(x + 2, y - 2, 3, 3, lightGrass);
    }
  for (let x = 445; x < 574; x += 16) {
    r(x, 277, 3, 14, '#b5a180');
    r(x, 335, 3, 14, '#b5a180');
  }
  r(445, 282, 129, 3, '#9c8b70');
  r(445, 340, 129, 3, '#9c8b70');
  r(84, 305, 71, 5, '#65594b');
  r(86, 298, 67, 4, '#ac9370');
  for (let x = 90; x < 154; x += 13) r(x, 293, 3, 26, '#8e765c');
  for (const [x, y] of [
    [177, 286],
    [420, 276],
  ]) {
    r(x, y - 26, 3, 28, '#44534a');
    r(x - 4, y - 32, 11, 9, '#3c4946');
    r(x - 2, y - 30, 7, 5, dark ? '#e7cc8f' : '#a5b8a0');
    if (dark) {
      r(x - 6, y - 23, 15, 2, '#c5a47355');
      r(x - 9, y + 2, 22, 3, '#c5a47335');
    }
  }
}
