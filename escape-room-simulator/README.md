# Escape Room Simulator

A lightweight web-based escape-room game prototype built with Vite + React + TypeScript.

## Overview
The goal is to create a small, puzzle-based experience with simple navigation, item interaction, and room progression. The project is intentionally kept static-host friendly and easy to expand.

## Current status
- Vite + React + TypeScript scaffold is in place
- A minimal playable loop exists with:
  - room descriptions
  - clickable room objects
  - inspect/take actions
  - a puzzle attempt flow
  - inventory tracking
  - navigation between rooms
- The game is still a prototype and needs more polished content and stronger unlock logic

## Core structure
- `src/lib/types.ts` — room, item, puzzle, and game-state shapes
- `src/lib/gameEngine.ts` — interaction/state transition helpers
- `src/data/sampleContent.ts` — demo rooms, items, and puzzles
- `src/components/AppShell.tsx` — main UI shell

## Design priorities
- Keep the first version lightweight
- Prefer data-driven content over hardcoded UI logic
- Make the system easy to extend with more rooms, hints, and save/load later
- Keep deployment simple and static-host friendly

## Next steps
- Improve the first room into a more polished demo
- Add locked exits and unlock logic
- Add better inspect/use interaction patterns
- Add local save/load support

## Legacy docs
Older planning docs are still present in the project root:
- `DESIGN_GUIDE.md`
- `PROJECT_RESUME.md`

These are now supplemental; see `STATE.md` and `NOTES.md` first for the current continuation context.
