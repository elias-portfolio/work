(function () {
    function initCompare(root) {
        const before = root.querySelector(".maya-compare-before");
        if (!before) return;

        const setPosition = (clientX) => {
            const rect = root.getBoundingClientRect();
            const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
            before.style.width = percent + "%";
            root.style.setProperty("--maya-compare-position", percent + "%");
            root.setAttribute("aria-valuenow", String(Math.round(percent)));
        };

        const move = (event) => {
            if (event.pointerId !== undefined && event.buttons === 0) return;
            setPosition(event.clientX);
        };

        root.addEventListener("pointerdown", (event) => {
            root.setPointerCapture?.(event.pointerId);
            setPosition(event.clientX);
        });
        root.addEventListener("pointermove", move);
        root.addEventListener("keydown", (event) => {
            const current = Number(root.getAttribute("aria-valuenow")) || 50;
            if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
                event.preventDefault();
                setPositionFromValue(current - 5);
            } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
                event.preventDefault();
                setPositionFromValue(current + 5);
            } else if (event.key === "Home") {
                event.preventDefault();
                setPositionFromValue(0);
            } else if (event.key === "End") {
                event.preventDefault();
                setPositionFromValue(100);
            }
        });

        function setPositionFromValue(value) {
            const percent = Math.max(0, Math.min(100, value));
            before.style.width = percent + "%";
            root.style.setProperty("--maya-compare-position", percent + "%");
            root.setAttribute("aria-valuenow", String(Math.round(percent)));
        }

        setPositionFromValue(Number(root.getAttribute("aria-valuenow")) || 50);
    }

    window.initMayaCompare = function () {
        document.querySelectorAll("[data-maya-compare]").forEach(initCompare);
    };
})();
