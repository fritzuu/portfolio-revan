// District art shares the navigation layout; flat paths remain walkable.
export function drawExtension(c) {
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
  r(1690, 250, 750, 345, '#6eb78b');
  r(1700, 260, 730, 325, '#8dcf9c');
  for (let x = 1760; x < 2400; x += 40) {
    r(x, 275, 16, 4, '#b7dfaa');
    r(x, 560, 12, 4, '#b7dfaa');
  }
  // Python garden has a sandy trail and a shaded resting stone.
  r(1780, 290, 560, 32, '#d4c49b');
  r(1780, 490, 560, 32, '#d4c49b');
  r(1780, 290, 32, 220, '#d4c49b');
  r(2308, 290, 32, 220, '#d4c49b');
  r(1950, 365, 165, 90, '#6ca982');
  r(2000, 390, 62, 28, '#a5b2a1');
  r(2005, 386, 50, 22, '#c7ccb4');
  label('JEKEK’S GARDEN', 2060, 635);
  // A quiet grove with a moon-shaped stone mosaic and dim violet vegetation.
  r(1720, 750, 720, 350, '#688e88');
  r(1740, 770, 680, 310, '#79a19a');
  r(1990, 810, 120, 115, '#7988a2');
  r(2002, 820, 96, 94, '#a6b7bb');
  r(2024, 840, 38, 50, '#e1d8bb');
  r(2040, 834, 34, 49, '#a6b7bb');
  for (let i = 0; i < 28; i++) {
    const x = 1780 + ((i * 67) % 580),
      y = 790 + ((i * 43) % 270);
    r(x, y, 4, 9, '#526f7a');
    r(x - 3, y - 5, 10, 6, '#b3a0d0');
  }
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
  r(1545, 493, 90, 8, '#5a8d73');
  r(1550, 476, 7, 25, '#426d58');
  r(1624, 476, 7, 25, '#426d58');
  label('GARDEN GATE', 1590, 550);
}
