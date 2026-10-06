import { findPath, isBlocked } from './navigation.js';

export const SNAKE_JOINTS = 29;
export const SNAKE_SPACING = 2.5;
const ROUTE = [
  { x: 1870, y: 330 },
  { x: 2110, y: 310 },
  { x: 2290, y: 360 },
  { x: 2250, y: 470 },
  { x: 2090, y: 500 },
  { x: 1890, y: 475 },
  { x: 1805, y: 400 },
  { x: 1920, y: 445 },
];
const wrap = (angle) => Math.atan2(Math.sin(angle), Math.cos(angle));
export function createSnake() {
  const head = { x: 1810, y: 395 },
    angle = -Math.PI / 4;
  const history = Array.from({ length: 100 }, (_, i) => ({
    x: head.x - Math.cos(angle) * i * 2,
    y: head.y - Math.sin(angle) * i * 2,
  }));
  return {
    head,
    angle,
    history,
    path: [],
    stop: 0,
    phase: 0,
    rest: 0,
    travel: 0,
    joints: [],
    motion: 1,
  };
}
function sampleHistory(history, distance) {
  let remaining = distance;
  for (let i = 1; i < history.length; i++) {
    const front = history[i - 1],
      back = history[i],
      length = Math.hypot(front.x - back.x, front.y - back.y);
    if (length >= remaining) {
      const t = remaining / length;
      return {
        x: front.x + (back.x - front.x) * t,
        y: front.y + (back.y - front.y) * t,
        angle: Math.atan2(front.y - back.y, front.x - back.x),
      };
    }
    remaining -= length;
  }
  const tail = history.at(-1);
  return { ...tail, angle: 0 };
}
export function updateSnake(s, delta, reduced = false) {
  const dt = Math.min(delta, 50) / 1000;
  if (!reduced) {
    s.phase += dt * 3.2;
    if (s.rest > 0) s.rest = Math.max(0, s.rest - dt);
    else {
      if (!s.path.length) {
        s.path = findPath(s.head, ROUTE[s.stop % ROUTE.length]);
        s.stop++;
      }
      let target = s.path[0];
      while (
        target &&
        Math.hypot(target.x - s.head.x, target.y - s.head.y) < 8
      ) {
        s.path.shift();
        target = s.path[0];
      }
      if (target) {
        const desired = Math.atan2(target.y - s.head.y, target.x - s.head.x);
        const turn = wrap(desired - s.angle);
        s.angle += Math.max(-dt * 1.8, Math.min(dt * 1.8, turn));
        const next = {
          x: s.head.x + Math.cos(s.angle) * 26 * dt,
          y: s.head.y + Math.sin(s.angle) * 26 * dt,
        };
        if (!isBlocked(next.x, next.y)) {
          s.travel += Math.hypot(next.x - s.head.x, next.y - s.head.y);
          s.head = next;
        } else {
          s.path = [];
          s.angle = desired;
        }
      } else {
        s.path = [];
        if (s.stop % 3 === 0) s.rest = 1.4;
      }
    }
  }
  s.motion += ((s.rest > 0 ? 0 : 1) - s.motion) * Math.min(1, dt * 4);
  // Arc-length history keeps the tail following actual turns, independent of frame rate.
  if (Math.hypot(s.head.x - s.history[0].x, s.head.y - s.history[0].y) >= 0.8)
    s.history.unshift({ ...s.head });
  s.history = s.history.slice(0, 170);
  const joints = [{ ...s.head }];
  for (let i = 1; i < SNAKE_JOINTS; i++) {
    const anchor = sampleHistory(s.history, i * SNAKE_SPACING),
      progress = i / (SNAKE_JOINTS - 1);
    const wave = reduced
      ? 0
      : Math.sin(s.phase - i * 0.48) *
        5 *
        Math.sin(progress * Math.PI) *
        s.motion;
    const desired = {
      x: anchor.x - Math.sin(anchor.angle) * wave,
      y: anchor.y + Math.cos(anchor.angle) * wave,
    };
    const previous = joints[i - 1],
      dx = desired.x - previous.x,
      dy = desired.y - previous.y,
      d = Math.hypot(dx, dy) || 1;
    joints.push({
      x: previous.x + (dx / d) * SNAKE_SPACING,
      y: previous.y + (dy / d) * SNAKE_SPACING,
    });
  }
  s.joints = joints;
  return s;
}
