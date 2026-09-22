/** Sixteen Maya cards swap instantly, one controlled card at a time. */

(function () {
    const GLYPHS = [{"id": "T100", "file": "bauhaus_glyph_000100.svg"}, {"id": "T101", "file": "bauhaus_glyph_000101.svg"}, {"id": "T200", "file": "bauhaus_glyph_000200.svg"}, {"id": "T300", "file": "bauhaus_glyph_000300.svg"}, {"id": "T301", "file": "bauhaus_glyph_000301.svg"}, {"id": "T302", "file": "bauhaus_glyph_000302.svg"}, {"id": "T400", "file": "bauhaus_glyph_000400.svg"}, {"id": "T500", "file": "bauhaus_glyph_000500.svg"}, {"id": "T600", "file": "bauhaus_glyph_000600.svg"}, {"id": "T700", "file": "bauhaus_glyph_000700.svg"}, {"id": "T800", "file": "bauhaus_glyph_000800.svg"}, {"id": "T900", "file": "bauhaus_glyph_000900.svg"}, {"id": "T1000", "file": "bauhaus_glyph_001000.svg"}, {"id": "T1100", "file": "bauhaus_glyph_001100.svg"}, {"id": "T1200", "file": "bauhaus_glyph_001200.svg"}, {"id": "T1201", "file": "bauhaus_glyph_001201.svg"}, {"id": "T1300", "file": "bauhaus_glyph_001300.svg"}, {"id": "T1301", "file": "bauhaus_glyph_001301.svg"}, {"id": "T1302", "file": "bauhaus_glyph_001302.svg"}, {"id": "T1303", "file": "bauhaus_glyph_001303.svg"}, {"id": "T1400", "file": "bauhaus_glyph_001400.svg"}, {"id": "T1500", "file": "bauhaus_glyph_001500.svg"}, {"id": "T1501", "file": "bauhaus_glyph_001501.svg"}, {"id": "T1600", "file": "bauhaus_glyph_001600.svg"}, {"id": "T1601", "file": "bauhaus_glyph_001601.svg"}, {"id": "T1602", "file": "bauhaus_glyph_001602.svg"}, {"id": "T1700", "file": "bauhaus_glyph_001700.svg"}, {"id": "T1701", "file": "bauhaus_glyph_001701.svg"}, {"id": "T1702", "file": "bauhaus_glyph_001702.svg"}, {"id": "T1705", "file": "bauhaus_glyph_001705.svg"}, {"id": "T1800", "file": "bauhaus_glyph_001800.svg"}, {"id": "T1900", "file": "bauhaus_glyph_001900.svg"}, {"id": "T1901", "file": "bauhaus_glyph_001901.svg"}, {"id": "T2000", "file": "bauhaus_glyph_002000.svg"}, {"id": "T2100", "file": "bauhaus_glyph_002100.svg"}, {"id": "T2101", "file": "bauhaus_glyph_002101.svg"}, {"id": "T2104", "file": "bauhaus_glyph_002104.svg"}, {"id": "T2200", "file": "bauhaus_glyph_002200.svg"}, {"id": "T2300", "file": "bauhaus_glyph_002300.svg"}, {"id": "T2400", "file": "bauhaus_glyph_002400.svg"}, {"id": "T2500", "file": "bauhaus_glyph_002500.svg"}, {"id": "T2501", "file": "bauhaus_glyph_002501.svg"}, {"id": "T2600", "file": "bauhaus_glyph_002600.svg"}, {"id": "T2700", "file": "bauhaus_glyph_002700.svg"}];
    const GENERATED = ["t2", "t28", "t29", "t30", "t31", "t32", "t33", "t34", "t45", "t46", "t47", "t49", "t51", "t53", "t55", "t56"].map((id) => ({
        id: id.toUpperCase(), file: "images/maya/generated/" + id + ".webp", kind: "generated", alt: "Generated Maya sign study " + id.toUpperCase()
    }));
    const BLACK = "#000000";
    const WHITE = "#FFFFFF";
    const CARD_COUNT = 16;
    const CHANGE_MS = 350;
    const DARK_PHASE = [true, false, false, true, true, false, true, false, false, true, false, true, true, false, true, false];
    let timers = [];

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
            this.running = true;
            this.beat = 0;

            this.cards.forEach((_, index) => this.render(index));
            this.startLoop();
        }

        makeDeck(cardIndex) {
            return Array.from({ length: this.assets.length }, (_, offset) => this.assets[(cardIndex + offset) % this.assets.length]);
        }

        render(index) {
            const { card, img, cap } = this.cards[index];
            const asset = this.active[index];
            img.src = asset.file;
            img.alt = asset.alt;
            img.style.filter = this.dark[index] ? "invert(1)" : "";
            card.style.backgroundColor = this.dark[index] ? BLACK : WHITE;
            if (cap) cap.textContent = asset.id;
        }

        change(index) {
            const { card } = this.cards[index];
            if (!this.running || !card || !document.body.contains(card)) {
                this.stopLoop();
                return;
            }
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
            this.visible.delete(current.file);
            this.visible.add(next.candidate.file);
            this.indices[index] = next.candidateIndex;
            this.active[index] = next.candidate;
            this.dark[index] = next.candidate.kind === "generated" ? false : !this.dark[index];
            this.render(index);
        }

        startLoop() {
            this.stopLoop();
            this.running = true;
            const interval = setInterval(() => {
                const first = Math.floor(Math.random() * CARD_COUNT);
                let cardIndex = first;
                for (let offset = 1; offset < CARD_COUNT; offset++) {
                    if (cardIndex !== this.previousCard) break;
                    cardIndex = (first + offset) % CARD_COUNT;
                }
                this.change(cardIndex);
                this.previousCard = cardIndex;
            }, CHANGE_MS);
            timers.push(interval);
        }

        stopLoop() {
            this.running = false;
            timers.forEach((timer) => { clearTimeout(timer); clearInterval(timer); });
            timers = [];
        }
    }

    let activeInstance = null;
    function onVisibilityChange() {
        if (!activeInstance) return;
        if (document.hidden) activeInstance.stopLoop();
        else activeInstance.startLoop();
    }

    window.initMayaSlideshow = function () {
        if (activeInstance) activeInstance.stopLoop();
        document.removeEventListener("visibilitychange", onVisibilityChange);
        if (!document.getElementById("maya-card-1")) return;
        activeInstance = new MayaStream();
        document.addEventListener("visibilitychange", onVisibilityChange);
    };

    window.stopMayaSlideshow = function () {
        document.removeEventListener("visibilitychange", onVisibilityChange);
        if (activeInstance) activeInstance.stopLoop();
        activeInstance = null;
    };
})();
