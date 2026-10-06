import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSnake,
  updateSnake,
  SNAKE_JOINTS,
  SNAKE_SPACING,
} from '../src/game/snake.js';
import { isBlocked } from '../src/game/navigation.js';

test('Jekek slithers across the garden with constant body length and no scenery crossings or position jumps', () => {
  const s = createSnake();
  let previous = { ...s.head };
  for (let frame = 0; frame < 7200; frame++) {
    updateSnake(s, 1000 / 60);
    assert.equal(s.joints.length, SNAKE_JOINTS);
    assert.ok(Math.hypot(s.head.x - previous.x, s.head.y - previous.y) < 0.44);
    for (let i = 1; i < s.joints.length; i++) {
      const a = s.joints[i - 1],
        b = s.joints[i];
      assert.ok(
        Math.abs(Math.hypot(a.x - b.x, a.y - b.y) - SNAKE_SPACING) < 1e-9,
      );
      assert.ok(!isBlocked(b.x, b.y), 'body crosses scenery');
    }
    previous = { ...s.head };
  }
  assert.ok(s.travel > 2000);
  assert.ok(s.stop > 8);
});
test('the silhouette bends internally rather than moving as a rigid sprite; reduced motion rests the snake', () => {
  const s = createSnake();
  for (let i = 0; i < 60; i++) updateSnake(s, 1000 / 60);
  const angles = () =>
    s.joints
      .slice(1)
      .map(
        (p, i) =>
          Math.atan2(p.y - s.joints[i].y, p.x - s.joints[i].x) - s.angle,
      );
  const before = angles();
  for (let i = 0; i < 20; i++) updateSnake(s, 1000 / 60);
  assert.ok(angles().some((a, i) => Math.abs(a - before[i]) > 0.2));
  const rest = createSnake();
  updateSnake(rest, 16, true);
  const head = { ...rest.head },
    joints = structuredClone(rest.joints);
  for (let i = 0; i < 100; i++) updateSnake(rest, 16, true);
  assert.deepEqual(rest.head, head);
  assert.deepEqual(rest.joints, joints);
});
