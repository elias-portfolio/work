/* A deliberately unstable, articulated runner; no external engine or assets. */
(function (factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else window.FalseStartPhysics = factory();
}(() => {
  'use strict';

  const TRACK_METERS = 100;
  const PIXELS_PER_METER = 49;
  const START_RANGE = -2.5;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const segment = (p, a, length) => ({x: p.x + Math.sin(a) * length, y: p.y + Math.cos(a) * length});
  const joint = (angle) => ({angle, velocity: 0});

  function moveJoint(j, target, dt, stiffness = 200, damping = 22) {
    j.velocity += ((target - j.angle) * stiffness - j.velocity * damping) * dt;
    j.angle += j.velocity * dt;
  }

  function localPose(r) {
    const ratio = clamp(r.recovery / 1.08, 0, 1);
    const falling = r.down ? Math.sin(Math.PI * Math.pow(ratio, 0.68)) : 0;
    const tilt = r.lean.angle + r.fallDirection * 1.43 * falling;
    const hip = {x: 0, y: 0};
    const shoulder = segment(hip, Math.PI - tilt, 33);
    const head = segment(shoulder, Math.PI - tilt * .84, 14);
    const legs = r.thighs.map(({angle}, i) => {
      const thigh = mix(angle, -r.fallDirection * (1.40 + i * .25), falling);
      const shin = thigh - mix(r.knees[i].angle, .22 + i * .22, falling);
      const knee = segment(hip, thigh, 25);
      const ankle = segment(knee, shin, 25);
      const toe = segment(ankle, Math.PI / 2 + clamp(shin * .28, -.32, .37), 12);
      return {knee, ankle, toe};
    });
    const points = [hip, shoulder, head, ...legs.flatMap(({knee, ankle, toe}) => [knee, ankle, toe])];
    const sole = Math.max(...legs.flatMap(({ankle, toe}) => [ankle.y, toe.y]));
    // Ground contact follows the lowest shoe; on impact, the head/torso may touch instead.
    const bottom = Math.max(sole, hip.y + 6, shoulder.y + 7, head.y + 10);
    for (const point of points) point.y -= bottom;
    return {hip, shoulder, head, legs};
  }

  function createRunner() {
    const r = {
      distance: 0, best: 0, falls: 0, down: false,
      speed: 0, recovery: 0, fallDirection: 1,
      lean: joint(.06), thighs: [joint(.18), joint(-.13)], knees: [joint(.12), joint(.20)],
      stroke: 0, strokeTime: 0, lastStroke: 0, idle: 1, instability: 0,
    };
    r.pose = localPose(r);
    return r;
  }

  function createRace() {
    return {runners: [createRunner(), createRunner()], elapsed: 0, winner: null};
  }

  function stepRunner(r, keys, dt) {
    const [left, right, calfL, calfR] = keys;
    const thigh = Number(!!left) - Number(!!right);
    const calf = Number(!!calfL) - Number(!!calfR);
    const active = Boolean(left || right || calfL || calfR);
    const linked = thigh && thigh === -calf && !(left && right) && !(calfL && calfR) ? thigh : 0;

    if (r.down) {
      r.recovery -= dt;
      r.speed *= Math.exp(-7.5 * dt);
      r.distance = Math.max(START_RANGE, r.distance + r.speed * dt);
      moveJoint(r.lean, .07, dt, 150, 22);
      r.thighs.forEach((j, i) => moveJoint(j, i ? -.13 : .18, dt));
      r.knees.forEach((j, i) => moveJoint(j, i ? .20 : .12, dt));
      if (r.recovery <= 0) {
        r.down = false;
        r.instability = 0;
        r.strokeTime = 0;
        r.stroke = 0;
        r.lastStroke = 0;
      }
    } else {
      r.idle = active ? 0 : r.idle + dt;
      if (r.idle > .48) r.lastStroke = 0;
      if (linked && linked !== r.stroke && linked !== r.lastStroke) {
        r.stroke = linked;
        r.strokeTime = 0;
      }
      if (linked && linked === r.stroke) {
        r.strokeTime += dt;
        if (r.strokeTime >= .11) r.lastStroke = linked;
      } else {
        r.stroke = 0;
        r.strokeTime = 0;
      }

      moveJoint(r.thighs[0], thigh ? .62 * thigh : .18, dt);
      moveJoint(r.thighs[1], thigh ? -.62 * thigh : -.13, dt);
      moveJoint(r.knees[0], calfL ? .075 : left ? .89 : .21, dt, 265, 24);
      moveJoint(r.knees[1], calfR ? .075 : right ? .89 : .21, dt, 265, 24);

      const stance = r.thighs[linked > 0 ? 1 : 0].angle;
      const planted = linked && r.stroke === linked && r.strokeTime >= .11 && r.strokeTime < .29
        ? clamp((-stance * linked - .13) / .26, 0, 1) : 0;
      const stalled = linked && (!r.stroke || r.strokeTime > .39);
      const opposing = (left && right) || (calfL && calfR) || (thigh && thigh === calf);
      const offBalance = active && (!linked || stalled);
      r.instability = clamp(r.instability + dt * (offBalance ? (opposing ? 2.5 : 1.48) : -2.35), 0, 1.2);
      const direction = stalled ? 1 : (thigh || -calf || 1);
      const target = .055 + .20 * clamp(r.speed / 5, 0, 1) + .12 * planted + direction * r.instability * 1.21;
      moveJoint(r.lean, target, dt, 113, 15);

      const acceleration = 26 * planted - (offBalance ? 1.00 + 2 * r.instability : 0);
      r.speed = clamp(r.speed * Math.exp(-3.1 * dt) + acceleration * dt, -1.8, 5.8);
      if (!active && Math.abs(r.speed) < .018) r.speed = 0;
      r.distance = Math.max(START_RANGE, r.distance + r.speed * dt);

      if (r.instability >= .98 && Math.abs(r.lean.angle) >= .68) {
        r.down = true;
        r.falls++;
        r.recovery = 1.08;
        r.fallDirection = Math.sign(r.lean.angle) || 1;
        r.speed *= .42;
      }
    }
    r.best = Math.max(r.best, r.distance);
    r.pose = localPose(r);
  }

  function stepRace(race, inputs, dt) {
    if (race.winner !== null || !(dt > 0) || !Number.isFinite(dt)) return;
    // Subdivide a coarser caller timestep so springs remain stable.
    const count = Math.ceil(Math.min(dt, .1) * 120 - 1e-10);
    const step = Math.min(dt, .1) / Math.max(1, count);
    for (let i = 0; i < Math.max(1, count); i++) {
      const before = race.runners.map((r) => r.distance);
      race.runners.forEach((r, lane) => stepRunner(r, inputs[lane] ?? [], step));
      let fraction = Infinity;
      race.runners.forEach((r, lane) => {
        if (r.distance < TRACK_METERS) return;
        const crossing = (TRACK_METERS - before[lane]) / (r.distance - before[lane]);
        if (crossing < fraction) {
          race.winner = lane;
          fraction = crossing;
        }
      });
      if (race.winner !== null) {
        race.elapsed += step * fraction;
        race.runners.forEach((r, lane) => {
          r.distance = Math.min(TRACK_METERS, mix(before[lane], r.distance, fraction));
          if (lane === race.winner) r.distance = r.best = TRACK_METERS;
          else r.best = Math.min(r.best, TRACK_METERS);
        });
        return;
      }
      race.elapsed += step;
    }
  }

  return {createRace, stepRace, TRACK_METERS, PIXELS_PER_METER};
}));
