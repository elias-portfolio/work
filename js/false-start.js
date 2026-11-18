(() => {
  'use strict';

  const byId = (id) => document.getElementById(id);
  const banner = byId('banner');
  const bannerTitle = byId('banner-title');
  const bannerDetail = byId('banner-detail');
  const status = byId('race-status');
  const canvas = byId('track');
  const ctx = canvas.getContext('2d');
  if (!window.FalseStartPhysics || !ctx) {
    bannerTitle.textContent = 'Track unavailable';
    bannerDetail.textContent = 'Reload to try again';
    status.textContent = 'Could not load the game.';
    return;
  }

  const { createRace, stepRace, TRACK_METERS, PIXELS_PER_METER } = window.FalseStartPhysics;
  const style = getComputedStyle(document.documentElement);
  const theme = ['--paper', '--ink', '--brick', '--lane-one', '--lane-two'].map((name) => style.getPropertyValue(name).trim());
  const [paper, ink, brick, amber, green] = theme;
  const printTile = document.createElement('canvas');
  printTile.width = 10;
  printTile.height = 20;
  const printInk = printTile.getContext('2d');
  printInk.fillStyle = '#feffed21';
  printInk.fillRect(0, 0, 1, 1);
  printInk.fillRect(5, 10, 1, 1);
  const screenPrint = ctx.createPattern(printTile, 'repeat');
  const W = 640, H = 312, LANE_HEIGHT = H / 2, GROUND = 116, SCREEN_X = 164;
  const FIXED_STEP = 1 / 120;
  const keysets = [['KeyQ', 'KeyW', 'KeyA', 'KeyS'], ['KeyI', 'KeyO', 'KeyK', 'KeyL']];
  const buttons = new Map(Array.from(document.querySelectorAll('[data-key]'), (button) => [button.dataset.key, button]));
  const scores = [0, 1].map((i) => ({ distance: byId(`distance-${i}`), falls: byId(`falls-${i}`), marker: byId(`marker-${i}`) }));
  const clock = byId('clock');
  const keyboard = new Set();
  const pointers = new Map();
  let race = createRace();
  let started = false;
  let frame = null;
  let lastTick = null;
  let accumulator = 0;
  let lastDrawn = '';
  let drawScale = 1;

  const clamp = (x, min, max) => Math.min(max, Math.max(min, x));
  const isHeld = (key) => keyboard.has(key) || Array.from(pointers.values()).includes(key);

  function formatClock(seconds) {
    const ticks = Math.floor(seconds * 100 + 1e-6);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(Math.floor(ticks / 6000))}:${pad(Math.floor(ticks / 100) % 60)}.${pad(ticks % 100)}`;
  }

  function syncKeys() {
    for (const [key, button] of buttons) button.classList.toggle('is-held', isHeld(key));
  }

  function releaseInputs() {
    keyboard.clear();
    pointers.clear();
    syncKeys();
  }

  function setBanner(title, detail) {
    banner.hidden = !title;
    if (title) {
      bannerTitle.textContent = title;
      bannerDetail.textContent = detail;
    }
  }

  function syncScore() {
    const values = race.runners.map(({ distance, falls }) => [distance.toFixed(1), falls]);
    const time = formatClock(race.elapsed);
    const signature = `${values.join('|')}|${time}`;
    if (signature === lastDrawn) return;
    lastDrawn = signature;
    if (clock.textContent !== time) clock.textContent = time;
    values.forEach(([distance, falls], i) => {
      const item = scores[i];
      if (item.distance.firstChild.nodeValue !== distance) item.distance.firstChild.nodeValue = distance;
      const label = `${falls} ${falls === 1 ? 'fall' : 'falls'}`;
      if (item.falls.textContent !== label) item.falls.textContent = label;
      item.marker.style.left = `${clamp(race.runners[i].distance, 0, TRACK_METERS) * 100 / TRACK_METERS}%`;
    });
  }

  function line(color, width, ...points) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (const p of points.slice(1)) ctx.lineTo(p.x, p.y);
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  function dot(x, y, r, fill) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function paintGround(distance, lane) {
    ctx.fillStyle = lane === 0 ? brick : '#3d1d29';
    ctx.fillRect(0, 0, W, LANE_HEIGHT);
    // A still, screen-printed grid behind the moving track markings.
    ctx.fillStyle = screenPrint;
    ctx.fillRect(0, 8, W, GROUND - 12);
    ctx.fillStyle = '#17191a5c';
    ctx.fillRect(0, GROUND, W, LANE_HEIGHT - GROUND);
    ctx.fillStyle = '#feffedb3';
    ctx.fillRect(0, GROUND, W, 1);
    ctx.fillRect(0, LANE_HEIGHT - 1, W, 1);

    const xAt = (meter) => SCREEN_X + (meter - distance) * PIXELS_PER_METER;
    const from = Math.floor(distance - SCREEN_X / PIXELS_PER_METER);
    const to = Math.ceil(distance + (W - SCREEN_X) / PIXELS_PER_METER);
    ctx.font = '700 12px monospace';
    ctx.textAlign = 'center';
    for (let meter = from; meter <= to; meter++) {
      const x = Math.round(xAt(meter));
      const major = meter % 5 === 0;
      ctx.fillStyle = major ? '#feffedbb' : '#feffed62';
      ctx.fillRect(x, GROUND, 1, major ? 13 : 6);
      if (major && meter > 0 && meter < TRACK_METERS) ctx.fillText(`${meter}m`, x, GROUND + 29);
    }
    for (const meter of [0, TRACK_METERS]) {
      const x = Math.round(xAt(meter));
      if (x < -40 || x > W + 40) continue;
      ctx.fillStyle = '#feffedb3';
      ctx.fillRect(x - 1, 12, 2, GROUND + 7);
      if (meter === TRACK_METERS) {
        for (let y = 16; y < GROUND; y += 6) ctx.fillRect(x + (y % 12 === 4 ? 1 : -7), y, 6, 6);
      }
      ctx.fillText(meter === 0 ? 'START' : 'FINISH', x, GROUND + 29);
    }
  }

  function paintRunner(runner, lane) {
    ctx.save();
    ctx.translate(SCREEN_X, GROUND - 2);
    const { head, shoulder, hip, legs } = runner.pose;
    const color = lane === 0 ? amber : green;
    const skin = lane === 0 ? '#f6c790' : '#cf8b68';
    const darkSkin = lane === 0 ? '#b87448' : '#8d4934';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.fillStyle = '#17191a68';
    ctx.beginPath();
    ctx.ellipse(hip.x + 8, 3, runner.down ? 37 : 23, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    function leg(part, far) {
      line(ink, 10, hip, part.knee);
      line(far ? darkSkin : skin, 5, part.knee, part.ankle);
      line(far ? '#cbc3a2' : paper, 5, part.ankle, part.toe);
    }
    function arm(part, far) {
      const a = clamp(part.knee.x - hip.x, -22, 22);
      const elbow = { x: shoulder.x - a * .58 - 5, y: Math.min(shoulder.y + 22, 0) };
      const hand = { x: elbow.x + (runner.down ? 12 : 11), y: Math.min(elbow.y - 8, 0) };
      line(far ? darkSkin : skin, 5, shoulder, elbow, hand);
    }
    arm(legs[1], true);
    leg(legs[1], true);
    line(ink, 20, shoulder, hip);
    line(color, 15, shoulder, hip);
    dot((hip.x + shoulder.x) / 2 + 2, (hip.y + shoulder.y) / 2, 4.8, paper);
    ctx.fillStyle = ink;
    ctx.font = '900 7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(String(lane + 1), (hip.x + shoulder.x) / 2 + 2, (hip.y + shoulder.y) / 2 + 2.6);
    leg(legs[0], false);
    arm(legs[0], false);
    line(skin, 6, shoulder, head);
    dot(head.x, head.y, 10, ink);
    dot(head.x + 1.8, head.y + 1, 8, skin);
    dot(head.x + 5.3, head.y - 1, 1.25, ink);
    line(color, 3, { x: head.x - 7, y: head.y - 5 }, { x: head.x + 7, y: head.y - 5 });
    ctx.restore();
  }

  function draw() {
    ctx.setTransform(drawScale, 0, 0, drawScale, 0, 0);
    race.runners.forEach((runner, i) => {
      ctx.save();
      ctx.translate(0, i * LANE_HEIGHT);
      ctx.beginPath();
      ctx.rect(0, 0, W, LANE_HEIGHT);
      ctx.clip();
      paintGround(runner.distance, i);
      paintRunner(runner, i);
      if (runner.down) {
        ctx.fillStyle = i === 0 ? amber : green;
        ctx.font = '900 14px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('STUMBLE!', SCREEN_X + 65, 35);
      }
      ctx.restore();
    });
  }

  function resize() {
    const width = canvas.getBoundingClientRect().width;
    drawScale = Math.max(1, Math.min(3, width / W * (window.devicePixelRatio || 1)));
    const w = Math.round(W * drawScale), h = Math.round(H * drawScale);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    draw();
  }

  const readyDetail = () => window.parent === window ? 'Press a leg key to start' : 'Click here, then press a leg key';

  function reset() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    race = createRace();
    started = false;
    accumulator = 0;
    lastTick = null;
    releaseInputs();
    status.textContent = 'Race reset.';
    setBanner('On your marks', readyDetail());
    syncScore();
    draw();
  }

  function update(now) {
    frame = null;
    if (!started || document.hidden) return;
    if (lastTick !== null) accumulator += Math.min(.1, (now - lastTick) / 1000);
    lastTick = now;
    const input = keysets.map((keys) => keys.map(isHeld));
    while (accumulator >= FIXED_STEP && race.winner === null) {
      stepRace(race, input, FIXED_STEP);
      accumulator -= FIXED_STEP;
    }
    syncScore();
    draw();
    if (race.winner !== null) {
      releaseInputs();
      const result = `Runner ${race.winner + 1} wins`;
      setBanner(result, `${formatClock(race.elapsed)} · Space to restart`);
      status.textContent = `${result}. Time ${formatClock(race.elapsed)}.`;
    } else frame = requestAnimationFrame(update);
  }

  function start() {
    if (started) return;
    started = true;
    setBanner('', '');
    status.textContent = 'Race started.';
    lastTick = performance.now();
    frame = requestAnimationFrame(update);
  }

  function codeFor(event) {
    if (buttons.has(event.code) || event.code === 'Space') return event.code;
    if (event.key === ' ') return 'Space';
    return event.key?.length === 1 ? `Key${event.key.toUpperCase()}` : '';
  }

  window.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.altKey || event.metaKey || event.isComposing) return;
    const code = codeFor(event);
    if (code === 'Space' && !event.target.closest?.('button, a, input, textarea, select, [contenteditable]')) {
      event.preventDefault();
      if (!event.repeat) reset();
      return;
    }
    if (!buttons.has(code)) return;
    event.preventDefault();
    if (event.repeat || race.winner !== null) return;
    keyboard.add(code);
    syncKeys();
    start();
  });
  window.addEventListener('keyup', (event) => {
    const code = codeFor(event);
    if (!buttons.has(code)) return;
    keyboard.delete(code);
    syncKeys();
  });

  for (const [code, button] of buttons) {
    button.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || race.winner !== null) return;
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, code);
      syncKeys();
      start();
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      button.addEventListener(type, (event) => {
        pointers.delete(event.pointerId);
        syncKeys();
      });
    }
    button.addEventListener('contextmenu', (event) => event.preventDefault());
    // Focused buttons also act as momentary controls for keyboard-only visitors.
    button.addEventListener('keydown', (event) => {
      if (!['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      if (event.repeat || race.winner !== null) return;
      keyboard.add(code);
      syncKeys();
      start();
    });
    const releaseButton = () => { keyboard.delete(code); syncKeys(); };
    button.addEventListener('keyup', (event) => {
      if (['Enter', ' '].includes(event.key)) { event.preventDefault(); releaseButton(); }
    });
    button.addEventListener('blur', releaseButton);
  }

  window.addEventListener('blur', releaseInputs);
  document.addEventListener('visibilitychange', () => {
    releaseInputs();
    if (document.hidden) {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      lastTick = null;
      accumulator = 0;
    } else if (started && race.winner === null && frame === null) frame = requestAnimationFrame(update);
  });
  byId('reset').addEventListener('click', reset);
  new ResizeObserver(resize).observe(canvas);
  if (window.frameElement?.hasAttribute('data-false-start-embed')) {
    const meet = document.querySelector('.meet');
    new ResizeObserver(() => {
      const height = `${Math.ceil(meet.getBoundingClientRect().height)}px`;
      if (window.frameElement && window.frameElement.style.height !== height) {
        window.frameElement.style.height = height;
      }
    }).observe(meet);
  }
  setBanner('On your marks', readyDetail());
  syncScore();
  resize();
})();
