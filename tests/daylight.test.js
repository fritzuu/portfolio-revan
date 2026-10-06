import test from 'node:test';
import assert from 'node:assert/strict';
import { nightAmount, DAY_CYCLE_MS } from '../src/game/daylight.js';
test('world returns to morning every two minutes with gradual dusk and dawn', () => {
  assert.equal(DAY_CYCLE_MS, 120000);
  assert.equal(nightAmount(0), 0);
  assert.equal(nightAmount(60000), 1);
  assert.equal(nightAmount(120000), 0);
  assert.ok(Math.abs(nightAmount(30000) - 0.5) < 1e-10);
  assert.ok(Math.abs(nightAmount(90000) - 0.5) < 1e-10);
  assert.ok(nightAmount(10000) < nightAmount(20000));
  assert.ok(nightAmount(100000) < nightAmount(90000));
});
