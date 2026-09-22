const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const slideshowSource = fs.readFileSync(path.join(root, "js/maya-slideshow.js"), "utf8");
const appTemplate = fs.readFileSync(path.join(root, "js/script.js"), "utf8");

const generatedIds = ["t2", "t28", "t29", "t30", "t31", "t32", "t33", "t34", "t45", "t46", "t47", "t49", "t51", "t53", "t55", "t56"];
const jpgs = [
  "maya/references/dresden-codex-glyph-03-source.jpg",
  "maya/references/dresden-codex-glyph-03-vectorized.jpg",
];

function glyphs() {
  const match = slideshowSource.match(/const GLYPHS = (\[[\s\S]*?\]);/);
  assert.ok(match, "slideshow must declare GLYPHS");
  return vm.runInNewContext(match[1]);
}

function glyphFiles() {
  return glyphs().map((glyph) => glyph.file);
}

function makeTimers() {
  let now = 0;
  let nextId = 1;
  const tasks = new Map();
  const scheduled = [];
  const schedule = (callback, delay, interval) => {
    const task = { id: nextId++, callback, delay, interval, due: now + delay };
    tasks.set(task.id, task);
    scheduled.push(task);
    return task.id;
  };
  const clear = (id) => tasks.delete(id);
  return {
    setTimeout: (callback, delay) => schedule(callback, delay, 0),
    setInterval: (callback, delay) => schedule(callback, delay, delay),
    clearTimeout: clear,
    clearInterval: clear,
    pending: () => tasks.size,
    scheduled,
    advance(count) {
      for (let tick = 0; tick < count; tick++) {
        let next;
        for (const task of tasks.values()) {
          if (!next || task.due < next.due || (task.due === next.due && task.id < next.id)) next = task;
        }
        if (!next) return;
        now = next.due;
        if (next.interval) next.due += next.interval;
        else tasks.delete(next.id);
        next.callback();
      }
    },
  };
}

function makeDom() {
  const nodes = new Map();
  const bodyChildren = new Set();
  const body = {
    contains(node) { return bodyChildren.has(node); },
    append(node) { bodyChildren.add(node); },
    remove(node) { bodyChildren.delete(node); },
  };
  const document = {
    body,
    hidden: false,
    listeners: new Map(),
    addEventListener(type, callback) { this.listeners.set(type, callback); },
    removeEventListener(type, callback) {
      if (this.listeners.get(type) === callback) this.listeners.delete(type);
    },
    dispatchVisibility() { this.listeners.get("visibilitychange")?.(); },
    getElementById(id) { return nodes.get(id) || null; },
  };
  for (let i = 1; i <= 16; i++) {
    const classes = new Set();
    const card = {
      id: `maya-card-${i}`,
      style: {},
      offsetWidth: 300,
      classList: {
        add(name) { classes.add(name); },
        remove(name) { classes.delete(name); },
        contains(name) { return classes.has(name); },
      },
    };
    const img = { id: `maya-img-${i}`, src: "", alt: "", style: {} };
    const caption = { id: `maya-caption-${i}`, textContent: "" };
    nodes.set(card.id, card); nodes.set(img.id, img); nodes.set(caption.id, caption);
    body.append(card); body.append(img); body.append(caption);
  }
  return { document, nodes, body };
}

function loadFixture() {
  const timers = makeTimers();
  const dom = makeDom();
  const window = {};
  const context = vm.createContext({
    window, document: dom.document,
    setTimeout: timers.setTimeout, setInterval: timers.setInterval,
    clearTimeout: timers.clearTimeout, clearInterval: timers.clearInterval,
  });
  vm.runInContext(slideshowSource, context, { filename: "maya-slideshow.js" });
  return { ...dom, timers, window };
}

function cards(fixture) {
  return Array.from({ length: 16 }, (_, n) => ({
    card: fixture.nodes.get(`maya-card-${n + 1}`),
    img: fixture.nodes.get(`maya-img-${n + 1}`),
    caption: fixture.nodes.get(`maya-caption-${n + 1}`),
  }));
}

