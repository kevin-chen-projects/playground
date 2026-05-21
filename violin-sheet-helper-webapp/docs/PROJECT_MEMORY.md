# Project Memory: Violin Sheet Helper

## What this project is
A webapp for beginner violinists that takes uploaded violin sheet music and returns guidance about which string and which finger to use for each note.

## Chosen stack
- Backend: FastAPI (Python)
- Frontend: simple HTML/JS served by FastAPI

## Why this stack was chosen
The project is likely to need Python-friendly OCR/OMR and rule-based music processing, so FastAPI allows fast prototyping and easier integration with Python tooling.

## Current status
- Project folder created under `/home/navi/ai-agent-workspace/webapps/violin-sheet-helper-webapp`
- FastAPI app scaffolded
- Basic upload webpage scaffolded
- Mock end-to-end analysis pipeline implemented
- Beginner fingering mapping stub implemented for common first-position notes
- Startup scripts added for Linux/macOS and Windows

## Important implementation details
- Root page is served from `GET /`
- Static UI file is `src/web/index.html`
- Backend entrypoint is `src/api/main.py`
- Uploaded files are saved to `artifacts/uploads/`
- Current OCR/parser behavior is mocked, not real music recognition yet

## Working assumptions
- Standard violin tuning: G, D, A, E
- Beginner-first output should prioritize simple first-position fingerings
- The app should always remain runnable even while deeper OCR features are incomplete

## Suggested next steps when resuming
1. Add real OMR/OCR evaluation and choose an engine
2. Add sample fixture files into the project for manual validation
3. Improve fingering logic for more realistic beginner pedagogy
4. Add direct sheet annotation capability
5. Add better setup/run instructions if deployment expands beyond local use
