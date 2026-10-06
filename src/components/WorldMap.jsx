import { useEffect, useRef, useState } from 'react';
import { drawWorld, DESTINATIONS, WORLD_SIZE } from '../game/art';
const WIDTH = 400,
  HEIGHT = Math.round((WIDTH * WORLD_SIZE.height) / WORLD_SIZE.width);
const color = (l) =>
  l.x !== undefined
    ? '#ffefb7'
    : ['fishing', 'shop', 'rift'].includes(l.id)
      ? '#7ed3dd'
      : '#c7b4ef';
export default function WorldMap({
  position,
  visited,
  large = false,
  onTravel,
}) {
  const canvas = useRef(null),
    base = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    const atlas = new Image();
    const paint = () => {
      if (!active) return;
      const image = document.createElement('canvas');
      image.width = WIDTH;
      image.height = HEIGHT;
      const c = image.getContext('2d');
      c.scale(WIDTH / WORLD_SIZE.width, HEIGHT / WORLD_SIZE.height);
      drawWorld(c, {
        assets: { town: atlas.complete && atlas.naturalWidth ? atlas : null },
      });
      base.current = image;
      setReady(true);
    };
    atlas.onload = paint;
    atlas.onerror = paint;
    atlas.src = '/assets/tiny-town/tiles.png';
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    const c = canvas.current.getContext('2d');
    c.clearRect(0, 0, WIDTH, HEIGHT);
    if (base.current) c.drawImage(base.current, 0, 0);
    for (const l of DESTINATIONS) {
      const x = (l.doorX / WORLD_SIZE.width) * WIDTH,
        y = ((l.doorY + 45) / WORLD_SIZE.height) * HEIGHT;
      c.fillStyle = color(l);
      c.fillRect(x - 3, y - 3, 6, 6);
      if (visited.includes(l.id)) {
        c.strokeStyle = '#bdf199';
        c.lineWidth = 1.5;
        c.strokeRect(x - 4, y - 4, 8, 8);
      }
    }
    c.strokeStyle = '#243b43';
    c.lineWidth = 2;
    c.fillStyle = '#ec794f';
    c.beginPath();
    c.arc(
      (position.x / WORLD_SIZE.width) * WIDTH,
      (position.y / WORLD_SIZE.height) * HEIGHT,
      4,
      0,
      Math.PI * 2,
    );
    c.fill();
    c.stroke();
  }, [position, visited, ready]);
  return (
    <div className={large ? 'atlas-large' : 'minimap-art'}>
      <canvas
        ref={canvas}
        width={WIDTH}
        height={HEIGHT}
        role="img"
        aria-label="City map: orange visitor, cream portfolio, blue fishing, violet discoveries"
      />
      {large && (
        <>
          <p className="map-legend">
            ● You · Cream: portfolio · Blue: fishing · Violet: discoveries ·
            Green border: visited
          </p>
          <div className="atlas-locations">
            {DESTINATIONS.map((l) => (
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
