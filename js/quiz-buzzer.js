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

  function ensureStylesheet() {
    if (typeof document === 'undefined') return;
    var existing = document.querySelector('link[data-quiz-buzzer-css], link[href*="quiz-buzzer.css"]');
    if (!existing) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = './css/quiz-buzzer.css';
      link.setAttribute('data-quiz-buzzer-css', 'true');
      document.head.appendChild(link);
    }
  }

  function keyLabel(code) {
    if (!code) return '';
    var map = {
      ArrowLeft: '← Vänster',
      ArrowRight: '→ Höger',
      ArrowUp: '↑ Upp',
      ArrowDown: '↓ Ned',
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

  function resolveRoot(root) {
    if (typeof document === 'undefined') return null;
    if (typeof root === 'string') {
      return document.querySelector(root) || document.body;
    }
    if (root && root.nodeType === 1) {
      return root;
    }
    return document.body;
  }

  function createQuizBuzzer(options) {
    ensureStylesheet();

    var opts = options || {};
    var rootOption = opts.root;
    var getSeatsFn = typeof opts.getSeats === 'function' ? opts.getSeats : function () { return []; };
    var onFailFn = typeof opts.onFail === 'function' ? opts.onFail : null;
    var onResolveFn = typeof opts.onResolve === 'function' ? opts.onResolve : null;

    var isOpen = false;
    var currentBinary = null;      // boolean (true/false) or null
    var currentClaimOnly = false;  // boolean
    var respondentIndex = null;    // number or null
    var attempted = new Set();     // set of seat indices that have attempted / are barred
    var overlayEl = null;

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

    function removeUI() {
      if (overlayEl) {
        if (overlayEl.parentNode) {
          overlayEl.parentNode.removeChild(overlayEl);
        }
        overlayEl = null;
      }
    }

    // Exakt en utgång för en avslutad omgång
    function cleanupAndResolve(winnerIndex) {
      if (!isOpen) return;
      isOpen = false;
      respondentIndex = null;
      attempted.clear();
      removeUI();

      if (onResolveFn) {
        onResolveFn(winnerIndex);
      }
    }

    function handleBuzz(index) {
      if (!isOpen) return;
      if (attempted.has(index)) return;

      if (currentClaimOnly) {
        cleanupAndResolve(index);
        return;
      }

      respondentIndex = index;
      render();
    }

    function handleCorrectAnswer() {
      if (!isOpen || respondentIndex === null) return;
      cleanupAndResolve(respondentIndex);
    }

    function handleWrongAnswer() {
      if (!isOpen || respondentIndex === null) return;
      var failedIdx = respondentIndex;
      attempted.add(failedIdx);

      if (onFailFn) {
        onFailFn(failedIdx);
      }

      var seats = getNormalizedSeats();
      var remaining = seats.filter(function (s) { return !attempted.has(s.index); });

      if (remaining.length === 0) {
        // Alla spelare har försökt och misslyckats
        cleanupAndResolve(null);
      } else {
        // Spärra samma spelare och öppna på nytt för återstående
        respondentIndex = null;
        render();
      }
    }

    function handlePassAnswer() {
      if (!isOpen || respondentIndex === null) return;
      var passedIdx = respondentIndex;
      // Pass: spärra spelare utan minus (onFail anropas INTE)
      attempted.add(passedIdx);

      var seats = getNormalizedSeats();
      var remaining = seats.filter(function (s) { return !attempted.has(s.index); });

      if (remaining.length === 0) {
        cleanupAndResolve(null);
      } else {
        respondentIndex = null;
        render();
      }
    }

    function handleBinaryAnswer(choice) {
      if (typeof currentBinary !== 'boolean') return;
      if (choice === currentBinary) {
        handleCorrectAnswer();
      } else {
        handleWrongAnswer();
      }
    }

    function handleNoAnswer() {
      if (!isOpen) return;
      cleanupAndResolve(null);
    }

    function render() {
      if (!isOpen) {
        removeUI();
        return;
      }

      var rootEl = resolveRoot(rootOption);
      if (!rootEl) return;

      if (!overlayEl) {
        overlayEl = document.createElement('div');
        overlayEl.className = 'quiz-buzzer-overlay';
        // Förhindra overlay click-genomsläpp
        overlayEl.addEventListener('click', function (e) {
          if (e.target === overlayEl) {
            e.preventDefault();
            e.stopPropagation();
          }
        });
        rootEl.appendChild(overlayEl);
      }

      var seats = getNormalizedSeats();
      var isRespondentMode = (respondentIndex !== null);
      var currentSeat = isRespondentMode ? seats.find(function (s) { return s.index === respondentIndex; }) : null;

      var html = '<div class="quiz-buzzer-dialog" role="group" aria-label="Svarsknappar">';

      // Header
      html += '<div class="quiz-buzzer-header">';
      if (!isRespondentMode) {
        var headerText = currentClaimOnly ? 'Vem vill svara? Buzzra nu!' : 'Buzzläge öppet';
        html += '<div class="quiz-buzzer-status">' + escapeHtml(headerText) + '</div>';
        html += '<div class="quiz-buzzer-prompt">Tryck på din buzz-tangent eller touchknapp nedan</div>';
      } else {
        html += '<div class="quiz-buzzer-status">Svarar just nu</div>';
        if (typeof currentBinary === 'boolean') {
          html += '<div class="quiz-buzzer-prompt">Välj Ja eller Nej via tangent eller knapp</div>';
        } else {
          html += '<div class="quiz-buzzer-prompt">Muntligt svar — värden bedömer</div>';
        }
      }
      html += '</div>';

      // Respondent Box när respondent är låst
      if (isRespondentMode && currentSeat) {
        var respColor = escapeHtml(currentSeat.color);
        html += '<div class="quiz-buzzer-respondent-box" style="--resp-color:' + respColor + '; --resp-glow:' + respColor + '66">';
        html += '<div class="quiz-buzzer-respondent-title">Har ordet</div>';
        html += '<div class="quiz-buzzer-respondent-name">' + escapeHtml(currentSeat.name) + '</div>';
        if (typeof currentBinary === 'boolean') {
          var kLeft = keyLabel(currentSeat.left);
          var kRight = keyLabel(currentSeat.right);
          html += '<div class="quiz-buzzer-respondent-keys">';
          html += escapeHtml(currentSeat.leftLabel) + ': <strong>' + escapeHtml(kLeft) + '</strong> · ' +
                  escapeHtml(currentSeat.rightLabel) + ': <strong>' + escapeHtml(kRight) + '</strong>';
          html += '</div>';
        }
        html += '</div>';

        // Svarskontroller för respondenten
        if (typeof currentBinary === 'boolean') {
          html += '<div class="quiz-buzzer-binary-controls">';
          html += '<div class="quiz-buzzer-binary-row">';
          html += '<button type="button" class="quiz-buzzer-btn-yes" data-action="answer-yes">';
          html += '<span>' + escapeHtml(currentSeat.leftLabel) + '</span>';
          if (currentSeat.left) {
            html += '<span class="quiz-buzzer-btn-subtip">[' + escapeHtml(keyLabel(currentSeat.left)) + ']</span>';
          }
          html += '</button>';
          html += '<button type="button" class="quiz-buzzer-btn-no" data-action="answer-no">';
          html += '<span>' + escapeHtml(currentSeat.rightLabel) + '</span>';
          if (currentSeat.right) {
            html += '<span class="quiz-buzzer-btn-subtip">[' + escapeHtml(keyLabel(currentSeat.right)) + ']</span>';
          }
          html += '</button>';
          html += '</div>';
          html += '<button type="button" class="quiz-buzzer-btn-pass" data-action="answer-pass">Passa (ingen minuspoäng)</button>';
          html += '</div>';
        } else {
          // Muntligt svar: värden bedömer (spelaren kan ej själv rätta)
          html += '<div class="quiz-buzzer-host-controls">';
          html += '<div class="quiz-buzzer-host-title">Värdens bedömning:</div>';
          html += '<div class="quiz-buzzer-host-row">';
          html += '<button type="button" class="quiz-buzzer-btn-correct" data-action="host-correct">✓ Rätt</button>';
          html += '<button type="button" class="quiz-buzzer-btn-wrong" data-action="host-wrong">✗ Fel</button>';
          html += '</div>';
          html += '<button type="button" class="quiz-buzzer-btn-pass" data-action="answer-pass">Passa / Hoppa över</button>';
          html += '</div>';
        }
      }

      // Sits-översikt med touch-buzzknappar (i öppet läge)
      if (!isRespondentMode) {
        html += '<div class="quiz-buzzer-seats">';
        seats.forEach(function (seat) {
          var isAttempted = attempted.has(seat.index);
          var seatColor = escapeHtml(seat.color);
          var seatClasses = ['quiz-buzzer-seat'];
          if (isAttempted) seatClasses.push('is-attempted');

          html += '<div class="' + seatClasses.join(' ') + '" data-seat-index="' + seat.index + '" style="--seat-color:' + seatColor + '">';
          html += '<div class="quiz-buzzer-seat-top">';
          html += '<span class="quiz-buzzer-seat-dot"></span>';
          html += '<span class="quiz-buzzer-seat-name">' + escapeHtml(seat.name) + '</span>';
          html += '</div>';
          if (seat.left) {
            html += '<div class="quiz-buzzer-seat-keytip">[' + escapeHtml(keyLabel(seat.left)) + ']</div>';
          }
          html += '<button type="button" class="quiz-buzzer-btn-buzz" data-seat-index="' + seat.index + '" ' + (isAttempted ? 'disabled' : '') + '>';
          html += isAttempted ? 'Spärrad' : 'BUZZ';
          html += '</button>';
          html += '</div>';
        });
        html += '</div>';

        // Värdkontroller vid öppet buzzläge
        html += '<div class="quiz-buzzer-host-actions">';
        html += '<button type="button" class="quiz-buzzer-btn-no-answer" data-action="no-answer">Ingen svarar / Visa facit</button>';
        html += '</div>';
      }

      html += '</div>'; // End quiz-buzzer-dialog

      overlayEl.innerHTML = html;

      // Koppla klick-handlers inuti dialogen
      var dialog = overlayEl.querySelector('.quiz-buzzer-dialog');
      if (dialog) {
        dialog.addEventListener('click', function (e) {
          e.stopPropagation();

          var target = e.target;
          var btn = target.closest('button');
          if (!btn || btn.disabled) return;

          var action = btn.getAttribute('data-action');
          var seatIdxAttr = btn.getAttribute('data-seat-index');

          if (seatIdxAttr !== null && seatIdxAttr !== undefined && !action) {
            var seatIdx = parseInt(seatIdxAttr, 10);
            if (!isNaN(seatIdx)) {
              handleBuzz(seatIdx);
              return;
            }
          }

          if (action === 'answer-yes') {
            handleBinaryAnswer(true);
          } else if (action === 'answer-no') {
            handleBinaryAnswer(false);
          } else if (action === 'answer-pass') {
            handlePassAnswer();
          } else if (action === 'host-correct') {
            handleCorrectAnswer();
          } else if (action === 'host-wrong') {
            handleWrongAnswer();
          } else if (action === 'no-answer') {
            handleNoAnswer();
          }
        });
      }
    }

    return {
      open: function (cfg) {
        var conf = cfg || {};
        var first = (typeof conf.first === 'number' && conf.first >= 0) ? conf.first : null;
        var binary = (typeof conf.binary === 'boolean') ? conf.binary : null;
        var claimOnly = Boolean(conf.claimOnly);
        var excluded = Array.isArray(conf.excluded) ? conf.excluded : [];

        // Nollställ och öppna
        isOpen = true;
        currentBinary = binary;
        currentClaimOnly = claimOnly;
        attempted = new Set(excluded);

        var seats = getNormalizedSeats();
        var remaining = seats.filter(function (s) { return !attempted.has(s.index); });

        if (first === null && remaining.length === 0) {
          // Inga spelare kan buzzra från start
          cleanupAndResolve(null);
          return;
        }

        if (first !== null) {
          if (claimOnly) {
            cleanupAndResolve(first);
            return;
          }
          respondentIndex = first;
        } else {
          respondentIndex = null;
        }

        render();
      },

      close: function () {
        // Avbryter utan callbacks
        isOpen = false;
        respondentIndex = null;
        attempted.clear();
        removeUI();
      },

      handleKey: function (event) {
        if (!isOpen || !event) return false;
        if (event.repeat) return false;
        if (event.altKey || event.ctrlKey || event.metaKey) return false;

        var target = event.target;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
          return false;
        }

        var code = event.code;
        if (!code) return false;

        var seats = getNormalizedSeats();

        // 1. Öppet buzzläge: första knapptryck låser EN respondent (inte samtidigt ett ja)
        if (respondentIndex === null) {
          for (var i = 0; i < seats.length; i++) {
            var seat = seats[i];
            if (attempted.has(seat.index)) continue;
            if (seat.left && code === seat.left) {
              if (typeof event.preventDefault === 'function') event.preventDefault();
              if (typeof event.stopPropagation === 'function') event.stopPropagation();
              handleBuzz(seat.index);
              return true;
            }
          }
          return false;
        }

        // 2. Respondent är låst
        if (respondentIndex !== null) {
          var activeSeat = seats.find(function (s) { return s.index === respondentIndex; });
          if (!activeSeat) return false;

          // Om binary är boolean (true/false) är bara respondentens ja/nej-tangenter aktiva
          if (typeof currentBinary === 'boolean') {
            if (activeSeat.left && code === activeSeat.left) {
              if (typeof event.preventDefault === 'function') event.preventDefault();
              if (typeof event.stopPropagation === 'function') event.stopPropagation();
              handleBinaryAnswer(true);
              return true;
            }
            if (activeSeat.right && code === activeSeat.right) {
              if (typeof event.preventDefault === 'function') event.preventDefault();
              if (typeof event.stopPropagation === 'function') event.stopPropagation();
              handleBinaryAnswer(false);
              return true;
            }
          }

          // För en muntlig fråga (currentBinary === null) ska spelaren inte kunna själv rätta via knappar
          return false;
        }

        return false;
      },

      get active() {
        return isOpen;
      }
    };
  }

  return createQuizBuzzer;
});
