// Kenney Tiny Town CC0. Tile coordinates stay in one atlas, loaded once per scene.
export function tile(c, image, index, x, y, scale = 2) {
  if (!image) return;
  c.imageSmoothingEnabled = false;
  c.drawImage(
    image,
    (index % 12) * 16,
    Math.floor(index / 12) * 16,
    16,
    16,
    Math.round(x),
    Math.round(y),
    16 * scale,
    16 * scale,
  );
}
export function drawTownProp(c, p, image) {
  const { x, y, s = 2 } = p;
  if (p.type === 'assetTree') {
    if (p.variant === 'autumn') {
      tile(c, image, 3, x - 8 * s, y - 28 * s, s);
      tile(c, image, 15, x - 8 * s, y - 12 * s, s);
    } else {
      // Round canopy is a complete atlas tile; don't combine unrelated plant tiles.
      c.fillStyle = '#574132';
      c.fillRect(Math.round(x - 2 * s), Math.round(y - 14 * s), 4 * s, 18 * s);
      c.fillStyle = '#a0794c';
      c.fillRect(Math.round(x), Math.round(y - 13 * s), s, 16 * s);
      tile(c, image, 5, x - 16 * s, y - 40 * s, s * 2);
    }
  } else if (p.type === 'assetPine') {
    tile(c, image, p.variant === 'autumn' ? 3 : 4, x - 8 * s, y - 28 * s, s);
    tile(c, image, p.variant === 'autumn' ? 15 : 16, x - 8 * s, y - 12 * s, s);
  } else tile(c, image, p.tile ?? 29, x - 8 * s, y - 12 * s, s);
}
export const DISTRICT_PROPS = [
  // Grove canopy surrounds a generously cleared moon court; no props cross entry points.
  ...[
    [1740, 785],
    [1830, 785],
    [1920, 785],
    [2180, 785],
    [2285, 785],
    [2400, 810],
    [1750, 885],
    [1770, 1015],
    [1840, 1080],
    [1960, 1070],
    [2120, 1080],
    [2250, 1080],
    [2390, 1060],
    [2420, 920],
  ].map(([x, y], i) => ({
    type: 'assetTree',
    x,
    y,
    s: i % 3 === 0 ? 2.4 : 2,
    variant: 'green',
  })),
  ...[
    [1850, 875],
    [1875, 990],
    [2235, 880],
    [2250, 980],
    [2340, 860],
  ].map(([x, y]) => ({ type: 'assetPine', x, y, s: 2 })),
  ...[
    [1800, 835],
    [1840, 940],
    [1900, 1025],
    [1970, 970],
    [2150, 950],
    [2185, 1040],
    [2335, 1030],
    [2350, 920],
    [2160, 815],
  ].map(([x, y], i) => ({
    type: 'assetDecor',
    tile: i % 2 ? 29 : 28,
    x,
    y,
    s: 1.5,
    solid: false,
  })),
];
