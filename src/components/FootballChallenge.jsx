import { useEffect, useState } from 'react';
export default function FootballChallenge({
  results,
  busy,
  onKick,
  onReset,
  onClose,
  reduced,
}) {
  const [aim, setAim] = useState(50);
  useEffect(() => {
    if (reduced || busy || results.length >= 3) return;
    let raf;
    const step = (time) => {
      setAim(50 + Math.sin(time * 0.0035) * 45);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [busy, results.length, reduced]);
  const goals = results.filter(Boolean).length;
  return (
    <section
      className="football-challenge"
      aria-label="Three shot football challenge"
    >
      <button
        className="football-close"
        aria-label="Leave football challenge"
        onClick={onClose}
      >
        ×
      </button>
      <span className="eyebrow">FOOTBALL PARK · THREE SHOTS</span>
      <h2>
        {results.length === 3
          ? `${goals} / 3 goals!`
          : busy
            ? 'Ball on its way…'
            : `Shot ${results.length + 1} / 3`}
      </h2>
      <p>
        {results.length === 3
          ? 'Thanks for playing. The residents will keep the match going.'
          : 'Time your kick when the marker enters the golden center.'}
      </p>
      {results.length < 3 && (
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
            <label>
              Aim
              <input
                aria-label="Aim your shot"
                type="range"
                min="0"
                max="100"
                value={aim}
                onChange={(e) => setAim(Number(e.target.value))}
              />
            </label>
          )}
          <button
            className="button"
            disabled={busy}
            onClick={() => onKick(aim)}
          >
            {busy ? 'SHOOTING…' : 'KICK · TAP'}
          </button>
        </>
      )}
      <div className="football-results" aria-live="polite">
        {results.map((goal, i) => (
          <span key={i}>{goal ? 'GOAL' : 'WIDE'}</span>
        ))}
      </div>
      {results.length === 3 && (
        <button className="button" onClick={onReset}>
          Play again →
        </button>
      )}
    </section>
  );
}
