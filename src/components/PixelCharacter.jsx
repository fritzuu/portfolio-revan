import { useEffect, useRef } from 'react';
import { drawCharacter } from '../game/art';
export default function PixelCharacter({
  character,
  size = 128,
  animated = false,
  label = 'Preview karakter pilihanmu',
}) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current.getContext('2d');
    let animation;
    const draw = (time = 0) => {
      c.clearRect(0, 0, 32, 36);
      drawCharacter(c, 0, 0, character, animated ? time / 110 : 0);
      if (animated) animation = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animation);
  }, [character, animated]);
  return (
    <canvas
      ref={ref}
      width="32"
      height="36"
      style={{ width: size, height: (size * 36) / 32 }}
      aria-label={label}
      role="img"
    />
  );
}