function assetPath(src) {
  return src.split("?", 1)[0];
}

function assertAssetPathsExist(paths) {
  for (const asset of paths) assert.ok(fs.existsSync(path.join(root, asset)), asset);
}

test("Maya slideshow assets, sixteen-card rendering, and template invariants", () => {
  const glyphs = glyphFiles();
  const generated = generatedIds.map((id) => `images/maya/generated/${id}.webp`);
  assertAssetPathsExist([...glyphs.map((file) => `maya/references/svg/${file}`), ...generated, ...jpgs]);

  assert.match(appTemplate, /id="maya-card-1"/);
  assert.equal((appTemplate.match(/id="maya-card-(?:[1-9]|1[0-6])"/g) || []).length, 16);
  assert.doesNotMatch(slideshowSource, /Image|preload|transition|animation/);
  for (let i = 1; i <= 16; i++) {
    const figure = appTemplate.match(new RegExp(`<figure>[\\s\\S]*?id="maya-card-${i}"[\\s\\S]*?</figure>`));
    assert.ok(figure, `card ${i} has figure wrapper`);
    assert.match(figure[0], new RegExp(`<div id="maya-card-${i}">[\\s\\S]*</div>\\s*<figcaption[^>]*id="maya-caption-${i}"`), `caption ${i} is sibling of card div`);
  }
  assert.doesNotMatch(appTemplate, /maya-generated-gallery/);
  assert.match(appTemplate, /maya-generated-disclaimer/);
  assert.match(appTemplate, /maya-reference-grid/);
  assert.match(appTemplate, /maya-reference-frame-source/);
  assert.match(appTemplate, /maya-reference-frame-result/);
  assert.match(appTemplate, /Dresden Codex source scan/);
  assert.match(appTemplate, /Vectorized font drawing/);

  const scriptsTemplate = appTemplate.match(/scripts:\s*`([\s\S]*?)`/);
  assert.ok(scriptsTemplate, "Scripts project stays registered in the portfolio");
  assert.match(scriptsTemplate[1], /<iframe[^>]*src="scripts nuptse\.html"/);
  assert.match(scriptsTemplate[1], /<iframe[^>]*src="scripts\.html"/);
  const entrypoint = fs.readFileSync(path.join(root, "index.html"), "utf8");
  for (const asset of ["css/style.css", "js/script.js", "js/maya-slideshow.js"]) {
    assert.ok(entrypoint.includes(`${asset}?v=20260922-maya-sixteen-controlled-v5`), `${asset} cache-busted`);
  }
  const css = fs.readFileSync(path.join(root, "css/style.css"), "utf8");
  assert.match(css, /object-fit:\s*contain/);
  assert.match(css, /\.maya-card-grid\s*\{[^}]*grid-template-columns:\s*repeat\(4,/);
  assert.doesNotMatch(css, /maya-card-flip|transition:\s*opacity/);
  assert.match(css, /\.maya-reference-frame\s*\{[^}]*display:\s*grid[^}]*place-items:\s*center/);
  assert.match(css, /\.maya-reference-frame img\s*\{[^}]*max-width:\s*86%[^}]*max-height:\s*86%[^}]*object-fit:\s*contain/);
  assert.doesNotMatch(css, /@keyframes\s+maya-card-flip/);
  assert.doesNotMatch(css, /animation:\s*maya-card-flip/);
});

test("each card cycles both glyph and generated study assets", () => {
  const fixture = loadFixture();
  fixture.window.initMayaSlideshow();
  const seen = cards(fixture).map(() => new Set());
  for (let tick = 0; tick < 240; tick++) {
    fixture.timers.advance(3);
    cards(fixture).forEach(({ img }, index) => seen[index].add(assetPath(img.src)));
  }

  for (const [index, paths] of seen.entries()) {
    assert.ok([...paths].some((src) => src.includes("/references/svg/")), `card ${index + 1} shows glyphs`);
    assert.ok([...paths].some((src) => src.includes("images/maya/generated/")), `card ${index + 1} shows generated studies`);
  }
});

