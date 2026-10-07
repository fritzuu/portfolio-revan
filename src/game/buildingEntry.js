const clamp = (n) => Math.max(0, Math.min(1, n));
export function createBuildingEntry(
  building,
  position,
  reduced = false,
  panel = building.id,
) {
  return {
    building,
    panel,
    start: { x: position.x, y: position.y },
    elapsed: 0,
    reduced,
    duration: reduced ? 0.18 : 1.15,
  };
}
export function advanceBuildingEntry(entry, delta, hidden = false) {
  if (!hidden)
    entry.elapsed = Math.min(
      entry.duration,
      entry.elapsed + Math.max(0, Math.min(delta, 0.1)),
    );
  const { building: b, start, elapsed: t } = entry;
  const approach = entry.reduced ? 1 : clamp(t / 0.3);
  const open = entry.reduced ? 1 : clamp((t - 0.3) / 0.28);
  const walk = entry.reduced ? 1 : clamp((t - 0.58) / 0.47);
  return {
    x: start.x + (b.doorX - start.x) * approach,
    y: start.y + (b.doorY + 12 - start.y) * approach - walk * 38,
    open,
    alpha: entry.reduced ? 1 : walk >= 1 ? 0 : 1 - clamp((walk - 0.55) / 0.45),
    moving:
      !entry.reduced &&
      ((approach > 0 && approach < 1) || (walk > 0 && walk < 1)),
    done: t >= entry.duration,
  };
}
export function createBuildingExit(building, reduced = false) {
  return {
    building,
    kind: 'exit',
    elapsed: 0,
    reduced,
    duration: reduced ? 0.15 : 0.85,
  };
}
export function advanceBuildingExit(exit, delta, hidden = false) {
  if (!hidden)
    exit.elapsed = Math.min(
      exit.duration,
      exit.elapsed + Math.max(0, Math.min(delta, 0.1)),
    );
  const t = exit.elapsed;
  const walk = exit.reduced ? 1 : clamp(t / 0.55);
  return {
    x: exit.building.doorX,
    y: exit.building.doorY - 26 + walk * 71,
    alpha: exit.reduced ? 1 : clamp(t / 0.18),
    open: exit.reduced ? 0 : 1 - clamp((t - 0.55) / 0.25),
    moving: !exit.reduced && walk > 0 && walk < 1,
    done: t >= exit.duration,
  };
}
export function drawEntrance(g, building, open) {
  const x = building.doorX,
    y = building.doorY;
  g.clear();
  g.fillStyle(0x354b50);
  g.fillRect(x - 17, y - 80, 34, 78);
  g.fillStyle(0xe9c999, open * 0.5);
  g.fillRect(x - 14, y - 77, 28, 75);
  g.fillStyle(0xf5dfb1, open * 0.17);
  g.fillEllipse(x, y + 11, 54, 19);
  const width = Math.max(3, Math.round(32 * (1 - open)));
  g.fillStyle(building.id === 'about' ? 0xb57e5c : 0x6f9ca8);
  g.fillRect(x - 16, y - 78, width, 73);
  g.fillStyle(0xc3d2bd);
  g.fillRect(x - 14, y - 74, Math.min(3, width), 54);
  if (width > 8) {
    g.fillStyle(0xf6d991);
    g.fillRect(x - 16 + width - 5, y - 40, 3, 3);
  }
}
