import { Localized } from '../i18n';
import { useEffect, useRef } from 'react';
import { drawFish } from '../fishing/sprites';
export default function FishArt({ fish, silhouette = false, large = false }) {
  const canvas = useRef(null);
  useEffect(() => {
    drawFish(canvas.current.getContext('2d'), fish, 0, silhouette);
  }, [fish, silhouette]);
  return (
    <Localized>
      <canvas
        ref={canvas}
        width={80}
        height={64}
        className={large ? 'fish-art large' : 'fish-art'}
        role="img"
        aria-label={
          silhouette ? 'Silhouette of an undiscovered creature' : fish.name
        }
      />
    </Localized>
  );
}
