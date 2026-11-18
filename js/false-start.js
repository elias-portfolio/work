(() => {
  'use strict';

  const byId = (id) => document.getElementById(id);
  const canvas = byId('track');
  const ctx = canvas.getContext('2d');
  const status = byId('race-status');
  const banner = byId('banner');
  const bannerTitle = byId('banner-title');
  const bannerDetail = byId('banner-detail');
  const resetLabel = 'Space to restart';

  function showBanner(title, detail) {
    banner.hidden = !title;
    bannerTitle.textContent = title;
    bannerDetail.textContent = detail;
  }

  if (!window.FalseStartPhysics || !ctx) {
    showBanner('Track unavailable', 'Reload to try again');
    status.textContent = 'Could not load the game.';
    return;
  }

  const { createRace, stepRace, TRACK_METERS, PIXELS_PER_METER, HURDLE_METERS, HURDLE_HEIGHT_PIXELS } = window.FalseStartPhysics;
  const style = getComputedStyle(document.documentElement);
  const [paper, ink, skyBlue, grassGreen, terracotta, red, blue] = ['--paper', '--ink', '--sky', '--grass', '--track', '--lane-one', '--lane-two']
    .map((name) => style.getPropertyValue(name).trim());
  const W = 640, H = 396, LANE_HEIGHT = H / 2, GROUND = 170, CAMERA_X = 296;
  const FIXED_STEP = 1 / 120;
  const keysets = [['KeyQ', 'KeyW', 'KeyE', 'KeyR'], ['KeyU', 'KeyI', 'KeyO', 'KeyP']];
  const laneForKey = new Map(keysets.flatMap((keys, lane) => keys.map((key) => [key, lane])));
  const buttons = new Map(Array.from(document.querySelectorAll('[data-key]'), (button) => [button.dataset.key, button]));
  const scores = [0, 1].map((i) => ({ distance: byId(`distance-${i}`), status: byId(`lane-status-${i}`) }));
  const keyboard = new Set();
  const focusedKeys = new Set();
  const pointers = new Map();
  const queued = new Set();
  let race = createRace();
  let frame = null;
  let lastTick = null;
  let accumulator = 0;
  let drawScale = 1;

  const isHeld = (key) => keyboard.has(key) || focusedKeys.has(key) || Array.from(pointers.values()).includes(key);
  const ended = (runner) => runner.down || runner.finished;
  const formatDistance = (meters) => `${Math.abs(meters) < .05 ? '0.0' : meters.toFixed(1)} m`;

  function syncKeys() {
    for (const [key, button] of buttons) {
      button.disabled = ended(race.runners[laneForKey.get(key)]);
      button.classList.toggle('is-held', !button.disabled && isHeld(key));
    }
  }

  function releaseInputs() {
    keyboard.clear();
    focusedKeys.clear();
    pointers.clear();
    queued.clear();
    syncKeys();
  }

  function syncScore() {
    race.runners.forEach((runner, i) => {
      const distance = formatDistance(ended(runner) ? runner.best : runner.distance);
      const label = runner.down ? 'Fell' : runner.finished ? 'Finished' : runner.started ? 'Running' : 'Ready';
      const score = scores[i];
      if (score.distance.textContent !== distance) score.distance.textContent = distance;
      if (score.status.textContent !== label) {
        score.status.textContent = label;
        if (ended(runner)) {
          status.textContent = `Player ${i + 1} ${label.toLowerCase()}. Best distance ${distance}.`;
          syncKeys();
        }
      }
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

  function paintGround(runner) {
    const { distance, hurdle } = runner;
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND - 38);
    sky.addColorStop(0, skyBlue);
    sky.addColorStop(.24, '#384e66');
    sky.addColorStop(1, '#16233a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, GROUND - 36);
    ctx.fillStyle = '#1b5ea1';
    ctx.fillRect(0, GROUND - 52, W, 17);
    const field = ctx.createLinearGradient(0, GROUND - 36, 0, GROUND - 10);
    field.addColorStop(0, '#415c1c');
    field.addColorStop(1, grassGreen);
    ctx.fillStyle = field;
    ctx.fillRect(0, GROUND - 36, W, 26);
    const surface = ctx.createLinearGradient(0, GROUND - 10, 0, LANE_HEIGHT);
    surface.addColorStop(0, terracotta);
    surface.addColorStop(1, '#a22e16');
    ctx.fillStyle = surface;
    ctx.fillRect(0, GROUND - 10, W, LANE_HEIGHT - GROUND + 10);
    ctx.fillStyle = '#feffedad';
    for (const y of [GROUND - 9, GROUND, GROUND + 17]) ctx.fillRect(0, y, W, y === GROUND ? 2 : 1);
    ctx.fillStyle = '#17191a';
    ctx.fillRect(0, LANE_HEIGHT - 2, W, 2);

    const xAt = (meter) => CAMERA_X + (meter - distance) * PIXELS_PER_METER;
    const first = Math.max(0, Math.ceil((distance - CAMERA_X / PIXELS_PER_METER) / 5) * 5);
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    for (let meter = first; meter <= TRACK_METERS; meter += 5) {
      const x = Math.round(xAt(meter));
      if (x > W + 25) break;
      ctx.fillStyle = paper;
      if (meter === 0 || meter === TRACK_METERS) {
        ctx.fillRect(x - 2, GROUND - 9, 4, 27);
        if (meter === TRACK_METERS) {
          for (let y = GROUND - 9; y <= GROUND + 11; y += 4) ctx.fillRect(x + ((y - GROUND + 9) % 8 ? -6 : 2), y, 4, 4);
        }
      } else ctx.fillRect(x, GROUND, 1, 8);
      ctx.fillText(meter === 0 ? 'START' : `${meter} m`, x, GROUND + 15);
    }

    const obstacle = xAt(hurdle?.x ?? HURDLE_METERS);
    if (obstacle > -24 && obstacle < W + 24) {
      ctx.save();
      ctx.translate(obstacle, GROUND - (hurdle ? hurdle.y * PIXELS_PER_METER : HURDLE_HEIGHT_PIXELS / 2));
      ctx.rotate(-(hurdle?.angle ?? 0)); // World angles are counter-clockwise, with y pointing up.
      ctx.fillStyle = paper;
      ctx.fillRect(-4, -HURDLE_HEIGHT_PIXELS / 2, 8, HURDLE_HEIGHT_PIXELS);
      ctx.fillStyle = ink;
      ctx.fillRect(-4, -HURDLE_HEIGHT_PIXELS / 2, 8, 3);
      ctx.restore();
    }
  }

  function paintRunner(runner, lane) {
    ctx.save();
    ctx.translate(CAMERA_X, GROUND);
    const { head, shoulder, hip, legs, arms } = runner.pose;
    const jersey = lane === 0 ? red : blue;
    const shadow = lane === 0 ? '#86000b' : '#1b5ea1';
    const skin = lane === 0 ? '#bd7440' : '#d7a26b';
    const shadedSkin = lane === 0 ? '#834426' : '#9c623d';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.fillStyle = '#361b184d';
    ctx.beginPath();
    ctx.ellipse(hip.x, 3, runner.down ? 30 : 18, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    function leg(part, far) {
      line(far ? shadow : jersey, 12, hip, {x: (hip.x * 3 + part.knee.x) / 4, y: (hip.y * 3 + part.knee.y) / 4});
      const upper = {x: (hip.x + part.knee.x * .45) / 1.45, y: (hip.y + part.knee.y * .45) / 1.45};
      line(far ? shadedSkin : skin, 8.5, upper, part.knee);
      line(far ? shadedSkin : skin, 6.5, part.knee, part.ankle);
      line(far ? '#afc0cc' : '#e0e9ef', 5, part.ankle, part.toe);
    }
    function arm(index) {
      const part = arms?.[index];
      if (part) {
        line(index ? shadedSkin : skin, 5.8, shoulder, part.elbow, part.hand);
        return;
      }
      // Illustrate an opposing arm swing from the existing pose; the controls are legs only.
      const torsoAngle = Math.atan2(hip.y - shoulder.y, hip.x - shoulder.x) - Math.PI / 2;
      const knee = legs[index ^ 1].knee;
      const swing = Math.max(-.9, Math.min(.9, (knee.x - hip.x) / 24));
      const a = torsoAngle + swing;
      const elbow = {x: shoulder.x - Math.sin(a) * 14, y: Math.min(-3, shoulder.y + Math.cos(a) * 14)};
      const hand = {x: elbow.x + Math.cos(a) * 11, y: Math.min(-2, elbow.y + Math.sin(a) * 11 - 5)};
      line(index ? shadedSkin : skin, 5.8, shoulder, elbow, hand);
    }
    arm(1);
    leg(legs[1], true);
    line(shadow, 19, shoulder, hip);
    line(jersey, 15, shoulder, hip);
    const bib = {x: shoulder.x * .62 + hip.x * .38, y: shoulder.y * .62 + hip.y * .38};
    ctx.save();
    ctx.translate(bib.x, bib.y);
    ctx.rotate(Math.atan2(hip.y - shoulder.y, hip.x - shoulder.x) - Math.PI / 2);
    ctx.fillStyle = paper;
    ctx.fillRect(-6, -5, 12, 10);
    ctx.fillStyle = ink;
    ctx.font = 'bold 8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(String(lane + 1), 0, 3);
    ctx.restore();
    leg(legs[0], false);
    arm(0);
    line(shadedSkin, 6, shoulder, head);
    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(Math.atan2(hip.y - shoulder.y, hip.x - shoulder.x) - Math.PI / 2);
    dot(0, 0, 9, '#3b2521');
    dot(1.2, 1.8, 7.3, skin);
    dot(6.8, .8, 2.5, skin);
    dot(4.7, -.4, 1.05, ink);
    ctx.restore();
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
      paintGround(runner);
      paintRunner(runner, i);
      ctx.restore();
    });
  }

  function resize() {
    const width = canvas.getBoundingClientRect().width;
    drawScale = Math.max(1, Math.min(3, width / W * (window.devicePixelRatio || 1)));
    const w = Math.ceil(W * drawScale), h = Math.ceil(H * drawScale);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    draw();
  }

  function reset() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    race = createRace();
    accumulator = 0;
    lastTick = null;
    releaseInputs();
    showBanner('', '');
    syncScore();
    draw();
    status.textContent = 'Both attempts reset.';
  }

  function update(now) {
    frame = null;
    if (document.hidden || race.complete) return;
    if (lastTick !== null) accumulator += Math.min(.1, (now - lastTick) / 1000);
    lastTick = now;
    while (accumulator >= FIXED_STEP && !race.complete) {
      const input = keysets.map((keys) => keys.map((key) => isHeld(key) || queued.has(key)));
      queued.clear();
      stepRace(race, input, FIXED_STEP);
      accumulator -= FIXED_STEP;
    }
    syncScore();
    draw();
    if (race.complete) {
      releaseInputs();
      const result = race.winner === null ? 'Tie' : `Player ${race.winner + 1} wins`;
      const [a, b] = race.runners.map((runner) => formatDistance(runner.best));
      showBanner(result, `${a} / ${b} · ${resetLabel}`);
      status.textContent = `${result}. Player 1: ${a}. Player 2: ${b}.`;
    } else if (queued.size || race.runners.some((runner) => runner.started && !ended(runner))) {
      frame = requestAnimationFrame(update);
    } else {
      accumulator = 0;
      lastTick = null;
    }
  }

  function press(key) {
    queued.add(key);
    syncKeys();
    if (frame === null && !document.hidden) {
      lastTick = performance.now();
      frame = requestAnimationFrame(update);
    }
  }

  function codeFor(event) {
    if (buttons.has(event.code) || event.code === 'Space') return event.code;
    if (event.key === ' ') return 'Space';
    return event.key?.length === 1 ? `Key${event.key.toUpperCase()}` : '';
  }

  const locked = (code) => race.complete || ended(race.runners[laneForKey.get(code)]);
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
    if (event.repeat || locked(code)) return;
    keyboard.add(code);
    press(code);
  });
  window.addEventListener('keyup', (event) => {
    const code = codeFor(event);
    if (!buttons.has(code)) return;
    keyboard.delete(code);
    syncKeys();
  });

  for (const [code, button] of buttons) {
    button.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || locked(code)) return;
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, code);
      press(code);
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      button.addEventListener(type, (event) => {
        pointers.delete(event.pointerId);
        syncKeys();
      });
    }
    button.addEventListener('contextmenu', (event) => event.preventDefault());
    button.addEventListener('keydown', (event) => {
      if (!['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      if (event.repeat || locked(code)) return;
      focusedKeys.add(code);
      press(code);
    });
    const releaseButton = () => { focusedKeys.delete(code); syncKeys(); };
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
    } else if (!race.complete && frame === null && race.runners.some((runner) => runner.started && !ended(runner))) {
      frame = requestAnimationFrame(update);
    }
  });
  byId('reset').addEventListener('click', reset);
  new ResizeObserver(resize).observe(canvas);
  if (window.frameElement?.hasAttribute('data-false-start-embed')) {
    byId('start-hint').textContent = 'Click the track or use the buttons, then press a leg key. Space restarts both.';
    const meet = document.querySelector('.meet');
    new ResizeObserver(() => {
      const height = `${Math.ceil(meet.getBoundingClientRect().height)}px`;
      if (window.frameElement && window.frameElement.style.height !== height) window.frameElement.style.height = height;
    }).observe(meet);
  }
  syncScore();
  syncKeys();
  resize();
})();
