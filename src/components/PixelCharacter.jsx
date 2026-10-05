import { useEffect, useRef } from 'react';
import { drawCharacter } from '../game/art';
export default function PixelCharacter({ character, size = 128 }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current.getContext('2d');
    c.clearRect(0, 0, 32, 36);
    drawCharacter(c, 0, 0, character);
  }, [character]);
  return (
    <canvas
      ref={ref}
      width="32"
      height="36"
      style={{ width: size, height: (size * 36) / 32 }}
      aria-label="Preview karakter pilihanmu"
      role="img"
    />
  );
}
