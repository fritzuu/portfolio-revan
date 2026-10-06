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
test('football possession changes only after control; passes follow fixed endpoints and ball stays continuous', () => {
  const match = createMatch(),
    phases = new Set();
  let previous = { ...match.ball },
    goals = 0;
  for (let i = 0; i < 60 * 80; i++) {
    const phase = match.phase,
      owner = match.owner,
      target = match.target && { ...match.target };
    updateMatch(match, 1 / 60);
    phases.add(match.phase);
    assert.ok(
      Math.hypot(match.ball.x - previous.x, match.ball.y - previous.y) < 12,
      `ball jumped during ${phase}`,
    );
    if (match.owner !== owner)
      assert.ok(
        phase === 'control' || phase === 'reset',
        `unexpected owner transfer: ${phase}`,
      );
    if (phase === 'pass' && match.phase === 'pass')
      assert.deepEqual(match.target, target);
    if (!match.goal && phase === 'celebrate') goals++;
    for (const p of match.players)
      assert.ok(p.x >= 155 && p.x <= 1320 && p.y >= 1175 && p.y <= 1490);
    previous = { ...match.ball };
  }
  assert.ok(goals >= 2);
  for (const phase of [
    'kick',
    'pass',
    'control',
    'shoot',
    'celebrate',
    'retrieve',
    'returnKick',
    'reset',
  ])
    assert.ok(phases.has(phase), phase);
});
