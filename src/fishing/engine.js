import { FISH, RARITIES, RODS, getFish } from './catalog.js';
export const SAVE_KEY = 'revan-fishing-v1';
export const initialFishing = () => ({
  version: 1,
  coins: 0,
  items: [],
  discovered: {},
  owned: ['twig'],
  equipped: 'twig',
  casts: 0,
  claimed: [],
});
const integer = (v, max = 1e9) => Number.isSafeInteger(v) && v >= 0 && v <= max;
export function parseFishing(raw) {
  try {
    const s = JSON.parse(raw);
    if (
      !s ||
      s.version !== 1 ||
      !integer(s.coins) ||
      !integer(s.casts) ||
      !Array.isArray(s.items) ||
      s.items.length > 3000 ||
      !Array.isArray(s.owned) ||
      !s.owned.includes('twig') ||
      s.owned.some((id) => !RODS.some((r) => r.id === id)) ||
      !s.owned.includes(s.equipped) ||
      !s.discovered ||
      typeof s.discovered !== 'object' ||
      Array.isArray(s.discovered) ||
      !Array.isArray(s.claimed) ||
      s.claimed.some((id) => typeof id !== 'string')
    )
      return initialFishing();
    const ids = new Set();
    for (const item of s.items) {
      if (
        !item ||
        typeof item.id !== 'string' ||
        ids.has(item.id) ||
        !getFish(item.fishId) ||
        !Number.isFinite(item.size) ||
        item.size < 1 ||
        item.size > 1000 ||
        !integer(item.value, 200) ||
        typeof item.locked !== 'boolean'
      )
        return initialFishing();
      ids.add(item.id);
    }
    for (const [id, entry] of Object.entries(s.discovered)) {
      if (
        !getFish(id) ||
        !entry ||
        !integer(entry.count) ||
        entry.count < 1 ||
        !Number.isFinite(entry.bestSize) ||
        entry.bestSize < 1 ||
        entry.bestSize > 1000
      )
        return initialFishing();
    }
    return { ...s, claimed: s.claimed.slice(-128) };
  } catch {
    return initialFishing();
  }
}
export const unlockedRift = (s) => Object.keys(s.discovered).length >= 12;
export function fishWeights(state, spot = 'pond') {
  const luck = RODS.find((r) => r.id === state.equipped)?.luck || 0;
  const count = FISH.reduce(
    (v, f) => ({ ...v, [f.rarity]: (v[f.rarity] || 0) + 1 }),
    {},
  );
  return FISH.map((f) => ({
    fish: f,
    weight:
      f.rarity === 'mythic' && (spot !== 'rift' || !unlockedRift(state))
        ? 0
        : (RARITIES[f.rarity].weight / count[f.rarity]) *
          (['rare', 'epic', 'legendary', 'mythic'].includes(f.rarity)
            ? 1 + luck
            : 1),
  }));
}
export function chooseFish(state, spot = 'pond', rng = Math.random) {
  if (spot === 'rift' && !unlockedRift(state)) return null;
  const weights = fishWeights(state, spot);
  let roll = rng() * weights.reduce((s, v) => s + v.weight, 0);
  for (const entry of weights) {
    roll -= entry.weight;
    if (roll < 0) return entry.fish;
  }
  return weights.findLast((v) => v.weight > 0)?.fish;
}
export function createCatch(fish, sessionId, rng = Math.random) {
  const scale = rng(),
    size = Math.round((12 + scale * 70 + fish.index * 3) * 10) / 10,
    [min, max] = RARITIES[fish.rarity].price;
  return {
    id: sessionId,
    fishId: fish.id,
    size,
    value: Math.round(min + scale * (max - min)),
    locked: false,
  };
}
export function fishingReducer(s, action) {
  if (action.type === 'cast') return { ...s, casts: s.casts + 1 };
  if (action.type === 'catch') {
    const item = action.item;
    if (
      s.claimed.includes(item.id) ||
      !getFish(item.fishId) ||
      s.items.length >= 3000
    )
      return s;
    const previous = s.discovered[item.fishId];
    return {
      ...s,
      items: [item, ...s.items],
      claimed: [...s.claimed, item.id].slice(-128),
      discovered: {
        ...s.discovered,
        [item.fishId]: {
          count: (previous?.count || 0) + 1,
          bestSize: Math.max(previous?.bestSize || 0, item.size),
        },
      },
    };
  }
  if (action.type === 'lock')
    return {
      ...s,
      items: s.items.map((i) =>
        i.id === action.id ? { ...i, locked: !i.locked } : i,
      ),
    };
  if (action.type === 'sell') {
    const ids = new Set(action.ids),
      selling = s.items.filter((i) => ids.has(i.id) && !i.locked);
    const sold = new Set(selling.map((i) => i.id));
    return {
      ...s,
      coins: s.coins + selling.reduce((v, i) => v + i.value, 0),
      items: s.items.filter((i) => !sold.has(i.id)),
    };
  }
  if (action.type === 'buy') {
    const rod = RODS.find((r) => r.id === action.id);
    if (!rod || s.owned.includes(rod.id) || s.coins < rod.price) return s;
    return {
      ...s,
      coins: s.coins - rod.price,
      owned: [...s.owned, rod.id],
      equipped: rod.id,
    };
  }
  if (action.type === 'equip')
    return s.owned.includes(action.id) ? { ...s, equipped: action.id } : s;
  if (action.type === 'reset') return initialFishing();
  return s;
}
// One-button tracking game. Hold to raise the net; release to lower it.
export function stepReeling(game, delta, held, reduced = false) {
  const dt = Math.min(delta, 0.05),
    rarity = RARITIES[game.fish.rarity];
  game.elapsed += dt;
  game.bar = Math.max(4, Math.min(96, game.bar + (held ? 38 : -29) * dt));
  const speed = rarity.speed * (reduced ? 0.7 : 1);
  game.fishX =
    50 +
    Math.sin(game.elapsed * speed + game.seed) * 27 +
    Math.sin(game.elapsed * speed * 2.3) * 9;
  game.window = rarity.window + (reduced ? 5 : 0);
  game.inside = Math.abs(game.fishX - game.bar) < game.window / 2;
  game.progress = Math.max(
    0,
    Math.min(100, game.progress + (game.inside ? 22 : -8) * dt),
  );
  if (game.progress >= 100) game.phase = 'caught';
  else if (game.progress <= 0 || game.elapsed > 25) game.phase = 'escaped';
  return game;
}
