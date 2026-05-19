# Bio Basics — Project Plan & Handoff

> **Read this first** when picking up the project on a new machine.
> Last updated: 2026-05-18.
> Lives in the playground repo for now — move it (and `bio-basics.html`) into a new dedicated repo later.

---

## 1. What this is

**Bio Basics** is a molecular biology learning website pitched as *"a one-stop shop for fun, easy-to-digest biology, from cells to CRISPR — no PhD required."*

Target audience: anyone with middle-school-level science exposure, including kids and adults who feel intimidated by science. Tone target: closer to a kids' science museum than a college textbook.

Source file: `bio-basics.html` (single-file vanilla HTML/CSS/JS, no build step).

---

## 2. Status (as of 2026-05-18)

**5 of 11 modules built and unlocked.** Each follows the same 6-scene format.

| # | Module | Status | Centerpiece interaction |
|---|--------|--------|-------------------------|
| 1 | What is a cell? | ✅ Built | Click 5 cell parts; sidebar updates with city analogy |
| 2 | What is DNA? | ✅ Built | Click 4 base pairs (A/T/G/C); animated bar chart of % shared DNA |
| 3 | Transcription (DNA → RNA) | ✅ Built | Animated RNA polymerase + play/step/reset controls |
| 4 | Translation (RNA → Protein) | ✅ Built | Animated ribosome + 64-codon picker |
| 5 | Gene Regulation | ✅ Built | Toggle 4 cell types; 20-gene grid lights up different subsets |
| 6 | Mutations & Evolution | 🔒 Locked | — |
| 7 | Cancer & Genetic Disease | 🔒 Locked | — |
| 8 | Viruses | 🔒 Locked | — |
| 9 | The Immune System | 🔒 Locked | — |
| 10 | Vaccines & Pandemics | 🔒 Locked | — |
| 11 | CRISPR & Modern Tools | 🔒 Locked | — |

File metrics: ~4,120 lines, ~176 KB. The first 5 modules are intentionally polished before scaffolding the rest. The disease/immune/vaccines arc (modules 7–10) is the long-term goal — for helping people understand pandemics, vaccines, etc.

---

## 3. Decisions made (with rationale)

These are the strategic choices made as of 2026-05-18. Don't relitigate without a reason.

### 3.1 Hosting: free static hosting (Cloudflare Pages or GitHub Pages)

- **Why:** The site is a single static HTML file. No backend, no database. Static-only hosting is free indefinitely at this scope.
- **Recommended host:** **Cloudflare Pages.** Free tier has unlimited bandwidth, world-class CDN, and easier custom-domain upgrade later.
- **Alternative:** GitHub Pages. Slightly simpler to set up (no separate signup) but slower CDN and capped bandwidth.

### 3.2 Domain: free subdomain for now

- Skip buying a custom domain (`biobasics.com`) until the project is ready to share publicly.
- Use the free `*.pages.dev` (Cloudflare) or `*.github.io` (GitHub) URL until then.
- Custom domain costs ~$12/yr; trivial to add later.

### 3.3 Users: anonymous only

- No login system. No backend.
- Visitors land, learn, leave. Progress saves to **localStorage in their own browser** (already implemented in `bio-basics.html` — see `localStorage['biobasics_state_v1']`).
- **Why:** Simplest, cheapest, works offline. Users don't have to trust you with credentials.
- **Future trigger to add accounts:** When users start asking "can I pick up on my phone where I left off on my laptop?" Then add Supabase free tier (~$0–25/mo).

### 3.4 Code: open source on GitHub

- Public repo. The educational content is the value, not the code secrecy.
- Doubles as a portfolio piece.
- Lets others contribute new modules eventually if it grows.

### 3.5 Architecture: single-file until forced to split

- Stay in `bio-basics.html` through the next 2–3 modules.
- **Trigger to split:** When file exceeds ~6,000 lines or when adding a new module forces you to read >50% of the file to find the right spot.
- **Then:** Split into one HTML file per module + shared CSS/JS files. Or move to **Astro** (static-site generator).

### 3.6 No premature monetization

- Don't add ads or subscriptions until traffic justifies it (mentally, "few thousand monthly visitors").
- Until then, the friction of monetization > the revenue from it.
- When ready: AdSense is a `<script>` tag. Stripe checkout is a ~30-line Cloudflare Worker (free tier).

---

## 4. Setup checklist — when you get to your own computer

### Step 1 — Create a dedicated GitHub repo

