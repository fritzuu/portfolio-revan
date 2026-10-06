import { useEffect, useRef, useState } from 'react';
function HoldAction({
  name,
  label,
  hint,
  onControl,
  onRelease,
  onCancel,
  className = '',
}) {
  const start = useRef(null);
  const begin = (e) => {
    e.preventDefault();
    if (start.current !== null) return;
    start.current = performance.now();
    if (e.pointerId !== undefined)
      e.currentTarget.setPointerCapture(e.pointerId);
    onControl?.(name, true);
  };
  const finish = (cancel = false) => {
    if (start.current === null) return;
    const duration = (performance.now() - start.current) / 1000;
    start.current = null;
    onControl?.(name, false);
    if (cancel) onCancel?.();
    else onRelease?.(duration);
  };
  return (
    <button
      className={className}
      onPointerDown={begin}
      onPointerUp={() => finish()}
      onPointerCancel={() => finish(true)}
      onLostPointerCapture={() => finish(true)}
      onKeyDown={(e) => {
        if ([' ', 'Enter'].includes(e.key)) begin(e);
      }}
      onKeyUp={(e) => {
        if ([' ', 'Enter'].includes(e.key)) finish();
      }}
      onBlur={() => finish(true)}
      aria-label={label}
    >
      {label}
      <small>{hint}</small>
    </button>
  );
}
export default function FootballChallenge({
  mode,
  match,
  onMode,
  onAction,
  onControl,
  results,
  busy,
  onKick,
  onReset,
  onClose,
  reduced,
}) {
  const [aim, setAim] = useState(50);
  useEffect(() => {
    if (mode !== 'training' || reduced || busy || results.length >= 3) return;
    let raf;
    const step = (time) => {
      setAim(50 + Math.sin(time * 0.0035) * 45);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [mode, reduced, busy, results.length]);
  const playing = mode === 'messi' || mode === 'yamal',
    status = match.status || 'playing';
  const choose = (mode) => {
    onControl('shoot', false);
    onControl('sprint', false);
    onMode(mode);
  };
  return (
    <section className="football-challenge" aria-label="Football park">
      <div className="football-score">
        <span>
          MESSI <b>{match.score[0]}</b>
        </span>
        <div className="football-clock">
          <small>
            {status === 'playing'
              ? `HALF ${match.half || 1} / 2`
              : status === 'halftime'
                ? 'HALFTIME'
                : 'FULLTIME'}
          </small>
          <time>
            {status === 'playing'
              ? `${Math.floor(match.clock / 60)}:${String(match.clock % 60).padStart(2, '0')}`
              : status === 'halftime'
                ? 'HT'
                : 'FT'}
          </time>
        </div>
        <span>
          <b>{match.score[1]}</b> YAMAL
        </span>
      </div>
      <button
        className="football-close"
        aria-label="Leave football park"
        onClick={onClose}
      >
        ×
      </button>
      <div className="football-status" aria-live="polite">
        {mode === 'training'
          ? `Practice · ${Math.min(results.length + 1, 3)} / 3 shots`
          : status !== 'playing'
            ? match.event
            : playing
              ? `${mode === 'messi' ? 'Blue' : 'Coral'} team · ${match.hasBall ? 'Your ball' : match.event}`
              : match.event}
      </div>
      {playing && (
        <>
          <div
            className="football-stamina"
            role="meter"
            aria-label="Sprint stamina"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={match.stamina ?? 100}
          >
            <span>STAMINA</span>
            <i>
              <b style={{ width: `${match.stamina ?? 100}%` }} />
            </i>
          </div>
          <p className="football-hint">
            Move: arrows / WASD · Hold Shoot, release to kick
          </p>
        </>
      )}
      {mode !== 'training' && status === 'fulltime' && match.result && (
        <div className="football-summary" role="status">
          <strong>{match.event}</strong>
          <span>
            Goals {match.result.stats.goals} · Saves {match.result.stats.saves}{' '}
            · Tackles {match.result.stats.tackles}
          </span>
          {playing && match.visitorStats && (
            <span>
              You: {match.visitorStats.goals} goals ·{' '}
              {match.visitorStats.assists} assists ·{' '}
              {match.visitorStats.tackles} tackles
            </span>
          )}
          <small>Next match starts at 0–0</small>
        </div>
      )}
      {!playing && mode !== 'training' && (
        <div className="football-selection">
          <button onClick={() => choose('messi')}>Join Messi</button>
          <button onClick={() => choose('yamal')}>Join Yamal</button>
          <button onClick={() => choose('training')}>3-shot practice</button>
        </div>
      )}
      {playing && (
        <div className="football-actions">
          <HoldAction
            name="pass"
            label="PASS"
            hint="Q · hold for through ball"
            onRelease={(seconds) =>
              onAction('pass', { through: seconds > 0.35 })
            }
          />
          <HoldAction
            name="shoot"
            label={match.charging ? 'RELEASE' : 'SHOOT'}
            hint={
              match.charging
                ? `Release · ${Math.round((match.power || 0) * 100)}%`
                : 'Hold · Space'
            }
            onControl={onControl}
            onRelease={(seconds) =>
              onAction('releaseShot', {
                power: Math.min(1, 0.12 + seconds / 1.1),
              })
            }
            onCancel={() => onAction('cancelShot')}
            className={match.charging ? 'is-charging' : ''}
          />
          <button
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => onAction('tackle')}
            aria-disabled={!match.tackleReady}
          >
            TACKLE<small>E</small>
          </button>
          <button
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => onAction('skill')}
            aria-disabled={!match.skillReady}
          >
            DRIBBLE<small>F</small>
          </button>
          <HoldAction
            name="sprint"
            label="SPRINT"
            hint="Hold · Shift"
            onControl={onControl}
          />
          <button className="football-watch" onClick={() => choose('watch')}>
            Watch
          </button>
        </div>
      )}
      {mode === 'training' && (
        <div className="football-practice">
          {results.length < 3 ? (
            <>
              <div
                className="football-aim"
                role="meter"
                aria-label="Shot aim"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(aim)}
              >
                <span />
                <i style={{ left: `${aim}%` }} />
              </div>
              {reduced && (
                <input
                  aria-label="Aim"
                  type="range"
                  min="0"
                  max="100"
                  value={aim}
                  onChange={(e) => setAim(Number(e.target.value))}
                />
              )}
              <button disabled={busy} onClick={() => onKick(aim)}>
                {busy ? 'Shooting…' : 'KICK'}
              </button>
            </>
          ) : (
            <>
              <span>{results.filter(Boolean).length} / 3 goals</span>
              <button onClick={onReset}>Again</button>
            </>
          )}
          <span className="football-results">
            {results.map((goal, i) => (
              <span key={i}>{goal ? '●' : '○'}</span>
            ))}
          </span>
          <button className="football-watch" onClick={() => choose('watch')}>
            Watch match
          </button>
        </div>
      )}
    </section>
  );
}
