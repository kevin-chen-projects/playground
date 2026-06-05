# Violin Sheet Helper

A FastAPI webapp that accepts an image or PDF upload of violin sheet music and returns beginner-friendly fingering guidance (string + finger).

## Current status
This starter version is fully wired end-to-end so you can open the webpage, upload a file, and see a working response immediately.

Right now the analysis pipeline is a **mock implementation**:
- file upload works
- the webpage is served by FastAPI
- `/analyze` returns deterministic sample notes
- beginner fingering guidance is generated from a simple first-position mapping

This means the app works now as a product skeleton, even before real OCR / OMR is added.

## Startup
### Windows (recommended for your default use case)
Double-click:
- `start.bat`

Or run in Command Prompt:
```bat
start.bat
```

### Linux/macOS
```bash
bash start.sh
```

Then open:
```text
http://127.0.0.1:8000/
```

## Project layout
- `src/api/main.py` — FastAPI app and routes
- `src/services/ocr_service.py` — placeholder OCR stage
- `src/services/music_parser_service.py` — placeholder note parsing
- `src/services/fingering_engine.py` — beginner fingering rules
- `src/web/index.html` — simple upload UI
- `tests/test_app.py` — app tests
- `docs/PROJECT_DESIGN.md` — high-level design and principles
- `docs/PROJECT_MEMORY.md` — project context for easy resumption

## Run manually
From the project directory:

```bash
pip install -r requirements.txt
uvicorn src.api.main:app --reload
```

## Test
If `pytest` is installed locally:
```bash
pytest
```

## What happens when you open the webpage
1. The root route `/` serves `src/web/index.html`
2. You choose an image or PDF
3. The page sends the file to `POST /analyze`
4. The server saves the file into `artifacts/uploads/`
5. A mock OCR stage returns sample note tokens
6. The parser converts them into notes
7. The fingering engine maps those notes to beginner string/finger suggestions
8. The browser displays a summary table and raw JSON

## Why I set it up this way
This structure gives you a working vertical slice first. That is the safest way to build OCR-heavy apps because:
- the UI can be tested immediately
- the backend contract is already defined
- the mock pipeline can be replaced incrementally with real OCR/OMR later

## Next recommended build steps
1. Add real sheet-music OCR / OMR
2. Expand fingering logic to handle low/high finger patterns and alternate string choices
3. Add annotation overlays on the uploaded image/PDF
4. Add structured logging and sample fixture files for evaluation
