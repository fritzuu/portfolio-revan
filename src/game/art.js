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
  if (config.revan) {
    // Blue hoodie with cuffed sleeves, pocket and drawstrings.
    r(8, 17, 17, 11, '#3675bf');
    r(7, 18 + swing * 2, 3, 7, '#2c5fa3');
    r(24, 18 - swing * 2, 3, 7, '#2c5fa3');
    r(12, 24, 10, 3, '#285890');
    if (direction === 'up') {
      r(10, 16, 13, 7, '#285890');
      r(12, 17, 9, 4, '#508ed4');
    } else {
      r(13, 18, 2, 5, '#c7dced');
      r(20, 18, 2, 5, '#c7dced');
    }
    if (direction === 'down') {
      r(11, 9, 7, 6, '#202735');
      r(19, 9, 7, 6, '#202735');
      r(13, 11, 3, 2, '#b4ccdc');
      r(21, 11, 3, 2, '#b4ccdc');
      r(18, 10, 2, 2, '#202735');
    } else if (direction !== 'up') {
      r(direction === 'right' ? 19 : 7, 9, 8, 6, '#202735');
      r(direction === 'right' ? 21 : 9, 11, 4, 2, '#b4ccdc');
    }
  }
}
export {
  WORLD_SIZE,
  LOCATIONS,
  ACTIVITIES,
  DESTINATIONS,
  GARDENS,
  PROPS,
  OBSTACLES,
  propBounds,
} from './layout.js';
import { WORLD_SIZE, LOCATIONS, GARDENS, PROPS } from './layout.js';
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
  } else if (type === 'flowers') {
    r(-15, 0, 30, 13, '#94745a');
    r(-17, -3, 34, 6, '#bd9973');
    for (let i = 0; i < 5; i++) {
      r(-12 + i * 6, -12, 4, 12, '#65804b');
      r(-14 + i * 6, -15, 7, 6, i % 2 ? '#e6bd69' : '#dc937d');
      r(-12 + i * 6, -13, 3, 2, '#f7e2aa');
    }
  } else if (type === 'stall') {
    r(-40, -10, 80, 35, '#957048');
    r(-37, -7, 74, 28, '#bf9860');
    r(-42, -48, 84, 15, '#e7d8ad');
    r(-35, -59, 70, 11, '#759b91');
    for (let i = 0; i < 6; i++) r(-40 + i * 14, -48, 7, 15, '#73958b');
    r(-38, -33, 4, 25, '#5d675b');
    r(34, -33, 4, 25, '#5d675b');
    r(-25, -17, 18, 8, '#648da1');
    r(8, -18, 14, 9, '#d6bd79');
    r(-36, 26, 7, 9, '#57645c');
    r(28, 26, 7, 9, '#57645c');
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
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  };
  const label = (text, x, y, size = 12, color = '#6d766e') => {
    ctx.fillStyle = color;
    ctx.font = `bold ${size}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
    ctx.textAlign = 'left';
  };
  r(0, 0, WORLD_SIZE.width, WORLD_SIZE.height, '#d8d0b7');
  // Quiet pavement: an ordered surface rather than noisy random tiles.
  for (let y = 174; y < 1100; y += 24)
    for (let x = -24; x < 1600; x += 48) {
      const xx = x + ((y / 24) % 2 ? 24 : 0);
      r(
        xx,
        y,
        46,
        22,
        (Math.floor(x / 48) + Math.floor(y / 24)) % 4 ? '#d3ccb6' : '#d9d2bd',
      );
      r(xx, y, 46, 1, '#e5ddc8');
    }
  // Consistent street borders define the main circulation loop.
  for (const [x, y, w, h] of [
    [55, 435, 1490, 85],
    [505, 510, 80, 490],
    [1015, 510, 80, 490],
    [55, 995, 1490, 55],
  ]) {
    r(x - 3, y - 3, w + 6, h + 6, '#a9b1a3');
    r(x, y, w, h, '#e8dfc4');
    for (let yy = y + 8; yy < y + h; yy += 20)
      r(x + 6, yy, w - 12, 1, '#d9ceb3');
  }
  function water(x, y, w, h) {
    r(x, y, w, h, '#337f91');
    for (let yy = y + 4; yy < y + h - 4; yy += 12)
      for (let xx = x + 4; xx < x + w - 4; xx += 24) {
        r(xx, yy, 16, 2, (xx + yy) % 3 ? '#4f9dad' : '#428f9f');
        r(xx + 5, yy + 4, 7, 1, '#6bafba');
      }
  }
  water(0, 0, 1600, 155);
  r(0, 155, 1600, 9, '#e6dfc7');
  r(0, 164, 1600, 7, '#7f9b94');
  r(740, 0, 120, 191, '#53756c');
  r(750, 0, 100, 191, '#c6ac80');
  for (let y = 0; y < 191; y += 14) {
    r(752, y, 96, 2, '#a78f66');
    r(752, y + 3, 96, 1, '#dbc393');
  }
  r(740, 0, 8, 191, '#5f7b70');
  r(852, 0, 8, 191, '#5f7b70');
  // The rare-fish crossing has a rune circle rather than scattered decorations.
  r(774, 85, 52, 4, '#7dabb6');
  r(769, 90, 62, 33, '#558f9e');
  r(776, 96, 48, 21, '#b8d8cf');
  r(790, 100, 20, 14, '#709faf');
  label('ASTRAL CROSSING', 800, 60, 9, '#f0e2bd');
  for (let x = 22; x < 1600; x += 32) {
    if (x > 725 && x < 875) continue;
    r(x, 140, 3, 22, '#526f68');
    r(x, 143, 32, 3, '#6a8777');
  }
  for (const g of GARDENS) {
    r(g.x - 4, g.y - 4, g.w + 8, g.h + 8, '#aaa992');
    r(g.x, g.y, g.w, g.h, '#779968');
    r(g.x + 4, g.y + 4, g.w - 8, g.h - 8, '#83a476');
    for (let yy = g.y + 10; yy < g.y + g.h - 5; yy += 17)
      for (let xx = g.x + 9; xx < g.x + g.w - 5; xx += 19) {
        r(xx, yy, 2, 3, '#719361');
      }
  }
  // West garden lake, with a wide, navigable dock coming from the southern shore.
  r(85, 530, 400, 335, '#90a69a');
  r(91, 536, 388, 323, '#eee3c6');
  water(100, 545, 370, 305);
  r(238, 727, 124, 156, '#826a4c');
  r(245, 732, 110, 151, '#c3a574');
  for (let y = 735; y < 883; y += 13) {
    r(246, y, 108, 2, '#927856');
    r(247, y + 3, 106, 1, '#e0c18c');
  }
  for (const x of [238, 356])
    for (const y of [744, 794, 844]) {
      r(x, y, 7, 30, '#6f6049');
      r(x - 2, y - 3, 11, 6, '#e8cf95');
    }
  r(251, 758, 98, 3, '#e7d3a4');
  for (const [x, y] of [
    [150, 585],
    [405, 625],
    [180, 775],
    [425, 805],
  ]) {
    r(x, y, 24, 6, '#7a9d68');
    r(x + 7, y - 4, 10, 5, '#aec781');
    r(x + 11, y - 6, 3, 3, '#edcf87');
  }
  label('MOONWATER DOCK', 300, 919, 13);
  label('FISH • SELL • DISCOVER', 300, 938, 9);
  // A framed plaza; benches share two aligned rows around the fountain.
  r(680, 560, 240, 173, '#bfbea9');
  r(687, 567, 226, 159, '#e9dfc1');
  r(727, 593, 146, 119, '#829d98');
  r(732, 598, 136, 109, '#e1ddbd');
  water(741, 607, 118, 91);
  r(780, 633, 40, 28, '#a4beb7');
  r(790, 612, 20, 33, '#ced9c0');
  r(777, 608, 46, 7, '#e4e5c7');
  r(788, 601, 24, 7, '#afcbc2');
  label('CURIOSITY SQUARE', 800, 775, 13);
  label('A LITTLE CITY OF IDEAS', 800, 793, 9);
  label('THE READING GARDEN', 1260, 770, 12);
  for (const l of LOCATIONS) {
    const { x, y, w, h } = l;
    r(x + 8, y + 8, w, h, '#53645540');
    r(x, y, w, h, l.color);
    r(x, y - 17, w, 22, '#52665f');
    r(x + 6, y - 12, w - 12, 6, '#889c87');
    r(x, y + h - 14, w, 14, '#9e9d87');
    for (let yy = y + 55; yy < y + h - 17; yy += 16)
      r(x + 5, yy, w - 10, 1, '#ffffff25');
    r(l.doorX - 20, y + h - 85, 40, 85, '#486773');
    r(l.doorX - 16, y + h - 80, 32, 72, '#6f9ca8');
    r(l.doorX - 12, y + h - 74, 6, 53, '#a1c1c1');
    r(l.doorX + 9, y + h - 40, 3, 3, '#f6d991');
    for (const xx of [x + 22, x + 78, x + w - 120, x + w - 64]) {
      if (Math.abs(xx + 22 - l.doorX) < 45) continue;
      r(xx, y + 56, 42, h - 85, '#608392');
      r(xx + 4, y + 60, 34, h - 94, '#83a8b3');
      r(xx + 8, y + 64, 5, h - 104, '#b7d0ce');
      r(xx + 20, y + 59, 3, h - 92, '#cad1bd');
      r(xx - 2, y + h - 28, 46, 5, '#ece1c3');
    }
    r(x - 4, y + 31, w + 8, 19, '#f1dfb4');
    for (let xx = x - 4; xx < x + w + 4; xx += 24)
      r(
        xx,
        y + 31,
        12,
        19,
        l.id === 'projects'
          ? '#c98560'
          : l.id === 'contact'
            ? '#b77d73'
            : '#779889',
      );
    r(x - 4, y + 49, w + 8, 4, '#526b62');
    r(x + 20, y + 5, w - 40, 23, '#364e48');
    label(l.name.toUpperCase(), x + w / 2, y + 22, 13, '#f4e5bf');
    r(l.doorX - 29, l.doorY, 58, 8, '#eee4c7');
    r(l.doorX - 33, l.doorY + 8, 66, 5, '#b9ae8f');
    for (const xx of [x + 9, x + w - 28]) {
      r(xx, y + h - 12, 20, 12, '#ab8060');
      r(xx - 2, y + h - 20, 24, 10, '#71894e');
      r(xx + 1, y + h - 23, 5, 5, '#d89b80');
      r(xx + 11, y + h - 24, 5, 5, '#e8c17f');
    }
  }
  label('MIRA’S TACKLE', 550, 958, 12);
  label('A GOOD CATCH HAS A GOOD STORY', 550, 973, 8);
  if (!baseOnly)
    [...PROPS].sort((a, b) => a.y - b.y).forEach((p) => drawProp(ctx, p));
}
