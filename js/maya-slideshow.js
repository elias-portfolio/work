/** Twelve Maya cards flip together like a Solari board: one new asset per card, every beat. */

(function () {
    const GLYPHS = [{"id": "T100", "file": "bauhaus_glyph_000100.svg"}, {"id": "T101", "file": "bauhaus_glyph_000101.svg"}, {"id": "T200", "file": "bauhaus_glyph_000200.svg"}, {"id": "T300", "file": "bauhaus_glyph_000300.svg"}, {"id": "T301", "file": "bauhaus_glyph_000301.svg"}, {"id": "T302", "file": "bauhaus_glyph_000302.svg"}, {"id": "T400", "file": "bauhaus_glyph_000400.svg"}, {"id": "T500", "file": "bauhaus_glyph_000500.svg"}, {"id": "T600", "file": "bauhaus_glyph_000600.svg"}, {"id": "T700", "file": "bauhaus_glyph_000700.svg"}, {"id": "T800", "file": "bauhaus_glyph_000800.svg"}, {"id": "T900", "file": "bauhaus_glyph_000900.svg"}, {"id": "T1000", "file": "bauhaus_glyph_001000.svg"}, {"id": "T1100", "file": "bauhaus_glyph_001100.svg"}, {"id": "T1200", "file": "bauhaus_glyph_001200.svg"}, {"id": "T1201", "file": "bauhaus_glyph_001201.svg"}, {"id": "T1300", "file": "bauhaus_glyph_001300.svg"}, {"id": "T1301", "file": "bauhaus_glyph_001301.svg"}, {"id": "T1302", "file": "bauhaus_glyph_001302.svg"}, {"id": "T1303", "file": "bauhaus_glyph_001303.svg"}, {"id": "T1400", "file": "bauhaus_glyph_001400.svg"}, {"id": "T1500", "file": "bauhaus_glyph_001500.svg"}, {"id": "T1501", "file": "bauhaus_glyph_001501.svg"}, {"id": "T1600", "file": "bauhaus_glyph_001600.svg"}, {"id": "T1601", "file": "bauhaus_glyph_001601.svg"}, {"id": "T1602", "file": "bauhaus_glyph_001602.svg"}, {"id": "T1700", "file": "bauhaus_glyph_001700.svg"}, {"id": "T1701", "file": "bauhaus_glyph_001701.svg"}, {"id": "T1702", "file": "bauhaus_glyph_001702.svg"}, {"id": "T1705", "file": "bauhaus_glyph_001705.svg"}, {"id": "T1800", "file": "bauhaus_glyph_001800.svg"}, {"id": "T1900", "file": "bauhaus_glyph_001900.svg"}, {"id": "T1901", "file": "bauhaus_glyph_001901.svg"}, {"id": "T2000", "file": "bauhaus_glyph_002000.svg"}, {"id": "T2100", "file": "bauhaus_glyph_002100.svg"}, {"id": "T2101", "file": "bauhaus_glyph_002101.svg"}, {"id": "T2104", "file": "bauhaus_glyph_002104.svg"}, {"id": "T2200", "file": "bauhaus_glyph_002200.svg"}, {"id": "T2300", "file": "bauhaus_glyph_002300.svg"}, {"id": "T2400", "file": "bauhaus_glyph_002400.svg"}, {"id": "T2500", "file": "bauhaus_glyph_002500.svg"}, {"id": "T2501", "file": "bauhaus_glyph_002501.svg"}, {"id": "T2600", "file": "bauhaus_glyph_002600.svg"}, {"id": "T2700", "file": "bauhaus_glyph_002700.svg"}];
    const GENERATED = ["t2", "t28", "t29", "t30", "t31", "t32", "t33", "t34", "t45", "t46", "t47", "t49", "t51", "t53", "t55", "t56"].map((id) => ({
        id: id.toUpperCase(), file: "images/maya/generated/" + id + ".webp", kind: "generated", alt: "Generated Maya sign study " + id.toUpperCase()
    }));
    const BLACK = "#000000";
    const WHITE = "#FFFFFF";
    const CARD_COUNT = 12;
    /** Solari cadence: the whole board flips on the fourth/fifth second. */
    const FLIP_MS = 4500;
    const FALLBACK_COLUMNS = 3;
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
            this.grid = this.cards[0].card.closest ? this.cards[0].card.closest('.maya-card-grid') : null;
            this.dark = this.cards.map(() => false);
            this.rowDark = [];
            this.running = false;
            this.generation = 0;
            this.pending = false;
            this.inView = true;
            this.initialized = false;
            this.disposed = false;
            this.dealRowPolarity();
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
                const grid = this.grid;
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

        /** Live column count, so "a row" means the same thing on desktop and mobile. */
        columns() {
            if (!this.grid || typeof window.getComputedStyle !== 'function') return FALLBACK_COLUMNS;
            const template = window.getComputedStyle(this.grid).gridTemplateColumns;
            const count = template ? template.trim().split(/\s+/).length : 0;
            return count > 0 ? count : FALLBACK_COLUMNS;
        }

        /** One random polarity per row: every card in a row shares black or white. */
        dealRowPolarity() {
            const columns = this.columns();
            const rows = Math.ceil(this.cards.length / columns);
            this.rowDark = [];
            for (let row = 0; row < rows; row++) this.rowDark.push(Math.random() < 0.5);
            // Keep both black and white rows so the board always reads as a mix.
            const darkRows = this.rowDark.filter(Boolean).length;
            if (rows > 1 && (darkRows === 0 || darkRows === rows)) {
                const flipAt = Math.floor(Math.random() * rows);
                this.rowDark[flipAt] = !this.rowDark[flipAt];
            }
            this.dark = this.cards.map((_, index) => {
                const asset = this.active[index];
                if (asset && asset.kind === 'generated') return false;
                return this.rowDark[Math.floor(index / columns)] === true;
            });
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

        /**
         * Plan one board-wide flip: every card advances a deck step, and no file is
         * planned onto two cards at once (the current faces count as taken).
         */
        planBeat() {
            const claimed = new Set(this.active.map((asset) => asset.file));
            return this.cards.map((_, index) => {
                const deck = this.decks[index];
                for (let step = 1; step <= deck.length; step++) {
                    const candidateIndex = (this.indices[index] + step) % deck.length;
                    const asset = deck[candidateIndex];
                    if (claimed.has(asset.file)) continue;
                    claimed.add(asset.file);
                    return { index, candidateIndex, asset };
                }
                return null;
            }).filter(Boolean);
        }

        /** Everyone waits for every decode, then the whole board swaps in one tick. */
        flip() {
            if (this.disposed || !this.initialized) return;
            if (!this.running || this.pending) return;
            if (this.cards.some(({ card }) => !card || !document.body.contains(card))) {
                this.stopLoop();
                return;
            }
            const planned = this.planBeat();
            if (!planned.length) return;
            this.pending = true;
            const generation = this.generation;
            const decoded = new Map();
            let remaining = planned.length;
            const commit = () => {
                if (generation !== this.generation || this.disposed) return;
                this.pending = false;
                if (!this.running) return;
                const live = planned.filter((target) => decoded.get(target) && document.body.contains(this.cards[target.index].card));
                if (!live.length) return;
                live.forEach((target) => {
                    this.indices[target.index] = target.candidateIndex;
                    this.active[target.index] = target.asset;
                });
                // Polarity is dealt once for the whole board, once the new faces are known.
                this.dealRowPolarity();
                live.forEach((target) => this.render(target.index, decoded.get(target)));
            };
            planned.forEach((target) => {
                prepare(target.asset, (img) => {
                    decoded.set(target, img);
                    if (--remaining === 0) commit();
                });
            });
        }

        startLoop() {
            this.stopLoop();
            if (this.disposed || !this.initialized || !this.inView || document.hidden) return;
            this.running = true;
            this.timer = setInterval(() => this.flip(), FLIP_MS);
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
