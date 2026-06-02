# Playground — Site Catalog

A running list of everything we're building in this repo, grouped so it's easy to skim, share, and collect feedback on.

**How to view:** Every single-file site is a self-contained `.html` — open it directly in a browser, no build step. Folder projects have their own setup notes (see each row's path). For an engineering-level map of any file (structure, functions, palettes), see [PLAYGROUND_NOTES.md](PLAYGROUND_NOTES.md).

_Last updated: 2026-06-01 (added Scam Shield online-safety site)_

---

## Learning & education

| Site | What it is | Open | Status |
|------|------------|------|--------|
| **Bio Basics** | Molecular biology, museum-friendly — 11-module curriculum (cell → DNA → CRISPR), interactive SVGs + quizzes | [bio-basics.html](bio-basics.html) | 6 of 11 modules built |
| **NiHao 你好** | Mandarin made easy — live mic pitch-detection tone trainer, pinyin chart, radical decomposition | [nihao.html](nihao.html) | 3 of 11 modules built |
| **Math Ace** | Kumon-style K–5 math tutor — 44 topics, sequential practice, stars + best times (CA Common Core aligned) | [math-ace.html](math-ace.html) | Complete |
| **SAT Reading Sprints** | Timed SAT reading practice — 5 passages, 22 questions, per-answer explanations | [sat-reading.html](sat-reading.html) | Complete |
| **Money Smarts** | Friendly personal-finance literacy site | [money-smarts.html](money-smarts.html) | Complete |
| **Violin Voyage** | Beginner violin + sheet-music reading tutor | [violin-voyage.html](violin-voyage.html) | Complete |
| **Scam Shield** | Online-safety lessons for older adults — phishing/text/call scams, "Spot the Scam" practice, quizzes, big-text a11y controls, "I was scammed" help checklist | [scam-shield.html](scam-shield.html) | Complete |

## Language & speech

| Site | What it is | Open | Status |
|------|------------|------|--------|
| **Habla Clara** | English pronunciation for Spanish speakers — tricky words in real conversations, TTS + mic feedback | [habla-clara.html](habla-clara.html) | Complete |
| **Hello!** | American English pronunciation, tailored per native language | [hello.html](hello.html) | Complete |
| **Speak Sharp** | Public-speaking coach — 60s prompts, live WPM/filler/pitch HUD, coach-style report | [speak-sharp.html](speak-sharp.html) | Complete |
| **Interview Drill** | STAR-method behavioral interview practice | [interview-drill.html](interview-drill.html) | Complete |

## Games & trainers

| Site | What it is | Open | Status |
|------|------------|------|--------|
| **Count Champ** | Blackjack card-counting trainer + Monte Carlo simulator | [count-champ.html](count-champ.html) | Complete |
| **Holdem Coach** | Texas Hold'em trainer (NLHE + LHE) | [holdem-coach.html](holdem-coach.html) | Complete |
| **Pawn Path** | Chess tactics trainer — forks, pins, skewers, mate-in-N | [pawn-path.html](pawn-path.html) | Complete |
| **Spades** | 4-player Spades vs. AI bots with tunable difficulty | [spades.html](spades.html) | Complete |
| **Birthday Slots** | 3-reel slot machine, procedurally-synthesized audio | [slot-machine.html](slot-machine.html) | Complete |
| **Birthday Slots (Memes)** | Slots variant with meme sound effects | [slot-machine-memes.html](slot-machine-memes.html) | Complete |

## Fun & curiosities

| Site | What it is | Open | Status |
|------|------------|------|--------|
| **Mind Benders** | Playground of viral illusions — spinning dancer, the dress, Yanny/Laurel, Shepard tone, café wall, afterimages — all generated in-browser, with "prove it" reveals | [illusions.html](illusions.html) | Complete |

## Tools & utilities

| Site | What it is | Open | Status |
|------|------------|------|--------|
| **FluoroMatch** | IF fluorophore panel designer — assigns dyes + detection channels to antibody targets, balancing estimated signal by abundance (bright dyes→rare targets) with spillover + autofluorescence warnings and a spectral plot | [fluoro-match.html](fluoro-match.html) | Complete |
| **Mortgage Lab** | Affordability suite — payment, affordability, rent-vs-buy, refinance, with charts | [mortgage-lab.html](mortgage-lab.html) | Complete |
| **Fridge Feast** | Cook-from-what-you-have recipe generator | [fridge-feast.html](fridge-feast.html) | Complete |
| **Stock Screener** | Momentum day-trading reference (RVOL, options flow) — run `python fetch_data.py` then serve | [stock-screener/](stock-screener/) | Complete |

## Photo & media

| Site | What it is | Open | Status |
|------|------------|------|--------|
| **Glow Studio** | Desktop portrait retouching — brush edits, presets, undo/redo | [glow-studio.html](glow-studio.html) | Complete |
| **Glow Studio Mobile** | Mobile batch editor — auto face/skin detection, no painting | [glow-studio-mobile.html](glow-studio-mobile.html) | Complete |
| **Glow Studio Easy** | One-tap simplified mobile variant | [glow-studio-easy.html](glow-studio-easy.html) | Complete |
| **Glow Studio Video** | Tone-safe video face smoothing — iOS Safari upload + MP4 export | [glow-studio-video.html](glow-studio-video.html) | Complete |
| **Bare DAW** | Browser music workstation — drum sequencer + piano roll, WAV/MIDI export | [daw/](daw/) | Functional |

## Folder projects (need setup)

| Project | What it is | Path | Stack | Status |
|---------|------------|------|-------|--------|
| **Suntastic** | Wedding photography studio site (multi-page) | [suntastic/](suntastic/) | Static HTML/CSS/JS | Design preview |
| **Escape Room Simulator** | Web-based puzzle escape room | [escape-room-simulator/](escape-room-simulator/) | React + TS + Vite | Early dev |
| **Guitar MP3 Transcription** | MP3/WAV → PDF tabs + MusicXML | [guitar-mp3-transcription/](guitar-mp3-transcription/) | FastAPI + HTML | Tester (mock pipeline) |
| **Violin Sheet Helper** | Sheet-music image → beginner fingering guidance | [violin-sheet-helper-webapp/](violin-sheet-helper-webapp/) | FastAPI + HTML | MVP (mock OCR) |
| **Slop Shield** | Chrome extension flagging AI-generated YouTube videos | [slop-shield/](slop-shield/) | Chrome MV3 | v0.1 (Layer 1) |
| **YouTube Smart Skip** | Chrome extension auto-skipping in-video sponsor segments | [youtube-smart-skip/](youtube-smart-skip/) | Chrome MV3 | v0.1 |

---

_To add a site: drop a new row in the right section and keep the status honest (Complete / MVP / Early dev / Preview). Engineering details belong in [PLAYGROUND_NOTES.md](PLAYGROUND_NOTES.md), not here — this file stays skim-friendly for sharing._
