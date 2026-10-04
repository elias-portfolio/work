/** Edmon section: the illustration cycles on its own every three seconds. */

(() => {
    const ROTATE_MS = 3000;
    const ASSET_STATUS_TIMEOUT_MS = 30000;
    const ILLUSTRATIONS = ['cooler.jpg', 'illustration-1.jpg', 'illustration-2.jpg', 'illustration-3.jpg'];
    let cleanup = () => {};

    /**
     * The GLB logo and the software box take a while to arrive. Keep a subtle
     * "Loading asset" note on top of them until the real asset is ready.
     */
    function watchAssetStatus(section) {
        const disposers = [];
        section.querySelectorAll('[data-edmon-status]').forEach((status) => {
            const kind = status.dataset.edmonStatus;
            const target = kind === 'glb'
                ? section.querySelector('model-viewer')
                : section.querySelector('[data-edmon-asset]');
            const listeners = [];
            let settled = false;
            let timer = null;
            const settle = () => {
                if (settled) return;
                settled = true;
                if (timer) clearTimeout(timer);
                status.classList.add('is-loaded');
            };
            if (!target) {
                settle();
            } else if (kind === 'glb' && target.loaded) {
                settle();
            } else if (kind === 'box' && target.complete && target.naturalWidth > 0) {
                settle();
            } else {
                const listen = (type) => {
                    const handler = () => settle();
                    target.addEventListener(type, handler);
                    listeners.push([type, handler]);
                };
                listen('load');
                listen('error');
                if (typeof target.decode === 'function') {
                    // decode() settles once the pixels can actually be painted.
                    try {
                        Promise.resolve(target.decode()).then(settle, settle);
                    } catch {
                        settle();
                    }
                }
                timer = setTimeout(settle, ASSET_STATUS_TIMEOUT_MS);
            }
            disposers.push(() => {
                if (timer) clearTimeout(timer);
                listeners.forEach(([type, handler]) => target.removeEventListener(type, handler));
            });
        });
        return () => disposers.forEach((dispose) => dispose());
    }

    /** Auto-advance the illustration; no controls, no manual stepping. */
    function startIllustrationCycle(root) {
        const stage = root.querySelector('.edmon-logo-stage') || root;
        let image = stage.querySelector('img');
        if (!image) return () => {};
        // Reduced-motion users keep the first illustration; nothing is forced on them.
        const still = typeof window.matchMedia === 'function'
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const cache = new Map();
        let index = 0, busy = false, disposed = false, visible = false, timer = null;

        const update = () => {
            clearInterval(timer);
            timer = null;
            if (!disposed && !still && visible && !document.hidden) timer = setInterval(advance, ROTATE_MS);
        };

        async function advance() {
            if (busy || disposed) return;
            busy = true;
            const target = (index + 1) % ILLUSTRATIONS.length;
            try {
                let ready = cache.get(target);
                if (!ready) {
                    ready = new Image();
                    ready.src = 'images/edmon/' + ILLUSTRATIONS[target];
                    await ready.decode();
                }
                if (disposed || !root.isConnected || !visible || document.hidden) return;
                ready.alt = target === 0
                    ? 'Illustration of three colleagues gathered around an office water cooler'
                    : 'Edmon illustration ' + (target + 1);
                image.replaceWith(ready);
                cache.set(index, image);
                image = ready;
                index = target;
            } catch {
                // Preserve the displayed image if loading fails; allow another attempt.
            } finally {
                busy = false;
                if (!disposed) update();
            }
        }

        const observer = typeof IntersectionObserver === 'function'
            ? new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); })
            : null;
        if (observer) observer.observe(root);
        else visible = true;
        document.addEventListener('visibilitychange', update);
        update();

        return () => {
            disposed = true;
            clearInterval(timer);
            if (observer) observer.disconnect();
            document.removeEventListener('visibilitychange', update);
            cache.clear();
        };
    }

    window.stopEdmonSlideshow = () => cleanup();
    window.initEdmonSlideshow = () => {
        cleanup();
        const section = document.querySelector('.edmon-patterns');
        if (!section) {
            cleanup = () => {};
            return;
        }
        const stops = [watchAssetStatus(section)];
        const root = section.querySelector('.edmon-illustration-card');
        if (root) stops.push(startIllustrationCycle(root));
        cleanup = () => {
            stops.forEach((stop) => stop());
            cleanup = () => {};
        };
    };
})();
