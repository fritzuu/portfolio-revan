// Darkrai keeps the reference sprite; Jekek uses a small articulated, uncoiled silhouette.
import { createSnake, updateSnake } from './snake.js';
import { drawSnake } from './snakeArt.js';
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
  const body = scene.add.image(x, y, `${key}-pixels`).setScale(size / 128);
  return { body };
}
export function createCreatures(scene) {
  const snakeTexture = scene.textures.createCanvas('jekek-moving', 192, 192);
  snakeTexture.context.imageSmoothingEnabled = false;
  const jekek = scene.add.image(1810, 395, 'jekek-moving').setOrigin(0);
  const darkrai = creature(scene, 'darkrai', 2050, 843, 112);
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
  return {
    jekek,
    snakeTexture,
    snake: createSnake(),
    headImage: scene.textures.get('jekek-source').getSourceImage(),
    darkrai,
    shadows,
    label,
    elapsed: 0,
    nightAlpha: 0,
  };
}
export function updateCreatures(scene, state, delta, darkness, reduced) {
  const dt = Math.min(delta, 100);
  state.elapsed += dt;
  const t = state.elapsed / 1000;
  const { jekek, darkrai, label, shadows } = state;
  if (
    !reduced &&
    Math.hypot(
      scene.player.image.x - state.snake.head.x,
      scene.player.image.y - state.snake.head.y,
    ) < 65 &&
    state.elapsed > (state.watchAgain || 0)
  ) {
    state.snake.rest = 1.5;
    state.watchAgain = state.elapsed + 12000;
  }
  const snake = updateSnake(state.snake, delta, reduced),
    { x, y } = snake.head;
  const visible = scene.cameras.main.worldView.contains(x, y);
  const origin = visible
    ? drawSnake(
        state.snakeTexture.context,
        snake,
        reduced ? 500 : state.elapsed,
        state.headImage,
      )
    : { x: Math.round(x) - 96, y: Math.round(y) - 96 };
  if (visible) state.snakeTexture.refresh();
  jekek
    .setPosition(origin.x, origin.y)
    .setDepth(Math.max(...snake.joints.map((p) => p.y)) + 8);
  label.setPosition(x, y - 23).setDepth(jekek.depth + 1);
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
  shadows.clear();
  shadows.setDepth(1);
  shadows.fillStyle(0x2d493c, 0.2);
  for (const p of snake.joints.filter((_, i) => i % 3 === 0))
    shadows.fillEllipse(p.x, p.y + 3, 7, 3);
  if (state.nightAlpha > 0.01) {
    shadows.fillStyle(0x34314b, 0.2 * state.nightAlpha);
    shadows.fillEllipse(2050, 905, 74 - float, 16);
  }
  return { x, y, night };
}
