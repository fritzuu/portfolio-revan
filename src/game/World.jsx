import { useEffect, useRef } from 'react';
import {
  drawWorld,
  drawCharacter,
  LOCATIONS,
  OBSTACLES,
  WORLD_SIZE,
} from './art';

export default function World({
  character,
  playing,
  paused,
  controls,
  onNear,
  onVisit,
  reducedMotion,
  onPosition,
  destination,
}) {
  const root = useRef(null);
  const live = useRef({
    paused,
    controls,
    onNear,
    onVisit,
    onPosition,
    destination,
  });
  useEffect(() => {
    live.current = {
      paused,
      controls,
      onNear,
      onVisit,
      onPosition,
      destination,
    };
  }, [paused, controls, onNear, onVisit, onPosition, destination]);
  useEffect(() => {
    let game,
      cancelled = false;
    import('phaser')
      .then(({ default: Phaser }) => {
        if (cancelled) return;
        class City extends Phaser.Scene {
          create() {
            const map = this.textures.createCanvas(
              'city',
              WORLD_SIZE.width,
              WORLD_SIZE.height,
            );
            drawWorld(map.context);
            map.refresh();
            this.add.image(0, 0, 'city').setOrigin(0);
            const avatar = this.textures.createCanvas('visitor', 32, 36);
            drawCharacter(avatar.context, 0, 0, character);
            avatar.refresh();
            this.player = this.add
              .image(770, 520, 'visitor')
              .setOrigin(0.5, 1)
              .setScale(1.25)
              .setDepth(10);
            this.npcs = [];
            LOCATIONS.forEach((l, i) => {
              const tex = this.textures.createCanvas(`npc-${i}`, 32, 36);
              drawCharacter(tex.context, 0, 0, {
                outfit: (i + 1) % 4,
                skin: i % 3,
                gender: i % 2 ? 'female' : 'male',
              });
              tex.refresh();
              this.npcs.push(
                this.add
                  .image(l.doorX + 50, l.doorY + 62, `npc-${i}`)
                  .setOrigin(0.5, 1)
                  .setScale(1.15),
              );
              this.add
                .rectangle(l.doorX, l.doorY + 30, 16, 16, 0xf0d49b, 0.5)
                .setAngle(45);
              this.add
                .text(l.doorX + 50, l.doorY + 10, i === 0 ? 'Revan' : '…', {
                  fontFamily: 'monospace',
                  fontSize: '10px',
                  color: '#fff5d7',
                  backgroundColor: '#384a43',
                  padding: { x: 5, y: 3 },
                })
                .setOrigin(0.5);
            });
            const cam = this.cameras.main;
            cam.setBounds(0, 0, WORLD_SIZE.width, WORLD_SIZE.height);
            cam.setZoom(playing ? (window.innerWidth < 760 ? 1.8 : 2) : 1.65);
            if (playing) cam.startFollow(this.player, true);
            else cam.centerOn(650, 410);
            this.keys = this.input.keyboard.addKeys(
              'W,A,S,D,UP,DOWN,LEFT,RIGHT,E,ENTER',
            );
            this.input.keyboard.disableGlobalCapture();
            this.input.on('pointerdown', (p) => {
              if (playing && !live.current.paused)
                this.target = cam.getWorldPoint(p.x, p.y);
            });
            this.lastPositionTime = 0;
            this.lastDestination = null;
            this.events.once('shutdown', () => live.current.onNear?.(null));
          }
          update(time, delta) {
            const dest = live.current.destination;
            if (dest && dest.stamp !== this.lastDestination) {
              const l = LOCATIONS.find((l) => l.id === dest.id);
              if (l) {
                this.player.setPosition(
                  l.doorX,
                  Math.min(l.doorY + 67, WORLD_SIZE.height - 35),
                );
                this.target = null;
              }
              this.lastDestination = dest.stamp;
            }
            if (!playing || live.current.paused) {
              this.target = null;
              return;
            }
            const k = this.keys,
              c = live.current.controls || {};
            let dx =
              Number(!!(k.D.isDown || k.RIGHT.isDown || c.right)) -
              Number(!!(k.A.isDown || k.LEFT.isDown || c.left));
            let dy =
              Number(!!(k.S.isDown || k.DOWN.isDown || c.down)) -
              Number(!!(k.W.isDown || k.UP.isDown || c.up));
            if (dx || dy) this.target = null;
            if (this.target) {
              const tx = this.target.x - this.player.x,
                ty = this.target.y - this.player.y,
                d = Math.hypot(tx, ty);
              if (d < 5) this.target = null;
              else {
                dx = tx / d;
                dy = ty / d;
              }
            }
            const blocked = (x, y) =>
              x < 28 ||
              x > WORLD_SIZE.width - 28 ||
              y < 25 ||
              y > WORLD_SIZE.height - 25 ||
              OBSTACLES.some(
                (o) =>
                  x > o.x - 10 &&
                  x < o.x + o.w + 10 &&
                  y > o.y &&
                  y < o.y + o.h + 8,
              );
            const n = Math.hypot(dx, dy) || 1,
              s = Math.min(delta, 35) * 0.19,
              x = this.player.x + (dx / n) * s,
              y = this.player.y + (dy / n) * s;
            if (!blocked(x, this.player.y)) this.player.x = x;
            else this.target = null;
            if (!blocked(this.player.x, y)) this.player.y = y;
            else this.target = null;
            if (dx || dy) {
              const t = this.textures.get('visitor');
              t.context.clearRect(0, 0, 32, 36);
              drawCharacter(
                t.context,
                0,
                0,
                character,
                reducedMotion ? 0 : Math.floor(time / 140),
                Math.abs(dx) > Math.abs(dy)
                  ? dx > 0
                    ? 'right'
                    : 'left'
                  : dy > 0
                    ? 'down'
                    : 'up',
              );
              t.refresh();
            }
            const near = LOCATIONS.find(
              (l) =>
                Math.hypot(
                  this.player.x - l.doorX,
                  this.player.y - (l.doorY + 45),
                ) < 75,
            );
            if (near?.id !== this.lastNear) {
              this.lastNear = near?.id;
              live.current.onNear?.(near || null);
            }
            if (
              near &&
              (Phaser.Input.Keyboard.JustDown(k.E) ||
                Phaser.Input.Keyboard.JustDown(k.ENTER))
            )
              live.current.onVisit?.(near.id);
            if (time - this.lastPositionTime > 100) {
              live.current.onPosition?.({ x: this.player.x, y: this.player.y });
              this.lastPositionTime = time;
            }
          }
        }
        game = new Phaser.Game({
          type: Phaser.CANVAS,
          parent: root.current,
          width: root.current.clientWidth,
          height: root.current.clientHeight,
          backgroundColor: '#c0bbaa',
          pixelArt: true,
          roundPixels: true,
          scale: { mode: Phaser.Scale.RESIZE },
          scene: City,
          audio: { noAudio: true },
          banner: false,
        });
        game.canvas.setAttribute('role', 'img');
        game.canvas.setAttribute(
          'aria-label',
          'An explorable pixel city. All portfolio content is accessible from the navigation buttons.',
        );
      })
      .catch(() => {
        if (root.current)
          root.current.textContent =
            'World failed to load. Use the portfolio navigation to explore.';
      });
    return () => {
      cancelled = true;
      game?.destroy(true);
    };
  }, [character, playing, reducedMotion]);
  return <div className="world-canvas" ref={root} />;
}
