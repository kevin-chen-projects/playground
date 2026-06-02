# Agent guide — Playground

Context for AI assistants (Claude, GPT/Codex, etc.) working in this repo. This is the
canonical agent guide; [AGENTS.md](AGENTS.md) points here.

## What this repo is

A personal **playground of small, self-contained web projects** — mostly single-file
sites. Each is an independent experiment; there is no shared app, framework, or runtime
binding them together. Treat every project as its own world unless told otherwise.

- **Most sites are one `.html` file** with inline `<style>` and `<script>` — vanilla
  HTML/CSS/JS, **no build step**. Open the file in a browser to run it.
- **A few are folder projects** with their own stacks (React+Vite, FastAPI, Chrome MV3).
  See SITES.md for which is which; each folder has its own README/setup.
- Only the DAW (`daw/`) pulls external CDNs (Tone.js, VexFlow). Everything else is
  self-contained — no network needed to run.

## The two reference docs (keep them current)

| File | Audience | Purpose |
|------|----------|---------|
| [SITES.md](SITES.md) | Humans / sharing | Skim-friendly catalog: one row per site, grouped by category, honest status. |
| [PLAYGROUND_NOTES.md](PLAYGROUND_NOTES.md) | Engineering | Per-file structural map: line ranges, color tokens, key components, JS entry points. |

**When you add or materially change a site, update both.** Status in SITES.md must stay
honest (Complete / MVP / Early dev / Preview). Engineering detail goes in
PLAYGROUND_NOTES.md, not SITES.md.

## File conventions

- Every `.html` file (all 25) opens with a top **TOC comment block** describing what it
  does and mapping its sections. **Read that header first** — it's the fastest way to
  orient in a large single-file site (some exceed 200 KB / several thousand lines).
- Inside any file, `grep -n "============"` lists its section anchors.
- Line numbers in PLAYGROUND_NOTES.md predate the TOC headers (+19 to +51 lines off);
  trust the in-file header for exact positions, structure/ordering is still accurate.

## Working in this repo

- **No build, no install** for the HTML sites — just open in a browser. Don't add a
  toolchain to a single-file site unless asked.
- Match the surrounding code's style within each file; sites are independent, so don't
  refactor toward a shared abstraction across files.
- Some folder projects ship `*.backup_<timestamp>` snapshots from external tooling.
  These are NOT source — never edit, lint, or "clean them up." They're excluded in
  pyproject.toml and CI.

## CI (runs on push / PR to main — `.github/workflows/ci.yml`)

- **HTML syntax** — `python ci/check_html.py` parses every `.html` (catches unterminated
  tags, broken quoting). Structural only, not HTML5 semantics.
- **Lint** — `ruff check .` (config in pyproject.toml; E/F/I rules, line-length ignored).
- **Tests** — `pytest` in `violin-sheet-helper-webapp/`.
- **Dependency audit** — `pip-audit` over every `requirements.txt` (informational, won't
  block).

Before pushing Python changes: `ruff check .` and the relevant `pytest` locally.

## Commit / push procedure (IMPORTANT — parallel work happens constantly)

The working tree routinely holds unrelated in-progress work (other modified files,
untracked new site HTML). **Never `git add .` or `git commit -a`.**

1. `git fetch origin` first — `origin/main` moves often (feature branches merge via PRs).
2. Branch off the latest origin/main: `git checkout -b feat/... origin/main` — not
   whatever branch happens to be checked out.
3. Stage only your files **by name** (`git add fluoro-match.html`), then verify with
   `git diff --cached --name-only` and confirm `git status --short` shows others untouched.
4. Push with `-u` and let the user open the PR. Commit/push only when asked.

## License

Source-available, **not** open-source ([LICENSE](LICENSE)). Viewable and snippet-quotable
with attribution, but no commercial reuse, redistribution, or derivative works without
written permission. The absence of an OSS license is intentional — don't add one.
