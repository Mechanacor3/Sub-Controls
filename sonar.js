(function (global) {
  const GRID_SIZE = 5;
  const BASE_LAYOUTS = [
    [
      [0, 2],
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
      [2, 4],
      [3, 1],
      [3, 2],
      [3, 3],
      [4, 2],
    ],
    [
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
      [2, 4],
      [3, 0],
      [3, 4],
      [4, 2],
    ],
    [
      [0, 2],
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 1],
      [2, 2],
      [2, 3],
      [3, 0],
      [3, 1],
      [3, 2],
      [3, 3],
      [3, 4],
      [4, 1],
      [4, 3],
    ],
    [
      [0, 0],
      [0, 4],
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 4],
      [2, 2],
      [3, 1],
      [3, 2],
      [3, 3],
      [4, 2],
    ],
    [
      [0, 2],
      [0, 3],
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 4],
      [2, 1],
      [2, 2],
      [3, 0],
      [3, 1],
      [3, 2],
      [3, 3],
      [4, 0],
      [4, 1],
    ],
  ];
  const KEYWORD = 'TORPEDO';

  let app = null;
  let registered = false;
  let gridBuilt = false;
  let gridElement = null;
  let clueElement = null;
  let successElement = null;
  let successKeyword = null;
  let solved = false;
  let solutionCells = [];
  let solutionSet = new Set();
  let rowTargets = Array(GRID_SIZE).fill(0);
  let columnTargets = Array(GRID_SIZE).fill(0);

  function parseCellId(id) {
    const [row, col] = id.split('-').map(Number);
    return { row, col };
  }

  function createCellId(row, col) {
    return `${row}-${col}`;
  }

  function rotatePoint(point) {
    return { row: point.col, col: GRID_SIZE - 1 - point.row };
  }

  function transformLayout(layout) {
    const rotationSteps = Math.floor(Math.random() * 4);
    const flipHorizontal = Math.random() < 0.5;
    const flipVertical = Math.random() < 0.5;

    return layout.map(coords => {
      let point = { row: coords[0], col: coords[1] };

      for (let step = 0; step < rotationSteps; step += 1) {
        point = rotatePoint(point);
      }

      if (flipHorizontal) {
        point = { row: point.row, col: GRID_SIZE - 1 - point.col };
      }

      if (flipVertical) {
        point = { row: GRID_SIZE - 1 - point.row, col: point.col };
      }

      return createCellId(point.row, point.col);
    });
  }

  function computeTargets(cells) {
    const rows = Array(GRID_SIZE).fill(0);
    const columns = Array(GRID_SIZE).fill(0);

    cells.forEach(id => {
      const { row, col } = parseCellId(id);
      if (Number.isInteger(row) && Number.isInteger(col)) {
        if (row >= 0 && row < GRID_SIZE) {
          rows[row] += 1;
        }
        if (col >= 0 && col < GRID_SIZE) {
          columns[col] += 1;
        }
      }
    });

    return { rows, columns };
  }

  function chooseRandomLayout() {
    const baseLayout = BASE_LAYOUTS[Math.floor(Math.random() * BASE_LAYOUTS.length)];
    const transformed = transformLayout(baseLayout);
    return Array.from(new Set(transformed));
  }

  function assignNewLayout() {
    solutionCells = chooseRandomLayout();
    solutionSet = new Set(solutionCells);
    const targets = computeTargets(solutionCells);
    rowTargets = targets.rows;
    columnTargets = targets.columns;
  }

  function collectState() {
    const rowCounts = Array(GRID_SIZE).fill(0);
    const columnCounts = Array(GRID_SIZE).fill(0);
    const activeIds = [];

    if (!gridElement) {
      return { rowCounts, columnCounts, activeIds };
    }

    Array.from(gridElement.querySelectorAll('.sonar-cell.active')).forEach(cell => {
      const id = cell.dataset.cell;
      if (!id) return;
      const { row, col } = parseCellId(id);
      if (Number.isInteger(row) && Number.isInteger(col)) {
        rowCounts[row] += 1;
        columnCounts[col] += 1;
        activeIds.push(id);
      }
    });

    return { rowCounts, columnCounts, activeIds };
  }

  function updateClueStatus(additionalMessage = '', state = null) {
    if (!clueElement) {
      return;
    }

    const current = state ?? collectState();
    const rowStatus = rowTargets
      .map((target, index) => `${current.rowCounts[index]}/${target}`)
      .join('  |  ');
    const columnStatus = columnTargets
      .map((target, index) => `${current.columnCounts[index]}/${target}`)
      .join('  |  ');

    let html = `<strong>Row echoes</strong>: ${rowStatus}`;
    html += `<br><strong>Column echoes</strong>: ${columnStatus}`;

    if (additionalMessage) {
      html += `<span class="sonar-alert">${additionalMessage}</span>`;
    } else if (solved) {
      html += '<span class="sonar-confirm">Contact confirmed.</span>';
    }

    clueElement.innerHTML = html;
  }

  function patternMatches(state) {
    if (!state) {
      return false;
    }

    if (state.activeIds.length !== solutionSet.size) {
      return false;
    }

    for (let index = 0; index < GRID_SIZE; index += 1) {
      if (state.rowCounts[index] !== rowTargets[index]) {
        return false;
      }
      if (state.columnCounts[index] !== columnTargets[index]) {
        return false;
      }
    }

    return state.activeIds.every(id => solutionSet.has(id));
  }

  function markSolved(state = null) {
    if (solved) {
      updateClueStatus('', state ?? collectState());
      return;
    }

    solved = true;

    if (successElement) {
      successElement.hidden = false;
    }

    if (successKeyword) {
      successKeyword.textContent = KEYWORD;
    }

    if (app && typeof app.setKeywordBanner === 'function') {
      app.setKeywordBanner(`📡 SIGNAL LOCKED: ${KEYWORD}`, 'sonar');
    }

    updateClueStatus('', state);
  }

  function handleCellToggle(event) {
    if (solved || !gridElement) {
      return;
    }

    const cell = event.currentTarget;
    if (!(cell instanceof HTMLElement) || !cell.dataset.cell) {
      return;
    }

    cell.classList.toggle('active');
    const { row, col } = parseCellId(cell.dataset.cell);
    const state = collectState();
    const warnings = [];

    if (state.rowCounts[row] > rowTargets[row]) {
      warnings.push(`Row ${row + 1} echo limit reached.`);
    }

    if (state.columnCounts[col] > columnTargets[col]) {
      warnings.push(`Column ${col + 1} echo limit reached.`);
    }

    if (warnings.length) {
      cell.classList.toggle('active');
      updateClueStatus(warnings.join(' '), collectState());
      return;
    }

    if (patternMatches(state)) {
      markSolved(state);
      return;
    }

    updateClueStatus('', state);
  }

  function buildGrid() {
    if (!gridElement) {
      return;
    }

    gridElement.innerHTML = '';

    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let col = 0; col < GRID_SIZE; col += 1) {
        const cell = global.document.createElement('button');
        cell.type = 'button';
        cell.className = 'sonar-cell';
        cell.dataset.cell = `${row}-${col}`;
        cell.setAttribute('aria-label', `Row ${row + 1}, Column ${col + 1}`);
        cell.addEventListener('click', handleCellToggle);
        gridElement.appendChild(cell);
      }
    }

    gridBuilt = true;
  }

  function ensureElements() {
    const section = global.document?.getElementById('sonar');
    if (!section) {
      return false;
    }

    gridElement = section.querySelector('#sonar-grid');
    clueElement = section.querySelector('#sonar-clue');
    successElement = section.querySelector('#sonar-success');
    successKeyword = section.querySelector('#sonar-keyword');

    return Boolean(gridElement && clueElement && successElement && successKeyword);
  }

  function applyResetState(reshuffle = false) {
    solved = false;

    if (reshuffle || solutionCells.length === 0) {
      assignNewLayout();
    }

    if (gridElement) {
      Array.from(gridElement.querySelectorAll('.sonar-cell')).forEach(cell => {
        cell.classList.remove('active');
      });
    }

    if (successElement) {
      successElement.hidden = true;
    }

    if (successKeyword) {
      successKeyword.textContent = KEYWORD;
    }

    if (app && typeof app.clearKeywordBanner === 'function') {
      app.clearKeywordBanner('sonar');
    }

    updateClueStatus();
  }

  function initializeSonarPuzzle() {
    if (!ensureElements()) {
      return;
    }

    buildGrid();
    applyResetState(true);
  }

  function resetSonarPuzzle() {
    if (!ensureElements()) {
      return;
    }

    if (!gridBuilt) {
      buildGrid();
    }

    applyResetState(true);
  }

  function revealSonarSolution() {
    if (!ensureElements()) {
      return '📡 Sonar Solution: Console offline.';
    }

    if (!gridBuilt) {
      buildGrid();
    }

    Array.from(gridElement.querySelectorAll('.sonar-cell')).forEach(cell => {
      const shouldActivate = cell.dataset.cell ? solutionSet.has(cell.dataset.cell) : false;
      cell.classList.toggle('active', shouldActivate);
    });

    const state = collectState();
    markSolved(state);

    return `📡 Sonar Solution: ${KEYWORD} — rows ${rowTargets.join('/')}, columns ${columnTargets.join('/')}.`;
  }

  function attemptRegistration() {
    if (registered) {
      return;
    }

    if (global.SubControls && typeof global.SubControls.registerPuzzle === 'function') {
      app = global.SubControls;
      app.registerPuzzle('sonar', {
        init: initializeSonarPuzzle,
        reset: resetSonarPuzzle,
        reveal: revealSonarSolution,
        description: 'Sonar Shapes',
      });
      registered = true;
    } else {
      global.setTimeout(attemptRegistration, 40);
    }
  }

  attemptRegistration();

  global.initializeSonarPuzzle = initializeSonarPuzzle;
  global.resetSonarPuzzle = resetSonarPuzzle;
  global.revealSonarSolution = revealSonarSolution;
})(window);
