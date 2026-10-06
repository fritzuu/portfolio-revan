import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createMatch,
  updateMatch,
  attackDirection,
} from '../src/game/football.js';
const ticks = (m, n, input = {}) => {
  for (let i = 0; i < n; i++) updateMatch(m, 1 / 60, input);
};
function controlled() {
  const m = createMatch();
  m.difficulty = 'sengit';
  m.kickoffWait = 0;
  m.controlled = m.owner;
  m.players.forEach((p) => {
    p.cooldown = 10;
    p.tackleCooldown = 10;
  });
  return m;
}
function fired(powerSeconds) {
  const m = controlled();
  ticks(m, Math.round(powerSeconds * 60), { shootHeld: true });
  const charge = m.charge.power;
  updateMatch(m, 1 / 60, { shootHeld: false });
  for (let i = 0; i < 30 && m.stats.shots === 0; i++) updateMatch(m, 1 / 60);
  return { m, charge, speed: Math.hypot(m.ball.vx, m.ball.vy) };
}
test('two exact 60-second halves, four-second interval, sides switch and five-second result before 0–0', () => {
  const m = createMatch();
  m.controlled = 2;
  ticks(m, 3599);
  assert.equal(m.status, 'playing');
  assert.equal(m.remaining, 1);
  m.score = [2, 1];
  ticks(m, 1);
  assert.equal(m.status, 'halftime');
  assert.equal(m.remaining, 0);
  assert.equal(m.half, 1);
  const ball = { ...m.ball };
  ticks(m, 239);
  assert.equal(m.status, 'halftime');
  assert.deepEqual(m.ball, ball);
  assert.deepEqual(m.score, [2, 1]);
  ticks(m, 1);
  assert.equal(m.status, 'playing');
  assert.equal(m.half, 2);
  assert.equal(m.remaining, 60);
  assert.deepEqual(m.score, [2, 1]);
  assert.equal(attackDirection(m, 0), -1);
  assert.equal(m.players[3].x, 1255);
  assert.equal(m.players[7].x, 185);
  ticks(m, 3600);
  assert.equal(m.status, 'fulltime');
  assert.equal(m.clock, 120);
  assert.deepEqual(m.lastResult.score, m.score);
  ticks(m, 299);
  assert.equal(m.status, 'fulltime');
  ticks(m, 1);
  assert.equal(m.status, 'playing');
  assert.deepEqual(m.score, [0, 0]);
  assert.equal(m.half, 1);
  assert.equal(m.remaining, 60);
  assert.equal(m.controlled, 2);
  assert.equal(m.matchNumber, 2);
});
test('charging changes actual ball speed; holding does not fire and cancellation prevents an accidental shot', () => {
  const low = fired(0.1),
    high = fired(1.1);
  assert.ok(high.charge > low.charge);
  assert.ok(high.speed > low.speed + 300);
  assert.equal(low.m.stats.shots, 1);
  assert.equal(high.m.stats.shots, 1);
  const m = controlled();
  ticks(m, 70, { shootHeld: true });
  assert.equal(m.stats.shots, 0);
  assert.equal(m.charge.power, 1);
  updateMatch(m, 1 / 60, { shootHeld: true, action: 'cancelShot' });
  ticks(m, 20, { shootHeld: true });
  assert.equal(m.charge, null);
  assert.equal(m.stats.shots, 0);
  updateMatch(m, 1 / 60, { shootHeld: false });
  assert.equal(m.stats.shots, 0);
});
test('last movement direction aims a charged shot, rather than forcing every kick toward the goal', () => {
  const m = controlled();
  ticks(m, 6, { dx: 0, dy: -1, shootHeld: true });
  updateMatch(m, 1 / 60, { shootHeld: false });
  ticks(m, 15);
  assert.ok(m.ball.vy < 0);
  assert.ok(Math.abs(m.ball.vx) < 1);
  assert.equal(m.stats.shots, 1);
});
test('sprint drains stamina, exhaustion prevents rapid toggle jitter and resting restores it', () => {
  const sprint = controlled(),
    walk = controlled();
  ticks(sprint, 60, { dx: 1, sprint: true });
  ticks(walk, 60, { dx: 1 });
  assert.ok(sprint.players[sprint.owner].x > walk.players[walk.owner].x + 50);
  assert.ok(sprint.players[sprint.owner].stamina < 75);
  const p = sprint.players[sprint.controlled];
  p.stamina = 5;
  ticks(sprint, 1, { dx: 1, sprint: true });
  assert.equal(p.exhausted, true);
  assert.equal(p.sprinting, false);
  const before = p.stamina;
  ticks(sprint, 40);
  assert.ok(p.stamina > before);
  assert.equal(p.exhausted, false);
});
test('timed tackle wins possession, costs stamina and cannot be spammed; missed tackle has recovery', () => {
  const m = controlled();
  m.controlled = 4;
  const p = m.players[4];
  p.x = 700;
  p.y = 1332;
  p.tackleCooldown = 0;
  updateMatch(m, 1 / 60, { action: 'tackle' });
  const cooldown = p.tackleCooldown;
  updateMatch(m, 1 / 60, { action: 'tackle' });
  assert.ok(p.tackleCooldown < cooldown);
  ticks(m, 28);
  assert.equal(m.owner, 4);
  assert.equal(m.stats.tackles, 1);
  assert.ok(p.stamina < 100);
  assert.ok(m.players[1].stunned > 0 || m.players[1].immune > 0);
  const miss = controlled();
  miss.controlled = 4;
  const q = miss.players[4];
  q.x = 1000;
  q.y = 1450;
  q.tackleCooldown = 0;
  updateMatch(miss, 1 / 60, { action: 'tackle' });
  ticks(miss, 29);
  assert.equal(miss.stats.tackles, 0);
  assert.ok(q.stunned > 0);
});
test('skill dribble changes movement, grants a short dodge window and has cooldown', () => {
  const m = controlled(),
    p = m.players[m.owner];
  p.skillCooldown = 0;
  const start = { x: p.x, y: p.y };
  updateMatch(m, 1 / 60, { action: 'skill' });
  ticks(m, 10);
  assert.ok(p.skillCooldown > 0);
  assert.ok(p.immune > 0);
  assert.ok(Math.hypot(p.x - start.x, p.y - start.y) > 15);
  assert.ok(p.stamina < 100);
  const cooldown = p.skillCooldown;
  updateMatch(m, 1 / 60, { action: 'skill' });
  assert.ok(p.skillCooldown < cooldown);
});
function keeperShot(speed) {
  const m = createMatch();
  m.kickoffWait = 0;
  m.owner = null;
  m.phase = 'shoot';
  m.players.forEach((p) => {
    p.cooldown = 10;
    p.tackleCooldown = 10;
  });
  const p = m.players[3];
  p.cooldown = 0;
  p.x = 184;
  p.y = 1332;
  p.trackY = 1332;
  p.reactAt = 999;
  m.ball = {
    x: 230,
    y: 1332,
    vx: -speed,
    vy: 0,
    height: 0,
    spin: 0,
    shot: true,
    power: 0.8,
    age: 0,
  };
  for (let i = 0; i < 20 && m.stats.saves === 0; i++) updateMatch(m, 1 / 60);
  return m;
}
test('keeper catches a slow shot and parries a powerful shot into a live rebound', () => {
  const catchBall = keeperShot(350);
  assert.equal(catchBall.stats.saves, 1);
  assert.equal(catchBall.owner, 3);
  assert.equal(catchBall.players[3].action.type, 'catch');
  assert.equal(catchBall.ball.vx, 0);
  const parry = keeperShot(650);
  assert.equal(parry.stats.saves, 1);
  assert.equal(parry.stats.rebounds, 1);
  assert.equal(parry.owner, null);
  assert.ok(parry.ball.vx > 0);
  const x = parry.ball.x;
  updateMatch(parry, 1 / 60);
  assert.ok(parry.ball.x > x);
});
test('a keeper out of position fails to save; scoring follows the current half direction', () => {
  for (const half of [1, 2]) {
    const m = createMatch();
    m.half = half;
    m.kickoffWait = 0;
    m.owner = null;
    m.players.forEach((p) => (p.cooldown = 99));
    m.ball = {
      x: 1282,
      y: 1332,
      vx: 500,
      vy: 0,
      shot: true,
      power: 0.8,
      age: 0,
      spin: 0,
    };
    updateMatch(m, 1 / 60);
    assert.deepEqual(m.score, half === 1 ? [1, 0] : [0, 1]);
  }
});
test('through pass sends the ball into space ahead of the receiver', () => {
  const a = controlled(),
    b = controlled();
  updateMatch(a, 1 / 60, { action: 'pass' });
  updateMatch(b, 1 / 60, { action: 'pass', through: true });
  assert.ok(b.windup.power > a.windup.power);
  assert.notDeepEqual(a.windup.aim, b.windup.aim);
});
test('30/120 Hz render rates produce the same match; hidden tab freezes play and cancels charging', () => {
  const a = createMatch(21),
    b = createMatch(21);
  for (let i = 0; i < 30 * 130; i++) updateMatch(a, 1 / 30);
  for (let i = 0; i < 120 * 130; i++) updateMatch(b, 1 / 120);
  assert.equal(a.status, b.status);
  assert.equal(a.matchNumber, b.matchNumber);
  assert.deepEqual(a.score, b.score);
  assert.deepEqual(a.totals, b.totals);
  assert.ok(Math.hypot(a.ball.x - b.ball.x, a.ball.y - b.ball.y) < 0.001);
  const m = controlled();
  ticks(m, 10, { shootHeld: true });
  const clock = m.clock,
    ball = { ...m.ball };
  ticks(m, 300, { hidden: true, shootHeld: true });
  assert.equal(m.clock, clock);
  assert.deepEqual(m.ball, ball);
  assert.equal(m.charge, null);
});
test('autonomous games include goals at both ends, saves, rebounds, tackles and misses without ball jumps during live play', () => {
  const m = createMatch(8);
  let previous = { ...m.ball },
    oldRound = '1:1';
  const phases = new Set();
  for (let i = 0; i < 60 * 600; i++) {
    updateMatch(m, 1 / 60);
    const round = `${m.matchNumber}:${m.half}`;
    if (round === oldRound)
      assert.ok(
        Math.hypot(m.ball.x - previous.x, m.ball.y - previous.y) < 13,
        `ball jumped: ${m.phase}`,
      );
    oldRound = round;
    previous = { ...m.ball };
    phases.add(m.phase);
    for (const p of m.players)
      assert.ok(p.x >= 138 && p.x <= 1300 && p.y >= 1190 && p.y <= 1475);
  }
  assert.ok(m.goalTotals.every((n) => n > 0));
  for (const key of [
    'passes',
    'shots',
    'saves',
    'rebounds',
    'tackles',
    'posts',
  ])
    assert.ok(m.totals[key] > 0, key);
  assert.ok(m.totals.shots > m.totals.goals);
  assert.ok(m.finishedMatches >= 4);
  assert.ok(phases.has('rebound'));
});

