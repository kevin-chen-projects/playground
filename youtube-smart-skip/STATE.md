# State

## Current implementation decisions
- The extension is intentionally split into **content script runtime** and **popup settings UI** with configuration persisted in `chrome.storage.sync`.
- Caption-based detection is the default and should remain the primary path unless a stronger detection source is added.
- Visual detection is explicitly experimental and should be treated as a fallback/opt-in heuristic, not the main product promise.
- YouTube SPA navigation is accounted for by watching URL changes and re-running setup; future edits should preserve that lifecycle behavior.
- Skip behavior uses a fixed `skipSeconds` jump plus a short Undo window rather than trying to infer the precise segment end.

## Important technical notes
- `content.js` owns bootstrap, settings reloads, detector setup/teardown, and the skip action.
- Popup changes are applied indirectly through storage events rather than direct message passing.
- The content script currently targets standard YouTube watch pages; special page types likely need explicit guards if support expands.
- The project is plain HTML/CSS/JS with no build step at the moment.

## Open product questions
- Whether to keep this heuristic-only or add SponsorBlock / other external data
- Whether per-channel rules are essential before any broader release
- Whether fixed skips are good enough or should be replaced with segment-end tracking

## Legacy docs
- The README now serves as the primary overview; keep this file focused on durable decisions that matter next month.
