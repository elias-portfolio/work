/**
 * FALSE START — two-lane 100 m articulated duel on real rigid-body physics.
 *
 * The runner is a hinged ragdoll: a torso carrying the head, two thighs and two calves
 * with feet, joined by revolute joints at the hips and knees. The four keys are muscles,
 * not authored animation: a held key drives one joint toward its target angle through a
 * torque-capped velocity servo, a released key lets it fall back to its relaxed angle.
 * Every metre of forward motion comes from joint torque and foot/ground friction —
 * no body is ever translated directly.
 *
 * Keys per lane, index order:
 *   0 first leg thigh · 1 opposite leg thigh · 2 first leg calf · 3 opposite leg calf
 * Holding one fixed combination only settles into a fixed pose (a lean, a slide or a
 * stumble); distance comes from planting a foot and driving the hip against it, so the
 * rhythm matters. Pressing nothing before the first key means the runner never moves.
 *
 * An attempt ends for good when the head or the torso touches the ground or the hurdle.
 * Knees, shins and feet may touch freely — those are stumbles you can survive. There is
 * no automatic recovery: once down or finished, pose and score freeze and input is
 * ignored. Reaching TRACK_METERS ends the attempt as a finish.
 *
 * Dependency: js/vendor/planck.min.js (Planck.js 1.5.1, MIT — see js/vendor/planck-LICENSE.txt).
 * Browser: window.FalseStartPhysics, expects the `planck` global. Node: module.exports.
 */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./vendor/planck.min.js'));
  } else {
    root.FalseStartPhysics = factory(root.planck);
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this, function (planck) {
  'use strict';

  if (!planck || !planck.World) {
    throw new Error('FalseStartPhysics: load js/vendor/planck.min.js before js/false-start-physics.js');
  }

  const World = planck.World;
  const Vec2 = planck.Vec2;
  const Box = planck.Box;
  const Circle = planck.Circle;
  const RevoluteJoint = planck.RevoluteJoint;

  const TRACK_METERS = 100;
  const PIXELS_PER_METER = 48;
  const HURDLE_METERS = 50;
  const HURDLE_HEIGHT_PIXELS = 16;

  const STEP_SECONDS = 1 / 120;
  const MAX_STEPS_PER_CALL = 24;

  // <tuning>
  const TUNING = {
    hipRelaxed: -0.2,
    hipActive: 1.1,
    kneeRelaxed: -0.05,
    kneeActive: -1.6,
    hipStiffness: 12,
    hipMaxSpeed: 10,
    hipTorque: 820,
    kneeStiffness: 9,
    kneeMaxSpeed: 11,
    kneeTorque: 260,
    coreStiffness: 380,
    coreDamping: 53,
    coreTorque: 620,
    density: 120,
    friction: 0.9,
    soleFriction: 1.2,
  };
  // </tuning>

  // The trunk spring above is the one assist in the engine, and it is deliberately capped.
  // It resists pitching over, which a real runner's core does. Two measured facts bound it:
  // with coreTorque set to 0 the articulated runner cannot finish a single cadence (0 of
  // 11), so some trunk stiffness is physically required; and with the values above,
  // unskilled random mashing still puts the runner on the ground in 24 of 25 seeded runs,
  // so it does not rescue a bad rhythm. Everything else is torque, gravity and friction.

  // Body geometry in metres, x forward, y up, ground at y = 0. Sized like a 1.9 m runner
  // standing with a slight knee bend: hip near 1.2 m, head centre near 1.97 m, which lands
  // the head at about -95 px in pose space, matching the renderer's figure.
  const STANCE = { thighAngle: 0, kneeAngle: -0.05 };
  const SEG = { thigh: 0.55, calf: 0.52, ankle: 0.05 };
  const TORSO = { hx: 0.15, half: 0.32 };
  const HEAD = { x: 0.03, dy: 0.53, r: 0.12 };
  const FOOT = { hx: 0.115, hy: 0.05, x: 0.06, toeX: 0.18 };
  // Passive arm pose in metres relative to the shoulder: out to the side, hanging forward.
  const ARM = { side: 0.11, drop: 0.13, reach: 0.09 };
  const HIP_LIMITS = [-0.95, 1.45];
  const KNEE_LIMITS = [-2.35, 0.06];

  const clamp = (value, min, max) => (value < min ? min : value > max ? max : value);
  const round2 = (value) => Math.round(value * 100) / 100;
  const round1 = (value) => Math.round(value * 10) / 10;

  // Hip height that puts the sole exactly on the ground for the stance angles.
  function stanceHipHeight() {
    const a = STANCE.thighAngle;
    const b = a + STANCE.kneeAngle;
    return SEG.ankle + SEG.thigh * Math.cos(a) + SEG.calf * Math.cos(b);
  }

  function buildSim() {
    const world = new World({ gravity: new Vec2(0, -10) });
    world.setAllowSleeping(false);

    const ground = world.createBody({ type: 'static', position: new Vec2(TRACK_METERS / 2, -0.5) });
    ground
      .createFixture(new Box(TRACK_METERS, 0.5), { friction: 0.95, restitution: 0 })
      .setUserData({ part: 'ground' });

    // The hurdle is a light free-standing plank, not a wall: you can knock it flat and
    // step over, but it costs momentum and can trip you if you hit it square.
    const hurdleHalf = HURDLE_HEIGHT_PIXELS / PIXELS_PER_METER / 2;
    const hurdle = world.createBody({
      type: 'dynamic',
      position: new Vec2(HURDLE_METERS, hurdleHalf),
      angularDamping: 2.4,
      linearDamping: 0.6,
    });
    hurdle
      .createFixture(new Box(0.08, hurdleHalf), {
        density: 8,
        friction: 0.4,
        restitution: 0,
      })
      .setUserData({ part: 'hurdle' });

    // Negative group index: a runner's own limbs never collide with each other. Two 2D
    // legs share one plane, and self-collision only adds jitter and kills the rhythm.
    const limb = {
      density: TUNING.density,
      friction: TUNING.friction,
      restitution: 0,
      filterGroupIndex: -2,
    };

    const hipY = stanceHipHeight();
    const torso = world.createBody({ type: 'dynamic', position: new Vec2(0, hipY + TORSO.half) });
    torso.createFixture(new Box(TORSO.hx, TORSO.half), limb).setUserData({ part: 'torso' });
    torso
      .createFixture(new Circle(new Vec2(HEAD.x, HEAD.dy), HEAD.r), limb)
      .setUserData({ part: 'head' });

    const legs = [];
    for (let i = 0; i < 2; i++) {
      const hipAngle = STANCE.thighAngle;
      const kneeAngle = STANCE.kneeAngle;
      const thighCenter = {
        x: Math.sin(hipAngle) * (SEG.thigh / 2),
        y: hipY - Math.cos(hipAngle) * (SEG.thigh / 2),
      };
      const kneePoint = { x: Math.sin(hipAngle) * SEG.thigh, y: hipY - Math.cos(hipAngle) * SEG.thigh };
      const calfAngle = hipAngle + kneeAngle;
      const calfCenter = {
        x: kneePoint.x + Math.sin(calfAngle) * (SEG.calf / 2),
        y: kneePoint.y - Math.cos(calfAngle) * (SEG.calf / 2),
      };

      const thigh = world.createBody({
        type: 'dynamic',
        position: new Vec2(thighCenter.x, thighCenter.y),
        angle: hipAngle,
      });
      thigh.createFixture(new Box(0.072, SEG.thigh / 2), limb).setUserData({ part: 'thigh' });

      const calf = world.createBody({
        type: 'dynamic',
        position: new Vec2(calfCenter.x, calfCenter.y),
        angle: calfAngle,
      });
      calf.createFixture(new Box(0.058, SEG.calf / 2), limb).setUserData({ part: 'calf' });
      calf
        .createFixture(
          new Box(FOOT.hx, FOOT.hy, new Vec2(FOOT.x, -SEG.calf / 2), 0),
          Object.assign({}, limb, { friction: TUNING.soleFriction, density: TUNING.density * 1.5 })
        )
        .setUserData({ part: 'foot' });

      const hip = world.createJoint(
        new RevoluteJoint(
          {
            enableLimit: true,
            lowerAngle: HIP_LIMITS[0],
            upperAngle: HIP_LIMITS[1],
            enableMotor: true,
            maxMotorTorque: TUNING.hipTorque,
            motorSpeed: 0,
            collideConnected: false,
          },
          torso,
          thigh,
          new Vec2(0, hipY)
        )
      );
      const knee = world.createJoint(
        new RevoluteJoint(
          {
            enableLimit: true,
            lowerAngle: KNEE_LIMITS[0],
            upperAngle: KNEE_LIMITS[1],
            enableMotor: true,
            maxMotorTorque: TUNING.kneeTorque,
            motorSpeed: 0,
            collideConnected: false,
          },
          thigh,
          calf,
          new Vec2(kneePoint.x, kneePoint.y)
        )
      );

      legs.push({ thigh, calf, hip, knee });
    }

    const sim = { world, torso, legs, hurdle, fallen: false, frozen: false, hipY };
    world.on('begin-contact', (contact) => {
      if (sim.fallen) return;
      const a = contact.getFixtureA().getUserData() || {};
      const b = contact.getFixtureB().getUserData() || {};
      const solid = a.part === 'ground' || a.part === 'hurdle' || b.part === 'ground' || b.part === 'hurdle';
      const vital = a.part === 'torso' || a.part === 'head' || b.part === 'torso' || b.part === 'head';
      if (solid && vital) sim.fallen = true;
    });
    return sim;
  }

  function hipPoint(sim) {
    return sim.torso.getWorldPoint(new Vec2(0, -TORSO.half));
  }

  // Pose space: x = 0 at the hip, y = 0 at the ground, up negative. A standing runner
  // therefore reports head.y near -95 and hip.y near -54 for PIXELS_PER_METER = 48.
  function samplePose(sim) {
    const pivot = hipPoint(sim);
    const project = (point) => ({
      x: round2((point.x - pivot.x) * PIXELS_PER_METER),
      y: round2(-point.y * PIXELS_PER_METER),
    });
    const legs = sim.legs.map((leg) => ({
      knee: project(leg.thigh.getWorldPoint(new Vec2(0, -SEG.thigh / 2))),
      ankle: project(leg.calf.getWorldPoint(new Vec2(0, -SEG.calf / 2))),
      toe: project(leg.calf.getWorldPoint(new Vec2(FOOT.toeX, -SEG.calf / 2))),
    }));
    const shoulder = sim.torso.getWorldPoint(new Vec2(0, TORSO.half * 0.82));
    // Arms are not simulated bodies: they are a passive pose hung off the shoulder, so the
    // renderer can draw them without extra joints. They swing with the trunk only.
    const arms = [1, -1].map((side) => {
      const elbow = sim.torso.getWorldPoint(new Vec2(side * ARM.side, TORSO.half * 0.82 - ARM.drop));
      const hand = sim.torso.getWorldPoint(new Vec2(side * (ARM.side + ARM.reach), TORSO.half * 0.82 - ARM.drop * 2));
      return { elbow: project(elbow), hand: project(hand) };
    });
    return {
      head: project(sim.torso.getWorldPoint(new Vec2(HEAD.x, HEAD.dy))),
      shoulder: project(shoulder),
      hip: project(pivot),
      legs,
      arms,
    };
  }

  // Read-only mirror of the hurdle body so the renderer's plank follows real collisions.
  // World metres: x forward from the start line, y up from the ground, angle in radians
  // (counter-clockwise positive, 0 = upright). A knocked-over plank reports a large
  // |angle| and a low y. The runner never writes this: it is sampled from the body.
  function hurdleState(sim) {
    const body = sim.hurdle;
    const position = body.getPosition();
    return {
      x: round2(position.x),
      y: round2(position.y),
      angle: round2(body.getAngle()),
    };
  }

  function createRunner() {
    const sim = buildSim();
    const runner = {
      distance: 0,
      best: 0,
      down: false,
      finished: false,
      started: false,
      pose: null,
      hurdle: hurdleState(sim),
    };
    Object.defineProperty(runner, '_sim', { value: sim, enumerable: false, writable: true });
    runner.pose = samplePose(sim);
    return runner;
  }

  function driveJoint(joint, target, stiffness, maxSpeed, torque) {
    const speed = clamp((target - joint.getJointAngle()) * stiffness, -maxSpeed, maxSpeed);
    joint.setMotorSpeed(speed);
    joint.setMaxMotorTorque(torque);
  }

  function applyKeys(sim, keys) {
    for (let i = 0; i < 2; i++) {
      const leg = sim.legs[i];
      driveJoint(
        leg.hip,
        keys[i] ? TUNING.hipActive : TUNING.hipRelaxed,
        TUNING.hipStiffness,
        TUNING.hipMaxSpeed,
        TUNING.hipTorque
      );
      driveJoint(
        leg.knee,
        keys[i + 2] ? TUNING.kneeActive : TUNING.kneeRelaxed,
        TUNING.kneeStiffness,
        TUNING.kneeMaxSpeed,
        TUNING.kneeTorque
      );
    }
    const torso = sim.torso;
    const torque = clamp(
      -TUNING.coreStiffness * torso.getAngle() - TUNING.coreDamping * torso.getAngularVelocity(),
      -TUNING.coreTorque,
      TUNING.coreTorque
    );
    torso.applyTorque(torque, true);
  }

  // The score is the farthest forward point ever reached, capped at the finish line so a
  // finish always scores exactly TRACK_METERS. Only live play may raise it: endAttempt()
  // never scores again after the attempt has ended.
  function record(runner) {
    const x = hipPoint(runner._sim).x;
    runner.distance = x;
    if (x > runner.best) runner.best = Math.min(x, TRACK_METERS);
  }

  // A falling runner keeps tumbling for a moment so the final pose reads as a body on
  // the ground instead of a freeze-frame in mid-air. Inputs are already locked, the
  // motors go slack, and the attempt never restarts.
  const SETTLE_STEPS = 96;

  function relax(sim) {
    for (const leg of sim.legs) {
      leg.hip.setMaxMotorTorque(0);
      leg.knee.setMaxMotorTorque(0);
    }
  }

  function endAttempt(runner, reason) {
    const sim = runner._sim;
    sim.world.off('begin-contact');
    runner.finished = true;
    if (reason === 'fall') {
      runner.down = true;
      relax(sim);
      // advance() locked distance and best on the frame of first contact. This settle
      // pass only moves the body so the pose reads as fallen; it must never add metres,
      // so nothing here calls record().
      for (let i = 0; i < SETTLE_STEPS; i++) sim.world.step(STEP_SECONDS, 6, 3);
    }
    runner.pose = samplePose(sim);
    runner.hurdle = hurdleState(sim);
  }

  function advance(runner, keys) {
    if (runner.finished) return;
    const sim = runner._sim;
    if (!runner.started) {
      if (!(keys[0] || keys[1] || keys[2] || keys[3])) return;
      runner.started = true;
    }
    applyKeys(sim, keys);
    sim.world.step(STEP_SECONDS, 6, 3);
    record(runner);
    if (sim.fallen) {
      endAttempt(runner, 'fall');
      return;
    }
    if (runner.distance >= TRACK_METERS) {
      endAttempt(runner, 'finish');
      return;
    }
    runner.pose = samplePose(sim);
    runner.hurdle = hurdleState(sim);
  }

  function compare(race) {
    const a = round1(Math.max(0, race.runners[0].best));
    const b = round1(Math.max(0, race.runners[1].best));
    if (a === b) return null;
    return a > b ? 0 : 1;
  }

  function createRace() {
    const race = {
      runners: [createRunner(), createRunner()],
      elapsed: 0,
      winner: null,
      complete: false,
    };
    Object.defineProperty(race, '_clock', { value: { seconds: 0 }, enumerable: false, writable: true });
    return race;
  }

  function readKeys(controls, index) {
    const lane = controls && controls[index];
    const keys = [false, false, false, false];
    if (!lane || typeof lane.length !== 'number') return keys;
    for (let i = 0; i < 4; i++) keys[i] = Boolean(lane[i]);
    return keys;
  }

  function stepRace(race, controls, dt) {
    if (!race || !race.runners || race.runners.length !== 2) {
      throw new TypeError('stepRace: a race from createRace() is required');
    }
    const seconds = Number(dt);
    if (!Number.isFinite(seconds) || seconds <= 0) return race;
    if (race.complete) return race;

    const keys = [readKeys(controls, 0), readKeys(controls, 1)];
    const clock = race._clock;
    clock.seconds += Math.min(seconds, 0.25);
    let steps = 0;
    while (clock.seconds + 1e-9 >= STEP_SECONDS && steps < MAX_STEPS_PER_CALL) {
      advance(race.runners[0], keys[0]);
      advance(race.runners[1], keys[1]);
      clock.seconds -= STEP_SECONDS;
      steps += 1;
    }
    if (steps >= MAX_STEPS_PER_CALL || clock.seconds >= STEP_SECONDS) clock.seconds = 0;

    if (race.runners[0].started || race.runners[1].started) {
      race.elapsed = round2(race.elapsed + seconds);
    }
    if (race.runners[0].finished && race.runners[1].finished) {
      race.complete = true;
      race.winner = compare(race);
    }
    return race;
  }

  return {
    createRace,
    stepRace,
    TRACK_METERS,
    PIXELS_PER_METER,
    HURDLE_METERS,
    HURDLE_HEIGHT_PIXELS,
  };
});
