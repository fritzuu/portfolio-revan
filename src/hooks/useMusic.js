import { useEffect } from 'react';
// Original 8-bar chiptune: melody, arpeggios, bass, kick, snare and hi-hat.
export default function useMusic(enabled) {
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
      clearInterval(timer);
      ctx.close();
    };
  }, [enabled]);
}
