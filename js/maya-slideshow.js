/**
 * Maya Quad Asynchronous Auto-Flipping Glyph Cards
 * Four cards in a 2x2 grid. Each card flips every 1000ms, staggered 250ms apart,
 * so one card flips every 250ms (same global rhythm as the original dual-card version).
 * Every flip swaps the glyph and toggles the background between black and white;
 * glyphs invert to white on black backgrounds via CSS filter.
 */

(function () {
    const GLYPHS = [{"id": "T100", "file": "bauhaus_glyph_000100.svg"}, {"id": "T101", "file": "bauhaus_glyph_000101.svg"}, {"id": "T200", "file": "bauhaus_glyph_000200.svg"}, {"id": "T300", "file": "bauhaus_glyph_000300.svg"}, {"id": "T301", "file": "bauhaus_glyph_000301.svg"}, {"id": "T302", "file": "bauhaus_glyph_000302.svg"}, {"id": "T400", "file": "bauhaus_glyph_000400.svg"}, {"id": "T500", "file": "bauhaus_glyph_000500.svg"}, {"id": "T600", "file": "bauhaus_glyph_000600.svg"}, {"id": "T700", "file": "bauhaus_glyph_000700.svg"}, {"id": "T800", "file": "bauhaus_glyph_000800.svg"}, {"id": "T900", "file": "bauhaus_glyph_000900.svg"}, {"id": "T1000", "file": "bauhaus_glyph_001000.svg"}, {"id": "T1100", "file": "bauhaus_glyph_001100.svg"}, {"id": "T1200", "file": "bauhaus_glyph_001200.svg"}, {"id": "T1201", "file": "bauhaus_glyph_001201.svg"}, {"id": "T1300", "file": "bauhaus_glyph_001300.svg"}, {"id": "T1301", "file": "bauhaus_glyph_001301.svg"}, {"id": "T1302", "file": "bauhaus_glyph_001302.svg"}, {"id": "T1303", "file": "bauhaus_glyph_001303.svg"}, {"id": "T1400", "file": "bauhaus_glyph_001400.svg"}, {"id": "T1500", "file": "bauhaus_glyph_001500.svg"}, {"id": "T1501", "file": "bauhaus_glyph_001501.svg"}, {"id": "T1600", "file": "bauhaus_glyph_001600.svg"}, {"id": "T1601", "file": "bauhaus_glyph_001601.svg"}, {"id": "T1602", "file": "bauhaus_glyph_001602.svg"}, {"id": "T1700", "file": "bauhaus_glyph_001700.svg"}, {"id": "T1701", "file": "bauhaus_glyph_001701.svg"}, {"id": "T1702", "file": "bauhaus_glyph_001702.svg"}, {"id": "T1705", "file": "bauhaus_glyph_001705.svg"}, {"id": "T1800", "file": "bauhaus_glyph_001800.svg"}, {"id": "T1900", "file": "bauhaus_glyph_001900.svg"}, {"id": "T1901", "file": "bauhaus_glyph_001901.svg"}, {"id": "T2000", "file": "bauhaus_glyph_002000.svg"}, {"id": "T2100", "file": "bauhaus_glyph_002100.svg"}, {"id": "T2101", "file": "bauhaus_glyph_002101.svg"}, {"id": "T2104", "file": "bauhaus_glyph_002104.svg"}, {"id": "T2200", "file": "bauhaus_glyph_002200.svg"}, {"id": "T2300", "file": "bauhaus_glyph_002300.svg"}, {"id": "T2400", "file": "bauhaus_glyph_002400.svg"}, {"id": "T2500", "file": "bauhaus_glyph_002500.svg"}, {"id": "T2501", "file": "bauhaus_glyph_002501.svg"}, {"id": "T2600", "file": "bauhaus_glyph_002600.svg"}, {"id": "T2700", "file": "bauhaus_glyph_002700.svg"}];

    const BLACK = "#000000";
    const WHITE = "#FFFFFF";
    const CARD_COUNT = 4;
    const FLIP_INTERVAL_MS = 1000;
    const STAGGER_MS = 250;

    let timers = [];

    class QuadMayaFlippers {
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

            // Checkerboard start: cards 1 and 4 black, 2 and 3 white
            this.activeGlyphs = [0, 1, 2, 3];
            this.dark = [true, false, false, true];

            for (let i = 0; i < CARD_COUNT; i++) {
                this.renderCard(i);
            }

            this.startLoop();
        }

        getRandomGlyphIndex(excludeIndices) {
            let idx;
            do {
                idx = Math.floor(Math.random() * GLYPHS.length);
            } while (excludeIndices.includes(idx) && GLYPHS.length > excludeIndices.length);
            return idx;
        }

        renderCard(i) {
            const { card, img, cap } = this.cards[i];
            const glyph = GLYPHS[this.activeGlyphs[i]];
            const color = this.dark[i] ? BLACK : WHITE;

            img.src = "maya/references/svg/" + glyph.file;
            img.style.filter = this.dark[i] ? "invert(1)" : "";
            card.style.backgroundColor = color;
            if (cap) cap.textContent = glyph.id;
        }

        flipCard(i) {
            const { card } = this.cards[i];
            if (!card || !document.body.contains(card)) {
                this.stopLoop();
                return;
            }

            this.activeGlyphs[i] = this.getRandomGlyphIndex(this.activeGlyphs);
            this.dark[i] = !this.dark[i];
            this.renderCard(i);
        }

        startLoop() {
            this.stopLoop();

            for (let i = 0; i < CARD_COUNT; i++) {
                const timeout = setTimeout(() => {
                    this.flipCard(i);
                    const interval = setInterval(() => {
                        this.flipCard(i);
                    }, FLIP_INTERVAL_MS);
                    timers.push(interval);
                }, (i + 1) * STAGGER_MS);
                timers.push(timeout);
            }
        }

        stopLoop() {
            timers.forEach((t) => { clearTimeout(t); clearInterval(t); });
            timers = [];
        }
    }

    let activeInstance = null;

    window.initMayaSlideshow = function () {
        if (activeInstance) {
            activeInstance.stopLoop();
            activeInstance = null;
        }
        if (!document.getElementById("maya-card-1")) return;
        activeInstance = new QuadMayaFlippers();
    };

    window.stopMayaSlideshow = function () {
        if (activeInstance) {
            activeInstance.stopLoop();
            activeInstance = null;
        }
    };
})();
