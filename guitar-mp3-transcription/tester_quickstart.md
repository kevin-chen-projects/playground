# Tester Quickstart (MP3/WAV → PDF + MusicXML)

## Start the app

In the project folder, run:

```bash
python3 start.py
```

If you prefer:
- macOS: double-click `start.command`
- Windows: double-click `start.bat`

Then open:
- http://127.0.0.1:8000/

## Test flow

1. Upload an audio file:
   - **MP3** (`.mp3`) or
   - **WAV** (`.wav`)
2. (Optional) Choose tuning and accuracy mode.
3. Click **Generate Outputs**.
4. Download:
   - **PDF**
   - **MusicXML**

## What to report back

Please report:
- whether startup worked and dependencies installed
- whether the website opened correctly
- whether MP3 upload worked
- whether WAV upload worked
- whether PDF download worked
- whether MusicXML download worked
- any errors shown in the terminal
- whether the transcription seems musically reasonable (especially chord passages)

## Known limitations

- Works best on relatively isolated guitar recordings.
- Full-band mixes may reduce transcription accuracy.
- Generated tab/chord labels are inferred heuristically; they may not match the original fingering.
