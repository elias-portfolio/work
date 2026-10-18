/**
 * Maya case: the card rows drift sideways, forever, at the reference tempo.
 * kraum.co measured 117 px of drift in 3.8 s (~31 px/s), so the shift advances 31 px per second.
 *
 * Each row carries one copy of itself. The copy takes a face from the shared pool that no card is
 * showing, so a twin and its copy never display the same glyph at the same time. A row recycles
 * its first (or last) cell into the other end of the track as soon as it has moved one full cell,
 * in the same frame as the offset reset, so the loop has no seam.
 */

(function () {
    const DRIFT_PX_PER_SECOND = 31;
    const FALLBACK_COLUMNS = 3;
    const ROW = 'maya-row';
    const ROW_ALT = 'maya-row-alt';
    const TRACK = 'maya-row-track';
    const CLONE = 'maya-row-clone';
    const GAP_VAR = '--maya-row-gap';
    const RESIZE_DEBOUNCE_MS = 150;
    const MAX_FRAME_SECONDS = 0.05;

    let grid = null;
    let observer = null;
    let resizeTimer = null;
    let syncFrame = 0;
    let frame = 0;
    let lastTime = 0;
    let cursor = 0;
    let rows = [];

    /** Live column count, so "a row" means the same thing on desktop and on a phone. */
    function columns() {
        if (!grid) return FALLBACK_COLUMNS;
        const template = window.getComputedStyle(grid).gridTemplateColumns;
        const count = template && template !== 'none' ? template.trim().split(/\s+/).length : 0;
        return count > 0 ? count : FALLBACK_COLUMNS;
    }

    function gap() {
        const value = grid ? parseFloat(window.getComputedStyle(grid).getPropertyValue(GAP_VAR)) : NaN;
        return Number.isFinite(value) ? value : 14;
    }

    /** Reduced motion keeps every row still: the first three cards stay in place. */
    function reducedMotion() {
        return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function pool() {
        return Array.isArray(window.mayaAssetPool) ? window.mayaAssetPool : [];
    }

    /** Next face in the shared pool that no card is showing, advanced from the last pick. */
    function freeFace(used) {
        const faces = pool();
        for (let step = 0; step < faces.length; step++) {
            const index = (cursor + step) % faces.length;
            if (!used.has(faces[index])) {
                cursor = (index + 1) % faces.length;
                return faces[index];
            }
        }
        return '';
    }

    /**
     * The slideshow keeps swapping faces and polarity, so every copy follows its twin.
     * Each copy takes a face from the shared pool that no visible card is using, which keeps a
     * twin and its copy from ever showing the same glyph on screen. Polarity follows the twin
     * immediately, so a row always reads as one stripe: white rows stay white, black rows black.
     */
    function sync() {
        syncFrame = 0;
        const faces = pool();
        const used = new Set();
        rows.forEach((state) => {
            const items = Array.from(state.track.children);
            const half = Math.floor(items.length / 2);
            for (let i = 0; i < half; i++) {
                const img = items[i].querySelector('img');
                const face = img ? img.getAttribute('src') : '';
                if (face) used.add(face);
            }
        });
        rows.forEach((state) => {
            const items = Array.from(state.track.children);
            const half = Math.floor(items.length / 2);
            for (let i = 0; i < half; i++) {
                const source = items[i];
                const target = items[i + half];
                if (!target) continue;
                const sourceCard = source.querySelector('[id^="maya-card"]');
                const targetCard = target.querySelector('[id^="maya-card"]');
                const background = sourceCard ? sourceCard.style.backgroundColor : '';
                if (targetCard && background && targetCard.style.backgroundColor !== background) {
                    targetCard.style.backgroundColor = background;
                }
                const targetImg = target.querySelector('img');
                if (!targetImg || !faces.length) continue;
                let face = targetImg.getAttribute('src') || '';
                if (!face || used.has(face)) face = freeFace(used);
                if (!face) continue;
                used.add(face);
                if (targetImg.getAttribute('src') !== face) targetImg.setAttribute('src', face);
                const dark = background === '#000000' || background === 'rgb(0, 0, 0)';
                const filter = dark ? 'invert(1)' : '';
                if (targetImg.style.filter !== filter) targetImg.style.filter = filter;
            }
        });
    }

    function scheduleSync() {
        if (syncFrame || typeof requestAnimationFrame !== 'function') return;
        syncFrame = requestAnimationFrame(sync);
    }

    /** One cell of a row, plus the gap that follows it. */
    function measure(columnsCount) {
        const space = gap();
        rows.forEach((state) => {
            const width = state.row.clientWidth;
            state.itemWidth = Math.max(1, Math.floor((width - space * (columnsCount - 1)) / columnsCount));
            state.stride = state.itemWidth + space;
            state.row.style.setProperty('--maya-item-width', state.itemWidth + 'px');
        });
    }

    function recycle(state) {
        if (state.direction > 0) state.track.insertBefore(state.track.lastElementChild, state.track.firstElementChild);
        else state.track.appendChild(state.track.firstElementChild);
    }

    function draw(state) {
        const offset = state.direction > 0 ? state.shift - state.stride : -state.shift;
        state.track.style.transform = 'translateX(' + offset.toFixed(2) + 'px)';
    }

    function tick(now) {
        frame = requestAnimationFrame(tick);
        if (!lastTime) {
            lastTime = now;
            return;
        }
        const seconds = Math.min(MAX_FRAME_SECONDS, (now - lastTime) / 1000);
        lastTime = now;
        rows.forEach((state) => {
            state.shift += DRIFT_PX_PER_SECOND * seconds;
            if (state.shift >= state.stride) {
                state.shift -= state.stride;
                recycle(state);
            }
            draw(state);
        });
    }

    function startLoop() {
        if (frame || typeof requestAnimationFrame !== 'function' || reducedMotion()) return;
        lastTime = 0;
        frame = requestAnimationFrame(tick);
    }

    function stopLoop() {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
    }

    function build() {
        const columnsCount = columns();
        const figures = Array.from(grid.children).filter((child) => child.tagName === 'FIGURE');
        if (!figures.length) return;
        rows = [];
        let rowIndex = 0;
        for (let start = 0; start < figures.length; start += columnsCount) {
            const slice = figures.slice(start, start + columnsCount);
            const row = document.createElement('div');
            row.className = rowIndex % 2 === 1 ? ROW + ' ' + ROW_ALT : ROW;
            const track = document.createElement('div');
            track.className = TRACK;
            slice.forEach((figure) => track.appendChild(figure));
            slice.forEach((figure) => {
                const clone = figure.cloneNode(true);
                clone.classList.add(CLONE);
                clone.setAttribute('aria-hidden', 'true');
                clone.removeAttribute('id');
                track.appendChild(clone);
            });
            row.appendChild(track);
            grid.appendChild(row);
            rows.push({ row, track, direction: rowIndex % 2 === 1 ? 1 : -1, shift: 0, stride: 0, itemWidth: 0 });
            rowIndex++;
        }
        measure(columnsCount);
        rows.forEach(draw);
    }

    function teardown() {
        stopLoop();
        rows = [];
        if (!grid) return;
        grid.querySelectorAll('.' + ROW).forEach((row) => {
            const track = row.querySelector('.' + TRACK);
            if (track) {
                Array.from(track.children).forEach((item) => {
                    if (item.classList.contains(CLONE)) {
                        item.remove();
                        return;
                    }
                    grid.appendChild(item);
                });
            }
            row.remove();
        });
    }

    function onResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (!grid) return;
            teardown();
            build();
            // The new column count changes which cards form a row, so colours are re-grouped first.
            if (typeof window.mayaSyncPolarity === 'function') window.mayaSyncPolarity();
            sync();
            startLoop();
        }, RESIZE_DEBOUNCE_MS);
    }

    function stop() {
        clearTimeout(resizeTimer);
        resizeTimer = null;
        if (syncFrame) cancelAnimationFrame(syncFrame);
        syncFrame = 0;
        if (observer) observer.disconnect();
        observer = null;
        window.removeEventListener('resize', onResize);
        teardown();
        grid = null;
    }

    window.initMayaRows = function () {
        stop();
        const display = document.getElementById('content-display');
        if (!display || !document.getElementById('maya-card-1')) return;
        grid = display.querySelector('.maya-card-grid');
        if (!grid) return;
        build();
        if (typeof MutationObserver !== 'undefined') {
            observer = new MutationObserver(scheduleSync);
            observer.observe(grid, { subtree: true, childList: true, attributes: true, attributeFilter: ['src', 'style'] });
        }
        sync();
        window.addEventListener('resize', onResize);
        startLoop();
    };

    window.stopMayaRows = stop;
})();
