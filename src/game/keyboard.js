// Capture game keys before React's bubbling scroll handlers. Key-up always
// releases state, even if focus or the active game mode has since changed.
const bindings = {
  KeyW: 'W',
  KeyA: 'A',
  KeyS: 'S',
  KeyD: 'D',
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  KeyE: 'E',
  Enter: 'ENTER',
  Escape: 'ESC',
  Space: 'SPACE',
  KeyQ: 'Q',
  ShiftLeft: 'SHIFT',
  ShiftRight: 'SHIFT',
  KeyF: 'F',
};
const editable =
  'input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"],[role="slider"],[role="combobox"],[role="listbox"],[role="tablist"]';
export function createGameKeyboard({
  target,
  document,
  canPlay,
  onReset = () => {},
  onMovement = () => {},
}) {
  const keys = Object.fromEntries(
    [...new Set(Object.values(bindings))].map((name) => [
      name,
      { isDown: false, _justDown: false },
    ]),
  );
  const held = new Set();
  const available = () =>
    !document.hidden &&
    canPlay() &&
    !document.activeElement?.closest?.(editable);
  function clear(force = false) {
    const hadKeys = held.size > 0;
    const shootHeld = keys.SPACE.isDown;
    held.clear();
    for (const key of Object.values(keys)) {
      key.isDown = false;
      key._justDown = false;
    }
    if (hadKeys || force) onReset({ shootHeld });
  }
  function keyDown(event) {
    if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) {
      clear();
      return;
    }
    const name = bindings[event.code];
    if (!name) return;
    if (!available()) {
      clear();
      return;
    }
    // Let focused buttons handle their normal Space/Enter activation.
    if (
      (name === 'SPACE' || name === 'ENTER') &&
      document.activeElement?.closest?.('button,a,[role="button"]')
    )
      return;
    if (event.repeat && !held.has(event.code)) return;
    if (
      ['W', 'A', 'S', 'D', 'UP', 'DOWN', 'LEFT', 'RIGHT'].includes(name) &&
      document.activeElement?.closest?.('button,a,[role="button"]')
    )
      onMovement();
    if (!keys[name].isDown) keys[name]._justDown = true;
    held.add(event.code);
    keys[name].isDown = true;
    if (['UP', 'DOWN', 'LEFT', 'RIGHT', 'SPACE'].includes(name))
      event.preventDefault();
  }
  function keyUp(event) {
    const name = bindings[event.code];
    if (!name) return;
    held.delete(event.code);
    keys[name].isDown = [...held].some((code) => bindings[code] === name);
  }
  const blur = () => clear(true);
  const visibility = () => {
    if (document.hidden) clear(true);
  };
  const focus = () => clear();
  target.addEventListener('keydown', keyDown, { capture: true });
  target.addEventListener('keyup', keyUp, { capture: true });
  target.addEventListener('blur', blur);
  document.addEventListener('visibilitychange', visibility);
  document.addEventListener('focusin', focus);
  document.addEventListener('pointerdown', focus, { capture: true });
  return {
    keys,
    clear,
    sync() {
      if (!available()) clear();
    },
    destroy() {
      clear();
      target.removeEventListener('keydown', keyDown, { capture: true });
      target.removeEventListener('keyup', keyUp, { capture: true });
      target.removeEventListener('blur', blur);
      document.removeEventListener('visibilitychange', visibility);
      document.removeEventListener('focusin', focus);
      document.removeEventListener('pointerdown', focus, { capture: true });
    },
  };
}
export function justPressed(key) {
  const pressed = key._justDown;
  key._justDown = false;
  return pressed;
}

export function readMovement(keys, controls = {}) {
  return {
    dx:
      Number(!!(keys.D.isDown || keys.RIGHT.isDown || controls.right)) -
      Number(!!(keys.A.isDown || keys.LEFT.isDown || controls.left)),
    dy:
      Number(!!(keys.S.isDown || keys.DOWN.isDown || controls.down)) -
      Number(!!(keys.W.isDown || keys.UP.isDown || controls.up)),
  };
}
