// Fixed-step football simulation: both sides attack, defend and recover the same ball.
export const FIELD = {
  left: 155,
  right: 1285,
  top: 1175,
  bottom: 1490,
  goalTop: 1290,
  goalBottom: 1375,
};
export const FOOTBALL_HOMES = [
  [420, 1240],
  [560, 1332],
  [430, 1420],
  [185, 1332],
  [1020, 1240],
  [880, 1332],
  [1010, 1420],
  [1255, 1332],
];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function random(m) {
  m.seed = (Math.imul(m.seed, 1664525) + 1013904223) >>> 0;
  return m.seed / 4294967296;
}
function move(p, t, dt, speed = 118) {
  const dx = t.x - p.x,
    dy = t.y - p.y,
    d = Math.hypot(dx, dy),
    step = Math.min(d, speed * dt);
  p.running = d > 3;
  if (d > 0.1) {
    p.x = clamp(
      p.x + (dx / d) * step,
      p.keeper ? 138 : 170,
      p.keeper ? 1300 : 1270,
    );
    p.y = clamp(p.y + (dy / d) * step, 1190, 1475);
  }
  if (d > 4 && !p.action)
    p.facing =
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? 'right'
          : 'left'
        : dy > 0
          ? 'down'
          : 'up';
}
export function createMatch(seed = 8) {
  const players = FOOTBALL_HOMES.map(([x, y], i) => ({
    x,
    y,
    team: i < 4 ? 0 : 1,
    keeper: i % 4 === 3,
    facing: i < 4 ? 'right' : 'left',
    running: false,
    action: null,
    cooldown: 0,
  }));
  return {
    players,
    owner: 1,
    ball: { x: 572, y: 1330, vx: 0, vy: 0, height: 0, spin: 0 },
    score: [0, 0],
    clock: 0,
    phase: 'dribble',
    elapsed: 0,
    goal: false,
    seed,
    accumulator: 0,
    controlled: null,
    event: 'Kick off',
    stats: { passes: 0, shots: 0, saves: 0, tackles: 0, posts: 0 },
    restart: null,
  };
}
function release(m, target, shoot) {
  const p = m.players[m.owner];
  if (!p || p.action) return;
  p.facing = target.x > p.x ? 'right' : 'left';
  p.action = { type: 'kick', progress: 0 };
  m.windup = { owner: m.owner, target, shoot, time: 0 };
  m.phase = 'kick';
}
function step(m, dt, input) {
  m.clock += dt;
  m.elapsed += dt;
  const b = m.ball;
  m.players.forEach((p) => {
    p.running = false;
    p.cooldown = Math.max(0, p.cooldown - dt);
    if (p.action && !m.windup) {
      p.action.progress += dt * 4;
      if (p.action.progress >= 1) p.action = null;
    }
  });
  if (m.goal) {
    m.players.forEach((p) => {
      if (p.team === m.scoringTeam)
        p.action = {
          type: 'celebrate',
          progress: Math.min(1, m.elapsed / 1.5),
        };
    });
    if (m.elapsed > 2) {
      m.goal = false;
      m.phase = 'retrieve';
      m.owner = null;
      m.restart = m.scoringTeam === 0 ? 7 : 3;
      m.elapsed = 0;
    }
    return;
  }
  if (m.restart !== null) {
    const p = m.players[m.restart];
    move(p, b, dt, 170);
    if (distance(p, b) < 16) {
      m.owner = m.restart;
      m.restart = null;
      m.phase = 'dribble';
      p.cooldown = 0.6;
      m.event = 'Goalkeeper restart';
    }
  }
  const owner = m.players[m.owner],
    team = owner?.team;
  const pressing = [0, 1].map(
    (t) =>
      m.players
        .map((p, i) => ({ p, i, d: distance(p, b) }))
        .filter((v) => v.p.team === t && !v.p.keeper && v.i !== m.owner)
        .sort((a, b) => a.d - b.d)[0]?.i,
  );
  m.players.forEach((p, i) => {
    if (i === m.restart) return;
    if (m.controlled === i && !m.windup) {
      move(
        p,
        { x: p.x + (input.dx || 0) * 100, y: p.y + (input.dy || 0) * 100 },
        dt,
        155,
      );
      return;
    }
    if (i === m.owner) {
      if (!m.windup)
        move(
          p,
          {
            x: p.team === 0 ? 1225 : 215,
            y: clamp(p.y + Math.sin(m.clock * 1.3 + i) * 24, 1215, 1450),
          },
          dt,
          p.keeper ? 72 : 140,
        );
      return;
    }
    let target;
    if (p.keeper) {
      if (m.clock > (p.reactAt || 0)) {
        p.trackY = clamp(b.y, 1296, 1369);
        p.reactAt = m.clock + 0.42;
      }
      target = { x: p.team === 0 ? 184 : 1256, y: p.trackY || 1332 };
    } else if (m.owner === null || (pressing[p.team] === i && p.team !== team))
      target = { x: b.x + (b.vx || 0) * 0.12, y: b.y + (b.vy || 0) * 0.12 };
    else {
      const [hx, hy] = FOOTBALL_HOMES[i];
      target = {
        x: clamp(hx + (b.x - 720) * 0.42, 260, 1175),
        y: clamp(hy + Math.sin(m.clock * 0.7 + i) * 23, 1210, 1455),
      };
    }
    move(p, target, dt, p.keeper ? 72 : p.team !== team ? 126 : 120);
  });
  if (m.windup) {
    const w = m.windup,
      p = m.players[w.owner];
    w.time += dt;
    p.action = { type: 'kick', progress: Math.min(1, w.time / 0.24) };
    if (w.time >= 0.24) {
      const dx = w.target.x - b.x,
        dy = w.target.y - b.y,
        d = Math.hypot(dx, dy),
        speed = w.shoot ? 470 : 330;
      b.vx = (dx / d) * speed;
      b.vy = (dy / d) * speed;
      m.owner = null;
      p.cooldown = 0.5;
      m.phase = w.shoot ? 'shoot' : 'pass';
      m.windup = null;
      m.lastTouch = w.owner;
      m.stats[w.shoot ? 'shots' : 'passes']++;
      m.event = w.shoot ? 'Shot!' : 'Pass';
    }
  } else if (owner) {
    const fx = owner.x + (owner.team === 0 ? 12 : -12),
      fy = owner.y - 2,
      d = Math.hypot(fx - b.x, fy - b.y),
      blend = Math.min(1, (dt * 340) / Math.max(1, d));
    b.x += (fx - b.x) * blend;
    b.y += (fy - b.y) * blend;
    b.vx = 0;
    b.vy = 0;
    m.phase = 'dribble';
    if (m.controlled === m.owner) {
      if (input.action === 'shoot')
        release(
          m,
          { x: owner.team === 0 ? 1300 : 140, y: clamp(owner.y, 1260, 1400) },
          true,
        );
      else if (input.action === 'pass') {
        const mate = m.players
          .map((p, i) => ({ p, i }))
          .filter(
            (v) => v.p.team === owner.team && v.i !== m.owner && !v.p.keeper,
          )
          .sort((a, b) => distance(a.p, owner) - distance(b.p, owner))[0];
        if (mate) release(m, mate.p, false);
      }
    } else if (owner.cooldown === 0) {
      const defenders = m.players.filter(
          (p) => p.team !== owner.team && !p.keeper,
        ),
        pressure = Math.min(...defenders.map((p) => distance(p, owner)));
      const goalX = owner.team === 0 ? 1300 : 140;
      if (Math.abs(goalX - owner.x) < 430 && random(m) < dt * 3)
        release(m, { x: goalX, y: 1332 + (random(m) - 0.5) * 140 }, true);
      else if (random(m) < dt * (owner.keeper ? 2 : pressure < 75 ? 2 : 0.35)) {
        const mates = m.players
          .filter((p) => p.team === owner.team && p !== owner && !p.keeper)
          .sort((a, b) => (owner.team === 0 ? b.x - a.x : a.x - b.x));
        const mate = mates[Math.floor(random(m) * mates.length)];
        if (mate) release(m, { x: mate.x, y: mate.y }, false);
      }
    }
    if (!m.windup && owner.cooldown === 0) {
      const challenger = m.players.findIndex(
        (p) =>
          p.team !== owner.team &&
          !p.keeper &&
          distance(p, b) < 20 &&
          p.cooldown === 0,
      );
      if (challenger >= 0 && random(m) < dt * 2) {
        owner.cooldown = 2.4;
        m.owner = challenger;
        m.players[challenger].cooldown = 0.8;
        m.stats.tackles++;
        m.event = 'Possession turned over';
      }
    }
  } else {
    const previousX = b.x;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.spin += (dt * Math.hypot(b.vx, b.vy)) / 22;
    b.vx *= Math.exp(-0.16 * dt);
    b.vy *= Math.exp(-0.16 * dt);
    for (const line of [FIELD.left, FIELD.right]) {
      const crossing =
        line === FIELD.left
          ? previousX >= line && b.x < line
          : previousX <= line && b.x > line;
      if (crossing && b.y > FIELD.goalTop + 5 && b.y < FIELD.goalBottom - 5) {
        const scoring = line === FIELD.right ? 0 : 1;
        m.score[scoring]++;
        m.scoringTeam = scoring;
        m.goal = true;
        m.elapsed = 0;
        m.phase = 'celebrate';
        m.event = scoring === 0 ? 'Messi team scores!' : 'Yamal team scores!';
        b.vx = 0;
        b.vy = 0;
        return;
      }
      if (crossing) {
        b.x = clamp(b.x, FIELD.left, FIELD.right);
        b.vx *= -0.55;
        m.event = 'Off the boundary';
        if (
          Math.min(
            Math.abs(b.y - FIELD.goalTop),
            Math.abs(b.y - FIELD.goalBottom),
          ) < 9
        ) {
          m.stats.posts++;
          m.event = 'Off the post!';
        }
      }
    }
    if (b.y < FIELD.top || b.y > FIELD.bottom) {
      b.y = clamp(b.y, FIELD.top, FIELD.bottom);
      b.vy *= -0.65;
    }
    if (m.restart === null) {
      const candidate = m.players
        .map((p, i) => ({ p, i, d: distance(p, b) }))
        .filter((v) => v.p.cooldown === 0 && v.d < (v.p.keeper ? 18 : 17))
        .sort((a, b) => a.d - b.d)[0];
      if (candidate) {
        m.owner = candidate.i;
        candidate.p.cooldown = 0.7;
        candidate.p.action = { type: 'control', progress: 0 };
        if (candidate.p.keeper && m.phase === 'shoot') {
          m.stats.saves++;
          candidate.p.action = { type: 'save', progress: 0 };
          candidate.p.facing = b.x > candidate.p.x ? 'right' : 'left';
          m.event = 'Saved by the keeper!';
        } else
          m.event =
            candidate.p.team === m.players[m.lastTouch]?.team
              ? 'Ball controlled'
              : 'Intercepted!';
        b.vx = 0;
        b.vy = 0;
        m.phase = 'control';
      }
    }
  }
}
export function updateMatch(m, dt, input = {}) {
  m.accumulator += Math.min(0.1, Math.max(0, dt));
  if (input.action) m.pendingAction = input.action;
  let action = m.pendingAction;
  while (m.accumulator + 1e-8 >= 1 / 60) {
    step(m, 1 / 60, { ...input, action });
    action = null;
    m.pendingAction = null;
    m.accumulator -= 1 / 60;
  }
  return m;
}
