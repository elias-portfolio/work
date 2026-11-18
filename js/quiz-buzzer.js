/*!
 * quiz-buzzer.js — kompakt buzz-rad för Jeopardy/quiz
 *
 * Kontrakt:
 *   window.createQuizBuzzer({ root, getSeats, onFail, onResolve, onPick })
 *     -> { open({ first, binary, claimOnly, excluded, signalOnly, award, points }),
 *          close(), handleKey(event), get active, get respondent }
 *
 * Lägen:
 *   Standard (binärt):  open({ binary: true|false })   första buzz låser respondent,
 *                       ja/nej-tangenter rättar, fel -> onFail + ny buzz för resten.
 *   claimOnly:          open({ claimOnly: true })      första buzz -> onResolve(index).
 *   Muntligt:           open({ binary: null })         värden markerar Rätt/Fel.
 *   signalOnly:         open({ signalOnly: true, first }) visar bara snabbast/vem svarar.
 *                       Ingen rättning, ingen upplösning, inget onFail. onResolve anropas ej.
 *                       "Släpp ordet" friger respondenten utan dom. Reveal får alltid ske.
 *   award:              open({ award: true, points: N }) "Ge N poäng till:" + 1..N + Ingen.
 *                       Delar ut exakt en gång via onResolve(index | null).
 *
 * Rendering: en liten inline-rad i root (aldrig modal, aldrig fixed, aldrig över kortet).
 * Ingen global tangentbordslyssnare — anroparen kopplar in handleKey.
 */
