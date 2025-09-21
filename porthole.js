(function (global) {
  const KEYWORD = 'PERISCOPE';

  const differences = [
    {
      id: 'buoy-flag',
      label: 'Signal buoy flag',
      positions: {
        port: { x: 28, y: 22 },
        starboard: { x: 28, y: 22 },
      },
      found: false,
    },
    {
      id: 'jellyfish-glow',
      label: 'Glowing jellyfish',
      positions: {
        port: { x: 76, y: 36 },
        starboard: { x: 76, y: 36 },
      },
      found: false,
    },
    {
      id: 'sonar-ping',
      label: 'Sonar pulse ring',
      positions: {
        port: { x: 50, y: 38 },
        starboard: { x: 50, y: 38 },
      },
      found: false,
    },
    {
      id: 'kelp-height',
      label: 'Starboard kelp height',
      positions: {
        port: { x: 82, y: 70 },
        starboard: { x: 82, y: 70 },
      },
      found: false,
    },
    {
      id: 'vent-bubbles',
      label: 'Vent bubble cluster',
      positions: {
        port: { x: 26, y: 68 },
        starboard: { x: 26, y: 68 },
      },
      found: false,
    },
    {
      id: 'extra-viewport',
      label: 'Extra hull viewport',
      positions: {
        port: { x: 68, y: 60 },
        starboard: { x: 68, y: 60 },
      },
      found: false,
    },
  ];

  const differenceMap = new Map(differences.map(diff => [diff.id, diff]));

  const state = {
    container: null,
    scenes: new Map(),
    markers: new Map(),
    progressCount: null,
    totalCount: null,
    progressMessage: null,
    successBanner: null,
    keywordNode: null,
    initialised: false,
  };

  const progressMessages = {
    start: 'Mark each mismatch to light the signal.',
    mid: 'Keep scanning the portholes for anomalies.',
    complete: 'All differences logged. Signal ready to transmit.',
  };

  function ensureElements() {
    const container = document.querySelector('.porthole-puzzle');
    if (!container) {
      return false;
    }

    state.container = container;
    state.progressCount = container.querySelector('#porthole-found-count');
    state.totalCount = container.querySelector('#porthole-total-count');
    state.progressMessage = container.querySelector('#porthole-progress-message');
    state.successBanner = container.querySelector('#porthole-success');
    state.keywordNode = container.querySelector('#porthole-keyword');

    const portScene = container.querySelector('[data-scene="port"] .porthole-glass');
    const starboardScene = container.querySelector('[data-scene="starboard"] .porthole-glass');

    state.scenes.clear();
    state.scenes.set('port', portScene);
    state.scenes.set('starboard', starboardScene);

    return Boolean(portScene && starboardScene);
  }

  function buildMarkers() {
    state.markers.clear();

    differences.forEach(diff => {
      const markerSet = [];

      Object.entries(diff.positions).forEach(([sceneKey, coords]) => {
        const scene = state.scenes.get(sceneKey);
        if (!scene) {
          return;
        }

        const marker = document.createElement('button');
        marker.type = 'button';
        marker.className = 'difference-marker';
        marker.dataset.differenceId = diff.id;
        marker.dataset.scene = sceneKey;
        marker.style.left = `${coords.x}%`;
        marker.style.top = `${coords.y}%`;
        marker.setAttribute('aria-label', `${diff.label}. Tap to toggle found state.`);
        marker.setAttribute('aria-pressed', 'false');
        marker.addEventListener('click', handleMarkerClick);
        scene.appendChild(marker);
        markerSet.push(marker);
      });

      state.markers.set(diff.id, markerSet);
    });
  }

  function setMarkerState(diffId, found) {
    const markerSet = state.markers.get(diffId);
    if (!markerSet) {
      return;
    }

    markerSet.forEach(marker => {
      marker.classList.toggle('found', found);
      marker.setAttribute('aria-pressed', found ? 'true' : 'false');
    });
  }

  function countFound() {
    return differences.reduce((total, diff) => (diff.found ? total + 1 : total), 0);
  }

  function updateProgress() {
    const total = differences.length;
    const foundCount = countFound();

    if (state.progressCount) {
      state.progressCount.textContent = String(foundCount);
    }

    if (state.totalCount) {
      state.totalCount.textContent = String(total);
    }

    if (state.progressMessage) {
      let message = progressMessages.start;
      if (foundCount === total && total > 0) {
        message = progressMessages.complete;
      } else if (foundCount > 0) {
        message = progressMessages.mid;
      }
      state.progressMessage.textContent = message;
    }

    if (foundCount === total && total > 0) {
      showSuccess();
    } else {
      hideSuccess();
    }
  }

  function showSuccess() {
    if (state.successBanner) {
      state.successBanner.classList.add('visible');
    }
    if (state.keywordNode) {
      state.keywordNode.textContent = KEYWORD;
    }
    if (global.SubControls && typeof global.SubControls.setKeywordBanner === 'function') {
      global.SubControls.setKeywordBanner(`🔓 UNLOCKED: ${KEYWORD}`, 'spot-diff');
    }
  }

  function hideSuccess() {
    if (state.successBanner) {
      state.successBanner.classList.remove('visible');
    }
    if (state.keywordNode && !countFound()) {
      state.keywordNode.textContent = '';
    }
    if (global.SubControls && typeof global.SubControls.clearKeywordBanner === 'function') {
      global.SubControls.clearKeywordBanner('spot-diff');
    }
  }

  function handleMarkerClick(event) {
    const target = event.currentTarget;
    if (!target) {
      return;
    }

    const diffId = target.dataset.differenceId;
    const diff = diffId ? differenceMap.get(diffId) : null;
    if (!diff) {
      return;
    }

    diff.found = !diff.found;
    setMarkerState(diff.id, diff.found);
    updateProgress();
  }

  function resetState() {
    differences.forEach(diff => {
      diff.found = false;
      setMarkerState(diff.id, false);
    });
    hideSuccess();
    updateProgress();
  }

  function preparePuzzle() {
    if (!ensureElements()) {
      return false;
    }

    if (!state.initialised) {
      buildMarkers();
      state.initialised = true;
    }

    return true;
  }

  function initialisePuzzle() {
    if (!preparePuzzle()) {
      return;
    }
    resetState();
  }

  function resetPuzzle() {
    if (!preparePuzzle()) {
      return;
    }
    resetState();
  }

  function revealPuzzle() {
    if (!preparePuzzle()) {
      return;
    }

    differences.forEach(diff => {
      diff.found = true;
      setMarkerState(diff.id, true);
    });

    updateProgress();
  }

  global.initializePortholePuzzle = initialisePuzzle;
  global.resetPortholePuzzle = resetPuzzle;
  global.revealPortholeSolution = revealPuzzle;
})(window);