test('sprinting beside the goal keeps the ball in bounds so the next shot can still score', () => {
  const m = controlled();
  m.players.forEach((p) => (p.cooldown = 99));
  ticks(m, 240, { dx: 1, sprint: true });
  assert.ok(m.ball.x < 1285);
  assert.ok(m.ball.y >= 1175 && m.ball.y <= 1490);
  ticks(m, 30, { shootHeld: true });
  updateMatch(m, 1 / 60, { shootHeld: false });
  ticks(m, 20);
  assert.equal(m.score[0], 1);
});
test('a held shot canceled by halftime cannot fire accidentally at the next kickoff', () => {
  const m = controlled();
  m.mustReleaseShoot = true;
  updateMatch(m, 1 / 60, { action: 'releaseShot', power: 1 });
  ticks(m, 20);
  assert.equal(m.stats.shots, 0);
  updateMatch(m, 1 / 60, { shootHeld: true });
  assert.ok(m.charge);
});

test('a received teammate pass earns an assist when its recipient scores', () => {
  const m = controlled();
  m.controlled = 0;
  m.owner = null;
  m.players.forEach((p) => (p.cooldown = 99));
  Object.assign(m.players[0], { x: 1220, y: 1332, cooldown: 0 });
  m.lastTouch = 1;
  m.lastPass = { from: 1, to: null, time: 0 };
  Object.assign(m.ball, { x: 1210, y: 1332, vx: 100, vy: 0, shot: false });
  ticks(m, 1);
  assert.equal(m.owner, 0);
  assert.equal(m.lastPass.to, 0);
  ticks(m, 30, { shootHeld: true });
  ticks(m, 40, { shootHeld: false });
  assert.equal(m.score[0], 1);
  assert.equal(m.players[0].stats.goals, 1);
  assert.equal(m.players[1].stats.assists, 1);
  assert.equal(m.totals.assists, 1);
});

