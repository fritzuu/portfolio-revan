import test from 'node:test';
import assert from 'node:assert/strict';
import { GROVE_PATH } from '../src/game/groveArt.js';
import { clearSegment, isBlocked } from '../src/game/navigation.js';
test('the painted Dream Grove trail stays directly walkable past all scenery', () => {
  for (let i = 1; i < GROVE_PATH.length; i++) {
    const [ax, ay] = GROVE_PATH[i - 1],
      [bx, by] = GROVE_PATH[i];
    assert.ok(
      clearSegment({ x: ax, y: ay }, { x: bx, y: by }),
      `trail segment ${i}`,
    );
  }
});
test('the moon court and its rune ring remain walkable ground', () => {
  assert.equal(isBlocked(2050, 869), false);
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8;
    assert.equal(
      isBlocked(2050 + Math.cos(a) * 88, 869 + Math.sin(a) * 66),
      false,
      `rune ${i}`,
    );
  }
});
