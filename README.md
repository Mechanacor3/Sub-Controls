# 🧭 Nautical Puzzle Hub

_An interactive, multi-puzzle submarine-themed experience designed for online play._

This site transforms your browser into the control room of a mysterious submarine. Players must solve a series of unique, themed logic puzzles—each tied to a different submarine system—to reveal codenames that unlock the ship's secrets.

Perfect for classrooms, puzzle hunts, D&D campaigns, or digital escape rooms.

---

## 🌊 Overview

**Nautical Puzzle Hub** is a browser-based puzzle website featuring:

| Puzzle                | Theme                       | Mechanics                       |
|----------------------|-----------------------------|----------------------------------|
| ⚓ Control Unlock     | Submarine Lock System       | Classic codebreaking logic       |
| 🔍 Porthole Puzzle    | Visual Identification       | Spot the difference              |
| ⚖️ Ballast Balance    | Sub-level Control Mechanism | Math/weight distribution puzzle  |
| 📡 Sonar Shapes       | Navigation Grid Mapping     | Pattern recognition + logic grid |
| 🗺️ Nav Riddle         | Captain's Log Encryption    | Language, trivia, or cipher task |

Each puzzle reveals a **nautical keyword** like `RUDDER`, `PERISCOPE`, or `HELM` upon successful completion. These are used to unlock a final meta-puzzle or story conclusion.

---

## 🚀 Features

- 🎮 Fully playable in-browser, no backend required
- 📱 Mobile-optimized layout with intuitive interfaces
- 🎨 Custom themed UI (nautical blues, brass highlights, sonar pulse animations)
- 🧠 5 standalone puzzles with escalating difficulty
- 🧭 Header compass acts as a dev/GM control toggle
- 🔐 Keyword system for gamifying multi-step progress
- 🧰 Developer Tools panel for playtesting & resets
- 🔊 Optional sound & animation cues (submersion, hatches, sonar pings)
- 💾 (Planned) Save progress via localStorage
- 📘 (Optional) Printable handouts or companion manual PDF

---

## 🗂️ Project Structure

```
/nautical-puzzle-hub/
├── index.html          # Main entrypoint with puzzle tabs
├── style.css           # Global visual styling
├── control-unlock.js   # Logic for Control Unlock puzzle
├── porthole.js         # Logic for Spot-the-Difference
├── ballast.js          # Logic for Ballast math puzzle
├── sonar.js            # Logic for sonar pattern puzzle
├── navigation.js       # Logic for Nav riddle / encryption
├── utils.js            # Utils shared by various puzzles
├── README.md           # This file
└── AGENTS.md           # Codex/LLM instructions (optional)
```

---

## 🧠 Puzzle Details

Each puzzle tab has:

- A custom interaction model
- Unique logic validation (JS-based)
- A `🔓 UNLOCKED:` banner with keyword reveal on success
- A fixed layout that doesn't scroll or reset

All puzzle state is managed client-side for fast interaction.

---

## 🧪 Dev Tools (GM Mode)

Click the 🧭 **header compass icon** to toggle Dev Tools:

- 🔄 Reset puzzle state
- 👁 Reveal current solution (for testing)
- ✅ Skip to win state
- 🔑 Output unlocked keyword

This mode is hidden by default and meant for GMs or debugging.

---

## 🤖 Automation Hooks

Automated checks can control the **Control Unlock** puzzle without touching the DOM. The shared `window.SubControls` API now
exposes two helpers:

- `SubControls.setControlUnlockState(options)` – Overrides puzzle randomness. Supports:
  - `solution` – Array of four valid colors (`['red', 'blue', 'green', 'yellow', 'purple', 'orange']`).
  - `keyword` – String keyword to display on success.
  - `rng` – Custom RNG function returning a number between 0 and 1.
  - `solutionFactory` / `keywordFactory` – Functions that return the next solution or keyword.
  - `apply` – Set to `true` to immediately rebuild the puzzle with the new settings.
- `SubControls.getControlUnlockState()` – Returns the active solution, latest keyword (if solved), and current override
  configuration.

These hooks make it easy to script deterministic scenarios (e.g., `SubControls.setControlUnlockState({ solution: ['red', 'red',
'blue', 'blue'], keyword: 'RUDDER', apply: true })`).

The **Ballast Balance** puzzle now offers lightweight helpers as well:

- `SubControls.getBallastConfig()` – Returns the base tilt/depth, slider range, and lever coefficients.
- `SubControls.simulateBallast(offsets, polarity)` – Applies lever offsets (array of four values between -2 and 2) and polarity to compute the resulting tilt/depth.
- `SubControls.setBallastControls({ offsets, polarity, autoConfirm })` – Programmatically move the sliders, update polarity (`1`/`-1`, `'flood'`, or `'vent'`), and optionally trigger a confirmation click.

Resets still restore the default slider positions and polarity, so regular play remains unchanged.

---

## 🧩 Sample Keywords (used for progression)

- `RUDDER`
- `PERISCOPE`
- `BALLAST`
- `HELM`
- `CHART`
- `AFT`
- `KELPLOCK`
- `TORPEDO`

Collected keywords can be used:
- In a final riddle
- As D&D item codes
- To open a hidden tab / secret area

### 🔒 Secret Admin "Evaluate Score" Panel

- Click the site header to toggle the developer tools overlay. The secret admin block lives directly inside that panel.
- Each puzzle has a dropdown for recording status (`Unreviewed`, `Needs investigation`, `Verified ✅`). Update option text or add new stations in `index.html` under the `#admin-evaluate` container.
- Styling is centralized in `style.css` (look for the `.admin-evaluate` rules). Add new selectors there when introducing tasks so the panel keeps its compact layout.
- If a puzzle's success keyword changes, revise the accompanying description text to keep reviewers aligned on what the UI should display.

---

## 🧑‍💻 How to Run Locally

1. Clone or download this repo.
2. Open `index.html` in any modern browser.
3. No build tools or dependencies required.

To deploy:
- Push to GitHub
- Enable GitHub Pages from the repo settings (source: `/root`)
- Visit `https://yourusername.github.io/nautical-puzzle-hub/`

---

## 🤖 Automated Testing

End-to-end coverage is available via [Playwright](https://playwright.dev/). The tests boot a lightweight static server, exercise
each puzzle using the exposed `SubControls` hooks, and confirm that the correct keywords appear in the UI.

1. Install the dev dependencies:
   ```bash
   npm install
   ```
2. Install the supported Playwright browsers (only required once per environment):
   ```bash
   npx playwright install --with-deps
   ```
3. Run the full suite:
   ```bash
   npx playwright test
   ```

The configuration lives in `playwright.config.js` and uses `scripts/dev-server.js` to serve the project root during test runs.

---

## 💡 Inspirations

- Classic codebreaking logic puzzles (e.g., [this board game](https://en.wikipedia.org/wiki/Mastermind_(board_game)))
- Submarine tropes from *Crimson Tide*, *Hunt for Red October*, *20,000 Leagues Under the Sea*
- Old-school educational games and escape rooms
