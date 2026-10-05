import test from 'node:test';
import assert from 'node:assert/strict';
import { FISH, RODS, RARITIES } from '../src/fishing/catalog.js';
import {
  initialFishing,
  parseFishing,
  fishWeights,
  chooseFish,
  createCatch,
  fishingReducer,
  stepReeling,
} from '../src/fishing/engine.js';
const caught = (s, id = 'one', fish = FISH[0], random = 0.5) =>
  fishingReducer(s, {
    type: 'catch',
    item: createCatch(fish, id, () => random),
  });
test('20 distinct creatures, all price bands and the three approved rods', () => {
  assert.equal(FISH.length, 20);
  assert.equal(new Set(FISH.map((f) => f.id)).size, 20);
  assert.equal(
    Object.values(RARITIES).reduce((n, r) => n + r.weight, 0),
    100,
  );
  assert.deepEqual(
    RODS.map((r) => [r.price, r.luck]),
    [
      [0, 0],
      [40, 0.15],
      [150, 0.4],
    ],
  );
  for (const f of FISH) {
    const low = createCatch(f, 'lo', () => 0),
      high = createCatch(f, 'hi', () => 1);
    assert.deepEqual([low.value, high.value], RARITIES[f.rarity].price);
  }
});
test('sales skip locked catches, keep journal records and cannot sell twice', () => {
  let s = caught(caught(initialFishing(), 'a'), 'b');
  s = fishingReducer(s, { type: 'lock', id: 'a' });
  s = fishingReducer(s, { type: 'sell', ids: ['a', 'b', 'invented'] });
  assert.equal(s.coins, 2);
  assert.equal(s.items.length, 1);
  assert.equal(s.items[0].id, 'a');
  assert.equal(s.discovered.lumoss.count, 2);
  const twice = fishingReducer(s, { type: 'sell', ids: ['a', 'b'] });
  assert.equal(twice.coins, 2);
});
test('purchase and equip are atomic and require owned rods and sufficient coins', () => {
  let s = initialFishing();
  assert.deepEqual(fishingReducer(s, { type: 'buy', id: 'moon' }), s);
  assert.equal(
    fishingReducer(s, { type: 'equip', id: 'astral' }).equipped,
    'twig',
  );
  s = { ...s, coins: 190 };
  s = fishingReducer(s, { type: 'buy', id: 'moon' });
  assert.equal(s.coins, 150);
  assert.equal(s.equipped, 'moon');
  assert.deepEqual(fishingReducer(s, { type: 'buy', id: 'moon' }), s);
  s = fishingReducer(s, { type: 'buy', id: 'astral' });
  assert.equal(s.coins, 0);
  assert.equal(s.equipped, 'astral');
  s = fishingReducer(s, { type: 'equip', id: 'twig' });
  assert.equal(s.equipped, 'twig');
  assert.equal(s.owned.length, 3);
});
test('Mythic requires the crossing and twelve discoveries; luck multiplies weights', () => {
  const s = initialFishing();
  assert.equal(
    chooseFish(s, 'rift', () => 0.99999),
    null,
  );
  const unlocked = {
    ...s,
    discovered: Object.fromEntries(
      FISH.slice(0, 12).map((f) => [f.id, { count: 1, bestSize: 20 }]),
    ),
  };
  assert.equal(fishWeights(unlocked, 'pond').at(-1).weight, 0);
  assert.equal(fishWeights(unlocked, 'rift').at(-1).weight, 0.01);
  assert.equal(chooseFish(unlocked, 'rift', () => 0.999999).id, 'unwritten');
  const base = fishWeights(unlocked, 'rift'),
    boost = fishWeights({ ...unlocked, equipped: 'astral' }, 'rift');
  assert.equal(boost[0].weight, base[0].weight);
  assert.equal(boost.at(-1).weight, base.at(-1).weight * 1.4);
  const chance = boost.at(-1).weight / boost.reduce((v, e) => v + e.weight, 0);
  assert.ok(chance > 0.0001 && chance < 0.00015);
});
test('round-trip browser save preserves economy, locks and discoveries; corrupt saves reset', () => {
  let s = caught(initialFishing(), 'unique');
  s = fishingReducer(s, { type: 'lock', id: 'unique' });
  assert.deepEqual(parseFishing(JSON.stringify(s)), s);
  for (const bad of [
    null,
    '{bad',
    JSON.stringify({ ...s, coins: -1 }),
    JSON.stringify({ ...s, equipped: 'invented' }),
    JSON.stringify({ ...s, items: [...s.items, ...s.items] }),
  ])
    assert.deepEqual(parseFishing(bad), initialFishing());
  assert.deepEqual(fishingReducer(s, { type: 'reset' }), initialFishing());
});
test('one catch cannot be claimed twice, even after the fish is sold', () => {
  let s = caught(initialFishing(), 'same');
  s = fishingReducer(s, { type: 'sell', ids: ['same'] });
  const again = caught(s, 'same');
  assert.deepEqual(again, s);
});
test('tracking rewards skilled play while an unattended line escapes', () => {
  const make = () => ({
    fish: FISH[0],
    phase: 'reeling',
    elapsed: 0,
    seed: 0,
    bar: 50,
    progress: 35,
  });
  let g = make();
  for (let i = 0; i < 700 && g.phase === 'reeling'; i++) {
    const desired =
      50 +
      Math.sin((g.elapsed + 0.03) * 0.75) * 27 +
      Math.sin((g.elapsed + 0.03) * 0.75 * 2.3) * 9;
    stepReeling(g, 0.03, g.bar < desired);
  }
  assert.equal(g.phase, 'caught');
  g = make();
  for (let i = 0; i < 1000 && g.phase === 'reeling'; i++)
    stepReeling(g, 0.03, false);
  assert.equal(g.phase, 'escaped');
});
