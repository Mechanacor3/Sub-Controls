# Navigation Riddle Puzzle — Design Document

## Purpose & Fantasy
- **Player fantasy:** Chart a course across a worn submarine map by translating a captain's navigational riddle into precise compass steps.
- **Primary goal:** Follow each bearing and pace to reach the destination icon and reveal the keyword `CHART`.
- **Narrative hook:** The plotting room notes were scattered during a squall—only the captain's log remains. Reconstruct the course to regain helm control.

## Core Mechanics
- **Grid navigation:** 10×10 coordinate grid (columns A–J, rows 1–10) overlaid on a parchment-style map.
- **Step resolution:** Each riddle line encodes a direction and step count. Directions can use nautical terms (port/starboard) or cardinal bearings.
- **Path tracing:** Players click consecutive cells to trace the course starting from a marked anchor icon.
- **Validation:** The system tracks the expected sequence of coordinates. Deviations show immediate feedback and allow undo/reset.

## Layout & UI Structure
| Region | Description | Notes |
| --- | --- | --- |
| **Captain's Log Panel** | Scrollable parchment box listing the active clue set. | Supports swapping clue collections via data attributes or GM input. |
| **Map Canvas** | Centered parchment map with faint grid lines, compass rose, and nautical markers (anchor start, reefs as obstacles, helm destination). | Grid cells are interactive buttons with aria labels like "B4". Starting cell pre-highlighted. |
| **Path Controls** | Buttons for Undo Last Step, Reset Course, and optional Auto-Trace (GM/dev mode). | Align with existing puzzle control styling. |
| **Feedback Banner** | Inline status text below map indicating progress, errors, or completion. | On success, show glowing highlight and keyword banner. |
| **Keyword Reveal** | `🔓 UNLOCKED: CHART` banner that animates once the destination is reached. | Mirrors other puzzles' success treatments.

## Player Flow
1. Player opens the Nav Riddle tab; instructions describe anchor start and objective.
2. Map displays anchor icon on starting coordinate (**B9**).
3. Player reads the log clue, then clicks cells to match the first instruction.
4. Each click highlights the new segment; mistakes trigger a subtle red pulse and do not advance the riddle index.
5. After completing all steps, the destination helm icon pulses with a lantern glow and the keyword banner fades in.
6. Dev tools can instantly mark the path or reset the board for testing.

## Canonical Clue Set
```
Begin at the anchor where the hull first steadies.
Set your course due East, three lengths across calm waters.
Turn to starboard, four lengths ahead past the reef's shadow.
Now due North, two lengths toward the lantern glow.
Finally, port about-face — one length to the helm.
There lies the chart, and your keyword awaits.
```
- Anchor = starting coordinate (recommend **B9** for visual spacing).
- East 3 → moves to **E9**.
- Starboard 4 → interpreted as turning right from current heading (south on the grid) landing on **E5**.
- North 2 → moves to **E3**.
- Port 1 → turns left (west) landing on **D3** which hosts the helm icon.
- Destination reveals keyword `CHART` (fits existing JavaScript solution constant).

## Interaction Logic
- **Data model:** Maintain an ordered array of expected coordinates and a pointer to the player's current step.
- **Input handling:** Clicking a valid adjacent cell advances the pointer and locks the cell highlight; invalid clicks trigger feedback and keep pointer unchanged.
- **Undo:** Pops last coordinate and re-enables the cell highlight state.
- **Reset:** Clears pointer, restores only the starting anchor highlight, hides feedback.
- **Completion:** When pointer reaches end, set puzzle solved flag, disable grid interactions, run keyword reveal animation.

## Accessibility & Feedback
- Interactive cells must be keyboard focusable (e.g., `<button>` elements) and labelled with coordinates plus descriptive text when special markers exist.
- Announce feedback via `aria-live` region tied to status banner.
- Provide visual contrast for the traced path (e.g., cyan overlay) and obstacles (dim/locked cells) that meet WCAG contrast ratios.

## Styling & Theming
- Reuse existing `.content-box` framing and nautical colour palette from `style.css`.
- Map parchment: warm beige background with darker edges, subtle grid lines.
- Compass rose placed top-left, optionally as pseudo-element or background image.
- Path highlight: glowing cyan/teal line reminiscent of sonar trails.
- Destination glow: CSS animation (pulse) around helm icon.

## HTML Implementation Requirements
When updating `index.html`, ensure the Nav Riddle section includes:
1. **Map Grid Container** with 10×10 buttons or overlay cells, anchor start marked via `data-start="true"`.
2. **Clue Log Area** housing the riddle text and optional textarea/input for alternate clue sets.
3. **Controls Row** for undo/reset buttons consistent with other puzzles' markup patterns.
4. **Feedback Paragraph** with `role="status"`.
5. **Keyword Banner** hidden by default, shown on success.

## JavaScript Notes
- Extend `navigation.js` to replace the current cipher input with grid-based path logic.
- Keep puzzle registration pattern (`SubControls.registerPuzzle`).
- Store coordinate instructions as structured data to allow future clue swaps (e.g., `{ direction: 'E', steps: 3 }`).
- Provide dev helper functions: auto-solve path, reset grid, expose solution coordinates for GM mode.

## Content Variations
- Support loading alternate clue sets through data attributes or by parsing developer-provided text blocks.
- Optional mechanic: highlight reefs/obstacles that cannot be traversed to reinforce clue narrative.

## Testing Checklist
- Verify correct path tracing and keyword reveal.
- Confirm undo/reset behaviours and that partial progress persists when switching tabs.
- Ensure keyboard navigation works for every grid cell.
- Test responsive layout on narrow viewports; map should shrink but remain legible.
- Validate dev tools still allow force-complete and reset functions.

## Open Questions / Follow-Ups
- Do we animate the path between cells or only highlight discrete cells?
- Should incorrect moves snap back or leave a ghost trail for teaching purposes?
- Determine whether clue log supports multiple pages or just single scroll.
