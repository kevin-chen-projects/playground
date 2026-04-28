# Playground Reference Notes

Quick-reference index for every HTML project in this directory. Each section includes file size, structural map (with line ranges), color tokens, key components, and JS entry points.

For in-file navigation, every HTML/JS file has a comment block at the top with a current FILE INDEX (line numbers reflect post-comment positions). `grep -n "============"` inside any file lists its anchors.

> **Note on line numbers:** The section maps below were originally written against the pre-comment file state. Each file then got a TOC comment block prepended (varying lengths, +19 to +51 lines). For exact current line numbers, open the file and read its top comment. The relative ordering and structure remain accurate.

---

## Table of Contents

1. [Glow Studio (Desktop)](#1-glow-studiohtml) — `glow-studio.html`
2. [Glow Studio Mobile](#2-glow-studio-mobilehtml) — `glow-studio-mobile.html`
3. [Glow Studio Easy](#3-glow-studio-easyhtml) — `glow-studio-easy.html`
4. [Glow Studio Video](#4-glow-studio-videohtml) — `glow-studio-video.html`
5. [Count Champ (Blackjack Trainer)](#5-count-champhtml) — `count-champ.html`
6. [Slot Machine](#6-slot-machinehtml) — `slot-machine.html`
7. [Slot Machine Memes](#7-slot-machine-memeshtml) — `slot-machine-memes.html`
8. [Spades](#8-spadeshtml) — `spades.html`
9. [Bare DAW](#9-daw-folder) — `daw/{index.html, styles.css, app.js}`
10. [YouTube Smart Skip](#10-youtube-smart-skip-folder) — `youtube-smart-skip/{manifest.json, content.{js,css}, popup.{html,css,js}}`
11. [Math Ace (Kumon-style K–5 Tutor)](#11-math-acehtml) — `math-ace.html`
12. [Cross-Project Patterns](#cross-project-patterns)

---

## Shared Conventions

All Glow Studio variants share an identical CSS palette (blush + ink). Slot machines share identical reel/symbol/payout logic. All projects are vanilla HTML/CSS/JS with **no build step** — open the HTML file in a browser to run. Only the DAW pulls external CDNs (Tone.js, VexFlow); everything else is self-contained.

---

## 1. `glow-studio.html`

**Desktop portrait retouching editor.** Brush-based local edits (smooth, heal, brighten, etc.) plus global adjustment sliders, named filter presets, and full undo/redo history. Single image at a time.

- **Lines:** 2,188
- **Layout:** 3-column grid — `220px tools | 1fr canvas | 280px adjustments`
- **Dependencies:** None (pure vanilla)
- **No-build:** Open directly in any modern browser

### Section Map

| Range | Section |
|-------|---------|
| 1–6 | `<head>` meta, viewport, title |
| 7–503 | `<style>` — variables, landing, editor grid, tools sidebar, canvas, preset strip, right panel, toasts |
| 8–26 | CSS custom properties (palette, shadows, radius) |
| 42–68 | Landing view (full-screen upload) |
| 161–169 | Editor 3-column grid |
| 225–272 | Tools sidebar styles |
| 274–335 | Canvas stage + brush cursor + compare label |
| 336–364 | Preset filter strip |
| 365–475 | Right panel sliders + toggles |
| 507–538 | Landing HTML (brand, dropzone, sample, features) |
| 541–565 | Editor header (undo/redo/compare/reset/download) |
| 567–621 | Tools sidebar HTML (smooth/heal/wrinkle/brighten/whiten/sharpen) |
| 623–636 | Canvas area HTML |
| 637–675 | Right panel HTML (brush size, strength, adjustments, presets) |
| 677–2185 | `<script>` — single IIFE |

### Key JS Entry Points

| Line | Function | Purpose |
|------|----------|---------|
| 780 | `showToast(msg)` | Temporary notification |
| 803 | `loadImage(file)` | Load + scale uploaded image |
| 817 | `generateSamplePortrait()` | Procedural demo face on canvas |
| 1442 | `initEditor(img)` | Setup editor with loaded image |
| 1474 | `fitCanvasDisplay()` | Scale canvas to container |
| 1488–1524 | `pushHistory` / `undo` / `redo` | History stack (20-step) |
| 1531 | `render()` | Apply retouch + adjustments and display |
| 1541 | `applyAdjustments(imageData, adj)` | Brightness/contrast/warmth/vibrance/saturation/glow/vignette |
| 1628 | `gaussianBlur(imageData, radius)` | Separable 2D blur |
| 1680 | `applyBrush(cx, cy)` | Core stroke interpolation + effect application |
| 1759 | `healRegion(...)` | Heal blemishes |
| 2115 | `PRESETS` | glow, porcelain, studio, golden, film, rose, crisp, matte, mocha, noir |

### CSS Variables (shared with all Glow Studio variants)

```css
--blush-50  #fff5f7     --ink-900 #23181d     --cream  #fdfaf7
--blush-100 #ffe7ec     --ink-700 #4a3942     --paper  #ffffff
--blush-200 #ffd0da     --ink-500 #7b6670     --radius 14px
--blush-300 #ffb1c1     --ink-300 #b8a7ae
--blush-400 #ff87a0     --shadow-sm 0 1px 2px rgba(50,20,30,.06)
--blush-500 #ec5a7c     --shadow-md 0 8px 24px rgba(60,20,35,.08)
--blush-600 #c93e61     --shadow-lg 0 20px 60px rgba(60,20,35,.12)
```

### Interactions

Upload or sample → pick brush tool → paint with size/strength sliders → apply preset → tweak global adjustments → hold Compare to see original → Cmd+Z undo → Download PNG. Keyboard `[` / `]` resize brush.

---

## 2. `glow-studio-mobile.html`

**Mobile batch photo editor.** Auto-detects skin/face — no painting. Edit 1–5 photos with single-slider effects, switch via thumbnail strip, optional "Apply All" to copy edits across the batch.

- **Lines:** 2,349
- **Layout:** Flex column (header | photo strip | canvas | strength panel | tool strip | bottom actions)
- **Dependencies:** None
- **Mobile-tuned:** `100dvh`, `safe-area-inset-*`, touch tap targets

### Section Map

| Range | Section |
|-------|---------|
| 10–580 | `<style>` — mobile-tuned versions of desktop styles |
| 53–103 | Landing (fixed, safe-area, centered) |
| 169–225 | Editor flex layout + header |
| 228–296 | Photo strip thumbnails (56×56) with edited dot + remove btn |
| 298–340 | Canvas area with radial-gradient background |
| 342–365 | Auto face badge (top-left) |
| 409–433 | Strength panel (single slider for active tool) |
| 435–465 | Horizontal tool strip |
| 467–548 | Bottom actions row (compare / auto-glow / clear / reset) |
| 643–674 | Landing HTML (One-Tap pill, brand, upload, features) |
| 675–727 | Editor header (back, brand, apply-all, download) |
| 728–787 | Editor body (strip, canvas, strength, tools, actions) |
| 843+ | `<script>` IIFE |

### Key JS Entry Points

| Line | Function | Purpose |
|------|----------|---------|
| ~1290 | `computeSkinMask(imageData, blur)` | Luminance/saturation skin detection |
| 1301 | `computeBlemishMask(orig, blur, skinMask)` | Dark spots |
| 1323 | `computeWrinkleMask(orig, blur, skinMask)` | Wrinkle lines |
| 1341 | `computeWhiteMask(orig, skinMask)` | Teeth/eye whites |
| 1362 | `applySmooth(out, photo, strength)` | Skin blend with medium blur |
| 1378 | `applyHeal(out, photo, strength)` | Blemish-targeted blur |
| 1394 | `applyWrinkle(out, photo, strength)` | Wrinkle-region blur |
| 1410 | `applyBrighten(out, photo, strength)` | Skin lift + warmth |
| 1425 | `applyWhiten(out, photo, strength)` | Desaturate + blue-shift |
| 1442 | `applySharpen(out, photo, strength)` | Unsharp mask |
| 1453 | `applyGlow(out, photo, strength)` | Screen-blend blur |
| 1466 | `applyAllBtn` listener | Copy current photo's effects to all |

### Differences vs Desktop

- No painting (auto detection only)
- Single strength slider per effect
- Multi-photo (max 5), thumbnail strip switcher
- No history/undo
- No named-filter presets (data may exist in code)
- 7 effects vs desktop's 6 brush tools

---

## 3. `glow-studio-easy.html`

**Mobile-easy variant** — same engine as mobile, alternate visual presentation: prominent "One-Tap Easy" pill, numbered (1/2/3) feature dots, slightly different feature-list styling. Functional logic is otherwise identical.

- **Lines:** 1,618
- **Layout:** Same flex column as mobile
- **Dependencies:** None

### Section Map

| Range | Section |
|-------|---------|
| 10–580 | `<style>` — mobile base + `.easy-pill` + numbered feature dots |
| 53–117 | Landing with `.easy-pill` |
| 150–170 | `.landing-features` numbered-circles variant |
| 582–607 | Landing HTML ("One-Tap Easy" + tagline + numbered features) |
| 690+ | `<script>` (mirrors mobile) |

### Differences vs Mobile

- "One-Tap Easy" pill at top
- Large numbered (1/2/3) circles for features instead of small dot indicators
- Otherwise identical functionality and effect math

---

## 4. `glow-studio-video.html`

**Video face-smoothing tool.** Tone-safe skin smoothing with real-time preview, frame-by-frame export. Emphasizes preserving natural skin colors across all tones via educational badges and protect-features toggle. Upload and export are iOS-Safari-compatible.

- **Lines:** 1,608
- **Layout:** 2-column grid — `1fr canvas | 320px options panel`; collapses to single column under 900px
- **Dependencies:** None

### Section Map

| Range | Section |
|-------|---------|
| 7–629 | `<style>` |
| 41–88 | Landing (video icon, dropzone) |
| 139–147 | Editor 2-column grid |
| 205–335 | Canvas area (dark bg, player overlay, skin-overlay, processing spinner) |
| 286–334 | Processing overlay (spinner + progress bar + percentage) |
| 336–400 | Player bar (scrubber, time, volume, play/pause) |
| 401–595 | Options panel (sliders, toggles, presets, color adjustments, info box) |
| 633–658 | Landing HTML (Glow.Studio VIDEO brand, dropzone, features) |
| 661–678 | Editor header |
| 680–716 | Canvas + overlays + player bar |
| 718–780 | Options panel (presets, smoothing sliders, tone & color) |
| 785+ | `<script>` |

### Key JS Entry Points

| Line | Function | Purpose |
|------|----------|---------|
| 939  | `loadVideoFile(file)` | iOS-safe blob-URL load — DOM-attached `<video>`, no `crossOrigin`, multi-event ready check |
| 984  | `initEditor(video)` | Cap to `MAX_PROC_DIM` (720), size canvases, wire events, render first frame |
| 1061 | `processFrame()` | Core pipeline: draw → native blur → skin-mask blend → adjustments → display |
| 1116 | `blendSkinSmoothing(orig, blur)` | YCbCr skin detection + frequency-separation smoothing (per-pixel) |
| 1219 | `applyAdjustments(imageData)` | Tone-preserving brightness/contrast/warmth/vibrance |
| 1270 | `togglePlay()` | Play/pause |
| 1279 | `updatePlayIcon()` | Sync icon + skin overlay badge |
| 1291 | `fmtTime(sec)` | MM:SS formatting |
| 1298 | `updateTimeUI()` | Time label + scrubber position |
| 1309 | `scrubFromEvent(e)` | Mouse/touch scrub |
| 1335–1358 | Volume + mute control | |
| 1362 | `bindSlider(id, transform, onChange)` | Generic slider binder |
| 1382 | Preset chip handlers | 5 preset strength levels |
| 1406–1414 | `maskToggle` / `protectToggle` | Debug overlays |
| 1458–1466 | `showOriginal()` / `hideOriginal()` | Compare mode |
| 1513 | `downloadBtn` click | Export — MIME negotiation (WebM→MP4), Web Audio audio fallback for iOS, MediaRecorder loop |

### Slider Defaults

`strength=0–100`, `detail=30`, `sensitivity=50`, `blur=8` (range 2–20), tone adjustments are `-30..+30`.

### Differences vs Other Glow Studio Variants

- Video input (MP4/MOV/WebM) instead of images
- Real-time preview as sliders move
- Frame-by-frame batch render for export (WebM on desktop/Android, MP4 on iOS Safari)
- Player controls (scrubber, play/pause, time, volume, mute)
- Strength presets only (no named filter presets)
- Pulsing "Smoothing active" indicator
- Educational tone-safety messaging

### Browser Compatibility & Usage

End-to-end iOS Safari support (iPhone Photos-app uploads, H.264/AAC MP4 export):

- **Upload path:** `<video>` is appended to the DOM (positioned offscreen) with no `crossOrigin` attribute — both are required for iOS to decode blob URLs reliably. Ready-check listens to `loadedmetadata`, `loadeddata`, and `canplay` and hands off as soon as `readyState ≥ 2` with a non-zero `videoWidth`.
- **Export container:** `MediaRecorder.isTypeSupported()` walks a preference list (WebM VP9+Opus → WebM VP8+Opus → MP4 avc1+mp4a.40.2). iOS Safari only matches MP4. The Blob MIME and download filename extension (`.webm` / `.mp4`) follow the negotiated type.
- **Audio capture:** `video.captureStream()` on desktop; iOS lacks it, so the export handler lazily builds an `AudioContext` → `MediaElementSource` → `MediaStreamDestination` graph inside the click (user-gesture scope) and feeds its tracks into `MediaRecorder`. The graph is cached on `state.audioCtx/audioSource/audioDest`; `createMediaElementSource` is one-shot per element, so **"New Video" disconnects** the nodes so the next upload can rebind.
- **User gesture:** All AudioContext creation/`resume()` and MediaRecorder setup stays synchronous inside the click handler; awaits for seek and `play()` run after.

### How to Use

1. Open `glow-studio-video.html` directly in a browser (no build step).
2. Drop a video onto the dropzone or tap it to browse — iPhone opens the Photos/Camera picker.
3. Adjust **Strength**, **Detail Preserve**, **Skin Sensitivity**, **Blur Radius**, then fine-tune **Brightness / Contrast / Warmth / Vibrance**. Toggle the skin-mask overlay to see which pixels the smoother treats as skin.
4. Press play, scrub, or use `Space` / `←` / `→` for playback. Hold the compare button to see the untouched original.
5. Click **Process & Save**. The full video re-plays while the pipeline renders each frame; progress is shown in the overlay. A `.webm` (desktop/Android) or `.mp4` (iOS) is downloaded when done.

---

## 5. `count-champ.html`

**Blackjack card-counting trainer + Monte Carlo simulator.** Configurable rules, bet spread, wong-in/out, Kelly fractional sizing, deviation toggles (Illustrious 18 + Fab 4), bankroll-trace charts. Three tabs: Simulator | Cheat Sheets | Practice Table.

- **Lines:** 2,540
- **Layout:** Header + tabs; Simulator is `380px sidebar | 1fr results` (collapses < 1000px)
- **Dependencies:** None (Canvas charts native)

### Section Map

| Range | Section |
|-------|---------|
| 1–6 | `<head>` |
| 7–563 | `<style>` — dark theme, header/tabs, panels, spread table, results canvas, card flip |
| 565–2540 | `<body>` |
| Header | Brand `C♠` + 3 tabs |
| Simulator tab | Left param panel + right results panel |
| Cheat Sheets tab | System dropdown + tag grid + strategy tables |
| Practice Table tab | Live dealing felt with action buttons |
| ~665–1000 | `COUNTING_SYSTEMS` — Hi-Lo, Hi-Opt I/II, Zen, Red 7, KO |
| 1005–1156 | Deviations (Illustrious 18 + Fab 4) by TC |

### Key JS Entry Points

| Line | Function | Purpose |
|------|----------|---------|
| 1040 | `handTotal()` | Sum cards, Aces as 1 if bust |
| 1049 | `isSoft()` | Ace as 11 without bust |
| 1055 | `isPair()` | Two cards same rank |
| 1066 | `bsLookup()` | Basic-strategy matrix → H/S/D/R/P |
| 1092 | `resolveBS()` | Apply rule filters |
| 1112 | `deviationLookup()` | TC-based play deviation |
| 1171 | `getTrueCount()` | RC / decks remaining (or unbalanced RC-adjusted) |
| 1205 | `drawCard()` | Pop from shoe, count card |
| 1212 | `dealerPlay()` | Hit soft 17 option |
| 1224 | `settle()` | Resolve hand, insurance, doubles |
| 1247 | `playHand()` | Splits, doubles, insurance flow |
| ~1300 | `runSimulation()` | Async Monte Carlo loop |
| 1643 | `renderResults()` | KPI grid + bankroll chart |
| 1689 | `drawChart()` | Canvas bankroll traces with grid |

### CSS Variables

```css
--bg #0b0f1a   --accent #2ea96a   --felt #0e5a3a   --warn #e8a13a
--danger #e06060   --card-red #c83030   --card-black #1a1a22
```

### Configurable Rules

H17/S17, 3:2 vs 6:5 BJ, double restrictions, surrender, DAS, RSA, HSA, max splits, deck count, penetration, players. Bet spread = 6 TC buckets (≤1, 2, 3, 4, 5, 6+).

### Output Metrics

EV, hourly SD, ROR, N0 (hands to overcome variance), win rate, bankroll percentiles, up to 80 sample bankroll-trace paths.

---

## 6. `slot-machine.html`

**Three-reel birthday slot machine** with emoji symbols. Procedurally-generated audio (no MP3s) — beeps, ticking reels, win jingles, jackpot fanfare, 8s chiptune loop. Ticket-ejection modal on win.

- **Lines:** 1,442
- **Layout:** Centered cabinet, marquee top, 3 reels, bet buttons, SPIN button, paytable
- **Dependencies:** None (Web Audio synthesis)

### Section Map

| Range | Section |
|-------|---------|
| 1–6 | `<head>` |
| 7–715 | `<style>` |
| 44–59 | Cabinet (brown/gold gradient, 25px radius) |
| 61–91 | 12 pulsing top lights |
| 93–127 | Marquee shine animation |
| 129–160 | Credit/bet/win 3-column grid |
| 162–299 | Reels (120px symbol, 360px container, payline glow, motion blur) |
| 433–472 | Collapsible paytable |
| 474–642 | Ticket overlay (slot, lip, ejection animation, barcode) |
| 683–715 | Music toggle (fixed bottom-right) |
| 717–812 | `<body>` (cabinet, balloons, marquee, credits, reels, bets, SPIN, message, paytable, footer, music) |
| 814+ | `<script>` |

### Reel Composition (line ~818)

32 stops total — 6 cherry, 6 lemon, 5 plum, 5 bell, 4 bar, 3 double-bar, 2 triple-bar, 1 seven. Tuned for ~95% RTP / ~50% hit frequency.

### Key JS Entry Points

| Line | Function | Purpose |
|------|----------|---------|
| 865 | `getAudioCtx()` | Singleton Web Audio context |
| 872 | `beep()` | Oscillator with exponential fade |
| 885 | `reelTickStart()` | Slowing-clicks (1.04× per tick) |
| 897 | `playWinJingle()` | Triangle-wave win sequences |
| 903 | `playJackpot()` | 11-note fanfare |
| 957 | `scheduleMusicNote()` | Schedule on Web Audio timeline |
| 986 | `startBgMusic()` | 1s look-ahead chiptune scheduler |
| 1003 | `stopBgMusic()` | Stop scheduler + queued nodes |
| 1037 | `spinReel()` | Strip animation with overshoot bounce |
| 1087 | `computeWin()` | Match symbols vs paytable, return amount + lit indices |
| 1113 | `createConfetti()` | Falling colored squares |
| 1145 | `handleSpin()` | Full spin flow |
| 1223 | `ejectTicket()` | Render ticket HTML, animate ejection |
| 1293 | `resetGame()` | Restore initial state |

### Color Scheme

Bg: radial gradient (purple → red → dark). Cabinet: brown gradient with `#ffd700` gold border. Credits `#00ff55`, bet `#ffdd00`, winnings `#ff77ff`, payline `#ff0033` (gold on win).

---

## 7. `slot-machine-memes.html`

**Slot machine + meme sound test panel.** Identical core gameplay to `slot-machine.html`. Adds three test buttons that try to load real MP3s from `./sounds/` and procedurally fall back if missing.

- **Lines:** 1,701 (~260 more than base)
- **Layout:** Identical to `slot-machine.html` + sound-test panel below footer
- **Dependencies:** Optional `./sounds/{fahhhh,goteem,wethebest}.mp3` (procedural fallback always works)

### What's Added vs `slot-machine.html`

| Type | Lines | Change |
|------|-------|--------|
| CSS | +41 | `.sound-test` panel styling |
| HTML | +8 | 3 test buttons in body |
| JS | +186 | Meme audio fns + listeners |

### Meme JS Functions

| Line | Function | Purpose |
|------|----------|---------|
| 908–912 | `MEME_FILES` | Map meme key → MP3 path |
| 914 | `playMemeOrFallback(key, vol, fn)` | Try Audio, catch, run procedural |
| 933 | `proceduralFahhhh()` | Sawtooth + LFO vibrato (8 Hz, 30 depth), 1.2s |
| ~960 | `proceduralGoteem()` | Square-wave descending pitch |
| ~990 | `proceduralWethebest()` | Ascending chords + bass wobble |
| ~1060 | `triggerLoserMeme()` | "fahhhh" on no-payout spin |
| ~1065 | `triggerGoteemMeme()` | Loss cashout |
| ~1070 | `triggerWetheBestMeme()` | Win cashout |
| 1339–1355 | Test-button listeners | Manual meme triggers |

### What's Identical

REEL composition, SYMBOL_HTML, paytable, spin animation, music scheduler, ticket eject, all base audio.

---

## 8. `spades.html`

**4-player Spades** — you vs 3 AI bots with per-bot difficulty (novice / intermediate / advanced). Bidding (0–6 or Nil), trick-taking, partner Nil defense, 10-bag penalty, sound effects, sim-your-seat option.

- **Lines:** 2,153
- **Layout:** Full-viewport elliptical felt table (min 1100×720), 4 cardinal player positions
- **Dependencies:** None (procedural Web Audio)

### Section Map

| Range | Section |
|-------|---------|
| 1–6 | `<head>` |
| 7–699 | `<style>` (felt, wood, cards 88×124, trick area, scoreboard, modals) |
| 802–907 | `<body>` — table, 4 player divs (S/N/W/E), trick center, status banner, scoreboard, overlays, sim controls |
| 909+ | `<script>` |
| 916–921 | `SUITS / RANK_NAMES / SEAT_NAMES` |
| 924 | `TEAM_OF(seat)` (0,2 → us; 1,3 → them) |
| 940–1050 | Audio module (flick, deal, sweep, tick, chime) |
| 1056–1086 | `makeDeck`, `shuffle`, `sortHand` |
| 1092–1120 | Game state |
| 1572–1597 | `cardEl` builds card DOM |
| 1599+ | `renderHands` arranges per position |

### Bot AI

| Level | Strategy |
|-------|----------|
| Novice | Random legal move |
| Intermediate | Follow suit + high-card heuristics + duck bags |
| Advanced | Lead-strategy w/ Ace priority, Nil-partner defense, bag avoidance |

### Scoring (line 1503 `scoreHand`)

- **Nil:** +100 if 0 tricks, –100 otherwise
- **Contract met:** `10 × bid` + 1 per overtrick (bag)
- **Contract missed:** `–10 × bid`
- **Bags:** –100 once a team accumulates 10

### CSS Variables

```css
--felt #1d5a3a   --wood #5a3a20   --card-bg #fdf8ed   --card-red #b03020
--card-black #1a1a1a   --highlight #f1c40f   --text-light #ecf0f1   --text-dim #a8b2b8
```

### Interactions

Setup → choose 3 opponent difficulties + target score (200/300/500) → bid (0–6 or Nil) → click legal card → status banner narrates → result modal each hand → game-over modal at target. Sound toggle and "simulate my seat" controls bottom-right.

---

## 9. `daw/` folder

**Browser DAW** — drum sequencer + piano roll, drag-drop instruments, sections (loop or song), QWERTY/MIDI keyboard input, live VexFlow notation, WAV + MIDI export.

- **Files:** `index.html` (131), `styles.css` (533), `app.js` (1,424)
- **Layout:** Header / 280px palette sidebar / timeline / status bar
- **Dependencies:** Tone.js v14.8.49, VexFlow v3.0.9 (CDN); Web MIDI API for keyboard input

### `index.html` map

| Range | Section |
|-------|---------|
| 10–42 | Header (transport, BPM, steps, MIDI, export) |
| 45–122 | App container (palette + timeline) |
| 46–83 | Left sidebar (palette + help) |
| 85–122 | Timeline (section tabs, ruler, track canvas, notation panel, status bar) |
| 125 | Toast region |
| 127–128 | CDN scripts |

### `styles.css` map

| Range | Section |
|-------|---------|
| 1–22 | Root variables (dark theme) |
| 24–36 | Global reset |
| 38–107 | Top bar |
| 109–115 | Main grid (280px sidebar + flexible content) |
| 117–166 | Palette sidebar |
| 168–212 | Section tabs |
| 214–225 | Timeline scroll container |
| 240–267 | Ruler (beat markers) |
| 269–302 | Track row base |
| 304–352 | Drum sequencer |
| 354–456 | Piano roll |
| 458–492 | Notation panel |
| 494–527 | Status bar + toast |
| 529–533 | Mobile breakpoint (≤900px) |

### CSS Variables

```css
--bg #0f1115         --text #e7ebf3       --accent #6ea8ff
--bg-2 #161a22       --muted #8a93a6      --accent-2 #a371ff
--bg-3 #1d2230       --border #2a3244     --danger #ff6b6b
--panel #1a1f2b      --selected #6ea8ff   --playhead rgba(255,210,63,.22)
--panel-2 #222838    --playhead-edge #ffd23f
--shadow 0 6px 24px rgba(0,0,0,.4)
--radius 8px   --cell 34px   --pr-row 16px   --step-h 34px   --gutter 56px
```

### `app.js` map

| Range | Section |
|-------|---------|
| 1–95 | `INSTRUMENTS` — 7 synths (kick, snare, hi-hat, clap, bass, lead, pad, pluck) |
| 109–132 | `state` (tracks, sections, currentSectionIdx, playMode, playing, playhead) |
| 134–162 | DOM refs + `toast`, `setStatus`, `kindOf` |
| 166–283 | Section management (`curSection`, `trackData`, `setCurrentSection`, add/duplicate/remove/rename, `renderSections`) |
| 285–307 | Music helpers (`midiToNoteName`, `isBlackKey`, `getCellWidth`, `secondsPerStep`) |
| 309–383 | Palette + track lifecycle (`renderPalette`, `addTrack`, `removeTrack`, `selectTrack`, drag-drop) |
| 399–495 | UI rendering (`renderRuler`, `renderTracks`, `buildTrackControls`) |
| 497–535 | Drum sequencer (`buildDrumBody`) |
| 537–636 | Piano roll (`buildPianoRoll`, `createNoteEl`) |
| 638–715 | Mouse + cursor input (`onPianoGridMouseDown`, `playPreview`, `flashKey`, `updateCursor`, `updateOctaveInfo`) |
| 724–796 | Note insertion (`insertNoteAtCursor`, `backspaceNote`, `moveCursor`, `scrollToKeepVisible`) |
| 799–817 | `setStepsCount(n)` |
| 820–925 | Playback (`ensureAudio`, `startPlayback`, `stopPlayback`, `highlightStep`, `togglePlayMode`) |
| 927–1039 | `exportWav` + `audioBufferToWav` + `downloadBlob` |
| 1041–1158 | `exportMidi` + `vlq` + `makeTrackChunk` |
| 1160–1200 | `initMidi` + `wireMidiInputs` + `onMidiMessage` |
| 1202–1339 | VexFlow notation (`renderNotation`, `buildBarTickables`, `midiToVfKey`, `stepsToVfDuration`) |
| 1341–1425 | Event wiring + boot (Space play, [/] octave, ←/→ cursor, 1–8 length, A/W/S/E/D/F/T/G/Y/H/U/J/K piano) |

### Key Architecture Notes

- **No framework** — manual `render*()` functions called on state changes
- **Lazy track data** — patterns only created when track added to a section
- **Shared insertion** — keyboard, MIDI, mouse all funnel through `insertNoteAtCursor()`
- **Immutable export** — WAV render uses fresh synth instances to avoid live-playhead interference
- **MIDI chord window** — notes within 150ms of each other stack as a chord
- **Drum channel** — channel 9 in MIDI export; melodic instruments fill channels 0–15 skipping 9
- **Notation duration mapping** — round-down: 16+ steps → whole, 8+ → half, 4+ → quarter, etc.

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Play/stop |
| `[` `]` | Octave down/up |
| ← → | Cursor left/right |
| Home / End | Jump to start/end of section |
| 1–8 | Set note insert length |
| A W S E D F T G Y H U J K | QWERTY chromatic piano |
| Backspace | Delete last note |

---

## 10. `youtube-smart-skip/` folder

**Chrome extension (Manifest V3) for in-video sponsor detection.** Auto-skips creator-baked sponsor segments that escape regular ad-blockers, using two independent signals: caption-keyword matching (on by default) and visual progress-bar detection (opt-in, experimental).

- **Files:** `manifest.json` (21), `content.js` (359), `content.css` (64), `popup.html` (83), `popup.css` (203), `popup.js` (87), `README.md` (55)
- **Layout (popup):** 340px-wide vertical settings stack
- **Dependencies:** None — pure browser APIs (`MutationObserver`, `chrome.storage.sync`, Canvas 2D)
- **No-build:** Load unpacked via `chrome://extensions` → Developer mode → Load unpacked

### File Map

| File | Role |
|------|------|
| `manifest.json` | MV3 declaration. Single content script on `*.youtube.com`. Permissions: `storage` + host. |
| `content.js`    | Detection engine (caption observer + visual canvas sampler) and skip action. |
| `content.css`   | Toast styles only. |
| `popup.html`    | Settings UI shell (340px). |
| `popup.css`     | Dark popup theme. |
| `popup.js`      | Reads/writes `chrome.storage.sync`; content.js auto-reattaches via `storage.onChanged`. |
| `README.md`     | Install steps, tuning, limitations, future ideas. |

### Detection Strategies

| Signal | Default | Mechanism |
|--------|---------|-----------|
| Caption keyword | on | `MutationObserver` on `.ytp-caption-segment` text. Rolling 25-entry buffer substring-matched against an editable phrase list ("sponsor of", "use code", "today's video is brought", etc.). |
| Visual progress bar | off | Every 500 ms, `ctx.drawImage()` of bottom 12% of the `<video>` to a 200×24 canvas. For each row, compute mean RGB + longest run of near-mean pixels. Row is a "bar" if run covers >30% of width and variance is low. Skip triggers when the same bar persists ≥6 frames AND grows ≥4 frames. Self-disables if `getImageData` throws (cross-origin tainted canvas). |

### Key JS Entry Points (`content.js`)

| Line | Function | Purpose |
|------|----------|---------|
| 33   | `DEFAULTS` | Settings shape + sponsor keyword seed list |
| 65   | bootstrap (storage load + SPA URL watcher) | Re-attaches detectors when YouTube swaps videos in-place |
| 105  | `setup()` / `teardown()` | Per-video attach / detach |
| 130  | `findVideo()` | Polls for `video.html5-main-video` (up to ~15 s) |
| 145  | `startCaptionWatch()` / `matchesSponsorKeywords()` | Caption observer + substring match |
| 195  | `startVisualWatch()` / `sampleBottomStrip()` / `detectHorizontalBar()` | Canvas pixel scan + temporal stability check |
| 270  | `triggerSkip(source)` | 5 s debounced jump + toast |
| 295  | `showToast(msg, undoTime)` | DOM toast with Undo button (5 s) |

### Settings (persisted to `chrome.storage.sync`)

| Key | Default | Range | Notes |
|-----|---------|-------|-------|
| `enabled`       | `true`  | bool      | Master switch |
| `captionDetect` | `true`  | bool      | Caption observer |
| `visualDetect`  | `false` | bool      | Visual sampler (experimental) |
| `skipSeconds`   | `30`    | 5–120     | Forward jump distance |
| `sensitivity`   | `0.70`  | 0.30–0.95 | Visual detector threshold |
| `showToast`     | `true`  | bool      | Toast + Undo |
| `keywords`      | array   | string[]  | Sponsor phrases (lowercased substring match) |

### CSS Variables (popup)

```css
--bg      #0e0e10     --text    #f1f1f2     --accent  #ec5a7c
--panel   #18181b     --muted   #9b9ba0     --accent2 #ff87a0
--border  #2a2a2e
```

(Accent intentionally matches the Glow Studio blush family — `--blush-500`.)

### Known Limitations

- **Captions must be on** for caption detection (YouTube's auto-generated captions work fine).
- **Cross-origin canvas:** YouTube's MSE blob URLs are usually same-origin, but if `getImageData` throws, the visual detector self-disables for the session and logs a warning.
- **Fixed-duration skip.** v0.1 always jumps `skipSeconds` — does not yet detect segment end by re-checking captions.
- **No per-channel rules.** No Live / Shorts guards yet.

### Possible Next Iterations

- SponsorBlock API (`sponsor.ajay.app`) as a third, crowd-sourced detection source — most reliable for already-seen videos.
- Segment-end detection: keep watching captions after a skip, stop only when buffer is sponsor-free.
- Per-channel allow / block list.
- Audio fingerprinting via `AnalyserNode` for common sponsor-jingle templates.

---

## 11. `math-ace.html`

**Kumon-style math tutor for elementary students (K–5).** Each topic has a `Learn` pane (explanation + worked examples) and a `Practice` pane that generates 15 sequential problems with instant feedback, a running timer, a streak counter, and a results screen with 1–3 stars. Star earnings + best times persist per topic in `localStorage`.

- **Lines:** 2,766
- **Layout:** Single-column responsive; 4-view state machine (landing → grade select → topic grid → topic detail)
- **Dependencies:** None (pure vanilla HTML/CSS/JS)
- **No-build:** Open directly in any modern browser

### Curriculum

44 topics total, organized by grade. **Grade 4 and 5 are aligned to California Common Core State Standards (CA-CCSS-M)** with standard codes cited in topic blurbs. K–3 are lighter on standards-mapping and focus on foundational skills.

| Grade | Topics | Headline coverage |
|-------|--------|-------------------|
| K | 6 | Counting to 10/20, number words, picture +, shapes (SVG), bigger/smaller |
| 1 | 6 | +/− within 10 and 20, skip counting, place value (tens/ones) |
| 2 | 6 | 2-digit +/− (with & w/o regrouping), analog clock reading, counting coins |
| 3 | 6 | ×-tables, ÷, fractions intro (shaded bar), 3-digit +, rounding, word problems |
| 4 | **10** | Multi-digit × (4.NBT.5), long division ÷1-digit (4.NBT.6), factors & multiples (4.OA.4), equivalent fractions (4.NF.1), compare fractions (4.NF.2), add/sub same-denom (4.NF.3), fraction × whole (4.NF.4), decimals to hundredths (4.NF.5-7), area/perimeter (4.MD.3), **Advanced long division ★** (2- and 3-digit divisors — beyond CA 4th grade scope, for accelerated learners) |
| 5 | **10** | 3-dig × 2-dig (5.NBT.5), ÷ by 2-digit divisor (5.NBT.6), add/sub unlike-denom fractions (5.NF.1), × fractions (5.NF.4), ÷ with unit fractions (5.NF.7), decimal operations (5.NBT.7), powers of 10 (5.NBT.2), order of operations (5.OA.1), coordinate plane first quadrant (5.G.1-2), volume (5.MD.5) |

**Notable CA-CCSS alignment decisions:**
- 5th grade has NO percentages topic — percentages are 6.RP.3c in CA (6th grade).
- 5th grade divide-fractions (`divFractions`) is restricted to 5.NF.7 cases (unit-fraction-by-whole and whole-by-unit-fraction), not full fraction ÷ fraction (which is 6.NS.1).
- 4th grade's `longDivisionAdvanced` is explicitly marked "beyond standard curriculum" — it exists to support accelerated learners doing 2-digit and 3-digit divisors earlier.

### Section Map

| Range | Section |
|-------|---------|
| 1–74 | `<!-- ... -->` header TOC comment (navigation anchors) |
| 76–726 | `<style>` — CSS variables, landing, grade/topic grids, lesson/practice, results, confetti, mobile |
| 83–120 | `:root` palette (violet + sun + teal + coral + cream) |
| 156–194 | `.top-bar` / `.brand` / `.breadcrumb` |
| 197–247 | Landing (hero, pill, CTA, feature cards) |
| 249–310 | Grade select grid (K/1/2/3/4/5 each with gradient badge) |
| 313–339 | Topic card grid (icon, name, blurb, stars earned, best time) |
| 342–381 | Topic detail head + tab bar |
| 384–448 | Lesson pane (`.lesson-card`, `.example`, `.goto-practice`) |
| 451–655 | Practice pane (problem card, inputs, keypad, feedback, hint, skip) |
| 659–720 | Results card (emoji, title, stars, stats, retry buttons) + confetti pieces |
| 722–742 | Mobile breakpoint (≤640px) |
| 746–814 | `<body>` — all 4 views (landing, grade, topic, detail) |
| 817+ | `<script>` IIFE |

### Key JS Entry Points

| Line | Function | Purpose |
|------|----------|---------|
| ~850 | `rand`, `pick`, `shuffle`, `gcd`, `simplify`, `fmtTime`, `fmtDec` | Core helpers |
| ~870 | `shapeSvg(name)` | Inline SVG for 10 shapes (circle, square, triangle, rectangle, star, heart, oval, diamond, pentagon, hexagon) |
| ~895 | `clockSvg(h, m)` | Inline SVG analog clock for 2nd-grade telling-time |
| ~918 | `fractionBar(p, n)` | Inline SVG shaded-parts bar for fractions intro |
| ~933 | `CURRICULUM` | All 44 topics, grouped by grade key (`K`, `1`..`5`) |
| ~2160 | `state` | `{ view, gradeKey, topicId, practice, stars }` |
| ~2185 | `showView(name)` | Swap `.view.active` class and re-render breadcrumb |
| ~2260 | `renderLesson(topic)` | Inject lesson HTML + worked examples grid |
| ~2290 | `startPractice()` / `renderPractice()` | Build problem card + input of correct `inputType` |
| ~2425 | `answersEqual(user, expected, inputType)` | Type-aware comparison (int / fraction / decimal / text / division) |
| ~2470 | `prettyAnswer(ans, inputType)` | Pretty-print for feedback (e.g., `3/1` → `3`, `127 r 0` → `127`) |
| ~2540 | `nextProblem()` / `endSet()` | Advance or show results |
| ~2570 | `fireConfetti(count)` | Star-reward celebration |

### Problem `gen()` Contract

Each topic's `gen()` returns:

```js
{
  display: String,         // HTML shown as the problem question
  answer: String,          // Canonical expected answer (e.g., "127 r 2", "3/4", "0.85")
  inputType: String,       // 'int' | 'fraction' | 'decimal' | 'text' | 'division'
  visual?: String,         // Optional HTML (SVG) shown above the input
  hint?: String            // Optional italic caption shown below the input
}
```

### Input Types

| Type | UI | Accepted user formats | Match rule |
|------|----|------------------------|------------|
| `int` | single text input (inputmode=numeric) | `"127"`, `"1,234"` | `parseInt` after stripping commas/spaces |
| `fraction` | two small inputs (num / bar / den) | `"3/4"`, or `"3"` with blank denom → `3/1` | Cross-multiplication equality (`un*ed === en*ud`); bare int matched if expected is whole |
| `decimal` | single text input (inputmode=decimal) | `"4.9"`, `"4.90"`, `"1,234.5"` | `Math.abs(a - b) < 0.005` after stripping commas |
| `text` | single text input | `"(3,4)"`, `"circle"` | Lowercased, stripped of whitespace & parens |
| `division` | single text input | `"127"`, `"127 r 2"`, `"127R2"`, `"127 rem 2"`, `"127 remainder 2"` | Parsed to `[quotient, remainder]` and compared; `N` ≡ `N r 0` |

### Persistence

`localStorage['mathace_stars']` — `{ topicId: starCount (0–3) }`. Only written when the new star count is strictly greater than the previous (so getting 2 stars after previously earning 3 doesn't erase progress).

`localStorage['mathace_times']` — `{ topicId: bestSeconds }`. Only written when accuracy ≥ 80% AND the time is a new personal best.

### CSS Variables

```css
--violet-500 #6d4ae0   --sun-400  #ffd23f   --teal-400 #2ec4b6   --coral-500 #ff6b6b
--violet-400 #9570ff   --sun-300  #ffe27a   --teal-300 #7ee0d2
--violet-100 #ebe3ff   --ink-900  #1e1b3a   --cream    #fef6e4   --paper #ffffff
--radius 16px   --radius-lg 24px
```

### Interactions / Flow

Landing hero → "Choose a grade" CTA → grade card → topic card → **Learn** tab (default) shows lesson + examples → "Start Practice" CTA or click the **Practice** tab → 15 problems render one at a time. Enter submits. Wrong answer shakes the card and shows the correct answer; right answer pulses green and auto-advances. Hit "Skip this one" to mark wrong and move on. After problem 15, a results card shows accuracy %, time, star rating (≥60% / ≥80% / ≥95%), and a confetti burst if stars earned. Progress bar + streak counter + live timer in the practice header.

### Why It's "Kumon-style"

Kumon worksheets drill a narrow skill repeatedly — each worksheet has ~15–30 similar problems to build fluency through repetition. Math Ace mirrors that: 15 problems of the same topic in a row, with slight intra-set variation from the generator. The lesson + worked examples mirror a Kumon instructor's introduction before handing a worksheet to a student.

---

## Cross-Project Patterns

| Pattern | Where |
|---------|-------|
| **Single IIFE script** | All Glow Studio variants, both slot machines, spades, math-ace |
| **Procedural Web Audio (no files)** | slot-machine, slot-machine-memes (with optional MP3), spades, daw (Tone.js) |
| **Canvas-based rendering** | All Glow Studio (image processing), count-champ (charts), slot machines (none — DOM), spades (none — DOM) |
| **Inline SVG for static graphics** | math-ace (shapes, analog clock, fraction bars) |
| **Shared blush+ink palette** | All 4 Glow Studio variants |
| **Identical reel/paytable engine** | slot-machine + slot-machine-memes |
| **CSS variables for theming** | All projects |
| **localStorage-persisted progress** | math-ace (stars + best times per topic) |
| **View-state-machine SPA** | math-ace (landing → grade → topic → detail), count-champ (tabs) |
| **No build step / no framework** | Every project |
| **External CDNs** | DAW only (Tone.js + VexFlow) |
| **Chrome extension (MV3) / content script** | youtube-smart-skip only |
| **`chrome.storage.sync` for settings** | youtube-smart-skip only |

### File Size Summary

| File | Lines | Type |
|------|-------|------|
| count-champ.html | 2,580 | Trainer/sim |
| glow-studio-mobile.html | 2,399 | Photo editor |
| glow-studio.html | 2,227 | Photo editor |
| spades.html | 2,189 | Card game |
| math-ace.html | 2,766 | K–5 math tutor |
| slot-machine-memes.html | 1,754 | Slot game |
| glow-studio-easy.html | 1,662 | Photo editor |
| glow-studio-video.html | 1,713 | Video editor |
| slot-machine.html | 1,481 | Slot game |
| daw/app.js | 1,456 | DAW engine |
| daw/styles.css | 533 | DAW styling |
| daw/index.html | 150 | DAW shell |
| youtube-smart-skip/content.js | 359 | Extension detection engine |
| youtube-smart-skip/popup.css | 203 | Extension popup styling |
| youtube-smart-skip/popup.js | 87 | Extension popup controller |
| youtube-smart-skip/popup.html | 83 | Extension popup shell |
| youtube-smart-skip/content.css | 64 | Extension toast styling |
| youtube-smart-skip/README.md | 55 | Extension docs |
| youtube-smart-skip/manifest.json | 21 | Extension manifest (MV3) |
| **Total** | **21,782** | |

### Quick `grep` recipes

```bash
# List all section anchors in a file
grep -n "============" glow-studio.html

# Find a function by name
grep -n "function applyAdjustments" glow-studio.html

# Find a CSS variable
grep -n -- "--blush-500" *.html

# All CSS variable definitions
grep -n -- "--[a-z]" glow-studio.html | head -40
```
