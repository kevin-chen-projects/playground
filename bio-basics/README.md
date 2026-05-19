# Bio Basics — source

`bio-basics.html` (deployed) is generated from this directory.
Edit the fragments here, then rebuild.

```bash
python3 bio-basics/build.py
```

That's it. No npm, no Astro, no watcher — just a 30-line Python script
that concatenates fragments through a template.

---

## Why this exists

Until recently, all of Bio Basics lived in a single 4,900-line
`bio-basics.html`. That worked great for the first 6 modules. By the
time the file hit ~5,000 lines we were one module away from the
"6,000-line split trigger" the plan doc set, and finding the right
spot to add new content was getting tedious.

The split keeps two contradictory things you'd usually have to choose
between:

- **Edit a per-module file** — easy to scan, easy to find what to
  change, no scrolling past unrelated modules.
- **Deploy a single static HTML file** — works on Cloudflare Pages /
  GitHub Pages with zero configuration, no build artifacts to chase
  in CI, no special tools required to view locally.

The build script reconciles them: source is split, deployed file is
single-file vanilla.

---

## Layout

```
bio-basics/
├── build.py             # 30 lines. Template substitution. Run from anywhere.
├── README.md            # This file.
└── src/
    ├── template.html    # The wrapper: <doctype>, <head>, <body>, <main>,
    │                    # landing-view markup, and the CLOSING tags. Has
    │                    # three placeholders: __CSS__, __MODULES__, __JS__.
    ├── css/             # Concatenated into <style>.
    │   ├── 00-base.css        # palette, layout, scenes, animations,
    │   │                      # navigation — everything not module-scoped
    │   ├── 40-translation.css # codon-picker / codon-cell / codon-result
    │   ├── 50-regulation.css  # celltype-toggle / gene-grid / gene-cell
    │   └── 60-evolve.css      # mutation-stage / mutation-base /
    │                          # mutation-options / mutation-verdict /
    │                          # sickle-compare
    ├── modules/         # One file per module's <div class="module-section">.
    │   ├── 00-cell.html
    │   ├── 10-dna.html
    │   ├── 20-transcription.html
    │   ├── 30-translation.html
    │   ├── 40-regulation.html
    │   └── 50-evolve.html
    └── js/              # Concatenated into <script>.
        ├── 00-core.js          # state, persistence, $/$$ helpers, CURRICULUM
        ├── 10-cell.js          # SVG factories + cell renderers + QUIZ
        ├── 20-dna.js           # DNA_QUIZ + BASES + DNA SVGs + renderers
        ├── 30-transcription.js # TRANS_QUIZ + TRANS_DATA + animation
        ├── 40-translation.js   # TRANSL_QUIZ + AA/codon tables + animation
        ├── 50-regulation.js    # REG_QUIZ + GENES + cell-type toggle
        ├── 60-evolve.js        # MUT_DATA + MUT_QUIZ + mutation classifier
        ├── 90-registry.js      # MODULES dict — must come AFTER 10–60
        └── 99-boot.js          # routing, quiz engine, scene nav, init
```

File ordering is by filename (sorted). The two-digit prefixes give us
room to insert new modules without renumbering existing ones.

---

## Workflow

### Add a new module

Say you're adding module 7: cancer.

1. Create `src/css/70-disease.css` (only if you have module-scoped CSS)
2. Create `src/modules/60-disease.html` (the `.module-section` block)
3. Create `src/js/70-disease.js` (data + SVG factories + renderers)
4. Add a `disease: { ... }` entry to `src/js/90-registry.js`
5. Update `regulation.next` ... wait, the chain is now `evolve.next`
   that's currently `null` — flip it to `'disease'`
6. Flip the `disease` `CURRICULUM` entry in `00-core.js` from
   `'soon'` to `'unlocked'`
7. Run `python3 bio-basics/build.py`
8. Open `bio-basics.html` in your browser, walk all 6 scenes

### Edit an existing module

Open the relevant `src/modules/<module>.html`, `src/js/<module>.js`,
or `src/css/<module>.css`. Make the edit. Run the build. Open the
generated file. That's the loop.

### Edit something cross-cutting

- **Site-wide CSS** (palette, layout, top bar, hero) — `src/css/00-base.css`
- **Routing / quiz engine / scene navigation** — `src/js/99-boot.js`
- **CURRICULUM list** (the landing card grid) — `src/js/00-core.js`
- **Landing view markup** (hero, "why bio" rail) — `src/template.html`

---

## Conventions worth knowing

- **Module ordering is by filename prefix.** `00-cell` before `10-dna`
  before `20-transcription`, etc. The prefix is **display order**, not
  any ID.
- **The cell module is special** — it has no `<!-- MODULE: CELL -->`
  separator comment because it's the first module in the wrapper and
  the comment lives in the template instead.
- **Each module file is self-contained.** Its quiz, data, SVG factories,
  and renderers all live together so you can read one module top-to-bottom
  without hunting around.
- **Order of JS dependencies:**
  - `00-core.js` defines `state`, `$`, `$$`, `CURRICULUM`. Everything else
    uses these.
  - `10-cell.js` through `60-evolve.js` define renderers + data.
  - `90-registry.js` builds `MODULES` — references functions defined
    earlier, so it must come AFTER the per-module files.
  - `99-boot.js` does routing + boot. Last.
- **Nothing imports anything.** This is plain `<script>` concatenation.
  Variables and functions are global. The order of files is the only
  way dependencies are managed.

---

## Don't edit the deployed file directly

`bio-basics.html` at the repo root has a banner at the top warning
about this. If you edit it directly:

- The next `build.py` run will overwrite your changes
- The source files won't reflect what's actually deployed
- Other contributors won't know which is "real"

If you must hot-fix the deployed file (e.g. you're on a machine without
Python), apply the same change to the source on your next push.

---

## Verifying a build

After `python3 build.py`, do these checks before committing:

1. `wc -l bio-basics.html` — should be roughly 4,800–5,000 lines for
   6 modules. A wildly different number means something didn't get
   concatenated right.
2. Open `bio-basics.html` in a browser. Click each module card on the
   landing page. Walk through all 6 scenes. Try the quiz. Verify the
   "Continue to X →" CTA on each module's recap takes you to the next.
3. If you want a structural diff before committing, compare against
   the previous deployed file:
   ```bash
   git diff bio-basics.html | head -50
   ```
   Quiz reorganizations and minor whitespace will show up; major
   structural changes shouldn't (unless you intended them).

---

## Why not Astro?

Astro is a great fit if you want a real component model, MDX, layouts,
or content collections. For 11 modules of static HTML/CSS/JS, the
overhead of "you now need Node and a build tool" outweighs the benefit.
This repo's value is "open the file in any browser, no setup." Astro
would lose that for the user, even though developers would gain
ergonomics.

When does Astro start to make sense?

- The curriculum balloons past ~20 modules
- You want shared layouts beyond the current single template
- You want MDX/Markdown for some content
- You want preview builds on a CDN

If any of those happen, the migration is mostly mechanical: each
module file becomes a `.astro` file, the JS files become a single
`<script>` per page or get bundled, and the build script becomes
`astro build`.