test('Santai charges sooner and allows longer sprints than Sengit', () => {
  const easy = controlled(),
    hard = controlled();
  easy.difficulty = 'santai';
  ticks(easy, 36, { shootHeld: true });
  ticks(hard, 36, { shootHeld: true });
  assert.equal(easy.charge.power, 1);
  assert.ok(hard.charge.power < 0.7);
  const sprintEasy = controlled(),
    sprintHard = controlled();
  sprintEasy.difficulty = 'santai';
  ticks(sprintEasy, 120, { dx: 1, sprint: true });
  ticks(sprintHard, 120, { dx: 1, sprint: true });
  assert.ok(
    sprintEasy.players[sprintEasy.controlled].stamina >
      sprintHard.players[sprintHard.controlled].stamina + 20,
  );
});
test('Santai assists a forward shot but preserves shots deliberately aimed away from goal', () => {
  function shot(difficulty, aim) {
    const m = controlled();
    m.difficulty = difficulty;
    const p = m.players[m.owner];
    p.x = 950;
    p.y = 1332;
    p.aim = aim;
    m.ball.x = 962;
    m.ball.y = 1330;
    updateMatch(m, 1 / 60, { action: 'releaseShot', power: 0.5 });
    return m.windup.aim;
  }
  const easy = shot('santai', { x: 0.96, y: 0.28 });
  const hard = shot('sengit', { x: 0.96, y: 0.28 });
  assert.ok(Math.abs(easy.y) < Math.abs(hard.y) / 2);
  const away = shot('santai', { x: -1, y: 0 });
  assert.ok(away.x < -0.99);
});
test('Santai gives a visitor 1.6 seconds of tackle protection after receiving the ball', () => {
  const m = controlled();
  m.difficulty = 'santai';
  const p = m.players[m.controlled];
  m.owner = null;
  p.cooldown = 0;
  Object.assign(m.ball, { x: p.x, y: p.y, vx: 0, vy: 0, shot: false });
  ticks(m, 1);
  assert.equal(m.owner, m.controlled);
  assert.equal(p.immune, 1.6);
  ticks(m, 60);
  assert.equal(m.owner, m.controlled);
  assert.ok(p.immune > 0.59);
  ticks(m, 37);
  assert.equal(p.immune, 0);
});
