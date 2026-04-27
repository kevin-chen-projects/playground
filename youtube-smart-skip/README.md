# YouTube Smart Skip

A Manifest V3 Chrome extension that detects and auto-skips **in-video sponsor segments** on YouTube — the kind that escape regular ad-blockers because the creator bakes them straight into the video.

## How it detects

Two independent signals, each toggleable from the popup:

| Signal | Default | How it works |
|--------|---------|--------------|
| **Caption / phrase match** | on  | Watches the YouTube caption DOM (`.ytp-caption-segment`). Maintains a rolling buffer of recent caption text; triggers when any sponsor phrase appears. |
| **Visual progress bar**   | off | Every 500 ms draws the bottom 12% of the video to a hidden canvas, scans each row for a long run of near-constant-color pixels, and triggers when such a row is *stable across frames AND grows in width over time*. |

When triggered, the extension jumps `currentTime` forward by `skipSeconds` (default 30) and shows a small dark toast at the bottom of the player with an **Undo** button (5 s).

## Install (unpacked, dev)

1. Open `chrome://extensions`
2. Toggle **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this folder (`youtube-smart-skip/`)
5. Open any YouTube video. The extension icon → settings popup.

> No icons are bundled — Chrome will use a generic puzzle-piece. Drop PNGs in `icons/` and reference them in `manifest.json` if you want a real one.

## Files

| File | Role |
|------|------|
| `manifest.json` | MV3 declaration. Single content script on `*.youtube.com`. Permissions: `storage` + host. |
| `content.js`    | Detection engine (caption observer + visual canvas sampler) and skip action. |
| `content.css`   | Toast styles only. |
| `popup.html` / `popup.css` / `popup.js` | Settings UI persisted to `chrome.storage.sync`. |

## Tuning

- **Sensitivity** (visual only): lower = looser (more skips, more false positives). Default 0.70 is conservative.
- **Sponsor phrases**: edit in the popup, one per line. They are lowercased and matched as substrings against the caption buffer.
- **Skip duration**: 5–120 s. The Undo button reverts to the moment before the skip.

## Known limitations

- **Captions must be on.** Detection is based on the caption DOM. Auto-generated captions work fine, but if captions are off entirely, the caption detector sees nothing.
- **Cross-origin canvas.** YouTube serves video via MSE blobs that are usually same-origin, but in some cases drawing the `<video>` to a canvas throws a `SecurityError`. The visual detector catches that, disables itself for the session, and logs a warning to the console.
- **No segment-end detection.** v0.1 always jumps a fixed `skipSeconds`. The next iteration could keep watching captions and stop when the buffer no longer matches sponsor phrases.
- **No allow / block list per channel.** Useful next addition.
- **Live streams / Shorts.** Untested. Probably best to add a guard.

## Possible next features

- **SponsorBlock API integration** (`sponsor.ajay.app`) as a third, crowd-sourced detection mode — by far the most reliable for already-watched videos.
- **Segment-end detection** by continuing to read captions after the initial skip.
- **Per-channel rules** ("never skip on this creator" / "always skip 60 s").
- **Audio fingerprinting** of common sponsor jingles via `AnalyserNode`.
- **Real icons** + Chrome Web Store listing.
