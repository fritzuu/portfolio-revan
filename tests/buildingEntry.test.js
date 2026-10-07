import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createBuildingEntry,
  advanceBuildingEntry,
  createBuildingExit,
  advanceBuildingExit,
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

test('exit reveals the visitor, walks outside before closing the door, and finishes at the original approach point', () => {
  const e = createBuildingExit(building);
  let f = advanceBuildingExit(e, 0);
  assert.equal(f.alpha, 0);
  assert.equal(f.open, 1);
  assert.equal(f.y, building.doorY - 26);
  for (let i = 0; i < 12; i++) f = advanceBuildingExit(e, 1 / 60);
  assert.equal(f.alpha, 1);
  assert.equal(f.open, 1);
  assert.equal(f.moving, true);
  for (let i = 0; i < 23; i++) f = advanceBuildingExit(e, 1 / 60);
  assert.equal(f.y, building.doorY + 45);
  assert.equal(f.moving, false);
  assert.ok(f.open < 1 && f.open > 0);
  for (let i = 0; i < 17; i++) f = advanceBuildingExit(e, 1 / 60);
  assert.equal(f.done, true);
  assert.equal(f.open, 0);
  assert.equal(f.alpha, 1);
});
test('exit freezes in hidden tabs and reduced motion returns outside without fading or walking', () => {
  const e = createBuildingExit(building);
  advanceBuildingExit(e, 10, true);
  assert.equal(e.elapsed, 0);
  const r = createBuildingExit(building, true);
  let f = advanceBuildingExit(r, 0.1);
  assert.equal(f.y, building.doorY + 45);
  assert.equal(f.moving, false);
  assert.equal(f.open, 0);
  assert.equal(f.alpha, 1);
  f = advanceBuildingExit(r, 0.1);
  assert.equal(f.done, true);
});
