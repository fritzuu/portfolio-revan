import { useEffect, useRef } from 'react';
import { drawWorld, drawCharacter, LOCATIONS, OBSTACLES } from './art';

export default function World({
  character,
  playing,
  paused,
  controls,
  onNear,
  onVisit,
  reducedMotion,
}) {
  const root = useRef(null);
  const live = useRef({ paused, controls, onNear, onVisit });
  useEffect(() => {
    live.current = { paused, controls, onNear, onVisit };
  }, [paused, controls, onNear, onVisit]);
  useEffect(() => {
    let game,
      cancelled = false;
    import('phaser')
      .then(({ default: Phaser }) => {
        if (cancelled) return;
        const compact =
          playing && window.matchMedia('(max-width: 760px)').matches;
        class Village extends Phaser.Scene {
          create() {
            const map = this.textures.createCanvas('village', 960, 640);
            drawWorld(map.context);
            map.refresh();
            this.add.image(0, 0, 'village').setOrigin(0);
            const sprite = this.textures.createCanvas('visitor', 32, 36);
            drawCharacter(sprite.context, 0, 0, character);
            sprite.refresh();
            this.player = this.add
              .image(playing ? 475 : 420, playing ? 438 : 350, 'visitor')
              .setOrigin(0.5, 1);
            this.player.setScale(1.3);
            if (compact) {
              this.cameras.main.setBounds(0, 0, 960, 640);
              this.cameras.main.startFollow(this.player, true);
            }
            LOCATIONS.forEach((l) => {
              this.add.rectangle(l.x, l.y - 86, 132, 23, 0x233e33, 0.95);
              this.add
                .text(l.x, l.y - 86, l.name, {
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: '#f1e4c5',
                })
                .setOrigin(0.5);
              this.add
                .text(l.doorX, l.doorY + 14, '◆', {
                  fontSize: '13px',
                  color: '#ffe3a0',
                })
                .setOrigin(0.5);
            });
            this.add
              .text(479, 573, 'REVAN / VILLAGE · EST. 2026', {
                fontFamily: 'monospace',
                fontSize: '11px',
                color: '#384f3a',
              })
              .setOrigin(0.5);
            this.keys = this.input.keyboard.addKeys(
              'W,A,S,D,UP,DOWN,LEFT,RIGHT,E,ENTER',
            );
            this.input.keyboard.disableGlobalCapture();
            this.input.on('pointerdown', (pointer) => {
              if (playing && !live.current.paused)
                this.target = this.cameras.main.getWorldPoint(
                  pointer.x,
                  pointer.y,
                );
            });
            this.lastNear = undefined;
            this.events.once('shutdown', () => live.current.onNear?.(null));
          }
          update(time, delta) {
            if (!playing || live.current.paused) {
              this.target = null;
              return;
            }
            const k = this.keys,
              c = live.current.controls || {};
            let dx =
              Number(Boolean(k.D.isDown || k.RIGHT.isDown || c.right)) -
              Number(Boolean(k.A.isDown || k.LEFT.isDown || c.left));
            let dy =
              Number(Boolean(k.S.isDown || k.DOWN.isDown || c.down)) -
              Number(Boolean(k.W.isDown || k.UP.isDown || c.up));
            if (dx || dy) this.target = null;
            if (this.target) {
              const tx = this.target.x - this.player.x,
                ty = this.target.y - this.player.y;
              const dist = Math.hypot(tx, ty);
              if (dist < 5) this.target = null;
              else {
                dx = tx / dist;
                dy = ty / dist;
              }
            }
            const norm = Math.hypot(dx, dy) || 1,
              step = Math.min(delta, 35) * 0.14;
            const blocked = (x, y) =>
              x < 37 ||
              x > 923 ||
              y < 95 ||
              y > 584 ||
              OBSTACLES.some(
                (o) =>
                  x > o.x - 10 &&
                  x < o.x + o.w + 10 &&
                  y > o.y &&
                  y < o.y + o.h,
              );
            const x = this.player.x + (dx / norm) * step,
              y = this.player.y + (dy / norm) * step;
            if (!blocked(x, this.player.y)) this.player.x = x;
            else if (this.target) this.target = null;
            if (!blocked(this.player.x, y)) this.player.y = y;
            else if (this.target) this.target = null;
            if (dx || dy) {
              const tex = this.textures.get('visitor');
              tex.context.clearRect(0, 0, 32, 36);
              drawCharacter(
                tex.context,
                0,
                0,
                character,
                reducedMotion ? 0 : Math.floor(time / 150),
                Math.abs(dx) > Math.abs(dy)
                  ? dx > 0
                    ? 'right'
                    : 'left'
                  : dy > 0
                    ? 'down'
                    : 'up',
              );
              tex.refresh();
            }
            const near = LOCATIONS.find(
              (l) =>
                Math.hypot(
                  this.player.x - l.doorX,
                  this.player.y - (l.doorY + 25),
                ) < 68,
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
          }
        }
        game = new Phaser.Game({
          type: Phaser.CANVAS,
          width: compact ? 480 : 960,
          height: compact ? 400 : 640,
          parent: root.current,
          backgroundColor: '#71936a',
          pixelArt: true,
          roundPixels: true,
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
          },
          scene: Village,
          audio: { noAudio: true },
          banner: false,
        });
        game.canvas.setAttribute(
          'aria-label',
          'Pixel village. Use the location buttons to access all portfolio content.',
        );
        game.canvas.setAttribute('role', 'img');
      })
      .catch(() => {
        if (root.current)
          root.current.textContent =
            'World gagal dimuat. Gunakan menu portfolio untuk menjelajah konten.';
      });
    return () => {
      cancelled = true;
      game?.destroy(true);
    };
  }, [character, playing, reducedMotion]);
  return <div className="world-canvas" ref={root} />;
}
