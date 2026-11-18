/*
 * quiz-date-contest.js — allas individuella försök på DAGAR OCH TID.
 *
 * Kontrakt:
 *   window.createDateContest({root, getSeats}) => {
 *     open({kind, referenceTime, answer, value, onTurn, onFinish}),
 *     submit(raw), handleKey(event), close(), get active
 *   }
 *
 * kind: 'easter' | 'moon' | 'names' | 'clock' | 'medley' (även 'days').
 *   easter/moon : datum. Närmast facit vinner (kalenderdagar, inte DST).
 *   clock       : HH:MM. Närmast vinner, cirkulär minutskillnad kring midnatt.
 *   days        : heltal dagar. Närmast vinner.
 *   names       : namn. Proportionellt antal rätt namn; alla fel ger noll.
 *   medley      : antal 0–31. 100 poäng per rätt låt; högst antal vinner jämförelsen.
 *
 * submit(raw) svarar {ok:true, seat, done, remaining} eller
 *   {ok:false, reason:'closed'|'finished'|'no-seat'|'answered'|'invalid', error}.
 *   Vid ok:false ligger formuläret kvar öppet — Lead behöver inte göra något.
 *
 * onTurn(index)  : Lead rensar input och visar sitt formulär för säte index.
 *                  onTurn(-1) = dölj formuläret (mellan försök / före val).
 * onFinish({answerText, summary, awards, rule, rows}) anropas exakt en gång,
 *   när alla säten svarat. awards är heltal per säte, i sätesordning.
 *
 * Modulen äger nummerknappar 1–6, instruktion/status, validering, dolt svar
 * per säte och jämförelsen. Lead äger formulär, input, analog klocka, data,
 * ljud och utdelning av poäng.
 */