1. Sign in to github.com.
2. Click **New repository**.
3. Name it something like `biology-site`, `bio-basics`, or whatever brand name you settle on.
4. Make it **Public**.
5. Add a README (optional — we'll write one in step 3).
6. Create the repo. Don't add `.gitignore` or LICENSE yet (can add later).

### Step 2 — Move `bio-basics.html` into the new repo

Two options:

**Option A: Clone and copy locally**

```bash
# On your own computer
cd ~/dev   # or wherever you keep code
git clone git@github.com:<your-username>/biology-site.git
cd biology-site

# Copy bio-basics.html (and optionally bio-basics-plan.md) from playground
cp ~/path/to/playground/bio-basics.html ./index.html
cp ~/path/to/playground/bio-basics-plan.md ./PLAN.md   # optional
```

> ⚠️ **Rename `bio-basics.html` to `index.html`** when copying. Both Cloudflare Pages and GitHub Pages serve `index.html` automatically when someone visits the root URL. Otherwise visitors would have to type `/bio-basics.html` at the end of the URL.

**Option B: Upload via GitHub web UI**

1. On the repo page, click **Add file → Upload files**.
2. Drag `bio-basics.html` (renamed to `index.html`) in.
3. Commit.

### Step 3 — Add a minimum README.md

Create `README.md` in the repo root:

```markdown
# Bio Basics

Molecular biology, made human-sized. Bite-sized interactive modules that take
you from "what's a cell?" to "how does CRISPR work?" — no PhD required.

[Live site →](https://your-url.pages.dev)  <!-- update once deployed -->

## What's inside

5 fully built modules covering the central dogma:
1. What is a cell?
2. What is DNA?
3. Transcription (DNA → RNA)
4. Translation (RNA → Protein)
5. Gene Regulation

6 more on the way (mutations, disease, viruses, immune system, vaccines, CRISPR).

## Tech

Single-file vanilla HTML/CSS/JS. No build step, no dependencies. Just open
`index.html` in any modern browser.

## License

[Pick one — MIT is the most permissive default]
```

### Step 4 — Push everything

```bash
cd biology-site
git add .
git commit -m "Initial commit: bio-basics modules 1-5"
git push origin main
```

### Step 5 — Deploy on Cloudflare Pages (recommended)

1. Sign up at **dash.cloudflare.com** (free).
2. Sidebar → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Authorize the GitHub integration. Pick your `biology-site` repo.
4. Build settings:
   - **Framework preset:** None
   - **Build command:** *(leave blank)*
   - **Build output directory:** `/` (root)
5. Click **Save and Deploy**.
6. ~30 seconds later, your site is live at `<repo-name>.pages.dev`.
7. Cloudflare will redeploy automatically every time you `git push` to `main`.

### Alternative: Deploy on GitHub Pages (faster, less powerful)

1. In your repo, go to **Settings → Pages**.
2. **Source:** Deploy from a branch.
3. **Branch:** `main`, folder: `/ (root)`.
4. Save. ~1 minute later, your site is live at `<your-username>.github.io/<repo-name>`.

---

## 5. Growth path — when (and what) to spend money on

Stay free as long as humanly possible. Triggers:

| Trigger | What to add | Cost |
|---|---|---|
| Ready to share publicly with non-techies | Custom domain (e.g. `biobasics.com`) | ~$12/yr |
| Users ask "can I pick up where I left off on another device?" | Supabase free tier for accounts + progress sync | $0 → $25/mo |
| Want to know which modules people drop off on | **Cloudflare Web Analytics** (free, privacy-first, no cookie banner) | $0 |
| Want to A/B test or personalize | Cloudflare Workers + KV | $0 → $5/mo |
| Few thousand monthly visitors and willing to monetize | AdSense (script tag) or Stripe subscriptions (small Worker) | Revenue > cost |
| Wild success — millions of visits | Cloudflare paid tier or VPS | $20–50/mo |

**Don't add anything from this table until the trigger genuinely fires.** Premature complexity is the #1 way side projects die.

---

## 6. Remaining modules — content roadmap

Each module follows the same 6-scene template (hook → big idea → interactive → deep dive → quiz → recap + next-module tease). Brief content sketches:

### 6. Mutations & Evolution
- **Hook:** Tiny copy errors → giant changes over time. The engine of life.
- **Big idea:** Random changes + selection + time = evolution.
- **Interactive idea:** Show a base-pair flip (A→G) in a gene; show how it changes the codon, the amino acid, and (sometimes) the protein. Categories: silent, missense, nonsense.
- **Deep dive:** How rare beneficial mutations spread (sickle cell vs. malaria as canonical example).
- **Tease:** What happens when bad mutations accumulate? → Cancer.

### 7. Cancer & Genetic Disease
- **Hook:** When the recipes get scrambled. Cancer = cells that forgot the rules.
- **Big idea:** Cells have brakes (tumor suppressors) and accelerators (oncogenes). Cancer = brakes fail and/or accelerators stick.
- **Interactive idea:** "Build a cancer cell" — flip switches that disable apoptosis, p53, contact inhibition. Watch the cell pile up.
- **Deep dive:** Hereditary vs. acquired mutations. Why some families have higher cancer rates.
- **Tease:** Some "diseases" aren't broken cells — they're invaders → Viruses.

### 8. Viruses
- **Hook:** Not technically alive, but they hijack your cells to make more of themselves.
- **Big idea:** A virus = genetic material (DNA or RNA) wrapped in a protein coat. It can't reproduce alone — needs your cells.
- **Interactive idea:** Virus lifecycle animation: attach → inject → hijack ribosomes → assemble → burst out.
- **Deep dive:** RNA viruses (flu, COVID, HIV) vs. DNA viruses (herpes, smallpox). Why RNA viruses mutate faster.
- **Tease:** Your body has a defense system → Immune system.

### 9. The Immune System
- **Hook:** Your body's built-in security force, with memory.
- **Big idea:** Two layers: innate (fast, generic — first responders) and adaptive (slow, specific — sniper teams that learn).
- **Interactive idea:** Pick a pathogen; watch innate (macrophages, neutrophils) respond first; then adaptive (T cells, B cells producing antibodies) take over.
- **Deep dive:** Memory cells. Why you usually only get chickenpox once. Why allergies = system attacking the wrong thing.
- **Tease:** We can train this system on purpose → Vaccines.

### 10. Vaccines & Pandemics
- **Hook:** A vaccine is a "training video" for your immune system.
- **Big idea:** Show your immune system the pathogen (or just a piece of it) before a real infection. It builds memory cells. Real infection later → immediate response.
- **Interactive idea:** Compare side-by-side: unvaccinated person gets infected (slow response, illness) vs. vaccinated (memory cells trigger fast response, no illness).
- **Deep dive:** Vaccine types — live attenuated (MMR), inactivated (flu), mRNA (COVID), subunit (Hep B). Pros and cons of each.
- **Pandemic mechanics:** Why a virus jumps to humans (zoonotic spillover), why it spreads (R0), why some pandemics fade and others don't.
- **Tease:** Now we can edit DNA itself → CRISPR.

### 11. CRISPR & Modern Tools
- **Hook:** Bacteria invented gene editing 3 billion years ago. We just figured out how to use it.
- **Big idea:** CRISPR = a "find and cut" system. Find a specific DNA sequence; cut it. Cell repairs the cut, sometimes inserting new code.
- **Interactive idea:** Watch CRISPR-Cas9 search a genome, find a target, cut, then insert a new gene.
- **Deep dive:** What we can do with it — sickle cell cure (FDA-approved 2023), agriculture (mushrooms that don't brown), gene drives. Ethical questions.
- **Final scene:** "You finished bio basics." Recap of the entire arc. Pointer to next steps (real college courses, lab careers, science journalism, citizen science).

---

## 7. Conventions to maintain across modules

When adding new modules, follow these to keep the site coherent:

- **Single concrete metaphor per module** (city for cell, recipe book for DNA, photocopy machine for transcription, assembly line for translation, light switches for regulation). The metaphor should appear in: the hook, the big-idea cards, the interactive scene's info popups, and the quiz hints.
- **6-scene structure:** hook → big idea (4-card layout) → interactive (the centerpiece) → deep dive → quiz → recap + next-module tease.
- **Tone:** Friendly, conversational, contractions OK. Address the reader as "you". Use absurd-sounding facts on purpose ("60% of your DNA matches a banana"). Avoid Latin technical names except in the 4-card big-idea layout where they're labeled clearly.
- **Visual identity:** Leaf-green primary; grape for nucleus/DNA (consistent across all SVGs); coral for danger/stop/mitochondria; sun for ribosomes/achievement; sky for water/membrane/mRNA.
- **Each module ends with a "Continue to X →" CTA** that links directly to the next module. Don't end on a dead-end.
- **All progress in `localStorage`.** Don't add a backend until users ask for cross-device sync.

---

## 8. Files in this project

| File | Purpose |
|------|---------|
| `bio-basics.html` | The site itself. Single-file vanilla HTML/CSS/JS. Open in browser to run. |
| `bio-basics-plan.md` | This file. Project plan + handoff. |
| `PLAYGROUND_NOTES.md` | Section #13 has the technical reference: section map, JS entry points, palette, full architecture. |

When moving to a dedicated repo:
- Rename `bio-basics.html` → `index.html` (so root URL serves it)
- Bring `bio-basics-plan.md` along (rename to `PLAN.md` or keep)
- Copy section #13 of `PLAYGROUND_NOTES.md` into a new `ARCHITECTURE.md`
- Write a `README.md` (template in §4 step 3 above)

---

## 9. Quick-reference: open the site locally

No server needed. From the project directory:

```bash
open bio-basics.html         # macOS, default browser
xdg-open bio-basics.html     # Linux
start bio-basics.html        # Windows
```

Or just double-click the file. All progress saves to localStorage automatically.
