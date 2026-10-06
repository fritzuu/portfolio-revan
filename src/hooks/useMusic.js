import { useCallback, useEffect, useRef } from 'react';
// Original 8-bar chiptune: melody, arpeggios, bass, kick, snare and hi-hat.
export default function useMusic(enabled, district = 'town') {
  const sound = useRef(null),
    area = useRef(district);
  useEffect(() => {
    area.current = district;
  }, [district]);
  const play = useCallback(
    (event, surface) => sound.current?.(event, surface),
    [],
  );
  useEffect(() => {
    if (!enabled) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    const ctx = new Audio(),
      master = ctx.createGain();
    master.gain.value = 0.16;
    master.connect(ctx.destination);
    const noise = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate),
      samples = noise.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    const frequency = (m) => 440 * 2 ** ((m - 69) / 12);
    function tone(m, time, length, volume, type = 'square') {
      const o = ctx.createOscillator(),
        g = ctx.createGain();
      o.type = type;
      o.frequency.value = frequency(m);
      g.gain.setValueAtTime(0.0001, time);
      g.gain.exponentialRampToValueAtTime(volume, time + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, time + length);
      o.connect(g);
      g.connect(master);
      o.start(time);
      o.stop(time + length + 0.02);
    }
    function drum(time, snare = false) {
      if (snare) {
        const source = ctx.createBufferSource(),
          g = ctx.createGain(),
          filter = ctx.createBiquadFilter();
        source.buffer = noise;
        filter.type = 'highpass';
        filter.frequency.value = 1300;
        g.gain.setValueAtTime(0.16, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        source.connect(filter);
        filter.connect(g);
        g.connect(master);
        source.start(time);
        source.stop(time + 0.11);
      } else {
        const o = ctx.createOscillator(),
          g = ctx.createGain();
        o.frequency.setValueAtTime(140, time);
        o.frequency.exponentialRampToValueAtTime(45, time + 0.12);
        g.gain.setValueAtTime(0.3, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
        o.connect(g);
        g.connect(master);
        o.start(time);
        o.stop(time + 0.16);
      }
    }
    sound.current = (event, surface) => {
      if (ctx.state !== 'running' || document.hidden) return;
      const now = ctx.currentTime;
      if (event === 'step')
        tone(
          surface === 'wood' ? 48 : surface === 'grass' ? 40 : 54,
          now,
          0.035,
          0.045,
          'triangle',
        );
      if (event === 'tackle') tone(38, now, 0.09, 0.16, 'triangle');
      if (event === 'save') {
        tone(52, now, 0.07, 0.16, 'triangle');
        tone(64, now + 0.07, 0.1, 0.1, 'sine');
      }
      if (event === 'post') tone(88, now, 0.24, 0.1, 'sine');
      if (event === 'whistle') {
        tone(98, now, 0.18, 0.07, 'sine');
        tone(100, now + 0.2, 0.25, 0.07, 'sine');
      }
      if (event === 'kick') tone(40, now, 0.07, 0.24, 'triangle');
      if (event === 'goal')
        [72, 76, 79, 84].forEach((n, i) =>
          tone(n, now + i * 0.08, 0.18, 0.17, 'triangle'),
        );
      if (event === 'discover')
        [76, 79, 88].forEach((n, i) =>
          tone(n, now + i * 0.09, 0.22, 0.12, 'sine'),
        );
    };
    const chords = [
      [60, 64, 67],
      [57, 60, 64],
      [65, 69, 72],
      [67, 71, 74],
      [60, 64, 67],
      [57, 60, 64],
      [65, 69, 72],
      [67, 71, 74],
    ];
    const melody = [
      [72, 0, 76, 79, 0, 76, 74, 72],
      [69, 0, 72, 76, 0, 74, 72, 69],
      [77, 0, 76, 72, 74, 0, 77, 79],
      [79, 0, 77, 74, 71, 74, 0, 79],
      [84, 0, 79, 76, 79, 0, 76, 72],
      [81, 0, 76, 72, 74, 76, 0, 81],
      [77, 79, 81, 0, 79, 77, 76, 74],
      [79, 0, 77, 74, 72, 0, 71, 0],
    ];
    let step = 0,
      next = ctx.currentTime + 0.05;
    const beat = 60 / 116 / 2;
    const schedule = () => {
      if (document.hidden || ctx.state !== 'running') {
        next = ctx.currentTime + 0.05;
        return;
      }
      while (next < ctx.currentTime + 0.18) {
        const quiet = area.current === 'grove';
        master.gain.setTargetAtTime(quiet ? 0.09 : 0.16, ctx.currentTime, 0.5);
        if (step % 16 === 0 && ['garden', 'grove'].includes(area.current)) {
          tone(quiet ? 81 : 93, next, 0.15, 0.045, 'sine');
          tone(quiet ? 86 : 96, next + 0.18, 0.13, 0.035, 'sine');
        }
        const bar = Math.floor(step / 8) % 8,
          i = step % 8,
          chord = chords[bar];
        if (melody[bar][i])
          tone(melody[bar][i], next, beat * 0.82, 0.12, 'square');
        tone(chord[i % 3] + 12, next, beat * 0.45, 0.035, 'triangle');
        if (i % 2 === 0)
          tone(
            chord[0] - 24 + (i === 6 ? 7 : 0),
            next,
            beat * 1.4,
            0.23,
            'triangle',
          );
        if (i === 0 || i === 4) drum(next);
        if (i === 2 || i === 6) drum(next, true);
        const hat = ctx.createBufferSource(),
          gain = ctx.createGain(),
          filter = ctx.createBiquadFilter();
        hat.buffer = noise;
        filter.type = 'highpass';
        filter.frequency.value = 8000;
        gain.gain.setValueAtTime(0.055, next);
        gain.gain.exponentialRampToValueAtTime(0.001, next + 0.035);
        hat.connect(filter);
        filter.connect(gain);
        gain.connect(master);
        hat.start(next);
        hat.stop(next + 0.04);
        step++;
        next += beat;
      }
    };
    ctx.resume().catch(() => {});
    const timer = setInterval(schedule, 80);
    schedule();
    return () => {
      sound.current = null;
      clearInterval(timer);
      ctx.close();
    };
  }, [enabled]);
  return play;
}
