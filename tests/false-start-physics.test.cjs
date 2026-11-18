/**
 * FALSE START physics — Node tests.
 *
 * Run with: node --test tests/false-start-physics.test.cjs
 *
 * The engine is a real hinged ragdoll in Planck.js. These tests pin the contract the UI
 * depends on, then assert the properties that make it a game rather than a demo:
 * nothing moves without input, a fixed key combination cannot run, a discoverable
 * two-key rhythm reaches 100 m in a sane time, wrong input ends the attempt, the result
 * waits for both runners, ranking uses the farthest point rather than the final point,
 * and every exported number stays finite.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const ENGINE = path.join(ROOT, 'js/false-start-physics.js');
const props = require(ENGINE);

const DT = 1 / 60;
const IDLE = [false, false, false, false];

function step(race, lanes, seconds, onTick) {
  const steps = Math.round(seconds / DT);
  for (let i = 0; i < steps; i += 1) {
    if (race.complete) return;
    props.stepRace(race, lanes.map((lane) => lane(i * DT)), DT);
    if (onTick) onTick(i * DT, race);
  }
}

// The human-playable rhythm used throughout: hips lead for the first 40 % of each stride,
// calves overlap the second half of it, and the two legs are half a cycle apart. A period
// near 0.6 s is the sweet spot; the engine is intentionally sensitive around it.
const phaseIn = (p, from, to) => (from <= to ? p >= from && p < to : p >= from || p < to);
function stride(period) {
  return (t) => {
    const keys = [false, false, false, false];
    for (let leg = 0; leg < 2; leg += 1) {
      const phase = (((t / period + leg * 0.5) % 1) + 1) % 1;
      keys[leg] = phaseIn(phase, 0, 0.4);
      keys[leg + 2] = phaseIn(phase, 0.2, 0.4);
    }
    return keys;
  };
}

// Solo run in lane 0 with lane 1 untouched. Reports the moment lane 0 itself ended,
// because race.elapsed only settles once both attempts are over and lane 1 never starts.
function playLane(schedule, maxSeconds = 150) {
  const race = props.createRace();
  const runner = race.runners[0];
  let seconds = null;
  const steps = Math.round(maxSeconds / DT);
  for (let i = 0; i < steps && !runner.finished; i += 1) {
    props.stepRace(race, [schedule(i * DT), IDLE], DT);
    if (runner.finished) seconds = (i + 1) * DT;
  }
  return { race, runner, seconds };
}

function assertFinite(value, label) {
  assert.equal(typeof value, 'number', `${label} must be a number`);
  assert.ok(Number.isFinite(value), `${label} must be finite, got ${value}`);
}

function assertPoseIsFinite(pose, label) {
  const points = [pose.head, pose.shoulder, pose.hip];
  for (const leg of pose.legs) points.push(leg.knee, leg.ankle, leg.toe);
  for (const point of points) {
    assertFinite(point.x, `${label} point.x`);
    assertFinite(point.y, `${label} point.y`);
  }
}

test('exports the agreed surface', () => {
  assert.equal(typeof props.createRace, 'function');
  assert.equal(typeof props.stepRace, 'function');
  assert.equal(props.TRACK_METERS, 100);
  assert.equal(props.HURDLE_METERS, 50);
  assert.ok(Number.isFinite(props.PIXELS_PER_METER));
  assert.ok(props.PIXELS_PER_METER >= 45 && props.PIXELS_PER_METER <= 54, 'PIXELS_PER_METER stays in the renderer range');
  assert.ok(Number.isFinite(props.HURDLE_HEIGHT_PIXELS) && props.HURDLE_HEIGHT_PIXELS > 0);
});

test('createRace starts a fresh, unfinished, two-lane race', () => {
  const race = props.createRace();
  assert.equal(race.runners.length, 2);
  assert.equal(race.elapsed, 0);
  assert.equal(race.winner, null);
  assert.equal(race.complete, false);
  for (const runner of race.runners) {
    assert.equal(runner.distance, 0);
    assert.equal(runner.best, 0);
    assert.equal(runner.down, false);
    assert.equal(runner.finished, false);
    assert.equal(runner.started, false);
    assertPoseIsFinite(runner.pose, 'standing pose');
  }
  const [a, b] = race.runners;
  assert.notEqual(a.pose, b.pose, 'each runner owns its pose object');
});

test('a standing runner reports the pose convention the renderer expects', () => {
  const { pose } = props.createRace().runners[0];
  assert.equal(pose.hip.x, 0, 'x is local to the runner');
  assert.ok(pose.head.y < pose.shoulder.y, 'head is above the shoulder (up is negative)');
  assert.ok(pose.shoulder.y < pose.hip.y, 'shoulder is above the hip');
  assert.ok(pose.hip.y < 0, 'hip sits above the ground');
  assert.ok(pose.head.y > -110 && pose.head.y < -80, `standing head height ~95px, got ${pose.head.y}`);
  for (const leg of pose.legs) {
    // Up is negative, so a lower joint reports the greater y.
    assert.ok(leg.knee.y > pose.hip.y, 'knee hangs below the hip');
    assert.ok(leg.ankle.y > leg.knee.y, 'ankle hangs below the knee');
    assert.ok(leg.toe.y > leg.knee.y, 'toe hangs below the knee');
    assert.ok(Math.abs(leg.ankle.y) < 8, 'foot rests on the ground line');
  }
});

test('an untouched runner never moves and never starts', () => {
  const race = props.createRace();
  step(race, [() => IDLE, () => IDLE], 12);
  for (const runner of race.runners) {
    assert.equal(runner.started, false);
    assert.equal(runner.distance, 0);
    assert.equal(runner.best, 0);
    assert.equal(runner.down, false);
  }
  assert.equal(race.elapsed, 0, 'the clock does not run before anyone starts');
  assert.equal(race.complete, false);
});

test('the first key starts a runner; the idle lane stays exactly put', () => {
  const race = props.createRace();
  const keys = [true, false, false, false];
  step(race, [() => keys, () => IDLE], 3);
  assert.equal(race.runners[0].started, true);
  assert.equal(race.runners[1].started, false);
  assert.equal(race.runners[1].distance, 0);
  assert.equal(race.runners[1].best, 0);
  assert.ok(race.elapsed > 0, 'the clock runs once someone starts');
});

test('movement is real physics, not a translation hint: no key combination auto-runs', () => {
  // Every fixed combination of the four keys, held long enough to reach a false finish
  // if the engine were cheating with a cadence or a synthetic push.
  for (let mask = 1; mask < 16; mask += 1) {
    const held = [0, 1, 2, 3].map((bit) => Boolean(mask & (1 << bit)));
    const { runner } = playLane(() => held, 20);
    assert.ok(
      !runner.finished || runner.best < props.TRACK_METERS,
      `mask ${mask} must not finish by holding keys still`
    );
    assert.ok(runner.best < 5, `mask ${mask} is a lean/slide, not a run (reached ${runner.best.toFixed(2)} m)`);
    assertFinite(runner.best, `mask ${mask} best`);
  }
});

test('a specific committed cadence reaches the finish in a human time', () => {
  // One concrete, deterministic input. The engine is deliberately sensitive to rhythm, so
  // this pins a cadence that works instead of claiming every tempo does: hips lead for the
  // first 40 % of each stride and the calf overlaps the second half.
  const { runner, seconds } = playLane(stride(0.65), 140);
  assert.equal(runner.finished, true, 'the tested cadence reaches the finish');
  assert.equal(runner.down, false, 'the tested cadence does not fall');
  assert.equal(runner.best, props.TRACK_METERS, 'a finish scores exactly 100 m');
  assert.ok(seconds !== null, 'the attempt ended inside the run window');
  assert.ok(seconds >= 25 && seconds <= 65, `the cadence finishes in 25-65 s, took ${seconds.toFixed(1)}`);
});

test('the same rhythm is repeatable and deterministic', () => {
  // Compare a full, meaningful attempt rather than an early stumble: same input must give
  // bit-identical physics, including the pose and the hurdle it knocks over.
  const once = playLane(stride(0.6), 140);
  const twice = playLane(stride(0.6), 140);
  assert.equal(once.runner.best, twice.runner.best);
  assert.equal(once.runner.distance, twice.runner.distance);
  assert.equal(once.runner.finished, twice.runner.finished);
  assert.equal(once.runner.down, twice.runner.down);
  assert.equal(once.seconds, twice.seconds);
  assert.equal(JSON.stringify(once.runner.pose), JSON.stringify(twice.runner.pose));
  assert.equal(JSON.stringify(once.runner.hurdle), JSON.stringify(twice.runner.hurdle));
  assert.ok(once.runner.best > 50, 'the deterministic comparison covers real distance');
});

test('a range of nearby tempos also finish, so the rhythm is learnable not razor-thin', () => {
  for (const period of [0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8]) {
    const { runner } = playLane(stride(period), 180);
    assert.equal(
      runner.finished,
      true,
      `stride period ${period}s should finish, reached ${runner.best.toFixed(1)} m`
    );
    assert.equal(runner.down, false, `stride period ${period}s should stay on its feet`);
  }
  // Outside that band the engine does punish the rhythm: this is sensitivity, not a bug.
  const tooSlow = playLane(stride(0.875), 90).runner;
  assert.equal(tooSlow.down, true, 'a 0.875 s stride is outside the working band, so the runner falls');
});

test('an imperfect human rhythm still makes real progress', () => {
  // Sloppy timing: each side stretched or squeezed by up to 18 %.
  let seed = 20260818;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  let period = 0.6;
  let start = 0;
  const sloppy = (t) => {
    while (t - start >= period) {
      start += period;
      period = 0.6 * (1 + (rand() * 2 - 1) * 0.18);
    }
    const phase = (t - start) / period;
    const keys = [false, false, false, false];
    for (let leg = 0; leg < 2; leg += 1) {
      const p = (((phase + leg * 0.5) % 1) + 1) % 1;
      keys[leg] = phaseIn(p, 0, 0.4);
      keys[leg + 2] = phaseIn(p, 0.2, 0.4);
    }
    return keys;
  };
  const { runner } = playLane(sloppy, 160);
  assert.ok(runner.best >= 40, `sloppy play should still cover real ground, reached ${runner.best.toFixed(1)} m`);
  assertFinite(runner.best, 'sloppy play best');
});

test('wrong input ends the attempt permanently, with no automatic recovery', () => {
  const race = props.createRace();
  const wrong = [true, true, false, false];
  step(race, [() => wrong, () => IDLE], 25);
  const runner = race.runners[0];
  assert.equal(runner.down, true, 'pushing both thighs forward should put the runner on the ground');
  assert.equal(runner.finished, true, 'a fall ends the attempt');

  const frozenPose = JSON.stringify(runner.pose);
  const frozenBest = runner.best;
  const frozenDistance = runner.distance;
  // Keep mashing every key for another five seconds: nothing may change.
  step(race, [() => [true, true, true, true], () => IDLE], 5);
  assert.equal(JSON.stringify(runner.pose), frozenPose, 'a fallen runner keeps its final pose');
  assert.equal(runner.best, frozenBest, 'a fallen runner keeps its score');
  assert.equal(runner.distance, frozenDistance, 'a fallen runner does not recover or slide');
  assert.equal(runner.started, true);
});

test('a fall is a fall, not a strike: the head or torso reaches the ground', () => {
  const race = props.createRace();
  step(race, [() => [true, true, false, false], () => IDLE], 12);
  const runner = race.runners[0];
  assert.equal(runner.down, true);
  assert.ok(
    runner.pose.head.y > -30 || runner.pose.shoulder.y > -30,
    'the fallen pose shows the upper body at ground level'
  );
  assertFinite(runner.pose.head.y, 'fallen head y');
});

test('knees and feet may touch the ground without ending the attempt', () => {
  // Both calves pulled up puts the runner in a deep crouch; shins and feet take the load.
  const race = props.createRace();
  step(race, [() => [false, false, true, true], () => IDLE], 6);
  const runner = race.runners[0];
  assert.equal(runner.finished, false, 'a crouch on shins and feet is not a fall');
  assert.equal(runner.down, false);
  assert.ok(runner.best < 5, 'a crouch does not travel');
});

test('the result waits for both attempts to end', () => {
  const race = props.createRace();
  const runner1 = stride(0.6);
  // Lane 0 falls quickly; lane 1 is mid-stride and well short of the finish.
  step(race, [() => [true, true, false, false], runner1], 3);
  assert.equal(race.runners[0].finished, true, 'lane 0 is out');
  assert.equal(race.runners[1].finished, false, 'lane 1 is still running');
  assert.equal(race.complete, false, 'no result while an attempt is still live');
  assert.equal(race.winner, null);
});

test('winner is zero-based, and a stuck attempt never produces a result', () => {
  const race = props.createRace();
  step(race, [stride(0.6), () => IDLE], 120);
  assert.equal(race.runners[0].finished, true, 'the running lane finishes');
  assert.equal(race.runners[0].down, false);
  assert.equal(race.runners[1].finished, false, 'a lane that never presses a key never finishes');
  assert.equal(race.complete, false);
  assert.equal(race.winner, null);
});

test('ranking uses the farthest point reached, not the final position or the clock', () => {
  // Lane 0 runs far and then crashes; lane 1 runs a little, later, and stops shorter.
  const race = props.createRace();
  const steady = stride(0.5);
  const slow = stride(0.8);
  step(
    race,
    [(t) => (t < 26 ? steady(t) : [true, true, false, false]), (t) => (t < 22 ? slow(t) : IDLE)],
    200
  );
  const [a, b] = race.runners;
  assert.equal(a.down, true, 'lane 0 crashed after a long run');
  assert.equal(b.finished, true, 'lane 1 also ended its attempt');
  assert.ok(a.best > b.best, `lane 0 went farther (${a.best.toFixed(1)}) than lane 1 (${b.best.toFixed(1)})`);
  assert.ok(a.distance < a.best, 'lane 0 ended behind its peak, so peak and final point genuinely differ');
  assert.equal(race.complete, true);
  assert.equal(race.winner, 0, 'the runner that covered the most ground wins even though it fell short of its own peak');
});

test('identical play is an explicit tie', () => {
  const race = props.createRace();
  step(race, [stride(0.6), stride(0.6)], 140);
  assert.equal(race.complete, true, 'both attempts ended');
  assert.equal(race.runners[0].best, race.runners[1].best);
  assert.equal(race.runners[0].best, props.TRACK_METERS, 'both lanes actually finished');
  assert.equal(race.winner, null, 'a tie is null rather than a coin flip');
});

test('two independent players race the same track with different results', () => {
  const race = props.createRace();
  step(race, [stride(0.5), () => [true, true, false, false]], 40);
  assert.equal(race.runners[0].finished, true);
  assert.equal(race.runners[1].down, true);
  assert.ok(race.runners[0].best > 10, 'the running player covers ground');
  assert.ok(race.runners[1].best < 5, 'the falling player does not');
  assert.equal(race.runners[0].down, false);
});

test('reaching the finish ends the attempt and freezes that runner', () => {
  const race = props.createRace();
  step(race, [stride(0.5), () => IDLE], 120);
  const finisher = race.runners[0];
  assert.equal(finisher.finished, true);
  assert.equal(finisher.down, false);
  assert.ok(finisher.best >= props.TRACK_METERS);
  assert.ok(finisher.best <= props.TRACK_METERS + 1, `the finish is not overshot: ${finisher.best}`);
  const snapshot = JSON.stringify(finisher.pose);
  const before = [finisher.distance, finisher.best];
  props.stepRace(race, [[true, true, true, true], IDLE], DT);
  assert.equal(JSON.stringify(finisher.pose), snapshot, 'a finished runner keeps its final pose');
  assert.deepEqual([finisher.distance, finisher.best], before, 'a finished runner keeps its score');
  assertPoseIsFinite(finisher.pose, 'finished pose');
});

test('the hurdle is an obstacle you can clear, not a wall', () => {
  for (const period of [0.45, 0.5, 0.55, 0.65, 0.75]) {
    const { runner } = playLane(stride(period), 180);
    assert.ok(
      runner.best > props.HURDLE_METERS + 1,
      `the stride must carry a runner past the ${props.HURDLE_METERS} m hurdle, reached ${runner.best.toFixed(1)}`
    );
  }
});

test('coasting into the hurdle does not finish the race', () => {
  const race = props.createRace();
  step(race, [(t) => (t < 17 ? stride(0.6)(t) : IDLE), () => IDLE], 60);
  const runner = race.runners[0];
  assertFinite(runner.best, 'hurdle attempt best');
  assertFinite(runner.distance, 'hurdle attempt distance');
  assert.ok(runner.best < props.TRACK_METERS, 'coasting does not finish');
});

test('stepRace ignores nonsense timing instead of corrupting the race', () => {
  const race = props.createRace();
  props.stepRace(race, [IDLE, IDLE], 0);
  props.stepRace(race, [IDLE, IDLE], -1);
  props.stepRace(race, [IDLE, IDLE], NaN);
  props.stepRace(race, [IDLE, IDLE], Infinity);
  props.stepRace(race, [null, null], DT);
  props.stepRace(race, [], DT);
  props.stepRace(race, undefined, DT);
  for (const runner of race.runners) {
    assert.equal(runner.distance, 0);
    assert.equal(runner.started, false);
    assertPoseIsFinite(runner.pose, 'pose after bad input');
  }
  assert.equal(race.winner, null);
  assert.equal(race.complete, false);
});

test('stepRace rejects something that is not a race', () => {
  assert.throws(() => props.stepRace(null, [IDLE, IDLE], DT), TypeError);
  assert.throws(() => props.stepRace({}, [IDLE, IDLE], DT), TypeError);
});

test('a completed race is frozen', () => {
  const race = props.createRace();
  step(race, [stride(0.6), stride(0.6)], 140);
  assert.equal(race.complete, true);
  const snapshot = JSON.stringify(race.runners.map((r) => [r.distance, r.best, r.down, r.finished]));
  const winner = race.winner;
  props.stepRace(race, [[true, true, true, true], [true, true, true, true]], DT);
  assert.equal(JSON.stringify(race.runners.map((r) => [r.distance, r.best, r.down, r.finished])), snapshot);
  assert.equal(race.winner, winner);
});

test('large and long frame deltas stay finite and bounded', () => {
  const race = props.createRace();
  for (let i = 0; i < 600; i += 1) {
    props.stepRace(race, [stride(0.5)(i / 60), stride(0.7)(i / 60)], 0.5);
  }
  for (const runner of race.runners) {
    assertFinite(runner.distance, 'distance under coarse steps');
    assertFinite(runner.best, 'best under coarse steps');
    assertPoseIsFinite(runner.pose, 'pose under coarse steps');
    assert.ok(runner.best <= props.TRACK_METERS + 1, 'the hip cannot teleport past the line');
  }
  assertFinite(race.elapsed, 'elapsed under coarse steps');
});

test('the hurdle exposes read-only world state the renderer can follow', () => {
  const race = props.createRace();
  const runner = race.runners[0];
  assert.ok(runner.hurdle, 'runner.hurdle exists');
  assertFinite(runner.hurdle.x, 'hurdle.x');
  assertFinite(runner.hurdle.y, 'hurdle.y');
  assertFinite(runner.hurdle.angle, 'hurdle.angle');
  assert.equal(runner.hurdle.x, props.HURDLE_METERS, 'the plank starts at the hurdle mark');
  assert.equal(runner.hurdle.angle, 0, 'the plank starts upright');
  assert.ok(runner.hurdle.y > 0 && runner.hurdle.y < props.HURDLE_HEIGHT_PIXELS / props.PIXELS_PER_METER, 'plank centre sits mid-height');

  // Running into it moves the plank: y drops and |angle| grows.
  step(race, [stride(0.5), () => IDLE], 120);
  const knocked = race.runners[0];
  assertFinite(knocked.hurdle.x, 'knocked hurdle.x');
  assertFinite(knocked.hurdle.angle, 'knocked hurdle.angle');
  assert.ok(
    Math.abs(knocked.hurdle.angle) > 0.01 || knocked.hurdle.y < props.HURDLE_HEIGHT_PIXELS / props.PIXELS_PER_METER / 2,
    'a crossed hurdle is visibly disturbed'
  );
});

test('a passive arm pose is provided for the renderer', () => {
  const { pose } = props.createRace().runners[0];
  assert.equal(pose.arms.length, 2, 'two arms');
  for (const arm of pose.arms) {
    assertFinite(arm.elbow.x, 'arm elbow x');
    assertFinite(arm.elbow.y, 'arm elbow y');
    assertFinite(arm.hand.x, 'arm hand x');
    assertFinite(arm.hand.y, 'arm hand y');
  }
  const [left, right] = pose.arms;
  assert.ok(left.elbow.x > 0 && right.elbow.x < 0, 'arms hang to opposite sides of the shoulder');
  assert.ok(left.hand.y > left.elbow.y, 'the hand hangs below the elbow');
});

test('ending an attempt never increases the score afterwards', () => {
  // Fall: best is locked on the frame of first contact and the settle pass must not add.
  const race = props.createRace();
  const runner = race.runners[0];
  let bestBeforeEnd = 0;
  let distanceBeforeEnd = 0;
  let frames = 0;
  while (!runner.finished && frames < 2000) {
    bestBeforeEnd = runner.best;
    distanceBeforeEnd = runner.distance;
    props.stepRace(race, [[true, true, false, false], IDLE], DT);
    frames += 1;
  }
  assert.equal(runner.finished, true);
  assert.equal(runner.down, true);
  assert.ok(runner.best <= bestBeforeEnd, `settle must not raise best (${runner.best} > ${bestBeforeEnd})`);
  assert.ok(
    Math.abs(runner.distance - distanceBeforeEnd) < 3,
    'the settle pass may slide the body visually but not transport it'
  );
  assert.ok(runner.best <= props.TRACK_METERS, 'best never exceeds the track');
});

test('finished is terminal for both completion paths', () => {
  // Fall path.
  const fallRace = props.createRace();
  step(fallRace, [() => [true, true, false, false], () => IDLE], 10);
  const fallen = fallRace.runners[0];
  assert.equal(fallen.finished, true);
  assert.equal(fallen.down, true);

  // Finish path.
  const finishRace = props.createRace();
  step(finishRace, [stride(0.5), () => IDLE], 120);
  const finisher = finishRace.runners[0];
  assert.equal(finisher.finished, true);
  assert.equal(finisher.down, false, 'reaching 100 m is a finish, not a fall');

  // Both paths ignore further input for that runner.
  for (const [race, runner] of [[fallRace, fallen], [finishRace, finisher]]) {
    const pose = JSON.stringify(runner.pose);
    const state = [runner.distance, runner.best, runner.down];
    for (let i = 0; i < 60; i += 1) props.stepRace(race, [[true, false, true, false], IDLE], DT);
    assert.equal(JSON.stringify(runner.pose), pose, 'pose is terminal');
    assert.deepEqual([runner.distance, runner.best, runner.down], state, 'score and flags are terminal');
  }
});

test('a finish scores exactly the track length', () => {
  const race = props.createRace();
  step(race, [stride(0.5), () => IDLE], 120);
  const finisher = race.runners[0];
  assert.equal(finisher.best, props.TRACK_METERS, 'the finish is capped at exactly 100 m');
});

test('browser and Node both load the UMD module', () => {
  const source = fs.readFileSync(ENGINE, 'utf8');
  const planckSource = fs.readFileSync(path.join(ROOT, 'js/vendor/planck.min.js'), 'utf8');
  const sandbox = { console };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(planckSource, sandbox, { filename: 'planck.min.js' });
  assert.equal(typeof sandbox.planck, 'object', 'the vendor build exposes the planck global');
  vm.runInContext(source, sandbox, { filename: 'false-start-physics.js' });
  assert.equal(typeof sandbox.FalseStartPhysics, 'object', 'the engine attaches window.FalseStartPhysics');
  const api = sandbox.FalseStartPhysics;
  assert.equal(typeof api.createRace, 'function');
  assert.equal(api.TRACK_METERS, 100);
  const race = api.createRace();
  api.stepRace(race, [stride(0.6)(0), IDLE], DT);
  assertFinite(race.runners[0].distance, 'browser-lane distance');
  assert.equal(race.runners[0].started, true, 'the browser lane accepted input');
});
