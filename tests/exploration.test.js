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

import { createMatch, updateMatch } from '../src/game/football.js';
test('two teams contest both goals with continuous ball motion, saves and turnovers', () => {
  const match = createMatch(8);
  let previous = { ...match.ball };
  const phases = new Set();
  for (let i = 0; i < 60 * 600; i++) {
    updateMatch(match, 1 / 60);
    phases.add(match.phase);
    assert.ok(
      Math.hypot(match.ball.x - previous.x, match.ball.y - previous.y) < 9,
      `ball jumped in ${match.phase}`,
    );
    for (const p of match.players)
      assert.ok(p.x >= 138 && p.x <= 1300 && p.y >= 1190 && p.y <= 1475);
    previous = { ...match.ball };
  }
  assert.equal(match.players.length, 8);
  assert.ok(match.score.every((n) => n > 0));
  for (const stat of ['passes', 'shots', 'saves', 'tackles', 'posts'])
    assert.ok(match.stats[stat] > 0, stat);
  assert.ok(match.stats.shots > match.score.reduce((a, b) => a + b, 0));
  for (const phase of ['kick', 'pass', 'shoot', 'celebrate', 'retrieve'])
    assert.ok(phases.has(phase), phase);
});
test('match simulation is independent of render rate and preserves quick user actions', () => {
  const a = createMatch(21),
    b = createMatch(21);
  for (let i = 0; i < 30 * 60; i++) updateMatch(a, 1 / 30);
  for (let i = 0; i < 120 * 60; i++) updateMatch(b, 1 / 120);
  assert.deepEqual(a.score, b.score);
  assert.deepEqual(a.stats, b.stats);
  assert.ok(Math.hypot(a.ball.x - b.ball.x, a.ball.y - b.ball.y) < 0.001);
  const controlled = createMatch();
  controlled.controlled = controlled.owner;
  updateMatch(controlled, 0.001, { action: 'shoot' });
  updateMatch(controlled, 1 / 60);
  assert.equal(controlled.phase, 'kick');
  for (let i = 0; i < 20; i++) updateMatch(controlled, 1 / 60);
  assert.equal(controlled.stats.shots, 1);
  assert.equal(controlled.owner, null);
});
