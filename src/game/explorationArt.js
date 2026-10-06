import { tile } from './townAssets.js';
// District art shares the navigation layout; flat paths remain walkable.
export function drawExtension(c, assets = {}) {
  const r = (x, y, w, h, color) => {
    c.fillStyle = color;
    c.fillRect(x, y, w, h);
  };
  const label = (s, x, y) => {
    c.fillStyle = '#365c57';
    c.font = 'bold 16px monospace';
    c.textAlign = 'center';
    c.fillText(s, x, y);
    c.textAlign = 'left';
  };
  for (const [x, y, w, h] of [
    [1545, 435, 1010, 85],
    [1550, 180, 90, 1060],
    [505, 1050, 80, 510],
    [55, 1530, 2500, 45],
    [1640, 1170, 900, 55],
  ]) {
    r(x - 3, y - 3, w + 6, h + 6, '#b9a482');
    r(x, y, w, h, '#f7dab2');
  }
  // Rounded planted islands and stepping stones leave broad, irregular trails.
  c.fillStyle = '#8cbb82';
  c.beginPath();
  c.roundRect(1690, 250, 750, 345, 48);
  c.fill();
  c.strokeStyle = '#e3c89b';
  c.lineWidth = 30;
  c.lineJoin = 'round';
  c.beginPath();
  c.moveTo(1700, 480);
  c.quadraticCurveTo(1790, 485, 1790, 400);
  c.quadraticCurveTo(1775, 292, 1940, 303);
  c.quadraticCurveTo(2110, 282, 2318, 315);
  c.quadraticCurveTo(2370, 410, 2325, 485);
  c.quadraticCurveTo(2180, 520, 1910, 506);
  c.stroke();
  c.fillStyle = '#85c769';
  c.beginPath();
  c.roundRect(1855, 350, 345, 108, 30);
  c.fill();
  for (const [px, py] of [
    [1870, 367],
    [1890, 367],
    [1870, 387],
    [1890, 387],
    [2115, 374],
    [2135, 374],
    [2155, 394],
    [2135, 394],
  ])
    tile(c, assets.town, 2, px, py, 1.25);
  for (const [px, py] of [
    [1930, 425],
    [2160, 430],
    [1920, 358],
    [2180, 368],
  ])
    tile(c, assets.town, 28, px, py, 1.25);
  r(2000, 390, 62, 28, '#8b9f88');
  r(2005, 386, 50, 22, '#c7ccb4');
  for (const [x, y] of [
    [1910, 475],
    [1950, 465],
    [2110, 465],
    [2150, 470],
  ])
    tile(c, assets.town, 43, x, y, 1.5);
  label('JEKEK’S GARDEN', 2060, 635);
  // A quiet grove with a moon-shaped stone mosaic and dim violet vegetation.
  c.fillStyle = '#527f78';
  c.beginPath();
  c.roundRect(1720, 750, 720, 350, 70);
  c.fill();
  c.strokeStyle = '#8aa59a';
  c.lineWidth = 40;
  c.lineJoin = 'round';
  c.beginPath();
  c.moveTo(1730, 955);
  c.lineTo(1940, 955);
  c.lineTo(2005, 890);
  c.lineTo(2125, 890);
  c.lineTo(2290, 1030);
  c.stroke();
  c.fillStyle = '#718898';
  c.beginPath();
  c.ellipse(2050, 865, 100, 85, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#b1bfbb';
  c.beginPath();
  c.ellipse(2050, 865, 74, 62, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#e1d8bb';
  c.beginPath();
  c.arc(2040, 861, 30, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#b1bfbb';
  c.beginPath();
  c.arc(2053, 850, 27, 0, Math.PI * 2);
  c.fill();
  label('DREAM GROVE', 2080, 1135);
  // Football lines, goals and benches are legible even in the minimap.
  r(120, 1150, 1200, 370, '#3c9768');
  for (let x = 135; x < 1300; x += 100)
    r(
      x,
      1165,
      95,
      335,
      Math.floor((x - 135) / 100) % 2 ? '#51aa75' : '#489f6f',
    );
  c.strokeStyle = '#e2efd0';
  c.lineWidth = 3;
  c.strokeRect(155, 1175, 1130, 315);
  c.beginPath();
  c.moveTo(720, 1175);
  c.lineTo(720, 1490);
  c.stroke();
  c.beginPath();
  c.arc(720, 1332, 65, 0, Math.PI * 2);
  c.stroke();
  c.strokeRect(155, 1242, 105, 180);
  c.strokeRect(1180, 1242, 105, 180);
  for (const x of [126, 1285]) {
    r(x, 1290, 29, 85, '#dfe9d2');
    for (let y = 1294; y < 1372; y += 8) r(x + 3, y, 23, 1, '#81988c');
  }
  label('FOOTBALL PARK', 720, 1130);
  // Expanded eastern water includes an animated NPC fishing shore.
  r(1645, 1235, 890, 275, '#b1c9aa');
  r(1660, 1250, 860, 245, '#218eac');
  for (let y = 1260; y < 1485; y += 14)
    for (let x = 1670; x < 2510; x += 28) r(x, y, 17, 2, '#4db6ca');
  r(1632, 1280, 26, 220, '#ba9167');
  for (let y = 1283; y < 1500; y += 12) r(1635, y, 20, 2, '#e0b487');
  label('THE ANGLER’S SHORE', 2090, 1550);
  // Atlas stone arch and vines: the passage remains open between solid pillars.
  tile(c, assets.town, 113, 1542, 438, 3);
  tile(c, assets.town, 114, 1590, 438, 3);
  tile(c, assets.town, 28, 1525, 470, 1.5);
  tile(c, assets.town, 28, 1630, 470, 1.5);
  label('GARDEN GATE', 1590, 565);
  // A separate compact practice lane keeps training out of the live match.
  r(1380, 1190, 130, 300, '#74a97a');
  c.strokeStyle = '#e2efd0';
  c.lineWidth = 2;
  c.strokeRect(1390, 1200, 110, 280);
  r(1490, 1290, 25, 85, '#dfe9d2');
  for (let y = 1294; y < 1372; y += 8) r(1493, y, 20, 1, '#81988c');
  label('PRACTICE', 1440, 1180);
}
