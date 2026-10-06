// One fixed-step arcade simulation owns the ball, actions, period clock and score.
export const FIELD = {
  left: 155,
  right: 1285,
  top: 1175,
  bottom: 1490,
  goalTop: 1290,
  goalBottom: 1375,
};
export const HALF_SECONDS = 60,
  HALFTIME_SECONDS = 4,
  FULLTIME_SECONDS = 5;
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
const unit = (x, y) => {
  const d = Math.hypot(x, y) || 1;
  return { x: x / d, y: y / d };
};
export const attackDirection = (m, team) =>
  (team === 0 ? 1 : -1) * (m.half === 1 ? 1 : -1);
const relaxed = (m) => m.difficulty !== 'sengit' && m.controlled !== null;
const enemy = (m, p) => relaxed(m) && p.team !== m.players[m.controlled].team;
const freshStats = () => ({
  goals: 0,
  assists: 0,
  passes: 0,
  shots: 0,
  saves: 0,
  rebounds: 0,
  tackles: 0,
  posts: 0,
});
function random(m) {
  m.seed = (Math.imul(m.seed, 1664525) + 1013904223) >>> 0;
  return m.seed / 4294967296;
}
function record(m, key, index) {
  m.stats[key]++;
  m.totals[key]++;
  if (index !== undefined) m.players[index].stats[key]++;
}
function move(p, t, dt, speed = 118) {
  if (p.stunned > 0) return;
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
  if (d > 4 && !p.action) {
    p.facing =
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? 'right'
          : 'left'
        : dy > 0
          ? 'down'
          : 'up';
    p.aim = unit(dx, dy);
  }
}
function homes(m, i) {
  const [x, y] = FOOTBALL_HOMES[i];
  return { x: m.half === 1 ? x : 1440 - x, y };
}
function kickoff(m, team, input = {}) {
  m.players.forEach((p, i) => {
    Object.assign(p, homes(m, i), {
      running: false,
      action: null,
      cooldown: 0,
      tackleCooldown: 0,
      skillCooldown: 0,
      sprintRecovery: 0,
      stunned: 0,
      immune: 0,
      tackle: null,
      dive: null,
      skill: null,
      stamina: 100,
      exhausted: false,
      aim: { x: attackDirection(m, p.team), y: 0 },
      facing: attackDirection(m, p.team) > 0 ? 'right' : 'left',
      reactAt: 0,
    });
  });
  m.owner = team === 0 ? 1 : 5;
  const p = m.players[m.owner];
  p.x = 720 - attackDirection(m, team) * 12;
  p.y = 1332;
  m.ball = {
    x: 720,
    y: 1330,
    vx: 0,
    vy: 0,
    height: 0,
    spin: 0,
    shot: false,
    age: 0,
  };
  m.goal = false;
  m.restart = null;
  m.windup = null;
  m.charge = null;
  m.lastPass = null;
  m.kickoffWait = 0.6;
  m.phase = 'kickoff';
  m.elapsed = 0;
  m.mustReleaseShoot = !!input.shootHeld;
}
export function createMatch(seed = 8) {
  const players = FOOTBALL_HOMES.map(([x, y], i) => ({
    x,
    y,
    team: i < 4 ? 0 : 1,
    keeper: i % 4 === 3,
    running: false,
    action: null,
    cooldown: 0,
    tackleCooldown: 0,
    skillCooldown: 0,
    stunned: 0,
    immune: 0,
    stamina: 100,
    aim: { x: i < 4 ? 1 : -1, y: 0 },
    stats: freshStats(),
  }));
  const m = {
    players,
    seed,
    difficulty: 'santai',
    owner: 1,
    score: [0, 0],
    clock: 0,
    half: 1,
    halfElapsed: 0,
    remaining: 60,
    status: 'playing',
    statusElapsed: 0,
    matchNumber: 1,
    finishedMatches: 0,
    accumulator: 0,
    controlled: null,
    event: 'First half · kick off',
    stats: freshStats(),
    totals: freshStats(),
    lastResult: null,
    goalTotals: [0, 0],
  };
  kickoff(m, 0);
  return m;
}
function transition(m, dt, input) {
  if (m.status !== 'playing') {
    m.statusElapsed += dt;
    if (m.status === 'halftime' && m.statusElapsed + 1e-8 >= HALFTIME_SECONDS) {
      m.half = 2;
      m.halfElapsed = 0;
      m.remaining = 60;
      m.status = 'playing';
      m.event = 'Second half · sides switched';
      kickoff(m, 1, input);
    } else if (
      m.status === 'fulltime' &&
      m.statusElapsed + 1e-8 >= FULLTIME_SECONDS
    ) {
      m.half = 1;
      m.halfElapsed = 0;
      m.clock = 0;
      m.remaining = 60;
      m.score = [0, 0];
      m.stats = freshStats();
      m.players.forEach((p) => (p.stats = freshStats()));
      m.status = 'playing';
      m.matchNumber++;
      m.event = 'New match · 0–0';
      kickoff(m, 0, input);
    }
    return true;
  }
  m.clock += dt;
  m.halfElapsed = Math.min(60, m.halfElapsed + dt);
  m.remaining = Math.max(0, Math.ceil(60 - m.halfElapsed - 1e-8));
  if (m.halfElapsed + 1e-8 >= 60) {
    m.clock = m.half * 60;
    m.status = m.half === 1 ? 'halftime' : 'fulltime';
    m.statusElapsed = 0;
    m.charge = null;
    m.windup = null;
    m.goal = false;
    m.ball.vx = 0;
    m.ball.vy = 0;
    m.phase = m.status;
    m.players.forEach((p) => {
      p.action = null;
      p.tackle = null;
      p.skill = null;
      p.dive = null;
      p.running = false;
    });
    m.event =
      m.half === 1
        ? 'HALFTIME · changing ends'
        : m.score[0] === m.score[1]
          ? 'FULLTIME · draw'
          : m.score[0] > m.score[1]
            ? 'FULLTIME · Messi team wins'
            : 'FULLTIME · Yamal team wins';
    if (m.half === 2) {
      m.finishedMatches++;
      m.lastResult = {
        score: [...m.score],
        stats: { ...m.stats },
        players: m.players.map((p) => ({ ...p.stats })),
        matchNumber: m.matchNumber,
      };
    }
    return true;
  }
  return false;
}
function launch(m, target, shoot, power = 0.5, receiver = null) {
  const p = m.players[m.owner];
  if (!p || p.stunned || p.action) return;
  const aim = unit(target.x - m.ball.x, target.y - m.ball.y);
  p.facing =
    Math.abs(aim.x) > Math.abs(aim.y)
      ? aim.x > 0
        ? 'right'
        : 'left'
      : aim.y > 0
        ? 'down'
        : 'up';
  p.action = { type: 'kick', progress: 0 };
  m.windup = {
    owner: m.owner,
    aim,
    shoot,
    power: clamp(power, 0.12, 1),
    receiver,
    time: 0,
  };
  m.phase = 'kick';
  m.charge = null;
}
function shoot(m, p, power) {
  const opponents = m.players.filter((q) => q.team !== p.team && !q.keeper);
  const pressure = Math.min(...opponents.map((q) => distance(q, p)));
  const spread =
    (power > 0.78 ? (power - 0.78) * 0.55 : 0) +
    (p.sprinting || p.sprintRecovery > 0 ? 0.055 : p.running ? 0.02 : 0) +
    (pressure < 55 ? 0.045 : 0);
  let aim = p.aim;
  if (relaxed(m) && m.controlled === m.owner) {
    const dir = attackDirection(m, p.team);
    const goal = unit(
      (dir > 0 ? FIELD.right : FIELD.left) - m.ball.x,
      1332 - m.ball.y,
    );
    if (
      aim.x * goal.x + aim.y * goal.y > 0.7 &&
      Math.abs((dir > 0 ? FIELD.right : FIELD.left) - p.x) < 650
    )
      aim = unit(aim.x * 0.3 + goal.x * 0.7, aim.y * 0.3 + goal.y * 0.7);
  }
  const angle =
    Math.atan2(aim.y, aim.x) +
    (random(m) - 0.5) *
      spread *
      (relaxed(m) && m.controlled === m.owner ? 0.4 : 1);
  launch(
    m,
    {
      x: m.ball.x + Math.cos(angle) * 1000,
      y: m.ball.y + Math.sin(angle) * 1000,
    },
    true,
    power,
  );
}
function pass(m, p, through) {
  const dir = attackDirection(m, p.team);
  let mate = m.players
    .map((q, i) => ({ q, i }))
    .filter((v) => v.q.team === p.team && v.q !== p && !v.q.keeper)
    .sort(
      (a, b) =>
        distance(a.q, p) -
        Math.max(0, (a.q.x - p.x) * dir) * 0.3 -
        (distance(b.q, p) - Math.max(0, (b.q.x - p.x) * dir) * 0.3),
    )[0];
  const visitor = m.players[m.controlled];
  if (
    relaxed(m) &&
    visitor !== p &&
    visitor.team === p.team &&
    distance(visitor, p) < 420
  )
    mate = { q: visitor, i: m.controlled };
  if (mate)
    launch(
      m,
      { x: clamp(mate.q.x + (through ? dir * 95 : 0), 180, 1260), y: mate.q.y },
      false,
      through ? 0.8 : 0.45,
      mate.i,
    );
}
function beginTackle(m, i) {
  const p = m.players[i];
  if (
    p.keeper ||
    p.tackleCooldown > 0 ||
    p.stunned > 0 ||
    p.stamina < 16 ||
    i === m.owner
  )
    return;
  const aim =
    distance(p, m.ball) < 90 ? unit(m.ball.x - p.x, m.ball.y - p.y) : p.aim;
  p.tackle = { age: 0, aim, connected: false };
  p.tackleCooldown = 1.7;
  p.stamina -= 16;
  p.action = { type: 'tackle', progress: 0 };
}
function beginSkill(m, i, input) {
  const p = m.players[i];
  if (
    m.owner !== i ||
    p.skillCooldown > 0 ||
    p.stamina < 18 ||
    p.stunned > 0 ||
    m.windup
  )
    return;
  const side = input.dy < 0 ? -1 : 1;
  p.skill = { age: 0, aim: { x: -p.aim.y * side, y: p.aim.x * side } };
  p.skillCooldown = 3.2;
  p.stamina -= 18;
  p.immune = 0.36;
  p.action = { type: 'skill', progress: 0 };
  m.event = 'Quick touch!';
}
function actions(m, dt, input) {
  m.players.forEach((p, i) => {
    p.running = false;
    p.sprinting = false;
    if (i !== m.controlled) p.stamina = Math.min(100, p.stamina + dt * 16);
    for (const key of [
      'cooldown',
      'tackleCooldown',
      'skillCooldown',
      'sprintRecovery',
      'stunned',
      'immune',
    ])
      p[key] = Math.max(0, (p[key] || 0) - dt);
    if (p.action && !p.tackle && !p.skill && !m.windup) {
      p.action.progress += dt * 3;
      if (p.action.progress >= 1) p.action = null;
    }
    if (p.tackle) {
      const t = p.tackle;
      t.age += dt;
      p.action = { type: 'tackle', progress: Math.min(1, t.age / 0.46) };
      if (t.age > 0.15) {
        move(p, { x: p.x + t.aim.x * 100, y: p.y + t.aim.y * 100 }, dt, 305);
        const victim = m.players[m.owner];
        if (
          !t.connected &&
          victim &&
          victim.team !== p.team &&
          victim.immune === 0 &&
          distance(p, m.ball) < 25
        ) {
          t.connected = true;
          victim.stunned = 0.42;
          victim.immune = 1;
          victim.action = { type: 'stumble', progress: 0 };
          victim.cooldown = 1;
          m.owner = i;
          if (relaxed(m) && i === m.controlled) p.immune = 1.6;
          m.charge = null;
          m.windup = null;
          p.cooldown = 0.7;
          record(m, 'tackles', i);
          m.event = 'Clean tackle!';
        }
      }
      if (t.age >= 0.46) {
        if (!t.connected)
          p.stunned = relaxed(m) && i === m.controlled ? 0.15 : 0.3;
        p.tackle = null;
        p.action = null;
      }
    }
    if (p.skill) {
      const s = p.skill;
      s.age += dt;
      p.action = { type: 'skill', progress: Math.min(1, s.age / 0.3) };
      move(p, { x: p.x + s.aim.x * 100, y: p.y + s.aim.y * 100 }, dt, 170);
      if (s.age >= 0.3) {
        p.skill = null;
        p.action = null;
      }
    }
  });
  if (m.controlled !== null) {
    if (input.action === 'tackle') beginTackle(m, m.controlled);
    if (input.action === 'skill') beginSkill(m, m.controlled, input);
  }
  if (input.action === 'cancelShot') {
    m.charge = null;
    m.mustReleaseShoot = true;
  }
}
function keeperTarget(m, p) {
  const b = m.ball,
    dir = attackDirection(m, p.team),
    x = dir > 0 ? 184 : 1256,
    incoming = b.shot && b.vx * dir < 0;
  if (m.clock > (p.reactAt || 0)) {
    const eta = incoming ? clamp((x - b.x) / (b.vx || 1), 0, 0.1) : 0;
    p.trackY = clamp(b.y + b.vy * eta, 1292, 1372);
    p.reactAt = m.clock + (enemy(m, p) ? 0.72 : 0.46);
    if (incoming && Math.abs(b.x - x) < 130 && !p.dive && p.cooldown === 0) {
      p.dive = { age: 0 };
      p.action = { type: 'save', progress: 0 };
    }
  }
  return { x, y: p.trackY || 1332 };
}
function step(m, dt, input) {
  if (transition(m, dt, input)) return;
  m.elapsed += dt;
  const b = m.ball;
  if (m.kickoffWait > 0) {
    m.kickoffWait = Math.max(0, m.kickoffWait - dt);
    return;
  }
  actions(m, dt, input);
  if (m.goal) {
    m.players.forEach((p) => {
      if (p.team === m.scoringTeam)
        p.action = {
          type: 'celebrate',
          progress: Math.min(1, m.elapsed / 1.5),
        };
    });
    if (m.elapsed > 1.6) {
      m.goal = false;
      m.owner = null;
      m.restart = m.scoringTeam === 0 ? 7 : 3;
      m.phase = 'retrieve';
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
      p.cooldown = 0.7;
      m.event = 'Goalkeeper restart';
    }
  }
  if (m.controlled !== m.owner && m.charge) {
    m.charge = null;
    m.mustReleaseShoot = !!input.shootHeld;
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
    if (i === m.restart || p.tackle || p.skill || p.stunned > 0) return;
    let target, speed;
    if (i === m.controlled && m.windup?.owner !== i) {
      const moving = !!(input.dx || input.dy);
      if (p.stamina <= 5) p.exhausted = true;
      if (!input.sprint || p.stamina >= 25) p.exhausted = false;
      p.sprinting = !!input.sprint && moving && !p.exhausted && !m.charge;
      if (p.sprinting) p.sprintRecovery = 0.35;
      p.stamina = clamp(
        p.stamina +
          (p.sprinting ? (relaxed(m) ? -18 : -31) : relaxed(m) ? 28 : 18) * dt,
        0,
        100,
      );
      target = {
        x: p.x + (input.dx || 0) * 100,
        y: p.y + (input.dy || 0) * 100,
      };
      speed = m.charge ? 95 : p.sprinting ? 225 : 155;
      if (moving) p.aim = unit(input.dx || 0, input.dy || 0);
    } else if (i === m.owner) {
      if (m.windup) return;
      const dir = attackDirection(m, p.team);
      target = {
        x: dir > 0 ? 1225 : 215,
        y: clamp(p.y + Math.sin(m.clock * 1.3 + i) * 24, 1215, 1450),
      };
      speed = p.keeper ? 72 : 142;
      p.stamina = Math.min(100, p.stamina + dt * 15);
    } else if (p.keeper) {
      target = keeperTarget(m, p);
      if (p.dive) {
        p.dive.age += dt;
        p.action = { type: 'save', progress: Math.min(1, p.dive.age / 0.5) };
        if (p.dive.age > 0.5) p.dive = null;
      }
      speed = p.dive ? (enemy(m, p) ? 105 : 140) : enemy(m, p) ? 60 : 75;
    } else if (
      m.owner === null ||
      (pressing[p.team] === i && p.team !== team)
    ) {
      target = { x: b.x + (b.vx || 0) * 0.1, y: b.y + (b.vy || 0) * 0.1 };
      speed = enemy(m, p) ? 98 : 132;
      if (
        i !== m.controlled &&
        owner &&
        owner.team !== p.team &&
        owner.immune === 0 &&
        distance(p, b) < 60 &&
        random(m) < dt * (enemy(m, p) ? 0.45 : 1.2)
      )
        beginTackle(m, i);
    } else {
      const h = homes(m, i),
        dir = attackDirection(m, p.team);
      target = {
        x: clamp(
          b.x +
            dir *
              (p.team === team
                ? i % 4 === 0
                  ? 110
                  : i % 4 === 2
                    ? 70
                    : -95
                : -120),
          240,
          1200,
        ),
        y: clamp(h.y + Math.sin(m.clock * 0.7 + i) * 23, 1210, 1455),
      };
      speed = p.team === team ? 147 : enemy(m, p) ? 105 : 125;
    }
    move(p, target, dt, speed);
  });
  const shotSuppressed = m.mustReleaseShoot;
  if (m.mustReleaseShoot && !input.shootHeld) m.mustReleaseShoot = false;
  if (m.windup) {
    const w = m.windup,
      p = m.players[w.owner];
    w.time += dt;
    p.action = { type: 'kick', progress: Math.min(1, w.time / 0.23) };
    if (w.time >= 0.23) {
      const speed = w.shoot ? 260 + w.power * 450 : 280 + w.power * 130;
      b.vx = w.aim.x * speed;
      b.vy = w.aim.y * speed;
      b.shot = w.shoot;
      b.power = w.power;
      b.age = 0;
      m.owner = null;
      p.cooldown = 0.5;
      m.phase = w.shoot ? 'shoot' : 'pass';
      m.lastTouch = w.owner;
      m.windup = null;
      m.lastPass = w.shoot
        ? m.lastPass
        : { from: w.owner, to: w.receiver, time: m.clock };
      record(m, w.shoot ? 'shots' : 'passes', w.owner);
      m.event = w.shoot ? 'Shot!' : w.power > 0.65 ? 'Through ball!' : 'Pass';
    }
  } else if (owner) {
    const touch = owner.aim || { x: attackDirection(m, owner.team), y: 0 },
      stride =
        relaxed(m) && m.controlled === m.owner
          ? owner.sprinting
            ? 16
            : 10
          : owner.sprinting
            ? 23
            : 12;
    const fx = clamp(
        owner.x + touch.x * stride,
        FIELD.left + 2,
        FIELD.right - 2,
      ),
      fy = clamp(
        owner.y - 2 + touch.y * stride,
        FIELD.top + 2,
        FIELD.bottom - 2,
      ),
      d = Math.hypot(fx - b.x, fy - b.y),
      blend = Math.min(1, (dt * (owner.skill ? 390 : 290)) / Math.max(1, d));
    b.x += (fx - b.x) * blend;
    b.y += (fy - b.y) * blend;
    b.vx = 0;
    b.vy = 0;
    b.shot = false;
    b.height = 0;
    m.phase = 'dribble';
    if (
      m.controlled === m.owner &&
      owner.stunned === 0 &&
      !owner.tackle &&
      !owner.skill
    ) {
      if (
        input.shootHeld &&
        !m.mustReleaseShoot &&
        input.action !== 'cancelShot'
      ) {
        if (!m.charge) m.charge = { time: 0, power: 0.12 };
        m.charge.time += dt;
        m.charge.power = clamp(
          0.12 + m.charge.time / (relaxed(m) ? 0.6 : 1.1),
          0.12,
          1,
        );
      } else if (m.charge && input.action !== 'cancelShot') {
        const power = m.charge.power;
        m.charge = null;
        shoot(m, owner, power);
      } else if (input.action === 'releaseShot' && !shotSuppressed)
        shoot(m, owner, clamp(input.power ?? 0.18, 0.12, 1));
      else if (input.action === 'shoot') shoot(m, owner, 0.55);
      if (input.action === 'pass') pass(m, owner, !!input.through);
    } else if (m.controlled !== m.owner && owner.cooldown === 0) {
      const dir = attackDirection(m, owner.team),
        goalX = dir > 0 ? 1300 : 140;
      const pressure = Math.min(
        ...m.players
          .filter((p) => p.team !== owner.team && !p.keeper)
          .map((p) => distance(p, owner)),
      );
      if (
        relaxed(m) &&
        owner.team === m.players[m.controlled].team &&
        distance(owner, m.players[m.controlled]) < 420 &&
        random(m) < dt * (pressure < 100 ? 2.8 : 0.9)
      ) {
        pass(m, owner, false);
      } else if (Math.abs(goalX - owner.x) < 450 && random(m) < dt * 3) {
        owner.aim = unit(
          goalX - owner.x,
          1332 + (random(m) - 0.5) * 130 - owner.y,
        );
        shoot(m, owner, 0.35 + random(m) * 0.65);
      } else if (random(m) < dt * (owner.keeper ? 2 : pressure < 75 ? 2 : 0.35))
        pass(m, owner, random(m) < 0.3);
      else if (
        pressure < 55 &&
        owner.skillCooldown === 0 &&
        random(m) < dt * 0.5
      )
        beginSkill(m, m.owner, { dy: random(m) < 0.5 ? -1 : 1 });
    }
  } else {
    const previousX = b.x;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.age += dt;
    b.spin += (dt * Math.hypot(b.vx, b.vy)) / 22;
    b.vx *= Math.exp(-0.22 * dt);
    b.vy *= Math.exp(-0.22 * dt);
    b.height = b.shot
      ? Math.max(0, Math.sin(b.age * 5) * 8 * (b.power || 0.5))
      : 0;
    for (const line of [FIELD.left, FIELD.right]) {
      const crossing =
        line === FIELD.left
          ? previousX >= line && b.x < line
          : previousX <= line && b.x > line;
      if (crossing && b.y > FIELD.goalTop + 5 && b.y < FIELD.goalBottom - 5) {
        const scoring =
          line === FIELD.right ? (m.half === 1 ? 0 : 1) : m.half === 1 ? 1 : 0;
        m.score[scoring]++;
        m.goalTotals[scoring]++;
        m.scoringTeam = scoring;
        m.goal = true;
        m.elapsed = 0;
        m.phase = 'celebrate';
        m.event = scoring === 0 ? 'Messi team scores!' : 'Yamal team scores!';
        b.vx = 0;
        b.vy = 0;
        m.charge = null;
        const scorer = m.players[m.lastTouch];
        if (scorer?.team === scoring) {
          record(m, 'goals', m.lastTouch);
          if (m.lastPass?.to === m.lastTouch && m.clock - m.lastPass.time < 12)
            record(m, 'assists', m.lastPass.from);
        } else {
          m.stats.goals++;
          m.totals.goals++;
        }
        return;
      }
      if (crossing) {
        b.x = clamp(b.x, FIELD.left, FIELD.right);
        b.vx *= -0.55;
        m.event = 'Wide!';
        if (
          Math.min(
            Math.abs(b.y - FIELD.goalTop),
            Math.abs(b.y - FIELD.goalBottom),
          ) < 9
        ) {
          record(m, 'posts');
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
        .filter(
          (v) =>
            v.p.cooldown === 0 &&
            v.p.stunned === 0 &&
            v.d <
              (v.p.keeper
                ? v.p.dive
                  ? enemy(m, v.p)
                    ? 15
                    : 20
                  : enemy(m, v.p)
                    ? 9
                    : 11
                : b.shot
                  ? Math.hypot(b.vx, b.vy) > 450
                    ? 8
                    : 12
                  : 17),
        )
        .sort((a, b) => a.d - b.d)[0];
      if (candidate) {
        const p = candidate.p,
          speed = Math.hypot(b.vx, b.vy);
        if (p.keeper && b.shot) {
          record(m, 'saves', candidate.i);
          p.facing = b.x > p.x ? 'right' : 'left';
          p.action = { type: 'save', progress: 0 };
          p.dive = null;
          if (speed > 425) {
            const dir = attackDirection(m, p.team);
            b.vx = dir * Math.abs(b.vx) * 0.58;
            b.vy = (b.y - p.y) * 6 + (random(m) - 0.5) * 110;
            b.shot = false;
            b.height = 0;
            m.owner = null;
            p.cooldown = 0.6;
            m.phase = 'rebound';
            record(m, 'rebounds', candidate.i);
            m.event = 'Keeper parry · rebound!';
            return;
          }
          m.event = 'Keeper catches it!';
          p.action = { type: 'catch', progress: 0 };
        } else {
          m.event =
            p.team === m.players[m.lastTouch]?.team
              ? 'Ball controlled'
              : 'Intercepted!';
          p.action = { type: 'control', progress: 0 };
        }
        if (m.lastPass && !b.shot && m.players[m.lastPass.from].team === p.team)
          m.lastPass.to = candidate.i;
        else if (m.lastPass && m.players[m.lastPass.from].team !== p.team)
          m.lastPass = null;
        m.owner = candidate.i;
        if (relaxed(m) && candidate.i === m.controlled) p.immune = 1.6;
        m.lastTouch = candidate.i;
        p.cooldown = 0.8;
        b.vx = 0;
        b.vy = 0;
        b.shot = false;
        m.phase = 'control';
      }
    }
  }
}
export function updateMatch(m, dt, input = {}) {
  if (input.hidden) {
    m.accumulator = 0;
    m.charge = null;
    m.pendingInput = null;
    m.mustReleaseShoot = true;
    return m;
  }
  m.accumulator += Math.min(0.1, Math.max(0, dt));
  if (input.action)
    m.pendingInput = {
      action: input.action,
      power: input.power,
      through: input.through,
    };
  while (m.accumulator + 1e-8 >= 1 / 60) {
    step(m, 1 / 60, {
      ...input,
      action: undefined,
      power: undefined,
      through: undefined,
      ...m.pendingInput,
    });
    m.pendingInput = null;
    m.accumulator -= 1 / 60;
  }
  return m;
}
