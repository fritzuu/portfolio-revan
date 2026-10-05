import { useEffect, useRef } from 'react';
import {
  drawWorld,
  drawCharacter,
  drawProp,
  LOCATIONS,
  PROPS,
  WORLD_SIZE,
} from './art';
import { findPath, isBlocked } from './navigation';

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
  onTravel,
}) {
  const root = useRef(null),
    live = useRef({
      paused,
      controls,
      onNear,
      onVisit,
      onPosition,
      destination,
      onTravel,
    });
  useEffect(() => {
    live.current = {
      paused,
      controls,
      onNear,
      onVisit,
      onPosition,
      destination,
      onTravel,
    };
  }, [paused, controls, onNear, onVisit, onPosition, destination, onTravel]);
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
            drawWorld(map.context, { baseOnly: true });
            map.refresh();
            this.add.image(0, 0, 'city').setOrigin(0);
            PROPS.forEach((p, i) => {
              const t = this.textures.createCanvas(`prop-${i}`, 160, 160);
              drawProp(t.context, { ...p, x: 60, y: 110 });
              t.refresh();
              this.add
                .image(p.x - 60, p.y - 110, `prop-${i}`)
                .setOrigin(0)
                .setDepth(p.y + 12);
            });
            this.player = this.makeActor('visitor', 770, 520, character, 1.25);
            this.npcs = LOCATIONS.map((l, i) => {
              const actor = this.makeActor(
                `npc-${i}`,
                l.doorX + 50,
                Math.min(l.doorY + 65, WORLD_SIZE.height - 50),
                {
                  outfit: (i + 1) % 4,
                  skin: i % 3,
                  gender: i % 2 ? 'female' : 'male',
                },
                1.15,
              );
              actor.home = { x: actor.image.x, y: actor.image.y };
              actor.nextMove = i * 650 + 900;
              actor.patrol = 0;
              actor.label = this.add
                .text(
                  actor.image.x,
                  actor.image.y - 52,
                  i === 0 ? 'Revan' : '…',
                  {
                    fontFamily: 'monospace',
                    fontSize: '10px',
                    color: '#fff5d7',
                    backgroundColor: '#384a43',
                    padding: { x: 5, y: 3 },
                  },
                )
                .setOrigin(0.5);
              return actor;
            });
            LOCATIONS.forEach((l) => {
              const marker = this.add
                .rectangle(l.doorX, l.doorY + 27, 9, 9, 0xf0d49b, 0.8)
                .setAngle(45)
                .setDepth(1);
              if (!reducedMotion)
                this.tweens.add({
                  targets: marker,
                  y: l.doorY + 32,
                  alpha: 0.35,
                  duration: 1000,
                  yoyo: true,
                  repeat: -1,
                });
            });
            this.water = this.add.graphics().setDepth(1);
            const cam = this.cameras.main;
            cam.setBounds(0, 0, WORLD_SIZE.width, WORLD_SIZE.height);
            cam.setZoom(playing ? (window.innerWidth < 760 ? 1.8 : 2) : 1.65);
            if (playing)
              cam.startFollow(
                this.player.image,
                false,
                reducedMotion ? 1 : 0.09,
                reducedMotion ? 1 : 0.09,
              );
            else cam.centerOn(650, 410);
            this.keys = this.input.keyboard.addKeys(
              'W,A,S,D,UP,DOWN,LEFT,RIGHT,E,ENTER,ESC',
            );
            this.input.keyboard.disableGlobalCapture();
            this.input.on('pointerdown', (p) => {
              if (playing && !live.current.paused) {
                this.cancelTravel();
                this.player.path = findPath(
                  this.player.image,
                  cam.getWorldPoint(p.x, p.y),
                );
              }
            });
            this.lastPositionTime = 0;
            this.lastDestination = null;
            this.events.once('shutdown', () => live.current.onNear?.(null));
          }
          makeActor(name, x, y, config, scale) {
            const texture = this.textures.createCanvas(name, 32, 36);
            drawCharacter(texture.context, 0, 0, config);
            texture.refresh();
            return {
              texture,
              config,
              image: this.add
                .image(x, y, name)
                .setOrigin(0.5, 1)
                .setScale(scale)
                .setDepth(y),
              path: [],
              frame: 0,
              direction: 'down',
              distance: 0,
              stride: name === 'visitor' ? 11 : 4,
            };
          }
          cancelTravel() {
            this.trip = null;
            live.current.onTravel?.(null);
            this.player.path = [];
          }
          move(actor, dx, dy, delta, speed) {
            const length = Math.hypot(dx, dy);
            const before = { x: actor.image.x, y: actor.image.y };
            if (length) {
              const step = Math.min(delta, 40) * speed;
              const x = actor.image.x + (dx / length) * step,
                y = actor.image.y + (dy / length) * step;
              if (!isBlocked(x, actor.image.y)) {
                actor.image.x = x;
              }
              if (!isBlocked(actor.image.x, y)) {
                actor.image.y = y;
              }
              actor.direction =
                Math.abs(dx) > Math.abs(dy)
                  ? dx > 0
                    ? 'right'
                    : 'left'
                  : dy > 0
                    ? 'down'
                    : 'up';
            }
            const moved = Math.hypot(
              actor.image.x - before.x,
              actor.image.y - before.y,
            );
            actor.distance += moved;
            const frame =
              moved && !reducedMotion
                ? Math.floor(actor.distance / actor.stride) % 8
                : 0;
            if (
              frame !== actor.frame ||
              actor.drawDirection !== actor.direction
            ) {
              actor.texture.context.clearRect(0, 0, 32, 36);
              drawCharacter(
                actor.texture.context,
                0,
                0,
                actor.config,
                frame,
                actor.direction,
              );
              actor.texture.refresh();
              actor.frame = frame;
              actor.drawDirection = actor.direction;
            }
            actor.image.setDepth(actor.image.y);
            if (actor.label)
              actor.label
                .setPosition(actor.image.x, actor.image.y - 52)
                .setDepth(actor.image.y + 1);
            return moved;
          }
          followPath(actor, delta, speed) {
            const next = actor.path[0];
            if (!next) {
              this.move(actor, 0, 0, delta, speed);
              return;
            }
            const dx = next.x - actor.image.x,
              dy = next.y - actor.image.y,
              d = Math.hypot(dx, dy);
            if (d < 5) {
              actor.path.shift();
              return;
            }
            this.move(actor, dx, dy, Math.min(delta, d / speed), speed);
          }
          update(time, delta) {
            const dest = live.current.destination;
            if (!dest && this.lastDestination !== null) {
              this.cancelTravel();
              this.lastDestination = null;
            }
            if (dest && dest.stamp !== this.lastDestination) {
              this.lastDestination = dest.stamp;
              const l = LOCATIONS.find((l) => l.id === dest.id);
              if (l) {
                this.player.path = findPath(this.player.image, {
                  x: l.doorX,
                  y: l.doorY + 45,
                });
                this.trip = this.player.path.length ? dest : null;
                live.current.onTravel?.(this.trip ? l : null);
              }
            }
            if (live.current.paused) return;
            this.npcs.forEach((npc, i) => {
              if (!npc.path.length && time > npc.nextMove) {
                const offsets = [
                    [55, 0],
                    [35, 45],
                    [-65, 38],
                    [0, 0],
                  ],
                  offset = offsets[npc.patrol++ % 4];
                npc.path = findPath(npc.image, {
                  x: npc.home.x + offset[0],
                  y: npc.home.y + offset[1],
                });
                npc.nextMove = time + 3500 + i * 200;
              }
              // Residents politely stop when the traveler is in front of them.
              if (
                Math.hypot(
                  npc.image.x - this.player.image.x,
                  npc.image.y - this.player.image.y,
                ) > 38
              )
                this.followPath(npc, delta, 0.055);
              else this.move(npc, 0, 0, delta, 0);
            });
            if (!reducedMotion) {
              this.water.clear();
              this.water.fillStyle(0xb3e4de, 0.65);
              for (let i = 0; i < 8; i++) {
                const y = 606 + ((time * 0.025 + i * 11) % 85);
                this.water.fillRect(690 + i * 13, y, 5, 1);
              }
            }
            if (!playing) return;
            const k = this.keys,
              c = live.current.controls || {};
            const dx =
              Number(!!(k.D.isDown || k.RIGHT.isDown || c.right)) -
              Number(!!(k.A.isDown || k.LEFT.isDown || c.left));
            const dy =
              Number(!!(k.S.isDown || k.DOWN.isDown || c.down)) -
              Number(!!(k.W.isDown || k.UP.isDown || c.up));
            if (dx || dy || Phaser.Input.Keyboard.JustDown(k.ESC)) {
              this.cancelTravel();
              this.move(this.player, dx, dy, delta, 0.185);
            } else this.followPath(this.player, delta, 0.185);
            const near = LOCATIONS.find(
              (l) =>
                Math.hypot(
                  this.player.image.x - l.doorX,
                  this.player.image.y - (l.doorY + 45),
                ) < 67,
            );
            if (near?.id !== this.lastNear) {
              this.lastNear = near?.id;
              live.current.onNear?.(near || null);
            }
            if (this.trip && !this.player.path.length) {
              const trip = this.trip;
              this.trip = null;
              live.current.onTravel?.(null);
              if (near?.id === trip.id && trip.open)
                live.current.onVisit?.(trip.panel || trip.id);
            }
            if (
              near &&
              (Phaser.Input.Keyboard.JustDown(k.E) ||
                Phaser.Input.Keyboard.JustDown(k.ENTER))
            ) {
              this.cancelTravel();
              live.current.onVisit?.(near.id);
            }
            if (time - this.lastPositionTime > 100) {
              live.current.onPosition?.({
                x: this.player.image.x,
                y: this.player.image.y,
              });
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
          'An explorable pixel city. Walk to buildings using the portfolio navigation.',
        );
      })
      .catch(() => {
        if (root.current)
          root.current.textContent =
            'World failed to load. Reload to try again.';
      });
    return () => {
      cancelled = true;
      game?.destroy(true);
    };
  }, [character, playing, reducedMotion]);
  return <div className="world-canvas" ref={root} />;
}
