import { useEffect, useRef } from 'react';
import {
  drawWorld,
  drawCharacter,
  drawProp,
  DESTINATIONS,
  PROPS,
  WORLD_SIZE,
} from './art';
import { NPC_COUNT, NPC_ROUTES } from './layout';
import { createExploration, updateExploration } from './explorationActors';
import { nightAmount } from './daylight';
import { drawFish } from '../fishing/sprites';
import { RODS } from '../fishing/catalog';
import { findPath, isBlocked } from './navigation';
import { createGameKeyboard, justPressed, readMovement } from './keyboard';

export default function World({
  character,
  playing,
  paused,
  fishing,
  controls,
  onNear,
  onVisit,
  reducedMotion,
  onPosition,
  destination,
  onTravel,
  onDiscover,
  onNight,
  kick,
  onShot,
  footballActive,
  footballMode,
  footballDifficulty,
  onMatchState,
  onSound,
  discoveries,
}) {
  const root = useRef(null),
    live = useRef({
      paused,
      fishing,
      controls,
      onNear,
      onVisit,
      onPosition,
      destination,
      onTravel,
      onDiscover,
      onNight,
      kick,
      onShot,
      footballActive,
      footballMode,
      footballDifficulty,
      onMatchState,
      onSound,
      discoveries,
      reducedMotion,
    });
  useEffect(() => {
    live.current = {
      paused,
      fishing,
      controls,
      onNear,
      onVisit,
      onPosition,
      destination,
      onTravel,
      onDiscover,
      onNight,
      kick,
      onShot,
      footballActive,
      footballMode,
      footballDifficulty,
      onMatchState,
      onSound,
      discoveries,
      reducedMotion,
    };
  }, [
    paused,
    fishing,
    controls,
    onNear,
    onVisit,
    onPosition,
    destination,
    onTravel,
    onDiscover,
    onNight,
    kick,
    onShot,
    footballActive,
    footballMode,
    footballDifficulty,
    onMatchState,
    onSound,
    discoveries,
    reducedMotion,
  ]);
  useEffect(() => {
    let game,
      cancelled = false;
    import('phaser')
      .then(({ default: Phaser }) => {
        if (cancelled) return;
        class City extends Phaser.Scene {
          preload() {
            this.load.image('jekek-source', '/sprites/jekek.png');
            this.load.image('darkrai-source', '/sprites/darkrai.png');
          }
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
              const t = this.textures.createCanvas(`prop-${i}`, 192, 160);
              drawProp(t.context, { ...p, x: 80, y: 110 });
              t.refresh();
              this.add
                .image(p.x - 80, p.y - 110, `prop-${i}`)
                .setOrigin(0)
                .setDepth(p.y + 12);
            });
            this.player = this.makeActor('visitor', 800, 545, character, 1.25);
            this.npcs = Array.from({ length: NPC_COUNT }, (_, i) => {
              const route = NPC_ROUTES[i % NPC_ROUTES.length],
                stop = Math.floor(i / NPC_ROUTES.length) % route.length,
                point = route[stop];
              const actor = this.makeActor(
                `npc-${i}`,
                point.x,
                point.y,
                {
                  outfit: i % 4,
                  skin: i % 3,
                  gender: i % 2 ? 'female' : 'male',
                  revan: i === 0,
                },
                1.1,
              );
              actor.route = route;
              actor.patrol = stop + 1;
              actor.nextMove = 600 + i * 220;
              actor.resident = true;
              actor.speed = 0.07 + (i % 4) * 0.008;
              actor.index = i;
              if (i === 0)
                actor.label = this.add
                  .text(point.x, point.y - 48, 'Revan', {
                    fontFamily: 'monospace',
                    fontSize: '10px',
                    color: '#fff5d7',
                    backgroundColor: '#384a43',
                    padding: { x: 5, y: 3 },
                  })
                  .setOrigin(0.5);
              return actor;
            });
            this.merchant = this.makeActor(
              'merchant',
              565,
              915,
              { outfit: 0, skin: 1, gender: 'female' },
              1.15,
            );
            this.merchant.label = this.add
              .text(565, 866, 'Mira · Tackle', {
                fontFamily: 'monospace',
                fontSize: '9px',
                color: '#fff5d7',
                backgroundColor: '#384a43',
                padding: { x: 4, y: 3 },
              })
              .setOrigin(0.5)
              .setDepth(916);
            DESTINATIONS.forEach((l) => {
              const marker = this.add
                .rectangle(l.doorX, l.doorY + 27, 9, 9, 0xf0d49b, 0.8)
                .setAngle(45)
                .setDepth(1);
              if (!live.current.reducedMotion)
                this.tweens.add({
                  targets: marker,
                  y: l.doorY + 32,
                  alpha: 0.35,
                  duration: 1000,
                  yoyo: true,
                  repeat: -1,
                });
            });
            this.fishingArt = this.add.graphics().setDepth(1900);
            this.night = this.add
              .rectangle(0, 0, WORLD_SIZE.width, WORLD_SIZE.height, 0x101b3c, 1)
              .setAlpha(0)
              .setOrigin(0)
              .setDepth(2000);
            const glow = this.textures.createCanvas('lamp-glow', 160, 160);
            const gradient = glow.context.createRadialGradient(
              80,
              80,
              0,
              80,
              80,
              80,
            );
            gradient.addColorStop(0, '#fff0aecc');
            gradient.addColorStop(0.3, '#ffc87966');
            gradient.addColorStop(1, '#ffc87900');
            glow.context.fillStyle = gradient;
            glow.context.fillRect(0, 0, 160, 160);
            glow.refresh();
            this.lamps = PROPS.filter((p) => p.type === 'lamp').map((p) => ({
              halo: this.add
                .image(p.x + 13, p.y - 72, 'lamp-glow')
                .setScale(0.8)
                .setDepth(2001)
                .setBlendMode(Phaser.BlendModes.ADD),
              bulb: this.add
                .rectangle(p.x + 13, p.y - 72, 10, 13, 0xffecb0)
                .setDepth(2002),
            }));
            this.exploration = createExploration(this);
            this.dayElapsed = 0;
            this.wasFishing = false;
            this.water = this.add.graphics().setDepth(1);
            const cam = this.cameras.main;
            cam.setBounds(0, 0, WORLD_SIZE.width, WORLD_SIZE.height);
            cam.setZoom(playing ? (window.innerWidth < 760 ? 1.8 : 2) : 1.65);
            if (playing)
              cam.startFollow(
                this.player.image,
                false,
                live.current.reducedMotion ? 1 : 0.09,
                live.current.reducedMotion ? 1 : 0.09,
              );
            else cam.centerOn(650, 410);
            this.gameKeyboard = createGameKeyboard({
              target: window,
              document,
              onMovement: () =>
                root.current
                  ?.closest('.city-stage')
                  ?.focus({ preventScroll: true }),
              canPlay: () =>
                playing &&
                !live.current.fishing &&
                (!live.current.paused ||
                  (live.current.footballActive &&
                    ['messi', 'yamal'].includes(live.current.footballMode))),
              onReset: ({ shootHeld }) => {
                const state = this.exploration;
                if (shootHeld || state.match.charge)
                  state.match.mustReleaseShoot = true;
                state.match.charge = null;
                state.qDown = false;
                state.tackleDown = false;
                state.skillDown = false;
              },
            });
            this.keys = this.gameKeyboard.keys;
            this.events.once('shutdown', () => this.gameKeyboard.destroy());
            this.input.on('pointerdown', (p) => {
              if (playing && !live.current.paused && !live.current.fishing) {
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
              frameCache: new Map(),
              baseScale: scale,
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
          routeTo(start, target) {
            return findPath(start, target);
          }
          cancelTravel() {
            this.trip = null;
            live.current.onTravel?.(null);
            this.player.path = [];
          }
          move(actor, dx, dy, delta, speed) {
            const length = Math.hypot(dx, dy);
            const before = { x: actor.image.x, y: actor.image.y };
            if (length > 0.1) {
              const step = Math.min(delta, 40) * speed;
              const x = actor.image.x + (dx / length) * step,
                y = actor.image.y + (dy / length) * step;
              if (!isBlocked(x, actor.image.y)) {
                actor.image.x = x;
              }
              if (!isBlocked(actor.image.x, y)) {
                actor.image.y = y;
              }
              if (!actor.lockFacing && length > 0.5)
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
            if (
              actor === this.player &&
              moved > 0.1 &&
              actor.distance - (actor.lastStep || 0) > 24
            ) {
              actor.lastStep = actor.distance;
              const x = actor.image.x,
                y = actor.image.y;
              const surface =
                (x < 360 && y > 730 && y < 865) ||
                (x > 1620 && x < 1660 && y > 1280)
                  ? 'wood'
                  : x > 1690 || y > 1150
                    ? 'grass'
                    : 'stone';
              live.current.onSound?.('step', surface);
            }
            const frame =
              moved && !live.current.reducedMotion
                ? Math.floor(actor.distance / actor.stride) % 8
                : 0;
            if (
              frame !== actor.frame ||
              actor.drawDirection !== actor.direction ||
              actor.drawPose !== actor.poseKey
            ) {
              const cacheKey = `${frame}:${actor.direction}:${actor.poseKey || 'idle'}`;
              const cached = actor.frameCache.get(cacheKey);
              if (cached) actor.texture.context.putImageData(cached, 0, 0);
              else {
                actor.texture.context.clearRect(0, 0, 32, 36);
                drawCharacter(
                  actor.texture.context,
                  0,
                  0,
                  actor.config,
                  frame,
                  actor.direction,
                );
                if (actor.frameCache.size >= 96)
                  actor.frameCache.delete(actor.frameCache.keys().next().value);
                actor.frameCache.set(
                  cacheKey,
                  actor.texture.context.getImageData(0, 0, 32, 36),
                );
              }
              actor.texture.refresh();
              actor.frame = frame;
              actor.drawDirection = actor.direction;
              actor.drawPose = actor.poseKey;
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
            let sx = dx / d,
              sy = dy / d;
            if (actor.resident) {
              for (const other of this.npcs) {
                if (other === actor) continue;
                const ox = actor.image.x - other.image.x,
                  oy = actor.image.y - other.image.y,
                  dist = Math.hypot(ox, oy);
                if (dist > 0 && dist < 27) {
                  sx += ((ox / dist) * (27 - dist)) / 27;
                  sy += ((oy / dist) * (27 - dist)) / 27;
                }
              }
            }
            this.move(actor, sx, sy, Math.min(delta, d / speed), speed);
          }
          update(time, delta) {
            this.gameKeyboard.sync();
            if (!document.hidden) this.dayElapsed += Math.min(delta, 100);
            const darkness = nightAmount(this.dayElapsed);
            updateExploration(
              this,
              this.exploration,
              time,
              delta,
              darkness,
              live.current,
              live.current.reducedMotion,
            );
            this.night.setAlpha(darkness * 0.42);
            this.lamps.forEach(({ halo, bulb }) => {
              halo.setAlpha(darkness * 0.6);
              bulb.setAlpha(darkness);
            });
            const f = live.current.fishing;
            this.fishingArt.clear();
            if (f) {
              const x = this.player.image.x,
                y = this.player.image.y;
              this.player.direction = f.spot === 'rift' ? 'right' : 'left';
              this.move(this.player, 0, 0, delta, 0);
              const sign = f.spot === 'rift' ? 1 : -1;
              const tipX = x + sign * 27,
                tipY = y - 55;
              this.fishingArt.lineStyle(
                3,
                Phaser.Display.Color.HexStringToColor(
                  RODS.find((r) => r.id === f.rod)?.color || '#9cbe69',
                ).color,
              );
              this.fishingArt.lineBetween(x + sign * 8, y - 20, tipX, tipY);
              if (
                ['casting', 'waiting', 'bite', 'reeling', 'caught'].includes(
                  f.phase,
                )
              ) {
                const cast = f.phase === 'casting' ? Math.min(f.t / 0.8, 1) : 1;
                const bx = tipX + sign * 85 * cast;
                const by = tipY - 5 * cast - Math.sin(cast * Math.PI) * 50;
                const bob =
                  f.phase === 'bite'
                    ? Math.sin(time * 0.015) * 3
                    : Math.sin(time * 0.003);
                this.fishingArt.lineStyle(1, 0xeee5c6, 0.9);
                this.fishingArt.lineBetween(tipX, tipY, bx, by + bob);
                this.fishingArt.fillStyle(0xf28f77);
                this.fishingArt.fillRect(bx - 2, by - 4 + bob, 5, 4);
                this.fishingArt.fillStyle(0xffe8bd);
                this.fishingArt.fillRect(bx - 2, by + bob, 5, 3);
                this.fishingArt.lineStyle(1, 0xb1e0de, 0.6);
                this.fishingArt.strokeEllipse(bx, by + 5, 23, 6);
                if (f.phase === 'bite') {
                  this.fishingArt.fillStyle(0xffde85);
                  this.fishingArt.fillRect(bx - 1, by - 28, 3, 12);
                  this.fishingArt.fillRect(bx - 1, by - 13, 3, 3);
                }
                if (f.phase === 'caught' && f.fish) {
                  if (this.catchId !== f.id) {
                    this.catchSprite?.destroy();
                    const texture = !this.textures.exists('world-catch')
                      ? this.textures.createCanvas('world-catch', 80, 64)
                      : this.textures.get('world-catch');
                    drawFish(texture.context, f.fish);
                    texture.refresh();
                    this.catchSprite = this.add
                      .image(bx, by - 30, 'world-catch')
                      .setScale(0.8)
                      .setDepth(2003);
                    this.catchId = f.id;
                  }
                } else this.catchSprite?.setVisible(false);
              }
            } else if (this.wasFishing) {
              this.catchSprite?.destroy();
              this.catchSprite = null;
              this.catchId = null;
              this.player.path = [];
            }
            this.wasFishing = !!f;
            const dest = live.current.destination;
            if (!dest && this.lastDestination !== null) {
              this.cancelTravel();
              this.lastDestination = null;
            }
            if (dest && dest.stamp !== this.lastDestination) {
              this.lastDestination = dest.stamp;
              const l = DESTINATIONS.find((l) => l.id === dest.id);
              if (l && dest.teleport) {
                this.cancelTravel();
                this.player.image.setPosition(l.doorX, l.doorY + 45);
                this.cameras.main.fadeIn(
                  live.current.reducedMotion ? 0 : 350,
                  24,
                  49,
                  44,
                );
              } else if (l) {
                this.player.path = findPath(this.player.image, {
                  x: l.doorX,
                  y: l.doorY + 45,
                });
                this.trip = this.player.path.length ? dest : null;
                live.current.onTravel?.(this.trip ? l : null);
              }
            }
            this.npcs.forEach((npc, i) => {
              if (npc.sittingUntil) {
                if (time < npc.sittingUntil) return;
                npc.image.setPosition(
                  npc.resumePosition.x,
                  npc.resumePosition.y,
                );
                npc.sittingUntil = null;
                npc.frame = -1;
                npc.nextMove = time + 400;
              }
              if (!npc.path.length && npc.pendingSeat) {
                const bench = npc.pendingSeat;
                npc.pendingSeat = null;
                npc.resumePosition = { x: npc.image.x, y: npc.image.y };
                npc.sittingUntil = time + 3200 + (i % 3) * 600;
                npc.image
                  .setPosition(bench.x + 36, bench.y + 28)
                  .setDepth(bench.y + 30);
                npc.texture.context.clearRect(0, 0, 32, 36);
                drawCharacter(npc.texture.context, 0, 0, npc.config, 0, 'down');
                npc.texture.context.clearRect(0, 29, 32, 7);
                npc.texture.refresh();
                return;
              }
              if (!npc.path.length && time > npc.nextMove) {
                let target = npc.route[npc.patrol++ % npc.route.length];
                const bench =
                  i % 3 === 0
                    ? PROPS.find(
                        (p) =>
                          p.type === 'bench' &&
                          Math.hypot(p.x + 36 - target.x, p.y + 44 - target.y) <
                            75,
                      )
                    : null;
                if (bench) {
                  target = { x: bench.x + 36, y: bench.y + 44 };
                  npc.pendingSeat = bench;
                }
                npc.path = findPath(npc.image, target);
                npc.nextMove = time + 900 + (i % 4) * 450;
              }
              if (
                Math.hypot(
                  npc.image.x - this.player.image.x,
                  npc.image.y - this.player.image.y,
                ) < 35
              ) {
                const choices = [
                  { x: npc.image.x + 28, y: npc.image.y + 12 },
                  { x: npc.image.x - 28, y: npc.image.y - 12 },
                ];
                const side = choices.find(
                  (p) =>
                    !isBlocked(p.x, p.y) &&
                    Math.hypot(
                      p.x - this.player.image.x,
                      p.y - this.player.image.y,
                    ) > 42,
                );
                if (side && time > (npc.yieldUntil || 0)) {
                  npc.path.unshift(side);
                  npc.yieldUntil = time + 1100;
                }
              }
              this.followPath(npc, delta, npc.speed);
            });
            if (!live.current.reducedMotion) {
              this.water.clear();
              this.water.fillStyle(0xb3e4de, 0.65);
              for (let i = 0; i < 8; i++) {
                const y = 614 + ((time * 0.025 + i * 11) % 73);
                this.water.fillRect(749 + i * 13, y, 5, 1);
              }
            }
            if (time - this.lastPositionTime > 100) {
              live.current.onPosition?.({
                x: this.player.image.x,
                y: this.player.image.y,
              });
              this.lastPositionTime = time;
            }
            if (
              !playing ||
              f ||
              live.current.paused ||
              live.current.footballActive
            )
              return;
            const k = this.keys,
              c = live.current.controls || {};
            const { dx, dy } = readMovement(k, c);
            const escape = justPressed(k.ESC),
              interactE = justPressed(k.E),
              interactEnter = justPressed(k.ENTER);
            const steering =
              ['W', 'A', 'S', 'D', 'UP', 'DOWN', 'LEFT', 'RIGHT'].some(
                (name) => k[name].isDown,
              ) ||
              c.up ||
              c.down ||
              c.left ||
              c.right;
            if (steering || escape) {
              this.cancelTravel();
              this.move(this.player, dx, dy, delta, 0.185);
            } else this.followPath(this.player, delta, 0.185);
            const near = DESTINATIONS.find(
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
            if (near && (interactE || interactEnter)) {
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
          input: { keyboard: false },
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
  }, [character, playing]);
  return <div className="world-canvas" ref={root} />;
}
