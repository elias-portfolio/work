(function () {
    const ELIAS_QUIZ_BOARD = [
        {
            category: 'ELIAS PORTFOLIO',
            clues: [
                {
                    value: 200,
                    clue: 'THIS PROJECT PLAYS LIVE RADIO FROM CITIES AROUND THE WORLD WHERE IT IS CURRENTLY 2 IN THE MORNING',
                    answer: 'WHAT IS 2.AM?'
                },
                {
                    value: 400,
                    clue: 'IN THIS 2024 EXHIBIT WITH ERIK KESSELS, VISITORS BROWSED RANDOMIZED FOUND ARTIFACTS FROM ACROSS THE CONTINENT',
                    answer: 'WHAT IS EUROPA ARCHIVE?'
                },
                {
                    value: 600,
                    clue: 'THIS AD FOR THE NATIONAL MILITARY MUSEUM LASTS ONLY AS LONG AS IT TAKES AN F-16 TO FLY 700 METERS',
                    answer: 'WHAT IS F-16 JET (NL)?'
                },
                {
                    value: 800,
                    clue: 'NOT LINEAR LIKE LATIN TEXT, CLASSIC MAYA WRITING COMBINES WHOLE-WORD SIGNS AND SYLLABLES INTO THESE SQUARE UNITS',
                    answer: 'WHAT ARE GLYPH BLOCKS?'
                },
                {
                    value: 1000,
                    clue: 'TO MAKE THIS AI STARTUP FEEL LIKE A PHYSICAL PRODUCT FOR INVESTORS, ITS RELEASES WERE MODELED ON OLD BOXES OF THIS ANTIVIRUS',
                    answer: 'WHAT IS MCAFEE?'
                }
            ]
        },
        {
            category: 'EARLY 2000s CODED',
            clues: [
                {
                    value: 200,
                    clue: 'OLIVIA RODRIGO IS OBSESSED WITH 2000s CULTURE & SHOUTED OUT THIS PARIS HILTON/NICOLE RICHIE SOCIOLOGICAL REALITY SHOW',
                    answer: 'WHAT IS THE SIMPLE LIFE?'
                },
                {
                    value: 400,
                    clue: 'IN OCTOBER 2001 APPLE LAUNCHED THIS POCKET-SIZED DEVICE PROMISING "1,000 SONGS IN YOUR POCKET"',
                    answer: 'WHAT IS THE IPOD?'
                },
                {
                    value: 600,
                    clue: 'RELEASED IN 2000, THIS FINNISH PHONE BECAME FAMOUS FOR SURVIVING ALMOST ANYTHING AND SHIPPING WITH SNAKE II',
                    answer: 'WHAT IS THE NOKIA 3310?'
                },
                {
                    value: 800,
                    clue: 'EVERY NEW USER ON THIS 2003 SOCIAL NETWORK AUTOMATICALLY STARTED WITH A FOUNDER NAMED TOM AS THEIR FIRST FRIEND',
                    answer: 'WHAT IS MYSPACE?'
                },
                {
                    value: 1000,
                    clue: 'BORN IN SWEDEN AS "THE ANNOYING THING", THIS BLUE CGI AMPHIBIAN HIT NUMBER ONE ON THE UK CHARTS IN 2005',
                    answer: 'WHAT IS CRAZY FROG?'
                }
            ]
        },
        {
            category: 'AD LAND & COPY',
            clues: [
                {
                    value: 200,
                    clue: 'SWEDEN’S OLDEST ADVERTISING AWARD, HANDED OUT ANNUALLY BY KOMM, IS SHAPED LIKE THIS',
                    answer: 'WHAT IS A GOLDEN EGG (GULDÄGGET)?'
                },
                {
                    value: 400,
                    clue: 'IN 1959 DOYLE DANE BERNBACH SOLD AMERICANS ON THE VOLKSWAGEN BEETLE WITH THIS TWO-WORD HEADLINE',
                    answer: 'WHAT IS "THINK SMALL"?'
                },
                {
                    value: 600,
                    clue: 'KESSELSKRAMER IN AMSTERDAM RAN A FAMOUS CAMPAIGN FOR THE HANS BRINKER BUDGET HOTEL CALLING IT THIS',
                    answer: 'WHAT IS THE WORST HOTEL IN THE WORLD?'
                },
                {
                    value: 800,
                    clue: 'BEFORE BECOMING A SPORTSWEAR SLOGAN IN 1988, DAN WIEDEN’S "JUST DO IT" WAS INSPIRED BY THE LAST WORDS OF THIS UTAH CONVICT',
                    answer: 'WHO IS GARY GILMORE?'
                },
                {
                    value: 1000,
                    clue: 'THE YOUNG ONES STUDENT COMPETITION IS RUN EACH YEAR BY THIS NEW YORK CREATIVE CLUB',
                    answer: 'WHAT IS THE ONE CLUB FOR CREATIVITY?'
                }
            ]
        },
        {
            category: 'SWEDISH LORE',
            clues: [
                {
                    value: 200,
                    clue: 'THIS EFFERVESCENT SWEDISH PAINKILLER COMBINES ACETYLSALICYLIC ACID WITH CAFFEINE',
                    answer: 'WHAT IS TREO?'
                },
                {
                    value: 400,
                    clue: 'BUILT ACROSS 14 ISLANDS WHERE LAKE MÄLAREN MEETS THE BALTIC, THIS CAPITAL IS LINKED BY OVER 50 BRIDGES',
                    answer: 'WHAT IS STOCKHOLM?'
                },
                {
                    value: 600,
                    clue: 'IKEA NAMES ITS BOOKCASES AFTER PROFESSIONS AND ITS SOFAS AND COFFEE TABLES AFTER THESE GEOGRAPHIC THINGS',
                    answer: 'WHAT ARE SWEDISH PLACES?'
                },
                {
                    value: 800,
                    clue: 'ON APRIL 24, 1961, THIS 17TH-CENTURY WARSHIP WAS RAISED FROM STOCKHOLM HARBOR AFTER 333 YEARS UNDERWATER',
                    answer: 'WHAT IS THE VASA?'
                },
                {
                    value: 1000,
                    clue: 'THIS SWEDISH WORD FOR A COFFEE BREAK WITH A PASTRY DOUBLES AS BOTH A NOUN AND A VERB',
                    answer: 'WHAT IS FIKA?'
                }
            ]
        },
        {
            category: 'LATE NIGHT & 2 AM',
            clues: [
                {
                    value: 200,
                    clue: 'ONLY THREE TIME ZONES HAD NO LOCAL STATION ON 2.AM DUE TO SPARSE ISLAND POPULATIONS: GMT−9, −10, AND THIS ONE',
                    answer: 'WHAT IS GMT−11?'
                },
                {
                    value: 400,
                    clue: 'IN THE "TWIN PEAKS" PILOT, AGENT DALE COOPER RAVES ABOUT THIS BEVERAGE AT THE GREAT NORTHERN HOTEL',
                    answer: 'WHAT IS A DAMN FINE CUP OF COFFEE?'
                },
                {
                    value: 600,
                    clue: 'EDWARD HOPPER’S 1942 PAINTING OF FOUR PEOPLE INSIDE A BRIGHTLY LIT DOWNTOWN DINER LATE AT NIGHT CARRIES THIS TITLE',
                    answer: 'WHAT IS NIGHTHAWKS?'
                },
                {
                    value: 800,
                    clue: 'FROM 1982 TO 2015, THIS LATE-NIGHT TELEVISION HOST MADE THE "TOP TEN LIST" A NIGHTLY STAPLE',
                    answer: 'WHO IS DAVID LETTERMAN?'
                },
                {
                    value: 1000,
                    clue: 'SINCE ITS 1964 DEBUT, EVERY JEOPARDY! CLUE IS AN ANSWER AND CONTESTANTS MUST RESPOND IN THIS FORM',
                    answer: 'WHAT IS A QUESTION?'
                }
            ]
        },
        {
            category: 'DEADLY SERIOUS',
            clues: [
                {
                    value: 200,
                    clue: 'IN ANCIENT GREECE, A COIN WAS PLACED IN THE MOUTH OF THE DECEASED TO PAY THIS UNDERWORLD FERRYMAN',
                    answer: 'WHO IS CHARON?'
                },
                {
                    value: 400,
                    clue: 'DESIGNED BY ED BENGUIAT AND VIC CARUSO IN 1974, THIS SERIF FONT HAS DISPLAYED EVERY JEOPARDY! CLUE SINCE 1984',
                    answer: 'WHAT IS ITC KORINNA?'
                },
                {
                    value: 600,
                    clue: 'DEVELOPING BLACK-AND-WHITE FILM AT HOME USING INSTANT COFFEE, VITAMIN C, AND WASHING SODA IS CALLED THIS',
                    answer: 'WHAT IS CAFFENOL?'
                },
                {
                    value: 800,
                    clue: 'FOUND IN ANCIENT CHINESE TOMBS, THESE SPIRIT OBJECTS REPRESENT SERVANTS, ANIMALS, AND EVERYDAY GOODS FOR THE AFTERLIFE',
                    answer: 'WHAT ARE MINGQI?'
                },
                {
                    value: 1000,
                    clue: 'THE CLASSIC MAYA USED THESE ROASTED BEANS BOTH FOR CEREMONIAL DRINKS AND AS EVERYDAY CURRENCY',
                    answer: 'WHAT ARE CACAO BEANS?'
                }
            ]
        }
    ];

    let keydownHandler = null;

    function cleanupJeopardyQuiz() {
        if (keydownHandler) {
            document.removeEventListener('keydown', keydownHandler);
            keydownHandler = null;
        }
    }

    function initJeopardyQuiz() {
        cleanupJeopardyQuiz();

        const root = document.getElementById('jeopardy-root');
        if (!root) return;

        if (document.fonts && typeof document.fonts.load === 'function') {
            document.fonts.load('700 24px "ITC Korinna Std"').catch(() => {});
        }

        const state = {
            played: new Set(),
            score: 0,
            vhs: true,
            activeClue: null,
            answerRevealed: false,
            animating: false
        };

        const totalClues = ELIAS_QUIZ_BOARD.reduce((sum, cat) => sum + cat.clues.length, 0);
        const isFullscreen = root.dataset.fullscreen === 'true';

        root.innerHTML = `
            <div class="jeopardy-shell${isFullscreen ? ' jeopardy-shell--fullscreen' : ''}">
                <div class="jeopardy-monitor">
                    <div class="jeopardy-screen is-vhs" id="jeopardy-screen">
                        <div class="jeopardy-vhs-stage" id="jeopardy-vhs-stage">
                            <div class="jeopardy-board" id="jeopardy-board" role="grid" aria-label="Elias Quiz Jeopardy Board"></div>
                            <div class="jeopardy-clue-overlay" id="jeopardy-clue-overlay" aria-hidden="true" hidden>
                                <div class="jeopardy-clue-inner" id="jeopardy-clue-inner">
                                    <div class="jeopardy-clue-meta" id="jeopardy-clue-meta"></div>
                                    <div class="jeopardy-clue-body">
                                        <p class="jeopardy-clue-text" id="jeopardy-clue-text"></p>
                                        <p class="jeopardy-clue-answer" id="jeopardy-clue-answer" hidden></p>
                                    </div>
                                    <div class="jeopardy-clue-actions" id="jeopardy-clue-actions">
                                        <button type="button" class="jeopardy-clue-btn" data-action="reveal">reveal answer</button>
                                        <button type="button" class="jeopardy-clue-btn jeopardy-clue-btn--score" data-action="correct" hidden>+$0</button>
                                        <button type="button" class="jeopardy-clue-btn jeopardy-clue-btn--score" data-action="wrong" hidden>-$0</button>
                                        <button type="button" class="jeopardy-clue-btn" data-action="close">back to board</button>
                                    </div>
                                </div>
                                <button type="button" class="jeopardy-clue-close-x" data-action="close" aria-label="Back to board">×</button>
                            </div>
                        </div>
                        <div class="jeopardy-vhs-scanlines" aria-hidden="true"></div>
                    </div>
                </div>
                ${isFullscreen ? '' : `
                <div class="jeopardy-controls">
                    <span class="jeopardy-stat" id="jeopardy-score">score: $0</span>
                    <span class="jeopardy-stat" id="jeopardy-remaining">clues: ${totalClues}/${totalClues}</span>
                    <button type="button" class="jeopardy-control-btn" id="jeopardy-vhs-toggle" aria-pressed="true">vhs blur: on</button>
                    <button type="button" class="jeopardy-control-btn" id="jeopardy-reset-btn">reset board</button>
                </div>
                <p class="jeopardy-caption">click any dollar amount to zoom in. click the clue (or press space) to reveal the answer, then click again or press esc to return to the board.</p>
                `}
            </div>
        `;

        const screen = document.getElementById('jeopardy-screen');
        const stage = document.getElementById('jeopardy-vhs-stage');
        const board = document.getElementById('jeopardy-board');
        const overlay = document.getElementById('jeopardy-clue-overlay');
        const clueMeta = document.getElementById('jeopardy-clue-meta');
        const clueText = document.getElementById('jeopardy-clue-text');
        const clueAnswer = document.getElementById('jeopardy-clue-answer');
        const scoreEl = document.getElementById('jeopardy-score');
        const remainingEl = document.getElementById('jeopardy-remaining');
        const vhsBtn = document.getElementById('jeopardy-vhs-toggle');
        const resetBtn = document.getElementById('jeopardy-reset-btn');
        const revealBtn = overlay.querySelector('[data-action="reveal"]');
        const correctBtn = overlay.querySelector('[data-action="correct"]');
        const wrongBtn = overlay.querySelector('[data-action="wrong"]');

        const categoryEls = [];
        const cellMap = new Map();

        function renderBoard() {
            board.innerHTML = '';
            categoryEls.length = 0;
            cellMap.clear();

            ELIAS_QUIZ_BOARD.forEach((colData, colIndex) => {
                const catEl = document.createElement('div');
                catEl.className = 'jeopardy-cat';
                catEl.setAttribute('role', 'columnheader');
                catEl.innerHTML = `<span class="jeopardy-cat-title">${colData.category}</span>`;
                board.appendChild(catEl);
                categoryEls.push(catEl);
            });

            const numRows = ELIAS_QUIZ_BOARD[0].clues.length;
            for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
                for (let colIndex = 0; colIndex < ELIAS_QUIZ_BOARD.length; colIndex++) {
                    const item = ELIAS_QUIZ_BOARD[colIndex].clues[rowIndex];
                    const key = `${colIndex}-${rowIndex}`;
                    const cellBtn = document.createElement('button');
                    cellBtn.type = 'button';
                    cellBtn.className = 'jeopardy-cell';
                    cellBtn.dataset.col = String(colIndex);
                    cellBtn.dataset.row = String(rowIndex);
                    cellBtn.setAttribute('aria-label', `${ELIAS_QUIZ_BOARD[colIndex].category} for $${item.value}`);
                    cellBtn.innerHTML = `<span class="jeopardy-value">$${item.value}</span>`;

                    if (state.played.has(key)) {
                        cellBtn.classList.add('is-played');
                        cellBtn.disabled = true;
                        cellBtn.setAttribute('aria-disabled', 'true');
                    }

                    cellBtn.addEventListener('click', () => openClue(colIndex, rowIndex, cellBtn));
                    board.appendChild(cellBtn);
                    cellMap.set(key, cellBtn);
                }
            }
        }

        function updateStats() {
            const sign = state.score < 0 ? '-' : '';
            if (scoreEl) scoreEl.textContent = `score: ${sign}$${Math.abs(state.score)}`;
            if (remainingEl) remainingEl.textContent = `clues: ${totalClues - state.played.size}/${totalClues}`;
        }

        function computeFlipTransform(cellEl) {
            const stageRect = stage.getBoundingClientRect();
            const cellRect = cellEl.getBoundingClientRect();
            if (!stageRect.width || !stageRect.height || !cellRect.width || !cellRect.height) {
                return 'translate(0px, 0px) scale(0.16, 0.16)';
            }
            const stageCenterX = stageRect.left + stageRect.width / 2;
            const stageCenterY = stageRect.top + stageRect.height / 2;
            const cellCenterX = cellRect.left + cellRect.width / 2;
            const cellCenterY = cellRect.top + cellRect.height / 2;
            const dx = cellCenterX - stageCenterX;
            const dy = cellCenterY - stageCenterY;
            const sx = cellRect.width / stageRect.width;
            const sy = cellRect.height / stageRect.height;
            return `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
        }

        function prefersReducedMotion() {
            return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }

        function openClue(colIndex, rowIndex, cellBtn) {
            const key = `${colIndex}-${rowIndex}`;
            if (state.animating || state.activeClue || state.played.has(key)) return;

            const catData = ELIAS_QUIZ_BOARD[colIndex];
            const clueData = catData.clues[rowIndex];

            state.activeClue = { colIndex, rowIndex, key, cellBtn, clueData };
            state.answerRevealed = false;
            state.animating = true;

            categoryEls.forEach((el, idx) => el.classList.toggle('is-active', idx === colIndex));

            clueMeta.textContent = `${catData.category} · $${clueData.value}`;
            clueText.textContent = clueData.clue;
            clueAnswer.textContent = clueData.answer;
            clueAnswer.hidden = true;
            revealBtn.hidden = false;
            correctBtn.hidden = true;
            wrongBtn.hidden = true;
            correctBtn.textContent = `+$${clueData.value}`;
            wrongBtn.textContent = `-$${clueData.value}`;

            const startTransform = computeFlipTransform(cellBtn);
            overlay.hidden = false;
            overlay.setAttribute('aria-hidden', 'false');
            overlay.classList.remove('is-open', 'is-closing');
            overlay.style.transition = 'none';
            overlay.style.transform = startTransform;

            // Mark cell played right away so returning reveals the blank blue square
            state.played.add(key);
            cellBtn.classList.add('is-played');
            cellBtn.disabled = true;
            cellBtn.setAttribute('aria-disabled', 'true');
            updateStats();

            if (prefersReducedMotion()) {
                overlay.style.transform = 'translate(0px, 0px) scale(1, 1)';
                overlay.classList.add('is-open');
                state.animating = false;
                return;
            }

            // Force layout flush before transitioning to full screen
            void overlay.offsetWidth;

            requestAnimationFrame(() => {
                overlay.style.transition = 'transform 480ms cubic-bezier(0.22, 1, 0.36, 1)';
                overlay.style.transform = 'translate(0px, 0px) scale(1, 1)';
                overlay.classList.add('is-open');
            });

            window.setTimeout(() => {
                state.animating = false;
            }, 500);
        }

        function revealAnswer() {
            if (!state.activeClue || state.answerRevealed) return;
            state.answerRevealed = true;
            clueAnswer.hidden = false;
            revealBtn.hidden = true;
            correctBtn.hidden = false;
            wrongBtn.hidden = false;
        }

        function closeClue(scoreDelta) {
            if (!state.activeClue || state.animating) return;
            if (typeof scoreDelta === 'number' && scoreDelta !== 0) {
                state.score += scoreDelta;
                updateStats();
            }

            const { cellBtn } = state.activeClue;
            state.animating = true;

            const finishClose = () => {
                overlay.hidden = true;
                overlay.setAttribute('aria-hidden', 'true');
                overlay.classList.remove('is-open', 'is-closing');
                overlay.style.transition = '';
                overlay.style.transform = '';
                categoryEls.forEach((el) => el.classList.remove('is-active'));
                state.activeClue = null;
                state.answerRevealed = false;
                state.animating = false;
            };

            if (prefersReducedMotion()) {
                finishClose();
                return;
            }

            const targetTransform = computeFlipTransform(cellBtn);
            overlay.classList.remove('is-open');
            overlay.classList.add('is-closing');
            overlay.style.transition = 'transform 340ms cubic-bezier(0.4, 0, 0.2, 1)';
            overlay.style.transform = targetTransform;

            window.setTimeout(finishClose, 360);
        }

        overlay.addEventListener('click', (event) => {
            const actionBtn = event.target.closest('[data-action]');
            if (actionBtn) {
                event.stopPropagation();
                const action = actionBtn.dataset.action;
                if (action === 'reveal') {
                    revealAnswer();
                } else if (action === 'correct' && state.activeClue) {
                    closeClue(state.activeClue.clueData.value);
                } else if (action === 'wrong' && state.activeClue) {
                    closeClue(-state.activeClue.clueData.value);
                } else if (action === 'close') {
                    closeClue(0);
                }
                return;
            }

            if (!state.answerRevealed) {
                revealAnswer();
            } else {
                closeClue(0);
            }
        });

        function resetBoard() {
            if (state.activeClue) {
                overlay.hidden = true;
                overlay.setAttribute('aria-hidden', 'true');
                overlay.classList.remove('is-open', 'is-closing');
                overlay.style.transition = '';
                overlay.style.transform = '';
                state.activeClue = null;
                state.answerRevealed = false;
                state.animating = false;
            }
            state.played.clear();
            state.score = 0;
            renderBoard();
            updateStats();
        }

        if (vhsBtn) {
            vhsBtn.addEventListener('click', () => {
                state.vhs = !state.vhs;
                screen.classList.toggle('is-vhs', state.vhs);
                vhsBtn.setAttribute('aria-pressed', String(state.vhs));
                vhsBtn.textContent = `vhs blur: ${state.vhs ? 'on' : 'off'}`;
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', resetBoard);
        }

        keydownHandler = (event) => {
            if (!document.getElementById('jeopardy-root')) {
                cleanupJeopardyQuiz();
                return;
            }
            if (!state.activeClue) {
                if ((event.key === 'r' || event.key === 'R') && !event.metaKey && !event.ctrlKey) {
                    resetBoard();
                }
                return;
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                closeClue(0);
            } else if (event.key === ' ' || event.key === 'Enter') {
                if (event.target && event.target.tagName === 'BUTTON') return;
                event.preventDefault();
                if (!state.answerRevealed) {
                    revealAnswer();
                } else {
                    closeClue(0);
                }
            }
        };
        document.addEventListener('keydown', keydownHandler);

        renderBoard();
        updateStats();
    }

    window.initJeopardyQuiz = initJeopardyQuiz;
    window.cleanupJeopardyQuiz = cleanupJeopardyQuiz;
})();
