(function (app) {
  if (!app) {
    return;
  }

  const ballastConfig = {
    baseTilt: -10,
    baseDepth: -8,
    maxMoves: 7,
    gaugeRange: 18,
    gaugeDegrees: 65,
    keyword: 'TRIM',
  };

  const ballastLevers = [
    { id: 'bow', label: 'Bow Flood', tilt: -3, depth: 4 },
    { id: 'stern', label: 'Stern Pumps', tilt: 4, depth: -3 },
    { id: 'port', label: 'Port Trim', tilt: -5, depth: -2 },
    { id: 'starboard', label: 'Starboard Trim', tilt: 6, depth: 5 },
  ];

  const ballastState = {
    polarity: 1,
    movesRemaining: ballastConfig.maxMoves,
    locked: false,
  };

  let ballastLastResult = {
    tilt: ballastConfig.baseTilt,
    depth: ballastConfig.baseDepth,
  };

  const ballastElements = {
    panel: null,
    status: null,
    outcome: null,
    digital: null,
    moves: null,
    toggleButton: null,
    confirmButton: null,
    resetButton: null,
    tiltNeedle: null,
    tiltReadout: null,
    depthNeedle: null,
    depthReadout: null,
    levers: [],
  };

  function initPuzzle() {
    ballastElements.panel = document.getElementById('ballast-panel');
    ballastElements.status = document.getElementById('ballast-status');
    ballastElements.outcome = document.getElementById('ballast-outcome');
    ballastElements.digital = document.getElementById('ballast-digital');
    ballastElements.moves = document.getElementById('ballast-moves');
    ballastElements.toggleButton = document.getElementById('ballast-polarity');
    ballastElements.confirmButton = document.getElementById('ballast-confirm');
    ballastElements.resetButton = document.getElementById('ballast-reset');
    ballastElements.tiltNeedle = document.querySelector('.tilt-gauge .needle');
    ballastElements.tiltReadout = document.getElementById('ballast-tilt-readout');
    ballastElements.depthNeedle = document.querySelector('.depth-gauge .needle');
    ballastElements.depthReadout = document.getElementById('ballast-depth-readout');

    const sliderNodes = Array.from(
      document.querySelectorAll('.ballast-lever input[type="range"]')
    );
    ballastElements.levers = sliderNodes
      .map(slider => {
        const wrapper = slider.closest('.ballast-lever');
        if (!wrapper) return null;
        const leverId = wrapper.dataset.lever;
        const config = ballastLevers.find(lever => lever.id === leverId);
        if (!config) return null;
        const valueDisplay = wrapper.querySelector('.lever-value');
        return { slider, valueDisplay, config };
      })
      .filter(Boolean);

    ballastElements.levers.forEach(({ slider }) => {
      slider.addEventListener('input', () => {
        updateBallastValueDisplays();
        showPendingBallastMessage();
      });
    });

    ballastElements.toggleButton?.addEventListener('click', toggleBallastPolarity);
    ballastElements.confirmButton?.addEventListener('click', commitBallastAdjustment);
    ballastElements.resetButton?.addEventListener('click', resetBallastPuzzle);

    resetBallastPuzzle();
  }

  function resetBallastPuzzle() {
    ballastState.polarity = 1;
    ballastState.movesRemaining = ballastConfig.maxMoves;
    ballastState.locked = false;
    ballastLastResult = {
      tilt: ballastConfig.baseTilt,
      depth: ballastConfig.baseDepth,
    };

    ballastElements.levers.forEach(({ slider }) => {
      slider.value = '2';
      slider.disabled = false;
    });

    if (ballastElements.toggleButton) {
      ballastElements.toggleButton.disabled = false;
    }
    if (ballastElements.confirmButton) {
      ballastElements.confirmButton.disabled = false;
    }

    app.clearKeywordBanner('ballast');
    updateBallastPolarity();
    updateBallastValueDisplays();
    refreshBallastDisplays(ballastLastResult);
    updateBallastMoves();

    if (ballastElements.outcome) {
      ballastElements.outcome.textContent = '';
      ballastElements.outcome.className = 'ballast-outcome';
    }
  }

  function toggleBallastPolarity() {
    if (ballastState.locked) return;
    ballastState.polarity *= -1;
    updateBallastPolarity();
    showPendingBallastMessage();
  }

  function updateBallastPolarity() {
    if (!ballastElements.toggleButton) return;
    if (ballastState.polarity === 1) {
      ballastElements.toggleButton.textContent = 'Polarity: Flood Tanks';
      ballastElements.toggleButton.classList.remove('venting');
    } else {
      ballastElements.toggleButton.textContent = 'Polarity: Vent Tanks';
      ballastElements.toggleButton.classList.add('venting');
    }
  }

  function updateBallastValueDisplays() {
    ballastElements.levers.forEach(({ slider, valueDisplay }) => {
      if (!valueDisplay) return;
      const offset = parseInt(slider.value, 10) - 2;
      valueDisplay.textContent = offset > 0 ? `+${offset}` : `${offset}`;
    });
  }

  function showPendingBallastMessage() {
    if (ballastState.locked) return;
    if (!ballastElements.status || !ballastElements.panel) return;
    const descriptor = describeBallastResult(ballastLastResult);
    const pendingLevel = descriptor.level === 'stable' ? 'caution' : descriptor.level;
    applyBallastStatus(
      `${descriptor.message} Adjustments primed—confirm to engage the ballast tanks.`,
      pendingLevel
    );
  }

  function evaluateBallastState() {
    let tilt = ballastConfig.baseTilt;
    let depth = ballastConfig.baseDepth;

    ballastElements.levers.forEach(({ slider, config }) => {
      const offset = parseInt(slider.value, 10) - 2;
      tilt += ballastState.polarity * offset * config.tilt;
      depth += ballastState.polarity * offset * config.depth;
    });

    return { tilt, depth };
  }

  function refreshBallastDisplays(result) {
    const descriptor = describeBallastResult(result);
    updateBallastReadouts(result);
    updateBallastDigital(result, descriptor.level);
    applyBallastStatus(descriptor.message, descriptor.level);
    return descriptor;
  }

  function updateBallastReadouts(result) {
    if (!ballastElements.tiltNeedle || !ballastElements.depthNeedle) return;
    const { tilt, depth } = result;
    const tiltAngle = mapToGauge(tilt, ballastConfig.gaugeRange, ballastConfig.gaugeDegrees);
    const depthAngle = mapToGauge(depth, ballastConfig.gaugeRange, ballastConfig.gaugeDegrees);

    ballastElements.tiltNeedle.style.transform = `rotate(${tiltAngle}deg)`;
    ballastElements.depthNeedle.style.transform = `rotate(${depthAngle}deg)`;

    if (ballastElements.tiltReadout) {
      ballastElements.tiltReadout.textContent = formatTiltReadout(tilt);
    }

    if (ballastElements.depthReadout) {
      ballastElements.depthReadout.textContent = formatDepthReadout(depth);
    }
  }

  function mapToGauge(value, maxValue, maxDegrees) {
    const limit = Math.max(1, maxValue);
    const clamped = Math.max(-limit, Math.min(limit, value));
    return (clamped / limit) * maxDegrees;
  }

  function formatTiltReadout(tilt) {
    if (tilt === 0) return 'Level Trim';
    const direction = tilt < 0 ? 'Port' : 'Starboard';
    return `${Math.abs(tilt)}° ${direction}`;
  }

  function formatDepthReadout(depth) {
    if (depth === 0) return 'Neutral Buoyancy';
    const direction = depth < 0 ? 'Rising' : 'Sinking';
    return `${Math.abs(depth)}m ${direction}`;
  }

  function updateBallastDigital(result, level) {
    if (!ballastElements.digital) return;
    const severity = Math.abs(result.tilt) * 4 + Math.abs(result.depth) * 3;
    const score = Math.max(0, 100 - severity * 2);
    ballastElements.digital.textContent = `Stability score: ${score.toString().padStart(3, '0')}`;
    ballastElements.digital.dataset.level = level;
  }

  function describeBallastResult({ tilt, depth }) {
    const lines = [];

    if (tilt === 0) {
      lines.push('Trim level across port and starboard.');
    } else if (tilt < 0) {
      lines.push(`Tilting ${Math.abs(tilt)}° to the port side.`);
    } else {
      lines.push(`Tilting ${Math.abs(tilt)}° to the starboard side.`);
    }

    if (depth === 0) {
      lines.push('Depth locked at neutral buoyancy.');
    } else if (depth < 0) {
      lines.push(`Ballast too light — rising ${Math.abs(depth)}m.`);
    } else {
      lines.push(`Ballast heavy — sinking ${Math.abs(depth)}m.`);
    }

    const severity = Math.max(Math.abs(tilt), Math.abs(depth));
    let level = 'danger';

    if (severity === 0) {
      level = 'stable';
      lines.push('Creaks fade as the hull steadies. Lights glow green.');
    } else if (severity <= 3) {
      level = 'caution';
      lines.push('Pipes groan, but gauges hover near center.');
    } else {
      lines.push('Alarm lamps flash crimson; water sloshes through the tanks.');
    }

    return { message: lines.join(' '), level };
  }

  function applyBallastStatus(message, level) {
    if (!ballastElements.status || !ballastElements.panel) return;
    ballastElements.status.textContent = message;
    ballastElements.status.className = `ballast-status ${level}`;
    ballastElements.panel.classList.remove('ballast-stable', 'ballast-caution', 'ballast-danger');
    ballastElements.panel.classList.add(`ballast-${level}`);
  }

  function updateBallastMoves() {
    if (ballastElements.moves) {
      ballastElements.moves.textContent = ballastState.movesRemaining;
    }
  }

  function commitBallastAdjustment() {
    if (ballastState.locked || ballastState.movesRemaining <= 0) return;
    ballastState.movesRemaining -= 1;
    const result = evaluateBallastState();
    ballastLastResult = result;
    const descriptor = refreshBallastDisplays(result);
    updateBallastMoves();

    if (result.tilt === 0 && result.depth === 0) {
      handleBallastSuccess();
      return;
    }

    if (ballastState.movesRemaining === 0) {
      handleBallastFailure(descriptor);
    }
  }

  function handleBallastSuccess() {
    ballastState.locked = true;
    lockBallastInputs();

    if (ballastElements.outcome) {
      ballastElements.outcome.textContent = `Systems balanced — keyword ${ballastConfig.keyword}`;
      ballastElements.outcome.className = 'ballast-outcome success';
    }

    app.setKeywordBanner(`⚖️ ${ballastConfig.keyword} SECURED`, 'ballast');
  }

  function handleBallastFailure(descriptor) {
    ballastState.locked = true;
    lockBallastInputs();

    if (ballastElements.outcome) {
      ballastElements.outcome.textContent = 'Pressure hull breach imminent — reset required.';
      ballastElements.outcome.className = 'ballast-outcome failure';
    }

    if (descriptor.level !== 'danger') {
      applyBallastStatus(
        `${descriptor.message} Red alarms pulse as the ballast system locks out.`,
        'danger'
      );
    }
  }

  function lockBallastInputs() {
    ballastElements.levers.forEach(({ slider }) => {
      slider.disabled = true;
    });

    if (ballastElements.toggleButton) {
      ballastElements.toggleButton.disabled = true;
    }

    if (ballastElements.confirmButton) {
      ballastElements.confirmButton.disabled = true;
    }
  }

  function findBallastSolutions() {
    const combos = [];
    for (let a = -2; a <= 2; a++) {
      for (let b = -2; b <= 2; b++) {
        for (let c = -2; c <= 2; c++) {
          for (let d = -2; d <= 2; d++) {
            const offsets = [a, b, c, d];
            let tilt = ballastConfig.baseTilt;
            let depth = ballastConfig.baseDepth;
            offsets.forEach((offset, index) => {
              const lever = ballastLevers[index];
              tilt += offset * lever.tilt;
              depth += offset * lever.depth;
            });
            if (tilt === 0 && depth === 0) {
              combos.push(offsets);
            }
          }
        }
      }
    }
    return combos;
  }

  function revealBallastHint() {
    const ballastSolutions = findBallastSolutions();
    const ballastHint = ballastSolutions.length
      ? ballastSolutions
          .map(offsets =>
            offsets
              .map((value, index) => {
                const label = ballastLevers[index].label;
                return `${label}: ${value >= 0 ? '+' : ''}${value}`;
              })
              .join(' | ')
          )
          .join('  •  ')
      : 'No neutral combination found.';

    return `⚖️ Ballast Offsets (flood polarity): ${ballastHint}`;
  }

  app.registerPuzzle('ballast', {
    init: initPuzzle,
    reset: resetBallastPuzzle,
    reveal: revealBallastHint,
    description: 'Ballast Balance',
  });
})(window.SubControls);
