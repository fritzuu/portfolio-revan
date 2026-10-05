import test from 'node:test';
import assert from 'node:assert/strict';
import { LOCATIONS, PROPS, propBounds } from '../src/game/art.js';
import { clearSegment, findPath, isBlocked } from '../src/game/navigation.js';
test('every solid prop blocks its physical footprint', () => {
  for (const p of PROPS) {
    const b = propBounds(p);
    assert.ok(isBlocked(b.x + b.w / 2, b.y + b.h / 2), p.type);
  }
});
test('all building-to-building trips are reachable without crossing scenery', () => {
  const entries = [
    { x: 770, y: 520 },
    ...LOCATIONS.map((l) => ({ x: l.doorX, y: l.doorY + 45 })),
  ];
  for (const start of entries)
    for (const target of entries) {
      const path = findPath(start, target);
      assert.ok(path.length, JSON.stringify({ start, target }));
      let previous = start;
      for (const point of path) {
        assert.ok(
          clearSegment(previous, point),
          JSON.stringify({ previous, point }),
        );
        previous = point;
      }
      assert.ok(Math.hypot(previous.x - target.x, previous.y - target.y) < 1);
    }
});
test('clicking a solid tree resolves to reachable ground', () => {
  const path = findPath({ x: 770, y: 520 }, { x: 542, y: 550 });
  assert.ok(path.length);
  assert.ok(!isBlocked(path.at(-1).x, path.at(-1).y));
});
