/** Six Maya cards cycle all studies with a calm diagonal rhythm and one DOM update per beat. */

(function () {
    const GLYPHS = [{"id": "T100", "file": "bauhaus_glyph_000100.svg"}, {"id": "T101", "file": "bauhaus_glyph_000101.svg"}, {"id": "T200", "file": "bauhaus_glyph_000200.svg"}, {"id": "T300", "file": "bauhaus_glyph_000300.svg"}, {"id": "T301", "file": "bauhaus_glyph_000301.svg"}, {"id": "T302", "file": "bauhaus_glyph_000302.svg"}, {"id": "T400", "file": "bauhaus_glyph_000400.svg"}, {"id": "T500", "file": "bauhaus_glyph_000500.svg"}, {"id": "T600", "file": "bauhaus_glyph_000600.svg"}, {"id": "T700", "file": "bauhaus_glyph_000700.svg"}, {"id": "T800", "file": "bauhaus_glyph_000800.svg"}, {"id": "T900", "file": "bauhaus_glyph_000900.svg"}, {"id": "T1000", "file": "bauhaus_glyph_001000.svg"}, {"id": "T1100", "file": "bauhaus_glyph_001100.svg"}, {"id": "T1200", "file": "bauhaus_glyph_001200.svg"}, {"id": "T1201", "file": "bauhaus_glyph_001201.svg"}, {"id": "T1300", "file": "bauhaus_glyph_001300.svg"}, {"id": "T1301", "file": "bauhaus_glyph_001301.svg"}, {"id": "T1302", "file": "bauhaus_glyph_001302.svg"}, {"id": "T1303", "file": "bauhaus_glyph_001303.svg"}, {"id": "T1400", "file": "bauhaus_glyph_001400.svg"}, {"id": "T1500", "file": "bauhaus_glyph_001500.svg"}, {"id": "T1501", "file": "bauhaus_glyph_001501.svg"}, {"id": "T1600", "file": "bauhaus_glyph_001600.svg"}, {"id": "T1601", "file": "bauhaus_glyph_001601.svg"}, {"id": "T1602", "file": "bauhaus_glyph_001602.svg"}, {"id": "T1700", "file": "bauhaus_glyph_001700.svg"}, {"id": "T1701", "file": "bauhaus_glyph_001701.svg"}, {"id": "T1702", "file": "bauhaus_glyph_001702.svg"}, {"id": "T1705", "file": "bauhaus_glyph_001705.svg"}, {"id": "T1800", "file": "bauhaus_glyph_001800.svg"}, {"id": "T1900", "file": "bauhaus_glyph_001900.svg"}, {"id": "T1901", "file": "bauhaus_glyph_001901.svg"}, {"id": "T2000", "file": "bauhaus_glyph_002000.svg"}, {"id": "T2100", "file": "bauhaus_glyph_002100.svg"}, {"id": "T2101", "file": "bauhaus_glyph_002101.svg"}, {"id": "T2104", "file": "bauhaus_glyph_002104.svg"}, {"id": "T2200", "file": "bauhaus_glyph_002200.svg"}, {"id": "T2300", "file": "bauhaus_glyph_002300.svg"}, {"id": "T2400", "file": "bauhaus_glyph_002400.svg"}, {"id": "T2500", "file": "bauhaus_glyph_002500.svg"}, {"id": "T2501", "file": "bauhaus_glyph_002501.svg"}, {"id": "T2600", "file": "bauhaus_glyph_002600.svg"}, {"id": "T2700", "file": "bauhaus_glyph_002700.svg"}];

    const BLACK = "#000000";
    const WHITE = "#FFFFFF";
    const CARD_COUNT = 6;
    const BEAT_MS = 550;

    let timers = [];

    const IMAGE_ASSETS = ["t2", "t28", "t29", "t30", "t31", "t32", "t33", "t34", "t45", "t46", "t47", "t49", "t51", "t53", "t55", "t56"].map((id) => ({
        id: id.toUpperCase(),
        file: "images/maya/generated/" + id + ".webp",
        kind: "generated",
        alt: "Generated Maya sign study " + id.toUpperCase()
    }));

    class MayaFlippers {
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

            const glyphAssets = GLYPHS.map((glyph) => ({
                id: glyph.id,
                file: "maya/references/svg/" + glyph.file,
                alt: "Maya glyph study " + glyph.id
            }));
            this.assets = [];
            // A 62-step interleaving keeps generated studies frequent without repeats.
            for (let i = 0; i < glyphAssets.length; i++) {
                this.assets.push(glyphAssets[i]);
                const imageIndex = (i * 5 + 2) % IMAGE_ASSETS.length;
                const image = IMAGE_ASSETS[imageIndex];
                if (!this.assets.includes(image)) {
                    this.assets.push(image);
                }
            }
            for (const image of IMAGE_ASSETS) {
                if (!this.assets.includes(image)) {
                    this.assets.push(image);
                }
            }
            // Start with one generated study in every other card.
            this.activeAssets = [
                glyphAssets[0], IMAGE_ASSETS[0],
                glyphAssets[1], IMAGE_ASSETS[1],
                glyphAssets[2], IMAGE_ASSETS[2]
            ];
            const shown = new Set(this.activeAssets);
            this.assetDeck = this.assets.filter((asset) => !shown.has(asset));
            this.deckIndex = 0;
            this.dark = [true, false, false, true, true, false];
            this.beat = 0;

            for (let i = 0; i < CARD_COUNT; i++) {
                this.renderCard(i);
            }

            this.startLoop();
        }

        getNextAsset() {
            if (this.deckIndex >= this.assetDeck.length) {
                const active = new Set(this.activeAssets);
                this.assetDeck = this.assets.filter((asset) => !active.has(asset));
                this.deckIndex = 0;
            }
            const asset = this.assetDeck[this.deckIndex];
            this.deckIndex += 1;
            return asset;
        }

        renderCard(i) {
            const { card, img, cap } = this.cards[i];
            const asset = this.activeAssets[i];
            const dark = this.dark[i];
            img.src = asset.file;
            img.alt = asset.alt;
            img.style.filter = dark ? "invert(1)" : "";
            card.style.backgroundColor = dark ? BLACK : WHITE;
            if (cap) {
                cap.textContent = asset.id;
            }
        }

        flipCard(i) {
            const { card } = this.cards[i];
            if (!card || !document.body.contains(card)) {
                this.stopLoop();
                return;
            }

            this.activeAssets[i] = this.getNextAsset();
            this.dark[i] = !this.dark[i];
            this.renderCard(i);
        }

        startLoop() {
            this.stopLoop();
            // Diagonal order: card 1, 3, 5, then 2, 4, 6.
            const cardOrder = [0, 2, 4, 1, 3, 5];
            const interval = setInterval(() => {
                this.flipCard(cardOrder[this.beat]);
                this.beat = (this.beat + 1) % CARD_COUNT;
            }, BEAT_MS);
            timers.push(interval);
        }

        stopLoop() {
            timers.forEach((t) => { clearTimeout(t); clearInterval(t); });
            timers = [];
        }
    }

    let activeInstance = null;

    function onVisibilityChange() {
        if (!activeInstance) return;
        if (document.hidden) {
            activeInstance.stopLoop();
        } else {
            activeInstance.startLoop();
        }
    }

    window.initMayaSlideshow = function () {
        if (activeInstance) {
            activeInstance.stopLoop();
            activeInstance = null;
        }
        document.removeEventListener("visibilitychange", onVisibilityChange);
        if (!document.getElementById("maya-card-1")) return;
        activeInstance = new MayaFlippers();
        document.addEventListener("visibilitychange", onVisibilityChange);
    };

    window.stopMayaSlideshow = function () {
        document.removeEventListener("visibilitychange", onVisibilityChange);
        if (activeInstance) {
            activeInstance.stopLoop();
            activeInstance = null;
        }
    };
})();
