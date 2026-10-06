import { useCallback, useEffect, useRef, useState } from 'react';
import { Fish, Sparkles, ArrowRight } from 'lucide-react';
import {
  chooseFish,
  createCatch,
  stepReeling,
  unlockedRift,
} from '../fishing/engine';
import { RARITIES, RODS } from '../fishing/catalog';
import { drawCharacter } from '../game/art';
import { drawFish } from '../fishing/sprites';
import FishArt from './FishArt';
function FishingScene({ game, character, rod, reduced }) {
  const canvas = useRef(null),
    live = useRef(game);
  useEffect(() => {
    live.current = game;
  }, [game]);
  useEffect(() => {
    const c = canvas.current.getContext('2d');
    let frame;
    const r = (x, y, w, h, color) => {
      c.fillStyle = color;
      c.fillRect(Math.round(x), Math.round(y), w, h);
    };
    const render = (now) => {
      const t = reduced ? 0 : now / 1000,
        g = live.current;
      r(0, 0, 760, 290, '#183845');
      r(0, 0, 760, 100, '#203e50');
      r(584, 20, 32, 32, '#f0dfb3');
      r(593, 15, 27, 29, '#203e50');
      for (let i = 0; i < 24; i++)
        r(
          195 + ((i * 79) % 545),
          12 + ((i * 17) % 72),
          2,
          2,
          i % 3 ? '#8ab0b7' : '#eadba9',
        );
      r(0, 95, 760, 5, '#607d76');
      r(0, 100, 760, 190, '#397c87');
      for (let y = 111; y < 290; y += 14)
        for (let x = 175; x < 760; x += 44)
          r(
            x + Math.sin(t * 0.8 + y) * 5,
            y,
            21,
            2,
            (x + y) % 3 ? '#569ca2' : '#468f99',
          );
      r(0, 86, 164, 204, '#6e856b');
      r(0, 128, 150, 162, '#426d61');
      r(38, 207, 272, 18, '#826744');
      r(38, 225, 272, 25, '#b39a70');
      for (let x = 40; x < 310; x += 18) {
        r(x, 207, 15, 17, '#d1b584');
        r(x + 1, 209, 2, 12, '#e2c797');
      }
      for (const x of [55, 275]) {
        r(x, 207, 9, 68, '#765d43');
        r(x - 3, 195, 15, 14, '#d8bb87');
      }
      r(25, 146, 7, 62, '#536a64');
      r(16, 123, 25, 25, '#263e46');
      r(21, 128, 15, 15, '#edce91');
      r(13, 119, 31, 4, '#263e46');
      c.save();
      c.translate(100, 139);
      c.scale(1.9, 1.9);
      drawCharacter(c, 0, 0, character, 0, 'right');
      c.restore();
      const casting = g.phase === 'casting',
        castT = casting ? Math.min(g.t / 0.8, 1) : 1;
      const active = [
        'casting',
        'waiting',
        'bite',
        'reeling',
        'caught',
      ].includes(g.phase);
      const tipX = active ? 235 : 210,
        tipY = active ? 110 : 105;
      c.strokeStyle = rod.color;
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(149, 173);
      c.lineTo(tipX, tipY);
      c.stroke();
      if (active) {
        const bx = 260 + castT * 185,
          by = casting
            ? 120 + Math.sin(castT * Math.PI) * -80 + castT * 66
            : 186;
        c.strokeStyle = '#d8dcc3';
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(tipX, tipY);
        c.quadraticCurveTo(330, 140, bx, by);
        c.stroke();
        const bob =
          g.phase === 'bite' ? Math.sin(t * 14) * 5 : Math.sin(t * 2) * 2;
        r(bx - 3, by - 7 + bob, 7, 5, '#e9876f');
        r(bx - 3, by - 2 + bob, 7, 5, '#f3dcb2');
        r(bx - 1, by - 12 + bob, 2, 5, '#f7e6b9');
        c.strokeStyle = g.phase === 'bite' ? '#efcd8f' : '#a3c3b0';
        c.strokeRect(bx - 14, by + 5, 28, 3);
        if (g.phase === 'bite') {
          r(bx - 2, by - 47, 4, 16, '#f4d291');
          r(bx - 2, by - 27, 4, 4, '#f4d291');
        }
        if (g.phase === 'caught' && g.fish) {
          c.save();
          c.translate(bx - 35, by - 75);
          drawFish(c, g.fish, t, false, false);
          c.restore();
        }
      }
      for (let i = 0; i < 4; i++) {
        r(658 + i * 12, 213 - (i % 2) * 8, 2, 45, '#87a975');
        r(655 + i * 12, 210 - (i % 2) * 8, 6, 7, '#c8b37b');
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [character, rod, reduced]);
  return (
    <canvas
      ref={canvas}
      width={760}
      height={290}
      className="fishing-scene"
      role="img"
      aria-label="A moonlit pixel lake, lantern-lit dock, traveler and fishing line"
    />
  );
}
const DEFAULT_GAME = {
  phase: 'idle',
  bar: 40,
  fishX: 50,
  window: 30,
  progress: 35,
  t: 0,
};
export default function FishingGame({
  fishing,
  character,
  reduced,
  spot = 'pond',
  onView,
  onGoFishing,
  embedded = false,
  onGameChange,
}) {
  const [view, setView] = useState(DEFAULT_GAME),
    sim = useRef({ ...DEFAULT_GAME }),
    held = useRef(false),
    root = useRef(null),
    result = useRef(null);
  const { state, catchFish, cast: recordCast } = fishing;
  const rod = RODS.find((r) => r.id === state.equipped),
    locked = spot === 'rift' && !unlockedRift(state);
  const cast = useCallback(() => {
    if (locked || state.items.length >= 3000) return;
    const fish = chooseFish(state, spot);
    if (!fish) return;
    sim.current = {
      ...DEFAULT_GAME,
      phase: 'casting',
      fish,
      id: crypto.randomUUID(),
      seed: Math.random() * 3,
      isNew: !state.discovered[fish.id],
      biteAt: 1.5 + Math.random() * 2,
    };
    held.current = false;
    recordCast();
    setView({ ...sim.current });
    root.current?.focus();
  }, [locked, state, spot, recordCast]);
  const strike = useCallback(() => {
    if (sim.current.phase === 'bite') {
      sim.current.phase = 'reeling';
      sim.current.elapsed = 0;
      sim.current.t = 0;
      held.current = true;
      setView({ ...sim.current });
    }
  }, []);
  useEffect(() => {
    let frame,
      last = 0,
      lastUI = 0;
    const tick = (now) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      const g = sim.current;
      if (
        !document.hidden &&
        !['idle', 'caught', 'escaped'].includes(g.phase)
      ) {
        g.t += dt;
        if (g.phase === 'casting' && g.t > 0.8) {
          g.phase = 'waiting';
          g.t = 0;
        } else if (g.phase === 'waiting' && g.t > g.biteAt) {
          g.phase = 'bite';
          g.t = 0;
        } else if (g.phase === 'bite' && g.t > (reduced ? 5 : 3.5)) {
          g.phase = 'escaped';
          g.reason = 'The bite slipped away. Strike when the float dips!';
        } else if (g.phase === 'reeling') {
          stepReeling(g, dt, held.current, reduced);
          if (g.phase === 'caught') {
            g.item = createCatch(g.fish, g.id);
            catchFish(g.item);
            held.current = false;
          }
          if (g.phase === 'escaped')
            g.reason =
              'Your line went slack. Keep the creature inside your net.';
        }
        if (now - lastUI > 50 || ['caught', 'escaped'].includes(g.phase)) {
          setView({ ...g });
          lastUI = now;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      held.current = false;
    };
  }, [catchFish, reduced]);
  useEffect(() => {
    const release = () => {
      held.current = false;
    };
    window.addEventListener('blur', release);
    document.addEventListener('visibilitychange', release);
    return () => {
      window.removeEventListener('blur', release);
      document.removeEventListener('visibilitychange', release);
    };
  }, []);
  useEffect(() => {
    if (view.phase === 'caught')
      result.current?.scrollIntoView({
        block: 'nearest',
        behavior: reduced ? 'instant' : 'smooth',
      });
  }, [view.phase, reduced]);
  useEffect(() => {
    onGameChange?.(view);
  }, [view, onGameChange]);
  const phase = view.phase;
  const titles = {
    idle: 'A little patience. A little possibility.',
    casting: 'A wish at the end of a line.',
    waiting: 'Listen to the lake…',
    bite: 'Something’s biting!',
    reeling: 'Keep it inside your net.',
    caught: 'A new story from the water.',
    escaped: 'The lake keeps a little mystery.',
  };
  return (
    <div
      className="fishing-game"
      ref={root}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
          e.preventDefault();
          sim.current.bar = Math.max(
            4,
            Math.min(96, sim.current.bar + (e.code === 'ArrowRight' ? 8 : -8)),
          );
          setView({ ...sim.current });
          return;
        }
        if (e.code === 'Space') {
          e.preventDefault();
          if (e.repeat) return;
          if (sim.current.phase === 'bite') strike();
          else if (sim.current.phase === 'reeling') held.current = true;
        }
      }}
      onKeyUp={(e) => {
        if (e.code === 'Space') {
          e.preventDefault();
          held.current = false;
        }
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) held.current = false;
      }}
    >
      <div className="fishing-location">
        <span>✦ {spot === 'rift' ? 'ASTRAL CROSSING' : 'MOONWATER DOCK'}</span>
        <span>
          {rod.name} · +{Math.round(rod.luck * 100)}% luck
        </span>
      </div>
      {!embedded && (
        <FishingScene
          game={view}
          character={character}
          rod={rod}
          reduced={reduced}
        />
      )}
      {locked ? (
        <div className="fishing-message">
          <Sparkles />
          <h3>The crossing is still asleep.</h3>
          <p>
            Discover 12 different species to wake this fishing spot.{' '}
            {Object.keys(state.discovered).length} / 12 found.
          </p>
          <button
            className="button primary"
            onClick={() => onGoFishing('fishing')}
          >
            Visit Moonwater Dock <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <>
          <div className="fishing-caption">
            <span className="eyebrow">
              {phase === 'caught'
                ? RARITIES[view.fish.rarity].label.toUpperCase()
                : phase.toUpperCase()}
            </span>
            <h3>{titles[phase]}</h3>
          </div>
          {phase === 'waiting' && (
            <p className="fishing-hint" role="status">
              Watch the float. A dipping bobber means it’s time to strike.
            </p>
          )}
          {phase === 'bite' && (
            <button
              className="button primary full strike-button"
              onPointerDown={strike}
              onPointerUp={() => {
                held.current = false;
              }}
              onClick={strike}
            >
              STRIKE! · Space / tap
            </button>
          )}
          {phase === 'reeling' && (
            <div className="reeling-game">
              <div className="reeling-track" aria-label="Fishing net position">
                <div
                  className="catch-net"
                  style={{ left: `${view.bar}%`, width: `${view.window}%` }}
                />
                <span
                  className="fish-marker"
                  style={{ left: `${view.fishX}%` }}
                >
                  ◆
                </span>
              </div>
              <div className="reeling-labels">
                <span>RELEASE ←</span>
                <span>→ HOLD</span>
              </div>
              <div
                className="catch-progress"
                role="progressbar"
                aria-label="Catch progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(view.progress)}
              >
                <span style={{ width: `${view.progress}%` }} />
              </div>
              <div className="reel-controls">
                <button
                  className="button"
                  aria-label="Move net left"
                  onClick={() => {
                    sim.current.bar = Math.max(4, sim.current.bar - 8);
                    setView({ ...sim.current });
                  }}
                >
                  ←
                </button>
                <button
                  className="button primary full reel-button"
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    held.current = true;
                  }}
                  onPointerUp={() => {
                    held.current = false;
                  }}
                  onPointerCancel={() => {
                    held.current = false;
                  }}
                >
                  Hold to raise · release to lower
                </button>
                <button
                  className="button"
                  aria-label="Move net right"
                  onClick={() => {
                    sim.current.bar = Math.min(96, sim.current.bar + 8);
                    setView({ ...sim.current });
                  }}
                >
                  →
                </button>
              </div>
              <small>
                Space also works. Keep ◆ inside the highlighted net to fill the
                catch meter.
              </small>
            </div>
          )}
          {phase === 'caught' && (
            <div
              className="catch-result"
              ref={result}
              role="status"
              style={{ '--fish-color': RARITIES[view.fish.rarity].color }}
            >
              <FishArt fish={view.fish} large />
              <div>
                <span className="rarity-tag">
                  {RARITIES[view.fish.rarity].label}
                </span>
                {view.isNew && <span className="new-discovery">NEW ✦</span>}
                <h3>{view.fish.name}</h3>
                <p>{view.fish.lore}</p>
                <small>
                  {view.item.size} cm · {view.item.value} coins · Added to
                  backpack
                </small>
              </div>
            </div>
          )}
          {phase === 'escaped' && (
            <p className="fishing-hint" role="status">
              {view.reason}
            </p>
          )}
          {['idle', 'caught', 'escaped'].includes(phase) && (
            <div className="fishing-actions">
              <button
                className="button primary"
                disabled={state.items.length >= 3000}
                onClick={cast}
              >
                <Fish size={18} />
                {phase === 'idle' ? 'Cast a line' : 'Cast again'}
              </button>
              <button className="button" onClick={() => onView('backpack')}>
                Open backpack ↗
              </button>
            </div>
          )}
          {state.items.length >= 3000 && (
            <p className="fishing-hint">
              Backpack full. Sell a few catches before casting again.
            </p>
          )}
          {phase === 'idle' && (
            <div className="fishing-instructions">
              <span>
                01 <strong>Cast a line</strong>
              </span>
              <span>
                02 <strong>Strike on a bite</strong>
              </span>
              <span>
                03 <strong>Hold to raise your net, release to lower</strong>
              </span>
            </div>
          )}
          {phase === 'idle' && (
            <p className="fishing-footnote">
              Twenty curious creatures. One very unlikely encounter.{' '}
              {spot === 'rift'
                ? 'Mythic chance starts at 0.01% before rod luck.'
                : 'The rarest creature lives at Astral Crossing, unlocked after 12 species.'}
            </p>
          )}
        </>
      )}
    </div>
  );
}
