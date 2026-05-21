# Project Design: Violin Sheet Helper

## Purpose
Build a webapp that accepts an uploaded image or PDF of violin sheet music and returns beginner-friendly playing guidance, especially:
- which violin string to use
- which finger to use

## Product goal
Reduce the difficulty of early violin practice by translating written notes into concrete, playable beginner instructions.

## Current architecture
### Frontend
- Simple HTML page served directly by FastAPI
- File picker + Analyze button
- Displays summary, beginner guidance table, and raw JSON

### Backend
- FastAPI app with routes:
  - `GET /` for the webpage
  - `GET /health`
  - `POST /upload`
  - `POST /analyze`

### Service pipeline
1. Save uploaded file to `artifacts/uploads/`
2. Run OCR/OMR stage
3. Parse extracted notation into structured notes
4. Apply beginner fingering rules
5. Return structured response for UI rendering

## Current implementation status
This is a vertical-slice prototype.
- Upload works
- UI works
- API works
- Analysis uses a mock OCR + parser pipeline
- Fingering logic is a simple first-position beginner map

## High-level principles
1. **Working vertical slice first**
   - The app should always remain runnable end-to-end.
   - Replace mock parts incrementally instead of waiting for a perfect pipeline.

2. **Stable contracts between stages**
   - OCR/OMR output, parsed notes, and final guidance should each use clear structured formats.
   - This makes future model swaps safer.

3. **Beginner-first decision making**
   - When multiple valid fingerings exist, prefer the easiest one for early learners unless a mode/config says otherwise.

4. **Explainability matters**
   - Guidance should include short reasoning, not just string/finger output.
   - This helps learners form better mental models.

5. **Future-friendly architecture**
   - Keep OCR, parsing, fingering, and rendering separate so the system can evolve without rewrites.

## Recommended roadmap
### Phase 1: Reliable prototype
- Keep current UI simple
- Add fixture files for manual testing
- Improve validation and error handling

### Phase 2: Real music extraction
- Evaluate OMR/music OCR libraries or services
- Convert sheet image/PDF into note events with pitch + duration + measure position

### Phase 3: Better violin pedagogy logic
- Handle low/high second finger patterns
- Support alternate string choices
- Add position-awareness if needed later

### Phase 4: Visual annotation
- Overlay string/finger hints directly on uploaded sheet pages
- Add confidence markers or uncertain-note highlighting

## Open questions to revisit
- Which OMR engine should be used first?
- Should the app optimize for strict beginner first position only, or allow alternate fingerings?
- Should output focus on direct annotation, a practice chart, or both?
- Should PDFs be converted page-by-page and annotated visually?
