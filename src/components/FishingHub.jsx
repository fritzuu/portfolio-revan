import { useMemo, useState } from 'react';
import {
  Backpack,
  BookOpen,
  Fish,
  ShoppingBag,
  Coins,
  LockKeyhole,
  UnlockKeyhole,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { FISH, RARITIES, RODS } from '../fishing/catalog';
import { unlockedRift } from '../fishing/engine';
import FishingGame from './FishingGame';
import FishArt from './FishArt';
export default function FishingHub({
  view,
  fishing,
  character,
  reduced,
  onView,
  onGoFishing,
}) {
  const { state, dispatch, storageAvailable } = fishing;
  const [quantities, setQuantities] = useState({}),
    [review, setReview] = useState(null),
    [expanded, setExpanded] = useState(null),
    [notice, setNotice] = useState('');
  const groups = useMemo(
    () =>
      FISH.map((fish) => ({
        fish,
        items: state.items.filter((i) => i.fishId === fish.id),
      })).filter((g) => g.items.length),
    [state.items],
  );
  const selected = groups.flatMap((g) =>
    g.items.filter((i) => !i.locked).slice(0, quantities[g.fish.id] || 0),
  );
  const selling = review
    ? state.items.filter((i) => review.includes(i.id) && !i.locked)
    : [];
  const saleTotal = selling.reduce((sum, i) => sum + i.value, 0);
  const isFishing = ['fishing', 'rift'].includes(view);
  const total = Object.keys(state.discovered).length;
  const rod = RODS.find((r) => r.id === state.equipped);
  return (
    <div className={`fishing-hub ${isFishing ? 'playing-panel' : ''}`}>
      <div className="angler-header">
        <div>
          <span className="eyebrow">MOONWATER / ANGLER’S CLUB</span>
          <h3>A little detour into wonder.</h3>
        </div>
        <div className="coin-pouch">
          <Coins size={20} />
          <strong>{state.coins}</strong>
          <span>coins</span>
        </div>
      </div>
      <nav className="fishing-tabs" aria-label="Fishing menu">
        {[
          ['fishing', 'Fish', Fish],
          ['backpack', 'Backpack', Backpack],
          ['journal', 'Fish Journal', BookOpen],
          ['shop', 'Tackle Shop', ShoppingBag],
        ].map(([id, label, Icon]) => (
          <button
            key={id}
            aria-current={
              view === id || (id === 'fishing' && view === 'rift')
                ? 'page'
                : undefined
            }
            onClick={() => {
              setReview(null);
              setNotice('');
              if (id === 'fishing') onGoFishing('fishing');
              else if (id === 'shop' && view !== 'shop') onGoFishing('shop');
              else onView(id);
            }}
          >
            <Icon size={16} />
            {label}
            {id === 'backpack' && <span>{state.items.length}</span>}
          </button>
        ))}
      </nav>
      {!storageAvailable && (
        <p className="offline-note">
          Browser storage is unavailable. You can still play, but progress will
          last only while this page stays open.
        </p>
      )}
      {notice && (
        <p className="fishing-notice" role="status">
          {notice}
        </p>
      )}
      {isFishing ? (
        <FishingGame
          key={view}
          fishing={fishing}
          character={character}
          reduced={reduced}
          spot={view === 'rift' ? 'rift' : 'pond'}
          onView={onView}
          onGoFishing={onGoFishing}
        />
      ) : view === 'backpack' ? (
        <>
          <div className="fishing-section-head">
            <div>
              <h3>Your pocket of possibilities.</h3>
              <p>
                {state.items.length} catches ·{' '}
                {state.items.filter((i) => i.locked).length} locked · {rod.name}{' '}
                equipped
              </p>
            </div>
            <button
              className="button"
              disabled={!state.items.some((i) => !i.locked)}
              onClick={() =>
                setReview(state.items.filter((i) => !i.locked).map((i) => i.id))
              }
            >
              Sell all unlocked
            </button>
          </div>
          {!groups.length ? (
            <div className="fishing-empty">
              <Backpack size={38} />
              <h3>Room for your first discovery.</h3>
              <p>
                Your catches live here. A Twigline is already waiting for you.
              </p>
              <button
                className="button primary"
                onClick={() => onGoFishing('fishing')}
              >
                Walk to the dock <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <>
              <div className="backpack-grid">
                {groups.map(({ fish, items }) => {
                  const available = items.filter((i) => !i.locked),
                    qty = Math.min(quantities[fish.id] || 0, available.length);
                  return (
                    <article
                      className="backpack-card"
                      key={fish.id}
                      style={{ '--fish-color': RARITIES[fish.rarity].color }}
                    >
                      <div className="fish-card-top">
                        <FishArt fish={fish} />
                        <span className="fish-stack">×{items.length}</span>
                      </div>
                      <span className="rarity-tag">
                        {RARITIES[fish.rarity].label}
                      </span>
                      <h4>{fish.name}</h4>
                      <p>
                        {available.length} available ·{' '}
                        {items.length - available.length} locked
                      </p>
                      <label className="sell-quantity">
                        Sell quantity{' '}
                        <input
                          type="number"
                          aria-label={`Sell quantity of ${fish.name}`}
                          min={0}
                          max={available.length}
                          value={qty}
                          disabled={!available.length}
                          onChange={(e) =>
                            setQuantities((v) => ({
                              ...v,
                              [fish.id]: Math.max(
                                0,
                                Math.min(
                                  available.length,
                                  Number(e.target.value) || 0,
                                ),
                              ),
                            }))
                          }
                        />
                      </label>
                      <button
                        className="catch-details"
                        aria-expanded={expanded === fish.id}
                        onClick={() =>
                          setExpanded((v) => (v === fish.id ? null : fish.id))
                        }
                      >
                        {expanded === fish.id
                          ? 'Hide catches'
                          : 'Inspect & lock catches'}{' '}
                        ↗
                      </button>
                      {expanded === fish.id && (
                        <ul className="individual-catches">
                          {items.map((item) => (
                            <li key={item.id}>
                              <span>
                                {item.size} cm<small>{item.value} coins</small>
                              </span>
                              <button
                                aria-label={`${item.locked ? 'Unlock' : 'Lock'} ${fish.name} ${item.size} cm`}
                                aria-pressed={item.locked}
                                onClick={() =>
                                  dispatch({ type: 'lock', id: item.id })
                                }
                              >
                                {item.locked ? (
                                  <LockKeyhole size={17} />
                                ) : (
                                  <UnlockKeyhole size={17} />
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </article>
                  );
                })}
              </div>
              <div className="sale-bar">
                <span>
                  {selected.length} selected{' '}
                  <strong>
                    {selected.reduce((s, i) => s + i.value, 0)} coins
                  </strong>
                </span>
                <button
                  className="button primary"
                  disabled={!selected.length}
                  onClick={() => setReview(selected.map((i) => i.id))}
                >
                  Review sale <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}
          {review && (
            <div
              className="sale-review"
              role="region"
              aria-label="Review fish sale"
            >
              <h3>Give your discoveries a new home?</h3>
              <p>
                {selling.length} unlocked catches will earn{' '}
                <strong>{saleTotal} coins</strong>. Your Fish Journal keeps
                every discovery.
              </p>
              <ul>
                {FISH.map((f) => ({
                  fish: f,
                  n: selling.filter((i) => i.fishId === f.id).length,
                }))
                  .filter((g) => g.n)
                  .map((g) => (
                    <li key={g.fish.id}>
                      {g.fish.name}
                      <span>×{g.n}</span>
                    </li>
                  ))}
              </ul>
              <div>
                <button className="button" onClick={() => setReview(null)}>
                  Keep my fish
                </button>
                <button
                  className="button primary"
                  disabled={!selling.length}
                  onClick={() => {
                    dispatch({ type: 'sell', ids: selling.map((i) => i.id) });
                    setNotice(
                      `Sold ${selling.length} catches for ${saleTotal} coins.`,
                    );
                    setReview(null);
                    setQuantities({});
                  }}
                >
                  Sell for {saleTotal} coins
                </button>
              </div>
            </div>
          )}
        </>
      ) : view === 'journal' ? (
        <>
          <div className="fishing-section-head">
            <div>
              <h3>Twenty creatures. Twenty stories.</h3>
              <p>
                {total} / 20 discovered · Discoveries stay here even after
                selling.
              </p>
            </div>
            <span className="journal-count">
              {total}
              <small>/ 20</small>
            </span>
          </div>
          <div className="journal-grid">
            {FISH.map((f) => {
              const entry = state.discovered[f.id];
              return (
                <article
                  key={f.id}
                  className={`journal-card ${entry ? 'discovered' : 'undiscovered'}`}
                  style={{ '--fish-color': RARITIES[f.rarity].color }}
                >
                  <span className="specimen-number">
                    NO. {String(f.index + 1).padStart(2, '0')}
                  </span>
                  <FishArt fish={f} silhouette={!entry} />
                  <span className="rarity-tag">{RARITIES[f.rarity].label}</span>
                  <h4>{entry ? f.name : 'An unwritten discovery'}</h4>
                  <p>
                    {entry
                      ? f.lore
                      : 'Somewhere beneath the surface, a little mystery is waiting.'}
                  </p>
                  {entry && (
                    <small>
                      {entry.count} caught · Best {entry.bestSize} cm
                    </small>
                  )}
                </article>
              );
            })}
          </div>
          <div className="rift-unlock">
            <Sparkles size={24} />
            <div>
              <h4>
                {unlockedRift(state)
                  ? 'Astral Crossing is awake.'
                  : 'An unlikely encounter awaits.'}
              </h4>
              <p>
                {unlockedRift(state)
                  ? 'The Unwritten can appear here. Base chance: 0.01% per cast before luck; catches still require skill.'
                  : `${total} / 12 species to unlock Astral Crossing and a chance at The Unwritten.`}
              </p>
            </div>
            <button className="button" onClick={() => onGoFishing('rift')}>
              Visit crossing ↗
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="tackle-welcome">
            <div className="merchant-portrait">✦</div>
            <div>
              <span className="eyebrow">MIRA / YOUR FRIEND AT THE SHORE</span>
              <h3>Good tools. Better stories.</h3>
              <p>
                Sell a few catches, choose a new rod, and see what the water has
                been keeping.
              </p>
            </div>
            <button className="button" onClick={() => onView('backpack')}>
              Sell your fish ↗
            </button>
          </div>
          <div className="rod-grid">
            {RODS.map((r, i) => {
              const owned = state.owned.includes(r.id),
                equipped = state.equipped === r.id;
              return (
                <article
                  className={`rod-card ${equipped ? 'equipped' : ''}`}
                  key={r.id}
                  style={{ '--rod-color': r.color }}
                >
                  <span className="eyebrow">
                    ROD {String(i + 1).padStart(2, '0')}
                  </span>
                  <svg
                    viewBox="0 0 100 150"
                    className="rod-art"
                    role="img"
                    aria-label={`${r.name} pixel fishing rod`}
                  >
                    <path
                      d="M24 125 L67 30 L74 12"
                      fill="none"
                      stroke={r.color}
                      strokeWidth="6"
                    />
                    <path
                      d="M70 18 L87 45 L87 107 L80 114 L74 105"
                      fill="none"
                      stroke="#aabdae"
                      strokeWidth="2"
                    />
                    <path
                      d="M20 120 L30 125 L26 136 L16 131 Z"
                      fill="#755c4b"
                    />
                    <rect
                      x="28"
                      y="106"
                      width="12"
                      height="12"
                      fill="#d5c29b"
                    />
                    {i === 0 ? (
                      <path d="M48 65 L35 52 L48 51 Z" fill="#98b977" />
                    ) : i === 1 ? (
                      <path d="M61 42 L70 46 L64 56 L58 54 Z" fill="#ebdfbc" />
                    ) : (
                      <>
                        <path
                          d="M67 25 L58 34 L66 45 L76 33 Z"
                          fill="#ecd1ef"
                        />
                        <path
                          d="M29 45 h12 m-6 -6 v12 M49 18 h10 m-5 -5 v10"
                          stroke="#d5b2df"
                          strokeWidth="2"
                        />
                      </>
                    )}
                  </svg>
                  <h4>{r.name}</h4>
                  <p>{r.description}</p>
                  <div className="rod-stats">
                    <span>+{Math.round(r.luck * 100)}% luck</span>
                    <strong>
                      {r.price ? `${r.price} coins` : 'Your first rod · Free'}
                    </strong>
                  </div>
                  <button
                    className="button primary full"
                    disabled={equipped || (!owned && state.coins < r.price)}
                    aria-pressed={equipped}
                    onClick={() => {
                      dispatch({ type: owned ? 'equip' : 'buy', id: r.id });
                      setNotice(
                        owned
                          ? `${r.name} equipped.`
                          : `${r.name} purchased and equipped.`,
                      );
                    }}
                  >
                    {equipped
                      ? 'Equipped'
                      : owned
                        ? 'Equip rod'
                        : state.coins < r.price
                          ? `Need ${r.price - state.coins} more coins`
                          : `Buy for ${r.price} coins`}
                  </button>
                </article>
              );
            })}
          </div>
          <p className="luck-explanation">
            Luck multiplies Rare, Epic, Legendary and Mythic weights before
            normalization. +40% luck means ×1.4 weighting, not 40 percentage
            points. Mythic still requires the unlocked crossing and a successful
            catch.
          </p>
        </>
      )}
      <div className="fishing-save-note">
        <span>✦ Your little adventure stays in this browser.</span>
        <span>
          {state.items.length} in backpack · {total} species
        </span>
      </div>
    </div>
  );
}
