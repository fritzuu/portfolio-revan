import { t } from '../i18n/core.js';
import { drawGroveAtmosphere } from './groveArt.js';
import { readMovement } from './keyboard';
import { drawGardenGateLeaves } from './gardenArt.js';
import { gateUnlocked } from './exploration.js';
import { createCreatures, updateCreatures } from './creatureSprites.js';
import { FOOTBALL_HOMES, createMatch, updateMatch } from './football.js';

export function createExploration(scene) {
  const creatures = createCreatures(scene);
  const anglers = [1300, 1390, 1480].map((y, i) =>
    scene.makeActor(
      `angler-${i}`,
      1640,
      y,
      { skin: i, outfit: i, gender: i === 1 ? 'female' : 'male' },
      1.15,
    ),
  );
  const homes = FOOTBALL_HOMES;
  const players = homes.map(([x, y], i) => {
    const actor = scene.makeActor(
      `football-${i}`,
      x,
      y,
      {
        skin: i % 3,
        outfit: i % 4,
        jersey: i < 4 ? 'messi' : 'yamal',
        jerseyNumber:
          i === 0 ? '10' : i === 4 ? '19' : i % 4 === 3 ? '1' : String(i + 2),
      },
      1.15,
    );
    if (i === 0 || i === 4)
      actor.label = scene.add
        .text(x, y - 52, i === 0 ? 'Messi · 10' : 'Lamine Yamal · 19', {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#fff3cd',
          backgroundColor: '#284f47',
          padding: { x: 4, y: 3 },
        })
        .setOrigin(0.5);
    return actor;
  });
  const gardener = scene.makeActor(
    'gardener',
    2310,
    575,
    { skin: 1, outfit: 2, gender: 'female' },
    1.15,
  );
  gardener.path = [];
  gardener.stop = 0;
  gardener.route = [
    { x: 2310, y: 575 },
    { x: 1950, y: 580 },
    { x: 1820, y: 550 },
    { x: 1810, y: 640 },
  ];
  const spectators = [400, 475, 550, 900, 975, 1050].map((x, i) =>
    scene.makeActor(
      `fan-${i}`,
      x,
      1140,
      { skin: i % 3, outfit: i % 4, gender: i % 2 ? 'female' : 'male' },
      1.1,
    ),
  );
  const cheer = scene.add
    .text(720, 1250, 'GOAL!', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#fff0a2',
      backgroundColor: '#284f47',
      padding: { x: 8, y: 4 },
    })
    .setOrigin(0.5)
    .setDepth(1510)
    .setVisible(false);
  const water = scene.add.graphics().setDepth(1499);
  return {
    creatures,
    gardener,
    spectators,
    anglers,
    players,
    homes,
    cheer,
    water,
    ambiance: scene.add.graphics().setDepth(1105),
    groveFog: scene.add.graphics().setDepth(740),
    groveRunes: scene.add.graphics().setDepth(2),
    gate: scene.add.graphics().setDepth(514),
    gateOpen: 0,
    ball: { x: 570, y: 1295 },
    lastKick: 0,
    seen: new Set(),
    footballActive: false,
    match: createMatch(),
  };
}
export function updateExploration(
  scene,
  state,
  time,
  delta,
  darkness,
  live,
  reduced,
) {
  const dt = Math.min(delta, 100);
  state.match.difficulty =
    live.footballDifficulty === 'sengit' ? 'sengit' : 'santai';
  const mode = live.footballActive ? live.footballMode || 'watch' : null;
  if (mode !== state.mode) {
    scene.gameKeyboard.clear();
    const cam = scene.cameras.main;
    if (!state.mode && mode)
      state.returnPosition = {
        x: scene.player.image.x,
        y: scene.player.image.y,
      };
    state.mode = mode;
    state.match.controlled = mode === 'messi' ? 2 : mode === 'yamal' ? 6 : null;
    state.players.forEach((a, i) => {
      a.image.setVisible(i !== state.match.controlled);
      a.label?.setVisible(i !== state.match.controlled);
    });
    scene.player.path = [];
    scene.cancelTravel();
    state.match.charge = null;
    state.match.mustReleaseShoot = false;
    scene.player.config.footballAction = null;
    scene.player.poseKey = 'idle';
    scene.player.image.setAngle(0).setScale(scene.player.baseScale);
    scene.move(scene.player, 0, 0, delta, 0);
    if (mode === 'training') {
      scene.player.image.setPosition(1410, 1332);
      state.practice = { x: 1422, y: 1330 };
      state.shot = null;
      state.shotResultUntil = 0;
      delete state.practiceResult;
    } else if (state.match.controlled !== null) {
      const p = state.match.players[state.match.controlled];
      scene.player.image.setPosition(p.x, p.y);
    } else if (!mode && state.returnPosition)
      scene.player.image.setPosition(
        state.returnPosition.x,
        state.returnPosition.y,
      );
    if (mode) {
      cam.stopFollow();
      cam.setZoom(
        mode === 'watch'
          ? Math.min(1.2, cam.width / 1250, cam.height / 540)
          : window.innerWidth < 760
            ? 1.65
            : 2,
      );
      cam.centerOn(mode === 'training' ? 1440 : 720, 1332);
    } else {
      cam.setZoom(window.innerWidth < 760 ? 1.8 : 2);
      cam.startFollow(
        scene.player.image,
        false,
        reduced ? 1 : 0.09,
        reduced ? 1 : 0.09,
      );
    }
  }
  const opened = gateUnlocked(live.discoveries || []);
  state.gateOpen +=
    ((opened ? 1 : 0) - state.gateOpen) * Math.min(1, dt / (reduced ? 1 : 350));
  state.gate.clear();
  drawGardenGateLeaves(state.gate, state.gateOpen);
  // Gate leaves swing into the pillars. The unlocked shortcut is a destination action,
  // not an invisible wall across the only district street.
  state.ambiance.clear();
  if (!reduced) {
    for (let i = 0; i < 7; i++) {
      const x = 1780 + i * 78 + Math.sin(time * 0.0007 + i) * 18,
        y = 340 + (i % 3) * 75 + Math.cos(time * 0.001 + i) * 12;
      state.ambiance.fillStyle(i % 2 ? 0xf5bf7b : 0xe3d5f4, 0.75);
      state.ambiance.fillEllipse(
        x,
        y,
        3 + Math.abs(Math.sin(time * 0.01 + i)) * 5,
        3,
      );
    }
    for (let i = 0; i < 2; i++) {
      const bx = 1880 + ((time * 0.012 + i * 190) % 390),
        by = 735 + Math.sin(time * 0.001 + i) * 8;
      state.ambiance.lineStyle(2, 0x496860, 0.75);
      state.ambiance.lineBetween(
        bx - 4,
        by - Math.abs(Math.sin(time * 0.007 + i)) * 4,
        bx,
        by,
      );
      state.ambiance.lineBetween(
        bx,
        by,
        bx + 4,
        by - Math.abs(Math.sin(time * 0.007 + i)) * 4,
      );
    }
  }
  drawGroveAtmosphere(
    { fog: state.groveFog, runes: state.groveRunes, ash: state.ambiance },
    time,
    darkness,
    scene.player.image,
    reduced,
  );
  const discover = (id) => {
    if (!state.seen.has(id)) {
      state.seen.add(id);
      live.onDiscover?.(id);
    }
  };
  if (!state.gardener.path.length && time > (state.gardener.pauseUntil || 0)) {
    const target =
      state.gardener.route[state.gardener.stop++ % state.gardener.route.length];
    state.gardener.path = scene.routeTo(state.gardener.image, target);
    state.gardener.pauseUntil = time + 3500;
  }
  scene.followPath(state.gardener, delta, 0.055);
  state.spectators.forEach((actor, i) => {
    actor.direction = 'down';
    actor.config.footballAction = state.match.goal
      ? { type: 'celebrate', progress: reduced ? 1 : (time % 1200) / 1200 }
      : null;
    actor.poseKey = actor.config.footballAction
      ? `celebrate:${Math.floor(time / 100) % 12}`
      : 'idle';
    scene.move(actor, 0, 0, delta, 0);
    if (!reduced && state.match.goal)
      actor.image.y = 1140 - Math.abs(Math.sin(time * 0.006 + i)) * 2;
    else actor.image.y = 1140;
  });
  const creature = updateCreatures(
    scene,
    state.creatures,
    delta,
    darkness,
    reduced,
  );
  const isNight = creature.night;
  if (
    Math.hypot(
      scene.player.image.x - creature.x,
      scene.player.image.y - creature.y,
    ) < 100
  )
    discover('jekek');
  if (isNight !== state.wasNight) {
    live.onNight?.(isNight);
    state.wasNight = isNight;
  }
  if (
    isNight &&
    Math.hypot(scene.player.image.x - 2050, scene.player.image.y - 865) < 110
  )
    discover('dream');
  state.water.clear();
  if (!state.gardener.path.length && time < state.gardener.pauseUntil) {
    const g = state.gardener.image;
    state.gardener.direction = 'up';
    state.water.fillStyle(0x96b9c3);
    state.water.fillRect(g.x + 12, g.y - 26, 8, 6);
    if (!reduced)
      for (let i = 0; i < 3; i++) {
        state.water.fillStyle(0x81d8e7, 0.65);
        state.water.fillRect(
          g.x + 18 + i * 3,
          g.y - 19 + ((time * 0.015 + i * 5) % 14),
          2,
          3,
        );
      }
  }
  state.anglers.forEach((actor, i) => {
    const t = ((time + i * 3200) % 13000) / 1000;
    actor.direction = 'right';
    scene.move(actor, 0, 0, delta, 0);
    const x = actor.image.x,
      y = actor.image.y,
      bx = x + 78,
      by = y - 22;
    const tipY =
      y -
      52 +
      (reduced
        ? 0
        : t < 1
          ? Math.sin(t * Math.PI) * -12
          : t > 9
            ? Math.sin(t * 5) * 5
            : 0);
    const a = state.water;
    a.lineStyle(3, 0xd0af6c);
    a.lineBetween(x + 7, y - 22, x + 26, tipY);
    if (t > 1 && t < 10) {
      a.lineStyle(1, 0xe8edd0);
      a.lineBetween(x + 26, tipY, bx, by);
      a.fillStyle(0xf48574);
      a.fillRect(bx, by + (reduced ? 0 : Math.sin(time * 0.005 + i) * 2), 4, 5);
      a.lineStyle(1, 0xa7dce0, 0.7);
      a.strokeEllipse(bx, by + 5, 18, 5);
    }
    if (t > 10 && t < 12) {
      a.fillStyle(0xf6cb72);
      a.fillEllipse(x + 35, y - 45, 13, 7);
      a.fillTriangle(x + 40, y - 45, x + 48, y - 51, x + 48, y - 39);
    }
  });
  if (
    Math.hypot(scene.player.image.x - 1640, scene.player.image.y - 1390) < 170
  )
    discover('shore');
  const visitor = scene.player.image;
  if (
    visitor.x > 155 &&
    visitor.x < 1285 &&
    visitor.y > 1175 &&
    visitor.y < 1490
  )
    discover('football');
  const keys = scene.keys,
    c = live.controls || {};
  const { dx, dy } = readMovement(keys, c);
  const participating = mode === 'messi' || mode === 'yamal';
  let action = null,
    through = false,
    power;
  if (!keys.Q.isDown && state.qDown) {
    action = 'pass';
    through = time - (state.passStarted || time) > 0.35 * 1000;
  }
  if (keys.Q.isDown && !state.qDown) state.passStarted = time;
  if (participating && keys.E.isDown && !state.tackleDown) action = 'tackle';
  if (participating && keys.F.isDown && !state.skillDown) action = 'skill';
  state.qDown = keys.Q.isDown;
  state.tackleDown = keys.E.isDown;
  state.skillDown = keys.F.isDown;
  const kick = live.kick;
  if (kick && kick.stamp !== state.lastKick) {
    state.lastKick = kick.stamp;
    if (mode === 'training' && !state.shot) {
      const aim = kick.aim ?? 50;
      state.shot = {
        t: 0,
        x: 1422,
        y: 1330,
        vx: 190,
        vy: (aim - 50) * 3,
        keeperY: 1332,
      };
    } else {
      action = kick.type;
      through = kick.through;
      power = kick.power;
    }
  }
  updateMatch(state.match, dt / 1000, {
    dx: participating ? dx : 0,
    dy: participating ? dy : 0,
    action: participating ? action : null,
    through,
    power,
    shootHeld: participating && !!(keys.SPACE.isDown || c.shoot),
    sprint: participating && !!(keys.SHIFT.isDown || c.sprint),
    hidden: document.hidden,
  });
  const roundKey = `${state.match.matchNumber}:${state.match.half}:${state.match.status}:${state.match.kickoffNumber}`;
  if (roundKey !== state.roundKey) {
    if (state.roundKey) {
      live.onSound?.('whistle');
      if (mode && state.match.status === 'playing') {
        if (state.match.controlled !== null) {
          const p = state.match.players[state.match.controlled];
          scene.cameras.main.centerOn(p.x, p.y + 24);
        }
        scene.cameras.main.fadeIn(reduced ? 0 : 300, 24, 49, 44);
      }
    }
    state.roundKey = roundKey;
  }
  const totals = state.match.totals;
  for (const [counter, sound] of [
    ['shots', 'kick'],
    ['passes', 'kick'],
    ['tackles', 'tackle'],
    ['saves', 'save'],
    ['posts', 'post'],
    ['goals', 'goal'],
  ]) {
    if (state.soundCounts && totals[counter] > state.soundCounts[counter])
      live.onSound?.(sound);
  }
  state.soundCounts = { ...totals };
  const sync = (actor, p) => {
    actor.config.footballAction = p.action;
    actor.poseKey = p.action
      ? `${p.action.type}:${Math.floor(p.action.progress * 12)}`
      : 'idle';
    actor.direction = p.facing;
    actor.lockFacing = true;
    scene.move(
      actor,
      p.x - actor.image.x,
      p.y - actor.image.y,
      delta,
      Math.hypot(p.x - actor.image.x, p.y - actor.image.y) /
        Math.max(Math.min(delta, 40), 1),
    );
    actor.lockFacing = false;
    actor.image.setScale(
      actor.baseScale,
      actor.baseScale *
        (p.action?.type === 'tackle' && !reduced
          ? 1 - Math.sin(p.action.progress * Math.PI) * 0.1
          : 1),
    );
    if (p.action?.type === 'tackle' && !reduced)
      actor.image.setAngle(
        (p.facing === 'left' ? -1 : 1) *
          Math.sin(p.action.progress * Math.PI) *
          12,
      );
    else if (p.action?.type === 'skill' && !reduced)
      actor.image.setAngle(Math.sin(p.action.progress * Math.PI * 2) * 6);
    else if (p.action?.type === 'save' && !reduced)
      actor.image.setAngle(
        (p.facing === 'left' ? -1 : 1) *
          Math.sin(p.action.progress * Math.PI) *
          32,
      );
    else if (p.action?.type === 'stumble' && !reduced)
      actor.image.setAngle(Math.sin(p.action.progress * Math.PI * 2) * 8);
    else actor.image.setAngle(0);
  };
  state.players.forEach((actor, i) => sync(actor, state.match.players[i]));
  if (state.match.controlled !== null) {
    const p = state.match.players[state.match.controlled];
    sync(scene.player, p);
    const cam = scene.cameras.main;
    const limit = window.innerWidth < 760 ? 40 : 90;
    const targetX =
      p.x +
      Math.max(-limit, Math.min(limit, (state.match.ball.x - p.x) * 0.16));
    cam.centerOn(
      cam.midPoint.x + (targetX - cam.midPoint.x) * (reduced ? 1 : 0.06),
      p.y + Math.max(-20, Math.min(20, (state.match.ball.y - p.y) * 0.1)) + 24,
    );
    state.water.lineStyle(2, p.team === 0 ? 0x81c6ff : 0xffb5a1);
    state.water.strokeEllipse(p.x, p.y + 5, 24, 7);
  }
  state.cheer.setText(t(state.match.event)).setVisible(state.match.goal);
  if (participating && state.match.charge) {
    const p = state.match.players[state.match.controlled],
      x = p.x - 19,
      y = p.y + 15,
      power = state.match.charge.power;
    state.water.fillStyle(0x284b43, 0.9);
    state.water.fillRoundedRect(x - 2, y - 2, 42, 9, 3);
    state.water.fillStyle(power > 0.78 ? 0xee9277 : 0xffd184);
    state.water.fillRect(x, y, Math.round(38 * power), 5);
    state.water.lineStyle(1, 0xffefc2, 0.75);
    state.water.lineBetween(
      p.x,
      p.y - 10,
      p.x + p.aim.x * (24 + power * 20),
      p.y - 10 + p.aim.y * (24 + power * 20),
    );
  }
  if (mode && time > (state.nextReport || 0)) {
    state.nextReport = time + 200;
    live.onMatchState?.({
      score: [...state.match.score],
      clock: state.match.remaining,
      half: state.match.half,
      status: state.match.status,
      charging: !!state.match.charge,
      power: state.match.charge?.power || 0,
      stamina:
        state.match.controlled !== null
          ? Math.round(state.match.players[state.match.controlled].stamina)
          : 100,
      tackleReady:
        state.match.status === 'playing' &&
        state.match.controlled !== null &&
        state.match.players[state.match.controlled].tackleCooldown === 0,
      skillReady:
        state.match.status === 'playing' &&
        state.match.controlled !== null &&
        state.match.owner === state.match.controlled &&
        state.match.players[state.match.controlled].skillCooldown === 0,
      result: state.match.status === 'fulltime' ? state.match.lastResult : null,
      visitorStats:
        state.match.controlled !== null
          ? { ...state.match.players[state.match.controlled].stats }
          : null,
      event: state.match.event,
      hasBall:
        state.match.controlled !== null &&
        state.match.owner === state.match.controlled,
    });
  }
  const drawBall = (b) => {
    state.water.fillStyle(0x233e43, 0.25);
    state.water.fillEllipse(b.x, b.y + 4, 11, 4);
    state.water.fillStyle(0xf2f0d4);
    state.water.fillCircle(b.x, b.y - (b.height || 0), 5);
    state.water.fillStyle(0x2b4345);
    state.water.fillRect(
      b.x - 2 + Math.round(Math.sin(b.spin || 0)),
      b.y - 2 - (b.height || 0),
      3,
      3,
    );
  };
  drawBall(state.match.ball);
  if (mode === 'training') {
    let b = state.practice;
    if (state.shot) {
      const shot = state.shot;
      shot.t += dt / 1000;
      scene.player.direction = 'right';
      scene.player.config.footballAction =
        shot.t < 0.24 ? { type: 'kick', progress: shot.t / 0.24 } : null;
      scene.player.poseKey = scene.player.config.footballAction
        ? `kick:${Math.floor(shot.t * 40)}`
        : 'idle';
      scene.move(scene.player, 0, 0, delta, 0);
      if (shot.t > 0.24) {
        shot.x += (shot.vx * dt) / 1000;
        shot.y += (shot.vy * dt) / 1000;
      }
      b = shot;
      if (shot.x >= 1500) {
        const goal = shot.y > 1295 && shot.y < 1370;
        state.practiceResult = goal;
        state.practice = { x: shot.x, y: shot.y };
        state.shot = null;
        state.shotResultUntil = time + 600;
        scene.player.config.footballAction = null;
        scene.player.poseKey = 'idle';
        scene.move(scene.player, 0, 0, delta, 0);
      }
    } else if (time > state.shotResultUntil) {
      // Visible ball return rather than a jump back to the foot.
      const d = Math.hypot(state.practice.x - 1422, state.practice.y - 1330),
        f = Math.min(1, (dt * 0.2) / Math.max(1, d));
      state.practice.x += (1422 - state.practice.x) * f;
      state.practice.y += (1330 - state.practice.y) * f;
      if (d < 0.5 && state.practiceResult !== undefined) {
        live.onShot?.(state.practiceResult);
        delete state.practiceResult;
      }
    }
    drawBall(b);
  }
  // A handful of residents watch from outside the touchline and react to either team.
  if (state.match.goal) {
    state.ambiance.fillStyle(0xffd486, 0.8);
    for (let i = 0; i < 6; i++)
      state.ambiance.fillRect(
        450 + i * 75,
        1138 - (reduced ? 0 : Math.sin(time * 0.008 + i) * 4),
        3,
        6,
      );
  }
}
