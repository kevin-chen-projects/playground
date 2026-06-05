# Violin Sheet Helper

A FastAPI webapp that accepts an image or PDF upload of violin sheet music and returns beginner-friendly fingering guidance.

## Overview
The app is meant to reduce the difficulty of early violin practice by translating written notes into concrete beginner instructions, especially which string and which finger to use.

## Current status
- FastAPI backend and simple HTML frontend are wired end-to-end
- File uploads work
- `/analyze` returns deterministic sample notes through a mock analysis pipeline
- Beginner fingering guidance is generated from a simple first-position mapping
- Windows and Linux/macOS startup scripts are included

## How it works now
1. The user opens the webpage served by FastAPI
2. They upload an image or PDF
3. The server saves the file into `artifacts/uploads/`
4. The current OCR/OMR stage is mocked
5. Parsed notes are passed through beginner fingering rules
6. The browser shows a summary table and raw JSON

## Core project layout
- `src/api/main.py` — FastAPI app and routes
- `src/services/ocr_service.py` — placeholder OCR stage
- `src/services/music_parser_service.py` — placeholder note parsing
- `src/services/fingering_engine.py` — beginner fingering rules
- `src/web/index.html` — upload UI
- `tests/test_app.py` — app tests
- `docs/PROJECT_DESIGN.md` — older design notes, now mostly reflected in `STATE.md`
- `docs/PROJECT_MEMORY.md` — older resumption notes, now mostly reflected in `STATE.md`

## Design priorities
- Keep a working vertical slice at all times
- Separate OCR, parsing, fingering, and rendering concerns
- Prefer beginner-friendly first-position output
- Make the pipeline easy to swap from mock OCR to a real engine later

## Next steps
- Evaluate a real OMR/OCR engine
- Expand fingering logic for more realistic beginner pedagogy
- Add direct sheet annotation output
- Add better validation and sample fixtures

## Legacy docs
Older planning docs remain in `docs/` for reference, but the canonical continuation context is now `STATE.md` and `NOTES.md`.
