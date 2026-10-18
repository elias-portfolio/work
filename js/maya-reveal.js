/** Maya case: every row slides in from the side, alternating right and left. */

(function () {
    const REVEAL = 'maya-reveal';
    const FROM_LEFT = 'maya-reveal-from-left';
    const VISIBLE = 'maya-reveal-visible';
    const SCOPE = 'maya-reveal-active';
    const RESIZE_DEBOUNCE_MS = 150;
    /** Rows start a little inside the viewport so the slide is seen, not missed. */
    const ENTER = { rootMargin: '0px 0px -8% 0px', threshold: 0.15 };

    const revealed = new WeakSet();
    let observer = null;
    /** Both nodes carry the clipping class; #content-display also holds the rows. */
    let scopes = [];
    let container = null;
    let resizeTimer = null;

    /**
     * Grid items sharing a top edge are one row; every other block is its own row.
     * Keeping the walk in document order keeps the left/right alternation steady.
     */
    function rowUnits(display) {
        const units = [];
        const grid = display.querySelector('.maya-card-grid');
        Array.from(display.children).forEach((child) => {
            if (child === grid) {
                let row = null;
                let top = null;
                Array.from(child.children).forEach((item) => {
                    const itemTop = Math.round(item.offsetTop);
                    if (!row || itemTop !== top) {
                        row = [];
                        top = itemTop;
                        units.push(row);
                    }
                    row.push(item);
                });
                return;
            }
            if (!child.textContent.trim()) return;
            units.push([child]);
        });
        return units;
    }

    function show(element) {
        revealed.add(element);
        element.classList.add(VISIBLE);
        if (observer) observer.unobserve(element);
    }

    function onIntersect(entries) {
        entries.forEach((entry) => {
            if (entry.isIntersecting) show(entry.target);
        });
    }

    function layout() {
        if (!container || !observer) return;
        rowUnits(container).forEach((unit, index) => {
            const fromLeft = index % 2 === 1;
            unit.forEach((element) => {
                element.classList.add(REVEAL);
                element.classList.toggle(FROM_LEFT, fromLeft);
                if (revealed.has(element)) {
                    element.classList.add(VISIBLE);
                    return;
                }
                observer.observe(element);
            });
        });
    }

    function onResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(layout, RESIZE_DEBOUNCE_MS);
    }

    function stop() {
        clearTimeout(resizeTimer);
        resizeTimer = null;
        if (observer) observer.disconnect();
        observer = null;
        window.removeEventListener('resize', onResize);
        scopes.forEach((element) => element.classList.remove(SCOPE));
        scopes = [];
        container = null;
    }

    window.initMayaReveal = function () {
        stop();
        if (typeof IntersectionObserver === 'undefined') return;
        const display = document.getElementById('content-display');
        const media = document.getElementById('media');
        if (!display || !media || !document.getElementById('maya-card-1')) return;
        scopes = [media, display];
        container = display;
        scopes.forEach((element) => element.classList.add(SCOPE));
        observer = new IntersectionObserver(onIntersect, ENTER);
        layout();
        // Commit the hidden start state, so rows already in view still animate in.
        void display.offsetWidth;
        window.addEventListener('resize', onResize);
    };

    window.stopMayaReveal = stop;
})();
