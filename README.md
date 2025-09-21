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

## 💡 Inspirations

- Classic codebreaking logic puzzles (e.g., [this board game](https://en.wikipedia.org/wiki/Mastermind_(board_game)))
- Submarine tropes from *Crimson Tide*, *Hunt for Red October*, *20,000 Leagues Under the Sea*
- Old-school educational games and escape rooms
