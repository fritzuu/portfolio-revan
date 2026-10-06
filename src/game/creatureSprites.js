// Local transparent reference sprites, split into rows for restrained pixel deformation.
function creature(scene, key, x, y, size) {
  const texture = scene.textures.createCanvas(`${key}-pixels`, 128, 128),
    ctx = texture.context;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    scene.textures.get(`${key}-source`).getSourceImage(),
    0,
    0,
    128,
    128,
  );
  texture.refresh();
  const strips = [];
  for (let row = 0; row < 16; row++) {
    texture.add(`row-${row}`, 0, 0, row * 8, 128, 8);
    strips.push(
      scene.add
        .image(0, -64 + row * 8, `${key}-pixels`, `row-${row}`)
        .setOrigin(0.5, 0),
    );
  }
  const body = scene.add.container(x, y, strips).setScale(size / 128);
  return { body, strips };
}
export function createCreatures(scene) {
  const jekek = creature(scene, 'jekek', 2260, 410, 136);
  const darkrai = creature(scene, 'darkrai', 2050, 843, 168);
  const shadows = scene.add.graphics();
  const label = scene.add
    .text(2260, 330, 'Jekek', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ffedc2',
      backgroundColor: '#554a36',
      padding: { x: 4, y: 2 },
    })
    .setOrigin(0.5);
  return { jekek, darkrai, shadows, label, elapsed: 0, nightAlpha: 0 };
}
export function updateCreatures(scene, state, delta, darkness, reduced) {
  const dt = Math.min(delta, 100);
  state.elapsed += dt;
  const t = state.elapsed / 1000,
    cycle = t % 30;
  // The coiled reference remains intact. Slow travel, rest and tiny coil/tail shifts replace the square-segment body.
  const angle = (Math.min(cycle, 25) / 25) * Math.PI * 2;
  const x = reduced ? 1815 : 2050 + 210 * Math.cos(angle),
    y = reduced ? 405 : 410 + 60 * Math.sin(angle);
  const { jekek, darkrai, label, shadows } = state;
  jekek.body.setPosition(Math.round(x), Math.round(y)).setDepth(y + 50);
  jekek.strips.forEach((strip, row) =>
    strip.setX(
      reduced
        ? 0
        : Math.round(Math.sin(t * 2.2 + row * 0.55) * (row < 5 ? 2 : 1)),
    ),
  );
  label.setPosition(x, y - 69).setDepth(y + 51);
  const night = darkness > 0.65;
  state.nightAlpha +=
    ((night ? 1 : 0) - state.nightAlpha) * Math.min(1, dt / 280);
  const float = reduced ? 0 : Math.sin(t * 1.8) * 5;
  darkrai.body
    .setPosition(
      2050 + (reduced ? 0 : Math.round(Math.sin(t * 0.8) * 3)),
      Math.round(843 + float),
    )
    .setDepth(908)
    .setAlpha(state.nightAlpha)
    .setVisible(state.nightAlpha > 0.01);
  darkrai.strips.forEach((strip, row) =>
    strip.setX(
      reduced
        ? 0
        : Math.round(
            Math.sin(t * 1.7 + row * 0.6) * (row < 6 || row > 11 ? 2 : 1),
          ),
    ),
  );
  shadows.clear();
  shadows.setDepth(1);
  shadows.fillStyle(0x2d493c, 0.2);
  shadows.fillEllipse(x, y + 45, 105, 21);
  if (state.nightAlpha > 0.01) {
    shadows.fillStyle(0x34314b, 0.2 * state.nightAlpha);
    shadows.fillEllipse(2050, 905, 74 - float, 16);
  }
  return { x, y, night };
}
