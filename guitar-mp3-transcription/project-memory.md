# Guitar MP3/WAV Transcription Project Memory

## Purpose
This document captures the work completed so far on the local web app in `/home/navi/ai-agent-workspace/webapps/guitar-mp3-transcription` so future work can continue efficiently without repeating prior effort.

## Product goal
Build a local website where an end user can:
1. open the site,
2. upload a guitar audio file,
3. wait for transcription,
4. download both a `PDF` and `MusicXML` output.

The input is intended to be guitar-focused audio, with chord-aware handling so the output is closer to a guitar score/tab than a melody-only transcription.

## Current architecture
### Frontend
- `frontend/index.html`
- Plain HTML/CSS/JS
- Served directly by the FastAPI backend
- Accepts `.mp3` and `.wav`
- Sends a `POST` request to `/api/transcribe`
- Shows download links for:
  - PDF
  - MusicXML
  - JSON (technical output)
- Includes a small on-page debug box for diagnosing request/response issues

### Backend
- `backend/app/main.py`
- FastAPI app
- `/api/health`
- `/api/transcribe`
- Serves the frontend using `StaticFiles(..., html=True)`
- Serves generated files from `/outputs`

### Transcription pipeline
- `backend/app/transcription.py`
- Uses `basic_pitch.inference.predict`
- Normalizes note-event formats so it can handle:
  - objects with `.start_time/.end_time/.pitch`
  - dict-like note events
  - tuple/list note events
- Quantizes note starts
- Groups near-simultaneous notes into chord-like events
- Maps notes to guitar fretboard positions
- Generates:
  - PDF
  - MusicXML
  - JSON

### Music rendering/output
- `backend/app/musicxml_export.py`
  - builds a simple `music21` score
  - exports MusicXML
- `backend/app/pdf_render.py`
  - generates a simple PDF summary score/tab using `reportlab`
- `backend/app/guitar.py`
  - tuning support
  - note naming
  - basic chord naming
  - fretboard mapping heuristics

## Packaging and tester experience work completed
We improved tester friendliness significantly:
- Added `start.py`
  - creates virtual environment
  - installs dependencies
  - starts the app
- Added launcher files:
  - `start.command` for macOS
  - `start.bat` for Windows
- Added tester docs:
  - `README.md`
  - `tester_quickstart.md`
  - `START_HERE.txt`
- Added packaging helper:
  - `package_for_friend.sh`

## Important troubleshooting history
### 1) Frontend displayed literal `\n`
Cause:
- HTML file had been written at one point with escaped newlines instead of real newlines.
Fix:
- Rewrote `frontend/index.html` as proper HTML.
- Also changed backend serving to use static frontend hosting rather than returning raw text content.

### 2) Upload control looked like a text box instead of a normal file picker
Cause:
- Broken frontend HTML / escaped content rendering.
Fix:
- Rewrote `frontend/index.html` correctly.

### 3) Windows virtualenv path issue
Error seen:
- `Virtual environment Python/pip not found after setup.`
Cause:
- `start.py` initially assumed Unix-style venv paths (`bin/python`) even on Windows.
Fix:
- Updated `start.py` to detect Windows and use `Scripts/python.exe` and `Scripts/pip.exe`.

### 4) `Method not allowed` on `POST /api/transcribe`
Cause:
- Static frontend mount ordering in FastAPI could interfere with API routes.
Fix:
- Updated `backend/app/main.py` so API routes are defined before mounting `/` as static HTML.

### 5) Transcription crash: `'tuple' object has no attribute 'start_time'`
Cause:
- The code assumed Basic Pitch note events were always objects with attributes.
- Actual runtime returned tuples.
Fix:
- Added note-event normalization in `backend/app/transcription.py`.

### 6) WAV support request
Original app only accepted MP3.
Fix:
- Frontend updated to accept `.mp3` and `.wav`
- Backend updated to validate both extensions
- Docs updated accordingly

### 7) Output looked nothing like a guitar tab + chords mislabeled
Symptoms:
- Generated PDF didn't resemble tab; even simple chord MP3s came out wrong.
Root causes found and fixed:
- `guitar.py` fretboard mapping scored candidates by `abs(fret - 5)`, biasing
  every note toward the 5th fret and sometimes dropping notes. Replaced with a
  low-to-high assignment that prefers the lowest playable fret, so open chords
  now come out as their textbook shapes (e.g. open E = `0 2 2 1 0 0`).
- `guitar.py` chord naming used `pcs[0]` (numerically-lowest pitch class) as the
  root, so G-B-D was labeled "Dadd11". Rewrote to try each pitch class as root
  and pick the best triad match; bass note breaks ties. Now names G, Am, G7 etc.
- `transcription.py` truncated the whole song to `events[:16]`/`[:32]` based on
  the "accuracy mode". Removed the clipping; detail mode now maps to Basic Pitch
  detection thresholds (`onset_threshold`/`frame_threshold`/`minimum_note_length`)
  with a `TypeError` fallback for versions that don't accept those kwargs.
- `pdf_render.py` drew the low E string on the TOP line (upside-down tab) and
  rendered only `events[:12]` on a single non-wrapping row with fake floating
  note stems. Rewrote as a proper 6-line tab with low E on the bottom, string
  labels, chord names above, and multi-system/multi-page wrapping for full songs.
- `musicxml_export.py` used a plain treble clef; switched to `Treble8vbClef`
  (guitar sounds an octave below written pitch) so the engraved score isn't an
  octave high.
Note: `basic_pitch`/`reportlab`/`music21` weren't installable in the fix
environment (no PyPI access), so the deterministic logic was verified with stub
canvases and unit checks; re-run a real MP3 locally to confirm end to end.

## Dependency trimming work completed
A leaner dependency set was created in `backend/requirements.txt`.
Removed as unused from top-level requirements:
- `jinja2`
- `pretty_midi`
- `numpy`
- `mido`
Also changed:
- `uvicorn[standard]` → `uvicorn`

Current top-level requirements are intentionally leaner:
- `fastapi`
- `uvicorn`
- `python-multipart`
- `basic-pitch`
- `music21`
- `reportlab`

Note:
- Heavy runtime cost still mainly comes from `basic-pitch`, which is essential for current transcription behavior.

## Current known limitations
1. This is still a prototype-quality guitar transcription pipeline.
2. PDF is a simplified generated summary, not fully engraved professional notation.
3. MusicXML output exists, but professional engraving via MuseScore/LilyPond is not yet integrated.
4. Chord naming and guitar fingering are heuristic.
5. Full-band mixes and noisy recordings will reduce quality.
6. WAV support is extension-level and common PCM WAV should work best; unusual WAV encodings may still fail depending on decoder support in the environment.

## Recommended future work
1. Improve note quantization and rhythmic reconstruction.
2. Add better guitar voicing/fingering heuristics.
3. Convert MusicXML to higher-quality engraved PDF automatically.
4. Add source separation for mixed audio.
5. Improve startup diagnostics and dependency failure reporting.
6. Potentially add more explicit handling for audio decoding failures.

## Key operational reminder
When testing changes:
1. restart the app fully,
2. hard refresh the browser,
3. verify frontend and backend are both the updated versions.

This has mattered repeatedly during troubleshooting because stale browser cache and older server processes can make it look like fixes did not apply.
