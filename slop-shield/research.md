# Research: Detecting AI-Generated YouTube Content

> Snapshot of open-source detector landscape as of 2026-04-28. Verify repos/licenses/benchmarks before committing to a given library — the field moves fast and some of these numbers are from a training-data snapshot.

## TL;DR

- **Highest ROI layer is channel heuristics, not ML.** A small logistic regression over YouTube Data API features (upload cadence, view/sub ratio, thumbnail similarity, etc.) reportedly hits ~85–90% precision on "AI slop factory" detection. Ship this first.
- **Face/avatar deepfake classification is a dead end in v1.** No current open-licensed detector reliably catches Synthesia / HeyGen / D-ID avatars. Use MediaPipe-based heuristics (blink rate, head-pose entropy, lip-sync drift) and be honest in the UI that we don't have a classifier here.
- **Voice detection is mediocre** — AASIST-L gives a cheap in-browser first pass; expect 20–40% false negatives on current-gen ElevenLabs / OpenAI TTS. Corroborate with other signals.
- **Text detection is in decent shape.** Fast-DetectGPT with a 125M reference model runs in-browser; a small LLM (Llama-3.2-1B, Phi-3-mini) on Cloudflare Workers AI free tier can serve as a fallback judge and produces explainable output.
- **Show per-signal breakdown, not binary verdicts.** The tool should admit where it is uncertain.

---

## Layer 1 — Channel heuristics (pre-filter)

The cheapest, most deterministic, most explainable layer. Runs on every page load. Gates whether to invoke any expensive ML.

### Features to extract (YouTube Data API v3)

| Feature | Endpoint | Unit cost |
|---|---|---|
| Channel age | `channels.list?part=snippet` → `publishedAt` | 1 |
| Upload cadence | `channels.list?part=statistics` → `videoCount` / age | 1 |
| View:sub ratio | `channels.list?part=statistics` | 1 (shared) |
| Thumbnail uniformity | `search.list` or `playlistItems.list` + CLIP-ViT-B/32 similarity | 1–5 |
| Description boilerplate | `channels.list?part=snippet` + regex/embedding | 1 (shared) |
| Title token entropy | `playlistItems.list` over uploads playlist | 1–5 |
| Duration variance | `videos.list?part=contentDetails` (batch) | 1 per 50 vids |

**Avoid `search.list`** — costs 100 units and is easy to burn quotas on. Use `channels.list` + `playlistItems.list` on the "uploads" playlist instead.

### Quota

- Free tier: **10,000 units/day per Google Cloud project.**
- ~3–5 units per channel analysis is realistic with careful batching.
- Require user to bring their own API key (set in Options page) or OAuth with their own Google project — a single shared key will blow the quota instantly at scale.

### Composite scoring

A logistic regression or simple weighted sum over the seven features above. Targets the "AI slop factory" pattern:
- Channel age < 180 days
- Uploads per day ≥ 1 sustained
- View:sub ratio > 50:1
- Mean intra-channel thumbnail cosine similarity > 0.85 (real creators: 0.3–0.6)
- Description matches known AI-channel boilerplate templates
- Low title token entropy (templated titles)
- Low duration variance (template length)

---

## Layer 2 — Voice / TTS detection

### Top picks