(function (root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.createDateContest = factory();
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  var DEFAULT_COLORS = ['#ff5c8a', '#4dd8ff', '#ffd166', '#82f2a2', '#f97316', '#a855f7'];
  var MAX_SEATS = 6;
  var MONTHS = ['januari', 'februari', 'mars', 'april', 'maj', 'juni',
    'juli', 'augusti', 'september', 'oktober', 'november', 'december'];
  var MONTH_ALIASES = {
    jan: 1, feb: 2, mar: 3, apr: 4, maj: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, sept: 9, okt: 10, nov: 11, dec: 12
  };
  var NEAREST_KINDS = { easter: true, moon: true, clock: true, days: true };

  var LABELS = {
    easter: {
      heading: 'Påskdagen — alla gissar',
      rule: 'Närmast påskdagen vinner. Exakt datum eller minsta avvikelse i kalenderdagar ger beloppet; delad vinst vid samma avvikelse.',
      prompt: 'Skriv påskdagens datum.'
    },
    moon: {
      heading: 'Nästa fullmåne — alla gissar',
      rule: 'Närmast fullmånen vinner. Exakt datum eller minsta avvikelse i kalenderdagar ger beloppet; delad vinst vid samma avvikelse.',
      prompt: 'Skriv datumet för nästa fullmåne.'
    },
    clock: {
      heading: 'Vad är klockan nu? — alla gissar',
      rule: 'Närmast rätt tid vinner. Avvikelsen räknas i minuter runt midnatt, så 23:58 ligger 2 minuter från 00:00. Delad vinst vid samma avvikelse.',
      prompt: 'Ställ in klockan.'
    },
    days: {
      heading: 'Dagar kvar — alla gissar',
      rule: 'Närmast rätt antal dagar vinner. Minsta avvikelse ger beloppet; delad vinst vid samma avvikelse.',
      prompt: 'Skriv antal dagar.'
    },
    names: {
      heading: 'Namnsdag — alla gissar',
      rule: 'Ett poäng per rätt namn, proportionellt mot antalet namn i facit. Högst antal rätt vinner jämförelsen. Alla fel ger noll poäng.',
      prompt: 'Skriv dagens namn.'
    },
    medley: {
      heading: 'Max Martin-medley — alla gissar',
      rule: '100 poäng per rätt låt och var och en behåller sina poäng. Högst antal rätt vinner jämförelsen.',
      prompt: 'Ange hur många av medleys 31 låtar du kände igen (0–31).'
    }
  };

  var INVALID = {
    easter: 'Skriv ett datum, till exempel 5 april 2026 eller 2026-04-05.',
    moon: 'Skriv ett datum, till exempel 3 januari 2026 eller 2026-01-03.',
    clock: 'Ange ett klockslag som 19:43.',
    days: 'Ange antal dagar som ett heltal, till exempel 62.',
    names: 'Skriv minst ett namn.',
    medley: 'Ange antal rätt låtar som ett heltal 0–31.'
  };

  /* ---------- rena hjälpare (testbara utan DOM) ---------- */

  function normalize(value) {
    return String(value == null ? '' : value)
      .normalize('NFC')
      .toLocaleLowerCase('sv-SE')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/[.!]+$/, '');
  }

  function monthFromWord(word) {
    if (!word) return null;
    var w = String(word).replace(/[^a-zåäö]/g, '');
    var index = MONTHS.indexOf(w);
    if (index >= 0) return index + 1;
    if (MONTH_ALIASES[w]) return MONTH_ALIASES[w];
    if (w.length > 3 && MONTH_ALIASES[w.slice(0, 3)]) return MONTH_ALIASES[w.slice(0, 3)];
    return null;
  }

  function makeDate(year, month, day) {
    if (!Number.isInteger(month) || month < 1 || month > 12) return null;
    if (!Number.isInteger(day) || day < 1 || day > 31) return null;
    if (!Number.isInteger(year)) return { year: null, month: month, day: day };
    var probe = new Date(Date.UTC(year, month - 1, day));
    if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) return null;
    return { year: year, month: month, day: day };
  }

  // Läser svenska datum, ISO-datum och kortformer. Årtal får saknas.
  function parseDateParts(raw) {
    var s = normalize(raw);
    if (!s) return null;
    s = s.replace(/^(påskdagen|påsk|nästa fullmåne|fullmåne|fullmane|datum)\s*[:·-]?\s*/, '');
    s = s.replace(/\b(kl|klockan|den)\b\.?/g, ' ');
    s = s.replace(/^(?:söndag|måndag|tisdag|onsdag|torsdag|fredag|lördag|sön|mån|tis|ons|tors|fre|lör)\s+(?=\d|\w+\s+\d)/, ' ');
    var iso = s.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (iso) return makeDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
    var year = null;
    var yearMatch = s.match(/\b((?:19|20|21)\d{2})\b/);
    if (yearMatch) {
      year = Number(yearMatch[1]);
      s = s.replace(yearMatch[1], ' ');
    }
    s = s.replace(/(\d{1,2})\s*[:.]\s*e\b/g, '$1').replace(/(\d{1,2})\s*:\s*a\b/g, '$1').replace(/(\d{1,2})e\b/g, '$1');
    var dayFirst = s.match(/(\d{1,2})\s+([a-zåäö]+)/);
    if (dayFirst) {
      var monthA = monthFromWord(dayFirst[2]);
      if (monthA) return makeDate(year, monthA, Number(dayFirst[1]));
    }
    var monthFirst = s.match(/([a-zåäö]+)\s+(\d{1,2})\b/);
    if (monthFirst) {
      var monthB = monthFromWord(monthFirst[1]);
      if (monthB) return makeDate(year, monthB, Number(monthFirst[2]));
    }
    var numeric = s.match(/(\d{1,2})\s*[/.-]\s*(\d{1,2})(?:\s*[/.-]\s*(\d{2,4}))?/);
    if (numeric) {
      var y = year;
      if (numeric[3]) {
        y = Number(numeric[3]);
        if (y < 100) y += 2000;
      }
      return makeDate(y, Number(numeric[2]), Number(numeric[1]));
    }
    return null;
  }

  function parseClock(raw) {
    var s = normalize(raw).replace(/\s+/g, '').replace(/\u2013/g, '-');
    if (!s) return null;
    var match = s.match(/^(\d{1,2})[:.](\d{2})$/);
    if (!match) match = s.match(/^(\d{1,2})(\d{2})$/);
    var hours;
    var minutes;
    if (match) {
      hours = Number(match[1]);
      minutes = Number(match[2]);
    } else {
      var bare = s.match(/^(\d{1,2})$/);
      if (!bare) return null;
      hours = Number(bare[1]);
      minutes = 0;
    }
    if (!Number.isInteger(hours) || hours < 0 || hours > 23) return null;
    if (!Number.isInteger(minutes) || minutes < 0 || minutes > 59) return null;
    return { hour: hours, minute: minutes, total: hours * 60 + minutes };
  }

  function parseCount(raw, min, max) {
    var text = String(raw == null ? '' : raw).replace(',', '.').trim();
    if (!text) return null;
    var match = text.match(/-?\d+(?:\.\d+)?/);
    if (!match) return null;
    var number = Number(match[0]);
    if (!Number.isFinite(number)) return null;
    var rounded = Math.round(number);
    if (rounded < min || rounded > max) return null;
    return rounded;
  }

  function parseNameList(raw) {
    var s = normalize(raw);
    if (!s) return null;
    if (/^ingen\b/.test(s)) return { none: true, names: [] };
    var raw = String(raw).normalize('NFC');
    var display = raw.split(/[,;\/&+]|\soch\s|\s+/)
      .map(function (part) {
        return part.replace(/[^\p{L}\-']/gu, '');
      })
      .filter(function (part) { return part.length > 0; });
    var names = display.map(function (part) { return part.toLocaleLowerCase('sv-SE'); });
    if (!names.length) return null;
    return { none: false, names: names, display: display.join(', ') };
  }

  function parseForKind(kind, raw, referenceTime) {
    if (kind === 'easter' || kind === 'moon') return parseDateParts(raw);
    if (kind === 'clock') return parseClock(raw);
    if (kind === 'days') return parseCount(raw, 0, 400);
    if (kind === 'medley') return parseCount(raw, 0, 31);
    if (kind === 'names') return parseNameList(raw);
    var text = normalize(raw);
    return text ? { text: text } : null;
  }

  function formatSwedishDate(parts) {
    if (!parts) return '';
    var text = parts.day + ' ' + MONTHS[parts.month - 1];
    if (Number.isInteger(parts.year)) text += ' ' + parts.year;
    return text;
  }

  function dayIndex(parts) {
    return Math.round(Date.UTC(parts.year, parts.month - 1, parts.day) / 86400000);
  }

  function formatDistance(kind, value) {
    if (!Number.isFinite(value)) return '—';
    if (kind === 'clock') return value + (value === 1 ? ' minut' : ' minuter');
    return value + (value === 1 ? ' dag' : ' dagar');
  }

  function labelFor(kind, parsed) {
    if (!parsed) return '';
    if (kind === 'easter' || kind === 'moon') return formatSwedishDate(parsed);
    if (kind === 'clock') {
      return (parsed.hour < 10 ? '0' : '') + parsed.hour + ':' + (parsed.minute < 10 ? '0' : '') + parsed.minute;
    }
    if (kind === 'days') return parsed + ' dagar';
    if (kind === 'medley') return parsed + (parsed === 1 ? ' rätt låt' : ' rätt låtar');
    if (kind === 'names') {
      if (parsed.none) return 'ingen namnsdag';
      return parsed.display || parsed.names.join(', ');
    }
    return parsed.text || '';
  }

  function clockDistance(a, b) {
    var diff = Math.abs(a - b);
    return Math.min(diff, 1440 - diff);
  }

  // Årtal som saknas i gissningen prövas mot facits år och grannåren.
  function dateDistance(guess, truth) {
    if (!truth || !Number.isInteger(truth.year)) return NaN;
    if (Number.isInteger(guess.year)) return Math.abs(dayIndex(guess) - dayIndex(truth));
    var best = Infinity;
    for (var offset = -1; offset <= 1; offset += 1) {
      var candidate = { year: truth.year + offset, month: guess.month, day: guess.day };
      var probe = new Date(Date.UTC(candidate.year, candidate.month - 1, candidate.day));
      if (probe.getUTCMonth() !== candidate.month - 1 || probe.getUTCDate() !== candidate.day) continue;
      best = Math.min(best, Math.abs(dayIndex(candidate) - dayIndex(truth)));
    }
    return best;
  }

  function countCorrectNames(guessed, truth) {
    if (!truth) return 0;
    if (truth.none) return guessed && guessed.none ? 1 : 0;
    if (!guessed || guessed.none) return 0;
    var remaining = truth.names.slice();
    var correct = 0;
    guessed.names.forEach(function (name) {
      var index = remaining.indexOf(name);
      if (index >= 0) {
        remaining.splice(index, 1);
        correct += 1;
      }
    });
    return correct;
  }

  function joinNames(list, conjunction) {
    if (!list.length) return '';
    if (list.length === 1) return list[0];
    return list.slice(0, -1).join(', ') + ' ' + conjunction + ' ' + list[list.length - 1];
  }

  /**
   * Ren jämförelse. answers[i] = {parsed, label} eller null.
   * Ger {awards, rows, winners, rule, summary, answerText}.
   */
  function evaluateContest(config) {
    var kind = config.kind;
    var seats = config.seats;
    var answers = config.answers;
    var value = Number.isFinite(config.value) ? Math.max(0, Math.round(config.value)) : 0;
    var answerText = typeof config.answerText === 'string' ? config.answerText : '';
    var labels = LABELS[kind] || { rule: '' };
    var rows = seats.map(function (seat, index) {
      var entry = answers[index] || null;
      return {
        index: index,
        name: seat.name,
        color: seat.color,
        answered: Boolean(entry),
        label: entry ? entry.label : '',
        distance: NaN,
        correct: 0,
        points: 0,
        winner: false
      };
    });
    var awards = rows.map(function () { return 0; });
    var summary = '';
    var winners = [];

    if (kind === 'medley') {
      rows.forEach(function (row) {
        var entry = answers[row.index];
        var count = entry && Number.isFinite(entry.parsed) ? entry.parsed : 0;
        row.correct = count;
        row.points = count * 100;
        awards[row.index] = row.points;
      });
      var answeredRows = rows.filter(function (row) { return row.answered; });
      var best = answeredRows.reduce(function (top, row) { return Math.max(top, row.correct); }, 0);
      winners = best > 0
        ? answeredRows.filter(function (row) { return row.correct === best; }).map(function (row) { return row.index; })
        : [];
      winners.forEach(function (index) { rows[index].winner = true; });
      if (!answeredRows.length) {
        summary = 'Ingen svarade. Inga poäng delas ut.';
      } else {
        var winnerNames = winners.map(function (index) { return seats[index].name; });
        summary = joinNames(winnerNames, 'och') + ' vinner jämförelsen med ' + best +
          (best === 1 ? ' rätt låt' : ' rätt låtar') + ' (' + best * 100 + ' poäng).';
      }
      return { kind: kind, awards: awards, rows: rows, winners: winners, rule: labels.rule, summary: summary, answerText: '', value: value };
    }

    if (kind === 'names') {
      var truthNames = config.truth && config.truth.none ? { none: true, names: [] } : config.truth;
      var expectedCount = truthNames && truthNames.names ? truthNames.names.length : 0;
      if (truthNames && truthNames.none) expectedCount = 1;
      rows.forEach(function (row) {
        var entry = answers[row.index];
        row.correct = entry ? countCorrectNames(entry.parsed, truthNames) : 0;
        row.points = expectedCount > 0 && row.correct > 0
          ? Math.round(value * row.correct / expectedCount)
          : 0;
        awards[row.index] = row.points;
      });
      var mostCorrect = rows.reduce(function (top, row) { return Math.max(top, row.correct); }, 0);
      winners = mostCorrect > 0
        ? rows.filter(function (row) { return row.correct === mostCorrect; }).map(function (row) { return row.index; })
        : [];
      winners.forEach(function (index) { rows[index].winner = true; });
      if (mostCorrect === 0) {
        summary = 'Alla hade fel. På namnsdag delas inga poäng ut när ingen har rätt.';
      } else {
        var bestNames = winners.map(function (index) { return seats[index].name; });
        summary = joinNames(bestNames, 'och') + ' vinner jämförelsen med ' + mostCorrect +
          ' av ' + expectedCount + ' rätt (' + awards[winners[0]] + ' poäng).';
      }
      return { kind: kind, awards: awards, rows: rows, winners: winners, rule: labels.rule, summary: summary, answerText: answerText, value: value };
    }

    // Närmast-vinner: easter, moon, clock, days.
    var valid = [];
    rows.forEach(function (row) {
      var entry = answers[row.index];
      if (!entry) return;
      var parsed = entry.parsed;
      var distance = NaN;
      if (kind === 'clock') {
        if (config.truthClock && parsed) distance = clockDistance(parsed.total, config.truthClock.total);
      } else if (kind === 'days') {
        if (Number.isFinite(parsed) && Number.isFinite(config.truthNumber)) distance = Math.abs(parsed - config.truthNumber);
      } else {
        distance = dateDistance(parsed, config.truth);
      }
      row.distance = distance;
      if (Number.isFinite(distance)) valid.push(row);
    });

    if (!valid.length) {
      var anyAnswer = rows.some(function (row) { return row.answered; });
      summary = anyAnswer
        ? 'Ingen gissning kunde jämföras med facit. Inga poäng delas ut.'
        : 'Ingen svarade. Inga poäng delas ut.';
      return { kind: kind, awards: awards, rows: rows, winners: [], rule: labels.rule, summary: summary, answerText: answerText, value: value };
    }

    var shortest = valid.reduce(function (best, row) { return Math.min(best, row.distance); }, Infinity);
    valid.forEach(function (row) {
      if (row.distance === shortest) {
        row.winner = true;
        row.points = value;
        awards[row.index] = value;
      }
    });
    winners = valid.filter(function (row) { return row.winner; }).map(function (row) { return row.index; });
    var winnerList = winners.map(function (index) { return seats[index].name; });
    var distanceText = formatDistance(kind, shortest);
    summary = shortest === 0
      ? joinNames(winnerList, 'och') + (winners.length > 1 ? ' delar' : '') + ' vinner med exakt rätt (' + value + ' poäng).'
      : joinNames(winnerList, 'och') + (winners.length > 1 ? ' delar' : '') + ' vinsten med ' + distanceText +
        's avvikelse (' + value + ' poäng).';
    return { kind: kind, awards: awards, rows: rows, winners: winners, rule: labels.rule, summary: summary, answerText: answerText, value: value };
  }

  /* ---------- DOM ---------- */

  function ensureStylesheet() {
    if (typeof document === 'undefined') return;
    var existing = document.querySelector('link[data-quiz-date-contest-css], link[href*="quiz-date-contest.css"]');
    if (existing) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './css/quiz-date-contest.css';
    link.setAttribute('data-quiz-date-contest-css', 'true');
    document.head.appendChild(link);
  }

  function node(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text != null) element.textContent = text;
    return element;
  }

  function isInactiveField(element) {
    if (!element || element.nodeType !== 1) return false;
    if (typeof element.closest === 'function' && element.closest('[hidden]')) return true;
    if (typeof element.getClientRects === 'function' && element.getClientRects().length === 0) return true;
    return false;
  }

  function createDateContest(options) {
    var opts = options || {};
    var rootOption = opts.root;
    var getSeatsFn = typeof opts.getSeats === 'function' ? opts.getSeats : function () { return []; };

    var ui = null;
    var state = null;
    var runToken = 0;

    function resolveRoot() {
      if (typeof document === 'undefined') return null;
      if (typeof rootOption === 'string') return document.querySelector(rootOption);
      if (rootOption && rootOption.nodeType === 1) return rootOption;
      return document.querySelector('.quiz-date-contest');
    }

    function readSeats() {
      var raw = getSeatsFn();
      var list = Array.isArray(raw) ? raw.slice(0, MAX_SEATS) : [];
      var seats = list.map(function (seat, index) {
        var name = seat && typeof seat.name === 'string' && seat.name.trim() ? seat.name.trim() : 'Spelare ' + (index + 1);
        var color = seat && typeof seat.color === 'string' && seat.color ? seat.color : DEFAULT_COLORS[index % DEFAULT_COLORS.length];
        return { index: index, name: name, color: color };
      });
      if (!seats.length) seats = [{ index: 0, name: 'Spelare 1', color: DEFAULT_COLORS[0] }];
      return seats;
    }

    function mount(container) {
      container.replaceChildren();
      container.hidden = false;
      container.classList.add('qdc');
      container.setAttribute('role', 'group');
      container.setAttribute('aria-label', 'Datum- och tidstävling');

      var head = node('div', 'qdc-head');
      var heading = node('p', 'qdc-heading');
      heading.setAttribute('aria-live', 'off');
      var instruction = node('p', 'qdc-instruction');
      var ruleHint = node('p', 'qdc-rule qdc-rule-hint');
      var status = node('p', 'qdc-status');
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      head.append(heading, instruction, ruleHint, status);

      var tabWrap = node('div', 'qdc-tabs');
      var tabLabel = node('span', 'qdc-tabs-label', 'Välj spelare');
      var tabs = node('div', 'qdc-tablist');
      tabs.setAttribute('role', 'tablist');
      tabs.setAttribute('aria-label', 'Välj spelare med siffra 1–6 eller klick');
      tabWrap.append(tabLabel, tabs);

      var result = node('div', 'qdc-result');
      result.hidden = true;
      var facit = node('p', 'qdc-facit');
      var ruleEl = node('p', 'qdc-rule');
      var summaryEl = node('p', 'qdc-summary');
      var table = node('table', 'qdc-table');
      var caption = node('caption', 'qdc-caption', 'Jämförelse');
      var thead = node('thead');
      var tbody = node('tbody');
      table.append(caption, thead, tbody);
      result.append(facit, ruleEl, summaryEl, table);

      container.append(head, tabWrap, result);

      tabs.addEventListener('click', function (event) {
        var button = event.target && event.target.closest ? event.target.closest('[data-qdc-seat]') : null;
        if (!button || button.disabled) return;
        event.preventDefault();
        event.stopPropagation();
        chooseSeat(Number(button.getAttribute('data-qdc-seat')));
      });

      return {
        container: container,
        heading: heading,
        instruction: instruction,
        ruleHint: ruleHint,
        status: status,
        tabs: tabs,
        result: result,
        facit: facit,
        rule: ruleEl,
        summary: summaryEl,
        table: table,
        thead: thead,
        tbody: tbody,
        seatButtons: []
      };
    }

    function currentLabels() {
      return LABELS[state && state.kind] || LABELS.easter;
    }

    function answeredCount() {
      if (!state) return 0;
      return state.answers.filter(Boolean).length;
    }

    function renderTabs() {
      if (!ui) return;
      ui.tabs.replaceChildren();
      ui.seatButtons = state.seats.map(function (seat, index) {
        var answered = Boolean(state.answers[index]);
        var active = state.activeSeat === index && !state.finished;
        var button = node('button', 'qdc-tab');
        button.type = 'button';
        button.setAttribute('data-qdc-seat', String(index));
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', String(active));
        button.disabled = answered || state.finished;
        if (answered) button.setAttribute('aria-disabled', 'true');
        button.style.setProperty('--qdc-seat-color', seat.color);
        button.classList.toggle('is-answered', answered);
        button.classList.toggle('is-active', active);

        var key = node('span', 'qdc-tab-key', String(index + 1));
        key.setAttribute('aria-hidden', 'true');
        var name = node('span', 'qdc-tab-name', seat.name);
        var hint = node('span', 'qdc-tab-state',
          answered ? 'svarat' : active ? 'svarar nu' : state.finished ? '—' : 'väntar');
        button.append(key, name, hint);
        button.setAttribute('aria-label',
          'Spelare ' + (index + 1) + ', ' + seat.name + ', ' +
          (answered ? 'har svarat' : active ? 'svarar nu' : 'väntar') + '. Välj med siffran ' + (index + 1) + '.');
        return button;
      });
      ui.tabs.append.apply(ui.tabs, ui.seatButtons);
    }

    function render() {
      if (!ui || !state) return;
      var labels = currentLabels();
      var total = state.seats.length;
      var done = answeredCount();
      ui.heading.textContent = labels.heading;
      ui.instruction.textContent = state.finished
        ? 'Alla svar är inlämnade. Facit och jämförelse visas nedan.'
        : labels.prompt + ' Svaren är dolda tills alla har svarat.';
      ui.ruleHint.textContent = state.finished ? '' : labels.rule;
      if (!state.finished) {
        if (state.activeSeat !== null) {
          ui.status.textContent = state.seats[state.activeSeat].name + ' svarar. ' +
            done + ' av ' + total + ' har svarat.';
        } else {
          ui.status.textContent = done + ' av ' + total + ' har svarat. ' +
            (done === 0 ? 'Välj spelare med knapparna eller siffrorna 1–6.' : 'Välj nästa spelare.');
        }
      } else {
        ui.status.textContent = '';
      }
      renderTabs();
    }

    function renderResult(outcome) {
      if (!ui) return;
      ui.result.hidden = false;
      ui.facit.textContent = outcome.answerText
        ? 'Facit: ' + outcome.answerText
        : 'Facit: se facitljudet.';
      ui.facit.hidden = false;
      ui.rule.textContent = 'Regel: ' + (outcome.rule || '');
      ui.summary.textContent = outcome.summary;

      var showsDistance = NEAREST_KINDS[outcome.kind] === true;
      var headerRow = node('tr');
      ['Spelare', 'Svar', showsDistance ? 'Avvikelse' : outcome.kind === 'medley' ? 'Rätt' : 'Rätt namn', 'Poäng']
        .forEach(function (text) {
          var th = node('th', null, text);
          th.scope = 'col';
          headerRow.append(th);
        });
      ui.thead.replaceChildren(headerRow);
      ui.tbody.replaceChildren.apply(ui.tbody, outcome.rows.map(function (row) {
        var tr = node('tr');
        tr.classList.toggle('is-winner', row.winner);
        if (!row.answered) tr.classList.add('is-empty');
        var nameCell = node('td', 'qdc-cell-name');
        var swatch = node('span', 'qdc-swatch');
        swatch.style.background = row.color;
        swatch.setAttribute('aria-hidden', 'true');
        nameCell.append(swatch, document.createTextNode(row.name));
        var answerCell = node('td', 'qdc-cell-answer', row.answered ? row.label : 'inget svar');
        var middleCell = showsDistance
          ? node('td', 'qdc-cell-distance', row.answered ? formatDistance(outcome.kind, row.distance) : '—')
          : node('td', 'qdc-cell-correct', outcome.kind === 'medley'
            ? String(row.correct)
            : (state.truthCount ? row.correct + ' av ' + state.truthCount : String(row.correct)));
        var pointsCell = node('td', 'qdc-cell-points', (row.points > 0 ? '+' : '') + row.points);
        tr.append(nameCell, answerCell, middleCell, pointsCell);
        return tr;
      }));
    }

    function report(seatIndex) {
      if (state && typeof state.onTurn === 'function') {
        try {
          state.onTurn(seatIndex);
        } catch (error) {
          if (typeof console !== 'undefined' && console.warn) console.warn('date-contest: onTurn misslyckades', error);
        }
      }
    }

    function chooseSeat(index) {
      if (!state || state.finished) return;
      if (!Number.isInteger(index) || index < 0 || index >= state.seats.length) return;
      if (state.answers[index]) {
        if (ui) {
          ui.status.textContent = state.seats[index].name + ' har redan svarat. Välj en annan spelare.';
        }
        return;
      }
      if (state.activeSeat === index) return;
      state.activeSeat = index;
      report(index);
      render();
    }

    function finish() {
      if (!state || state.finished) return;
      var current = state;
      var ticket = ++runToken;
      state.finished = true;
      state.activeSeat = null;
      report(-1);
      render();
      Promise.resolve(current.answerSource).then(function (answerText) {
        if (ticket !== runToken || state !== current) return;
        var text = typeof answerText === 'string' ? answerText : '';
        current.answerText = text;
        var outcome = buildOutcome(current, text);
        current.outcome = outcome;
        renderResult(outcome);
        if (typeof current.onFinish === 'function') {
          try {
            current.onFinish({
              answerText: outcome.answerText,
              summary: outcome.summary,
              awards: outcome.awards.slice(),
              rule: outcome.rule,
              rows: outcome.rows.map(function (row) { return Object.assign({}, row); })
            });
          } catch (error) {
            if (typeof console !== 'undefined' && console.warn) console.warn('date-contest: onFinish misslyckades', error);
          }
        }
      }).catch(function (error) {
        if (ticket !== runToken || state !== current) return;
        var outcome = buildOutcome(current, '');
        outcome.summary = 'Facit kunde inte läsas. Inga poäng delas ut.';
        outcome.awards = current.seats.map(function () { return 0; });
        current.outcome = outcome;
        renderResult(outcome);
        if (typeof current.onFinish === 'function') {
          try {
            current.onFinish({
              answerText: '', summary: outcome.summary, awards: outcome.awards.slice(),
              rule: outcome.rule, rows: outcome.rows.map(function (row) { return Object.assign({}, row); })
            });
          } catch (warnError) {
            if (typeof console !== 'undefined' && console.warn) console.warn('date-contest: onFinish misslyckades', warnError);
          }
        }
        if (typeof console !== 'undefined' && console.warn) console.warn('date-contest: facit misslyckades', error);
      });
    }

    function buildOutcome(current, answerText) {
      var kind = current.kind;
      var truth = null;
      var truthClock = null;
      var truthNumber = null;
      var truthCount = 0;
      if (kind === 'names') {
        truth = parseNameList(answerText);
        if (!truth && /ingen/i.test(answerText || '')) truth = { none: true, names: [] };
        truthCount = truth && truth.none ? 1 : truth && truth.names ? truth.names.length : 0;
      } else if (kind === 'clock') {
        truthClock = parseClock(answerText);
      } else if (kind === 'days') {
        truthNumber = parseCount(answerText, 0, 400);
      } else if (kind === 'easter' || kind === 'moon') {
        truth = parseDateParts(answerText);
      }
      current.truthCount = truthCount;
      current.truth = truth;
      var outcome = evaluateContest({
        kind: kind,
        seats: current.seats,
        answers: current.answers,
        value: current.value,
        answerText: answerText,
        truth: truth,
        truthClock: truthClock,
        truthNumber: truthNumber
      });
      // Facit kunde inte tolkas: fall tillbaka på exakt textjämförelse.
      var needsTruth = kind === 'easter' || kind === 'moon' || kind === 'clock' || kind === 'days';
      if (needsTruth && ((kind === 'clock' && !truthClock) || (kind === 'days' && !Number.isFinite(truthNumber)) ||
          ((kind === 'easter' || kind === 'moon') && !truth))) {
        var normalizedText = normalize(answerText || '');
        var fallbackAwards = current.answers.map(function (entry) {
          return entry && normalize(entry.raw) === normalizedText && normalizedText ? current.value : 0;
        });
        outcome = {
          kind: kind,
          awards: fallbackAwards,
          rows: outcome.rows.map(function (row, index) {
            var points = fallbackAwards[index];
            return Object.assign({}, row, { points: points, winner: points > 0 });
          }),
          winners: fallbackAwards.map(function (points, index) { return points > 0 ? index : -1; }).filter(function (index) { return index >= 0; }),
          rule: outcome.rule,
          summary: 'Facit kunde inte tolkas som ' + (kind === 'clock' ? 'klockslag' : kind === 'days' ? 'antal dagar' : 'datum') +
            '. Exakt textjämförelse mot facit användes.',
          answerText: answerText,
          value: current.value
        };
      }
      return outcome;
    }

    function reset(next) {
      runToken += 1;
      state = {
        kind: next.kind,
        seats: readSeats(),
        answers: [],
        activeSeat: null,
        finished: false,
        value: Number.isFinite(next.value) ? next.value : 0,
        referenceTime: next.referenceTime instanceof Date ? next.referenceTime : new Date(),
        answerSource: next.answer,
        onTurn: typeof next.onTurn === 'function' ? next.onTurn : null,
        onFinish: typeof next.onFinish === 'function' ? next.onFinish : null,
        answerText: '',
        truth: null,
        truthCount: 0,
        outcome: null
      };
      state.answers = state.seats.map(function () { return null; });
      if (ui) {
        ui.result.hidden = true;
        ui.tbody.replaceChildren();
        ui.thead.replaceChildren();
      }
      return state;
    }

    var api = {
      open: function (config) {
        var next = config || {};
        var kind = typeof next.kind === 'string' && LABELS[next.kind] ? next.kind : 'easter';
        ensureStylesheet();
        var container = resolveRoot();
        if (!container) {
          reset(Object.assign({}, next, { kind: kind }));
          if (typeof console !== 'undefined' && console.warn) {
            console.warn('date-contest: inget rot-element hittades (root/.quiz-date-contest).');
          }
          return false;
        }
        ui = mount(container);
        var current = reset(Object.assign({}, next, { kind: kind }));
        render();
        if (current.seats.length === 1) chooseSeat(0);
        else report(-1);
        return true;
      },

      submit: function (raw) {
        if (!state) return { ok: false, reason: 'closed' };
        if (state.finished) return { ok: false, reason: 'finished' };
        var seatIndex = state.activeSeat;
        if (seatIndex === null) {
          if (state.seats.length === 1) seatIndex = 0;
          else return { ok: false, reason: 'no-seat', error: 'Välj spelare först (1–6).' };
        }
        if (state.answers[seatIndex]) {
          return { ok: false, reason: 'answered', error: state.seats[seatIndex].name + ' har redan svarat.' };
        }
        var parsed = parseForKind(state.kind, raw, state.referenceTime);
        if (parsed == null) {
          return { ok: false, reason: 'invalid', error: INVALID[state.kind] || 'Ogiltigt svar.' };
        }
        state.answers[seatIndex] = {
          raw: String(raw == null ? '' : raw),
          parsed: parsed,
          label: labelFor(state.kind, parsed)
        };
        state.activeSeat = null;
        var remaining = state.seats.length - answeredCount();
        if (remaining <= 0) {
          finish();
        } else {
          report(-1);
          render();
        }
        return { ok: true, seat: seatIndex, done: remaining <= 0, remaining: Math.max(0, remaining) };
      },

      handleKey: function (event) {
        if (!state || !event || state.finished) return false;
        if (event.altKey || event.ctrlKey || event.metaKey) return false;
        var target = event.target;
        if (target) {
          var tag = target.tagName;
          // Dolt formulär behåller ibland fokus efter att Lead rensat det.
          // Ett fält som inte syns får inte stjäla sifferknapparna.
          var inactive = isInactiveField(target);
          if (!inactive && (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || target.isContentEditable)) return false;
          if (typeof target.closest === 'function' && target.closest('dialog[open]')) return false;
        }
        var digit = null;
        if (event.key && /^[1-6]$/.test(event.key)) digit = Number(event.key);
        else if (event.code && /^(Digit|Numpad)[1-6]$/.test(event.code)) digit = Number(event.code.slice(-1));
        if (digit === null) return false;
        var index = digit - 1;
        if (index >= state.seats.length) return false;
        if (typeof event.preventDefault === 'function') event.preventDefault();
        if (typeof event.stopPropagation === 'function') event.stopPropagation();
        if (event.repeat) return true;
        chooseSeat(index);
        return true;
      },

      close: function () {
        runToken += 1;
        if (ui && ui.container) {
          ui.container.hidden = true;
          ui.container.replaceChildren();
          ui.container.classList.remove('qdc');
        }
        ui = null;
        state = null;
      },

      get active() {
        return Boolean(state && !state.closed);
      },

      get answered() {
        return answeredCount();
      },

      get remaining() {
        return state ? state.seats.length - answeredCount() : 0;
      },

      get outcome() {
        return state && state.outcome ? state.outcome : null;
      },

      get kind() {
        return state ? state.kind : null;
      }
    };

    return api;
  }

  createDateContest.internals = {
    parseDateParts: parseDateParts,
    parseClock: parseClock,
    parseCount: parseCount,
    parseNameList: parseNameList,
    parseForKind: parseForKind,
    formatSwedishDate: formatSwedishDate,
    clockDistance: clockDistance,
    dateDistance: dateDistance,
    countCorrectNames: countCorrectNames,
    evaluateContest: evaluateContest,
    monthFromWord: monthFromWord,
    normalize: normalize,
    LABELS: LABELS
  };

  return createDateContest;
});
