# Notes

## 2026-05-21
Normalized the project docs so the main continuation context now lives in `README.md`, `STATE.md`, and this log. I consolidated the useful material from the older `docs/PROJECT_DESIGN.md` and `docs/PROJECT_MEMORY.md` into the root-level files, while keeping the legacy docs around for reference. The project remains a working FastAPI vertical slice with a mocked analysis pipeline and a simple beginner-first fingering engine.

Open questions:
- Which real OMR/OCR candidate should be tested first?
- Should the next milestone prioritize recognition accuracy, richer pedagogy, or visual annotation?
- Is there any unique detail in the legacy `docs/` files that should be retained separately after the consolidation?

Next step:
- Pick one real OCR/OMR option to evaluate and document so the mock pipeline can be replaced without breaking the current API shape.
