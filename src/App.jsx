import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Map,
  Settings,
  X,
  Fish,
  Backpack,
  BookOpen,
  ShoppingBag,
  Coins,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import seed from './data/portfolio.json';
import { LOCATIONS, OUTFITS, SKINS } from './game/art';
import PixelCharacter from './components/PixelCharacter';
import Cutscene from './components/Cutscene';
import useMusic from './hooks/useMusic';
import useFishing from './hooks/useFishing';
import WorldMap from './components/WorldMap';
import PortfolioContent, { api } from './components/PortfolioContent';
import Admin from './components/Admin';
const FishingGame = lazy(() => import('./components/FishingGame'));
const FishingHub = lazy(() => import('./components/FishingHub'));
const FISHING_PANELS = ['fishing', 'rift', 'backpack', 'journal', 'shop'];
const World = lazy(() => import('./game/World'));
const cn = (...inputs) => twMerge(clsx(inputs));
const DEFAULT = { gender: 'male', outfit: 0, skin: 0 };
const TITLES = {
  map: 'Explore Revan’s city.',
  fishing: 'Moonwater Angler’s Club.',
  rift: 'The other side of the water.',
  backpack: 'Your little collection.',
  journal: 'A field guide to wonder.',
  shop: 'Mira’s Tackle Shop.',
  about: 'A little about me.',
  projects: 'Made with curiosity.',
  skills: 'My inventory.',
  experience: 'The journey so far.',
  contact: 'A letter to Revan.',
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
export default function App() {
  const [saved] = useState(readSave),
    [character, setCharacter] = useState(saved?.character || DEFAULT),
    [visited, setVisited] = useState(saved?.visited || []);
  const fishing = useFishing();
  const [worldFishing, setWorldFishing] = useState(null);
  const [resetFishing, setResetFishing] = useState(false);
  const [position, setPosition] = useState({ x: 800, y: 545 });
  const [destination, setDestination] = useState(null);
  const [travel, setTravel] = useState(null);
  const [questsOpen, setQuestsOpen] = useState(
    () => window.innerWidth > 760 && window.innerHeight > 650,
  );
  const [phase, setPhase] = useState('landing'),
    [panel, setPanel] = useState(null),
    [near, setNear] = useState(null),
    [controls, setControls] = useState({}),
    [data, setData] = useState(seed),
    [offline, setOffline] = useState(false),
    [music, setMusic] = useState(false),
    [manualReduced, setManualReduced] = useState(false);
  const inWorldFishing = ['fishing', 'rift'].includes(panel);
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
    setDestination(null);
    setTravel(null);
    const locationId = id;
    if (LOCATIONS.some((l) => l.id === locationId))
      setVisited((v) => (v.includes(locationId) ? v : [...v, locationId]));
  }, []);
  const tripSequence = useRef(0);
  const walkTo = useCallback((panelId, open = true) => {
    const id = panelId;
    setPanel(null);
    setControls({});
    setDestination({ id, panel: panelId, open, stamp: ++tripSequence.current });
    setTimeout(() => stage.current?.focus(), 0);
  }, []);
  const doneIntro = useCallback(() => setPhase('create'), []);
  const enter = () => {
    setDestination(null);
    setTravel(null);
    setPhase('playing');
    setControls({});
    setTimeout(() => stage.current?.focus(), 0);
  };
  if (window.location.pathname === '/admin') return <Admin />;
  return (
    <div className={cn('city-app', inWorldFishing && 'is-fishing')}>
      {phase === 'playing' && (
        <a className="skip-link" href="#city-navigation">
          Skip to portfolio navigation
        </a>
      )}
      <main
        className="city-stage"
        ref={stage}
        data-player-x={position.x}
        data-player-y={position.y}
        tabIndex={phase === 'intro' ? -1 : 0}
        aria-hidden={phase === 'intro' ? true : undefined}
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
            paused={(!!panel && !inWorldFishing) || phase !== 'playing'}
            fishing={
              inWorldFishing
                ? { ...worldFishing, spot: panel, rod: fishing.state.equipped }
                : null
            }
            controls={controls}
            onNear={setNear}
            onVisit={visit}
            reducedMotion={reduced}
            onPosition={setPosition}
            destination={destination}
            onTravel={setTravel}
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
            <button
              className="play-button"
              onClick={() => {
                setPhase('intro');
                setMusic(true);
              }}
            >
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
              onClick={() => {
                setDestination(null);
                setTravel(null);
                setPhase('landing');
              }}
              aria-label="Return to title screen"
            >
              REVAN<span>ZHAFRAN</span>
              <small>— PORTFOLIO —</small>
            </button>
            <div className="hud-tools">
              <span
                className="hud-coins"
                aria-label={`${fishing.state.coins} fishing coins`}
              >
                <Coins size={16} />
                {fishing.state.coins}
              </span>
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
          <nav className="angler-tools" aria-label="Angler tools">
            {[
              ['fishing', 'Go fishing', Fish],
              ['backpack', 'Backpack', Backpack],
              ['journal', 'Fish journal', BookOpen],
              ['shop', 'Tackle shop', ShoppingBag],
            ].map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() =>
                  ['fishing', 'shop'].includes(id) ? walkTo(id) : visit(id)
                }
              >
                <Icon size={17} />
                {label}
                {id === 'backpack' && fishing.state.items.length > 0 && (
                  <span>{fishing.state.items.length}</span>
                )}
              </button>
            ))}
          </nav>
          <aside
            className={cn('quest-panel', !questsOpen && 'collapsed')}
            aria-label="City quests"
          >
            <button
              className="quest-toggle"
              aria-expanded={questsOpen}
              aria-controls="quest-list"
              onClick={() => setQuestsOpen((v) => !v)}
            >
              <span>
                ✦ QUEST JOURNAL <small>{visited.length} / 5</small>
              </span>
              <span>{questsOpen ? '−' : '+'}</span>
            </button>
            {questsOpen && (
              <div id="quest-list">
                <p>Get to know the person behind the pixels.</p>
                {LOCATIONS.map((l) => (
                  <button
                    key={l.id}
                    className={visited.includes(l.id) ? 'complete' : ''}
                    onClick={() => walkTo(l.id)}
                  >
                    <span className="quest-check">
                      {visited.includes(l.id) ? '✓' : '◇'}
                    </span>
                    <span>
                      {l.name}
                      <small>{l.subtitle}</small>
                    </span>
                    <span>→</span>
                  </button>
                ))}
                <div className="quest-progress">
                  <span style={{ width: `${(visited.length / 5) * 100}%` }} />
                </div>
                <small>
                  {visited.length === 5
                    ? 'City explorer complete. Thanks for visiting!'
                    : 'Enter each building to complete your journey.'}
                </small>
              </div>
            )}
          </aside>
          {travel && (
            <div className="travel-status" role="status">
              <span className="walking-icon">↟</span> Walking to {travel.name}
              <small>WASD / arrows / Esc to cancel</small>
            </div>
          )}
          <div className="city-help">
            <kbd>W A S D</kbd>
            <span>or arrows to walk</span>
            <kbd>E</kbd>
            <span>to interact</span>
            <small>Click a destination to find a safe route.</small>
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
              ['skills', 'Tech'],
              ['contact', 'Contact'],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => walkTo(id)}
                className={travel?.id === id ? 'travelling' : ''}
              >
                <span className="nav-label-desktop">{label}</span>
                <span className="nav-label-mobile">
                  {
                    {
                      about: 'About',
                      experience: 'CV',
                      projects: 'Work',
                      skills: 'Tech',
                      contact: 'Contact',
                    }[id]
                  }
                </span>
                {visited.includes(id) && (
                  <span className="nav-complete">✓</span>
                )}
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
      {phase === 'intro' && (
        <Cutscene
          onDone={doneIntro}
          reduced={reduced}
          character={character}
          music={music}
          onMusic={setMusic}
        />
      )}
      {phase === 'playing' && inWorldFishing && (
        <section
          className="world-fishing-controls"
          aria-label="Fishing at the water"
        >
          <button
            className="icon-button fishing-exit"
            aria-label="Stop fishing"
            onClick={() => {
              setPanel(null);
              stage.current?.focus();
            }}
          >
            <X size={18} />
          </button>
          <Suspense fallback={<p>Preparing your line…</p>}>
            <FishingGame
              key={panel}
              fishing={fishing}
              character={character}
              reduced={reduced}
              spot={panel === 'rift' ? 'rift' : 'pond'}
              onView={setPanel}
              onGoFishing={walkTo}
              embedded
              onGameChange={setWorldFishing}
            />
          </Suspense>
        </section>
      )}
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
        open={!!panel && !inWorldFishing}
        onOpenChange={(v) => {
          if (!v) setPanel(null);
        }}
        title={TITLES[panel] || 'Field notes'}
        className={FISHING_PANELS.includes(panel) ? 'fishing-modal' : undefined}
      >
        {FISHING_PANELS.includes(panel) ? (
          <Suspense
            fallback={
              <p className="fishing-loading">Opening your little adventure…</p>
            }
          >
            <FishingHub
              view={panel}
              fishing={fishing}
              character={character}
              reduced={reduced}
              onView={setPanel}
              onGoFishing={walkTo}
            />
          </Suspense>
        ) : panel === 'map' ? (
          <WorldMap
            large
            position={position}
            visited={visited}
            onTravel={(id) => walkTo(id)}
          />
        ) : panel === 'settings' ? (
          <div className="settings-list">
            <label>
              <span>
                <strong>City soundtrack</strong>
                <small>
                  An upbeat original chiptune with drums, bass and melody.
                </small>
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
                  Manual story playback, steady camera and reduced animation.
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
            <div className="fishing-reset">
              <strong>Fishing progress</strong>
              <p>
                Backpack, coins and rods are saved in this browser. Clearing
                browser storage removes them.
              </p>
              {!resetFishing ? (
                <button
                  className="button"
                  onClick={() => setResetFishing(true)}
                >
                  Reset fishing progress
                </button>
              ) : (
                <div className="reset-confirm">
                  <p>
                    Reset your coins, catches, journal and rod upgrades?
                    Portfolio discoveries stay intact.
                  </p>
                  <button
                    className="button"
                    onClick={() => setResetFishing(false)}
                  >
                    Keep my progress
                  </button>
                  <button
                    className="button"
                    onClick={() => {
                      fishing.dispatch({ type: 'reset' });
                      setResetFishing(false);
                    }}
                  >
                    Confirm fishing reset
                  </button>
                </div>
              )}
            </div>
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
