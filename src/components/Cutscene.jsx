import { Localized } from '../i18n';
import { useLanguage } from '../i18n/hooks';
import { t } from '../i18n/core';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { drawCharacter, drawWorld } from '../game/art';
const STORY = [
  {
    chapter: '01 / A LATE-NIGHT IDEA',
    speaker: 'REVAN',
    line: 'Every project starts with a little curiosity. What if a portfolio could become a place you can actually explore?',
  },
  {
    chapter: '02 / THE OTHER SIDE OF THE SCREEN',
    speaker: 'THE TRAVELER',
    line: 'One last line of code… and the screen becomes a doorway. Beyond it, a city of ideas is waking up.',
  },
  {
    chapter: '03 / WELCOME TO REVAN’S WORLD',
    speaker: 'REVAN',
    line: 'Come on in! Visit my studio, discover my tools, and follow the story behind my work. Your adventure starts right here.',
  },
];
export default function Cutscene({
  onDone,
  reduced,
  character,
  music,
  onMusic,
}) {
  const language = useLanguage();
  const [step, setStep] = useState(0),
    [revealed, setRevealed] = useState(0),
    canvas = useRef(null),
    root = useRef(null);
  useEffect(() => {
    root.current?.focus();
  }, []);
  useEffect(() => {
    const c = canvas.current.getContext('2d'),
      city = document.createElement('canvas');
    city.width = 1600;
    city.height = 1100;
    drawWorld(city.getContext('2d'));
    const start = performance.now();
    let frame,
      lastText = 0;
    const draw = (now) => {
      const elapsed = reduced ? 0 : (now - start) / 1000,
        t = reduced ? 1 : Math.min(elapsed / 6, 1),
        r = (x, y, w, h, color) => {
          c.fillStyle = color;
          c.fillRect(Math.round(x), Math.round(y), w, h);
        };
      c.clearRect(0, 0, 640, 360);
      c.imageSmoothingEnabled = false;
      if (step < 2) {
        r(0, 0, 640, 360, '#152536');
        r(0, 220, 640, 140, '#3d464b');
        for (let y = 230; y < 360; y += 22) r(0, y, 640, 1, '#586164');
        r(75, 54, 138, 132, '#364d65');
        r(83, 62, 122, 116, '#16243c');
        for (let i = 0; i < 24; i++)
          r(90 + ((i * 31) % 110), 69 + ((i * 17) % 97), 2, 2, '#e9d5a0');
        r(143, 62, 4, 116, '#6b8492');
        r(83, 117, 122, 4, '#6b8492');
        r(70, 181, 148, 8, '#a2a897');
        r(250, 220, 165, 15, '#bc9561');
        r(258, 235, 9, 72, '#735d4c');
        r(396, 235, 9, 72, '#735d4c');
        r(295, 144, 81, 63, '#687b86');
        r(302, 151, 67, 48, step === 0 ? '#224945' : '#b9e8dd');
        r(328, 207, 12, 13, '#687b86');
        r(316, 218, 39, 4, '#aab8b2');
        for (let i = 0; i < 5; i++)
          r(
            311,
            158 + i * 7,
            step === 0 ? 18 + ((i * 9) % 30) : 49,
            2,
            ['#9fc77b', '#d5b578', '#8bbdc0'][i % 3],
          );
        r(475, 254, 24, 42, '#a67a5a');
        r(461, 217, 51, 43, '#486b4f');
        r(471, 201, 30, 28, '#628951');
        const glow = step === 1 ? Math.min(t * 2, 1) : 0;
        if (glow) {
          c.globalAlpha = glow;
          r(427, 109, 89, 159, '#426e73');
          r(435, 117, 73, 143, '#e4d195');
          r(443, 125, 57, 127, '#78b6b1');
          r(451, 133, 41, 111, '#284b5f');
          for (let i = 0; i < 15; i++)
            r(
              411 + ((i * 41) % 125),
              93 + ((i * 27 + elapsed * 23) % 185),
              3,
              3,
              '#ffe5a1',
            );
          c.globalAlpha = 1;
        }
        const x = step === 0 ? 385 : 385 + t * 72;
        c.save();
        c.translate(x, 190);
        c.scale(1.7, 1.7);
        drawCharacter(
          c,
          0,
          0,
          character,
          step === 1 && !reduced ? Math.floor(elapsed * 9) % 8 : 0,
          step === 0 ? 'left' : 'right',
        );
        c.restore();
        if (step === 0) {
          r(545, 84, 50, 50, '#62767d');
          r(549, 88, 42, 42, '#d1c8a8');
          r(568, 96, 3, 15, '#45525b');
          r(571, 109, 11, 3, '#45525b');
        }
      } else {
        c.save();
        c.translate(320, 90);
        c.scale(0.72, 0.72);
        c.drawImage(city, -800, -110 - t * 100);
        c.restore();
        c.save();
        c.translate(305, 130 + t * 45);
        c.scale(1.65, 1.65);
        drawCharacter(
          c,
          0,
          0,
          character,
          reduced ? 0 : Math.floor(elapsed * 9) % 8,
          'down',
        );
        c.restore();
        for (let i = 0; i < 9; i++) {
          c.globalAlpha = 0.4;
          r(
            (i * 83 + elapsed * 8) % 640,
            90 + ((i * 29) % 155),
            3,
            3,
            '#f5e2a5',
          );
        }
        c.globalAlpha = 1;
      }
      if (now - lastText > 60) {
        setRevealed(
          reduced ? t(STORY[step].line).length : Math.floor(elapsed * 35),
        );
        lastText = now;
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    const timer = reduced
      ? null
      : setTimeout(() => {
          if (step === 2) onDone();
          else {
            setStep((s) => s + 1);
            setRevealed(0);
          }
        }, 7200);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [step, reduced, character, onDone, language]);
  const next = () => {
    if (step === 2) onDone();
    else {
      setStep((s) => s + 1);
      setRevealed(0);
    }
  };
  return (
    <Localized>
      <section
        className="cinematic"
        ref={root}
        tabIndex={-1}
        aria-label="Opening story"
        onKeyDown={(e) => {
          if (e.key === 'Escape') onDone();
        }}
      >
        <canvas
          ref={canvas}
          width={640}
          height={360}
          aria-label={STORY[step].chapter}
        />
        <div className="cinema-top">
          <span>
            REVAN’S WORLD <small>{STORY[step].chapter}</small>
          </span>
          <div>
            <button
              aria-label={music ? 'Mute soundtrack' : 'Enable soundtrack'}
              onClick={() => onMusic(!music)}
            >
              {music ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <button onClick={onDone}>Skip story ↗</button>
          </div>
        </div>
        <div className="cinema-dialogue">
          <span className="cinema-speaker">{STORY[step].speaker}</span>
          <p aria-label={STORY[step].line}>
            {t(STORY[step].line).slice(0, revealed)}
            <span className="typing-caret">▌</span>
          </p>
          <div className="cinema-footer">
            <span>
              {STORY.map((_, i) => (
                <i key={i} className={i === step ? 'active' : ''} />
              ))}
            </span>
            <button onClick={next}>
              {step === 2 ? 'Enter the world' : 'Continue'}{' '}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </Localized>
  );
}