(function (root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.createQuizBuzzer = factory();
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  var DEFAULT_COLORS = ['#ff5c8a', '#4dd8ff', '#ffd166', '#82f2a2', '#f97316', '#a855f7'];

  // Tangenter som aldrig ska konsumeras i onödan: de tillhör sidan, kalendern, overlayn.
  var PASS_THROUGH = {
    Escape: 1,
    ArrowUp: 1,
    ArrowDown: 1,
    ArrowLeft: 1,
    ArrowRight: 1,
    Space: 1,
    Enter: 1,
    NumpadEnter: 1,
    Tab: 1,
    PageUp: 1,
    PageDown: 1,
    Home: 1,
    End: 1
  };

  function ensureStylesheet() {
    if (typeof document === 'undefined') return;
    if (document.querySelector('link[data-quiz-buzzer-css], link[href*="quiz-buzzer.css"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './css/quiz-buzzer.css';
    if (typeof link.setAttribute === 'function') link.setAttribute('data-quiz-buzzer-css', 'true');
    if (document.head) document.head.appendChild(link);
  }

  function keyLabel(code) {
    if (!code) return '';
    var map = {
      ArrowLeft: '←',
      ArrowRight: '→',
      ArrowUp: '↑',
      ArrowDown: '↓',
      Space: 'Mellanslag',
      ShiftLeft: 'V-Shift',
      ShiftRight: 'H-Shift',
      ControlLeft: 'V-Ctrl',
      ControlRight: 'H-Ctrl',
      Enter: 'Enter',
      Tab: 'Tab'
    };
    if (map[code]) return map[code];
    if (/^Key[A-Z]$/.test(code)) return code.slice(3);
    if (/^Digit[0-9]$/.test(code)) return code.slice(5);
    if (/^Numpad[0-9]$/.test(code)) return 'Num ' + code.slice(6);
    return code;
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function resolveRoot(rootOption) {
    if (typeof document === 'undefined') return null;
    if (typeof rootOption === 'string') return document.querySelector(rootOption) || document.body;
    if (rootOption && rootOption.nodeType === 1) return rootOption;
    return document.body;
  }

  function digitFromCode(code) {
    var m = /^(?:Digit|Numpad)([0-9])$/.exec(code);
    return m ? parseInt(m[1], 10) : null;
  }

  function createQuizBuzzer(options) {
    ensureStylesheet();

    var opts = options || {};
    var rootOption = opts.root;
    var getSeatsFn = typeof opts.getSeats === 'function' ? opts.getSeats : function () { return []; };
    var onFailFn = typeof opts.onFail === 'function' ? opts.onFail : null;
    var onResolveFn = typeof opts.onResolve === 'function' ? opts.onResolve : null;
    var onPickFn = typeof opts.onPick === 'function' ? opts.onPick : null;

    var isOpen = false;
    var mode = 'binary';            // 'binary' | 'signal' | 'award'
    var currentBinary = null;       // true | false | null
    var currentClaimOnly = false;
    var respondentIndex = null;
    var attempted = [];             // legacy: spärrade sätesindex
    var awardPoints = 0;
    var containerEl = null;

    function getNormalizedSeats() {
      var raw = getSeatsFn();
      var arr = Array.isArray(raw) ? raw : [];
      return arr.map(function (seat, idx) {
        var name = (seat && typeof seat.name === 'string' && seat.name.trim()) ? seat.name.trim() : ('Spelare ' + (idx + 1));
        var left = (seat && typeof seat.left === 'string') ? seat.left : '';
        var right = (seat && typeof seat.right === 'string') ? seat.right : '';
        var leftLabel = (seat && typeof seat.leftLabel === 'string' && seat.leftLabel.trim()) ? seat.leftLabel.trim() : 'Ja';
        var rightLabel = (seat && typeof seat.rightLabel === 'string' && seat.rightLabel.trim()) ? seat.rightLabel.trim() : 'Nej';
        var color = (seat && typeof seat.color === 'string' && seat.color) ? seat.color : DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
        return {
          index: idx,
          name: name,
          left: left,
          right: right,
          leftLabel: leftLabel,
          rightLabel: rightLabel,
          color: color
        };
      });
    }

    function isAttempted(index) {
      return attempted.indexOf(index) !== -1;
    }

    function markAttempted(index) {
      if (!isAttempted(index)) attempted.push(index);
    }

    function seatByIndex(seats, index) {
      for (var i = 0; i < seats.length; i++) {
        if (seats[i].index === index) return seats[i];
      }
      return null;
    }

    function hidden() {
      if (!containerEl) return;
      containerEl.hidden = true;
      containerEl.innerHTML = '';
    }

    function mount() {
      var rootEl = resolveRoot(rootOption);
      if (!rootEl) return null;
      if (!containerEl) {
        containerEl = document.createElement('div');
        containerEl.className = 'quiz-buzzer';
        containerEl.setAttribute('role', 'group');
        containerEl.setAttribute('aria-label', 'Buzz');
        containerEl.addEventListener('click', onContainerClick);
      }
      if (containerEl.parentNode !== rootEl) rootEl.appendChild(containerEl);
      containerEl.hidden = false;
      return containerEl;
    }

    // ---- utgångar -------------------------------------------------------

    function finish(winnerIndex) {
      if (!isOpen) return;
      isOpen = false;
      respondentIndex = null;
      attempted = [];
      hidden();
      if (onResolveFn) onResolveFn(winnerIndex);
    }

    // signalOnly: ingen upplösning, inget onFail, inget onResolve.
    function claimSilently(index) {
      respondentIndex = index;
      render();
      if (onPickFn) onPickFn(index);
    }

    // ---- handlingar -----------------------------------------------------

    function handleBuzz(index) {
      if (!isOpen) return;
      if (mode === 'signal') {
        if (respondentIndex !== null) return;
        claimSilently(index);
        return;
      }
      if (isAttempted(index)) return;

      if (currentClaimOnly) {
        finish(index);
        return;
      }
      if (respondentIndex !== null) return;
      respondentIndex = index;
      render();
    }

    function handleCorrectAnswer() {
      if (!isOpen || respondentIndex === null) return;
      finish(respondentIndex);
    }

    function handleWrongAnswer() {
      if (!isOpen || respondentIndex === null) return;
      var failed = respondentIndex;
      markAttempted(failed);
      if (onFailFn) onFailFn(failed);

      var seats = getNormalizedSeats();
      var remaining = seats.filter(function (s) { return !isAttempted(s.index); });
      if (!remaining.length) {
        finish(null);
      } else {
        respondentIndex = null;
        render();
      }
    }

    function handlePassAnswer() {
      if (!isOpen || respondentIndex === null) return;
      markAttempted(respondentIndex); // passa = spärra utan minus, inget onFail
      var seats = getNormalizedSeats();
      var remaining = seats.filter(function (s) { return !isAttempted(s.index); });
      if (!remaining.length) {
        finish(null);
      } else {
        respondentIndex = null;
        render();
      }
    }

    function handleBinaryAnswer(choice) {
      if (typeof currentBinary !== 'boolean') return;
      if (choice === currentBinary) handleCorrectAnswer();
      else handleWrongAnswer();
    }

    function handleRelease() {
      // signalOnly: frige ordet utan dom, utan facit.
      if (!isOpen || mode !== 'signal') return;
      if (respondentIndex === null) return;
      respondentIndex = null;
      render();
    }

    function handleAward(index) {
      if (!isOpen || mode !== 'award') return;
      finish(index); // exakt en gång; isOpen blir false direkt
    }

    // ---- rendering ------------------------------------------------------

    function seatButton(seat, attrName, extraClass) {
      var cls = 'qb-seat' + (extraClass ? ' ' + extraClass : '');
      var html = '<button type="button" class="' + cls + '" ' + attrName + '="' + seat.index + '"';
      html += ' style="--qb-color:' + escapeHtml(seat.color) + '"';
      if (isAttempted(seat.index)) html += ' disabled';
      html += '>';
      html += '<span class="qb-seat-name">' + escapeHtml(seat.name) + '</span>';
      if (seat.left) html += '<kbd>' + escapeHtml(keyLabel(seat.left)) + '</kbd>';
      html += '</button>';
      return html;
    }

    function render() {
      if (!isOpen) {
        hidden();
        return;
      }
      var el = mount();
      if (!el) return;

      var seats = getNormalizedSeats();
      var html = '';

      if (mode === 'award') {
        html += '<span class="qb-label">Ge <strong>' + escapeHtml(String(awardPoints)) + '</strong> poäng till:</span>';
        seats.forEach(function (seat, i) {
          html += '<button type="button" class="qb-seat qb-award" data-award="' + seat.index + '"';
          html += ' style="--qb-color:' + escapeHtml(seat.color) + '">';
          html += '<kbd>' + (i + 1) + '</kbd>';
          html += '<span class="qb-seat-name">' + escapeHtml(seat.name) + '</span>';
          html += '</button>';
        });
        html += '<button type="button" class="qb-ghost" data-award="none">Ingen</button>';
        el.setAttribute('data-mode', 'award');
        el.innerHTML = html;
        return;
      }

      if (mode === 'signal') {
        var respSeat = respondentIndex === null ? null : seatByIndex(seats, respondentIndex);
        el.setAttribute('data-mode', 'signal');
        if (respSeat) {
          html += '<span class="qb-label">Svarar</span>';
          html += '<span class="qb-resp" style="--qb-color:' + escapeHtml(respSeat.color) + '">';
          html += '<span class="qb-resp-dot"></span>' + escapeHtml(respSeat.name);
          html += '</span>';
          html += '<button type="button" class="qb-ghost" data-action="release">Släpp ordet</button>';
        } else {
          html += '<span class="qb-label">Buzz</span>';
          seats.forEach(function (seat) {
            html += seatButton(seat, 'data-seat');
          });
          html += '<span class="qb-hint">tryck er tangent</span>';
        }
        el.innerHTML = html;
        return;
      }

      // ---- standard/binärt ----
      el.setAttribute('data-mode', 'binary');

      if (respondentIndex !== null) {
        var active = seatByIndex(seats, respondentIndex);
        if (active) {
          html += '<span class="qb-label">Svarar</span>';
          html += '<span class="qb-resp" style="--qb-color:' + escapeHtml(active.color) + '">';
          html += '<span class="qb-resp-dot"></span>' + escapeHtml(active.name);
          html += '</span>';

          if (typeof currentBinary === 'boolean') {
            html += '<button type="button" class="qb-yes qb-answer" data-action="answer-yes">';
            html += escapeHtml(active.leftLabel);
            if (active.left) html += ' <kbd>' + escapeHtml(keyLabel(active.left)) + '</kbd>';
            html += '</button>';
            html += '<button type="button" class="qb-no qb-answer" data-action="answer-no">';
            html += escapeHtml(active.rightLabel);
            if (active.right) html += ' <kbd>' + escapeHtml(keyLabel(active.right)) + '</kbd>';
            html += '</button>';
            html += '<button type="button" class="qb-ghost" data-action="answer-pass">Passa</button>';
          } else {
            html += '<button type="button" class="qb-yes" data-action="host-correct">Rätt</button>';
            html += '<button type="button" class="qb-no" data-action="host-wrong">Fel</button>';
            html += '<button type="button" class="qb-ghost" data-action="answer-pass">Passa</button>';
          }
          el.innerHTML = html;
          return;
        }
        respondentIndex = null;
      }

      html += '<span class="qb-label">Buzz</span>';
      seats.forEach(function (seat) {
        html += seatButton(seat, 'data-seat');
      });
      html += '<button type="button" class="qb-ghost" data-action="no-answer">Ingen</button>';
      el.innerHTML = html;
    }

    function onContainerClick(event) {
      if (!isOpen) return;
      var target = event.target;
      if (!target || typeof target.closest !== 'function') return;
      var btn = target.closest('button');
      if (!btn || btn.disabled) return;

      // Stoppa klicket så att kortet/overlayn bakom inte också reagerar.
      if (typeof event.stopPropagation === 'function') event.stopPropagation();
      if (typeof event.preventDefault === 'function') event.preventDefault();

      var action = btn.getAttribute('data-action');
      var seatAttr = btn.getAttribute('data-seat');
      var awardAttr = btn.getAttribute('data-award');

      if (mode === 'award') {
        if (awardAttr === 'none') { handleAward(null); return; }
        if (awardAttr !== null && awardAttr !== undefined) {
          var awardIdx = parseInt(awardAttr, 10);
          if (!isNaN(awardIdx)) handleAward(awardIdx);
        }
        return;
      }

      if (seatAttr !== null && seatAttr !== undefined) {
        var seatIdx = parseInt(seatAttr, 10);
        if (!isNaN(seatIdx)) handleBuzz(seatIdx);
        return;
      }

      if (action === 'answer-yes') handleBinaryAnswer(true);
      else if (action === 'answer-no') handleBinaryAnswer(false);
      else if (action === 'answer-pass') handlePassAnswer();
      else if (action === 'host-correct') handleCorrectAnswer();
      else if (action === 'host-wrong') handleWrongAnswer();
      else if (action === 'no-answer') finish(null);
      else if (action === 'release') handleRelease();
    }

    // ---- API ------------------------------------------------------------

    return {
      open: function (cfg) {
        var conf = cfg || {};
        var first = (typeof conf.first === 'number' && conf.first >= 0) ? conf.first : null;
        var binary = (typeof conf.binary === 'boolean') ? conf.binary : null;
        var claimOnly = Boolean(conf.claimOnly);
        var excluded = Array.isArray(conf.excluded) ? conf.excluded : [];
        var signalOnly = Boolean(conf.signalOnly);
        var award = Boolean(conf.award);

        // Nollställ state
        attempted = excluded.slice();
        respondentIndex = null;
        currentBinary = binary;
        currentClaimOnly = claimOnly;
        awardPoints = (typeof conf.points === 'number' && isFinite(conf.points)) ? conf.points : 0;

        if (award) {
          if (signalOnly) award = false; // signalOnly vinner
        }
        mode = award ? 'award' : (signalOnly ? 'signal' : 'binary');

        isOpen = true;

        var seats = getNormalizedSeats();
        var remaining = seats.filter(function (s) { return !isAttempted(s.index); });

        if (mode === 'binary' && first === null && !remaining.length) {
          isOpen = false;
          hidden();
          if (onResolveFn) onResolveFn(null);
          return;
        }

        if (mode === 'binary' && first !== null) {
          if (claimOnly) {
            isOpen = false;
            hidden();
            if (onResolveFn) onResolveFn(first);
            return;
          }
          if (!isAttempted(first)) respondentIndex = first;
        }

        // signalOnly: first = prioritet i rapid -> visas som den som har ordet.
        // Ingen callback här; läs buzzer.respondent om du behöver indexet.
        if (mode === 'signal' && first !== null && !isAttempted(first)) {
          respondentIndex = first;
        }

        render();
      },

      close: function () {
        // Avbryter utan callbacks.
        isOpen = false;
        respondentIndex = null;
        attempted = [];
        hidden();
      },

      handleKey: function (event) {
        if (!isOpen || !event) return false;
        if (event.repeat) return false;
        if (event.altKey || event.ctrlKey || event.metaKey) return false;

        var t = event.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) {
          return false;
        }

        var code = event.code;
        if (!code) return false;

        var seats = getNormalizedSeats();

        function consume() {
          if (typeof event.preventDefault === 'function') event.preventDefault();
          if (typeof event.stopPropagation === 'function') event.stopPropagation();
        }

        // ---- award: siffror delar ut exakt en gång ----
        if (mode === 'award') {
          var n = digitFromCode(code);
          if (n === null) return false;       // Escape, pilar, mellanslag, Enter -> släpps igenom
          if (n > seats.length) return false; // utanför spelarskaran -> släpps igenom orört
          consume();
          if (n === 0) { handleAward(null); return true; }
          handleAward(seats[n - 1].index);
          return true;
        }

        // ---- signal: bara vem som svarar, ingen rättning ----
        if (mode === 'signal') {
          if (respondentIndex !== null) return false;   // låst, inga svarstangenter alls
          if (code === 'Escape') return false;
          for (var si = 0; si < seats.length; si++) {
            var ss = seats[si];
            if (!ss.left || isAttempted(ss.index)) continue;
            if (code === ss.left) { consume(); handleBuzz(ss.index); return true; }
          }
          return false;                                // allt annat släpps igenom
        }

        // ---- standard/binärt ----
        if (respondentIndex === null) {
          if (code === 'Escape') return false;
          for (var i = 0; i < seats.length; i++) {
            var seat = seats[i];
            if (!seat.left || isAttempted(seat.index)) continue;
            if (code === seat.left) { consume(); handleBuzz(seat.index); return true; }
          }
          // Pilar/mellanslag/Enter som inte är satt till ett säte släpps igenom.
          if (PASS_THROUGH[code]) return false;
          return false;
        }

        var active = seatByIndex(seats, respondentIndex);
        if (!active) return false;

        if (typeof currentBinary === 'boolean') {
          if (active.left && code === active.left) { consume(); handleBinaryAnswer(true); return true; }
          if (active.right && code === active.right) { consume(); handleBinaryAnswer(false); return true; }
        }
        // Muntligt svar: spelaren kan inte själv rätta. Pass-through för allt annat.
        return false;
      },

      get active() {
        return isOpen;
      },

      get respondent() {
        return respondentIndex;
      }
    };
  }

  return createQuizBuzzer;
});
