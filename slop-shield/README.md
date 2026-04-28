# Slop Shield

A Chrome extension that flags AI-generated YouTube videos using layered open-source detectors. Shows a per-signal breakdown rather than a binary verdict so you can judge for yourself.

**v0.1.0 scope:** Layer 1 (channel heuristics) only. Voice, transcript, and face layers are scaffolded for future versions. See [`research.md`](research.md) for the full landscape survey.

## Install (development)

1. Get a YouTube Data API v3 key:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a project (or use an existing one)
   - Enable the **YouTube Data API v3**
   - Create credentials → API key
   - Recommended: restrict the key to `*.youtube.com/*` referrers
2. Load the extension:
   - Open `chrome://extensions`
   - Toggle **Developer mode** on
   - Click **Load unpacked** → select this folder
3. Click the Slop Shield icon in the toolbar → **Options & API key** → paste your key → **Save**
4. Visit any YouTube watch page — a pill appears bottom-right with the analysis

## What it checks (Layer 1)

| Signal | What it measures | Weight |
|---|---|---|
| `channel_age` | Days since channel creation | 0.5 |
| `upload_cadence` | Videos per day (lifetime average) | 2.0 |
| `view_sub_ratio` | View count ÷ subscriber count | 1.0 |
| `duration_consistency` | Coefficient of variation across last 20 video lengths | 1.0 |
| `title_entropy` | Shannon entropy of title vocabulary | 1.0 |
| `description_boilerplate` | Matches against known AI-channel template patterns | 0.7 |

Composite score is a weighted average. Tier thresholds: `>= 0.65` high, `>= 0.35` medium, else low.

## File layout

```
manifest.json          Manifest V3 config
background.js          Service worker, handles Data API calls + caching
youtube-api.js         Thin wrapper around YouTube Data API v3
heuristics.js          Channel-level scoring signals (Layer 1)
content.js             Injected into YouTube, extracts channel + renders badge
content.css            Badge overlay styles
popup.html/js/css      Toolbar popup showing current video's analysis
options.html/js/css    API key + cache management page
research.md            Detection landscape research (open-source detectors, 2026)
```

## Roadmap

- [ ] Layer 2: MediaPipe face heuristics (blink rate, head-pose entropy, lip-sync drift)
- [ ] Layer 2: AASIST-L voice detector in-browser via onnxruntime-web
- [ ] Layer 3: Fast-DetectGPT on auto-captions
- [ ] Layer 4: Thumbnail similarity via CLIP-ViT-B/32 (completes Layer 1)
- [ ] Optional cloud escalation (Cloudflare Workers AI free tier with Llama-3.2-1B judge)
- [ ] User-adjustable tier thresholds
- [ ] Non-English content support (detectors currently degrade on Spanish/Mandarin/Hindi)

## Known limitations

- **No face/avatar detection in v1.** Current open-source deepfake detectors don't generalize to 2025-era Synthesia/HeyGen avatars and the strongest (SBI) is research-licensed.
- **Voice/transcript detection stale.** Even once implemented, expect 20–40% false negatives on current-gen ElevenLabs v3 / OpenAI TTS until better training data arrives.
- **Channel heuristics can misfire** on high-output human creators (news, gaming). Thresholds are tuned for the "AI slop factory" pattern specifically, but edge cases exist.

## License

TBD.
