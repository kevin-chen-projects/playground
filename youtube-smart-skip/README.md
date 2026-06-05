# YouTube Smart Skip

Browser extension that detects likely in-video sponsor segments on YouTube and jumps forward automatically.

## Overview
This is a Manifest V3 Chrome extension with two detection modes:
- caption phrase matching against the live YouTube caption DOM
- optional visual detection that samples the bottom of the playing video and looks for a stable, growing progress-bar-like overlay

When a detector fires, the extension skips ahead by a configurable number of seconds and can show a toast with an Undo button.

## Current capabilities
- Runs as a content script on `*.youtube.com/*`
- Loads and persists settings through `chrome.storage.sync`
- Handles YouTube SPA navigation by tearing down and reattaching when the URL changes
- Supports toggleable caption detection, visual detection, toast display, skip duration, sensitivity, and sponsor phrase list
- Provides a popup UI for settings and reset-to-default behavior

## Core files
- `manifest.json` — MV3 extension manifest and content-script registration
- `content.js` — detection logic, skip action, toast UI, and SPA lifecycle handling
- `content.css` — toast styling
- `popup.html` / `popup.css` / `popup.js` — settings UI backed by synced Chrome storage

## Detection model
### Caption detector
The caption detector watches `.ytp-caption-segment`, keeps a rolling buffer of recent text, lowercases it, and checks whether configured sponsor phrases appear as substrings. This is the practical default because it is cheap, explainable, and easy to tune.

### Visual detector
The visual detector is opt-in and more fragile. It samples frames from the lower portion of the video using an offscreen canvas, scans for long runs of near-constant-color pixels, and looks for stability plus width growth over time. This is meant to catch creator-added sponsor progress bars that do not rely on captions.

## Limitations
- Caption-based detection depends on captions being available and rendered in the DOM
- Canvas-based detection may fail on tainted/cross-origin video frames
- Skipping is currently a fixed jump, not a segment-start/segment-end tracker
- No per-channel allowlist/blocklist yet
- Shorts and live streams are effectively untested

## Next steps
- Add segment-end detection so skips stop closer to the sponsor boundary
- Add per-channel preferences and exclusions
- Consider SponsorBlock integration as a stronger third detection mode
- Add icons, packaging polish, and test notes for browser-store readiness

## Legacy docs
The normalized continuation context now lives in `STATE.md` and `NOTES.md`; this README is the main overview.
