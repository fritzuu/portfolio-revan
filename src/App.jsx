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
  Menu,
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
import './buildingRoom.css';
import { LOCATIONS, OUTFITS, SKINS } from './game/art';
import PixelCharacter from './components/PixelCharacter';
import Cutscene from './components/Cutscene';
import useMusic from './hooks/useMusic';
import useExploration from './hooks/useExploration';
import ExplorationPanel from './components/ExplorationPanel';
import FootballChallenge from './components/FootballChallenge';
import { gateUnlocked } from './game/exploration';
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
  notebook: 'Little discoveries.',
  jekek: 'Jekek’s Garden.',
  dream: 'Dream Grove.',
  story: 'A moment with Revan.',
  shortcut: 'The Garden Gate.',
  shore: 'The patient anglers.',
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
function getDistrict(p) {
  return p.x > 1700 && p.y > 720 && p.y < 1120
    ? 'grove'
    : p.x > 1690 && p.y < 650
      ? 'garden'
      : p.y > 1130 && p.x < 1330
        ? 'football'
        : p.x > 1500 && p.y > 1230
          ? 'shore'
          : 'town';
}
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
  const { discoveries, discover } = useExploration();
  const [night, setNight] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsMenu = useRef(null);
  useEffect(() => {
    if (!toolsOpen) return;
    const dismiss = (event) => {
      if (!toolsMenu.current?.contains(event.target)) setToolsOpen(false);
    };
    const escape = (event) => {
      if (event.key !== 'Escape') return;
      setToolsOpen(false);
      toolsMenu.current?.querySelector('button')?.focus();
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [toolsOpen]);
  const [footballMode, setFootballMode] = useState('watch');
  const [footballDifficulty, setFootballDifficulty] = useState('santai');
  const [matchState, setMatchState] = useState({
    score: [0, 0],
    clock: 60,
    half: 1,
    status: 'playing',
    stamina: 100,
    event: 'Kick off',
  });
  const [kick, setKick] = useState(null);
  const [shots, setShots] = useState([]);
  const [shotBusy, setShotBusy] = useState(false);
  const onShot = useCallback((goal) => {
    setShots((previous) =>
      previous.length < 3 ? [...previous, goal] : previous,
    );
    setShotBusy(false);
  }, []);

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
  useEffect(() => {
    const release = () => setControls({});
    const hidden = () => {
      if (document.hidden) release();
    };
    window.addEventListener('blur', release);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      window.removeEventListener('blur', release);
      document.removeEventListener('visibilitychange', hidden);
    };
  }, []);
  const inWorldFishing = ['fishing', 'rift'].includes(panel);
  const preferredReduced = useReducedMotion(),
    reduced = manualReduced || preferredReduced,
    stage = useRef(null);
  useEffect(() => {
    if (panel !== 'football') return;
    const exit = (event) => {
      if (event.code !== 'Escape') return;
      setPanel(null);
      setFootballMode('watch');
      setControls({});
      setTimeout(() => stage.current?.focus(), 0);
    };
    window.addEventListener('keydown', exit);
    return () => window.removeEventListener('keydown', exit);
  }, [panel]);
  const district = getDistrict(position);
  const playSound = useMusic(music, district);
  const [notice, setNotice] = useState(null);
  const noticeTimer = useRef(null),
    lastDistrict = useRef(null);
  const noticePriority = useRef(0);
  const notify = useCallback((message, priority = false) => {
    if (!priority && Date.now() < noticePriority.current) return;
    if (priority) noticePriority.current = Date.now() + 2600;
    setNotice(message);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 2600);
  }, []);
  useEffect(() => () => clearTimeout(noticeTimer.current), []);
  const reportPosition = useCallback(
    (p) => {
      setPosition(p);
      const area = getDistrict(p);
      if (phase === 'playing' && area !== lastDistrict.current) {
        lastDistrict.current = area;
        notify(
          {
            garden: 'Jekek’s Garden',
            grove: 'Dream Grove',
            football: 'Football Park',
            shore: 'Angler’s Shore',
            town: 'Revan’s Town',
          }[area],
        );
      }
    },
    [phase, notify],
  );
  const reportDiscovery = useCallback(
    (id) => {
      if (!discoveries.includes(id)) {
        notify(
          `NEW FIELD NOTE · ${id === 'dream' ? 'Darkrai' : id === 'jekek' ? 'Jekek' : id}`,
          true,
        );
        playSound('discover');
      }
      discover(id);
    },
    [discoveries, discover, notify, playSound],
  );
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
  const visit = useCallback(
    (id) => {
      setPanel(id);
      if (['jekek', 'story', 'football', 'shore'].includes(id)) discover(id);
      setControls({});
      setDestination(null);
      setTravel(null);
      const locationId = id;
      if (LOCATIONS.some((l) => l.id === locationId))
        setVisited((v) => (v.includes(locationId) ? v : [...v, locationId]));
    },
    [discover],
  );
  const tripSequence = useRef(0);
  const walkTo = useCallback((panelId, open = true) => {
    const id = panelId;
    setPanel(null);
    setControls({});
    setDestination({ id, panel: panelId, open, stamp: ++tripSequence.current });
    setTimeout(() => stage.current?.focus(), 0);
  }, []);
  const teleport = useCallback(
    (id) => {
      if (!gateUnlocked(discoveries)) return;
      setPanel(null);
      setControls({});
      setDestination({
        id,
        open: false,
        teleport: true,
        stamp: ++tripSequence.current,
      });
      setTimeout(() => stage.current?.focus(), 0);
    },
    [discoveries],
  );
  const [editingCharacter, setEditingCharacter] = useState(false);
  const enter = useCallback(() => {
    setDestination(null);
    setTravel(null);
    setPhase('playing');
    setControls({});
    setTimeout(() => stage.current?.focus(), 0);
  }, []);
  if (window.location.pathname === '/admin') return <Admin />;
  return (
    <div
      className={cn(
        'city-app',
        inWorldFishing && 'is-fishing',
        panel === 'football' && 'is-football',
        panel === 'football' &&
          ['messi', 'yamal'].includes(footballMode) &&
          'is-match',
      )}
    >
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
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setControls({});
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
            onPosition={reportPosition}
            destination={destination}
            onTravel={setTravel}
            onDiscover={reportDiscovery}
            onNight={setNight}
            kick={kick}
            onShot={onShot}
            footballMode={footballMode}
            footballDifficulty={footballDifficulty}
            onMatchState={setMatchState}
            onSound={playSound}
            discoveries={discoveries}
            footballActive={panel === 'football'}
          />
        </Suspense>
      </main>
      {phase === 'playing' && notice && panel !== 'football' && (
        <div className="world-notice" role="status">
          {notice}
        </div>
      )}
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
                setEditingCharacter(false);
                setPhase('create');
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
              <button
                className="hud-icon"
                aria-label={`Discovery notebook, ${discoveries.length} found`}
                title={`${discoveries.length} / 5 discoveries`}
                onClick={() => setPanel('notebook')}
              >
                <BookOpen size={20} />
              </button>
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
          <div className="angler-menu" ref={toolsMenu}>
            <button
              className="angler-menu-toggle hud-icon"
              aria-label={toolsOpen ? 'Close game menu' : 'Open game menu'}
              aria-expanded={toolsOpen}
              aria-controls="angler-navigation"
              onClick={() => setToolsOpen((open) => !open)}
            >
              {toolsOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            {toolsOpen && (
              <nav
                id="angler-navigation"
                className="angler-tools"
                aria-label="Angler tools"
              >
                {[
                  ['fishing', 'Go fishing', Fish],
                  ['backpack', 'Backpack', Backpack],
                  ['journal', 'Fish journal', BookOpen],
                  ['shop', 'Tackle shop', ShoppingBag],
                ].map(([id, label, Icon]) => (
                  <button
                    key={id}
                    onClick={() => {
                      setToolsOpen(false);
                      if (['fishing', 'shop'].includes(id)) walkTo(id);
                      else visit(id);
                    }}
                  >
                    <Icon size={17} />
                    {label}
                    {id === 'backpack' && fishing.state.items.length > 0 && (
                      <span>{fishing.state.items.length}</span>
                    )}
                  </button>
                ))}
              </nav>
            )}
          </div>
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
              <span className="walking-icon">↟</span>{' '}
              {travel.exiting
                ? 'Leaving'
                : travel.entering
                  ? 'Entering'
                  : 'Walking to'}{' '}
              {travel.name}
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
            <WorldMap
              position={position}
              visited={[...visited, ...discoveries]}
            />
            <span>
              <Map size={12} /> CITY MAP <span>↗</span>
            </span>
          </button>
          {near && (
            <div className="city-interaction">
              <button
                onClick={() =>
                  LOCATIONS.some((l) => l.id === near.id)
                    ? walkTo(near.id)
                    : visit(near.id)
                }
              >
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
                  e.preventDefault();
                  e.currentTarget.setPointerCapture(e.pointerId);
                  setControls((previous) => ({ ...previous, [d]: true }));
                }}
                onPointerUp={() =>
                  setControls((previous) => ({ ...previous, [d]: false }))
                }
                onPointerCancel={() =>
                  setControls((previous) => ({ ...previous, [d]: false }))
                }
                onLostPointerCapture={() =>
                  setControls((previous) => ({ ...previous, [d]: false }))
                }
              >
                {['↑', '←', '↓', '→'][i]}
              </button>
            ))}
          </div>
        </>
      )}
      {phase === 'intro' && (
        <Cutscene
          onDone={enter}
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
          if (!v) {
            if (editingCharacter) enter();
            else setPhase('landing');
          }
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
        <button
          className="button primary full"
          onClick={() => {
            if (editingCharacter) enter();
            else setPhase('intro');
          }}
        >
          {editingCharacter ? 'Back to the world' : 'Begin the story'}{' '}
          <ArrowRight size={18} />
        </button>
        <small className="save-note">
          Your character and discoveries are saved on this device.
        </small>
      </Modal>
      {phase === 'playing' && panel === 'football' && (
        <FootballChallenge
          mode={footballMode}
          difficulty={footballDifficulty}
          onDifficulty={(value) => {
            setFootballDifficulty(value);
            stage.current?.focus();
          }}
          match={matchState}
          onMode={(mode) => {
            setFootballMode(mode);
            setShots([]);
            setShotBusy(false);
            setControls({});
            setTimeout(() => stage.current?.focus(), 0);
          }}
          onControl={(name, held) =>
            setControls((previous) => ({ ...previous, [name]: held }))
          }
          onAction={(type, details = {}) => {
            setKick({ ...details, type, stamp: ++tripSequence.current });
            setTimeout(() => stage.current?.focus(), 0);
          }}
          results={shots}
          busy={shotBusy}
          reduced={reduced}
          onClose={() => {
            setPanel(null);
            setFootballMode('watch');
            setControls({});
            setTimeout(() => stage.current?.focus(), 0);
          }}
          onReset={() => {
            setShots([]);
            setShotBusy(false);
          }}
          onKick={(aim) => {
            if (shotBusy || shots.length >= 3) return;
            setShotBusy(true);
            setKick({ aim, stamp: ++tripSequence.current });
          }}
        />
      )}
      <Modal
        open={!!panel && !inWorldFishing && panel !== 'football'}
        onOpenChange={(v) => {
          if (!v) {
            setPanel(null);
            setTimeout(() => stage.current?.focus(), 0);
          }
        }}
        title={TITLES[panel] || 'Field notes'}
        className={cn(
          FISHING_PANELS.includes(panel) && 'fishing-modal',
          LOCATIONS.some((l) => l.id === panel) &&
            `portfolio-room room-${panel}`,
        )}
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
            visited={[...visited, ...discoveries]}
            onTravel={(id) => walkTo(id)}
          />
        ) : [
            'notebook',
            'jekek',
            'dream',
            'story',
            'shortcut',
            'shore',
          ].includes(panel) ? (
          <ExplorationPanel
            view={panel}
            onSound={playSound}
            discoveries={discoveries}
            night={night}
            onTravel={walkTo}
            onTeleport={teleport}
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
                setEditingCharacter(true);
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
