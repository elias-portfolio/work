/** Lightweight two-layer Maya card slideshow. */

(function () {
    const GLYPHS = [{"id": "T100", "file": "bauhaus_glyph_000100.svg"}, {"id": "T101", "file": "bauhaus_glyph_000101.svg"}, {"id": "T200", "file": "bauhaus_glyph_000200.svg"}, {"id": "T300", "file": "bauhaus_glyph_000300.svg"}, {"id": "T301", "file": "bauhaus_glyph_000301.svg"}, {"id": "T302", "file": "bauhaus_glyph_000302.svg"}, {"id": "T400", "file": "bauhaus_glyph_000400.svg"}, {"id": "T500", "file": "bauhaus_glyph_000500.svg"}, {"id": "T600", "file": "bauhaus_glyph_000600.svg"}, {"id": "T700", "file": "bauhaus_glyph_000700.svg"}, {"id": "T800", "file": "bauhaus_glyph_000800.svg"}, {"id": "T900", "file": "bauhaus_glyph_000900.svg"}, {"id": "T1000", "file": "bauhaus_glyph_001000.svg"}, {"id": "T1100", "file": "bauhaus_glyph_001100.svg"}, {"id": "T1200", "file": "bauhaus_glyph_001200.svg"}, {"id": "T1201", "file": "bauhaus_glyph_001201.svg"}, {"id": "T1300", "file": "bauhaus_glyph_001300.svg"}, {"id": "T1301", "file": "bauhaus_glyph_001301.svg"}, {"id": "T1302", "file": "bauhaus_glyph_001302.svg"}, {"id": "T1303", "file": "bauhaus_glyph_001303.svg"}, {"id": "T1400", "file": "bauhaus_glyph_001400.svg"}, {"id": "T1500", "file": "bauhaus_glyph_001500.svg"}, {"id": "T1501", "file": "bauhaus_glyph_001501.svg"}, {"id": "T1600", "file": "bauhaus_glyph_001600.svg"}, {"id": "T1601", "file": "bauhaus_glyph_001601.svg"}, {"id": "T1602", "file": "bauhaus_glyph_001602.svg"}, {"id": "T1700", "file": "bauhaus_glyph_001700.svg"}, {"id": "T1701", "file": "bauhaus_glyph_001701.svg"}, {"id": "T1702", "file": "bauhaus_glyph_001702.svg"}, {"id": "T1705", "file": "bauhaus_glyph_001705.svg"}, {"id": "T1800", "file": "bauhaus_glyph_001800.svg"}, {"id": "T1900", "file": "bauhaus_glyph_001900.svg"}, {"id": "T1901", "file": "bauhaus_glyph_001901.svg"}, {"id": "T2000", "file": "bauhaus_glyph_002000.svg"}, {"id": "T2100", "file": "bauhaus_glyph_002100.svg"}, {"id": "T2101", "file": "bauhaus_glyph_002101.svg"}, {"id": "T2104", "file": "bauhaus_glyph_002104.svg"}, {"id": "T2200", "file": "bauhaus_glyph_002200.svg"}, {"id": "T2300", "file": "bauhaus_glyph_002300.svg"}, {"id": "T2400", "file": "bauhaus_glyph_002400.svg"}, {"id": "T2500", "file": "bauhaus_glyph_002500.svg"}, {"id": "T2501", "file": "bauhaus_glyph_002501.svg"}, {"id": "T2600", "file": "bauhaus_glyph_002600.svg"}, {"id": "T2700", "file": "bauhaus_glyph_002700.svg"}];
    const IMAGE_ASSETS = ["t2", "t28", "t29", "t30", "t31", "t32", "t33", "t34", "t45", "t46", "t47", "t49", "t51", "t53", "t55", "t56"].map((id) => ({
        id: id.toUpperCase(),
        file: "images/maya/generated/" + id + ".webp",
        kind: "generated",
        alt: "Generated Maya sign study " + id.toUpperCase()
    }));

    const BLACK = "#000000";
    const WHITE = "#FFFFFF";
    const CARD_COUNT = 6;
    const BEAT_MS = 1500;
    const DARK_PHASE = [true, false, false, true, true, false];
    let timers = [];

    class MayaFlippers {
        constructor() {
            this.cards = [];
            for (let i = 1; i <= CARD_COUNT; i++) {
                const card = document.getElementById("maya-card-" + i);
                const front = document.getElementById("maya-img-" + i + "-a");
                const back = document.getElementById("maya-img-" + i + "-b");
                const cap = document.getElementById("maya-caption-" + i);
                if (!card || !front || !back) return;
                this.cards.push({ card, layers: [front, back], cap });
            }
            if (this.cards.length !== CARD_COUNT) return;

            const glyphAssets = GLYPHS.map((glyph) => ({
                id: glyph.id,
                file: "maya/references/svg/" + glyph.file,
                alt: "Maya glyph study " + glyph.id,
                kind: "glyph"
            }));
            this.cardQueues = this.buildCardQueues(glyphAssets);
            this.queueIndices = Array.from({ length: CARD_COUNT }, (_, index) => index % 2);
            this.activeAssets = this.cardQueues.map((queue, index) => queue[index % 2]);
            this.activeLayers = Array(CARD_COUNT).fill(0);
            this.dark = this.activeAssets.map((asset, index) => asset.kind === "generated" ? false : DARK_PHASE[index]);
            this.running = true;
            this.beat = 0;

            this.cards.forEach((_, index) => this.renderCard(index));
            this.startLoop();
        }

        buildCardQueues(glyphAssets) {
            return Array.from({ length: CARD_COUNT }, (_, cardIndex) => {
                const queue = [];
                for (let i = 0; i < glyphAssets.length; i++) {
                    queue.push(glyphAssets[(cardIndex + i) % glyphAssets.length]);
                    queue.push(IMAGE_ASSETS[(cardIndex + i) % IMAGE_ASSETS.length]);
                }
                return queue;
            });
        }

        getNextAsset(index) {
            const queue = this.cardQueues[index];
            this.queueIndices[index] = (this.queueIndices[index] + 1) % queue.length;
            return queue[this.queueIndices[index]];
        }

        renderCard(index) {
            const { card, layers, cap } = this.cards[index];
            const asset = this.activeAssets[index];
            const activeLayer = this.activeLayers[index];
            const layer = layers[activeLayer];
            layers.forEach((candidate, layerIndex) => {
                candidate.style.opacity = layerIndex === activeLayer ? "1" : "0";
            });
            layer.src = asset.file;
            layer.alt = asset.alt;
            layer.style.filter = this.dark[index] ? "invert(1)" : "";
            card.style.backgroundColor = this.dark[index] ? BLACK : WHITE;
            if (cap) cap.textContent = asset.id;
        }

        preload(asset, callback) {
            if (typeof Image !== "function") {
                callback();
                return;
            }
            const image = new Image();
            image.onload = callback;
            image.onerror = callback;
            image.src = asset.file;
        }

        flipCard(index) {
            const item = this.cards[index];
            if (!this.running || !item || !document.body.contains(item.card)) {
                this.stopLoop();
                return;
            }

            const nextAsset = this.getNextAsset(index);
            const nextLayerIndex = 1 - this.activeLayers[index];
            const nextLayer = item.layers[nextLayerIndex];
            this.preload(nextAsset, () => {
                if (!this.running || !document.body.contains(item.card)) return;

                nextLayer.src = nextAsset.file;
                nextLayer.alt = nextAsset.alt;
                nextLayer.style.filter = nextAsset.kind === "generated" ? "" : (this.dark[index] ? "" : "invert(1)");
                nextLayer.style.opacity = "0";
                item.card.classList.remove("is-flipping");
                void item.card.offsetWidth;
                item.card.classList.add("is-flipping");
                this.activeLayers[index] = nextLayerIndex;
                this.activeAssets[index] = nextAsset;
                this.dark[index] = nextAsset.kind === "generated" ? false : !this.dark[index];
                nextLayer.style.opacity = "1";
                item.layers[1 - nextLayerIndex].style.opacity = "0";
                item.card.style.backgroundColor = this.dark[index] ? BLACK : WHITE;
                if (item.cap) item.cap.textContent = nextAsset.id;
            });
        }

        startLoop() {
            this.stopLoop();
            this.running = true;
            const order = [0, 2, 4, 1, 3, 5];
            const interval = setInterval(() => {
                this.flipCard(order[this.beat]);
                this.beat = (this.beat + 1) % CARD_COUNT;
            }, BEAT_MS);
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
        activeInstance = new MayaFlippers();
        document.addEventListener("visibilitychange", onVisibilityChange);
    };

    window.stopMayaSlideshow = function () {
        document.removeEventListener("visibilitychange", onVisibilityChange);
        if (activeInstance) activeInstance.stopLoop();
        activeInstance = null;
    };
})();
