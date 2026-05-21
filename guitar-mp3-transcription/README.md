# Guitar MP3/WAV → PDF + MusicXML

A local tester-friendly web app where the end-user can:

1. open the website
2. upload an MP3 **or** WAV
3. wait for processing
4. download a **PDF** guitar score/tab and a **MusicXML** file

## End-user (tester) experience

The user should only interact with the website.

### Best way to start (tester-friendly)
From this folder:

```bash
python3 start.py
```

Then open in a browser:
- http://127.0.0.1:8000/

### What the user does
1. Upload an MP3 or WAV
2. Click **Generate Outputs**
3. Download:
   - **PDF**
   - **MusicXML**

## Supported input formats
- `.mp3`
- `.wav`

WAV note: best results with common PCM WAV files.

## Output formats (per upload)
- `PDF` (generated tab/score summary)
- `MusicXML` (intermediate notation format)
- `JSON` (technical artifact)

## Platform-specific launchers
- macOS: `start.command`
- Windows: `start.bat`

## Project structure
- `start.py` — easiest startup path for testers (creates venv, installs deps, runs server)
- `start.command` — macOS launcher
- `start.bat` — Windows launcher
- `START_HERE.txt` — plain-text quickstart for non-technical testers
- `tester_quickstart.md` — markdown quickstart
- `frontend/index.html` — website UI served by backend
- `backend/app/main.py` — FastAPI server + transcription API
- `backend/app/transcription.py` — transcription + chord/event grouping
- `backend/app/guitar.py` — tuning and fretboard mapping helpers
- `backend/app/musicxml_export.py` — MusicXML generation
- `backend/app/pdf_render.py` — PDF output generation

## Likely issues

### 1) Python dependency installation
On first run, the app installs dependencies automatically. If it fails, send the terminal output back to you.

### 2) Audio decoding/transcription accuracy
- Works best on relatively isolated guitar recordings.
- Dense mixes and strong percussion can reduce accuracy.
- The inferred tab is heuristic and may not match original fingering perfectly.

## Packaging for friends
If you want to send the project as a zip (so others can test):

1) Zip the project folder while excluding local caches.

Example (run on your machine):
```bash
zip -r guitar-mp3-transcription-test-package.zip . \
  -x "*/.venv/*" "*/__pycache__/*" "*/outputs/*" "*/uploads/*" "*/.git/*"
```

2) The tester then unzips and runs:
```bash
python3 start.py
```

(or uses `start.command` / `start.bat`).
