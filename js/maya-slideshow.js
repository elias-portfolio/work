/** Sixteen Maya cards swap instantly, one controlled card at a time. */

(function () {
    const GLYPHS = [{"id": "T100", "file": "bauhaus_glyph_000100.svg"}, {"id": "T101", "file": "bauhaus_glyph_000101.svg"}, {"id": "T200", "file": "bauhaus_glyph_000200.svg"}, {"id": "T300", "file": "bauhaus_glyph_000300.svg"}, {"id": "T301", "file": "bauhaus_glyph_000301.svg"}, {"id": "T302", "file": "bauhaus_glyph_000302.svg"}, {"id": "T400", "file": "bauhaus_glyph_000400.svg"}, {"id": "T500", "file": "bauhaus_glyph_000500.svg"}, {"id": "T600", "file": "bauhaus_glyph_000600.svg"}, {"id": "T700", "file": "bauhaus_glyph_000700.svg"}, {"id": "T800", "file": "bauhaus_glyph_000800.svg"}, {"id": "T900", "file": "bauhaus_glyph_000900.svg"}, {"id": "T1000", "file": "bauhaus_glyph_001000.svg"}, {"id": "T1100", "file": "bauhaus_glyph_001100.svg"}, {"id": "T1200", "file": "bauhaus_glyph_001200.svg"}, {"id": "T1201", "file": "bauhaus_glyph_001201.svg"}, {"id": "T1300", "file": "bauhaus_glyph_001300.svg"}, {"id": "T1301", "file": "bauhaus_glyph_001301.svg"}, {"id": "T1302", "file": "bauhaus_glyph_001302.svg"}, {"id": "T1303", "file": "bauhaus_glyph_001303.svg"}, {"id": "T1400", "file": "bauhaus_glyph_001400.svg"}, {"id": "T1500", "file": "bauhaus_glyph_001500.svg"}, {"id": "T1501", "file": "bauhaus_glyph_001501.svg"}, {"id": "T1600", "file": "bauhaus_glyph_001600.svg"}, {"id": "T1601", "file": "bauhaus_glyph_001601.svg"}, {"id": "T1602", "file": "bauhaus_glyph_001602.svg"}, {"id": "T1700", "file": "bauhaus_glyph_001700.svg"}, {"id": "T1701", "file": "bauhaus_glyph_001701.svg"}, {"id": "T1702", "file": "bauhaus_glyph_001702.svg"}, {"id": "T1705", "file": "bauhaus_glyph_001705.svg"}, {"id": "T1800", "file": "bauhaus_glyph_001800.svg"}, {"id": "T1900", "file": "bauhaus_glyph_001900.svg"}, {"id": "T1901", "file": "bauhaus_glyph_001901.svg"}, {"id": "T2000", "file": "bauhaus_glyph_002000.svg"}, {"id": "T2100", "file": "bauhaus_glyph_002100.svg"}, {"id": "T2101", "file": "bauhaus_glyph_002101.svg"}, {"id": "T2104", "file": "bauhaus_glyph_002104.svg"}, {"id": "T2200", "file": "bauhaus_glyph_002200.svg"}, {"id": "T2300", "file": "bauhaus_glyph_002300.svg"}, {"id": "T2400", "file": "bauhaus_glyph_002400.svg"}, {"id": "T2500", "file": "bauhaus_glyph_002500.svg"}, {"id": "T2501", "file": "bauhaus_glyph_002501.svg"}, {"id": "T2600", "file": "bauhaus_glyph_002600.svg"}, {"id": "T2700", "file": "bauhaus_glyph_002700.svg"}];
    const GENERATED = ["t2", "t28", "t29", "t30", "t31", "t32", "t33", "t34", "t45", "t46", "t47", "t49", "t51", "t53", "t55", "t56"].map((id) => ({
        id: id.toUpperCase(), file: "images/maya/generated/" + id + ".webp", kind: "generated", alt: "Generated Maya sign study " + id.toUpperCase()
    }));
    const BLACK = "#000000";
    const WHITE = "#FFFFFF";
    const CARD_COUNT = 12;
    const CHANGE_MS = 350;
    const DARK_PHASE = [true, false, false, true, true, false, true, false, false, true, false, true, true, false, true, false];
    // Bounded by the declared asset list; retain decoded nodes for reuse.
    const images = new Map();
    function prepare(asset, ready) {
        let entry = images.get(asset.file);
        if (entry && entry.ready) { ready(entry.img); return; }
        if (entry) { entry.waiters.push(ready); return; }
        const img = new Image();
        entry = { img, ready: false, waiters: [ready] };
        images.set(asset.file, entry);
        const finish = (ok) => {
            img.onload = img.onerror = null;
            entry.ready = ok;
            if (!ok) images.delete(asset.file);
            const waiters = entry.waiters.splice(0);
            waiters.forEach((callback) => callback(ok ? img : null));
        };
        img.onload = () => {
            if (img.decode) img.decode().then(() => finish(true), () => finish(false));
            else finish(true);
        };
        img.onerror = () => finish(false);
        img.src = asset.file;
    }

    class MayaStream {
        constructor() {
            this.cards = [];
            for (let i = 1; i <= CARD_COUNT; i++) {
                const card = document.getElementById("maya-card-" + i);
                const img = document.getElementById("maya-img-" + i);
                const cap = document.getElementById("maya-caption-" + i);
                if (!card || !img) return;
                this.cards.push({ card, img, cap });
            }
            if (this.cards.length !== CARD_COUNT) return;

            const glyphs = GLYPHS.map((glyph) => ({
                id: glyph.id, file: "maya/references/svg/" + glyph.file, kind: "glyph", alt: "Maya glyph study " + glyph.id
            }));
            this.assets = glyphs.concat(GENERATED);
            this.decks = this.cards.map((_, cardIndex) => this.makeDeck(cardIndex));
            this.indices = Array.from({ length: CARD_COUNT }, (_, index) => index);
            this.active = this.decks.map((deck, index) => deck[index]);
            this.visible = new Set(this.active.map((asset) => asset.file));
            this.dark = this.active.map((asset, index) => asset.kind === "generated" ? false : DARK_PHASE[index]);
            this.running = false;
            this.generation = 0;
            this.pending = false;
            this.inView = true;
            this.initialized = false;
            this.disposed = false;
            let remaining = this.cards.length;
            this.cards.forEach((_, index) => prepare(this.active[index], (img) => {
                if (this.disposed) return;
                if (img) this.render(index, img);
                if (--remaining === 0) {
                    this.initialized = true;
                    this.startLoop();
                }
            }));
            if (typeof IntersectionObserver !== 'undefined') {
                const grid = this.cards[0].card.closest('.maya-card-grid');
                if (grid) {
                    this.observer = new IntersectionObserver(([entry]) => {
                        this.inView = entry.isIntersecting;
                        if (this.inView) this.startLoop();
                        else this.stopLoop();
                    });
                    this.observer.observe(grid);
                }
            }
        }

        makeDeck(cardIndex) {
            return Array.from({ length: this.assets.length }, (_, offset) => this.assets[(cardIndex + offset) % this.assets.length]);
        }

        render(index, img) {
            const slot = this.cards[index];
            const { card, cap } = slot;
            const asset = this.active[index];
            img.id = 'maya-img-' + (index + 1);
            img.alt = asset.alt;
            img.style.filter = this.dark[index] ? 'invert(1)' : '';
            // Insert the already-decoded image, never expose a loading src.
            slot.img.replaceWith(img);
            slot.img = img;
            card.style.backgroundColor = this.dark[index] ? BLACK : WHITE;
            if (cap) cap.textContent = asset.id;
        }

        change(index) {
            const { card } = this.cards[index];
            if (!this.running || !card || !document.body.contains(card)) {
                this.stopLoop();
                return;
            }
            if (this.pending) return;
            const deck = this.decks[index];
            const current = this.active[index];
            let next = null;
            for (let offset = 1; offset <= deck.length; offset++) {
                const candidateIndex = (this.indices[index] + offset) % deck.length;
                const candidate = deck[candidateIndex];
                if (!this.visible.has(candidate.file)) {
                    next = { candidate, candidateIndex };
                    break;
                }
            }
            if (!next) return;
            this.pending = true;
            const generation = this.generation;
            prepare(next.candidate, (img) => {
                if (generation !== this.generation || this.disposed) return;
                this.pending = false;
                if (!img || !this.running || !document.body.contains(card)) return;
                this.visible.delete(current.file);
                this.visible.add(next.candidate.file);
                this.indices[index] = next.candidateIndex;
                this.active[index] = next.candidate;
                this.dark[index] = next.candidate.kind === 'generated' ? false : !this.dark[index];
                this.render(index, img);
            });
        }

        startLoop() {
            this.stopLoop();
            if (this.disposed || !this.initialized || !this.inView || document.hidden) return;
            this.running = true;
            this.timer = setInterval(() => {
                const first = Math.floor(Math.random() * CARD_COUNT);
                let cardIndex = first;
                for (let offset = 1; offset < CARD_COUNT; offset++) {
                    if (cardIndex !== this.previousCard) break;
                    cardIndex = (first + offset) % CARD_COUNT;
                }
                this.change(cardIndex);
                this.previousCard = cardIndex;
            }, CHANGE_MS);

        }

        stopLoop() {
            this.running = false;
            clearInterval(this.timer);
            this.timer = null;
            this.generation++;
            this.pending = false;
        }

        dispose() {
            this.disposed = true;
            this.stopLoop();
            this.observer?.disconnect();
        }
    }

    let activeInstance = null;
    function onVisibilityChange() {
        if (!activeInstance) return;
        if (document.hidden) activeInstance.stopLoop();
        else activeInstance.startLoop();
    }

    window.initMayaSlideshow = function () {
        if (activeInstance) activeInstance.dispose();
        document.removeEventListener("visibilitychange", onVisibilityChange);
        if (!document.getElementById("maya-card-1")) return;
        activeInstance = new MayaStream();
        document.addEventListener("visibilitychange", onVisibilityChange);
    };

    window.stopMayaSlideshow = function () {
        document.removeEventListener("visibilitychange", onVisibilityChange);
        if (activeInstance) activeInstance.dispose();
        activeInstance = null;
    };
})();
