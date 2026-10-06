import { DISCOVERIES, gateUnlocked } from '../game/exploration';
export default function ExplorationPanel({
  view,
  discoveries,
  night,
  onTravel,
  onTeleport,
}) {
  const unlocked = gateUnlocked(discoveries);
  if (view === 'notebook')
    return (
      <div className="exploration-notebook">
        <p className="exploration-intro">
          A little world of personal favorites. {discoveries.length} /{' '}
          {DISCOVERIES.length} discoveries · Saved on this device.
        </p>
        <div className="discovery-grid">
          {DISCOVERIES.map((d, i) => {
            const found = discoveries.includes(d.id);
            return (
              <article
                className={found ? 'discovery found' : 'discovery'}
                key={d.id}
              >
                <span className="eyebrow">
                  FIELD NOTE 0{i + 1} · {found ? 'DISCOVERED' : 'UNEXPLORED'}
                </span>
                <h3>{found ? d.title : 'Something to discover'}</h3>
                <p>
                  {found
                    ? d.text
                    : {
                        jekek: 'Follow the golden trail in the eastern garden.',
                        dream: 'The grove keeps its secret until nightfall.',
                        football: 'Follow the cheers south of the town.',
                        story:
                          'Take a moment on the bench beside the garden gate.',
                        shore: 'Someone is casting a line by the eastern lake.',
                      }[d.id]}
                </p>
                <button className="button" onClick={() => onTravel(d.place)}>
                  Walk there →
                </button>
              </article>
            );
          })}
        </div>
        <p className="note">
          {unlocked
            ? 'Garden Gate unlocked. Visit the gate for a quick return to town.'
            : 'Find any two field notes to unlock the Garden Gate shortcut.'}
        </p>
      </div>
    );
  if (view === 'shortcut')
    return (
      <div className="exploration-story">
        <span className="eyebrow">
          GARDEN GATE / {unlocked ? 'OPEN' : 'LOCKED'}
        </span>
        <h3>A familiar way home.</h3>
        <p>
          {unlocked
            ? 'You know this neighborhood now. Step through for a quick trip between the old town and the garden.'
            : 'Discover two personal field notes to unlock this shortcut. The regular streets are always open.'}
        </p>
        {unlocked && (
          <div className="exploration-actions">
            <button className="button" onClick={() => onTeleport('projects')}>
              Back to town →
            </button>
            <button className="button" onClick={() => onTeleport('jekek')}>
              Into the garden →
            </button>
          </div>
        )}
      </div>
    );
  if (view === 'dream' && !night)
    return (
      <div className="exploration-story">
        <span className="eyebrow">DREAM GROVE / A QUIET CLUE</span>
        <h3>Some favorites wake after sunset.</h3>
        <p>
          The moon mosaic hints at a visitor. Return when the city turns to
          night; morning and night flow through a two-minute cycle.
        </p>
        <button className="button" onClick={() => onTravel('story')}>
          Explore the story bench →
        </button>
      </div>
    );
  const note = DISCOVERIES.find((d) => d.id === view);
  return (
    <div className="exploration-story">
      <span className="eyebrow">PERSONAL FIELD NOTE</span>
      <h3>{note?.title}</h3>
      <p>{note?.text}</p>
      {view === 'jekek' && (
        <p>
          Watch him follow his trail, flick his tongue, and stop for a little
          rest.
        </p>
      )}
      {view === 'shore' && <p>Find your own fishing spot at Moonwater Dock.</p>}
      <button
        className="button"
        onClick={() => onTravel(view === 'shore' ? 'fishing' : 'shortcut')}
      >
        {view === 'shore' ? 'Go fishing' : 'Visit the garden gate'} →
      </button>
    </div>
  );
}
