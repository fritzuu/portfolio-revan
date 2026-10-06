// One ball and explicit possession. Flight endpoints stay fixed until a receiver controls it.
export const FOOTBALL_HOMES = [
  [500, 1290],
  [700, 1390],
  [790, 1245],
  [970, 1355],
  [1090, 1390],
  [1240, 1332],
];
const foot = (p) => ({ x: p.x + (p.facing === 'left' ? -12 : 12), y: p.y - 2 });
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function approach(p, target, dt, speed) {
  const d = distance(p, target),
    step = Math.min(d, speed * dt);
  p.running = d > 2;
  if (d > 0) {
    p.x += ((target.x - p.x) / d) * step;
    p.y += ((target.y - p.y) / d) * step;
  }
  if (d > 3)
    p.facing =
      Math.abs(target.x - p.x) > Math.abs(target.y - p.y)
        ? target.x > p.x
          ? 'right'
          : 'left'
        : target.y > p.y
          ? 'down'
          : 'up';
}
export function createMatch() {
  const players = FOOTBALL_HOMES.map(([x, y]) => ({
    x,
    y,
    facing: 'right',
    running: false,
    action: null,
  }));
  return {
    players,
    owner: 0,
    passes: 0,
    phase: 'dribble',
    elapsed: 0,
    ball: foot(players[0]),
    carryTarget: { x: 580, y: 1290 },
    goal: false,
  };
}
function nextPhase(m, phase) {
  m.phase = phase;
  m.elapsed = 0;
}
export function updateMatch(m, dt) {
  dt = Math.min(dt, 0.05);
  m.elapsed += dt;
  m.players.forEach((p) => {
    p.action = null;
    p.running = false;
  });
  const owner = m.players[m.owner];
  // Teammates offer passing lanes; defender closes space, keeper tracks the ball along the goal.
  m.players.forEach((p, i) => {
    if (
      i === m.owner ||
      ['celebrate', 'retrieve', 'returnKick', 'reset'].includes(m.phase)
    )
      return;
    if (i === m.to && ['kick', 'pass', 'control'].includes(m.phase)) return;
    let target;
    if (i === 5)
      target = { x: 1240, y: Math.max(1300, Math.min(1365, m.ball.y)) };
    else if (i === 4)
      target = {
        x: Math.min(1140, m.ball.x + 135),
        y: Math.max(1220, Math.min(1450, m.ball.y + 55)),
      };
    else {
      const [hx, hy] = FOOTBALL_HOMES[i];
      target = {
        x: Math.min(1080, hx + Math.max(0, m.ball.x - 500) * 0.35),
        y: hy,
      };
    }
    approach(p, target, dt, i === 5 ? 48 : 68);
    if (!p.running) p.facing = m.ball.x > p.x ? 'right' : 'left';
  });
  if (m.phase === 'dribble') {
    approach(owner, m.carryTarget, dt, 76);
    const follow = foot(owner),
      d = distance(m.ball, follow),
      blend = d ? Math.min(1, (dt * 300) / d) : 1;
    m.ball = {
      x: m.ball.x + (follow.x - m.ball.x) * blend,
      y: m.ball.y + (follow.y - m.ball.y) * blend,
    };
    if (m.elapsed > 1.6 || distance(owner, m.carryTarget) < 4) {
      const order = [1, 2, 0, 3];
      m.to = order[m.passes % order.length];
      if (m.to === m.owner) m.to = (m.owner + 1) % 4;
      const shoot = m.passes >= 4;
      m.target = shoot ? { x: 1292, y: 1330 } : { ...foot(m.players[m.to]) };
      m.shooting = shoot;
      owner.facing = m.target.x > owner.x ? 'right' : 'left';
      m.from = { ...m.ball };
      m.kickFoot = foot(owner);
      nextPhase(m, 'kick');
    }
  } else if (m.phase === 'kick') {
    owner.action = { type: 'kick', progress: Math.min(m.elapsed / 0.3, 1) };
    const windup = Math.min(m.elapsed / 0.3, 1);
    m.ball = {
      x: m.from.x + (m.kickFoot.x - m.from.x) * windup,
      y: m.from.y + (m.kickFoot.y - m.from.y) * windup,
    };
    if (m.elapsed >= 0.3) {
      m.from = { ...m.ball };
      m.flightDuration = Math.max(
        0.5,
        distance(m.from, m.target) / (m.shooting ? 390 : 260),
      );
      nextPhase(m, m.shooting ? 'shoot' : 'pass');
    }
  } else if (m.phase === 'pass' || m.phase === 'shoot') {
    if (m.elapsed < 0.16)
      owner.action = { type: 'kick', progress: 1 - m.elapsed / 0.16 };
    const t = Math.min(m.elapsed / m.flightDuration, 1);
    m.ball = {
      x: m.from.x + (m.target.x - m.from.x) * t,
      y: m.from.y + (m.target.y - m.from.y) * t,
      height: Math.sin(Math.PI * t) * (m.shooting ? 14 : 5),
      spin: m.elapsed * 12,
    };
    if (t === 1) {
      if (m.phase === 'shoot') {
        m.goal = true;
        nextPhase(m, 'celebrate');
      } else nextPhase(m, 'control');
    }
  } else if (m.phase === 'control') {
    const receiver = m.players[m.to];
    receiver.facing = m.from.x > receiver.x ? 'right' : 'left';
    receiver.action = {
      type: 'control',
      progress: Math.min(m.elapsed / 0.35, 1),
    };
    // Ball settles onto the receiving foot rather than snapping to a new owner.
    const target = foot(receiver),
      t = Math.min(m.elapsed / 0.35, 1);
    m.ball = {
      x: m.target.x + (target.x - m.target.x) * t,
      y: m.target.y + (target.y - m.target.y) * t,
    };
    if (t === 1) {
      m.owner = m.to;
      m.passes++;
      m.carryTarget = { x: Math.min(1080, receiver.x + 90), y: receiver.y };
      nextPhase(m, 'dribble');
    }
  } else if (m.phase === 'celebrate') {
    m.players.slice(0, 4).forEach((p) => {
      p.running = false;
      p.action = { type: 'celebrate', progress: Math.min(m.elapsed / 1.4, 1) };
    });
    if (m.elapsed > 1.8) {
      m.goal = false;
      nextPhase(m, 'retrieve');
    }
  } else if (m.phase === 'retrieve') {
    const keeper = m.players[5];
    approach(keeper, { x: m.ball.x + 12, y: m.ball.y + 2 }, dt, 90);
    if (distance(foot({ ...keeper, facing: 'left' }), m.ball) < 2) {
      keeper.facing = 'left';
      m.resetFrom = { ...m.ball };
      m.resetTo = foot(m.players[0]);
      nextPhase(m, 'returnKick');
    }
  } else if (m.phase === 'returnKick') {
    m.players[5].action = {
      type: 'kick',
      progress: Math.min(m.elapsed / 0.3, 1),
    };
    if (m.elapsed >= 0.3) nextPhase(m, 'reset');
  } else if (m.phase === 'reset') {
    // Reset through a visible goalkeeper return pass, never teleport the ball.
    if (!m.resetFrom) {
      m.resetFrom = { ...m.ball };
      m.resetTo = foot(m.players[0]);
    }
    const t = Math.min(m.elapsed / 1.8, 1);
    m.ball = {
      x: m.resetFrom.x + (m.resetTo.x - m.resetFrom.x) * t,
      y: m.resetFrom.y + (m.resetTo.y - m.resetFrom.y) * t,
      height: Math.sin(t * Math.PI) * 8,
    };
    if (t === 1) {
      m.owner = 0;
      m.passes = 0;
      m.to = 0;
      m.target = { ...m.ball };
      m.from = { x: 1292, y: 1330 };
      m.resetFrom = null;
      nextPhase(m, 'control');
      m.passes = -1;
    }
  }
  return m;
}
