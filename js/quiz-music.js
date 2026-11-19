// Quiz background music — lokal MIDI-motor på Web Audio.
// Inga externa tjänster, inga soundfons och inget nätverk utöver de egna
// .mid-filerna under images/quiz/music/midi/ (137 filer).
//
// Publikt API:
//   window.createQuizMusic({ root, controls }) -> { handleKey(event), dispose(), ... }
//
// Tangenterna läses ENDAST via handleKey (modulen binder aldrig egen keydown):
//   N   nästa slumpade låt (aldrig samma låt två gånger i rad)
//   M   cykla instrument/klang på samma låt; låt och transportposition består
window.createQuizMusic = function ({ root, controls } = {}) {
    if (window.__quizMusicStyle !== 1) {
        window.__quizMusicStyle = 1;
        const style = document.createElement('style');
        style.id = 'qm-style';
        style.textContent = [
            '.qm-controls{display:inline-flex;align-items:center;gap:.35rem;font:12px/1.2 system-ui,sans-serif;color:#dfe4ff;white-space:nowrap}',
            '.qm-controls .qm-btn{cursor:pointer;border:1px solid #a5b0de;background:#17214b;color:#fff;padding:.2rem .45rem;border-radius:4px;font:inherit}',
            '.qm-controls .qm-btn:hover{background:#22306b}',
            '.qm-controls .qm-btn[aria-pressed="true"]{background:#2b3a7d;border-color:#cfd6f7}',
            '.qm-controls .qm-btn:disabled{opacity:.5;cursor:default}',
            '.qm-controls .qm-label{opacity:.85;font-variant-numeric:tabular-nums}',
            '@media (max-width:640px){.qm-controls .qm-label{display:none}}'
        ].join('');
        document.head.append(style);
    }

    const MIDI_BASE = 'images/quiz/music/midi/';

    // 34 filer är en-nots-platshållare utan melodi: de går utanför rotationen.
    const ROTATION = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 38, 39,
        40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 55, 56, 57, 58,
        59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 107,
        108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 121, 122, 123,
        124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137
    ];

    const PATCHES = [
        { id: 'piano', name: 'piano', wave: 'triangle', detune: 0, attack: 0.004, release: 0.22, gain: 0.52, cutoff: 5200, q: 0.9, octave: 0 },
        { id: 'elpiano', name: 'el-piano', wave: 'sine', detune: 4, attack: 0.006, release: 0.42, gain: 0.58, cutoff: 3600, q: 0.7, octave: 0 },
        { id: 'musicbox', name: 'speldosa', wave: 'triangle', detune: 9, attack: 0.002, release: 0.72, gain: 0.34, cutoff: 7600, q: 1.1, octave: 12 },
        { id: 'strings', name: 'stråkar', wave: 'sawtooth', detune: 7, attack: 0.16, release: 0.5, gain: 0.21, cutoff: 2200, q: 1.6, octave: 0 },
        { id: 'brass', name: 'mässing', wave: 'sawtooth', detune: 5, attack: 0.03, release: 0.28, gain: 0.23, cutoff: 3200, q: 1.2, octave: 0 },
        { id: 'chip', name: 'chip', wave: 'square', detune: 0, attack: 0.003, release: 0.14, gain: 0.21, cutoff: 4200, q: 0.8, octave: 0 },
        { id: 'organ', name: 'orgel', wave: 'sawtooth', detune: 12, attack: 0.02, release: 0.2, gain: 0.21, cutoff: 2800, q: 2.2, octave: 0 },
        { id: 'bass', name: 'bas', wave: 'square', detune: 0, attack: 0.008, release: 0.3, gain: 0.3, cutoff: 1400, q: 1.0, octave: -12 }
    ];

    const OUT_LEVEL = 0.26;   // musikbussens normalnivå: låg, under rösterna
    const DUCK_LEVEL = 0.15;  // hörbar bakgrund även under uppläsning och medley
    const DUCK_TAU = 0.09;
    const LOOKAHEAD = 0.6;    // sekunder MIDI som schemaläggs i förväg
    const TICK_MS = 60;
    const MAX_VOICES = 44;
    const VOICE_GAIN = 0.34;
    const CACHE_MAX = 24;

    const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

    // ------------------------------------------------------------------ parser

    function parseMidi(buffer) {
        const view = new Uint8Array(buffer);
        if (view.length < 14) return null;
        if (String.fromCharCode(view[0], view[1], view[2], view[3]) !== 'MThd') return null;
        const headLen = (view[4] << 24) | (view[5] << 16) | (view[6] << 8) | view[7];
        const trackCount = (view[10] << 8) | view[11];
        const division = ((view[12] << 8) | view[13]) || 480;
        if (division & 0x8000) return null; // SMPTE-tid: används inte i det här paketet

        const notes = [];
        const tempos = [];
        const held = new Map();
        let pos = 8 + headLen;

        function readVar(state) {
            let value = 0, byte, guard = 0;
            do {
                if (state.pos >= state.end || guard++ > 4) return -1;
                byte = view[state.pos++];
                value = (value << 7) | (byte & 0x7f);
            } while (byte & 0x80);
            return value;
        }

        for (let t = 0; t < trackCount && pos + 8 <= view.length; t++) {
            const id = String.fromCharCode(view[pos], view[pos + 1], view[pos + 2], view[pos + 3]);
            const len = (view[pos + 4] << 24) | (view[pos + 5] << 16) | (view[pos + 6] << 8) | view[pos + 7];
            const trackEnd = Math.min(view.length, pos + 8 + Math.max(0, len));
            if (id !== 'MTrk') { pos = trackEnd; continue; }

            const state = { pos: pos + 8, end: trackEnd };
            let ticks = 0;
            let running = 0;

            while (state.pos < state.end) {
                const delta = readVar(state);
                if (delta < 0) break;
                ticks += delta;

                let status = view[state.pos];
                if (status === undefined) break;
                if (status & 0x80) state.pos++;
                else { status = running; if (!status) break; }
                if (!(status & 0x80)) break; // fortsättningsbyte utan running status

                if (status === 0xff) {
                    const type = view[state.pos++];
                    if (type === undefined) break;
                    const size = readVar(state);
                    if (size < 0) break;
                    if (type === 0x51 && size === 3) {
                        tempos.push({
                            tick: ticks,
                            us: (view[state.pos] << 16) | (view[state.pos + 1] << 8) | view[state.pos + 2]
                        });
                    }
                    state.pos += size;
                    continue;
                }
                if (status === 0xf0 || status === 0xf7) {
                    const size = readVar(state);
                    if (size < 0) break;
                    state.pos += size;
                    continue;
                }

                running = status;
                const hi = status & 0xf0;
                const ch = status & 0x0f;

                if (hi === 0xc0) { state.pos += 1; continue; } // program change: klangen styrs av M
                if (hi === 0xd0) { state.pos += 1; continue; }

                const d1 = view[state.pos];
                const d2 = view[state.pos + 1];
                if (d1 === undefined || d2 === undefined) break;
                state.pos += 2;

                if (hi === 0x90 && d2 > 0) {
                    const key = (ch << 8) | d1;
                    let list = held.get(key);
                    if (!list) { list = []; held.set(key, list); }
                    list.push({ tick: ticks, ch, note: d1, vel: d2 });
                } else if (hi === 0x80 || (hi === 0x90 && d2 === 0)) {
                    const list = held.get((ch << 8) | d1);
                    if (list && list.length) {
                        const note = list.shift();
                        note.dur = Math.max(1, ticks - note.tick);
                        notes.push(note);
                    }
                }
            }
            pos = trackEnd;
        }

        held.forEach(list => list.forEach(note => { note.dur = 60; notes.push(note); }));
        if (!notes.length) return null;
        notes.sort((a, b) => a.tick - b.tick);
        tempos.sort((a, b) => a.tick - b.tick);

        // Tempokarta: varje mark bär den takt som gäller från och med dess tick.
        const marks = [{ tick: 0, sec: 0, us: 500000 }];
        for (let i = 0; i < tempos.length; i++) {
            const point = tempos[i];
            const us = point.us || 500000;
            const last = marks[marks.length - 1];
            if (point.tick > last.tick) {
                marks.push({
                    tick: point.tick,
                    sec: last.sec + ((point.tick - last.tick) / division) * (last.us / 1e6),
                    us
                });
            } else {
                last.us = us;
            }
        }

        const track = { notes, marks, division, duration: 0 };
        const endTick = notes.reduce((m, n) => Math.max(m, n.tick + n.dur), 0);
        track.duration = Math.max(0.25, tickToSec(track, endTick));
        track.notes = notes;
        return track;
    }

    function tickToSec(track, tick) {
        const marks = track.marks;
        let lo = 0, hi = marks.length - 1, idx = 0;
        while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            if (marks[mid].tick <= tick) { idx = mid; lo = mid + 1; }
            else hi = mid - 1;
        }
        const base = marks[idx];
        return base.sec + ((tick - base.tick) / track.division) * (base.us / 1e6);
    }

    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;

    // ------------------------------------------------------------------- audio

    let ctx = null, master = null, limiter = null;
    let disposed = false, paused = false, muted = false;
    let patchIndex = 0;
    let currentId = null;
    let current = null;          // { id, track, startedAt, cursor }
    let schedulerTimer = null, pollTimer = null;
    let ducks = 0;
    let liveVoices = 0;
    const voices = new Set();
    let token = 0;
    let unlocked = false;
    let pausedAtSec = 0;
    let recovering = false;
    let recoveryTimer = null;
    const cache = new Map();

    const patch = () => PATCHES[patchIndex];
    const toHz = note => 440 * Math.pow(2, (note - 69) / 12);

    function audio() {
        if (ctx) return ctx;
        ctx = new Ctor({ latencyHint: 'playback' });
        limiter = ctx.createDynamicsCompressor();
        limiter.threshold.value = -16;
        limiter.knee.value = 10;
        limiter.ratio.value = 3;
        limiter.attack.value = 0.005;
        limiter.release.value = 0.25;
        master = ctx.createGain();
        master.gain.value = 0.0001;
        limiter.connect(master);
        master.connect(ctx.destination);
        return ctx;
    }

    function setLevel(immediate) {
        if (!ctx || !master) return;
        const target = (muted || paused) ? 0.0001
            : ducks === 2 ? 0
            : ducks ? DUCK_LEVEL
            : OUT_LEVEL;
        const t = ctx.currentTime;
        const g = master.gain;
        try {
            g.cancelScheduledValues(t);
            if (immediate) g.setValueAtTime(target, t);
            else g.setTargetAtTime(target, t, DUCK_TAU);
        } catch (_) { g.value = target; }
    }

    function envelope(param, t0, dur, peak) {
        const p = patch();
        const attack = Math.min(p.attack, dur * 0.4) || 0.004;
        const release = Math.max(0.05, Math.min(p.release, 0.7));
        const stop = t0 + dur + release;
        param.setValueAtTime(0.0001, t0);
        param.linearRampToValueAtTime(peak, t0 + attack);
        param.setValueAtTime(peak * 0.7, t0 + Math.max(attack, dur * 0.65));
        param.exponentialRampToValueAtTime(0.0001, stop);
        return stop;
    }

    // Alla klingande röster hålls i en mängd så att låtbyte, paus och M kan
    // klippa dem snabbt. Annars ligger föregående ackord kvar och läcker mellan
    // två låtar, och ett instrumentbyte hörs inte förrän nästa ton.
    function track(voice) {
        voices.add(voice);
        if (liveVoices >= MAX_VOICES) cutVoice(voices.values().next().value, 0.02);
    }

    function releaseVoice(voice) {
        voices.delete(voice);
    }

    function cutVoice(voice, fade) {
        if (!voice || voice.dead) return;
        voice.dead = true;
        voices.delete(voice);
        const t = ctx.currentTime;
        try {
            voice.gain.gain.cancelScheduledValues(t);
            voice.gain.gain.setValueAtTime(Math.max(0.0002, voice.gain.gain.value), t);
            voice.gain.gain.exponentialRampToValueAtTime(0.0002, t + Math.max(0.008, fade));
        } catch (_) {}
        voice.oscs.forEach(osc => {
            try { osc.stop(t + Math.max(0.02, fade) + 0.02); } catch (_) {}
        });
    }

    // Klipper alla klingande röster, t.ex. vid låtbyte eller paus.
    function cutAll(fade) {
        const list = [...voices];
        list.forEach(voice => cutVoice(voice, fade));
    }

    // Klangen läses vid schemaläggningen. M påverkar därför nya toner direkt;
    // klingande toner fasas ut i cutAll så bytet hörs på en gång.
    // Percussion (kanal 10) har egen röst och programmeras aldrig om.
    function scheduleNote(note, when, dur) {
        if (!ctx || liveVoices >= MAX_VOICES) return;
        if (when < ctx.currentTime - 0.06) return;
        const p = patch();

        if (note.ch === 9) {
            const band = ctx.createBiquadFilter();
            band.type = 'bandpass';
            band.frequency.value = clamp(toHz(note.note) * 1.4, 90, 9000);
            band.Q.value = 0.9;
            const gain = ctx.createGain();
            const stop = envelope(gain.gain, when, Math.min(0.12, dur), 0.4 * VOICE_GAIN * (note.vel / 127));
            const osc = ctx.createOscillator();
            osc.type = 'square';
            osc.frequency.value = clamp(toHz(note.note), 60, 420);
            osc.connect(band); band.connect(gain); gain.connect(limiter);
            const voice = { gain, oscs: [osc], dead: false };
            liveVoices++;
            osc.onended = () => {
                liveVoices = Math.max(0, liveVoices - 1);
                releaseVoice(voice);
                try { osc.disconnect(); band.disconnect(); gain.disconnect(); } catch (_) {}
            };
            track(voice);
            osc.start(when);
            osc.stop(stop + 0.02);
            return;
        }

        const freq = toHz(note.note + (p.octave || 0));
        if (!Number.isFinite(freq) || freq < 24 || freq > 15000) return;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = p.cutoff;
        filter.Q.value = p.q;
        const gain = ctx.createGain();
        const peak = clamp((note.vel / 127) * VOICE_GAIN * p.gain, 0.0002, 0.4);
        const stop = envelope(gain.gain, when, clamp(dur, 0.04, 2.4), peak);

        const osc = ctx.createOscillator();
        osc.type = p.wave;
        osc.frequency.value = freq;
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(limiter);

        const oscs = [osc];
        if (p.detune) {
            osc.detune.value = -Math.abs(p.detune);
            const detuned = ctx.createOscillator();
            detuned.type = p.wave;
            detuned.frequency.value = freq;
            detuned.detune.value = Math.abs(p.detune);
            detuned.connect(filter);
            oscs.push(detuned);
        }

        const voice = { gain, oscs, dead: false };
        liveVoices++;
        osc.onended = () => {
            liveVoices = Math.max(0, liveVoices - 1);
            releaseVoice(voice);
            try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch (_) {}
        };
        track(voice);
        oscs.forEach(o => { o.start(when); o.stop(stop + 0.02); });
        if (oscs[1]) oscs[1].onended = () => { try { oscs[1].disconnect(); } catch (_) {} };
    }

    // --------------------------------------------------------------- transport

    function noteIndexAt(track, sec) {
        const notes = track.notes;
        let lo = 0, hi = notes.length - 1, idx = 0;
        while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            if (tickToSec(track, notes[mid].tick) <= sec) { idx = mid; lo = mid + 1; }
            else hi = mid - 1;
        }
        return idx;
    }

    function pump() {
        if (!ctx || !current || paused || muted) return;
        const elapsed = ctx.currentTime - current.startedAt;
        const horizon = elapsed + LOOKAHEAD;
        const track = current.track;
        let i = current.cursor;
        while (i < track.notes.length) {
            const note = track.notes[i];
            const at = tickToSec(track, note.tick);
            if (at > horizon) break;
            const end = tickToSec(track, note.tick + note.dur);
            scheduleNote(note, current.startedAt + at, Math.max(0.03, end - at));
            i++;
        }
        current.cursor = i;
        if (elapsed >= track.duration + 0.2) advance();
    }

    function startScheduler(fromSec) {
        if (!ctx || !current) return;
        const offset = Number.isFinite(fromSec) ? Math.max(0, fromSec) : 0;
        current.startedAt = ctx.currentTime + 0.08 - offset;
        current.cursor = offset > 0 ? noteIndexAt(current.track, offset) : 0;
        if (schedulerTimer) clearInterval(schedulerTimer);
        schedulerTimer = setInterval(() => { if (!disposed) pump(); }, TICK_MS);
        pump();
    }

    function stopScheduler() {
        if (schedulerTimer) { clearInterval(schedulerTimer); schedulerTimer = null; }
    }

    function halt() {
        token++;
        stopScheduler();
        cutAll(0.05);
        current = null;
        currentId = null;
        pausedAtSec = 0;
        setLevel(); // duck-läget behålls: ett låtbyte under medleyn får inte höja musiken
    }

    function rememberCache(id, track) {
        cache.set(id, track);
        while (cache.size > CACHE_MAX) {
            const oldest = cache.keys().next().value;
            cache.delete(oldest);
        }
    }

    // Löser alltid ut { id, track } så att anroparen vet vilken låt som faktiskt
    // spelar även när en trasig fil ersatts av en annan.
    function load(id, retried) {
        if (cache.has(id)) {
            const hit = cache.get(id);
            cache.delete(id); cache.set(id, hit); // LRU: senast använd sist ut
            return Promise.resolve({ id, track: hit });
        }
        return fetch(`${MIDI_BASE}${id}.mid`, { cache: 'force-cache' })
            .then(res => {
                if (!res.ok) throw new Error(`MIDI ${id}: HTTP ${res.status}`);
                return res.arrayBuffer();
            })
            .then(buf => {
                const track = parseMidi(buf);
                if (!track) throw new Error(`MIDI ${id}: kunde inte tolkas`);
                rememberCache(id, track);
                return { id, track };
            })
            .catch(err => {
                if (retried) throw err;
                // En trasig eller saknad fil ska inte stoppa musiken.
                const fallback = randomId(id);
                if (fallback === id) throw err;
                return load(fallback, true);
            });
    }

    function randomId(exclude) {
        if (ROTATION.length < 2) return ROTATION[0];
        let id = exclude;
        for (let guard = 0; guard < 32 && id === exclude; guard++) {
            id = ROTATION[(Math.random() * ROTATION.length) | 0];
        }
        if (id === exclude) {
            const at = ROTATION.indexOf(exclude);
            id = ROTATION[(at + 1 + ((Math.random() * (ROTATION.length - 1)) | 0)) % ROTATION.length];
        }
        return id;
    }

    function play(id) {
        if (disposed) return;
        const ac = audio();
        const mine = ++token;
        halt();
        token = mine;
        paused = false;
        muted = false;
        currentId = id;
        setLevel();
        render();
        load(id).then(({ id: realId, track }) => {
            if (disposed || token !== mine) return;
            currentId = realId;
            current = { id: realId, track, startedAt: 0, cursor: 0 };
            render();
            if (!paused && !muted) startScheduler(0);
        }).catch(err => {
            if (disposed || token !== mine) return;
            currentId = null;
            current = null;
            render('musik: filen kunde inte läsas');
            if (typeof console !== 'undefined') console.warn('[quiz-music]', err && err.message ? err.message : err);
            // Ett tillfälligt nätverksfel ska inte tysta musiken för resten av
            // sessionen: försök igen med en annan låt.
            if (!recovering) {
                recovering = true;
                recoveryTimer = setTimeout(() => {
                    recovering = false;
                    recoveryTimer = null;
                    if (!disposed && !paused && !muted) play(randomId(id));
                }, 1200);
            }
        });
        if (ac.state === 'suspended') ac.resume().catch(() => {});
    }

    function advance() { play(randomId(currentId)); }

    function next() {
        if (disposed) return false;
        play(randomId(currentId));
        return true;
    }

    // M: byt klang. Samma låt, samma position, samma kö. Klingande toner fasas
    // ut kort så att bytet hörs direkt i stället för först vid nästa fras.
    function cyclePatch() {
        if (disposed) return false;
        patchIndex = (patchIndex + 1) % PATCHES.length;
        if (ctx) cutAll(0.03);
        render();
        return true;
    }

    function pause() {
        if (disposed || !current || paused) return false;
        pausedAtSec = Math.max(0, ctx.currentTime - current.startedAt);
        paused = true;
        stopScheduler();
        cutAll(0.03);
        setLevel(true);
        render();
        return true;
    }

    function resume() {
        if (disposed) return false;
        muted = false;
        paused = false;
        pollForeground();
        setLevel();
        if (current && currentId) startScheduler(pausedAtSec);
        else if (currentId) play(currentId);
        else play(randomId(null)); // idle: första uppspelning
        render();
        return true;
    }

    function togglePlay() {
        if (disposed) return false;
        const silent = muted || paused || !current;
        return silent ? resume() : pause();
    }

    function isPlaying() { return !!current && !paused && !muted; }

    // Transportposition i sekunder: används av quizet för felsökning och av
    // testet som bevisar att M inte startar om låten.
    function positionSec() {
        if (paused || !current || !ctx) return pausedAtSec;
        return Math.max(0, ctx.currentTime - current.startedAt);
    }

    // ------------------------------------------------------------ duckar röster

    // Ordinary quiz audio shares the mix. Only the actual song-identification medley plays alone.
    function foregroundState() {
        let level = window.speechSynthesis?.speaking ? 1 : 0;
        for (const node of root.querySelectorAll('audio')) {
            if (node.paused || node.ended || node.muted || node.volume <= 0) continue;
            if (node.id === 'jeopardy-clue-audio' && node.getAttribute('src') === 'images/quiz/dagar/medley.mp3') return 2;
            level = 1;
        }
        return level;
    }

    function pollForeground() {
        if (disposed) return;
        const state = foregroundState();
        if (state !== ducks) { ducks = state; setLevel(state === 2); }
    }

    const mediaEvents = ['play', 'pause', 'ended', 'emptied'];
    mediaEvents.forEach(type => root.addEventListener(type, pollForeground, true));
    pollTimer = setInterval(pollForeground, 220);

    // --------------------------------------------------------------- livscykel

    function onVisibility() {
        if (!ctx || muted) return;
        if (document.hidden) ctx.suspend().catch(() => {});
        else ctx.resume().catch(() => {});
    }
    document.addEventListener('visibilitychange', onVisibility);

    // Första interaktionen öppnar ljudkontexten (browserregler) och startar en
    // slumpad låt. Ingen ljudfil spelas före den.
    function unlock() {
        if (disposed) return;
        const ac = audio();
        if (ac.state === 'suspended') ac.resume().catch(() => {});
        if (unlocked) return;
        unlocked = true;
        // Första interaktionen ger en slumpad låt; före den spelas ingenting.
        if (!currentId && !paused && !muted) play(randomId(null));
        else setLevel();
    }
    document.addEventListener('pointerdown', unlock, { capture: true, passive: true });

    // -------------------------------------------------------------------- UI

    const wrap = document.createElement('span');
    wrap.className = 'qm-controls';
    const bPlay = document.createElement('button');
    bPlay.type = 'button';
    bPlay.className = 'qm-btn';
    const bNext = document.createElement('button');
    bNext.type = 'button';
    bNext.className = 'qm-btn';
    bNext.textContent = 'nästa';
    const bPatch = document.createElement('button');
    bPatch.type = 'button';
    bPatch.className = 'qm-btn';
    const lbl = document.createElement('span');
    lbl.className = 'qm-label';
    lbl.setAttribute('role', 'status');
    lbl.setAttribute('aria-live', 'polite');
    wrap.append(bPlay, bNext, bPatch, lbl);

    if (controls && controls.nodeType === 1) controls.append(wrap);
    else if (root && root.querySelector) {
        const bar = root.querySelector('.quiz-player-bar');
        if (bar) bar.append(wrap);
    }

    let notice = '';
    function render(message) {
        notice = message || '';
        const p = patch();
        const playing = !!currentId && !paused && !muted;
        bPlay.textContent = muted ? 'musik: av' : paused ? 'spela' : playing ? 'paus' : 'musik';
        bPlay.setAttribute('aria-label', muted ? 'Sätt på musiken'
            : paused ? 'Återuppta musiken'
            : playing ? 'Pausa musiken' : 'Sätt på musiken');
        bPlay.setAttribute('aria-pressed', String(playing));
        bNext.disabled = ROTATION.length < 2;
        bNext.title = 'N: byt låt';
        bNext.setAttribute('aria-label', 'Byt låt (N)');
        bPatch.textContent = `instrument: ${p.name}`;
        bPatch.title = 'M: byt instrument';
        bPatch.setAttribute('aria-label', `Byt instrument, nu ${p.name} (M)`);
        lbl.textContent = notice || (currentId ? `låt ${currentId} · ${p.name}` : 'musik: av');
    }

    bPlay.addEventListener('click', () => togglePlay());
    bNext.addEventListener('click', () => next());
    bPatch.addEventListener('click', () => cyclePatch());

    // --------------------------------------------------------------- tangentbord

    function handleKey(event) {
        if (disposed || !event) return false;
        if (event.defaultPrevented) return false;
        if (event.ctrlKey || event.metaKey || event.altKey) return false;
        if (event.repeat) return false;
        const el = event.target;
        if (el && el.nodeType === 1) {
            const tag = el.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable) return false;
            if (el.closest && el.closest('dialog[open]')) return false;
        }
        const key = event.key;
        if (key === 'n' || key === 'N') {
            event.preventDefault();
            unlocked = true; // tangenttryckningen är en giltig gest
            next();
            return true;
        }
        if (key === 'm' || key === 'M') {
            event.preventDefault();
            unlocked = true;
            if (!currentId && !paused && !muted) play(randomId(null));
            else cyclePatch();
            return true;
        }
        return false;
    }

    function dispose() {
        if (disposed) return;
        disposed = true;
        halt();
        if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
        if (recoveryTimer) { clearTimeout(recoveryTimer); recoveryTimer = null; }
        document.removeEventListener('visibilitychange', onVisibility);
        document.removeEventListener('pointerdown', unlock, { capture: true });
        if (wrap.parentNode) wrap.remove();
        mediaEvents.forEach(type => root.removeEventListener(type, pollForeground, true));
        cache.clear();
        try { if (limiter) limiter.disconnect(); } catch (_) {}
        try { if (master) master.disconnect(); } catch (_) {}
        limiter = null; master = null;
        if (ctx) { const dead = ctx; ctx = null; dead.close().catch(() => {}); }
    }

    render();

    return {
        handleKey,
        dispose,
        next,
        cyclePatch,
        togglePlay,
        get trackId() { return currentId; },
        get patchName() { return patch().name; },
        get isPlaying() { return isPlaying(); },
        get positionSec() { return positionSec(); }
    };
};
