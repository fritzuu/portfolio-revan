import { OBSTACLES, WORLD_SIZE } from './art.js';
const CELL = 20;
export function isBlocked(x, y) {
  return (
    x < 24 ||
    y < 24 ||
    x > WORLD_SIZE.width - 24 ||
    y > WORLD_SIZE.height - 24 ||
    OBSTACLES.some(
      (o) =>
        x > o.x - 10 && x < o.x + o.w + 10 && y > o.y - 4 && y < o.y + o.h + 6,
    )
  );
}
export function clearSegment(a, b) {
  const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 5);
  for (let i = 0; i <= n; i++) {
    const t = n ? i / n : 0;
    if (isBlocked(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)) return false;
  }
  return true;
}
const key = (x, y) => `${x},${y}`;
function nearest(point, reachableFrom) {
  const options = [];
  const cx = Math.round(point.x / CELL),
    cy = Math.round(point.y / CELL);
  for (let radius = 0; radius < 24; radius++) {
    for (let dx = -radius; dx <= radius; dx++)
      for (let dy = -radius; dy <= radius; dy++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
        const x = (cx + dx) * CELL,
          y = (cy + dy) * CELL;
        if (
          !isBlocked(x, y) &&
          (!reachableFrom || clearSegment(reachableFrom, { x, y }))
        )
          options.push({ x, y });
      }
    if (options.length)
      return options.sort(
        (a, b) =>
          Math.hypot(a.x - point.x, a.y - point.y) -
          Math.hypot(b.x - point.x, b.y - point.y),
      )[0];
  }
  return null;
}
// A* on the same geometry used for manual movement; smooth only across clear segments.
export function findPath(start, target) {
  const goal = isBlocked(target.x, target.y) ? nearest(target) : target;
  if (!goal) return [];
  if (clearSegment(start, goal)) return [goal];
  const from = nearest(start, start),
    to = nearest(goal);
  if (!from || !to) return [];
  const open = [{ ...from, g: 0, f: 0 }],
    cost = new Map([[key(from.x, from.y), 0]]),
    parents = new Map();
  let end = null;
  while (open.length) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift();
    if (current.x === to.x && current.y === to.y) {
      end = current;
      break;
    }
    if (current.g > cost.get(key(current.x, current.y))) continue;
    for (const [dx, dy] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ]) {
      const next = { x: current.x + dx * CELL, y: current.y + dy * CELL };
      if (!clearSegment(current, next)) continue;
      const g = current.g + Math.hypot(dx, dy) * CELL,
        k = key(next.x, next.y);
      if (g >= (cost.get(k) ?? Infinity)) continue;
      cost.set(k, g);
      parents.set(k, current);
      open.push({
        ...next,
        g,
        f: g + Math.hypot(next.x - to.x, next.y - to.y),
      });
    }
  }
  if (!end) return [];
  const raw = [end];
  while (parents.has(key(raw[0].x, raw[0].y)))
    raw.unshift(parents.get(key(raw[0].x, raw[0].y)));
  if (clearSegment(raw.at(-1), goal)) raw.push(goal);
  const path = [];
  let anchor = start,
    index = 0;
  while (index < raw.length) {
    let far = index;
    while (far + 1 < raw.length && clearSegment(anchor, raw[far + 1])) far++;
    path.push({ x: raw[far].x, y: raw[far].y });
    anchor = raw[far];
    index = far + 1;
  }
  return path;
}
