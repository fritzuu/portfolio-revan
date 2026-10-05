import { useEffect, useRef } from 'react';
import { drawWorld, LOCATIONS, WORLD_SIZE } from '../game/art';
export default function WorldMap({
  position,
  visited,
  large = false,
  onTravel,
}) {
  const canvas = useRef(null),
    base = useRef(null);
  useEffect(() => {
    const image = document.createElement('canvas');
    image.width = 400;
    image.height = 275;
    const c = image.getContext('2d');
    c.scale(0.25, 0.25);
    drawWorld(c);
    base.current = image;
  }, []);
  useEffect(() => {
    const c = canvas.current.getContext('2d');
    c.clearRect(0, 0, 400, 275);
    if (base.current) c.drawImage(base.current, 0, 0);
    for (const l of LOCATIONS) {
      c.fillStyle = visited.includes(l.id) ? '#bdf199' : '#fff0be';
      c.fillRect(l.doorX / 4 - 4, l.doorY / 4 - 4, 8, 8);
    }
    c.strokeStyle = '#243b43';
    c.lineWidth = 3;
    c.fillStyle = '#ec794f';
    c.beginPath();
    c.arc(
      (position.x / WORLD_SIZE.width) * 400,
      (position.y / WORLD_SIZE.height) * 275,
      5,
      0,
      Math.PI * 2,
    );
    c.fill();
    c.stroke();
  }, [position, visited]);
  return (
    <div className={large ? 'atlas-large' : 'minimap-art'}>
      <canvas
        ref={canvas}
        width={400}
        height={275}
        role="img"
        aria-label="City map with your position and five portfolio destinations"
      />
      {large && (
        <>
          <p className="map-legend">● You are here · ◆ Portfolio locations</p>
          <div className="atlas-locations">
            {LOCATIONS.map((l) => (
              <button
                key={l.id}
                className="button"
                onClick={() => onTravel(l.id)}
              >
                {l.name}
                <span>{visited.includes(l.id) ? '✓' : '→'}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
