# AGENTS Guidelines

These instructions apply to the entire repository.

## Core Principles
- **Favour simplicity.** This project is meant to be a lightweight GitHub Pages site. Prefer static HTML, vanilla CSS, and plain JavaScript with no build step or external dependencies.
- **Reuse shared pieces.** Extend or adjust the existing sections in `index.html`, `style.css`, and `utils.js` instead of introducing parallel structures. Keep puzzle controls and visual language consistent across the app.
- **Keep things approachable.** Prioritise clarity, readability, and ease of maintenance over cleverness. Comment only when behaviour is non-obvious.

## HTML Guidelines
- Maintain the current single-page layout. Additions should fit inside existing sections or follow the same structural patterns.
- Keep markup semantic and minimal—avoid unnecessary wrappers, inline styles, or duplicated attributes.

## CSS Guidelines
- Update `style.css` rather than creating new stylesheets.
- Stick to the established colour palette and typography. Group related rules together and keep selectors simple.

## JavaScript Guidelines
- Use the existing module (`utils.js`) as the place for all interactive behaviour unless a new puzzle clearly warrants its own file.
- Write vanilla ES6+ code without transpilers or bundlers. Avoid external libraries.
- Prefer small, clear functions and share utility logic when possible.

## Assets & Dependencies
- Store any new static assets (images, audio, etc.) in the repository root unless a better shared location is introduced. Use lightweight formats.
- Do not add package managers, lockfiles, or build tooling.

## Testing & Verification
- Manually open `index.html` in a browser to confirm changes render correctly.
- For logic changes, test user flows in the browser (e.g., puzzle reset, keyword reveal, dev tools toggle).

## Documentation
- Update `README.md` whenever behaviour or instructions change in a way users should know about.
