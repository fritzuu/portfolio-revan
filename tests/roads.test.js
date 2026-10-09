import test from 'node:test';
import assert from 'node:assert/strict';
import { ROADS, drawRoads } from '../src/game/roads.js';
const overlaps = ([x, y, w, h], [a, b, c, d]) =>
  x <= a + c && x + w >= a && y <= b + d && y + h >= b;

test('every road joins the town loop, none cross the football pitch or continue into the garden dead end', () => {
  const found = new Set([0]),
    queue = [0];
  while (queue.length) {
    const next = queue.shift();
    ROADS.forEach((road, i) => {
      if (!found.has(i) && overlaps(road, ROADS[next])) {
        found.add(i);
        queue.push(i);
      }
    });
  }
  assert.equal(found.size, ROADS.length);
  for (const road of ROADS)
    assert.equal(overlaps(road, [120, 1150, 1200, 370]), false);
  assert.equal(
    ROADS.some(
      ([x, y, w, h]) => 2300 >= x && 2300 <= x + w && 478 >= y && 478 <= y + h,
    ),
    false,
  );
});

test('road junction interiors cover crossing border seams in both directions', () => {
  const operations = [];
  const context = {
    fillStyle: '',
    fillRect(x, y, w, h) {
      operations.push({ x, y, w, h, color: this.fillStyle });
    },
  };
  drawRoads(context);
  function colorAt(x, y) {
    return operations
      .filter(
        (op) => x >= op.x && x < op.x + op.w && y >= op.y && y < op.y + op.h,
      )
      .at(-1)?.color;
  }
  for (const point of [
    [545, 511],
    [545, 519],
    [1050, 998],
    [1551, 477],
    [1638, 1190],
    [80, 1532],
  ])
    assert.equal(colorAt(...point), '#ffe0af');
  assert.equal(colorAt(54, 600), undefined);
});
