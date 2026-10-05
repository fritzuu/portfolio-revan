import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Map, Settings, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import seed from './data/portfolio.json';
import { LOCATIONS, OUTFITS, SKINS } from './game/art';
import PixelCharacter from './components/PixelCharacter';
import IntroArt from './components/IntroArt';
import WorldMap from './components/WorldMap';
import PortfolioContent, { api } from './components/PortfolioContent';
import Admin from './components/Admin';
const World = lazy(() => import('./game/World'));
const cn = (...inputs) => twMerge(clsx(inputs));
const DEFAULT = { gender: 'male', outfit: 0, skin: 0 };
const TITLES = {
  map: 'Explore Revan’s city.',
  about: 'A little about me.',
  projects: 'Made with curiosity.',
  skills: 'My inventory.',
  experience: 'The journey so far.',
  contact: 'A letter to Revan.',
  guestbook: 'The guestbook.',
  settings: 'Make yourself at home.',
};
function readSave() {
  try {
    const v = JSON.parse(localStorage.getItem('revan-world') || 'null');
    return v &&
      ['male', 'female'].includes(v.character?.gender) &&
      [0, 1, 2, 3].includes(v.character.outfit) &&
      [0, 1, 2].includes(v.character.skin)
      ? {
          character: v.character,
          visited: Array.isArray(v.visited)
            ? v.visited.filter((id) => LOCATIONS.some((l) => l.id === id))
            : [],
        }
      : null;
  } catch {
    return null;
  }
}
function Modal({ open, onOpenChange, title, children, className }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className={cn('dialog-content', className)}>
          <div className="dialog-head">
            <div>
              <span className="eyebrow">REVAN’S WORLD / FIELD NOTES</span>
              <Dialog.Title>{title}</Dialog.Title>
            </div>
            <Dialog.Close className="icon-button" aria-label="Tutup panel">
              <X size={20} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Jelajahi portfolio dan dunia Revan melalui panel ini.
          </Dialog.Description>
          <div className="dialog-body">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
function useMusic(enabled) {
  useEffect(() => {
    if (!enabled) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    const ctx = new Audio();
    const notes = [261.63, 329.63, 392, 523.25, 392, 329.63, 293.66, 392];
    let i = 0;
    const tick = () => {
      if (document.hidden) return;
      const o = ctx.createOscillator(),
        g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = notes[i++ % notes.length];
      g.gain.setValueAtTime(0.025, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.5);
    };
    tick();
    const timer = setInterval(tick, 650);
    return () => {
      clearInterval(timer);
      ctx.close();
    };
  }, [enabled]);
}
function Intro({ onDone, reduced }) {
  const [step, setStep] = useState(0);
  const lines = [
    'Somewhere between an idea and a line of code…',
    'A little world was waiting to be discovered.',
    'Welcome, traveler. Your story starts here.',
  ];
  useEffect(() => {
    if (reduced) return;
    const t = setTimeout(() => {
      if (step === 2) onDone();
      else setStep((s) => s + 1);
    }, 3200);
    return () => clearTimeout(t);
  }, [step, onDone, reduced]);
  return (
    <div className="intro-scene">
      <div className="intro-stars">✦ · ✧ · ✦</div>
      <motion.div
        key={step}
        initial={{ opacity: 0, y: reduced ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <IntroArt step={step} />
        <h2>{lines[step]}</h2>
      </motion.div>
      <div className="intro-progress">
        {lines.map((_, i) => (
          <span key={i} className={i === step ? 'active' : ''} />
        ))}
      </div>
      <button className="button" onClick={onDone}>
        {reduced ? 'Lanjutkan' : 'Skip cutscene'} <ArrowRight size={16} />
      </button>
    </div>
  );
}
export default function App() {
  const [saved] = useState(readSave),
    [character, setCharacter] = useState(saved?.character || DEFAULT),
    [visited, setVisited] = useState(saved?.visited || []);
  const [position, setPosition] = useState({ x: 770, y: 520 });
  const [destination, setDestination] = useState(null);
  const [phase, setPhase] = useState('landing'),
    [panel, setPanel] = useState(null),
    [near, setNear] = useState(null),
    [controls, setControls] = useState({}),
    [data, setData] = useState(seed),
    [offline, setOffline] = useState(false),
    [music, setMusic] = useState(false),
    [manualReduced, setManualReduced] = useState(false);
  const preferredReduced = useReducedMotion(),
    reduced = manualReduced || preferredReduced,
    stage = useRef(null);
  useMusic(music);
  useEffect(() => {
    let active = true;
    api('/api/portfolio')
      .then((v) => {
        if (active) {
          setData(v);
          setOffline(false);
        }
      })
      .catch(() => {
        if (active) setOffline(true);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (phase !== 'playing') return;
    try {
      localStorage.setItem(
        'revan-world',
        JSON.stringify({ character, visited }),
      );
    } catch {
      /* Storage may be disabled; exploration still works. */
    }
  }, [character, visited, phase]);
  const visit = useCallback((id) => {
    setPanel(id);
    setControls({});
    if (LOCATIONS.some((l) => l.id === id))
      setVisited((v) => (v.includes(id) ? v : [...v, id]));
  }, []);
  const doneIntro = useCallback(() => setPhase('create'), []);
  const enter = () => {
    setPhase('playing');
    setControls({});
    setTimeout(() => stage.current?.focus(), 0);
  };
  if (window.location.pathname === '/admin') return <Admin />;
  return (
    <div className="city-app">
      {phase === 'playing' && (
        <a className="skip-link" href="#city-navigation">
          Skip to portfolio navigation
        </a>
      )}
      <main
        className="city-stage"
        ref={stage}
        tabIndex={0}
        aria-label="Game world. Walk with arrow keys or WASD. Press E to interact."
        onBlur={() => setControls({})}
        onKeyDown={(e) => {
          if (
            phase === 'playing' &&
            !panel &&
            ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(
              e.key,
            )
          )
            e.preventDefault();
        }}
      >
        <Suspense
          fallback={
            <div className="city-loading">
              <PixelCharacter character={character} />
              <span>BUILDING YOUR WORLD…</span>
            </div>
          }
        >
          <World
            character={character}
            playing={phase === 'playing'}
            paused={!!panel || phase !== 'playing'}
            controls={controls}
            onNear={setNear}
            onVisit={visit}
            reducedMotion={reduced}
            onPosition={setPosition}
            destination={destination}
          />
        </Suspense>
      </main>
      {phase === 'landing' && (
        <div className="title-screen">
          <div className="title-kicker">
            FULL STACK DEVELOPER
            <br />
            AN INTERACTIVE PORTFOLIO
          </div>
          <div className="title-center">
            <span className="title-edition">
              WELCOME TO MY LITTLE CORNER OF THE INTERNET
            </span>
            <h1>
              REVAN
              <br />
              <span>ZHAFRAN</span>
            </h1>
            <div className="title-rule">
              <i />
              PORTFOLIO
              <i />
            </div>
            <button className="play-button" onClick={() => setPhase('intro')}>
              PLAY <ArrowRight size={24} />
            </button>
            {saved && (
              <button className="continue-button" onClick={enter}>
                CONTINUE YOUR ADVENTURE →
              </button>
            )}
          </div>
          <div className="title-bottom">
            <span>No time to explore?</span>
            <button onClick={() => visit('projects')}>View projects ↗</button>
            <a href={data.profile.linkedin} target="_blank" rel="noreferrer">
              LinkedIn ↗
            </a>
          </div>
          <span className="world-credit">
            AN ORIGINAL PIXEL WORLD / REVAN · 2026
          </span>
        </div>
      )}
      {phase === 'playing' && (
        <>
          <header className="city-header">
            <button
              className="game-logo"
              onClick={() => setPhase('landing')}
              aria-label="Return to title screen"
            >
              REVAN<span>ZHAFRAN</span>
              <small>— PORTFOLIO —</small>
            </button>
            <div className="hud-tools">
              <button
                className="hud-icon"
                aria-label="World map"
                onClick={() => setPanel('map')}
              >
                <Map size={20} />
              </button>
              <button
                className="hud-icon"
                aria-label="Pengaturan"
                onClick={() => setPanel('settings')}
              >
                <Settings size={20} />
              </button>
            </div>
          </header>
          <div className="exploration-status">
            <span className="status-dot" />{' '}
            {visited.length === 5
              ? 'CITY EXPLORER · COMPLETE'
              : `${visited.length} / 5 PLACES DISCOVERED`}
          </div>
          <div className="city-help">
            <kbd>W A S D</kbd>
            <span>or arrows to walk</span>
            <kbd>E</kbd>
            <span>to interact</span>
            <small>Click anywhere on a clear path to move.</small>
          </div>
          <button
            className="minimap-button"
            aria-label="Open city map"
            onClick={() => setPanel('map')}
          >
            <WorldMap position={position} visited={visited} />
            <span>
              <Map size={12} /> CITY MAP <span>↗</span>
            </span>
          </button>
          {near && (
            <div className="city-interaction">
              <button onClick={() => visit(near.id)}>
                <kbd>E</kbd> Explore {near.name} <ArrowRight size={15} />
              </button>
            </div>
          )}
          <nav
            id="city-navigation"
            className="city-navigation"
            aria-label="Portfolio navigation"
          >
            {[
              ['about', 'About me'],
              ['experience', 'Resume'],
              ['projects', 'Projects'],
              ['skills', 'Technologies'],
              ['guestbook', 'Guestbook'],
              ['contact', 'Contact'],
            ].map(([id, label]) => (
              <button key={id} onClick={() => visit(id)}>
                {label}
                {visited.includes(id) && <span>✓</span>}
              </button>
            ))}
          </nav>
          <div className="city-dpad" aria-label="Movement controls">
            {['up', 'left', 'down', 'right'].map((d, i) => (
              <button
                key={d}
                className={d}
                aria-label={`Move ${d}`}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  setControls({ [d]: true });
                }}
                onPointerUp={() => setControls({})}
                onPointerCancel={() => setControls({})}
              >
                {['↑', '←', '↓', '→'][i]}
              </button>
            ))}
          </div>
        </>
      )}
      <Modal
        open={phase === 'intro'}
        onOpenChange={(v) => {
          if (!v) setPhase('landing');
        }}
        title="Every adventure starts somewhere."
        className="intro-modal"
      >
        <Intro onDone={doneIntro} reduced={reduced} />
      </Modal>
      <Modal
        open={phase === 'create'}
        onOpenChange={(v) => {
          if (!v) setPhase('landing');
        }}
        title="Meet your tiny alter ego."
        className="character-modal"
      >
        <p>Pick a look. There’s no wrong way to be you.</p>
        <div className="character-layout">
          <div className="character-preview">
            <div className="preview-spark">✦</div>
            <PixelCharacter character={character} size={160} />
            <span>THE CURIOUS TRAVELER</span>
            <small>Level 01 · Ready to explore</small>
          </div>
          <div className="character-options">
            <fieldset>
              <legend>Character</legend>
              <div className="option-row">
                {[
                  ['male', 'Masculine'],
                  ['female', 'Feminine'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    className={cn(
                      'option',
                      character.gender === value && 'selected',
                    )}
                    aria-pressed={character.gender === value}
                    onClick={() =>
                      setCharacter((c) => ({ ...c, gender: value }))
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>Skin tone</legend>
              <div className="option-row">
                {SKINS.map((color, i) => (
                  <button
                    key={color}
                    className={cn('swatch', character.skin === i && 'selected')}
                    style={{ background: color }}
                    aria-label={`Skin tone ${i + 1}`}
                    aria-pressed={character.skin === i}
                    onClick={() => setCharacter((c) => ({ ...c, skin: i }))}
                  >
                    {character.skin === i ? '✓' : ''}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>Outfit</legend>
              <div className="option-row">
                {OUTFITS.map((color, i) => (
                  <button
                    key={color}
                    className={cn(
                      'swatch',
                      character.outfit === i && 'selected',
                    )}
                    style={{ background: color }}
                    aria-label={`Outfit ${['sunflower', 'denim', 'terracotta', 'sage'][i]}`}
                    aria-pressed={character.outfit === i}
                    onClick={() => setCharacter((c) => ({ ...c, outfit: i }))}
                  >
                    {character.outfit === i ? '✓' : ''}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        </div>
        <button className="button primary full" onClick={enter}>
          Let the adventure begin <ArrowRight size={18} />
        </button>
        <small className="save-note">
          Your character and discoveries are saved on this device.
        </small>
      </Modal>
      <Modal
        open={!!panel}
        onOpenChange={(v) => {
          if (!v) setPanel(null);
        }}
        title={TITLES[panel] || 'Field notes'}
      >
        {panel === 'map' ? (
          <WorldMap
            large
            position={position}
            visited={visited}
            onTravel={(id) => {
              setDestination({ id, stamp: Date.now() });
              setPanel(null);
              setPhase('playing');
              setControls({});
              setTimeout(() => stage.current?.focus(), 0);
            }}
          />
        ) : panel === 'settings' ? (
          <div className="settings-list">
            <label>
              <span>
                <strong>City soundtrack</strong>
                <small>A quiet, original melody. Off by default.</small>
              </span>
              <input
                type="checkbox"
                checked={music}
                onChange={(e) => setMusic(e.target.checked)}
              />
            </label>
            <label>
              <span>
                <strong>Reduce motion</strong>
                <small>
                  Skip automatic cutscene playback and walking animation.
                </small>
              </span>
              <input
                type="checkbox"
                checked={!!reduced}
                disabled={!!preferredReduced}
                onChange={(e) => setManualReduced(e.target.checked)}
              />
            </label>
            <button
              className="button"
              onClick={() => {
                setPanel(null);
                setPhase('create');
                setControls({});
              }}
            >
              Change character <ArrowRight size={16} />
            </button>
            <div className="note">
              <Map size={18} /> Every section is also accessible from the
              portfolio navigation at the bottom of the screen.
            </div>
          </div>
        ) : (
          panel && (
            <>
              {offline && (
                <p className="offline-note">
                  Konten template ditampilkan. Backend belum terhubung;
                  pengiriman pesan memerlukan server aktif.
                </p>
              )}
              <PortfolioContent section={panel} data={data} />
            </>
          )
        )}
      </Modal>
    </div>
  );
}
