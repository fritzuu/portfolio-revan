import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createGameKeyboard,
  justPressed,
  readMovement,
} from '../src/game/keyboard.js';
function setup({ returnFocus = false } = {}) {
  const target = new EventTarget(),
    document = new EventTarget();
  document.hidden = false;
  document.activeElement = null;
  let playing = true;
  const resets = [];
  const input = createGameKeyboard({
    target,
    document,
    canPlay: () => playing,
    onReset: (state) => resets.push(state),
    onMovement: () => {
      if (!returnFocus) return;
      document.activeElement = null;
      document.dispatchEvent(new Event('focusin'));
    },
  });
  const send = (code, type = 'keydown', extra = {}) => {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, { code, repeat: false, ...extra });
    target.dispatchEvent(event);
    return event;
  };
  return {
    input,
    target,
    document,
    send,
    resets,
    pause(value) {
      playing = !value;
      input.sync();
    },
  };
}
test('every WASD and arrow direction works; release stops it; aliases and opposite keys combine correctly', () => {
  const s = setup();
  for (const [code, dx, dy] of [
    ['KeyW', 0, -1],
    ['ArrowUp', 0, -1],
    ['KeyS', 0, 1],
    ['ArrowDown', 0, 1],
    ['KeyA', -1, 0],
    ['ArrowLeft', -1, 0],
    ['KeyD', 1, 0],
    ['ArrowRight', 1, 0],
  ]) {
    s.send(code);
    assert.deepEqual(readMovement(s.input.keys), { dx, dy });
    s.send(code, 'keyup');
    assert.deepEqual(readMovement(s.input.keys), { dx: 0, dy: 0 });
  }
  s.send('KeyW');
  s.send('ArrowUp');
  s.send('KeyD');
  assert.deepEqual(readMovement(s.input.keys), { dx: 1, dy: -1 });
  s.send('KeyW', 'keyup');
  assert.equal(readMovement(s.input.keys).dy, -1);
  s.send('ArrowDown');
  assert.equal(readMovement(s.input.keys).dy, 0);
  s.input.destroy();
});
test('scroll prevention after native capture cannot swallow an arrow or Space press/release', () => {
  const s = setup();
  for (const [code, key] of [
    ['ArrowRight', 'RIGHT'],
    ['Space', 'SPACE'],
  ]) {
    const down = s.send(code);
    down.preventDefault();
    assert.equal(s.input.keys[key].isDown, true);
    assert.equal(down.defaultPrevented, true);
    const up = s.send(code, 'keyup');
    up.preventDefault();
    assert.equal(s.input.keys[key].isDown, false);
  }
  s.input.destroy();
});
test('HUD button focus allows movement without intercepting normal button Space or Enter', () => {
  const s = setup();
  s.document.activeElement = {
    closest: (selector) =>
      selector === 'button,a,[role="button"]' ? {} : null,
  };
  s.send('KeyW');
  s.send('ArrowRight');
  assert.deepEqual(readMovement(s.input.keys), { dx: 1, dy: -1 });
  assert.equal(s.send('Space').defaultPrevented, false);
  assert.equal(s.send('Enter').defaultPrevented, false);
  assert.equal(s.input.keys.SPACE.isDown, false);
  assert.equal(s.input.keys.ENTER.isDown, false);
  s.input.destroy();
});
test('typing, composing, modifier shortcuts and paused panels never move the avatar', () => {
  const s = setup();
  s.send('KeyW');
  s.document.activeElement = { closest: () => ({}) };
  s.input.sync();
  assert.equal(s.input.keys.W.isDown, false);
  assert.equal(s.send('ArrowDown').defaultPrevented, false);
  s.document.activeElement = null;
  for (const extra of [
    { ctrlKey: true },
    { metaKey: true },
    { altKey: true },
    { isComposing: true },
  ]) {
    assert.equal(s.send('ArrowDown', 'keydown', extra).defaultPrevented, false);
    assert.equal(s.input.keys.DOWN.isDown, false);
  }
  s.pause(true);
  s.send('KeyD');
  s.pause(false);
  assert.equal(s.input.keys.D.isDown, false);
  s.send('KeyD');
  assert.equal(s.input.keys.D.isDown, true);
  s.input.destroy();
});
test('blur, hidden tab and focus transitions release held keys; repeats cannot resurrect canceled input', () => {
  for (const transition of ['blur', 'hidden', 'focus', 'pointer']) {
    const s = setup();
    s.send('KeyW');
    s.send('Space');
    if (transition === 'blur') s.target.dispatchEvent(new Event('blur'));
    if (transition === 'hidden') {
      s.document.hidden = true;
      s.document.dispatchEvent(new Event('visibilitychange'));
    }
    if (transition === 'focus') s.document.dispatchEvent(new Event('focusin'));
    if (transition === 'pointer')
      s.document.dispatchEvent(new Event('pointerdown'));
    assert.equal(s.input.keys.W.isDown, false);
    assert.equal(s.input.keys.SPACE.isDown, false);
    assert.equal(s.resets.at(-1).shootHeld, true);
    s.document.hidden = false;
    s.send('KeyW', 'keydown', { repeat: true });
    assert.equal(s.input.keys.W.isDown, false);
    s.send('KeyW', 'keyup');
    s.send('KeyW');
    assert.equal(s.input.keys.W.isDown, true);
    s.input.destroy();
  }
});
test('key-up outside gameplay releases a key; either Shift can remain held independently; edges fire once', () => {
  const s = setup();
  s.send('ShiftLeft');
  s.send('ShiftRight');
  s.send('ShiftLeft', 'keyup');
  assert.equal(s.input.keys.SHIFT.isDown, true);
  s.send('ShiftRight', 'keyup');
  assert.equal(s.input.keys.SHIFT.isDown, false);
  s.send('KeyE');
  assert.equal(justPressed(s.input.keys.E), true);
  assert.equal(justPressed(s.input.keys.E), false);
  s.send('KeyE', 'keydown', { repeat: true });
  assert.equal(justPressed(s.input.keys.E), false);
  s.document.activeElement = { closest: () => ({}) };
  s.send('KeyE', 'keyup');
  assert.equal(s.input.keys.E.isDown, false);
  s.input.destroy();
});
test('touch and keyboard directions combine without doubling speed; teardown removes listeners', () => {
  const s = setup();
  s.send('KeyW');
  assert.deepEqual(readMovement(s.input.keys, { up: true, right: true }), {
    dx: 1,
    dy: -1,
  });
  assert.deepEqual(readMovement(s.input.keys, { down: true }), {
    dx: 0,
    dy: 0,
  });
  s.input.destroy();
  s.send('ArrowLeft');
  assert.equal(s.input.keys.LEFT.isDown, false);
});

test('movement from a focused HUD button restores game focus so subsequent Space charges a shot', () => {
  const s = setup({ returnFocus: true });
  s.document.activeElement = {
    closest: (selector) =>
      selector === 'button,a,[role="button"]' ? {} : null,
  };
  s.send('ArrowRight');
  assert.equal(s.document.activeElement, null);
  assert.equal(s.input.keys.RIGHT.isDown, true);
  assert.equal(justPressed(s.input.keys.RIGHT), true);
  s.send('Space');
  assert.equal(s.input.keys.SPACE.isDown, true);
  s.send('ArrowRight', 'keyup');
  s.send('Space', 'keyup');
  assert.equal(s.input.keys.SPACE.isDown, false);
  s.input.destroy();
});