| Model | Repo | License | Size | Browser? | Notes |
|---|---|---|---|---|---|
| **AASIST-L** | [clovaai/aasist](https://github.com/clovaai/aasist) | MIT | ~85K params, ~1MB ONNX | ✅ | First-pass detector. Trained on ASVspoof 2019/2021 — stale for 2025 TTS. |
| **Wav2Vec2 XLS-R spoof classifiers** | HF: various (e.g. `MelodyMachine/Deepfake-audio-detection-V2`) | Apache 2.0 (verify each) | ~95M params, ~95MB INT8 | ⚠️ heavy | Better generalization; backend-only path. Free tier on HF Inference API. |
| **AudioSeal** | [facebookresearch/audioseal](https://github.com/facebookresearch/audioseal) | MIT | ~1M params | ✅ | Watermark detector. Only useful if generator embeds AudioSeal — **not primary**. Most commercial TTS does not embed it. |

### Staleness

Expect **20–40% false-negative rate** on current ElevenLabs v3 / OpenAI TTS because training data lags the commercial frontier by ~12 months. Don't let voice alone trigger a "likely AI" flag.

### Recommendation

AASIST-L in-browser as always-on cheap pass → escalate low-confidence clips to a Wav2Vec2 XLS-R fine-tune on HF Inference API free tier. Budget: HF free tier throttles at ~1K req/month for models this size — plan for user-brings-own-token or a paid Cloudflare Workers AI tier.

---

## Layer 3 — Face / avatar detection

**The weakest area for shippable open-source detection.** Current detectors (SBI, DeepfakeBench zoo) are trained on FaceForensics++ / Celeb-DF / DFDC — all pre-2023 puppeteering datasets. They do not generalize to 2025-era Synthesia / HeyGen / D-ID avatars.

### Why we skip the classifier

- **SBI** (Self-Blended Images, the strongest 2023-era method) — [mapooon/SelfBlendedImages](https://github.com/mapooon/SelfBlendedImages) — **research-only license**, cannot ship commercially.
- **DeepfakeBench** — [SCLBD/DeepfakeBench](https://github.com/SCLBD/DeepfakeBench) — framework is Apache 2.0 but individual checkpoints inherit mixed/restrictive licenses.
- Both produce near-random accuracy on current avatar tooling per community testing.

### The heuristic stack we use instead

Run in-browser via [MediaPipe Tasks Web](https://developers.google.com/mediapipe/solutions/vision) (Apache 2.0), real-time:

| Signal | How | What it catches |
|---|---|---|
| **Blink rate** | MediaPipe Face Mesh, count eye-aspect-ratio drops over 60s sample | Avatars blink near-zero or suspiciously periodically |
| **Head-pose entropy** | MediaPipe Face Landmarker, entropy of yaw/pitch distribution | Avatars move within a tight envelope |
| **Lip-sync drift** | [SyncNet](https://github.com/joonson/syncnet_python) ONNX port (~30MB, MIT) on 5–10s clips | Avatar videos have suspiciously perfect sync or drift on non-English |
| **Compositing artifacts** | Small U-Net or gradient analysis around face bounding box | Avatar alpha-edge artifacts |

### Recommendation

**Score a "mechanical presenter" probability instead of claiming deepfake detection.** In the UI, surface the specific observations ("unusually regular blink pattern at 6.2s intervals") rather than a binary face verdict. This is honest and works within the licensing/accuracy reality.

---

## Layer 4 — Text / transcript detection

Matured area — 2024–2025 produced actually useful zero-shot methods. Caveat: YouTube auto-captions introduce ASR noise that degrades every detector by 5–15 percentage points vs. clean text.

### Top picks

| Model | Repo | License | Size | Browser? | Notes |
|---|---|---|---|---|---|
| **Fast-DetectGPT** | [baoguangsheng/fast-detect-gpt](https://github.com/baoguangsheng/fast-detect-gpt) | MIT | GPT-Neo-125M ref, ~130MB INT8 | ✅ | One forward pass through the ref model. Good accuracy, browser-feasible. |
| **Binoculars** | [ahans30/Binoculars](https://github.com/ahans30/Binoculars) | BSD-3 | Two 7B models (paper); can substitute smaller | ❌ default | Two forward passes through small LLMs. Cloud path only. |
| **Small LLM-as-judge** | Llama-3.2-1B-Instruct or Phi-3-mini | Llama/MIT | 1–3B params | Cloud only | Explainable output ("flagged: repetitive bigrams, low entity density"). Strong for UI transparency. |
| **RoBERTa GPT-2 detector** | [openai-community/roberta-base-openai-detector](https://huggingface.co/openai-community/roberta-base-openai-detector) | MIT | 125M, ~60MB INT8 | ✅ | **Stale** (2019 training). Tripwire signal only, ~60% accuracy on modern LLM output. |

### Recommendation

Fast-DetectGPT in-browser as primary → Llama-3.2-1B on Cloudflare Workers AI free tier for disputed cases. The judge's output doubles as UI explanation, which is critical for trust.

---

## Deployment architecture (v1)

### Default path — all in-browser (zero cost)

1. Channel heuristics via YouTube Data API (user's OAuth or API key)
2. Thumbnail CLIP similarity (CLIP-ViT-B/32 ONNX INT8, ~150MB, cached per channel)
3. AASIST-L voice detector on first 30s of audio (~1MB ONNX, ~500ms inference)
4. Fast-DetectGPT on auto-captions (~130MB INT8, ~2–5s inference, lazy-loaded)
5. MediaPipe face heuristics on sampled frames (free, Apache 2.0)
6. Composite score → badge overlay + per-signal breakdown in popup

### Optional cloud escalation (~1–5% of videos)

- **Cloudflare Workers AI free tier** (10K neurons/day): Llama-3.2-1B judge for transcript re-evaluation, produces UI explanation.
- **HuggingFace Inference API free tier**: Wav2Vec2 XLS-R for disputed voice results. Rate-limited; queue server-side.

### Where the free-tier budget breaks

- **Voice fallback**: HF free tier ≈ 1K req/month for Wav2Vec2-size models. Plan: user-brings-own-token or $5–20/mo Cloudflare Workers AI.
- **Face classification**: no free path exists for reliable avatar detection on 2026 content. v1 ships heuristics only and flags the gap in the UI.
- **YouTube API**: 10K units/day per Google project. Require per-user OAuth or user-supplied API key from day one.

### Build order

1. **Channel heuristics + YouTube Data API** — zero ML, immediate signal, fully explainable.
2. **MediaPipe face heuristics + AASIST-L voice** — small models, in-browser, MIT/Apache.
3. **Fast-DetectGPT on transcripts** — probably the single biggest accuracy jump.
4. **Optional cloud judge** for explanations and disputed cases.

---

## Product principles

- **Layered signals with a breakdown, not binary verdicts.** Show *which* signals fired so users can judge.
- **Admit uncertainty.** Face classification is explicitly "we can't reliably check this yet" in v1 UI.
- **Target the pattern, not any AI use.** Distinguish "AI slop factory" (fully automated pipeline) from "human creator using AI for editing/b-roll." The channel-level heuristics naturally do this.
- **User controls the threshold.** Different users will want different sensitivity; avoid hardcoding a single "AI / not AI" cutoff.

---

## Open questions for later

- Can we detect AI-generated thumbnails specifically with a small visual classifier (not just similarity-to-other-thumbnails)?
- Is there a way to cache channel scores across users (privacy-preserving) to reduce per-user API quota?
- How do we handle non-English content? Most detectors are English-heavy; voice detectors degrade on Spanish/Mandarin/Hindi.
- C2PA / Content Credentials are emerging — can we read these from YouTube's player UI once they roll out broadly?
