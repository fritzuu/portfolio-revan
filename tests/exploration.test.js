import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanDiscoveries,
  gateUnlocked,
  shotScores,
} from '../src/game/exploration.js';

test('the garden gate requires two distinct real discoveries, including after a save reload', () => {
  const restored = JSON.parse(JSON.stringify(['jekek', 'jekek', 'unknown']));
  assert.deepEqual(cleanDiscoveries(restored), ['jekek']);
  assert.equal(gateUnlocked(restored), false);
  assert.equal(gateUnlocked([...restored, 'story']), true);
  assert.deepEqual(cleanDiscoveries({ jekek: true }), []);
});
test('the football goal accepts only a valid shot inside the golden timing zone', () => {
  for (const aim of [40, 50, 60]) assert.equal(shotScores(aim), true);
  for (const aim of [39.9, 60.1, -1, 101, NaN, Infinity, '50', null])
    assert.equal(shotScores(aim), false);
});
