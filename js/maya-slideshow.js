/**
 * Maya Dual Asynchronous Auto-Flipping Glyph Cards
 * Flips every 500ms out-of-sync (offset by 250ms) with randomized PrettyColors backgrounds.
 */

(function () {
    const GLYPHS = [{"id": "T100", "file": "bauhaus_glyph_000100.svg"}, {"id": "T101", "file": "bauhaus_glyph_000101.svg"}, {"id": "T200", "file": "bauhaus_glyph_000200.svg"}, {"id": "T300", "file": "bauhaus_glyph_000300.svg"}, {"id": "T301", "file": "bauhaus_glyph_000301.svg"}, {"id": "T302", "file": "bauhaus_glyph_000302.svg"}, {"id": "T400", "file": "bauhaus_glyph_000400.svg"}, {"id": "T500", "file": "bauhaus_glyph_000500.svg"}, {"id": "T600", "file": "bauhaus_glyph_000600.svg"}, {"id": "T700", "file": "bauhaus_glyph_000700.svg"}, {"id": "T800", "file": "bauhaus_glyph_000800.svg"}, {"id": "T900", "file": "bauhaus_glyph_000900.svg"}, {"id": "T1000", "file": "bauhaus_glyph_001000.svg"}, {"id": "T1100", "file": "bauhaus_glyph_001100.svg"}, {"id": "T1200", "file": "bauhaus_glyph_001200.svg"}, {"id": "T1201", "file": "bauhaus_glyph_001201.svg"}, {"id": "T1300", "file": "bauhaus_glyph_001300.svg"}, {"id": "T1301", "file": "bauhaus_glyph_001301.svg"}, {"id": "T1302", "file": "bauhaus_glyph_001302.svg"}, {"id": "T1303", "file": "bauhaus_glyph_001303.svg"}, {"id": "T1400", "file": "bauhaus_glyph_001400.svg"}, {"id": "T1500", "file": "bauhaus_glyph_001500.svg"}, {"id": "T1501", "file": "bauhaus_glyph_001501.svg"}, {"id": "T1600", "file": "bauhaus_glyph_001600.svg"}, {"id": "T1601", "file": "bauhaus_glyph_001601.svg"}];
    const PRETTY_COLORS = ["#FFADD9", "#F0BB0F", "#AAA6FF", "#FCCAFF", "#FF5983", "#46B995", "#9AF1F0", "#B1C750", "#FFD187", "#A7DBA8", "#8DA5C9", "#B57C4A", "#56E179", "#A9EAB1", "#31D629", "#C377FD", "#FFD1F5", "#B8B016", "#1FE0C0", "#E67C98", "#A2ACDD", "#BA9740", "#BA8145", "#8FAAD9", "#04FBEF", "#A4B5F9", "#FF75AC", "#34D5AA", "#D2FB04", "#68C738", "#49A8B6", "#9184B5", "#FF9175", "#D1A89F", "#FF8F1F", "#7476FF", "#54FE16", "#F5C2BC", "#20DF79", "#FFDB8F", "#EDACED", "#FFB012", "#FEAAAE", "#14EB63", "#22DD32", "#BBB8FF", "#FFB330", "#19E691", "#04FB14", "#FFD1D5", "#53AC75", "#53AC87", "#2FD0B2", "#80C837", "#53AC5F", "#CFAA30", "#FC6C64", "#91A45B", "#01FE12", "#FF9F05", "#9BA758", "#C6BE00", "#FCFF38", "#60CC76", "#F676C5", "#16C3E9", "#F7FF02", "#FFF3A4", "#8D7BAB", "#5AAA55", "#FFA120", "#4DA3B3", "#EED111", "#EDDA8C", "#EEABDB", "#4EB188", "#17FFA6", "#E17837", "#FF4FDC", "#D0B22F", "#09DDEC", "#EC9DD4", "#DEC4FF", "#F3F8A5", "#A48D00", "#F98ABC", "#FC7D97", "#FFEF7C", "#6ED4CF", "#729BFF", "#20DF20", "#39C0BA", "#1CE326", "#48BD42", "#927AC2", "#25DA37", "#519AFB", "#C99797", "#F2DDBB", "#6BFFAE", "#19E668", "#F7C67D", "#40BFB5", "#C3FF87", "#A2FFCF", "#FF9514", "#14B9EB", "#C4FFB0", "#81B885", "#42BD7B", "#1BD7E4", "#FFCFCF", "#D37945", "#A1FFCE", "#B0AC82", "#21A2DE", "#57FFB0", "#A4835B", "#FFED20", "#FF8842", "#73BAAA", "#5ABA70", "#50EDE0", "#3BC4BD", "#DD9522", "#B5884A", "#FFA545", "#C4F198", "#F78708", "#6BFF53", "#44BB85", "#5DA389", "#9BBA54", "#B5D02F", "#FFBD2E", "#52ADAA", "#FFBDD9", "#BFECED", "#44BB48", "#D6C829", "#FFB82B", "#FFC585", "#957AB6", "#12B1FF", "#0DB5F2", "#F2CFAC", "#FF85B4", "#51B6B8", "#FFE596", "#C8A8FF", "#8CFF00", "#F58600", "#91D728", "#B9E7AD", "#A782C9", "#5EFFC7", "#8C98DE", "#C9C203", "#FF34CC", "#AFFF60", "#FFD61F", "#B09ECC", "#3E9CC1", "#FFBAF7", "#7AC92C", "#63B54A", "#B2D260", "#28D7C3", "#D2EF4D", "#00CDB3", "#9FDF20", "#28D7C0", "#7A9867", "#E0778C", "#EDF575", "#FF7575", "#B3FFCF", "#3CC3C3", "#10F9BF", "#E5A3E6", "#FF40D2", "#AFF0F0", "#52FF11", "#FFDF4F", "#CBD9A5", "#33CC36", "#66DE26", "#89DE21", "#18E7E7", "#E07415", "#59AFFF", "#A5FE8A", "#F15BA3", "#98C757", "#7B9669", "#FF31EC", "#2FBEDA", "#41BE6B", "#E68E90", "#FF6A4D", "#FFEE0E", "#14D5EB", "#FFE49C", "#F9E977", "#E2791D", "#86E619", "#03FCE3", "#40BF4F", "#40ACB8", "#D58A34", "#26BA9F", "#FFA8F6", "#DF4ABA", "#D1C0A1", "#06F95B", "#4AB5A0", "#51FB00", "#45BA60", "#63C639", "#5EA16B", "#FFFC2E", "#13ECB6", "#FFCCE1", "#C9E3AA", "#D2FF0B", "#BAFF57", "#8CFAC7", "#90CACB", "#09F68F", "#C3C13C", "#A4AF50", "#FFC7CE", "#2FA0D0", "#4896FF", "#26D950", "#03FC90", "#88AC53", "#FFC7C9", "#52AD5F", "#42E01F", "#53AC77", "#30C9FF", "#25DA2B", "#44BB74", "#F68D04", "#FFE966", "#BAD22D", "#FEAFC5", "#FF78B7", "#67F0FF", "#1CE31F", "#C5A97D", "#609F65", "#BF8840", "#98B4D4", "#F6EA09", "#D3A288", "#D8FF99", "#52AD90", "#23A5CD", "#22FF23", "#20DFB3", "#3BC4C0", "#A87DE8", "#78D9A2", "#FF38CD", "#AFE85A", "#0AFF8D", "#00B3FF", "#67988B", "#1CE35B", "#F2CB77", "#F696FF", "#33CCCC", "#B88A84", "#7CA2D6", "#EC93BE", "#FA97FC", "#81A869", "#42BD96", "#00EC60", "#BEED12", "#88B54A", "#DE7C31", "#ACD926", "#11EEAC", "#95C940", "#01FE90", "#FF8D36", "#1BE472", "#29F8FF", "#19E65E", "#ADDAFF", "#C7FC82", "#FFBAB3", "#C1F6F0", "#B7E718", "#D8FFA8", "#4AA0B5", "#01DCFE", "#E2989A", "#4DFFF9", "#50A4AF", "#22DDDD", "#C2FFE8", "#4FFF92", "#29D67D", "#F6B7F5", "#FFE016", "#ECCB13", "#43C639", "#BFFF23", "#5DE3DE", "#FF8D5C", "#26BF9C", "#5EA197", "#E3FFBF", "#4EE8FF", "#C86F37", "#06E0FF", "#C2FFFF", "#ECC813", "#F59F00", "#8CAA55", "#2FD095", "#FFCCF8", "#94FFBB", "#7DFF98", "#18E798", "#DFD220", "#AADFD9", "#96FFEA", "#09EEF6", "#A86EFF", "#FF547C", "#FF6BFF", "#99D5FF", "#5BB0FF", "#2FD03F", "#F2930D", "#0AF5CA", "#1DE289", "#B9DEEF", "#EEB4CC", "#B88EFA", "#11EE8B", "#B8BA45", "#00B2E8", "#FFEDAB", "#12F10E", "#FFA87D", "#C7919B", "#D17B99", "#26DFE8", "#94FFB4", "#FF7D7D", "#ECFF6C", "#FFA899", "#CD6EFF", "#FA75FF"];

    let timer1 = null;
    let timer2 = null;
    let timeout2 = null;

    class DualMayaFlippers {
        constructor() {
            this.card1 = document.getElementById("maya-card-1");
            this.img1 = document.getElementById("maya-img-1");
            this.cap1 = document.getElementById("maya-caption-1");

            this.card2 = document.getElementById("maya-card-2");
            this.img2 = document.getElementById("maya-img-2");
            this.cap2 = document.getElementById("maya-caption-2");

            if (!this.card1 || !this.img1 || !this.card2 || !this.img2) return;

            this.activeGlyph1 = 0;
            this.activeGlyph2 = 1;
            this.activeColor1 = PRETTY_COLORS[0];
            this.activeColor2 = PRETTY_COLORS[1];

            this.initCard(1, this.activeGlyph1, this.activeColor1);
            this.initCard(2, this.activeGlyph2, this.activeColor2);

            this.startLoop();
        }

        getRandomGlyphIndex(excludeIndices) {
            let idx;
            do {
                idx = Math.floor(Math.random() * GLYPHS.length);
            } while (excludeIndices.includes(idx) && GLYPHS.length > excludeIndices.length);
            return idx;
        }

        getRandomColor(excludeColors) {
            let c;
            do {
                c = PRETTY_COLORS[Math.floor(Math.random() * PRETTY_COLORS.length)];
            } while (excludeColors.includes(c) && PRETTY_COLORS.length > excludeColors.length);
            return c;
        }

        initCard(cardNum, glyphIdx, color) {
            const card = cardNum === 1 ? this.card1 : this.card2;
            const img = cardNum === 1 ? this.img1 : this.img2;
            const cap = cardNum === 1 ? this.cap1 : this.cap2;
            const glyph = GLYPHS[glyphIdx];

            card.style.backgroundColor = color;
            img.src = "maya/references/svg/" + glyph.file;
            if (cap) cap.textContent = `${glyph.id} • ${color}`;
        }

        flipCard(cardNum) {
            const card = cardNum === 1 ? this.card1 : this.card2;
            const img = cardNum === 1 ? this.img1 : this.img2;
            const cap = cardNum === 1 ? this.cap1 : this.cap2;

            if (!card || !img || !document.body.contains(card)) {
                this.stopLoop();
                return;
            }

            const otherGlyph = cardNum === 1 ? this.activeGlyph2 : this.activeGlyph1;
            const currentGlyph = cardNum === 1 ? this.activeGlyph1 : this.activeGlyph2;
            const otherColor = cardNum === 1 ? this.activeColor2 : this.activeColor1;
            const currentColor = cardNum === 1 ? this.activeColor1 : this.activeColor2;

            const nextGlyphIdx = this.getRandomGlyphIndex([currentGlyph, otherGlyph]);
            const nextColor = this.getRandomColor([currentColor, otherColor]);

            if (cardNum === 1) {
                this.activeGlyph1 = nextGlyphIdx;
                this.activeColor1 = nextColor;
            } else {
                this.activeGlyph2 = nextGlyphIdx;
                this.activeColor2 = nextColor;
            }

            const nextGlyph = GLYPHS[nextGlyphIdx];

            // Quick smooth transition
            img.style.opacity = "0.2";
            img.style.transform = "scale(0.94)";

            setTimeout(() => {
                if (!document.body.contains(card)) return;
                img.src = "maya/references/svg/" + nextGlyph.file;
                card.style.backgroundColor = nextColor;
                if (cap) cap.textContent = `${nextGlyph.id} • ${nextColor}`;
                img.style.opacity = "1";
                img.style.transform = "scale(1)";
            }, 70);
        }

        startLoop() {
            this.stopLoop();

            // Card 1 flips every 500ms starting at t = 500ms
            timer1 = setInterval(() => {
                this.flipCard(1);
            }, 500);

            // Card 2 flips every 500ms, offset by 250ms so they flip out of sync
            timeout2 = setTimeout(() => {
                this.flipCard(2);
                timer2 = setInterval(() => {
                    this.flipCard(2);
                }, 500);
            }, 250);
        }

        stopLoop() {
            if (timer1) { clearInterval(timer1); timer1 = null; }
            if (timer2) { clearInterval(timer2); timer2 = null; }
            if (timeout2) { clearTimeout(timeout2); timeout2 = null; }
        }
    }

    let activeInstance = null;

    window.initMayaSlideshow = function () {
        if (activeInstance) {
            activeInstance.stopLoop();
            activeInstance = null;
        }
        const c1 = document.getElementById("maya-card-1");
        const c2 = document.getElementById("maya-card-2");
        if (!c1 || !c2) return;
        activeInstance = new DualMayaFlippers();
    };

    window.stopMayaSlideshow = function () {
        if (activeInstance) {
            activeInstance.stopLoop();
            activeInstance = null;
        }
    };
})();
