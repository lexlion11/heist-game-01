// COLD SIGNAL — keyboard and mouse. One place reads events, one place exposes them.
export function createInput(canvas) {
  const keys = new Set();
  const input = {
    canvas,
    keys,
    mouse: { x: 0, y: 0, down: false, inside: false },
    pressed: new Set(),
    aimX: 0,
    aimY: 0,
    onAction: null,
    onRestart: null,
    onStart: null,
  };

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (!keys.has(key)) pressedAdd(input, key);
    keys.add(key);
    if (key === ' ' || key.startsWith('arrow')) event.preventDefault();
  });

  window.addEventListener('keyup', (event) => {
    keys.delete(event.key.toLowerCase());
  });

  window.addEventListener('blur', () => keys.clear());

  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    input.mouse.x = event.clientX - rect.left;
    input.mouse.y = event.clientY - rect.top;
    input.mouse.inside = true;
  });

  canvas.addEventListener('mousedown', (event) => {
    input.mouse.down = true;
    if (event.button === 0 && input.onAction) input.onAction('mouse');
  });

  window.addEventListener('mouseup', () => {
    input.mouse.down = false;
  });

  input.consume = (key) => {
    if (input.pressed.has(key)) {
      input.pressed.delete(key);
      return true;
    }
    return false;
  };

  return input;
}

function pressedAdd(input, key) {
  input.pressed.add(key);
}

/** The movement vector the keys ask for, in screen space. */
export function readMoveVector(input) {
  let dx = 0;
  let dy = 0;
  if (input.keys.has('a') || input.keys.has('arrowleft')) dx -= 1;
  if (input.keys.has('d') || input.keys.has('arrowright')) dx += 1;
  if (input.keys.has('w') || input.keys.has('arrowup')) dy -= 1;
  if (input.keys.has('s') || input.keys.has('arrowdown')) dy += 1;
  const len = Math.hypot(dx, dy);
  if (len === 0) return { dx: 0, dy: 0, moving: false };
  return { dx: dx / len, dy: dy / len, moving: true };
}

/** True while the sneak key is held. */
export function readSneak(input) {
  return input.keys.has('shift');
}

/** True on the frame the interact key went down. */
export function readInteract(input) {
  return input.consume('e');
}

/** True on the frame the tool key went down. */
export function readTool(input) {
  return input.consume(' ');
}

/** True on the frame the tool-cycle key went down. */
export function readCycle(input) {
  return input.consume('q') || input.consume('tab');
}
