(() => {
    let cleanup = () => {};
    window.stopEdmonSlideshow = () => cleanup();
    window.initEdmonSlideshow = () => {
        cleanup();
        const root = document.querySelector('.edmon-illustration-card');
        if (!root) return;
        let image = root.querySelector('img');
        const next = root.querySelector('[data-edmon-next]');
        const pause = root.querySelector('[data-edmon-pause]');
        const count = root.querySelector('[data-edmon-count]');
        const sources = ['cooler.jpg', 'illustration-1.jpg', 'illustration-2.jpg', 'illustration-3.jpg'];
        const cache = new Map();
        let index = 0, busy = false, disposed = false, visible = false;
        let paused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let timer;
        const update = () => {
            clearInterval(timer);
            pause.textContent = paused ? 'Play' : 'Pause';
            if (!paused && visible && !document.hidden && !disposed) timer = setInterval(() => advance(false), 4500);
        };
        async function advance(manual) {
            if (busy || disposed) return;
            busy = true;
            const target = (index + 1) % sources.length;
            try {
                let ready = cache.get(target);
                if (!ready) {
                    ready = new Image();
                    ready.src = 'images/edmon/' + sources[target];
                    await ready.decode();
                    cache.set(target, ready);
                }
                if (disposed || !root.isConnected || (!manual && (paused || !visible || document.hidden))) return;
                ready.alt = target === 0 ? 'Illustration of three colleagues gathered around an office water cooler' : 'Edmon illustration ' + (target + 1);
                image.replaceWith(ready);
                cache.set(index, image);
                image = ready;
                index = target;
                count.textContent = (index + 1) + ' / ' + sources.length;
            } catch {
                // Preserve the displayed image if loading fails; allow another attempt.
            } finally {
                busy = false;
                if (!disposed) update();
            }
        }
        const onNext = () => advance(true);
        const onPause = () => { paused = !paused; update(); };
        const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
        observer.observe(root);
        next.addEventListener('click', onNext);
        pause.addEventListener('click', onPause);
        document.addEventListener('visibilitychange', update);
        update();
        cleanup = () => {
            disposed = true;
            clearInterval(timer);
            observer.disconnect();
            next.removeEventListener('click', onNext);
            pause.removeEventListener('click', onPause);
            document.removeEventListener('visibilitychange', update);
            cache.clear();
        };
    };
})();
