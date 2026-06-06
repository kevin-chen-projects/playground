# Playground — Live Links

Click any link below to open the site **hosted live on GitHub Pages** — no download or
build needed. For a description of each site see [SITES.md](SITES.md); for an
engineering map see [PLAYGROUND_NOTES.md](PLAYGROUND_NOTES.md).

**Base URL:** `https://kevin-chen-projects.github.io/playground/`

> **Note:** GitHub Pages must be enabled for this repo (Settings → Pages → deploy from
> `main`, root folder) for these links to resolve. Single-file `.html` sites work as-is;
> folder projects that need a server or build step are listed separately at the bottom.

_Last updated: 2026-06-06_

---

## Learning & education

- [Bio Basics](https://kevin-chen-projects.github.io/playground/bio-basics.html) — molecular biology, museum-friendly
- [NiHao 你好](https://kevin-chen-projects.github.io/playground/nihao.html) — Mandarin tone trainer
- [Math Ace](https://kevin-chen-projects.github.io/playground/math-ace.html) — Kumon-style K–5 math tutor
- [SAT Reading Sprints](https://kevin-chen-projects.github.io/playground/sat-reading.html) — timed SAT reading practice
- [Money Smarts](https://kevin-chen-projects.github.io/playground/money-smarts.html) — personal-finance literacy
- [Violin Voyage](https://kevin-chen-projects.github.io/playground/violin-voyage.html) — beginner violin + sheet music
- [Scam Shield](https://kevin-chen-projects.github.io/playground/scam-shield.html) — online-safety for older adults

## Language & speech

- [Habla Clara](https://kevin-chen-projects.github.io/playground/habla-clara.html) — English pronunciation for Spanish speakers
- [Hello!](https://kevin-chen-projects.github.io/playground/hello.html) — American English pronunciation
- [Speak Sharp](https://kevin-chen-projects.github.io/playground/speak-sharp.html) — public-speaking coach
- [Interview Drill](https://kevin-chen-projects.github.io/playground/interview-drill.html) — STAR-method interview practice

## Games & trainers

- [Count Champ](https://kevin-chen-projects.github.io/playground/count-champ.html) — blackjack card-counting trainer
- [Holdem Coach](https://kevin-chen-projects.github.io/playground/holdem-coach.html) — Texas Hold'em trainer
- [Pawn Path](https://kevin-chen-projects.github.io/playground/pawn-path.html) — chess tactics trainer
- [Spades](https://kevin-chen-projects.github.io/playground/spades.html) — 4-player Spades vs. AI
- [Birthday Slots](https://kevin-chen-projects.github.io/playground/slot-machine.html) — 3-reel slot machine
- [Birthday Slots (Memes)](https://kevin-chen-projects.github.io/playground/slot-machine-memes.html) — slots with meme SFX

## Fun & curiosities

- [Mind Benders](https://kevin-chen-projects.github.io/playground/illusions.html) — playground of viral illusions

## Tools & utilities

- [FluoroMatch](https://kevin-chen-projects.github.io/playground/fluoro-match.html) — IF fluorophore panel designer
- [Mortgage Lab](https://kevin-chen-projects.github.io/playground/mortgage-lab.html) — mortgage affordability suite
- [Fridge Feast](https://kevin-chen-projects.github.io/playground/fridge-feast.html) — cook-from-what-you-have recipes

## Photo & media

- [Glow Studio](https://kevin-chen-projects.github.io/playground/glow-studio.html) — desktop portrait retouching
- [Glow Studio Mobile](https://kevin-chen-projects.github.io/playground/glow-studio-mobile.html) — mobile batch editor
- [Glow Studio Easy](https://kevin-chen-projects.github.io/playground/glow-studio-easy.html) — one-tap mobile variant
- [Glow Studio Video](https://kevin-chen-projects.github.io/playground/glow-studio-video.html) — video face smoothing
- [Bare DAW](https://kevin-chen-projects.github.io/playground/daw/) — browser music workstation

## Folder projects (static — work on Pages)

- [Suntastic](https://kevin-chen-projects.github.io/playground/suntastic/) — wedding photography studio site
- [CodeSignal Prep — Flashcards](https://kevin-chen-projects.github.io/playground/codesignal-prep/drill.html) — Python interview drill site

---

## Not hosted on GitHub Pages

These can't run as static GitHub Pages links and are intentionally left off the list above:

| Project | Why not | How to run |
|---------|---------|------------|
| **Stock Screener** | Needs a data-fetch step + local server | `python fetch_data.py` then serve `stock-screener/` |
| **Escape Room Simulator** | React + Vite — needs a build; raw source won't run | `npm install && npm run build` in `escape-room-simulator/` |
| **Guitar MP3 Transcription** | FastAPI backend | run the FastAPI app per its README |
| **Violin Sheet Helper** | FastAPI backend | run the FastAPI app per its README |
| **Slop Shield** | Chrome extension, not a website | load unpacked in `chrome://extensions` |
| **YouTube Smart Skip** | Chrome extension, not a website | load unpacked in `chrome://extensions` |
