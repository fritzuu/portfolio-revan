import { useEffect, useState } from 'react';
export default function FootballChallenge({
  mode,
  match,
  onMode,
  onAction,
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
  const playing = mode === 'messi' || mode === 'yamal';
  return (
    <section className="football-challenge" aria-label="Football park">
      <div className="football-score">
        <span>
          MESSI <b>{match.score[0]}</b>
        </span>
        <time>
          {Math.floor(match.clock / 60)}:
          {String(match.clock % 60).padStart(2, '0')}
        </time>
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
          : playing
            ? `${mode === 'messi' ? 'Blue' : 'Coral'} team · ${match.hasBall ? 'You have the ball' : match.event}`
            : match.event}
      </div>
      {!playing && mode !== 'training' && (
        <div className="football-selection">
          <button onClick={() => onMode('messi')}>Join Messi</button>
          <button onClick={() => onMode('yamal')}>Join Yamal</button>
          <button onClick={() => onMode('training')}>3-shot practice</button>
        </div>
      )}
      {playing && (
        <div className="football-actions">
          <button
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => onAction('pass')}
          >
            PASS <small>Q</small>
          </button>
          <button
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => onAction('shoot')}
          >
            SHOOT <small>SPACE</small>
          </button>
          <button className="football-watch" onClick={() => onMode('watch')}>
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
          <button className="football-watch" onClick={() => onMode('watch')}>
            Watch match
          </button>
        </div>
      )}
    </section>
  );
}
