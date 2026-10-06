import { shotScores } from './exploration.js';

export function createExploration(scene) {
  const art = scene.add.graphics();
  const dream = scene.add.graphics().setDepth(910);
  const snakeLabel = scene.add
    .text(2275, 390, 'Jekek', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ffedc2',
      backgroundColor: '#554a36',
      padding: { x: 4, y: 2 },
    })
    .setOrigin(0.5)
    .setDepth(601);
  const anglers = [1300, 1390, 1480].map((y, i) =>
    scene.makeActor(
      `angler-${i}`,
      1640,
      y,
      { skin: i, outfit: i, gender: i === 1 ? 'female' : 'male' },
      1.15,
    ),
  );
  const homes = [
    [570, 1295],
    [800, 1375],
    [380, 1400],
    [1050, 1260],
    [1120, 1410],
    [220, 1330],
  ];
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
    art,
    dream,
    snakeLabel,
    anglers,
    players,
    homes,
    cheer,
    water,
    snakeTime: 0,
    trail: [],
    ball: { x: 570, y: 1295 },
    owner: 0,
    passes: 0,
    phase: 'dribble',
    phaseTime: 0,
    lastKick: 0,
    seen: new Set(),
    footballActive: false,
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
  state.snakeTime += dt;
  const g = state.art;
  g.clear();
  g.setDepth(600);
  // A sampled trail makes the body follow its head instead of rotating a rigid sprite.
  const cycle = state.snakeTime % 22000;
  const angle = (Math.min(cycle, 19000) / 19000) * Math.PI * 2;
  const head = {
    x: 2050 + 225 * Math.cos(angle),
    y: 410 + 88 * Math.sin(angle) + 12 * Math.sin(angle * 3),
  };
  if (!state.trail.length)
    for (let i = 0; i < 65; i++)
      state.trail.push({ x: head.x - i * 2, y: head.y });
  if (
    !reduced &&
    cycle < 19000 &&
    Math.hypot(head.x - state.trail[0].x, head.y - state.trail[0].y) > 2
  ) {
    state.trail.unshift(head);
    state.trail.length = 65;
  }
  // Reduced motion keeps the python resting; normal motion includes a three-second pause.
  for (let i = state.trail.length - 1; i >= 0; i--) {
    const p = state.trail[i],
      size = Math.max(4, 17 - i * 0.2);
    g.fillStyle(0x513529);
    g.fillRect(
      Math.round(p.x - size / 2),
      Math.round(p.y - size / 2),
      size,
      size,
    );
    g.fillStyle(0xd8ad62);
    g.fillRect(
      Math.round(p.x - size / 2 + 2),
      Math.round(p.y - size / 2 + 2),
      size - 3,
      size - 3,
    );
    if (i % 4 < 2) {
      g.fillStyle(0x765039);
      g.fillRect(Math.round(p.x - 3), Math.round(p.y - 4), 6, 8);
      g.fillStyle(0x2f2825);
      g.fillRect(Math.round(p.x), Math.round(p.y - 2), 4, 4);
    }
  }
  const h = state.trail[0],
    neck = state.trail[3];
  const heading = Math.atan2(h.y - neck.y, h.x - neck.x);
  const point = (x, y) => ({
    x: Math.round(h.x + x * Math.cos(heading) - y * Math.sin(heading)),
    y: Math.round(h.y + x * Math.sin(heading) + y * Math.cos(heading)),
  });
  g.fillStyle(0x654531);
  g.fillPoints(
    [
      point(-10, -8),
      point(9, -6),
      point(13, -2),
      point(13, 2),
      point(9, 6),
      point(-10, 8),
    ],
    true,
  );
  g.fillStyle(0xc79c60);
  g.fillPoints(
    [point(-8, -5), point(8, -4), point(10, 0), point(8, 4), point(-8, 5)],
    true,
  );
  g.fillStyle(0x241e1b);
  for (const side of [-1, 1]) {
    const eye = point(5, side * 5);
    g.fillRect(eye.x, eye.y, 2, 2);
  }
  if (!reduced && cycle % 2700 < 300) {
    const a = point(12, 0),
      b = point(20, 0),
      c = point(23, -2),
      d = point(23, 2);
    g.lineStyle(1, 0xb86d6c);
    g.lineBetween(a.x, a.y, b.x, b.y);
    g.lineBetween(b.x, b.y, c.x, c.y);
    g.lineBetween(b.x, b.y, d.x, d.y);
  }
  const camera = scene.cameras.main.worldView;
  g.setVisible(
    camera.right > 1750 &&
      camera.x < 2360 &&
      camera.bottom > 280 &&
      camera.y < 530,
  );
  state.snakeLabel.setPosition(h.x, h.y - 25).setVisible(g.visible);
  if (Math.hypot(scene.player.image.x - h.x, scene.player.image.y - h.y) < 80)
    discover('jekek');
  state.dream.clear();
  const isNight = darkness > 0.65;
  if (isNight) {
    const x = 2050,
      y = 865 + (reduced ? 0 : Math.sin(time * 0.0018) * 6),
      d = state.dream;
    d.fillStyle(0x3f3c62, 0.35);
    d.fillEllipse(x, y + 38, 68, 18);
    d.fillStyle(0x232337);
    d.fillTriangle(x - 17, y - 3, x - 38, y + 23, x - 20, y + 12);
    d.fillTriangle(x + 16, y - 3, x + 35, y + 19, x + 21, y + 12);
    d.fillRect(x - 16, y - 19, 32, 45);
    d.fillTriangle(x - 15, y + 13, x - 26, y + 44, x, y + 24);
    d.fillTriangle(x + 15, y + 13, x + 20, y + 44, x, y + 24);
    d.fillStyle(0xb43f58);
    d.fillTriangle(x - 23, y - 10, x, y + 6, x + 23, y - 10);
    d.fillRect(x - 20, y - 12, 40, 8);
    d.fillStyle(0x292839);
    d.fillRect(x - 12, y - 36, 25, 24);
    d.fillStyle(0xe6e9da);
    d.fillTriangle(x - 15, y - 27, x - 2, y - 59, x + 28, y - 44);
    d.fillRect(x - 8, y - 42, 28, 13);
    d.fillTriangle(x + 8, y - 31, x + 28, y - 44, x + 15, y - 19);
    d.fillStyle(0x71d6dd);
    d.fillRect(x - 8, y - 25, 7, 3);
  }
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
  state.phaseTime += reduced ? 0 : dt;
  const movingTime = reduced ? 0 : time;
  state.players.forEach((actor, i) => {
    const [hx, hy] = state.homes[i];
    const target = {
      x: hx + Math.sin(movingTime * 0.00065 + i) * 75,
      y: hy + Math.cos(movingTime * 0.0008 + i) * 35,
    };
    if (!reduced)
      scene.move(
        actor,
        target.x - actor.image.x,
        target.y - actor.image.y,
        delta,
        0.07 + (i % 2) * 0.025,
      );
  });
  if (state.shot) {
    state.shot.t += dt / 1000;
    const t = Math.min(state.shot.t / 0.9, 1);
    state.ball = {
      x: 740 + 550 * t,
      y: 1332 + (state.shot.goal ? 0 : 75) * t - Math.sin(t * Math.PI) * 30,
    };
    if (t === 1) {
      live.onShot?.(state.shot.goal);
      state.cheer
        .setText(state.shot.goal ? 'GOAL!' : 'JUST WIDE!')
        .setVisible(true);
      state.phase = 'celebrate';
      state.phaseTime = 0;
      state.shot = null;
    }
  } else if (state.phase === 'dribble') {
    const a = state.players[state.owner].image;
    state.ball = { x: a.x + 14, y: a.y - 2 };
    if (state.phaseTime > 2200) {
      state.from = { ...state.ball };
      state.to = (state.owner + 1) % 4;
      state.phase = state.passes >= 3 ? 'shoot' : 'pass';
      state.phaseTime = 0;
    }
  } else if (state.phase === 'pass' || state.phase === 'shoot') {
    const t = Math.min(state.phaseTime / 950, 1),
      target =
        state.phase === 'shoot'
          ? { x: 1290, y: 1332 }
          : {
              x: state.players[state.to].image.x + 14,
              y: state.players[state.to].image.y - 2,
            };
    state.ball = {
      x: state.from.x + (target.x - state.from.x) * t,
      y:
        state.from.y +
        (target.y - state.from.y) * t -
        Math.sin(t * Math.PI) * 12,
    };
    if (t === 1) {
      if (state.phase === 'shoot') {
        state.cheer.setText('GOAL!').setVisible(true);
        state.phase = 'celebrate';
      } else {
        state.owner = state.to;
        state.passes++;
        state.phase = 'dribble';
      }
      state.phaseTime = 0;
    }
  } else if (state.phaseTime > 1800) {
    state.cheer.setVisible(false);
    state.owner = 0;
    state.passes = 0;
    state.phase = 'dribble';
    state.phaseTime = 0;
  }
  const b = state.ball;
  state.water.fillStyle(0xf2f0d4);
  state.water.fillCircle(b.x, b.y, 5);
  state.water.fillStyle(0x2b4345);
  state.water.fillRect(b.x - 2, b.y - 2, 3, 3);
}
