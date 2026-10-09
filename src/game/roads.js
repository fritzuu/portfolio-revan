// Connected town loop, with the south route outside the football pitch.
export const ROADS = [
  [55, 435, 1625, 85],
  [505, 510, 80, 535],
  [1015, 510, 80, 490],
  [55, 995, 1585, 55],
  [1550, 171, 90, 1404],
  [55, 1045, 50, 530],
  [55, 1530, 2500, 45],
  [1590, 1170, 950, 55],
];
export function drawRoads(context) {
  context.fillStyle = '#bb987a';
  for (const [x, y, w, h] of ROADS)
    context.fillRect(x - 3, y - 3, w + 6, h + 6);
  context.fillStyle = '#ffe0af';
  for (const [x, y, w, h] of ROADS) context.fillRect(x, y, w, h);
}
