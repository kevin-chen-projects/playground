# Guitar Audio Transcription App - Design Principles and Build Guidance

## Core product intent
The app should provide a simple end-user experience for converting guitar audio into downloadable notation artifacts.

### Desired user flow
The user should only need to:
1. open the website,
2. upload a guitar audio file,
3. click the main action button,
4. wait for processing,
5. download the resulting files.

The website should hide as much implementation complexity as possible.

## Input/output specification
### Supported inputs
- `.mp3`
- `.wav`

### Required outputs
For each uploaded audio file, the app should generate at minimum:
- `PDF`
- `MusicXML`

Optional technical artifact:
- `JSON`

## Product principles
### 1) User experience first
The app should feel simple even if the backend is complex.
- No API knowledge required
- No manual file path entry
- One clear upload flow
- One clear set of download buttons

### 2) Guitar-oriented output
The system should be optimized for guitar recordings.
This means future improvements should prioritize:
- chord-aware transcription
- simultaneous note grouping
- fretboard plausibility
- guitar tab usefulness
- musically sensible voicing inference

### 3) Preserve a path to higher-quality notation
Even if the immediate PDF is simplified, the system should always preserve a notation-grade intermediate representation.
That is why `MusicXML` is important.

Future work should continue to treat `MusicXML` as a central artifact, because it allows:
- better engraving later
- external editing in notation software
- interoperability with tools like MuseScore and LilyPond workflows

### 4) Robustness over fragile assumptions
The code should not assume one exact upstream note-event format or one narrow runtime behavior if a dependency can vary.
Normalize external inputs early.
This principle already proved important with Basic Pitch note-event handling.

### 5) Lean dependencies where possible
Keep top-level dependencies minimal.
Only install packages that are genuinely needed for:
- web serving
- upload handling
- transcription
- MusicXML generation
- PDF generation

If a package is not directly contributing to the current feature set, prefer removing it.

### 6) Local-first practicality
The current app is meant to be easy to share and test locally.
Design choices should continue to support:
- simple startup
- understandable packaging
- lightweight tester instructions
- minimal setup burden

## Technical guidance for future work
### Frontend guidance
- Keep frontend static and lightweight unless a richer editing UI becomes necessary.
- Prefer clarity over visual complexity.
- Keep a small built-in debug surface for testers when useful.

### Backend guidance
- Keep API routes explicit and stable.
- Avoid routing ambiguities with static mounting.
- Validate upload types clearly.
- Return actionable error messages.

### Transcription guidance
- Treat transcription as heuristic and probabilistic.
- Normalize model outputs before downstream processing.
- Keep timing quantization and event grouping modular so they can be improved independently.
- Favor guitar-playable outputs over raw pitch dumps.

### Output guidance
- `MusicXML` should remain a first-class output.
- `PDF` should remain easy to download.
- If future engraving is improved, keep the user-facing download flow unchanged.

## Quality bar for future work
A future change is good if it improves one or more of these without hurting the others too much:
1. user simplicity
2. transcription usefulness for guitar
3. output quality
4. reliability
5. tester friendliness
6. install/runtime footprint

## What to avoid
- unnecessary dependencies
- requiring users to manually configure the backend
- brittle assumptions about dependency return types
- UI complexity that gets in the way of upload/download flow
- sacrificing MusicXML output in favor of a PDF-only pipeline

## Ideal future direction
The likely best future architecture is:
1. upload audio,
2. isolate or clean guitar signal if possible,
3. run polyphonic transcription,
4. group notes into musically meaningful events,
5. infer guitar-friendly voicings/tab,
6. build MusicXML,
7. render higher-quality engraved PDF automatically,
8. present both downloads in the same simple website flow.

That should remain the guiding direction for the project.
