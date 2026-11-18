(function () {
  'use strict';

  const WIDTH = 960;
  const HEIGHT = 600;
  const STEP = 1 / 120;
  const SPEED = 126;
  const TURN_SPEED = 2.85;
  const HEAD_RADIUS = 3.4;
  const TRAIL_RADIUS = 3;
  const CELL_SIZE = 32;
  const COLORS = ['#ff5c8a', '#4dd8ff', '#ffd166', '#82f2a2', '#d58bff', '#ff9d6b'];
  const DEFAULT_KEYS = [
    ['KeyA', 'KeyD'],
    ['ArrowLeft', 'ArrowRight'],
    ['KeyF', 'KeyH'],
    ['KeyK', 'KeyL'],
    ['KeyJ', 'KeyL'],
    ['KeyN', 'KeyM'],
    ['KeyQ', 'KeyW'],
    ['KeyU', 'KeyO']
  ];
  let activeDispose = null;

  function finiteScore(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 0;
    return Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(number)));
  }

  function normalizePlayers(input) {
    const source = Array.isArray(input) ? input : [];
    const usedKeys = new Set();
    source.forEach(function (player) {
      if (!player || typeof player !== 'object') return;
      if (typeof player.left === 'string') usedKeys.add(player.left);
      if (typeof player.right === 'string') usedKeys.add(player.right);
    });

    return source.slice(0, 6).map(function (player, index) {
      const supplied = player && typeof player === 'object' ? player : {};
      let left = typeof supplied.left === 'string' && supplied.left ? supplied.left : '';
      let right = typeof supplied.right === 'string' && supplied.right ? supplied.right : '';
      if (!left || !right || left === right) {
        const fallback = DEFAULT_KEYS.find(function (pair) {
          return !usedKeys.has(pair[0]) && !usedKeys.has(pair[1]);
        }) || DEFAULT_KEYS[index];
        left = left && left !== right ? left : fallback[0];
        right = right && right !== left ? right : fallback[1];
      }
      usedKeys.add(left);
      usedKeys.add(right);
      const suppliedName = typeof supplied.name === 'string' ? supplied.name.trim() : '';
      return {
        index: index,
        name: suppliedName || 'Spelare ' + (index + 1),
        score: finiteScore(supplied.score),
        left: left,
        right: right,
        color: COLORS[index]
      };
    });
  }

  function keyLabel(code) {
    const labels = {
      ArrowLeft: 'Vänsterpil',
      ArrowRight: 'Högerpil',
      ArrowUp: 'Uppil',
      ArrowDown: 'Nedpil',
      Space: 'Mellanslag',
      ShiftLeft: 'Vänster Shift',
      ShiftRight: 'Höger Shift',
      ControlLeft: 'Vänster Ctrl',
      ControlRight: 'Höger Ctrl'
    };
    if (labels[code]) return labels[code];
    if (/^Key[A-Z]$/.test(code)) return code.slice(3);
    if (/^Digit[0-9]$/.test(code)) return code.slice(5);
    if (/^Numpad[0-9]$/.test(code)) return 'Numpad ' + code.slice(6);
    return code;
  }

  function pointSegmentDistanceSquared(x, y, segment) {
    const dx = segment.x2 - segment.x1;
    const dy = segment.y2 - segment.y1;
    const lengthSquared = dx * dx + dy * dy;
    if (!lengthSquared) {
      const px = x - segment.x1;
      const py = y - segment.y1;
      return px * px + py * py;
    }
    const t = Math.max(0, Math.min(1, ((x - segment.x1) * dx + (y - segment.y1) * dy) / lengthSquared));
    const px = x - (segment.x1 + t * dx);
    const py = y - (segment.y1 + t * dy);
    return px * px + py * py;
  }

  function orientation(ax, ay, bx, by, cx, cy) {
    return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  }

  function segmentsIntersect(a, b) {
    const epsilon = 0.000001;
    const o1 = orientation(a.x1, a.y1, a.x2, a.y2, b.x1, b.y1);
    const o2 = orientation(a.x1, a.y1, a.x2, a.y2, b.x2, b.y2);
    const o3 = orientation(b.x1, b.y1, b.x2, b.y2, a.x1, a.y1);
    const o4 = orientation(b.x1, b.y1, b.x2, b.y2, a.x2, a.y2);
    return ((o1 > epsilon && o2 < -epsilon) || (o1 < -epsilon && o2 > epsilon)) &&
      ((o3 > epsilon && o4 < -epsilon) || (o3 < -epsilon && o4 > epsilon));
  }

  function segmentDistanceSquared(a, b) {
    if (segmentsIntersect(a, b)) return 0;
    return Math.min(
      pointSegmentDistanceSquared(a.x1, a.y1, b),
      pointSegmentDistanceSquared(a.x2, a.y2, b),
      pointSegmentDistanceSquared(b.x1, b.y1, a),
      pointSegmentDistanceSquared(b.x2, b.y2, a)
    );
  }

  function segmentCells(segment, margin, callback) {
    const minX = Math.floor((Math.min(segment.x1, segment.x2) - margin) / CELL_SIZE);
    const maxX = Math.floor((Math.max(segment.x1, segment.x2) + margin) / CELL_SIZE);
    const minY = Math.floor((Math.min(segment.y1, segment.y2) - margin) / CELL_SIZE);
    const maxY = Math.floor((Math.max(segment.y1, segment.y2) + margin) / CELL_SIZE);
    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) callback(x + ',' + y);
    }
  }

  window.openQuizZatacka = function openQuizZatacka(options) {
    if (activeDispose) activeDispose();
    const settings = options && typeof options === 'object' ? options : {};
    const players = normalizePlayers(settings.players);
    const solo = players.length === 1;
    const onResult = typeof settings.onResult === 'function' ? settings.onResult : function () {};
    const onClose = typeof settings.onClose === 'function' ? settings.onClose : function () {};
    const previousFocus = document.activeElement;
    const localEvents = new AbortController();
    const globalListeners = [];
    const heldKeys = new Set();
    let disposed = false;
    let resultSent = false;
    let closeSent = false;
    let phase = 'setup';
    let pausedFrom = null;
    let countdownRemaining = 0;
    let countdownEnd = 0;
    let lastCountdownText = '';
    let rafId = 0;
    let lastTime = 0;
    let accumulator = 0;
    let simulationStep = 0;
    let spatial = new Map();
    let queryToken = 0;
    let resultDeltas = null;

    const dialog = document.createElement('dialog');
    dialog.id = 'quiz-zatacka-dialog';
    dialog.className = 'quiz-zatacka';
    dialog.dataset.phase = phase;
    dialog.setAttribute('aria-labelledby', 'quiz-zatacka-title');
    dialog.innerHTML = `
      <div class="qz-shell" data-qz-count="${players.length}" data-qz-solo="${solo}">
        <header class="qz-header">
          <div>
            <p class="qz-kicker">Lokal ${players.length === 1 ? 'träningsrunda' : players.length + ' spelare'}</p>
            <h2 id="quiz-zatacka-title">Quiz-Zatacka</h2>
          </div>
          <button type="button" class="qz-icon-button" data-qz-role="close" aria-label="Stäng Zatacka">×</button>
        </header>
        <p class="qz-rules">Regler: vinnaren + egen insats, övriga − egen insats; delad sist överlevande utan unik vinnare = 0 för alla. Avbryt = ingen avräkning.</p>
        <div class="qz-players" data-qz-role="players"></div>
        <div class="qz-board" data-qz-role="board">
          <canvas id="quiz-zatacka-canvas" width="960" height="600" aria-label="Zatacka-spelplan"></canvas>
          <div class="qz-countdown" data-qz-role="countdown" aria-live="assertive" hidden></div>
          <div class="qz-pause" data-qz-role="pause" hidden>
            <strong>Pausad</strong>
            <span>Ronden stannar när fönstret byter fokus.</span>
            <button type="button" class="qz-primary" data-qz-role="resume">Fortsätt</button>
          </div>
        </div>
        <p class="qz-status" data-qz-role="status" aria-live="polite"></p>
        <div class="qz-touch" data-qz-role="touch" aria-label="Pekstyrning"></div>
        <section class="qz-result" data-qz-role="result" aria-live="polite" hidden>
          <h3 data-qz-role="result-title"></h3>
          <div class="qz-result-rows" data-qz-role="result-rows"></div>
        </section>
        <footer class="qz-footer">
          <span>Håll vänster/höger för att svänga. Vägg och alla spår ger krasch.</span>
          <button type="button" class="qz-primary" data-qz-role="start"></button>
        </footer>
      </div>`;

    const canvas = dialog.querySelector('canvas');
    const context = canvas.getContext('2d');
    const trailCanvas = document.createElement('canvas');
    trailCanvas.width = WIDTH;
    trailCanvas.height = HEIGHT;
    const trailContext = trailCanvas.getContext('2d');
    const status = dialog.querySelector('[data-qz-role="status"]');
    const startButton = dialog.querySelector('[data-qz-role="start"]');
    const closeButton = dialog.querySelector('[data-qz-role="close"]');
    const resumeButton = dialog.querySelector('[data-qz-role="resume"]');
    const countdown = dialog.querySelector('[data-qz-role="countdown"]');
    const pausePanel = dialog.querySelector('[data-qz-role="pause"]');
    const resultPanel = dialog.querySelector('[data-qz-role="result"]');
    const resultTitle = dialog.querySelector('[data-qz-role="result-title"]');
    const resultRows = dialog.querySelector('[data-qz-role="result-rows"]');
    const touchButtons = [];

    function listenGlobal(target, type, handler, options) {
      target.addEventListener(type, handler, options);
      globalListeners.push({ target: target, type: type, handler: handler, options: options });
    }

    function playerCard(player) {
      const card = document.createElement('article');
      card.className = 'qz-player';
      card.dataset.player = String(player.index);
      card.dataset.state = 'ready';
      card.style.setProperty('--qz-player', player.color);
      const heading = document.createElement('div');
      heading.className = 'qz-player-heading';
      const name = document.createElement('strong');
      name.textContent = (player.index + 1) + '. ' + player.name;
      const state = document.createElement('span');
      state.className = 'qz-player-state';
      state.dataset.qzRole = 'player-state';
      state.textContent = 'Redo';
      heading.append(name, state);
      card.appendChild(heading);
      if (solo) {
        const soloInfo = document.createElement('p');
        soloInfo.className = 'qz-keys';
        soloInfo.textContent = 'Träning – inga poäng eller insats.';
        card.appendChild(soloInfo);
        player.input = null;
        player.maximum = 0;
        player.bet = 0;
      } else {
        const wagerLabel = document.createElement('label');
        wagerLabel.className = 'qz-wager';
        const wagerText = document.createElement('span');
        const maximum = Math.max(0, player.score);
        wagerText.textContent = 'Insats (0–' + maximum + ')';
        const input = document.createElement('input');
        input.type = 'number';
        input.inputMode = 'numeric';
        input.min = '0';
        input.max = String(maximum);
        input.step = '1';
        input.value = String(Math.min(100, maximum));
        input.dataset.qzRole = 'wager';
        input.dataset.player = String(player.index);
        input.setAttribute('aria-label', player.name + ': insats');
        wagerLabel.append(wagerText, input);
        const controls = document.createElement('p');
        controls.className = 'qz-keys';
        controls.textContent = keyLabel(player.left) + ' / ' + keyLabel(player.right);
        card.append(wagerLabel, controls);
        player.input = input;
        player.maximum = maximum;
        player.bet = Math.min(100, maximum);
      }
      player.card = card;
      player.stateElement = state;
      return card;
    }

    const playerContainer = dialog.querySelector('[data-qz-role="players"]');
    players.forEach(function (player) {
      playerContainer.appendChild(playerCard(player));
    });

    const touchContainer = dialog.querySelector('[data-qz-role="touch"]');
    players.forEach(function (player) {
      player.touch = { left: new Set(), right: new Set() };
      const group = document.createElement('div');
      group.className = 'qz-touch-player';
      group.style.setProperty('--qz-player', player.color);
      const name = document.createElement('span');
      name.textContent = player.name;
      const pair = document.createElement('div');
      pair.className = 'qz-touch-pair';
      ['left', 'right'].forEach(function (direction) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'qz-touch-button';
        button.dataset.qzRole = 'touch-' + direction;
        button.dataset.player = String(player.index);
        button.disabled = true;
        button.textContent = direction === 'left' ? '←' : '→';
        button.setAttribute('aria-label', player.name + ': ' + (direction === 'left' ? 'vänster' : 'höger'));
        pair.appendChild(button);
        touchButtons.push(button);

        function release(event) {
          player.touch[direction].delete(event.pointerId);
          if (!player.touch[direction].size) button.classList.remove('is-held');
        }
        button.addEventListener('pointerdown', function (event) {
          if (phase !== 'playing') return;
          event.preventDefault();
          try { button.setPointerCapture(event.pointerId); } catch (_) {}
          player.touch[direction].add(event.pointerId);
          button.classList.add('is-held');
        }, { signal: localEvents.signal });
        ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (type) {
          button.addEventListener(type, release, { signal: localEvents.signal });
        });
        button.addEventListener('contextmenu', function (event) { event.preventDefault(); }, { signal: localEvents.signal });
      });
      group.append(name, pair);
      touchContainer.appendChild(group);
    });

    function setPlayerState(player, text, state) {
      if (player.stateElement.textContent !== text) player.stateElement.textContent = text;
      player.card.dataset.state = state;
    }

    function updateTouchAvailability() {
      touchButtons.forEach(function (button) { button.disabled = phase !== 'playing'; });
    }

    function clearHeld() {
      heldKeys.clear();
      players.forEach(function (player) {
        player.touch.left.clear();
        player.touch.right.clear();
      });
      touchButtons.forEach(function (button) { button.classList.remove('is-held'); });
    }

    function setPhase(next, message) {
      phase = next;
      dialog.dataset.phase = next;
      if (message) status.textContent = message;
      updateTouchAvailability();
    }

    function drawStartMarker(player) {
      context.save();
      context.globalAlpha = 0.75;
      context.strokeStyle = player.color;
      context.fillStyle = '#101625';
      context.lineWidth = 2;
      context.beginPath();
      context.arc(player.startX, player.startY, 13, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      context.fillStyle = player.color;
      context.font = '700 13px system-ui, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(String(player.index + 1), player.startX, player.startY);
      context.beginPath();
      context.moveTo(player.startX + Math.cos(player.startAngle) * 17, player.startY + Math.sin(player.startAngle) * 17);
      context.lineTo(player.startX + Math.cos(player.startAngle) * 29, player.startY + Math.sin(player.startAngle) * 29);
      context.stroke();
      context.restore();
    }

    function draw() {
      context.fillStyle = '#090e19';
      context.fillRect(0, 0, WIDTH, HEIGHT);
      context.strokeStyle = 'rgba(126, 153, 190, 0.09)';
      context.lineWidth = 1;
      for (let x = CELL_SIZE; x < WIDTH; x += CELL_SIZE) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, HEIGHT);
        context.stroke();
      }
      for (let y = CELL_SIZE; y < HEIGHT; y += CELL_SIZE) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(WIDTH, y);
        context.stroke();
      }
      context.drawImage(trailCanvas, 0, 0);
      players.forEach(drawStartMarker);
      players.forEach(function (player) {
        if (typeof player.x !== 'number') return;
        context.save();
        context.globalAlpha = player.alive ? 1 : 0.5;
        context.fillStyle = player.color;
        context.shadowColor = player.color;
        context.shadowBlur = player.alive ? 12 : 0;
        context.beginPath();
        context.arc(player.x, player.y, player.alive ? HEAD_RADIUS + 1.5 : HEAD_RADIUS + 2, 0, Math.PI * 2);
        context.fill();
        if (!player.alive) {
          context.shadowBlur = 0;
          context.strokeStyle = '#ffffff';
          context.lineWidth = 2;
          context.beginPath();
          context.moveTo(player.x - 6, player.y - 6);
          context.lineTo(player.x + 6, player.y + 6);
          context.moveTo(player.x + 6, player.y - 6);
          context.lineTo(player.x - 6, player.y + 6);
          context.stroke();
        }
        context.restore();
      });
      context.strokeStyle = '#d6e4ff';
      context.lineWidth = 4;
      context.strokeRect(2, 2, WIDTH - 4, HEIGHT - 4);
    }

    function initializeRound() {
      const count = players.length;
      const starts = [];
      for (let index = 0; index < count; index += 1) {
        let x;
        let y;
        let angle;
        if (count === 1) {
          x = WIDTH * 0.5;
          y = HEIGHT * 0.62;
          angle = -Math.PI / 2;
        } else if (count === 2) {
          x = WIDTH * (index === 0 ? 0.28 : 0.72);
          y = HEIGHT * 0.5;
          angle = index === 0 ? 0 : Math.PI;
        } else {
          const topCount = Math.ceil(count / 2);
          if (index < topCount) {
            x = WIDTH * ((index + 1) / (topCount + 1));
            y = HEIGHT * 0.12;
            angle = 0;
          } else {
            const bottomIndex = index - topCount;
            const bottomCount = count - topCount;
            x = WIDTH * ((bottomIndex + 1) / (bottomCount + 1));
            y = HEIGHT * 0.88;
            angle = Math.PI;
          }
        }
        starts.push([x, y, angle]);
      }
      spatial = new Map();
      simulationStep = 0;
      accumulator = 0;
      trailContext.clearRect(0, 0, WIDTH, HEIGHT);
      players.forEach(function (player, index) {
        player.x = starts[index][0];
        player.y = starts[index][1];
        player.startX = player.x;
        player.startY = player.y;
        player.angle = starts[index][2];
        player.startAngle = player.angle;
        player.alive = true;
        player.gapIn = 230 + Math.random() * 260;
        player.gapRemaining = 0;
        setPlayerState(player, solo ? 'Redo' : 'Låst', solo ? 'ready' : 'locked');
      });
      draw();
    }

    function addTrail(player, segment) {
      segment.owner = player.index;
      segment.step = simulationStep;
      segment.query = 0;
      segmentCells(segment, HEAD_RADIUS + TRAIL_RADIUS, function (key) {
        let entries = spatial.get(key);
        if (!entries) {
          entries = [];
          spatial.set(key, entries);
        }
        entries.push(segment);
      });
      trailContext.strokeStyle = player.color;
      trailContext.lineWidth = TRAIL_RADIUS * 2;
      trailContext.lineCap = 'round';
      trailContext.beginPath();
      trailContext.moveTo(segment.x1, segment.y1);
      trailContext.lineTo(segment.x2, segment.y2);
      trailContext.stroke();
    }

    function hitsExistingTrail(player, proposal) {
      let hit = false;
      queryToken += 1;
      segmentCells(proposal, HEAD_RADIUS + TRAIL_RADIUS, function (key) {
        const entries = spatial.get(key);
        if (!entries) return;
        entries.forEach(function (segment) {
          if (hit || segment.query === queryToken) return;
          segment.query = queryToken;
          if (segment.owner === player.index && simulationStep - segment.step < 24) return;
          const radius = HEAD_RADIUS + TRAIL_RADIUS;
          if (segmentDistanceSquared(proposal, segment) <= radius * radius) hit = true;
        });
      });
      return hit;
    }

    function advanceGap(player, distance) {
      if (player.gapRemaining > 0) {
        player.gapRemaining -= distance;
        if (player.gapRemaining <= 0) player.gapIn = 250 + Math.random() * 330;
        return true;
      }
      player.gapIn -= distance;
      if (player.gapIn <= 0) {
        player.gapRemaining = 10 + Math.random() * 9;
        return true;
      }
      return false;
    }

    function simulate() {
      simulationStep += 1;
      const distance = SPEED * STEP;
      const proposals = players.filter(function (player) { return player.alive; }).map(function (player) {
        const left = heldKeys.has(player.left) || player.touch.left.size > 0;
        const right = heldKeys.has(player.right) || player.touch.right.size > 0;
        if (left !== right) player.angle += (right ? 1 : -1) * TURN_SPEED * STEP;
        const gap = advanceGap(player, distance);
        const oldX = player.x;
        const oldY = player.y;
        const x = oldX + Math.cos(player.angle) * distance;
        const y = oldY + Math.sin(player.angle) * distance;
        return {
          player: player,
          gap: gap,
          x: x,
          y: y,
          segment: { x1: oldX, y1: oldY, x2: x, y2: y }
        };
      });
      const crashed = new Set();
      const crashReasons = new Map();
      proposals.forEach(function (proposal) {
        const player = proposal.player;
        const wall = proposal.x <= HEAD_RADIUS + 2 || proposal.x >= WIDTH - HEAD_RADIUS - 2 ||
          proposal.y <= HEAD_RADIUS + 2 || proposal.y >= HEIGHT - HEAD_RADIUS - 2;
        if (wall) {
          crashed.add(player.index);
          crashReasons.set(player.index, 'Väggkrasch');
        } else if (hitsExistingTrail(player, proposal.segment)) {
          crashed.add(player.index);
          crashReasons.set(player.index, 'Spårkrasch');
        }
      });
      proposals.forEach(function (proposal) {
        if (crashed.has(proposal.player.index)) return;
        proposals.forEach(function (other) {
          if (other.player.index === proposal.player.index || crashed.has(proposal.player.index)) return;
          const radius = HEAD_RADIUS + TRAIL_RADIUS;
          if (segmentDistanceSquared(proposal.segment, other.segment) <= radius * radius) {
            crashed.add(proposal.player.index);
            crashReasons.set(proposal.player.index, 'Spårkrasch');
          }
        });
      });
      proposals.forEach(function (proposal) {
        const player = proposal.player;
        player.x = proposal.x;
        player.y = proposal.y;
        if (!proposal.gap) addTrail(player, proposal.segment);
        if (crashed.has(player.index)) {
          player.alive = false;
          const reason = crashReasons.get(player.index) || 'Kraschad';
          player.card.dataset.crash = reason;
          setPlayerState(player, reason, 'dead');
        }
      });
      const survivors = players.filter(function (player) { return player.alive; });
      if (solo) {
        if (survivors.length === 0) finishRound(null);
      } else if (survivors.length <= 1) {
        finishRound(survivors.length === 1 ? survivors[0] : null);
      }
    }

    function signed(value) {
      return value > 0 ? '+' + value : String(value);
    }

    function finishRound(winner) {
      if (phase === 'result' || disposed) return;
      cancelAnimationFrame(rafId);
      rafId = 0;
      clearHeld();
      countdown.hidden = true;
      pausePanel.hidden = true;
      resultDeltas = players.map(function (player) {
        if (solo || !winner) return 0;
        return player.index === winner.index ? player.bet : -player.bet;
      });
      players.forEach(function (player) {
        if (solo) {
          if (!player.alive) setPlayerState(player, 'Klar', 'trained');
        } else if (winner && player.index === winner.index) setPlayerState(player, 'Vinnare', 'winner');
        else if (!winner && !player.alive) setPlayerState(player, 'Delad', 'tied');
      });
      if (solo) resultTitle.textContent = 'Träningsrundan är klar';
      else resultTitle.textContent = winner ? winner.name + ' vann!' : 'Delad rond – ingen unik vinnare';
      resultRows.replaceChildren();
      players.forEach(function (player, index) {
        const row = document.createElement('div');
        row.className = 'qz-result-row';
        row.dataset.player = String(index);
        const name = document.createElement('span');
        name.textContent = solo ? player.name : player.name + ' (insats ' + player.bet + ')';
        const delta = document.createElement('strong');
        delta.textContent = signed(resultDeltas[index]);
        delta.style.color = resultDeltas[index] > 0 ? '#82f2a2' : resultDeltas[index] < 0 ? '#ff8ba7' : '#d6e4ff';
        row.append(name, delta);
        resultRows.appendChild(row);
      });
      resultPanel.hidden = false;
      startButton.hidden = true;
      setPhase('result', solo
        ? 'Träningsrundan är klar. Inga poäng avräknades.'
        : winner ? 'Ronden är avgjord. Resultatet är registrerat.' : 'Alla återstående spelare kraschade samtidigt. Noll avräkning.');
      draw();
      resultPanel.scrollIntoView({ block: 'nearest' });
      closeButton.focus({ preventScroll: true });
      if (!resultSent) {
        resultSent = true;
        try { onResult(resultDeltas.slice()); } catch (error) { console.error('Quiz-Zatacka onResult:', error); }
      }
    }

    function updateCountdown(now) {
      const remaining = Math.max(0, countdownEnd - now);
      const text = remaining > 3000 ? '3' : remaining > 2000 ? '2' : remaining > 1000 ? '1' : 'Kör!';
      if (text !== lastCountdownText) {
        lastCountdownText = text;
        countdown.textContent = text;
      }
      if (remaining <= 0) {
        countdown.hidden = true;
        lastCountdownText = '';
        clearHeld();
        accumulator = 0;
        lastTime = now;
        setPhase('playing', 'Kör! Håll era tangenter eller pekknappar för att svänga.');
        players.forEach(function (player) { setPlayerState(player, 'Åker', 'alive'); });
      }
    }

    function tick(now) {
      rafId = 0;
      if (disposed || (phase !== 'countdown' && phase !== 'playing')) return;
      if (phase === 'countdown') {
        updateCountdown(now);
        draw();
      } else {
        const elapsed = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
        lastTime = now;
        accumulator += elapsed;
        while (accumulator >= STEP && phase === 'playing') {
          simulate();
          accumulator -= STEP;
        }
        draw();
      }
      if (!disposed && (phase === 'countdown' || phase === 'playing')) rafId = requestAnimationFrame(tick);
    }

    function pauseRound() {
      if (phase !== 'countdown' && phase !== 'playing') return;
      pausedFrom = phase;
      if (phase === 'countdown') countdownRemaining = Math.max(0, countdownEnd - performance.now());
      cancelAnimationFrame(rafId);
      rafId = 0;
      clearHeld();
      countdown.hidden = true;
      pausePanel.hidden = false;
      setPhase('paused', 'Pausad. Inga poäng har avräknats.');
      resumeButton.focus({ preventScroll: true });
    }

    function resumeRound() {
      if (phase !== 'paused' || disposed) return;
      const now = performance.now();
      pausePanel.hidden = true;
      if (pausedFrom === 'countdown') {
        countdownEnd = now + countdownRemaining;
        countdown.hidden = false;
      }
      lastTime = now;
      accumulator = 0;
      setPhase(pausedFrom, pausedFrom === 'countdown' ? 'Insatserna är låsta. Nedräkningen fortsätter.' : 'Kör! Håll era tangenter eller pekknappar för att svänga.');
      rafId = requestAnimationFrame(tick);
    }

    function startRound() {
      if (phase !== 'setup') return;
      let valid = true;
      players.forEach(function (player) {
        if (solo) {
          player.bet = 0;
          return;
        }
        const raw = player.input.value.trim();
        const value = Number(raw);
        const inputValid = /^\d+$/.test(raw) && Number.isSafeInteger(value) && value >= 0 && value <= player.maximum;
        player.input.setAttribute('aria-invalid', inputValid ? 'false' : 'true');
        if (!inputValid) valid = false;
        else player.bet = value;
      });
      if (!valid) {
        status.textContent = 'Kontrollera insatserna: ange heltal inom varje deltagares gräns.';
        dialog.querySelector('[aria-invalid="true"]').focus();
        return;
      }
      players.forEach(function (player) {
        if (player.input) player.input.disabled = true;
      });
      startButton.disabled = true;
      initializeRound();
      countdownEnd = performance.now() + 3200;
      countdown.hidden = false;
      setPhase('countdown', solo ? 'Träningsrunda. Ronden startar snart.' : 'Insatserna är låsta. Ronden startar snart.');
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(tick);
    }

    function onKeyDown(event) {
      if (phase !== 'playing') return;
      let controlled = false;
      players.forEach(function (player) {
        if (event.code === player.left || event.code === player.right) controlled = true;
      });
      if (!controlled) return;
      event.preventDefault();
      heldKeys.add(event.code);
    }

    function onKeyUp(event) {
      if (phase !== 'playing') return;
      let controlled = false;
      players.forEach(function (player) {
        if (event.code === player.left || event.code === player.right) controlled = true;
      });
      if (!controlled) return;
      event.preventDefault();
      heldKeys.delete(event.code);
    }

    function dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(rafId);
      rafId = 0;
      clearHeld();
      while (globalListeners.length) {
        const listener = globalListeners.pop();
        listener.target.removeEventListener(listener.type, listener.handler, listener.options);
      }
      localEvents.abort();
      if (dialog.open) dialog.close();
      dialog.remove();
      if (activeDispose === dispose) activeDispose = null;
      if (previousFocus && previousFocus.isConnected && typeof previousFocus.focus === 'function') {
        previousFocus.focus({ preventScroll: true });
      }
      if (!closeSent) {
        closeSent = true;
        try { onClose(); } catch (error) { console.error('Quiz-Zatacka onClose:', error); }
      }
    }

    startButton.addEventListener('click', startRound, { signal: localEvents.signal });
    closeButton.addEventListener('click', dispose, { signal: localEvents.signal });
    resumeButton.addEventListener('click', resumeRound, { signal: localEvents.signal });
    dialog.addEventListener('cancel', function (event) {
      event.preventDefault();
      dispose();
    }, { signal: localEvents.signal });
    listenGlobal(window, 'keydown', onKeyDown);
    listenGlobal(window, 'keyup', onKeyUp);
    listenGlobal(window, 'blur', pauseRound);
    listenGlobal(document, 'visibilitychange', function () {
      if (document.hidden) pauseRound();
    });

    document.body.appendChild(dialog);
    initializeRound();
    players.forEach(function (player) { setPlayerState(player, 'Redo', 'ready'); });
    updateTouchAvailability();
    status.textContent = solo
      ? 'Ensam träningsrunda: ingen insats och ingen poängavdräkning. Kör så länge du klarar.'
      : 'Sätt varje deltagares heltalsinsats och starta när alla är redo.';
    startButton.textContent = solo ? 'Starta träningsrundan' : 'Lås insatser och starta';
    dialog.showModal();
    startButton.focus({ preventScroll: true });
    activeDispose = dispose;
    return dispose;
  };
})();
