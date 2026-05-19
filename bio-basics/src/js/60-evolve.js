      // =====================================================================
      // MODULE 6 — MUTATIONS & EVOLUTION: data + SVG + renderers
      // =====================================================================

      // Starting mRNA: AUG-UCG-UAU-GAG (Met-Ser-Tyr-Glu).
      // Picked for variety — UCG has silent options (UCG→UCU/UCC/UCA all = Ser),
      // UAU sits one swap from a stop codon (UAU→UAA = nonsense), and GAG is the
      // exact codon involved in the sickle-cell mutation (GAG→GUG = Val) so the
      // interactive in scene 3 sets up the canonical example in scene 4.
      const MUT_DATA = {
        bases: 'AUGUCGUAUGAG',
      };

      const MUT_QUIZ = [
        { q: 'Which type of mutation changes a codon but leaves the protein totally unchanged?',
          options: ['Silent', 'Missense', 'Nonsense', 'Frameshift'],
          correct: 0,
          why: 'Right — silent. The genetic code is redundant: many codons code for the same amino acid, so a swap can leave the protein completely intact.',
          wrongHint: 'Look for the mutation type that uses the genetic code\'s redundancy as a safety net.' },
        { q: 'A mutation creates a STOP codon in the middle of a gene. The ribosome quits and the protein is cut short. What\'s this called?',
          options: ['Silent', 'Missense', 'Nonsense', 'Synonymous'],
          correct: 2,
          why: 'Right — nonsense. The ribosome hits the early stop and lets go. The protein is short and almost always broken.',
          wrongHint: '"No-sense" — the protein doesn\'t make sense because it\'s incomplete.' },
        { q: 'Why has the sickle cell mutation persisted in some human populations?',
          options: [
            'Two copies are harmless',
            'Single copies partially protect against malaria — that\'s an advantage where malaria is common',
            'It improves muscle strength',
            'It\'s on a sex chromosome and skips selection',
          ],
          correct: 1,
          why: 'Right — heterozygote advantage. One copy partially protects against malaria, so in malaria-endemic regions carriers actually outsurvive non-carriers.',
          wrongHint: 'Two copies = sickle-cell disease. So why would the mutation stick around at all? Think about what advantage one copy might give.' },
        { q: 'Roughly how many brand-new mutations does the average newborn carry that neither parent had?',
          options: ['~7', '~70', '~700', '~7,000'],
          correct: 1,
          why: 'Right — about 70. Each generation adds a small batch of new typos. Most are harmless.',
          wrongHint: 'Each cell division introduces a tiny number of copy errors. Across all the DNA copying that produces one new human, the total is in the dozens — not single digits, not hundreds.' },
        { q: 'True or false: most random DNA mutations are harmful.',
          options: ['True', 'False'],
          correct: 1,
          why: 'False — most are silent or have no measurable effect. Harmful ones tend to get weeded out by selection; neutral ones quietly accumulate.',
          wrongHint: 'Most letter swaps land in a codon that still codes for the same amino acid — or in a stretch of DNA that doesn\'t code for anything at all.' },
      ];

      function mutHookSVG() {
        return `
          <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-label="DNA strand with one typo highlighted">
            <rect x="40" y="60" width="320" height="280" rx="20" fill="#fff8ec" stroke="#ffc73d" stroke-width="2"/>
            <text x="200" y="96" font-size="13" font-family="ui-rounded, sans-serif" font-weight="700" fill="#1a1f36" text-anchor="middle">RECIPE: HEMOGLOBIN · LINE 6</text>
            <text x="200" y="116" font-size="11" font-family="ui-rounded, sans-serif" font-weight="500" fill="#6d7592" text-anchor="middle">(copied from your genome — with one typo)</text>

            <g font-family="ui-monospace, monospace" font-size="18" font-weight="800" text-anchor="middle">
              <rect x="76" y="160" width="34" height="40" rx="7" fill="#dcf7e9" stroke="#22c896" stroke-width="2"/>
              <text x="93" y="187" fill="#1a1f36">G</text>
              <rect x="114" y="160" width="34" height="40" rx="7" fill="#dcf7e9" stroke="#22c896" stroke-width="2"/>
              <text x="131" y="187" fill="#1a1f36">A</text>
              <rect x="152" y="160" width="34" height="40" rx="7" fill="#dcf7e9" stroke="#22c896" stroke-width="2"/>
              <text x="169" y="187" fill="#1a1f36">G</text>
              <rect x="216" y="160" width="34" height="40" rx="7" fill="#ffe0e0" stroke="#ee5a5a" stroke-width="2.5">
                <animate attributeName="stroke-width" values="2.5;4.5;2.5" dur="2.2s" repeatCount="indefinite"/>
              </rect>
              <text x="233" y="187" fill="#ee5a5a">U</text>
              <rect x="254" y="160" width="34" height="40" rx="7" fill="#dcf7e9" stroke="#22c896" stroke-width="2"/>
              <text x="271" y="187" fill="#1a1f36">A</text>
              <rect x="292" y="160" width="34" height="40" rx="7" fill="#dcf7e9" stroke="#22c896" stroke-width="2"/>
              <text x="309" y="187" fill="#1a1f36">G</text>
            </g>

            <!-- "should be A" tag pointing at the typo -->
            <line x1="233" y1="220" x2="233" y2="252" stroke="#ee5a5a" stroke-width="2" stroke-linecap="round" stroke-dasharray="4 3"/>
            <rect x="194" y="252" width="78" height="32" rx="16" fill="#ffe0e0" stroke="#ee5a5a" stroke-width="2"/>
            <text x="233" y="266" font-size="10" font-family="ui-rounded, sans-serif" font-weight="800" fill="#ee5a5a" text-anchor="middle">SHOULD BE</text>
            <text x="233" y="278" font-size="11" font-family="ui-monospace, monospace" font-weight="800" fill="#ee5a5a" text-anchor="middle">A</text>

            <!-- Floating background typos -->
            <g opacity="0.45" font-family="ui-monospace, monospace" font-weight="800">
              <text x="58" y="62" font-size="13" fill="#ee5a5a">A→G</text>
              <text x="316" y="48" font-size="11" fill="#ffc73d">C→U</text>
              <text x="44" y="378" font-size="11" fill="#22c896">G→A</text>
              <text x="328" y="372" font-size="13" fill="#a78bfa">U→C</text>
            </g>
          </svg>
        `;
      }

      function sickleCompareSVG() {
        return `
          <svg viewBox="0 0 560 240" xmlns="http://www.w3.org/2000/svg" aria-label="Normal red blood cell vs sickle red blood cell">
            <!-- Normal red blood cell (round biconcave disc, simplified) -->
            <g transform="translate(140 110)">
              <ellipse cx="0" cy="0" rx="78" ry="72" fill="#ff7878" stroke="#ee5a5a" stroke-width="3"/>
              <ellipse cx="0" cy="0" rx="32" ry="26" fill="#c94545" opacity="0.35"/>
              <text x="0" y="108" font-size="13" font-family="ui-rounded, sans-serif" font-weight="700" fill="#1a1f36" text-anchor="middle">Normal red blood cell</text>
              <text x="0" y="128" font-size="12" font-family="ui-monospace, monospace" font-weight="700" fill="#6d7592" text-anchor="middle">GAG = Glu</text>
            </g>

            <!-- Arrow + codon-flip label -->
            <g transform="translate(280 110)">
              <line x1="-32" y1="0" x2="32" y2="0" stroke="#ffc73d" stroke-width="3" stroke-linecap="round"/>
              <polygon points="32,0 22,-7 22,7" fill="#ffc73d"/>
              <text x="0" y="-26" font-size="12" font-family="ui-monospace, monospace" font-weight="800" fill="#1a1f36" text-anchor="middle">A → U</text>
              <text x="0" y="26" font-size="10" font-family="ui-rounded, sans-serif" font-weight="600" fill="#6d7592" text-anchor="middle">one base flip</text>
            </g>

            <!-- Sickle cell (crescent) -->
            <g transform="translate(420 110)">
              <path d="M -68,-32 Q -42,-78 4,-70 Q 72,-40 72,12 Q 56,54 8,64 Q -54,56 -76,28 Q -82,4 -68,-32 Z"
                    fill="#ee5a5a" stroke="#c94545" stroke-width="3"/>
              <path d="M -42,-22 Q -22,-50 8,-46 Q 46,-22 46,8 Q 32,34 -2,40 Q -50,30 -42,-22 Z"
                    fill="none" stroke="#c94545" stroke-width="1.2" opacity="0.45"/>
              <text x="0" y="108" font-size="13" font-family="ui-rounded, sans-serif" font-weight="700" fill="#1a1f36" text-anchor="middle">Sickle cell</text>
              <text x="0" y="128" font-size="12" font-family="ui-monospace, monospace" font-weight="700" fill="#6d7592" text-anchor="middle">GUG = Val</text>
            </g>
          </svg>
        `;
      }

      function renderMutHook() {
        const stage = $('#mut-hook-stage');
        if (stage) stage.innerHTML = mutHookSVG();
      }

      function renderSickleCompare() {
        const stage = $('#sickle-compare');
        if (stage) stage.innerHTML = sickleCompareSVG();
      }

      // ----- Mutation classifier (scene 3 centerpiece) -----
      // State shape:
      //   state.mutPicker   = null | { codonIdx, baseIdx }  -- options panel showing for this base
      //   state.mutApplied  = null | { codonIdx, baseIdx, fromBase, toBase, originalCodon, newCodon, classification }
      // Only one mutation can be applied at a time; clicking a different base resets
      // the previous mutation, so each verdict reads cleanly against the original strand.

      function classifyMutation(originalCodon, newCodon) {
        const o = CODON_TABLE[originalCodon];
        const n = CODON_TABLE[newCodon];
        if (!o || !n) return 'missense';
        if (n.isStop && !o.isStop) return 'nonsense';
        if (n.aa === o.aa) return 'silent';
        return 'missense';
      }

      function getCurrentStrand() {
        if (!state.mutApplied) return MUT_DATA.bases;
        const { codonIdx, baseIdx, toBase } = state.mutApplied;
        const arr = MUT_DATA.bases.split('');
        arr[codonIdx * 3 + baseIdx] = toBase;
        return arr.join('');
      }

      function renderMutationStage() {
        state.mutPicker = null;
        state.mutApplied = null;
        drawMutationStage();
        drawMutationVerdict();
      }

      function drawMutationStage() {
        const stage = $('#mutation-stage');
        if (!stage) return;
        const strand = getCurrentStrand();
        const original = MUT_DATA.bases;
        const codonCount = strand.length / 3;
        const codons = [];
        for (let i = 0; i < codonCount; i++) {
          codons.push({
            idx: i,
            bases: strand.slice(i * 3, i * 3 + 3),
            origBases: original.slice(i * 3, i * 3 + 3),
          });
        }
        const strandHTML = codons.map(c => {
          const ct = CODON_TABLE[c.bases];
          const origCt = CODON_TABLE[c.origBases];
          const aaChanged = ct && origCt && ct.aa !== origCt.aa;
          const isStop = ct && ct.isStop;
          const isCodonChanged = c.bases !== c.origBases;
          let labelCls = 'mutation-codon-label';
          if (isStop) labelCls += ' aa-stop';
          else if (aaChanged) labelCls += ' aa-changed';
          const label = ct ? (isStop ? 'STOP' : ct.aa) : '?';
          const baseButtons = c.bases.split('').map((b, bi) => {
            const isApplied = state.mutApplied
              && state.mutApplied.codonIdx === c.idx
              && state.mutApplied.baseIdx === bi;
            const isPicker = state.mutPicker
              && state.mutPicker.codonIdx === c.idx
              && state.mutPicker.baseIdx === bi;
            let cls = 'mutation-base';
            if (isApplied) cls += ' changed';
            if (isPicker) cls += ' active';
            return `<button class="${cls}" type="button" data-codon="${c.idx}" data-base="${bi}">${b}</button>`;
          }).join('');
          return `
            <div class="mutation-codon ${isCodonChanged ? 'changed' : ''}">
              <div class="mutation-codon-bases">${baseButtons}</div>
              <div class="${labelCls}">${label}</div>
            </div>
          `;
        }).join('');

        const optionsHTML = state.mutPicker ? renderMutationOptions() : '';

        stage.innerHTML = `
          <div class="mutation-strand">${strandHTML}</div>
          ${optionsHTML}
          <button class="mutation-reset" type="button">Reset strand</button>
        `;

        $$('.mutation-base', stage).forEach(btn => {
          btn.addEventListener('click', () => {
            const codonIdx = +btn.dataset.codon;
            const baseIdx = +btn.dataset.base;
            // Toggle: clicking the active base again closes its options.
            if (state.mutPicker
                && state.mutPicker.codonIdx === codonIdx
                && state.mutPicker.baseIdx === baseIdx) {
              state.mutPicker = null;
            } else {
              state.mutPicker = { codonIdx, baseIdx };
              state.mutApplied = null;
            }
            drawMutationStage();
            drawMutationVerdict();
          });
        });
        $$('.mutation-option', stage).forEach(btn => {
          btn.addEventListener('click', () => {
            const codonIdx = +btn.dataset.codon;
            const baseIdx = +btn.dataset.base;
            const toBase = btn.dataset.toBase;
            const fromBase = btn.dataset.fromBase;
            const cIdx = codonIdx * 3;
            const origCodon = MUT_DATA.bases.slice(cIdx, cIdx + 3);
            const newCodon = origCodon.slice(0, baseIdx) + toBase + origCodon.slice(baseIdx + 1);
            const classification = classifyMutation(origCodon, newCodon);
            state.mutApplied = { codonIdx, baseIdx, fromBase, toBase, originalCodon: origCodon, newCodon, classification };
            state.mutPicker = null;
            drawMutationStage();
            drawMutationVerdict();
          });
        });
        const resetBtn = $('.mutation-reset', stage);
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            state.mutPicker = null;
            state.mutApplied = null;
            drawMutationStage();
            drawMutationVerdict();
          });
        }
      }

      function renderMutationOptions() {
        const { codonIdx, baseIdx } = state.mutPicker;
        const cIdx = codonIdx * 3;
        const origCodon = MUT_DATA.bases.slice(cIdx, cIdx + 3);
        const fromBase = origCodon[baseIdx];
        const alternatives = ['A', 'U', 'G', 'C'].filter(b => b !== fromBase);
        return `
          <div class="mutation-options">
            ${alternatives.map(toBase => {
              const newCodon = origCodon.slice(0, baseIdx) + toBase + origCodon.slice(baseIdx + 1);
              const cls = classifyMutation(origCodon, newCodon);
              return `
                <button class="mutation-option ${cls}" type="button"
                        data-codon="${codonIdx}" data-base="${baseIdx}"
                        data-from-base="${fromBase}" data-to-base="${toBase}">
                  <span class="opt-base">${fromBase} → ${toBase}</span>
                  <span class="opt-tag">${cls}</span>
                </button>
              `;
            }).join('')}
          </div>
        `;
      }

      function drawMutationVerdict() {
        const card = $('#mutation-verdict');
        if (!card) return;
        card.classList.remove('silent', 'missense', 'nonsense');
        if (!state.mutApplied) {
          if (state.mutPicker) {
            const { codonIdx, baseIdx } = state.mutPicker;
            const cIdx = codonIdx * 3;
            const origCodon = MUT_DATA.bases.slice(cIdx, cIdx + 3);
            const fromBase = origCodon[baseIdx];
            const aaName = (CODON_TABLE[origCodon] || {}).name || '?';
            card.innerHTML = `
              <div class="verdict-label">Editing position ${cIdx + baseIdx + 1}: <strong>${fromBase}</strong> in codon <strong>${origCodon}</strong> (${aaName})</div>
              <div class="verdict-detail">Pick one of the three swaps above. Each one is pre-classified — green = silent, yellow = missense, red = nonsense.</div>
            `;
          } else {
            card.innerHTML = `
              <div class="verdict-label">Pick a letter to mutate</div>
              <div class="verdict-detail">Each letter has 3 possible swaps (A, U, G, C minus the current one). The verdict tells you whether the protein changes — and how.</div>
            `;
          }
          return;
        }
        const { codonIdx, originalCodon, newCodon, classification } = state.mutApplied;
        card.classList.add(classification);
        const origAA = CODON_TABLE[originalCodon];
        const newAA = CODON_TABLE[newCodon];
        let label, detail;
        if (classification === 'silent') {
          label = `🟢 Silent mutation. Protein unchanged.`;
          detail = `Codon ${codonIdx + 1}: <strong>${originalCodon}</strong> → <strong>${newCodon}</strong>. Both code for <strong>${origAA.name}</strong> — the genetic code's redundancy means this swap doesn't change the protein at all. Most random mutations land here.`;
        } else if (classification === 'missense') {
          label = `🟡 Missense mutation. One amino acid changed.`;
          detail = `Codon ${codonIdx + 1}: <strong>${originalCodon}</strong> (${origAA.name}) → <strong>${newCodon}</strong> (${newAA.name}). The protein gets one different ingredient. Sometimes harmless, sometimes catastrophic — depends which amino acid swapped, and where it sits in the protein.`;
        } else {
          label = `🔴 Nonsense mutation. Protein cut short.`;
          detail = `Codon ${codonIdx + 1}: <strong>${originalCodon}</strong> (${origAA.name}) → <strong>${newCodon}</strong> (STOP). The ribosome quits here. Everything that should have come after this codon never gets built. The protein is short and almost always non-functional.`;
        }
        card.innerHTML = `<div class="verdict-label">${label}</div><div class="verdict-detail">${detail}</div>`;
      }
