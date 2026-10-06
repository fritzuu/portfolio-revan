import { shotScores } from './exploration.js';
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
        jersey: i === 0 ? 'messi' : i === 1 ? 'yamal' : undefined,
      },
      1.15,
    );
    if (i < 2)
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
    anglers,
    players,
    homes,
    cheer,
    water,
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
  if (live.footballActive !== state.footballActive) {
    const cam = scene.cameras.main;
    state.footballActive = live.footballActive;
    if (live.footballActive) {
      cam.stopFollow();
      cam.setZoom(Math.min(1.2, cam.width / 1250, cam.height / 660));
      cam.centerOn(720, 1332);
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
  const discover = (id) => {
    if (!state.seen.has(id)) {
      state.seen.add(id);
      live.onDiscover?.(id);
    }
  };
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
  const kick = live.kick;
  if (kick && kick.stamp !== state.lastKick) {
    state.lastKick = kick.stamp;
    state.shot = {
      t: 0,
      start: { x: 740, y: 1332 },
      goal: shotScores(kick.aim),
    };
  }
  if (!state.shot && !live.footballActive && !reduced)
    updateMatch(state.match, dt / 1000);
  state.players.forEach((actor, i) => {
    const p = state.match.players[i],
      dx = p.x - actor.image.x,
      dy = p.y - actor.image.y;
    actor.config.footballAction = p.action;
    actor.poseKey = p.action
      ? `${p.action.type}:${Math.floor(p.action.progress * 12)}`
      : 'idle';
    actor.direction = p.facing;
    scene.move(
      actor,
      dx,
      dy,
      delta,
      Math.hypot(dx, dy) / Math.max(Math.min(delta, 40), 1),
    );
  });
  if (!state.shot)
    state.ball = live.footballActive
      ? time < (state.shotResultUntil || 0)
        ? state.ball
        : { x: 752, y: 1330 }
      : state.match.ball;
  state.cheer.setVisible(state.match.goal);
  if (state.shot) {
    state.shot.t += dt / 1000;
    const progress = Math.min(Math.max(state.shot.t - 0.3, 0) / 0.9, 1);
    const p = scene.player;
    p.config.footballAction =
      state.shot.t < 0.3
        ? { type: 'kick', progress: state.shot.t / 0.3 }
        : null;
    p.poseKey = p.config.footballAction
      ? `kick:${Math.floor(p.config.footballAction.progress * 12)}`
      : 'idle';
    p.direction = 'right';
    scene.move(p, 0, 0, delta, 0);
    state.ball = {
      x: 752 + (1292 - 752) * progress,
      y: 1330 + (state.shot.goal ? 0 : 75) * progress,
      height: Math.sin(progress * Math.PI) * 18,
      spin: state.shot.t * 15,
    };
    if (progress === 1) {
      live.onShot?.(state.shot.goal);
      state.cheer
        .setText(state.shot.goal ? 'GOAL!' : 'JUST WIDE!')
        .setVisible(true);
      state.shot = null;
      state.shotResultUntil = time + 1600;
      p.config.footballAction = null;
      p.poseKey = 'idle';
      scene.move(p, 0, 0, delta, 0);
    }
  } else if (time < (state.shotResultUntil || 0)) state.cheer.setVisible(true);
  else state.cheer.setText('GOAL!');
  const b = state.ball;
  state.water.fillStyle(0x233e43, 0.25);
  state.water.fillEllipse(b.x, b.y + 4, 11, 4);
  const ballY = b.y - (b.height || 0);
  state.water.fillStyle(0xf2f0d4);
  state.water.fillCircle(b.x, ballY, 5);
  state.water.fillStyle(0x2b4345);
  state.water.fillRect(
    b.x - 2 + Math.round(Math.sin(b.spin || 0)),
    ballY - 2,
    3,
    3,
  );
}
