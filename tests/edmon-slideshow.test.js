const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "js/edmon-slideshow.js"), "utf8");
const appTemplate = fs.readFileSync(path.join(root, "js/script.js"), "utf8");
const css = fs.readFileSync(path.join(root, "css/style.css"), "utf8");
const entrypoint = fs.readFileSync(path.join(root, "index.html"), "utf8");

const flush = () => new Promise((resolve) => setImmediate(resolve));

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

function camel(name) {
  return name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function matches(element, selector) {
  if (!element || !element.tagName) return false;
  return selector.split(",").some((part) => {
    const sel = part.trim();
    if (sel.startsWith(".")) return Boolean(element.classList && element.classList.has(sel.slice(1)));
    if (sel.startsWith("[")) return sel.slice(1, -1).split("=")[0] in (element.attributes || {});
    return element.tagName === sel.toUpperCase();
  });
}

class Element {
  constructor(tag, attributes = {}) {
    this.tagName = tag.toUpperCase();
    this.attributes = attributes;
    this.dataset = {};
    this.children = [];
    this.parent = null;
    this.listeners = new Map();
    this.classList = new Set();
    this.style = {};
    this.textContent = "";
    for (const [key, value] of Object.entries(attributes)) {
      if (key === "class") value.split(/\s+/).filter(Boolean).forEach((name) => this.classList.add(name));
      else if (key.startsWith("data-")) this.dataset[camel(key.slice(5))] = value;
    }
  }

  get isConnected() {
    return true;
  }

  append(child) {
    child.parent = this;
    this.children.push(child);
    return child;
  }

  replaceWith(next) {
    const parent = this.parent;
    const at = parent ? parent.children.indexOf(this) : -1;
    if (at === -1) return;
    next.parent = parent;
    parent.children[at] = next;
  }

  addEventListener(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(handler);
  }

  removeEventListener(type, handler) {
    this.listeners.get(type)?.delete(handler);
  }

  dispatch(type) {
    [...(this.listeners.get(type) || [])].forEach((handler) => handler({ type }));
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const found = [];
    const visit = (node) => (node.children || []).forEach((child) => {
      if (matches(child, selector)) found.push(child);
      visit(child);
    });
    visit(this);
    return found;
  }
}

function buildSection() {
  const section = new Element("div", { class: "edmon-patterns" });

  const logoStage = new Element("div", { class: "edmon-logo-stage" });
  const viewer = new Element("model-viewer", { src: "images/edmon/LOGGA.glb" });
  viewer.loaded = false;
  const glbStatus = new Element("span", { class: "edmon-asset-status", "data-edmon-status": "glb" });
  logoStage.append(viewer);
  logoStage.append(glbStatus);
  const logoCard = new Element("figure", { class: "edmon-animation-card edmon-logo-card" });
  logoCard.append(logoStage);
  section.append(logoCard);

  const boxStage = new Element("div", { class: "edmon-logo-stage" });
  const box = new Element("img", { "data-edmon-asset": "", src: "images/edmon/animation-square.svg" });
  box.complete = false;
  box.naturalWidth = 0;
  const boxStatus = new Element("span", { class: "edmon-asset-status", "data-edmon-status": "box" });
  boxStage.append(box);
  boxStage.append(boxStatus);
  const boxCard = new Element("figure", { class: "edmon-animation-card" });
  boxCard.append(boxStage);
  section.append(boxCard);

  const artStage = new Element("div", { class: "edmon-logo-stage" });
  const art = new Element("img", { src: "images/edmon/cooler.jpg" });
  art.src = "images/edmon/cooler.jpg";
  artStage.append(art);
  const artCard = new Element("figure", { class: "edmon-animation-card edmon-illustration-card" });
  artCard.append(artStage);
  section.append(artCard);

  return { section, viewer, glbStatus, box, boxStatus, artStage };
}

function loadFixture({ assetsReady = false, reducedMotion = false } = {}) {
  const loads = [];
  const decodes = [];
  const timers = makeTimers();
  const dom = buildSection();
  const listeners = new Map();
  let observer;
  const document = {
    hidden: false,
    addEventListener(type, handler) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(handler);
    },
    removeEventListener(type, handler) {
      listeners.get(type)?.delete(handler);
    },
    listenerCount(type) {
      return listeners.get(type)?.size || 0;
    },
    querySelector(selector) {
      return selector === ".edmon-patterns" ? dom.section : dom.section.querySelector(selector);
    },
  };
  if (assetsReady) {
    dom.viewer.loaded = true;
    dom.box.complete = true;
    dom.box.naturalWidth = 800;
  }
  const window = {
    matchMedia: () => ({ matches: reducedMotion }),
  };
  const context = vm.createContext({
    window,
    document,
    Image: class {
      constructor() { this.tagName = "IMG"; this.attributes = {}; this.style = {}; }
      set src(value) { this._src = value; loads.push(this); }
      get src() { return this._src; }
      decode() { return { then: (ok, fail) => decodes.push({ ok, fail }) }; }
      replaceWith(next) {
        const parent = this.parent;
        const at = parent ? parent.children.indexOf(this) : -1;
        if (at === -1) return;
        next.parent = parent;
        parent.children[at] = next;
      }
    },
    IntersectionObserver: class {
      constructor(callback) { observer = this; this.callback = callback; }
      observe() {}
      disconnect() { this.disconnected = true; }
    },
    Promise,
    setTimeout: timers.setTimeout, setInterval: timers.setInterval,
    clearTimeout: timers.clearTimeout, clearInterval: timers.clearInterval,
  });
  vm.runInContext(source, context, { filename: "edmon-slideshow.js" });
  return { ...dom, document, timers, window, loads, decodes, get observer() { return observer; } };
}

