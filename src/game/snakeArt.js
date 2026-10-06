// Articulated ribbon: gold saddles, dark outlines, pale highlights and a broad python head.
// Draw into a small nearest-neighbor canvas so the changing silhouette stays pixel art.
export function drawSnake(c, s, time, headImage) {
  c.clearRect(0, 0, 192, 192);
  const origin = { x: s.head.x - 96, y: s.head.y - 96 };
  const points = s.joints.map((p) => ({
    x: p.x - origin.x,
    y: p.y - origin.y,
  }));
  const normals = points.map((p, i) => {
    const a = points[Math.max(0, i - 1)],
      b = points[Math.min(points.length - 1, i + 1)],
      angle = Math.atan2(a.y - b.y, a.x - b.x);
    return { x: -Math.sin(angle), y: Math.cos(angle) };
  });
  const widths = points.map(
    (_, i) => 5.1 * (1 - Math.pow(i / (points.length - 1), 1.6)) + 0.7,
  );
  // Connected polygons avoid the square beads and gaps of the former segmented drawing.
  for (let i = points.length - 2; i >= 0; i--) {
    const a = points[i],
      b = points[i + 1],
      na = normals[i],
      nb = normals[i + 1],
      wa = widths[i],
      wb = widths[i + 1];
    const quad = (inset, color) => {
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(
        Math.round(a.x + na.x * (wa - inset)),
        Math.round(a.y + na.y * (wa - inset)),
      );
      c.lineTo(
        Math.round(b.x + nb.x * (wb - inset)),
        Math.round(b.y + nb.y * (wb - inset)),
      );
      c.lineTo(
        Math.round(b.x - nb.x * (wb - inset)),
        Math.round(b.y - nb.y * (wb - inset)),
      );
      c.lineTo(
        Math.round(a.x - na.x * (wa - inset)),
        Math.round(a.y - na.y * (wa - inset)),
      );
      c.closePath();
      c.fill();
    };
    quad(0, '#241b12');
    quad(Math.min(1, wb * 0.3), '#9b540f');
    quad(Math.min(2, wb * 0.55), i % 8 < 4 ? '#e8a308' : '#f9ca14');
    const saddle = i % 8;
    if (saddle < 3) {
      c.fillStyle = '#6c340e';
      c.fillRect(Math.round(a.x - 1), Math.round(a.y - 1), 3, 3);
    } else if (saddle > 4) {
      c.fillStyle = '#ffed83';
      c.fillRect(
        Math.round(a.x + na.x * 2 - 1),
        Math.round(a.y + na.y * 2 - 1),
        2,
        2,
      );
    }
  }
  // Reference head is front-facing; rotate its anatomy toward the direction of travel.
  const noseAngle = Math.atan2(
    points[0].y - points[2].y,
    points[0].x - points[2].x,
  );
  c.save();
  c.translate(96, 96);
  c.rotate(noseAngle - Math.PI / 2);
  const r = (x, y, w, h, color) => {
    c.fillStyle = color;
    c.fillRect(x, y, w, h);
  };
  if (headImage) {
    // Atlas-style head frame from the accepted reference; only the body pose changes.
    c.save();
    c.beginPath();
    for (const [i, [x, y]] of [
      [-6, -10],
      [5, -10],
      [9, -4],
      [8, 4],
      [5, 9],
      [-5, 9],
      [-9, 4],
      [-9, -4],
    ].entries()) {
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.closePath();
    c.clip();
    c.imageSmoothingEnabled = false;
    c.drawImage(headImage, 435, 330, 350, 360, -9, -10, 18, 20);
    c.restore();
  } else {
    r(-5, -7, 10, 3, '#21190e');
    r(-7, -4, 14, 9, '#21190e');
    r(-5, 5, 10, 5, '#21190e');
    r(-4, -6, 8, 4, '#bc7d13');
    r(-6, -3, 12, 8, '#d99808');
    r(-4, 4, 8, 4, '#ffd32a');
    r(-3, -5, 6, 3, '#f1bb0b');
    r(-1, -1, 3, 4, '#fbe170');
    r(-6, 0, 3, 4, '#25352b');
    r(3, 0, 3, 4, '#25352b');
    r(-5, 1, 1, 2, '#b9d4bf');
    r(4, 1, 1, 2, '#b9d4bf');
    r(-2, 5, 4, 2, '#fff092');
    r(-3, 5, 1, 1, '#31220e');
    r(2, 5, 1, 1, '#31220e');
  }
  if (time % 3100 < 240) {
    r(0, 9, 1, 5, '#ae2727');
    r(-1, 13, 1, 2, '#ae2727');
    r(1, 13, 1, 2, '#ae2727');
  }
  c.restore();
  return origin;
}
