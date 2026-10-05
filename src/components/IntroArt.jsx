import { useEffect, useRef } from 'react';
import { drawCharacter } from '../game/art';
export default function IntroArt({ step }) {
  const canvas = useRef(null);
  useEffect(() => {
    const c = canvas.current.getContext('2d'),
      r = (x, y, w, h, color) => {
        c.fillStyle = color;
        c.fillRect(x, y, w, h);
      };
    c.clearRect(0, 0, 240, 105);
    r(12, 82, 216, 4, '#728366');
    if (step < 2) {
      r(34, 61, 88, 6, '#c2a37a');
      r(39, 67, 5, 17, '#8e7459');
      r(112, 67, 5, 17, '#8e7459');
      r(64, 28, 42, 28, '#a9b39a');
      r(68, 32, 34, 20, step === 0 ? '#648779' : '#e6d29a');
      r(82, 56, 6, 5, '#a9b39a');
      r(76, 59, 18, 3, '#a9b39a');
      r(73, 39, 4, 3, '#dce4bf');
      r(79, 42, 4, 3, '#dce4bf');
      r(73, 45, 4, 3, '#dce4bf');
      r(47, 58, 7, 3, '#e6d4ae');
    }
    if (step > 0) {
      const x = step === 1 ? 160 : 105;
      r(x - 23, 15, 46, 67, '#9ba87b');
      r(x - 29, 27, 58, 43, '#9ba87b');
      r(x - 19, 20, 38, 57, '#e6d29a');
      r(x - 24, 30, 48, 32, '#e6d29a');
      r(x - 13, 26, 26, 47, '#557766');
      r(x - 19, 35, 38, 25, '#557766');
      for (const [sx, sy] of [
        [x - 37, 17],
        [x + 35, 32],
        [x - 33, 64],
        [x + 28, 79],
      ]) {
        r(sx, sy, 7, 2, '#e6d29a');
        r(sx + 2, sy - 3, 2, 8, '#e6d29a');
      }
    }
    c.save();
    c.translate(step === 0 ? 126 : step === 1 ? 117 : 96, step === 2 ? 43 : 48);
    drawCharacter(
      c,
      0,
      0,
      { outfit: 0, skin: 0, gender: 'male' },
      0,
      step > 0 ? 'right' : 'left',
    );
    c.restore();
    r(201, 64, 12, 18, '#af8562');
    r(197, 51, 20, 16, '#789065');
    r(202, 44, 10, 12, '#8da574');
  }, [step]);
  return (
    <canvas
      ref={canvas}
      width={240}
      height={105}
      className="intro-art"
      role="img"
      aria-label={
        [
          'A traveler finds a computer in a quiet room.',
          'A pixel portal opens beside the computer.',
          'The traveler steps into Revan’s world.',
        ][step]
      }
    />
  );
}
