import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createBuildingEntry,
  advanceBuildingEntry,
} from '../src/game/buildingEntry.js';
const building = { id: 'projects', doorX: 800, doorY: 410 };
test('entry approaches the door, opens it before walking through, then fades the visitor before completing', () => {
  const e = createBuildingEntry(building, { x: 785, y: 455 });
  let f;
  for (let i = 0; i < 18; i++) f = advanceBuildingEntry(e, 1 / 60);
  assert.equal(f.x, 800);
  assert.equal(f.y, 422);
  assert.ok(f.open < 0.01);
  assert.equal(f.alpha, 1);
  for (let i = 0; i < 17; i++) f = advanceBuildingEntry(e, 1 / 60);
  assert.equal(f.open, 1);
  assert.ok(f.y > 420);
  assert.equal(f.done, false);
  for (let i = 0; i < 35; i++) f = advanceBuildingEntry(e, 1 / 60);
  assert.equal(f.y, 384);
  assert.equal(f.alpha, 0);
  assert.equal(f.done, true);
  assert.equal(e.panel, 'projects');
});
test('hidden tab freezes entry; long frames cannot teleport straight to completion', () => {
  const e = createBuildingEntry(building, { x: 800, y: 455 });
  advanceBuildingEntry(e, 20, true);
  assert.equal(e.elapsed, 0);
  const f = advanceBuildingEntry(e, 20);
  assert.equal(e.elapsed, 0.1);
  assert.equal(f.done, false);
  advanceBuildingEntry(e, -1);
  assert.equal(e.elapsed, 0.1);
});
test('reduced motion skips movement and fading but still completes entry into the selected room', () => {
  const e = createBuildingEntry(building, { x: 785, y: 455 }, true, 'projects');
  const f = advanceBuildingEntry(e, 0.1);
  assert.equal(f.moving, false);
  assert.equal(f.alpha, 1);
  assert.equal(f.open, 1);
  assert.equal(advanceBuildingEntry(e, 0.1).done, true);
});
