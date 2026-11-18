const test = require('node:test');
const assert = require('node:assert/strict');
const {createRace, stepRace, TRACK_METERS} = require('../js/false-start-physics.js');

const dt = 1 / 120;
const a = [true, false, false, true];
const b = [false, true, true, false];
const idle = [false, false, false, false];
const cadence = (frame) => {
  const phase = frame % 36;
  if (phase >= 33) return idle;
  // The fingers need not strike simultaneously: thighs can come first.
  if (phase < 3) return Math.floor(frame / 36) % 2 ? [false, true, false, false] : [true, false, false, false];
  return Math.floor(frame / 36) % 2 ? b : a;
};

function advance(race, frames, inputs) {
  for (let i = 0; i < frames && race.winner === null; i++) stepRace(race, inputs(i), dt);
}

for (const leader of [0, 1]) {
  test(`runner ${leader + 1} can win a duel with alternating diagonals and imperfect timing`, () => {
    const race = createRace();
    advance(race, 120 * 65, (i) => {
      const inputs = [idle, idle];
      inputs[leader] = cadence(i);
      inputs[1 - leader] = i > 120 ? cadence(i - 120) : idle;
      return inputs;
    });
    assert.equal(race.winner, leader);
    assert.equal(race.runners[leader].distance, TRACK_METERS);
    assert.ok(race.runners[1 - leader].distance > 60 && race.runners[1 - leader].distance < TRACK_METERS);
    assert.ok(race.elapsed > 25 && race.elapsed < 65);
    const result = structuredClone(race);
    stepRace(race, [a, a], dt);
    assert.deepEqual(race, result, 'win freezes both runners and the clock');
  });
}

test('lane input is independent; holding one combo does not auto-run', () => {
  const race = createRace();
  advance(race, 1200, () => [a, idle]);
  assert.equal(race.runners[1].distance, 0);
  assert.equal(race.runners[1].falls, 0);
  assert.ok(race.runners[0].distance < 12);
  assert.ok(race.runners[0].falls > 0);
});

test('an unbalanced runner falls, recovers and can continue; a reset is clean', () => {
  const race = createRace();
  advance(race, 95, () => [[true, false, false, false], idle]);
  assert.equal(race.runners[0].down, true);
  advance(race, 70, () => [idle, idle]);
  const down = race.runners[0];
  assert.ok(down.pose.head.y > -65, 'the head moves visibly toward the ground');
  assert.ok(down.pose.legs.every((leg) => [leg.knee, leg.ankle, leg.toe].every(({x, y}) => Number.isFinite(x) && y <= 0)));
  advance(race, 200, () => [idle, idle]);
  assert.equal(down.down, false);
  const before = down.distance;
  advance(race, 600, (i) => [cadence(i), idle]);
  assert.ok(down.distance > before + 5);
  const reset = createRace();
  assert.deepEqual(reset.runners.map(({distance, falls}) => [distance, falls]), [[0, 0], [0, 0]]);
  assert.equal(reset.elapsed, 0);
  assert.equal(reset.winner, null);
});