test("edmon drops the manual controls and rotates on its own every three seconds", () => {
  assert.doesNotMatch(appTemplate, /data-edmon-pause|data-edmon-next|Next image/);
  assert.doesNotMatch(source, /data-edmon-pause|data-edmon-next/);
  assert.match(source, /const ROTATE_MS = 3000;/);
  assert.match(appTemplate, /data-edmon-status="glb"/);
  assert.match(appTemplate, /data-edmon-status="box"/);
  assert.match(appTemplate, /data-edmon-asset/);
  assert.ok(
    appTemplate.indexOf('data-edmon-status="glb"') < appTemplate.indexOf('data-edmon-status="box"'),
    "the GLB note precedes the box note",
  );
  assert.match(css, /#media\.edmon-background \.edmon-asset-status \{/);
  assert.doesNotMatch(css, /\.edmon-slide-controls/);
  assert.doesNotMatch(appTemplate, /data-edmon-count|edmon-slide-controls/);
  assert.doesNotMatch(entrypoint, /data-edmon-count/);
  assert.match(entrypoint, /<span class="year">2026<\/span>\s*<span class="title">Edmon<\/span>/, "Edmon is listed as 2026");
  for (const asset of ["css/style.css", "js/script.js", "js/edmon-slideshow.js"]) {
    assert.ok(entrypoint.includes(`${asset}?v=`), `${asset} cache-busted`);
  }
});

test("the illustration advances by itself every three seconds", async () => {
  const f = loadFixture({ assetsReady: true });
  f.window.initEdmonSlideshow();
  assert.equal(f.timers.pending(), 0, "nothing runs before the card is on screen");
  f.observer.callback([{ isIntersecting: true }]);
  assert.equal(f.timers.pending(), 1, "one rotation timer runs while the card is visible");

  const first = f.artStage.children[0].src;
  f.timers.advance(1);
  assert.equal(f.loads.length, 1, "the next illustration starts loading");
  await flush();
  assert.equal(f.artStage.children[0].src, first, "nothing swaps before the image is decoded");
  assert.equal(f.decodes.length, 1, "the swap waits on decode");
  f.decodes.shift().ok();
  await flush();
  assert.notEqual(f.artStage.children[0].src, first, "the decoded illustration takes over");
  assert.equal(f.timers.pending(), 1, "the timer keeps its beat");

  f.observer.callback([{ isIntersecting: false }]);
  assert.equal(f.timers.pending(), 0, "an off-screen card pauses");
  f.observer.callback([{ isIntersecting: true }]);
  assert.equal(f.timers.pending(), 1, "a returning card resumes");

  f.window.stopEdmonSlideshow();
  assert.equal(f.timers.pending(), 0, "the section is stopped cleanly");
  assert.equal(f.observer.disconnected, true);
  assert.equal(f.document.listenerCount("visibilitychange"), 0, "no visibility listener survives cleanup");

  f.window.initEdmonSlideshow();
  f.observer.callback([{ isIntersecting: true }]);
  f.window.initEdmonSlideshow();
  f.observer.callback([{ isIntersecting: true }]);
  assert.equal(f.timers.pending(), 1, "initializing twice leaves only one timer set");
  f.window.stopEdmonSlideshow();
});

test("a subtle loading note covers the GLB and the box until each asset is ready", () => {
  const f = loadFixture();
  f.window.initEdmonSlideshow();
  assert.equal(f.glbStatus.classList.has("is-loaded"), false, "the GLB note starts visible");
  assert.equal(f.boxStatus.classList.has("is-loaded"), false, "the box note starts visible");

  f.viewer.dispatch("load");
  assert.equal(f.glbStatus.classList.has("is-loaded"), true, "the GLB note leaves once the model is in");
  assert.equal(f.boxStatus.classList.has("is-loaded"), false, "the box note is independent");

  f.box.complete = true;
  f.box.naturalWidth = 800;
  f.box.dispatch("load");
  assert.equal(f.boxStatus.classList.has("is-loaded"), true, "the box note leaves once the image is in");

  const caps = f.timers.scheduled.filter((task) => task.delay === 30000);
  assert.equal(caps.length, 2, "both notes fall back to a timeout so they can never stick forever");

  const failed = loadFixture();
  failed.window.initEdmonSlideshow();
  failed.box.dispatch("error");
  assert.equal(failed.boxStatus.classList.has("is-loaded"), true, "a failed box still clears its note");

  const settled = loadFixture({ assetsReady: true });
  settled.window.initEdmonSlideshow();
  assert.equal(settled.glbStatus.classList.has("is-loaded"), true, "an already-loaded GLB never shows the note");
  assert.equal(settled.boxStatus.classList.has("is-loaded"), true, "an already-loaded box never shows the note");
  assert.equal(settled.timers.scheduled.filter((task) => task.delay === 30000).length, 0, "no timer is armed for ready assets");
});

test("a reduced-motion visitor keeps the first illustration still", () => {
  const f = loadFixture({ assetsReady: true, reducedMotion: true });
  f.window.initEdmonSlideshow();
  f.observer.callback([{ isIntersecting: true }]);
  assert.equal(f.timers.pending(), 0, "no rotation timer is armed");
  f.timers.advance(10);
  assert.equal(f.loads.length, 0, "nothing is fetched for a still illustration");
  assert.equal(f.artStage.children[0].src, "images/edmon/cooler.jpg");
  f.window.stopEdmonSlideshow();
});
