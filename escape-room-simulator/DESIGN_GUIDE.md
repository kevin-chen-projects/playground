# Design Guide

## Product goals
- Create a lightweight escape-room simulator focused on basic puzzle-solving, room navigation, and object interaction.
- Keep the experience simple, readable, and easy to expand.
- Optimize for early deployment and iteration rather than advanced backend features.

## Chosen implementation approach
- **Vite + React + TypeScript**

## Why this approach
- React components map naturally to the app’s UI pieces: room view, inventory, puzzle panel, hint panel, and modal dialogs.
- TypeScript keeps puzzle and room data consistent as the content grows.
- Vite keeps the dev/build loop fast and deployment simple.

## Core game model
- **Room**: title, description, items, puzzles, exits.
- **Item**: inspectable or collectible object.
- **Puzzle**: interaction that checks conditions and produces feedback or rewards.
- **GameState**: current room, inventory, solved puzzles, messages, and selected/inspected item.

## Interaction loop
1. Player enters a room.
2. Player clicks an object or puzzle.
3. Game checks the relevant state/conditions.
4. Game updates inventory, solved state, or room access.
5. UI displays feedback immediately.

## Design principles
- **Data-driven content**: keep room/puzzle definitions in content files rather than hardcoding logic into UI.
- **Separation of concerns**: keep game rules in a small engine layer and presentation in components.
- **Small initial scope**: one polished room is better than many unfinished systems.
- **Expandable structure**: the framework should support future hints, timers, save/load, and multi-room progression.

## Current architecture notes
- `src/lib/types.ts` defines the core content and state shapes.
- `src/lib/gameEngine.ts` contains the current interaction/state transitions.
- `src/data/sampleContent.ts` holds demo rooms, items, and puzzles.
- `src/components/AppShell.tsx` is the main UI shell for the current prototype.

## Future enhancements
- Locked doors and conditional exits.
- More expressive puzzle logic.
- Hint system.
- Save/load with localStorage.
- Better visual layout and game-like atmosphere.
