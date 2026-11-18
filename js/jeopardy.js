(function () {
    const ELIAS_QUIZ_BOARD = [
        {
            category: 'VAD ÄTER DJURET?',
            clues: [
                {
                    value: 200,
                    clue: 'FLODHÄST',
                    answer: 'GRÄS'
                },
                {
                    value: 400,
                    clue: 'PISSMYRA',
                    answer: 'HONUNGSDAGG OCH SMÅINSEKTER/LARVER'
                },
                {
                    value: 600,
                    clue: 'ÄLG',
                    answer: 'BARR OCH KVISTAR'
                },
                {
                    value: 800,
                    dailyDouble: true,
                    specialCategory: 'KAN DJURET SIMMA?',
                    clue: 'KAN EN KAMEL SIMMA?',
                    answer: 'JA! (KHARAI-KAMELER KAN SIMMA UPP TILL 3 KM)'
                },
                {
                    value: 1000,
                    clue: 'SJÖGURKA',
                    answer: 'BOTTENAVFALL'
                }
            ]
        },
        {
            category: 'VEM ÄTER DJURET?',
            clues: [
                {
                    value: 200,
                    clue: 'FLODHÄST',
                    answer: 'LEJON, KROKODIL ELLER HYENA (UNGAR)'
                },
                {
                    value: 400,
                    clue: 'PISSMYRA',
                    answer: 'HACKSPETT'
                },
                {
                    value: 600,
                    dailyDouble: true,
                    specialCategory: 'KAN DJURET SIMMA?',
                    clue: 'KAN EN GIRAFF SIMMA?',
                    answer: 'NEJ! (DE KAN VADA MEN INTE SIMMA)'
                },
                {
                    value: 800,
                    clue: 'ÄLG',
                    answer: 'VARG OCH BRUNBJÖRN'
                },
                {
                    value: 1000,
                    clue: 'SJÖGURKA',
                    answer: 'SJÖSTJÄRNA'
                }
            ]
        },
        {
            category: 'KÖRKORTSFRÅGOR',
            clues: [
                {
                    value: 200,
                    clue: 'DU PARKERAR EN TISDAG KLOCKAN 16.54 PÅ EN PLATS MED KRAV PÅ P-SKIVA. DETTA KLOCKSLAG SKA DU STÄLLA IN',
                    answer: 'VAD ÄR 17.00?'
                },
                {
                    value: 400,
                    clue: 'DET ÄR DEN 17:E I MÅNADEN OCH EN SKYLT VISAR DATUMPARKERING. PÅ DENNA SIDA AV GATAN ÄR DET FÖRBJUDET ATT PARKERA',
                    answer: 'VAD ÄR SIDAN MED UDDA HUSNUMMER?'
                },
                {
                    value: 600,
                    clue: '',
                    image: 'images/quiz/c2-forbud-mot-trafik.svg',
                    imageAlt: 'Vägmärke',
                    answer: 'VAD ÄR FÖRBUD MOT TRAFIK MED FORDON?'
                },
                {
                    value: 800,
                    clue: 'OM DU FÅR MOTORSTOPP PÅ EN PLATS DÄR DET ÄR FÖRBJUDET ATT STANNA MÅSTE DU SÄTTA UT VARNINGSTRIANGEL NÄR HÖGSTA TILLÅTNA HASTIGHET ÖVERSTIGER DETTA',
                    answer: 'VAD ÄR 50 KM/H?'
                },
                {
                    value: 1000,
                    clue: 'VID EN BUSSHÅLLPLATS SOM SAKNAR GUL VÄGMARKERING FÅR DU INTE PARKERA NÄRMARE ÄN SÅ HÄR MÅNGA METER FÖRE OCH EFTER HÅLLPLATSMÄRKET',
                    answer: 'VAD ÄR 20 METER FÖRE OCH 5 METER EFTER?'
                }
            ]
        },
        {
            category: 'SVENSKA STATIONER',
            clues: [
                {
                    value: 200,
                    clue: 'STOCKHOLMS TUNNELBANAS GRÖNA, RÖDA OCH BLÅ LINJE MÖTS ALLA PÅ DENNA CENTRALA STATION',
                    answer: 'VAD ÄR T-CENTRALEN?'
                },
                {
                    value: 400,
                    clue: 'DETTA ÄR SISTA SVENSKA STATIONEN PÅ ÖRESUNDSTÅGET INNAN TÅGET KÖR UT PÅ BRON MOT DANMARK',
                    answer: 'VAD ÄR HYLLIE?'
                },
                {
                    value: 600,
                    clue: 'MED EN PLATTFORM 34 METER UNDER MARKEN ÄR DETTA DEN DJUPAST LIGGANDE I DRIFT VARANDE TUNNELBANESTATIONEN I STOCKHOLM',
                    answer: 'VAD ÄR KUNGSTRÄDGÅRDEN?'
                },
                {
                    value: 800,
                    clue: 'PÅ DENNA TUNNELBANESTATION I SOLNA FINNS SVERIGES LÄNGSTA RULLTRAPPA, HELA 66 METER LÅNG',
                    answer: 'VAD ÄR VÄSTRA SKOGEN?'
                },
                {
                    value: 1000,
                    clue: 'MALMBANAN FRÅN KIRUNA MOT NARVIK PASSERAR DENNA KÄNDA FJÄLLSTATION DÄR KUNGSLEDEN HAR SIN NORRA STARTPUNKT',
                    answer: 'VAD ÄR ABISKO TURISTSTATION?'
                }
            ]
        },
        {
            category: 'DAGAR OCH TID',
            clues: [
                {
                    value: 200,
                    clue: 'OM DET ÄR TISDAG IDAG ÄR DETTA VECKODAGEN OM ÅTTA DAGAR',
                    answer: 'VAD ÄR ONSDAG?'
                },
                {
                    value: 400,
                    clue: 'DENNA MÅNAD HAR 28 DAGAR VARJE VANLIGT ÅR, OCH 29 DAGAR UNDER SKOTTÅR',
                    answer: 'VAD ÄR FEBRUARI?'
                },
                {
                    value: 600,
                    clue: 'NÄR SVERIGE STÄLLER OM TILL VINTERTID SISTA SÖNDAGEN I OKTOBER VRIDS KLOCKAN ETT STEG ÅT DETTA HÅLL',
                    answer: 'VAD ÄR BAKÅT (EN TIMME)?'
                },
                {
                    value: 800,
                    clue: 'SÅ HÄR MÅNGA SEKUNDER GÅR DET PÅ EN HEL TIMME',
                    answer: 'VAD ÄR 3 600 SEKUNDER?'
                },
                {
                    value: 1000,
                    clue: 'ÅR 1753 HOPPADE SVERIGE ÖVER ELVA DAGAR I FEBRUARI NÄR LANDET BYTTE FRÅN DEN JULIANSKA KALENDERN TILL DENNA',
                    answer: 'VAD ÄR DEN GREGORIANSKA KALENDERN?'
                }
            ]
        },
        {
            category: 'SPELLING BEE',
            clues: [
                {
                    value: 200,
                    clue: 'STAVA DET SVENSKA ORDET FÖR EN MÅNADSKOSTNAD PÅ TELEFON ELLER TIDNING, TVÅ "N" MEN BARA ETT "B"',
                    answer: 'VAD ÄR A-B-O-N-N-E-M-A-N-G?'
                },
                {
                    value: 400,
                    clue: 'STAVA DET SVENSKA ADJEKTIVET FÖR NÅGON SOM ÄR VÄLDIGT NOGA, MED DUBBELT "G" OCH DUBBELT "N"',
                    answer: 'VAD ÄR N-O-G-G-R-A-N-N?'
                },
                {
                    value: 600,
                    clue: 'STAVA ORDET FÖR TVÅ LINJER SOM ALDRIG MÖTS, MED DUBBELT "L" PÅ TVÅ OLIKA STÄLLEN',
                    answer: 'VAD ÄR P-A-R-A-L-L-E-L-L?'
                },
                {
                    value: 800,
                    clue: 'STAVA DET ENGELSKA ORDET FÖR "NÖDVÄNDIG", ETT "C" OCH TVÅ "S", ALDRIG TVÄRTOM',
                    answer: 'VAD ÄR N-E-C-E-S-S-A-R-Y?'
                },
                {
                    value: 1000,
                    clue: 'STAVA DET FRANSKLÅNADE SVENSKA ORDET FÖR EN VILOSOFFA UTAN RYGGSTÖD PÅ ENA SIDAN, BÖRJAR MED "SCH"',
                    answer: 'VAD ÄR S-C-H-Ä-S-L-O-N-G?'
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
            activeWager: 0,
            wagerPending: false,
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
                                        <div class="jeopardy-wager-box" id="jeopardy-wager-box" hidden>
                                            <div class="jeopardy-dd-badge">SPECIALFRÅGA</div>
                                            <p class="jeopardy-dd-category" id="jeopardy-dd-category"></p>
                                            <form class="jeopardy-wager-form" id="jeopardy-wager-form">
                                                <label class="jeopardy-wager-label" for="jeopardy-wager-input">SATSNING ($)</label>
                                                <div class="jeopardy-wager-row">
                                                    <input type="number" class="jeopardy-wager-input" id="jeopardy-wager-input" min="0" step="100" value="800" required>
                                                    <button type="submit" class="jeopardy-clue-btn jeopardy-clue-btn--score">satsa &amp; visa fråga</button>
                                                </div>
                                                <div class="jeopardy-wager-presets" id="jeopardy-wager-presets"></div>
                                            </form>
                                        </div>
                                        <img class="jeopardy-clue-image" id="jeopardy-clue-image" alt="" hidden>
                                        <p class="jeopardy-clue-text" id="jeopardy-clue-text"></p>
                                        <p class="jeopardy-clue-answer" id="jeopardy-clue-answer" hidden></p>
                                    </div>
                                    <div class="jeopardy-clue-actions" id="jeopardy-clue-actions">
                                        <button type="button" class="jeopardy-clue-btn" data-action="reveal">visa svar</button>
                                        <button type="button" class="jeopardy-clue-btn jeopardy-clue-btn--score" data-action="correct" hidden>+$0</button>
                                        <button type="button" class="jeopardy-clue-btn jeopardy-clue-btn--score" data-action="wrong" hidden>-$0</button>
                                        <button type="button" class="jeopardy-clue-btn" data-action="close">tillbaka</button>
                                    </div>
                                </div>
                                <button type="button" class="jeopardy-clue-close-x" data-action="close" aria-label="Tillbaka till brädet">×</button>
                            </div>
                        </div>
                        <div class="jeopardy-vhs-scanlines" aria-hidden="true"></div>
                    </div>
                </div>
                ${isFullscreen ? '' : `
                <div class="jeopardy-controls">
                    <span class="jeopardy-stat" id="jeopardy-score">poäng: $0</span>
                    <span class="jeopardy-stat" id="jeopardy-remaining">frågor: ${totalClues}/${totalClues}</span>
                    <button type="button" class="jeopardy-control-btn" id="jeopardy-vhs-toggle" aria-pressed="true">vhs blur: på</button>
                    <button type="button" class="jeopardy-control-btn" id="jeopardy-reset-btn">nollställ</button>
                    <a class="jeopardy-control-btn" href="quiz.html" target="_blank" rel="noopener">fullskärm ↗</a>
                </div>
                <p class="jeopardy-caption">klicka på ett belopp för att zooma in. klicka på frågan (eller tryck mellanslag) för att visa svaret, och klicka igen eller tryck esc för att gå tillbaka.</p>
                `}
            </div>
        `;

        const screen = document.getElementById('jeopardy-screen');
        const stage = document.getElementById('jeopardy-vhs-stage');
        const board = document.getElementById('jeopardy-board');
        const overlay = document.getElementById('jeopardy-clue-overlay');
        const clueMeta = document.getElementById('jeopardy-clue-meta');
        const wagerBox = document.getElementById('jeopardy-wager-box');
        const ddCategoryEl = document.getElementById('jeopardy-dd-category');
        const wagerForm = document.getElementById('jeopardy-wager-form');
        const wagerInput = document.getElementById('jeopardy-wager-input');
        const wagerPresets = document.getElementById('jeopardy-wager-presets');
        const clueImage = document.getElementById('jeopardy-clue-image');
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

            ELIAS_QUIZ_BOARD.forEach((colData) => {
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
                    cellBtn.setAttribute('aria-label', `${ELIAS_QUIZ_BOARD[colIndex].category} för $${item.value}`);
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
            if (scoreEl) scoreEl.textContent = `poäng: ${sign}$${Math.abs(state.score)}`;
            if (remainingEl) remainingEl.textContent = `frågor: ${totalClues - state.played.size}/${totalClues}`;
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

        function showClueContent(catData, clueData, wager) {
            state.wagerPending = false;
            state.activeWager = wager;
            wagerBox.hidden = true;
            overlay.classList.remove('is-daily-double');

            const headerCat = clueData.specialCategory || catData.category;
            clueMeta.textContent = clueData.dailyDouble
                ? `${headerCat} · SATSNING: $${wager}`
                : `${headerCat} · $${clueData.value}`;

            if (clueData.image) {
                clueImage.src = clueData.image;
                clueImage.alt = clueData.imageAlt || 'Frågebild';
                clueImage.hidden = false;
            } else {
                clueImage.removeAttribute('src');
                clueImage.alt = '';
                clueImage.hidden = true;
            }
            if (clueData.clue) {
                clueText.textContent = clueData.clue;
                clueText.hidden = false;
            } else {
                clueText.textContent = '';
                clueText.hidden = true;
            }
            clueAnswer.textContent = clueData.answer;
            clueAnswer.hidden = true;
            revealBtn.hidden = false;
            correctBtn.hidden = true;
            wrongBtn.hidden = true;
            correctBtn.textContent = `+$${wager}`;
            wrongBtn.textContent = `-$${wager}`;
        }

        function renderWagerPresets(defaultValue) {
            const amounts = [200, 500, 1000, 2000];
            wagerPresets.innerHTML = '';
            amounts.forEach((amt) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'jeopardy-clue-btn';
                btn.textContent = `$${amt}`;
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    wagerInput.value = String(amt);
                });
                wagerPresets.appendChild(btn);
            });
            if (state.score > 0) {
                const allBtn = document.createElement('button');
                allBtn.type = 'button';
                allBtn.className = 'jeopardy-clue-btn jeopardy-clue-btn--score';
                allBtn.textContent = `allt ($${state.score})`;
                allBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    wagerInput.value = String(state.score);
                });
                wagerPresets.appendChild(allBtn);
            }
            wagerInput.value = String(defaultValue);
        }

        function openClue(colIndex, rowIndex, cellBtn) {
            const key = `${colIndex}-${rowIndex}`;
            if (state.animating || state.activeClue || state.played.has(key)) return;

            const catData = ELIAS_QUIZ_BOARD[colIndex];
            const clueData = catData.clues[rowIndex];

            state.activeClue = { colIndex, rowIndex, key, cellBtn, catData, clueData };
            state.answerRevealed = false;
            state.animating = true;

            categoryEls.forEach((el, idx) => el.classList.toggle('is-active', idx === colIndex));

            if (clueData.dailyDouble) {
                state.wagerPending = true;
                state.activeWager = clueData.value;
                overlay.classList.add('is-daily-double');
                clueMeta.textContent = `${catData.category} · $${clueData.value}`;
                ddCategoryEl.textContent = `KATEGORI: ${clueData.specialCategory || catData.category}`;
                renderWagerPresets(clueData.value);
                wagerBox.hidden = false;
                clueImage.removeAttribute('src');
                clueImage.alt = '';
                clueImage.hidden = true;
                clueText.textContent = '';
                clueText.hidden = true;
                clueAnswer.hidden = true;
                revealBtn.hidden = true;
                correctBtn.hidden = true;
                wrongBtn.hidden = true;
            } else {
                showClueContent(catData, clueData, clueData.value);
            }

            const startTransform = computeFlipTransform(cellBtn);
            overlay.hidden = false;
            overlay.setAttribute('aria-hidden', 'false');
            overlay.classList.remove('is-open', 'is-closing');
            overlay.style.transition = 'none';
            overlay.style.transform = startTransform;

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
            if (!state.activeClue || state.wagerPending || state.answerRevealed) return;
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
                overlay.classList.remove('is-open', 'is-closing', 'is-daily-double');
                overlay.style.transition = '';
                overlay.style.transform = '';
                wagerBox.hidden = true;
                categoryEls.forEach((el) => el.classList.remove('is-active'));
                state.activeClue = null;
                state.wagerPending = false;
                state.activeWager = 0;
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

        wagerForm.addEventListener('submit', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!state.activeClue || !state.wagerPending) return;
            const parsed = Math.max(0, Math.round(Number(wagerInput.value) || 0));
            showClueContent(state.activeClue.catData, state.activeClue.clueData, parsed);
        });

        wagerBox.addEventListener('click', (event) => {
            event.stopPropagation();
        });

        overlay.addEventListener('click', (event) => {
            const actionBtn = event.target.closest('[data-action]');
            if (actionBtn) {
                event.stopPropagation();
                const action = actionBtn.dataset.action;
                if (action === 'reveal') {
                    revealAnswer();
                } else if (action === 'correct' && state.activeClue) {
                    closeClue(state.activeWager);
                } else if (action === 'wrong' && state.activeClue) {
                    closeClue(-state.activeWager);
                } else if (action === 'close') {
                    closeClue(0);
                }
                return;
            }

            if (state.wagerPending) return;

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
                overlay.classList.remove('is-open', 'is-closing', 'is-daily-double');
                overlay.style.transition = '';
                overlay.style.transform = '';
                wagerBox.hidden = true;
                state.activeClue = null;
                state.wagerPending = false;
                state.activeWager = 0;
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
                vhsBtn.textContent = `vhs blur: ${state.vhs ? 'på' : 'av'}`;
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
                if (state.wagerPending) return;
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
