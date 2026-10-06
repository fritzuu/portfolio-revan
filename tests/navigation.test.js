import test from 'node:test';
import assert from 'node:assert/strict';
import { DESTINATIONS, PROPS, propBounds } from '../src/game/art.js';
import { clearSegment, findPath, isBlocked } from '../src/game/navigation.js';
test('every solid prop blocks its physical footprint', () => {
  for (const p of PROPS) {
    const b = propBounds(p);
    if (!b) continue;
    assert.ok(isBlocked(b.x + b.w / 2, b.y + b.h / 2), p.type);
  }
});
test('all building-to-building trips are reachable without crossing scenery', () => {
  const entries = [
    { x: 800, y: 515 },
    ...DESTINATIONS.map((l) => ({ x: l.doorX, y: l.doorY + 45 })),
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
  const path = findPath({ x: 800, y: 515 }, { x: 632, y: 590 });
  assert.ok(path.length);
  assert.ok(!isBlocked(path.at(-1).x, path.at(-1).y));
});

import { NPC_ROUTES } from '../src/game/layout.js';
test('residents can travel every leg of their district circuits', () => {
  for (const route of NPC_ROUTES)
    for (let i = 0; i < route.length; i++) {
      const start = route[i],
        target = route[(i + 1) % route.length];
      assert.ok(!isBlocked(start.x, start.y), JSON.stringify(start));
      const path = findPath(start, target);
      assert.ok(path.length);
      assert.ok(
        Math.hypot(path.at(-1).x - target.x, path.at(-1).y - target.y) < 1,
      );
    }
});

test('flower beds are decorative ground rather than invisible obstacles', () => {
  for (const p of PROPS.filter(
    (p) => p.type === 'flowers' || p.solid === false,
  ))
    assert.equal(propBounds(p), null);
});