test("sixteen cards visit the expanded glyph and generated asset stream", () => {
  const fixture = loadFixture();
  const expected = new Set([
    ...glyphFiles().map((file) => `maya/references/svg/${file}`),
    ...generatedIds.map((id) => `images/maya/generated/${id}.webp`),
  ]);
  assert.equal(glyphs().length, 44, "test expects the current 44 glyph studies");
  fixture.window.initMayaSlideshow();

  let previous = cards(fixture).map(({ img }) => assetPath(img.src));
  const chronological = [...previous];
  const visited = new Set(previous.filter(Boolean));
  assert.equal(new Set(previous).size, 16, "sixteen cards start with different paths");
  for (let tick = 0; tick < 1200 && visited.size < expected.size; tick++) {
    fixture.timers.advance(3);
    const live = cards(fixture).map(({ img }) => assetPath(img.src));
    assert.ok(new Set(live).size >= 1, "the expanded stream remains active");
    const changed = live.filter((src, i) => src !== previous[i]);
    assert.ok(changed.length <= 6, "card changes remain bounded between timer observations");
    if (changed[0]) {
      chronological.push(changed[0]);
      visited.add(changed[0]);
    }
    for (const path of live) {
      if (path) visited.add(path);
    }
    previous = live;
  }
  assert.ok(visited.size >= 30, "the expanded stream visits at least half of the declared assets");
});

test("alt text, captions, photo polarity, lifecycle cleanup, and detached cards", () => {
  const fixture = loadFixture();
  fixture.window.initMayaSlideshow();
  const initial = cards(fixture);
  for (const { img, caption } of initial) {
    assert.ok(img.alt, "rendered image has alt text");
    assert.ok(caption.textContent, "rendered card has caption");
  }
  const jpgsSeen = new Set();
  for (let tick = 0; tick < 300; tick++) {
    fixture.timers.advance(1);
    for (const { img, caption } of cards(fixture)) {
      assert.ok(img.alt.includes(caption.textContent), "alt text follows the current caption");
      if (jpgs.includes(assetPath(img.src))) {
        jpgsSeen.add(assetPath(img.src));
      }
    }
  }
  assert.equal(jpgsSeen.size, 0, "beige source and vector images stay out of the cycling cards");

  const lifecycle = loadFixture();
  lifecycle.window.initMayaSlideshow();
  const firstPending = lifecycle.timers.pending();
  assert.ok(firstPending > 0, "init schedules timers");
  lifecycle.window.initMayaSlideshow();
  assert.equal(lifecycle.timers.pending(), firstPending, "init twice leaves only one timer set");
  lifecycle.document.hidden = true;
  lifecycle.document.dispatchVisibility();
  assert.equal(lifecycle.timers.pending(), 0, "hidden tab pauses the beat");
  lifecycle.document.hidden = false;
  lifecycle.document.dispatchVisibility();
  assert.equal(lifecycle.timers.pending(), firstPending, "visible tab resumes the beat");
  const stoppedSrc = cards(lifecycle)[0].img.src;
  lifecycle.window.stopMayaSlideshow();
  assert.equal(lifecycle.timers.pending(), 0, "stop clears every timer");
  lifecycle.timers.advance(2);
  assert.equal(cards(lifecycle)[0].img.src, stoppedSrc, "stopped slideshow does not commit a delayed swap");
  lifecycle.document.hidden = true;
  lifecycle.document.dispatchVisibility();
  assert.equal(lifecycle.timers.pending(), 0, "removed visibility listener cannot restart the beat");
  lifecycle.timers.advance(20);
  assert.equal(lifecycle.timers.pending(), 0, "stopped slideshow does not resurrect timers");

  lifecycle.window.initMayaSlideshow();
  const detached = lifecycle.nodes.get("maya-card-3");
  lifecycle.body.remove(detached);
  lifecycle.timers.advance(10);
  assert.equal(lifecycle.timers.pending(), 0, "detached card stops slideshow cleanly");
  lifecycle.timers.advance(20);
  assert.equal(lifecycle.timers.pending(), 0, "detached-card stop cannot resurrect timers");
});
