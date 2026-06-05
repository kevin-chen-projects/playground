# State

## Current implementation decisions
- The app is a **FastAPI-served vertical slice**: upload UI, API routes, mock OCR/parser pipeline, and fingering output all work end-to-end.
- The analysis pipeline is deliberately mocked so the product contract can be exercised before committing to a real OMR engine.
- Beginner guidance currently targets **first-position violin fingering** with a simple pitch-to-string/finger map.
- Uploaded files are written into `artifacts/uploads/` for traceability during local testing.
- The frontend remains intentionally simple and is served directly from `src/web/` rather than a separate SPA stack.

## Important technical notes
- Main API entrypoint: `src/api/main.py`
- Current routes: `GET /`, `GET /health`, `POST /upload`, `POST /analyze`
- Fingering logic is centralized in `src/services/fingering_engine.py`
- Tests currently validate health, HTML serving, upload behavior, and deterministic mock guidance
- Legacy docs exist in `docs/PROJECT_DESIGN.md` and `docs/PROJECT_MEMORY.md`, but they now mostly overlap with this file

## Open product questions
- Which real OCR/OMR approach to test first
- Whether output should remain table-first or move toward direct sheet annotation overlays
- How far to go beyond beginner first-position rules before the recognition layer is reliable
