// One full morning → night → morning cycle takes two minutes.
export const DAY_CYCLE_MS = 120000;
export function nightAmount(elapsed) {
  return (
    (1 - Math.cos(((elapsed % DAY_CYCLE_MS) / DAY_CYCLE_MS) * Math.PI * 2)) / 2
  );
}
