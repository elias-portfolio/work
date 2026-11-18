(function () {
    const extraAudio = 'images/quiz/extra/';
    const worldAudio = 'images/quiz/varldsvan/';
    const rapidAudio = `${worldAudio}rapid/`;
    const animalAudio = 'images/quiz/djur/';
    function spoken(folder, stem, clue, answer, extra = {}) {
        return { clue, answer, audio: `${folder}${stem}_fraga.mp3`, answerAudio: `${folder}${stem}_svar.mp3`, ...extra };
    }
    const animal = (stem, clue, answer, value, extra) => {
        const item = spoken(animalAudio, stem, clue, answer, { value, ...extra });
        return { ...item, audio: `${item.audio}?v=kort`, answerAudio: `${item.answerAudio}?v=kort` };
    };
    const artistRound = [
        ['3a_elton_john', 'ELTON JOHN', 'ARTISTNAMN: REGINALD DWIGHT'],
        ['3b_adele', 'ADELE', 'RIKTIGT FÖRNAMN: ADELE ADKINS'],
        ['3c_taylor_swift', 'TAYLOR SWIFT', 'RIKTIGT NAMN'],
        ['3d_natalie_portman', 'NATALIE PORTMAN', 'ARTISTNAMN: NETA-LEE HERSHLAG'],
        ['3e_kylie_minogue', 'KYLIE MINOGUE', 'RIKTIGT NAMN']
    ].map(([stem, name, answer], i) => ({
        clue: `ARTISTNAMN ELLER RIKTIGT NAMN? ${name}`,
        vote: `Är ${name} ett artistnamn?`,
        yes: answer.startsWith('ARTISTNAMN:'),
        answer,
        introAudio: i === 0 ? `${rapidAudio}rapid_2_intro_artistnamn.mp3` : null,
        audio: `${rapidAudio}rapid_2${stem.slice(1)}.mp3`,
        answerAudio: `${worldAudio}q4_${stem}_svar.mp3`
    }));
    const moppeRound = [
        'En körde vilse, sen var de bara nio.',
        'De meka utan måtta, en meka för mycket, sen var de bara åtta.',
        'En letade sig en fru, en högg på kroken, sen var de bara sju.',
        'En spanade in ett kex, en såg för noga, sen var de bara sex.',
        'En ville åka hem, en svängde vänster, sen var de bara fem.',
        'En greps av väldig yra, en greps av hybris, sen var de bara fyra.',
        'Såvitt man kunde se, en syntes inte, sen var de bara tre.',
        'På disko skulle gå, en lyssnade inte, sen var de bara två.',
        'De ropade kom igen, en kom av sig, sen var de bara en.',
        'Ensam kvar av tio, körde till en korvmoj, där stod de andra nio.'
    ].map((answer, i) => {
        const stem = `moppe_${String(10 - i).padStart(2, '0')}`;
        const number = ['Tio', 'Nio', 'Åtta', 'Sju', 'Sex', 'Fem', 'Fyra', 'Tre', 'Två', 'En'][i];
        const clue = i === 0 ? 'Tio små moppepojkar körde till en bio. Vad hände sen?' : `${number} ${i === 9 ? 'liten moppepojke' : 'små moppepojkar'}, vad hände sen?`;
        return spoken(`${worldAudio}moppepojkar/`, stem, clue, answer, {
            audio: `${rapidAudio}${stem}.mp3`, introAudio: i === 0 ? `${rapidAudio}rapid_3_intro_moppe.mp3` : null
        });
    });

    const ELIAS_QUIZ_BOARD = [
        {
            category: 'VAD ÄTER DJURET?',
            intro: `${animalAudio}kat1_0_intro.mp3?v=kort`,
            clues: [
                animal('kat1_1_flodhast', "Vad äter flodhästen?", "Rätt svar är gräs.", 200),
                animal('kat1_2_pissmyra', "Vad äter pissmyran?", "Rätt svar är honungsdagg, småinsekter och larver.", 400),
                animal('kat1_3_alg', "Vad äter älgen?", "Rätt svar är barr, kvistar, löv och bärris.", 600),
                animal('kat1_4_sjogurka', "Vad äter sjögurkan?", "Rätt svar är bottenavfall och plankton.", 800, { swimBonus: true }),
                { value: 1000, round: moppeRound, roundTitle: 'TIO SMÅ MOPPEPOJKAR' }
            ],
            swim: spoken(extraAudio, 'special_kamel', 'KAN EN KAMEL SIMMA?', 'RÄTT SVAR ÄR JA! KHARAI-KAMELER I INDIEN KAN SIMMA UPP TILL TRE KILOMETER.', { value: 800, dailyDouble: true, specialCategory: 'KAN DJURET SIMMA?' })
        },
        {
            category: 'VEM ÄTER DJURET?',
            intro: `${animalAudio}kat2_0_intro.mp3?v=kort`,
            clues: [
                animal('kat2_1_flodhast', "Vem äter flodhästen?", "Rätt svar är lejon, nilkrokodiler och fläckiga hyenor.", 200),
                animal('kat2_2_pissmyra', "Vem äter pissmyran?", "Rätt svar är hackspetten, framför allt gröngölingen.", 400),
                animal('kat2_3_alg', "Vem äter älgen?", "Rätt svar är varg och brunbjörn.", 600, { swimBonus: true }),
                animal('kat2_4_sjogurka', "Vem äter sjögurkan?", "Rätt svar är sjöstjärnor, krabbor och rovsnäckor.", 800),
                animal('kat2_5_flamingo', "Vem äter flamingon?", "Flamingons främsta rovdjur är örnar, gamar, marabustorkar, schakaler och hyenor.", 1000, { zatacka: true })
            ],
            swim: spoken(extraAudio, 'special_giraff', 'KAN EN GIRAFF SIMMA?', 'NEJ ENLIGT QUIZFACIT. GIRAFFER KAN VADA; SIMNING ÄR INTE BELAGD.', { value: 600, dailyDouble: true, specialCategory: 'KAN DJURET SIMMA?' })
        },
        {
            category: 'VÄRLDSVAN',
            intro: `${extraAudio}intro_varldsvan.mp3`,
            clues: [
                spoken(worldAudio, 'q1_sovjetisk_bil', 'VAD HETER DEN KLASSISKA SOVJETISKA BILEN?', 'LADA', { value: 200 }),
                spoken(worldAudio, 'q2_arlanda', 'VAD ÄR ARLANDAS FLYGPLATSKOD OCH VILKEN ÄR DEN STORA INTERNATIONELLA TERMINALEN?', 'ARN: TERMINAL 5 (OCH TERMINAL 2)', { value: 400, parts: 2 }),
                spoken(worldAudio, 'q3_paris_flygplatser', 'VAD HETER PARIS FLYGPLATSER?', 'CHARLES DE GAULLE (CDG), ORLY (ORY) OCH BEAUVAIS (BVA).', { value: 600, parts: 3 }),
                { value: 800, round: [
                    spoken(worldAudio, 'q4_1_ramsay_oliver', 'VEM ÄR RIKAST, GORDON RAMSAY ELLER JAMIE OLIVER?', 'GORDON RAMSAY ENLIGT QUIZFACIT', { introAudio: `${rapidAudio}rapid_1_intro_rikast.mp3`, audio: `${rapidAudio}rapid_1a_ramsay_oliver.mp3`, vote: 'Är Gordon Ramsay rikare än Jamie Oliver?', yes: true }),
                    spoken(worldAudio, 'q4_2_ronaldo_cruise', 'VEM ÄR RIKAST, CRISTIANO RONALDO ELLER TOM CRUISE?', 'CRISTIANO RONALDO ENLIGT QUIZFACIT', { audio: `${rapidAudio}rapid_1b_ronaldo_cruise.mp3`, vote: 'Är Tom Cruise rikare än Cristiano Ronaldo?', yes: false }),
                    ...artistRound
                ] },
                {
                    value: 1000,
                    audio: `${worldAudio}q5_plastik_utan_belopp.mp3`,
                    answerAudio: `${worldAudio}q5_plastik_svar.mp3`,
                    clue: 'VILKA TRE LÄNDER TOPPAR PLASTIKOPERATIONER? (100 POÄNG PER RÄTT LAND.)',
                    answer: 'IRAN, SYDKOREA OCH BRASILIEN ENLIGT QUIZFACIT.',
                    parts: 3
                }
            ]
        },
        {
            category: 'FIXA SVENGELSKAN',
            intro: 'images/quiz/svengelska/svengelska_0_intro.mp3',
            clues: [
                { value: 200, audio: 'images/quiz/svengelska/svengelska_1_audition.mp3', answerAudio: 'images/quiz/svengelska/svengelska_svar_1_audition.mp3', answer: 'SCENPROV, PROVSPELNING ELLER UTTAGNING' },
                { value: 400, audio: 'images/quiz/svengelska/svengelska_2_scrolla.mp3', answerAudio: 'images/quiz/svengelska/svengelska_svar_2_scrolla.mp3', answer: 'BLÄDDRA ELLER RULLA' },
                { value: 600, audio: 'images/quiz/svengelska/svengelska_3_backa.mp3', answerAudio: 'images/quiz/svengelska/svengelska_svar_3_backa.mp3', answer: 'SÄKERHETSKOPIERA' },
                { value: 800, audio: 'images/quiz/svengelska/svengelska_4_signa_upp.mp3', answerAudio: 'images/quiz/svengelska/svengelska_svar_4_signa_upp.mp3', answer: 'REGISTRERA SIG, ANMÄLA SIG ELLER REGGA' },
                { value: 1000, audio: 'images/quiz/svengelska/svengelska_5_tweaka.mp3', answerAudio: 'images/quiz/svengelska/svengelska_svar_5_tweaka.mp3', answer: 'JUSTERA ELLER FINJUSTERA' }
            ]
        },
        {
            category: 'DAGAR OCH TID',
            intro: `${extraAudio}intro_dagar_och_tid.mp3`,
            clues: [
                { value: 200, audio: 'images/quiz/dagar/pask.mp3', calendar: 'easter' },
                { value: 400, audio: 'images/quiz/dagar/fullmane.mp3', calendar: 'moon' },
                { value: 600, audio: 'images/quiz/dagar/namnsdag.mp3', calendar: 'names' },
                { value: 800, clue: 'MAX MARTIN-QUIZ', audio: 'images/quiz/dagar/max_martin.mp3', medley: true },
                { value: 1000, audio: `${extraAudio}dagar_5_klockan_fraga.mp3`, clue: 'VAD ÄR KLOCKAN NU?', calendar: 'clock' }
            ]
        },
        {
            category: 'SPELLING BEE',
            intro: `${extraAudio}intro_spelling_bee.mp3`,
            clues: [
                {
                    value: 200,
                    dailyDouble: true,
                    specialCategory: 'ETYMOLOGI',
                    clue: 'FRÅN VILKET FOLK KOMMER ORDET ”TJEJ”?',
                    answer: 'ROMERNA. ORDET ÄR LÅNAT FRÅN ROMANI.'
                },
                {
                    value: 400,
                    image: 'images/quiz/spelling/netanyahu.png',
                    audio: 'images/quiz/spelling/netanyahu.mp3?v=quiz9',
                    answer: 'NETANYAHU'
                },
                {
                    value: 600,
                    image: 'images/quiz/spelling/dragostea.png',
                    audio: 'images/quiz/spelling/dragostea.mp3?v=quiz9',
                    answer: 'DRAGOSTEA DIN TEI'
                },
                {
                    value: 800,
                    image: 'images/quiz/spelling/arja.png',
                    audio: 'images/quiz/spelling/arja.mp3?v=quiz9',
                    answer: 'ARJA SAIJONMAA'
                },
                {
                    value: 1000,
                    image: 'images/quiz/spelling/tenochtitlan.png',
                    audio: 'images/quiz/spelling/tenochtitlan.mp3?v=quiz9',
                    answer: 'TENOCHTITLAN'
                }
            ]
        }
    ];

    const stockholm = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', dateStyle: 'long' });
    const calendarData = fetch('./js/quiz-data/calendar-2026-2031.json').then(response => {
        if (!response.ok) throw new Error('Kalenderdata saknas');
        return response.json();
    }).catch(() => null);
    const swedishClock = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    });
    async function calendarAnswer(kind, now = new Date()) {
        if (kind === 'clock') return swedishClock.format(now);
        const data = await calendarData;
        const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Europe/Stockholm', year: 'numeric', month: 'numeric', day: 'numeric'
        }).formatToParts(now).map(({type, value}) => [type, Number(value)]));
        const { year, month, day } = parts;
        if (kind === 'names') return data ? data.names[month][day].join(' och ') || 'Ingen namnsdag i almanackan' : null;
        if (kind === 'days') return `${(Date.UTC(year, 11, 31) - Date.UTC(year, month - 1, day)) / 86400000} dagar (idag borträknad)`;
        if (kind === 'moon') {
            const next = data?.fullMoons.find(value => new Date(value) >= now);
            return next ? stockholm.format(new Date(next)) : null;
        }
        if (data?.easter[year]) return stockholm.format(new Date(data.easter[year]));
        // Gregorian computus; this question uses Easter Sunday.
        const a = year % 19, b = Math.floor(year / 100), c = year % 100;
        const h = (19 * a + b - Math.floor(b / 4) - Math.floor((b - Math.floor((b + 8) / 25) + 1) / 3) + 15) % 30;
        const l = (32 + 2 * (b % 4) + 2 * Math.floor(c / 4) - h - c % 4) % 7;
        const n = h + l - 7 * Math.floor((a + 11 * h + 22 * l) / 451) + 114;
        return `Påskdagen: ${stockholm.format(new Date(Date.UTC(year, Math.floor(n / 31) - 1, n % 31 + 1)))}`;
    }

    let keydownHandler = null;
    let disposeMini = null;

    function cleanupJeopardyQuiz() {
        const dispose = disposeMini;
        disposeMini = null;
        dispose?.();
        document.querySelector('#jeopardy-root audio')?.pause();
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
            introduced: new Set(),
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
                <div class="quiz-player-bar"></div>
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
                                        <div class="quiz-player-votes" hidden></div>
                                        <div class="quiz-buzzer"></div>
                                        <form class="jeopardy-entry" hidden>
                                            <div class="jeopardy-clock" hidden>
                                                <svg viewBox="0 0 160 160" role="group" aria-label="Ställ in klockan">
                                                    <circle cx="80" cy="80" r="77" class="clock-face"/>
                                                    ${Array.from({ length: 12 }, (_, i) => `<text x="${80 + 62 * Math.sin(i * Math.PI / 6)}" y="${80 - 62 * Math.cos(i * Math.PI / 6)}">${i || 12}</text>`).join('')}
                                                    <g class="clock-hour" data-hand="hour" tabindex="0" role="slider" aria-label="Timme" aria-valuemin="1" aria-valuemax="12">
                                                        <line x1="80" y1="80" x2="80" y2="45"/>
                                                        <circle cx="80" cy="45" r="12"/>
                                                    </g>
                                                    <g class="clock-minute" data-hand="minute" tabindex="0" role="slider" aria-label="Minut" aria-valuemin="0" aria-valuemax="59">
                                                        <line x1="80" y1="80" x2="80" y2="27"/>
                                                        <circle cx="80" cy="27" r="12"/>
                                                    </g>
                                                </svg>
                                                <select aria-label="Före eller efter middag">
                                                    <option value="0">00–11</option>
                                                    <option value="12">12–23</option>
                                                </select>
                                                <output aria-label="Ditt valda klockslag"></output>
                                            </div>
                                            <label for="jeopardy-entry-input"></label>
                                            <input id="jeopardy-entry-input" lang="sv" required autocomplete="off" autocapitalize="off" spellcheck="false">
                                            <button type="button" class="jeopardy-clue-btn" data-action="picker" hidden>öppna kalender</button>
                                            <button type="submit" class="jeopardy-clue-btn">rätta</button>
                                        </form>
                                        <p class="jeopardy-entry-result" aria-live="polite" hidden></p>
                                        <p class="jeopardy-clue-answer" id="jeopardy-clue-answer" hidden></p>
                                    </div>
                                    <div class="jeopardy-clue-actions" id="jeopardy-clue-actions">
                                        <button type="button" class="jeopardy-clue-btn" data-action="all-answers" hidden>spela hela facit</button>
                                        <audio id="jeopardy-clue-audio" preload="none" hidden></audio>
                                        <button type="button" class="jeopardy-clue-btn" data-action="replay" hidden>spela frågan</button>
                                        <button type="button" class="jeopardy-clue-btn" data-action="moppe" hidden>bonus: tio små moppepojkar</button>
                                        <button type="button" class="jeopardy-clue-btn" data-action="swim" hidden>bonus: kan djuret simma?</button>
                                        <span class="jeopardy-extra-scores" aria-label="Poäng för delfrågor" hidden></span>
                                        <button type="button" class="jeopardy-clue-btn" data-action="reveal">visa svar</button>
                                        <button type="button" class="jeopardy-clue-btn jeopardy-clue-btn--score" data-action="correct" hidden>+$0</button>
                                        <button type="button" class="jeopardy-clue-btn jeopardy-clue-btn--score" data-action="wrong" hidden>-$0</button>
                                        <button type="button" class="jeopardy-clue-btn" data-action="next" hidden>nästa fråga →</button>
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

        const players = window.createQuizPlayers({
            bar: root.querySelector('.quiz-player-bar'),
            votes: root.querySelector('.quiz-player-votes'),
            canConfigure: () => !state.activeClue && state.played.size === 0
        });
        const buzzer = window.createQuizBuzzer({
            root: root.querySelector('.quiz-buzzer'), getSeats: () => players.getSeats().map(seat => ({ ...seat, leftLabel: 'Ja', rightLabel: 'Nej' })),
            onFail(index) {
                const active = state.activeClue;
                if (active && !active.round && !active.claimOnly) players.addAt(index, -active.clueData.value);
                updateStats();
            },
            onResolve(index) {
                const active = state.activeClue;
                if (!active || active.resolved) return;
                active.respondent = index;
                const name = index === null ? 'Ingen svarade' : players.getSeats()[index].name;
                if (active.claimOnly && index !== null) {
                    clueMeta.textContent += ` · ${name} svarar`;
                    if (active.clueData.parts) revealBtn.hidden = false;
                    else entry.hidden = false;
                    return;
                }
                active.resolved = true;
                if (active.round) {
                    const round = active.round;
                    round.perfect = round.perfect.map((ok, i) => ok && i === index);
                    if (index !== null) players.addAt(index, 50);
                } else if (index !== null) players.addAt(index, active.clueData.value);
                revealAnswer();
                correctBtn.hidden = wrongBtn.hidden = extraScores.hidden = true;
                clueMeta.textContent += ` · ${index === null ? name : name + ' rätt'}`;
                updateStats();
            }
        });
        function openBuzzer(first = null) {
            const active = state.activeClue;
            if (players.count < 2 || !active || active.clueData.dailyDouble || active.round && !active.round.scored) return;
            active.claimOnly = !active.round && (!entry.hidden || !!active.clueData.parts);
            active.respondent = null;
            active.resolved = false;
            entry.hidden = revealBtn.hidden = true;
            buzzer.open({ first, binary: active.clueData.yes ?? null, claimOnly: active.claimOnly });
        }
        function awardToResponder(points) {
            const seat = state.activeClue?.respondent;
            if (Number.isInteger(seat)) players.addAt(seat, points);
            else players.add(points);
        }
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
        const entry = overlay.querySelector('.jeopardy-entry');
        const input = entry.querySelector('input');
        const entryLabel = entry.querySelector('label');
        const clock = entry.querySelector('.jeopardy-clock');
        const dial = clock.querySelector('svg');
        const period = clock.querySelector('select');
        const readout = clock.querySelector('output');
        const hands = Object.fromEntries(Array.from(dial.querySelectorAll('[data-hand]'), hand => [hand.dataset.hand, hand]));
        const guess = { hour: 12, minute: 0 };
        let drag = null;
        function clockTime() {
            return `${String(guess.hour % 12 + Number(period.value)).padStart(2, '0')}:${String(guess.minute).padStart(2, '0')}`;
        }
        function renderClock() {
            hands.hour.setAttribute('transform', `rotate(${guess.hour * 30 + guess.minute / 2} 80 80)`);
            hands.minute.setAttribute('transform', `rotate(${guess.minute * 6} 80 80)`);
            hands.hour.setAttribute('aria-valuenow', guess.hour);
            hands.minute.setAttribute('aria-valuenow', guess.minute);
            readout.value = clockTime();
        }
        function setHand(hand, value) {
            const modulus = hand === 'hour' ? 12 : 60;
            const wrapped = (value % modulus + modulus) % modulus;
            guess[hand] = hand === 'hour' ? wrapped || 12 : wrapped;
            renderClock();
        }
        dial.addEventListener('pointerdown', event => {
            const hand = event.target.closest('[data-hand]');
            if (!hand || drag || event.button !== 0) return;
            dial.setPointerCapture(event.pointerId);
            drag = { id: event.pointerId, hand: hand.dataset.hand };
        });
        dial.addEventListener('pointermove', event => {
            if (drag?.id !== event.pointerId) return;
            const matrix = dial.getScreenCTM();
            if (!matrix) return;
            const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
            if (Math.hypot(point.x - 80, point.y - 80) < 10) return;
            const angle = Math.atan2(point.x - 80, 80 - point.y) * 180 / Math.PI;
            const hour = drag.hand === 'hour';
            setHand(drag.hand, Math.round((angle - (hour ? guess.minute / 2 : 0)) / (hour ? 30 : 6)));
        });
        dial.addEventListener('lostpointercapture', () => { drag = null; });
        dial.addEventListener('keydown', event => {
            const hand = event.target.dataset.hand;
            const step = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[event.key];
            if (!hand || !step) return;
            event.preventDefault();
            event.stopPropagation();
            setHand(hand, guess[hand] + step);
        });
        period.addEventListener('change', renderClock);
        const entryResult = overlay.querySelector('.jeopardy-entry-result');
        const allAnswersBtn = overlay.querySelector('[data-action=all-answers]');
        const clueAudio = overlay.querySelector('audio');
        const moppeBtn = overlay.querySelector('[data-action=moppe]');
        const swimBtn = overlay.querySelector('[data-action=swim]');
        const extraScores = overlay.querySelector('.jeopardy-extra-scores');
        const replayBtn = overlay.querySelector('[data-action="replay"]');
        const revealBtn = overlay.querySelector('[data-action="reveal"]');

        function playClueAudio() {
            if (!clueAudio.hasAttribute('src')) return;
            clueAudio.currentTime = 0;
            clueAudio.play().catch(() => {}); // The replay button remains available if playback is blocked.
        }
        const nextBtn = overlay.querySelector('[data-action="next"]');
        const pickerBtn = entry.querySelector('[data-action="picker"]');
        pickerBtn.addEventListener('click', () => {
            try { input.showPicker(); } catch { input.focus(); }
        });
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
                if (colData.intro) {
                    const intro = document.createElement('button');
                    intro.type = 'button';
                    intro.className = 'jeopardy-category-intro';
                    intro.setAttribute('aria-label', `${colData.category}: spela kategoriintro`);
                    intro.append(...catEl.childNodes);
                    catEl.append(intro);
                    intro.addEventListener('click', () => {
                        if (state.activeClue) return;
                        state.introduced.add(colData);
                        clueAudio.onended = null;
                        clueAudio.src = colData.intro;
                        playClueAudio();
                    });
                }
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
            players.refresh();
            const sign = players.currentScore < 0 ? '-' : '';
            if (scoreEl) scoreEl.textContent = `poäng: ${sign}$${Math.abs(players.currentScore)}`;
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

        function playCategoryIntro(catData) {
            state.introduced.add(catData);
            const active = state.activeClue;
            const listener = () => {
                if (state.activeClue !== active || state.answerRevealed || overlay.hidden || overlay.classList.contains('is-closing')) return;
                clueAudio.onended = null;
                if (!state.wagerPending) playQuestion(active.clueData, true);
            };
            clueAudio.onended = listener;
            clueAudio.src = catData.intro;
            playClueAudio();
        }

        function playQuestion(clueData, withIntro = false) {
            clueAudio.onended = null;
            if (!clueData.audio) return;
            if (withIntro && clueData.introAudio) {
                clueAudio.src = clueData.introAudio;
                clueAudio.onended = () => {
                    if (state.activeClue?.clueData === clueData && !state.answerRevealed && !overlay.hidden && !overlay.classList.contains('is-closing')) playQuestion(clueData);
                };
                playClueAudio();
                return;
            }
            clueAudio.src = clueData.audio;
            playClueAudio();
            if (clueData.medley) clueAudio.onended = startMedley;
        }

        function showClueContent(catData, clueData, wager, deferAudio = false) {
            state.wagerPending = false;
            state.activeWager = wager;
            wagerBox.hidden = true;
            overlay.classList.remove('is-daily-double');

            const headerCat = [players.count > 1 ? players.currentName : '', clueData.specialCategory || catData.category].filter(Boolean).join(' · ');
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
            clueAudio.pause();
            replayBtn.hidden = !clueData.audio;
            clueAudio.onended = null;
            if (!deferAudio) playQuestion(clueData, true);
            moppeBtn.hidden = true;
            swimBtn.hidden = true;
            extraScores.hidden = true;
            extraScores.replaceChildren();
            overlay.classList.toggle('has-long-clue', (clueData.clue?.length || 0) > 120);
            if (clueData.clue) {
                clueText.textContent = clueData.clue;
                clueText.hidden = false;
            } else {
                clueText.textContent = '';
                clueText.hidden = true;
            }
            state.medleyStarted = false;
            replayBtn.textContent = clueData.medley ? 'starta medley' : 'spela frågan';
            const spelling = catData.category === 'SPELLING BEE' && !clueData.dailyDouble;
            entry.hidden = !spelling && !clueData.medley && !clueData.calendar;
            entryResult.hidden = true;
            input.value = '';
            const kind = clueData.calendar;
            clock.hidden = kind !== 'clock';
            input.hidden = entryLabel.hidden = !clock.hidden;
            input.disabled = !clock.hidden;
            if (!clock.hidden) {
                guess.hour = 12;
                guess.minute = 0;
                period.value = '0';
                renderClock();
            }
            input.type = kind === 'easter' || kind === 'moon' ? 'date' : clueData.medley || kind === 'days' ? 'number' : 'text';
            input.inputMode = kind === 'days' || clueData.medley ? 'numeric' : '';
            input.min = input.type === 'number' ? '0' : '';
            input.max = clueData.medley ? '31' : kind === 'days' ? '366' : '';
            pickerBtn.hidden = input.type !== 'date' || typeof input.showPicker !== 'function';
            nextBtn.hidden = true;
            entry.querySelector('label').textContent = spelling ? 'Skriv stavningen' : clueData.medley ? 'Antal låtar du kände igen (0–31)' : kind === 'clock' ? 'Välj klockslag' : input.type === 'date' ? 'Välj datum' : kind === 'days' ? 'Antal dagar kvar' : 'Skriv ditt svar';
            state.calendarAnswer = clueData.calendar ? calendarAnswer(clueData.calendar) : null;
            clueAnswer.textContent = clueData.answer || '';
            clueAnswer.hidden = true;
            revealBtn.textContent = 'visa svar';
            revealBtn.hidden = !entry.hidden;
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
            if (players.currentScore > 0) {
                const allBtn = document.createElement('button');
                allBtn.type = 'button';
                allBtn.className = 'jeopardy-clue-btn jeopardy-clue-btn--score';
                allBtn.textContent = `allt ($${players.currentScore})`;
                allBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    wagerInput.value = String(players.currentScore);
                });
                wagerPresets.appendChild(allBtn);
            }
            wagerInput.value = String(defaultValue);
        }

        function openFlamingoGame(firstIntro) {
            const active = state.activeClue;
            const roster = players.getSeats();
            const seats = Array.from({ length: Math.min(roster.length, 4) }, (_, i) => (players.currentIndex + i) % roster.length);
            const lineup = seats.map(i => roster[i]);
            const taken = new Set(lineup.flatMap(p => [p.left, p.right]));
            const spare = Array.from('ZXNMJKDFQWUIASOPTYGHBCVELR', k => 'Key' + k).filter(k => !taken.has(k));
            while (lineup.length < 4) lineup.push({ name: `Gäst ${lineup.length - seats.length + 1}`, score: 0, left: spare.shift(), right: spare.shift() });
            let settled = false;
            const dispose = window.openQuizZatacka({
                players: lineup,
                onResult(deltas) {
                    if (settled || !disposeMini || state.activeClue !== active || !Array.isArray(deltas) || deltas.length !== 4 || !deltas.every(Number.isSafeInteger)) return;
                    settled = true;
                    seats.forEach((seat, i) => players.addAt(seat, deltas[i]));
                    updateStats();
                },
                onClose() {
                    if (!disposeMini) return;
                    disposeMini = null;
                    if (!root.isConnected || state.activeClue !== active) return;
                    openBuzzer();
                    if (firstIntro) playCategoryIntro(active.catData);
                    else playQuestion(active.clueData);
                }
            });
            disposeMini = dispose;
        }

        function openClue(colIndex, rowIndex, cellBtn) {
            const key = `${colIndex}-${rowIndex}`;
            if (state.animating || state.activeClue || state.played.has(key)) return;

            const catData = ELIAS_QUIZ_BOARD[colIndex];
            const clueData = catData.clues[rowIndex];

            clueAudio.pause();
            allAnswersBtn.hidden = true;
            state.activeClue = { colIndex, rowIndex, key, cellBtn, catData, clueData };
            state.answerRevealed = false;
            state.animating = true;

            categoryEls.forEach((el, idx) => el.classList.toggle('is-active', idx === colIndex));

            const firstIntro = Boolean(catData.intro && !state.introduced.has(catData));
            if (clueData.round) {
                startRound(clueData.round, clueData.roundTitle || 'RAPID FIRE', true, firstIntro);
            } else if (clueData.dailyDouble) {
                showWager(catData, clueData);
            } else {
                showClueContent(catData, clueData, clueData.value, firstIntro || clueData.zatacka);
                if (!clueData.zatacka) openBuzzer();
            }

            const startTransform = computeFlipTransform(cellBtn);
            overlay.hidden = false;
            overlay.setAttribute('aria-hidden', 'false');
            if (clueData.zatacka) openFlamingoGame(firstIntro);
            else if (firstIntro) playCategoryIntro(catData);
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

        function showWager(catData, clueData) {
            clueAudio.pause();
            clueAudio.onended = null;
            state.answerRevealed = false;
            state.wagerPending = true;
            state.activeWager = clueData.value;
            overlay.classList.add('is-daily-double');
            clueMeta.textContent = `${catData.category} · $${clueData.value}`;
            ddCategoryEl.textContent = `KATEGORI: ${clueData.specialCategory || catData.category}`;
            renderWagerPresets(clueData.value);
            moppeBtn.hidden = swimBtn.hidden = extraScores.hidden = true;
            entry.hidden = entryResult.hidden = replayBtn.hidden = true;
            wagerBox.hidden = false;
            clueImage.removeAttribute('src');
            clueImage.alt = '';
            clueImage.hidden = clueText.hidden = clueAnswer.hidden = true;
            revealBtn.hidden = correctBtn.hidden = wrongBtn.hidden = true;
        }

        function startRound(items, title, scored, deferAudio = false) {
            state.activeClue.round = { items, title, scored, index: 0, correct: 0, finished: false,
                shared: scored && players.count > 1, perfect: Array(players.count).fill(true) };
            showRoundQuestion(deferAudio);
        }

        function showRoundQuestion(deferAudio = false) {
            const active = state.activeClue;
            const { round } = active;
            active.clueData = round.items[round.index];
            state.answerRevealed = false;
            round.mark = false;
            correctBtn.removeAttribute('aria-pressed');
            wrongBtn.removeAttribute('aria-pressed');
            showClueContent(active.catData, active.clueData, round.scored ? 50 : 0, deferAudio);
            clueMeta.textContent = `${round.title} · ${round.index + 1}/${round.items.length}`;
            if (round.shared) {
                if (active.clueData.vote) clueText.textContent = active.clueData.vote;
                openBuzzer(players.currentIndex);
            }
            nextBtn.hidden = round.shared;
            nextBtn.textContent = round.index + 1 === round.items.length ? 'slutför →' : 'nästa fråga →';
        }

        function markRound(correct) {
            const round = state.activeClue?.round;
            if (!round?.scored || round.finished || !state.answerRevealed) return;
            round.mark = correct;
            correctBtn.setAttribute('aria-pressed', String(correct));
            wrongBtn.setAttribute('aria-pressed', String(!correct));
        }

        function advanceRound() {
            const round = state.activeClue?.round;
            if (!round || round.finished || state.animating || (round.shared && !state.answerRevealed)) return;
            players.closeVote();
            if (!round.shared && round.scored && round.mark) {
                round.correct++;
                players.add(50);
            }
            if (++round.index < round.items.length) {
                updateStats();
                showRoundQuestion();
                return;
            }
            round.finished = true;
            clueAudio.pause();
            clueAudio.onended = null;
            nextBtn.hidden = replayBtn.hidden = correctBtn.hidden = wrongBtn.hidden = revealBtn.hidden = true;
            state.answerRevealed = true;
            clueText.hidden = false;
            clueText.textContent = 'RUNDAN ÄR KLAR';
            if (round.shared) {
                players.finishRapid(round.perfect);
                clueAnswer.hidden = false;
                clueAnswer.textContent = `Poängtavlan är uppdaterad. Alla ${round.items.length} rätt ger 50 extra.`;
                moppeBtn.hidden = round.items === moppeRound;
            } else if (round.scored) {
                const bonus = round.correct === round.items.length ? 50 : 0;
                players.add(bonus);
                clueAnswer.hidden = false;
                clueAnswer.textContent = `${round.correct}/${round.items.length} RÄTT · ${round.correct * 50 + bonus} POÄNG${bonus ? ' (50 I BONUS)' : ''}`;
                moppeBtn.hidden = round.items === moppeRound;
            } else {
                clueAnswer.hidden = true;
            }
            updateStats();
        }

        function scoreClue(delta) {
            const active = state.activeClue;
            if (!active || !state.answerRevealed || state.animating) return;
            if (active.clueData.swimBonus) {
                awardToResponder(delta);
                updateStats();
                active.respondent = null;
                active.clueData = active.catData.swim;
                showWager(active.catData, active.clueData);
            } else {
                closeClue(delta);
            }
        }

        function revealAnswer() {
            if (!state.activeClue || buzzer.active || !entry.hidden || state.wagerPending || state.answerRevealed) return;
            state.answerRevealed = true;
            clueAnswer.hidden = false;
            revealBtn.hidden = true;
            correctBtn.hidden = false;
            wrongBtn.hidden = false;
            const { clueData, round, catData, colIndex } = state.activeClue;
            clueAudio.pause();
            clueAudio.onended = null;
            swimBtn.hidden = !clueData.swimBonus;
            if (round?.shared) {
                correctBtn.hidden = wrongBtn.hidden = true;
                nextBtn.hidden = false;
                updateStats();
            } else if (round) {
                correctBtn.hidden = !round.scored;
                correctBtn.textContent = 'rätt +50';
                wrongBtn.hidden = !round.scored;
                wrongBtn.textContent = 'fel';
            } else if (clueData.parts) {
                correctBtn.hidden = wrongBtn.hidden = true;
                extraScores.hidden = false;
                for (let i = 0; i <= clueData.parts; i++) {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'jeopardy-clue-btn';
                    button.dataset.action = 'parts';
                    button.dataset.points = String(i * 100);
                    button.textContent = `${i} rätt (+${i * 100})`;
                    extraScores.append(button);
                }
            }
            if (clueData.answerAudio) {
                clueAudio.onended = null;
                clueAudio.src = clueData.answerAudio;
                replayBtn.textContent = 'spela facit igen';
                playClueAudio();
                allAnswersBtn.hidden = catData.category !== 'FIXA SVENGELSKAN' || !catData.clues.every((_, row) => state.played.has(`${colIndex}-${row}`));
            }
        }

        function closeClue(scoreDelta) {
            if (!state.activeClue || state.animating) return;
            clueAudio.pause();
            if (typeof scoreDelta === 'number' && scoreDelta !== 0) {
                awardToResponder(scoreDelta);
                updateStats();
            }

            const { cellBtn } = state.activeClue;
            players.closeVote();
            buzzer.close();
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
                players.rotate();
                updateStats();
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

        function startMedley() {
            if (!state.activeClue?.clueData.medley || overlay.hidden || state.answerRevealed) return;
            clueAudio.onended = null;
            state.medleyStarted = true;
            clueAudio.src = 'images/quiz/dagar/medley.mp3';
            replayBtn.textContent = 'spela medley igen';
            playClueAudio();
        }

        entry.addEventListener('click', event => event.stopPropagation());
        entry.addEventListener('submit', async event => {
            event.preventDefault();
            if (!state.activeClue || entry.hidden || state.answerRevealed) return;
            const active = state.activeClue;
            const { clueData } = active;
            const response = clueData.calendar === 'clock' ? clockTime() : input.value;
            let points;
            entryResult.replaceChildren();
            if (clueData.medley) {
                points = Number(response) * 100;
            } else if (clueData.calendar) {
                const answer = await state.calendarAnswer;
                if (state.activeClue !== active || state.answerRevealed || state.animating) return;
                const normalize = text => text.toLocaleLowerCase('sv-SE').trim().replace(/\s+/g, ' ');
                const typed = normalize(response), expected = normalize(answer || '');
                let correct = typed === expected;
                if (clueData.calendar === 'clock') {
                    correct = typed.replace('.', ':').padStart(5, '0') === expected;
                } else if (clueData.calendar === 'days') {
                    correct = typed.replace(/ dagar?$/, '') === expected.split(' ')[0];
                } else if (clueData.calendar === 'names' && expected.includes(' och ')) {
                    const names = text => text.split(/\s*(?:,| och |&|\/)\s*/).sort().join('|');
                    correct = names(typed) === names(expected);
                } else if (clueData.calendar !== 'names') {
                    const day = expected.replace(/^påskdagen: /, '').replace(/ \d{4}$/, '');
                    const months = 'januari februari mars april maj juni juli augusti september oktober november december'.split(' ');
                    const [d, m] = day.split(' ');
                    const iso = `${expected.slice(-4)}-${String(months.indexOf(m) + 1).padStart(2, '0')}-${d?.padStart(2, '0')}`;
                    correct ||= typed === iso;
                    const numeric = typed.match(/^(\d{1,2})[/.](\d{1,2})$/);
                    correct ||= typed === day || typed === `${day} ${expected.slice(-4)}` || (numeric && Number(numeric[1]) === Number(d) && Number(numeric[2]) === months.indexOf(m) + 1);
                }
                points = answer && correct ? clueData.value : 0;
                clueAnswer.textContent = answer || 'Facit saknas i kalendern';
            } else {
                const letters = text => Array.from(text.normalize('NFC').toLocaleUpperCase('sv-SE').replace(/[^\p{L}]/gu, ''));
                const typed = letters(input.value), expected = letters(clueData.answer);
                points = 0;
                typed.forEach((letter, i) => {
                    const span = document.createElement('span');
                    span.textContent = letter;
                    if (letter === expected[i]) { span.className = 'is-correct'; points++; }
                    entryResult.append(span);
                });
            }
            clueAudio.pause();
            state.answerRevealed = true;
            awardToResponder(points);
            updateStats();
            entry.hidden = true;
            entryResult.append(document.createTextNode(` +${points} poäng`));
            entryResult.hidden = false;
            clueAnswer.hidden = !clueData.answer && !clueData.calendar;
            if (clueData.medley) {
                clueAudio.onended = null;
                clueAudio.src = 'images/quiz/dagar/facit.mp3';
                replayBtn.textContent = 'spela facit igen';
                playClueAudio();
            }
        });

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
                if (action === 'all-answers' && !allAnswersBtn.hidden) {
                    clueAudio.src = 'images/quiz/svengelska/svengelska_facit.mp3';
                    playClueAudio();
                } else if (action === 'moppe' && state.activeClue && !moppeBtn.hidden) {
                    startRound(moppeRound, 'TIO SMÅ MOPPEPOJKAR', false);
                } else if (action === 'swim' && state.activeClue && !swimBtn.hidden) {
                    scoreClue(0);
                } else if (action === 'parts' && !extraScores.hidden) {
                    scoreClue(Number(actionBtn.dataset.points));
                } else if (action === 'replay') {
                    if (state.activeClue?.clueData.medley && !state.medleyStarted && !state.answerRevealed) startMedley();
                    else if (state.activeClue?.catData.intro && clueAudio.getAttribute('src') === state.activeClue.catData.intro) playQuestion(state.activeClue.clueData);
                    else playClueAudio();
                } else if (action === 'reveal') {
                    revealAnswer();
                } else if (action === 'correct' && state.activeClue) {
                    if (state.activeClue.round) markRound(true);
                    else scoreClue(state.activeWager);
                } else if (action === 'wrong' && state.activeClue) {
                    if (state.activeClue.round) markRound(false);
                    else scoreClue(-state.activeWager);
                } else if (action === 'next') {
                    advanceRound();
                } else if (action === 'close') {
                    closeClue(0);
                }
                return;
            }

            if (state.wagerPending || (state.activeClue?.round && state.answerRevealed)) return;

            if (!state.answerRevealed) {
                revealAnswer();
            } else {
                closeClue(0);
            }
        });

        function resetBoard() {
            clueAudio.pause();
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
            state.introduced.clear();
            buzzer.close();
            players.closeVote();
            players.resetScores();
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
            resetBtn.addEventListener('click', () => {
                if (players.count === 1 || confirm('Nollställa brädet och alla spelares poäng?')) resetBoard();
            });
        }

        keydownHandler = (event) => {
            if (!document.getElementById('jeopardy-root')) {
                cleanupJeopardyQuiz();
                return;
            }
            if (disposeMini || buzzer.handleKey(event) || players.handleKey(event)) return;
            if (event.target?.closest?.('dialog[open]')) return;
            if (!state.activeClue) {
                if ((event.key === 'r' || event.key === 'R') && !event.metaKey && !event.ctrlKey) {
                    if (players.count === 1 || confirm('Nollställa brädet och alla spelares poäng?')) resetBoard();
                }
                return;
            }
            if (buzzer.active && event.key !== 'Escape') return;
            if (event.key === 'Escape') {
                event.preventDefault();
                closeClue(0);
            } else if (event.key === 'ArrowRight' && state.activeClue.round && !nextBtn.hidden && !event.target?.closest?.('input, select, textarea')) {
                event.preventDefault();
                if (!event.repeat) advanceRound();
            } else if (event.key === ' ' || event.key === 'Enter') {
                if (state.wagerPending) return;
                if (event.target?.closest?.('button, input')) return;
                event.preventDefault();
                if (!state.answerRevealed) {
                    revealAnswer();
                } else {
                    if (state.activeClue.round && !nextBtn.hidden) advanceRound();
                    else closeClue(0);
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
