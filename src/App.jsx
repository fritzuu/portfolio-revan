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
import {
  ArrowRight,
  BookOpen,
  Compass,
  CodeXml,
  Map,
  MoveUpRight,
  Settings,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import seed from './data/portfolio.json';
import { LOCATIONS, OUTFITS, SKINS } from './game/art';
import PixelCharacter from './components/PixelCharacter';
import IntroArt from './components/IntroArt';
import PortfolioContent, { api } from './components/PortfolioContent';
import Admin from './components/Admin';
const World = lazy(() => import('./game/World'));
const cn = (...inputs) => twMerge(clsx(inputs));
const DEFAULT = { gender: 'male', outfit: 0, skin: 0 };
const TITLES = {
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
    <div className="app-shell">
      <a className="skip-link" href="#destinations">
        Langsung ke isi portfolio
      </a>
      <header className="site-header">
        <a className="brand" href="/" aria-label="Revan’s World home">
          <span className="brand-icon">
            r<span>✦</span>
          </span>
          <span>
            revan<span className="brand-world">’s world</span>
            <small>A DEVELOPER’S LITTLE UNIVERSE</small>
          </span>
        </a>
        <div className="header-right">
          <span className="availability">
            <span /> Available for opportunities
          </span>
          <button className="button small" onClick={() => visit('about')}>
            Portfolio <MoveUpRight size={14} />
          </button>
          <button
            className="icon-button"
            aria-label="Pengaturan"
            onClick={() => setPanel('settings')}
          >
            <Settings size={18} />
          </button>
        </div>
      </header>
      <main>
        <section className={cn('hero', phase === 'playing' && 'hero-playing')}>
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="tiny-diamond">◆</span>{' '}
              {phase === 'playing'
                ? 'YOUR ADVENTURE, YOUR PACE'
                : 'NOT YOUR USUAL PORTFOLIO'}
            </div>
            <motion.h1
              initial={{ opacity: 0, y: reduced ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {phase === 'playing' ? (
                <>
                  Make yourself <em>at home.</em>
                </>
              ) : (
                <>
                  A little world.
                  <br />A lot of <em>possibilities.</em>
                </>
              )}
            </motion.h1>
            <p>
              {phase === 'playing' ? (
                'Follow the paths. Knock on a door. Get to know the person behind the pixels.'
              ) : (
                <>
                  Hey, I’m Revan — a full stack developer.
                  <br />
                  Come explore the things I build, one pixel at a time.
                </>
              )}
            </p>
            {phase === 'landing' && (
              <div className="hero-actions">
                <button
                  className="button primary large"
                  onClick={() => setPhase('intro')}
                >
                  Enter the world <ArrowRight size={18} />
                </button>
                {saved ? (
                  <button className="button text" onClick={enter}>
                    Continue adventure ↗
                  </button>
                ) : (
                  <button
                    className="button text"
                    onClick={() => visit('projects')}
                  >
                    Just here for the projects? ↗
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="hero-aside">
            <span className="decorative-star">✳</span>
            <span>
              BUILT WITH CARE.
              <br />
              EXPLORED WITH CURIOSITY.
            </span>
          </div>
        </section>
        <section
          className={cn('game-section', phase === 'playing' && 'is-playing')}
          aria-label="Interactive portfolio village"
        >
          <div className="game-frame">
            <div className="game-topbar">
              <span>
                <span className="live-dot" /> REVAN / VILLAGE
              </span>
              <span>
                <Compass size={13} />{' '}
                {phase === 'playing'
                  ? 'EXPLORING'
                  : 'A SMALL WORLD, A BIG HELLO'}
              </span>
              <span>01 : COZY AFTERNOON</span>
            </div>
            {phase === 'playing' && (
              <div className="quest-summary">
                <div>
                  <span className="eyebrow">TODAY’S LITTLE QUEST</span>
                  <strong>
                    {visited.length === 5
                      ? 'Adventure complete!'
                      : 'Get to know Revan'}
                  </strong>
                </div>
                <div className="quest-summary-progress">
                  <div className="quest-dots">
                    {LOCATIONS.map((l) => (
                      <span
                        key={l.id}
                        className={visited.includes(l.id) ? 'done' : ''}
                      />
                    ))}
                  </div>
                  <small>{visited.length}/5 places discovered</small>
                </div>
              </div>
            )}
            <div
              className="world-stage"
              ref={stage}
              tabIndex={0}
              aria-label="Area game. Bergerak dengan WASD atau tombol panah. Tekan E dekat pintu."
              onBlur={() => setControls({})}
              onKeyDown={(e) => {
                if (
                  phase === 'playing' &&
                  !panel &&
                  [
                    'ArrowUp',
                    'ArrowDown',
                    'ArrowLeft',
                    'ArrowRight',
                    ' ',
                  ].includes(e.key)
                )
                  e.preventDefault();
              }}
            >
              <Suspense
                fallback={
                  <div className="world-loading">
                    Preparing your little adventure…
                    <div className="loading-blocks">▪ ▪ ▪ ▪</div>
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
                />
              </Suspense>
              {phase === 'landing' && (
                <div className="world-invite">
                  <span>YOUR NEXT ADVENTURE</span>
                  <strong>Five places. One story.</strong>
                  <span>Choose a character & follow your curiosity.</span>
                </div>
              )}
              {phase === 'playing' && (
                <>
                  <div className="interaction">
                    <button
                      className="button primary"
                      disabled={!near}
                      onClick={() => near && visit(near.id)}
                    >
                      {near ? (
                        <>
                          {' '}
                          <kbd>E</kbd> Enter {near.name}
                        </>
                      ) : (
                        'Follow a path to a doorway'
                      )}
                    </button>
                  </div>
                  <div className="dpad" aria-label="Kontrol gerak">
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
            </div>
            <div className="game-bottom">
              <span>
                <kbd>W A S D</kbd> / <kbd>↑ ↓ ← →</kbd> move{' '}
                <span className="desktop-hint">
                  · <kbd>E</kbd> interact
                </span>
              </span>
              <span>
                Click or tap to walk <span className="tiny-diamond">◆</span>{' '}
                Take your time.
              </span>
            </div>
          </div>
        </section>
        <section className="destinations" id="destinations">
          <div className="destination-heading">
            <span className="eyebrow">A FEW PLACES TO START</span>
            <span>
              Explore by foot. Or take a shortcut. <ArrowRight size={14} />
            </span>
          </div>
          <nav className="destination-grid" aria-label="Portfolio locations">
            {LOCATIONS.map((l, i) => (
              <button key={l.id} onClick={() => visit(l.id)}>
                <span className="destination-number">0{i + 1}</span>
                <span>
                  <strong>{l.name}</strong>
                  <small>{l.subtitle}</small>
                </span>
                <span className="destination-arrow">
                  {visited.includes(l.id) ? '✓' : '↗'}
                </span>
              </button>
            ))}
          </nav>
        </section>
        <section className="closing-note">
          <span className="pixel-flower">✿</span>
          <p>
            A portfolio is a collection of work.
            <br />
            <strong>This one is a place you can visit.</strong>
          </p>
          <button className="button" onClick={() => visit('guestbook')}>
            <BookOpen size={16} /> Sign the guestbook
          </button>
        </section>
      </main>
      <footer>
        <span>
          © {new Date().getFullYear()} {data.profile.name}
        </span>
        <span>Made with code, coffee & a little imagination.</span>
        <a
          href={data.profile.github}
          target="_blank"
          rel="noreferrer"
          aria-label="Revan di GitHub"
        >
          <CodeXml size={18} />
        </a>
      </footer>
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
        {panel === 'settings' ? (
          <div className="settings-list">
            <label>
              <span>
                <strong>Village soundtrack</strong>
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
              <Map size={18} /> Everything is also accessible from the five
              location buttons below the world.
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
