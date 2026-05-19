      const TRANS_QUIZ = [
        { q: 'What\'s the name of the "copy machine" that reads DNA and builds mRNA?',
          options: ['Ribosome', 'Mitochondrion', 'RNA polymerase', 'tRNA'],
          correct: 2,
          why: 'Right! RNA polymerase. It scoots along the DNA, unzipping and copying.',
          wrongHint: 'It\'s a protein with "RNA" in the name.' },
        { q: 'In RNA, which letter replaces T (thymine)?',
          options: ['A', 'C', 'G', 'U'],
          correct: 3,
          why: 'Yep — U (uracil). RNA uses A, U, G, C instead of A, T, G, C.',
          wrongHint: 'It\'s the only letter in RNA that doesn\'t exist in DNA.' },
        { q: 'Why does the cell make mRNA at all? Why not just use DNA directly?',
          options: [
            'DNA is too valuable to leave the nucleus',
            'mRNA is faster to read',
            'DNA can\'t carry information',
            'mRNA is bigger and easier to find'
          ],
          correct: 0,
          why: 'Exactly — DNA is the master copy. The cell never lets it leave. mRNA is the disposable working copy.',
          wrongHint: 'Think about why you\'d photocopy a library book instead of taking the original home.' },
        { q: 'Where does mRNA go after being made in the nucleus?',
          options: ['Stays in the nucleus', 'Out to the ribosomes', 'To the mitochondria', 'Out of the cell'],
          correct: 1,
          why: 'Right — mRNA exits the nucleus through pores and travels to ribosomes, where proteins get built.',
          wrongHint: 'Think about who needs the message — the protein-builders.' },
        { q: 'How long does most mRNA last before being recycled?',
          options: ['Seconds to minutes', 'Hours to days', 'Months', 'A lifetime'],
          correct: 0,
          why: 'Yep — mRNA is short-lived on purpose. The cell wants tight control over what gets built when.',
          wrongHint: 'Disposable means disposable. Think very short.' },
      ];

      // =====================================================================
      // MODULE 3 — TRANSCRIPTION: data + SVG + renderers
      // =====================================================================

      const TRANS_DATA = {
        // mRNA we'd produce: AUGCGUACCAAUG (start codon, then a few amino acids)
        // Template strand (read by polymerase): TACGCATGGTTAC
        template: 'TACGCATGGTTAC',
        mrna:     'AUGCGUACCAAUG',
      };

      // Transcription hook — nucleus with mRNA exiting
      function transHookSVG() {
        return `
          <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-label="Nucleus with mRNA exiting">
            <ellipse cx="200" cy="210" rx="180" ry="170" fill="#dcf7e9" stroke="#22c896" stroke-width="3"/>
            <circle cx="180" cy="190" r="100" fill="#efe6ff" stroke="#8b5cf6" stroke-width="4" stroke-dasharray="42 6"/>
            <g style="transform-origin: 180px 190px; animation: dnaWiggle 4s ease-in-out infinite;">
              <path d="M 130,160 Q 180,140 230,170 T 280,200" stroke="#8b5cf6" stroke-width="3" fill="none" stroke-linecap="round"/>
              <path d="M 130,220 Q 180,200 230,230 T 280,200" stroke="#a78bfa" stroke-width="3" fill="none" stroke-linecap="round"/>
              <line x1="155" y1="170" x2="155" y2="210" stroke="#8b5cf6" stroke-width="2"/>
              <line x1="180" y1="155" x2="180" y2="220" stroke="#8b5cf6" stroke-width="2"/>
              <line x1="205" y1="160" x2="205" y2="225" stroke="#8b5cf6" stroke-width="2"/>
              <line x1="230" y1="170" x2="230" y2="220" stroke="#8b5cf6" stroke-width="2"/>
              <line x1="255" y1="180" x2="255" y2="210" stroke="#8b5cf6" stroke-width="2"/>
            </g>
            <g style="animation: drift 5s ease-in-out infinite;">
              <path d="M 280,180 Q 320,165 365,210" stroke="#22c896" stroke-width="3" fill="none" stroke-dasharray="3 4" stroke-linecap="round"/>
              <circle cx="365" cy="210" r="6" fill="#22c896"/>
              <text x="375" y="215" font-size="12" font-family="ui-rounded, sans-serif" font-weight="700" fill="#22c896">mRNA</text>
            </g>
            <g style="animation: drift 6s ease-in-out infinite reverse;">
              <path d="M 220,290 Q 250,310 280,330" stroke="#22c896" stroke-width="3" fill="none" stroke-dasharray="3 4" stroke-linecap="round"/>
              <circle cx="280" cy="330" r="5" fill="#22c896"/>
            </g>
            <g style="animation: drift 7s ease-in-out infinite;">
              <path d="M 100,250 Q 60,280 30,300" stroke="#22c896" stroke-width="2.5" fill="none" stroke-dasharray="3 4" stroke-linecap="round"/>
              <circle cx="30" cy="300" r="4" fill="#22c896"/>
            </g>
            <text x="200" y="60" font-size="13" font-family="ui-rounded, sans-serif" font-weight="700" fill="#22c896" text-anchor="middle">CELL</text>
            <text x="180" y="120" font-size="13" font-family="ui-rounded, sans-serif" font-weight="700" fill="#8b5cf6" text-anchor="middle">NUCLEUS</text>
          </svg>
        `;
      }

      // Transcription stage — DNA being read by RNA polymerase
      function transStageSVG() {
        const tpl = TRANS_DATA.template;
        const mrna = TRANS_DATA.mrna;
        const len = tpl.length;
        const startX = 50, endX = 550, baseY = 110, mrnaY = 180;
        const stepX = (endX - startX) / (len - 1);
        let dnaBases = '';
        for (let i = 0; i < len; i++) {
          const x = startX + i * stepX;
          dnaBases += `
            <circle cx="${x}" cy="${baseY}" r="14" fill="${BASES[tpl[i]].color}" opacity="0.85"/>
            <text x="${x}" y="${baseY+5}" font-size="13" font-family="ui-rounded, sans-serif" font-weight="700" fill="white" text-anchor="middle">${tpl[i]}</text>
          `;
        }
        return `
          <svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" aria-label="DNA being transcribed">
            <rect x="0" y="0" width="600" height="280" fill="#f7f1ff" rx="0"/>
            <text x="20" y="35" font-size="13" font-family="ui-rounded, sans-serif" font-weight="700" fill="#8b5cf6">DNA template strand →</text>
            <line x1="${startX-20}" y1="${baseY}" x2="${endX+20}" y2="${baseY}" stroke="#a78bfa" stroke-width="4"/>
            ${dnaBases}
            <text x="20" y="${mrnaY-12}" font-size="13" font-family="ui-rounded, sans-serif" font-weight="700" fill="#22c896">mRNA being built →</text>
            <line x1="${startX-20}" y1="${mrnaY}" x2="${endX+20}" y2="${mrnaY}" stroke="#22c896" stroke-width="4" stroke-dasharray="5 4" opacity="0.4"/>
            <g class="poly-mrna" id="poly-mrna"></g>
            <g class="polymerase" id="polymerase">
              <ellipse cx="0" cy="0" rx="46" ry="34" fill="#5fb8ff" stroke="#3a87cc" stroke-width="3"/>
              <ellipse cx="0" cy="0" rx="46" ry="34" fill="url(#poly-grad)" opacity="0.4"/>
              <text x="0" y="-2" font-size="11" font-family="ui-rounded, sans-serif" font-weight="700" fill="white" text-anchor="middle">RNA</text>
              <text x="0" y="12" font-size="11" font-family="ui-rounded, sans-serif" font-weight="700" fill="white" text-anchor="middle">polymerase</text>
            </g>
          </svg>
        `;
      }

      function renderTransHook() {
        const stage = $('#trans-hook-stage');
        if (stage) stage.innerHTML = transHookSVG();
      }

      function renderTrans() {
        state.transAnim = { pos: 0, playing: false, intervalId: null };
        $('#trans-stage').innerHTML = transStageSVG();
        positionPolymerase();
        updateTransReadout();
        const playBtn = $('#trans-play');
        const stepBtn = $('#trans-step');
        const resetBtn = $('#trans-reset');
        if (playBtn) playBtn.onclick = togglePlayTrans;
        if (stepBtn) stepBtn.onclick = stepTrans;
        if (resetBtn) resetBtn.onclick = resetTrans;
      }

      function positionPolymerase() {
        const poly = $('#polymerase');
        if (!poly) return;
        const len = TRANS_DATA.template.length;
        const startX = 50, endX = 550;
        const stepX = (endX - startX) / (len - 1);
        const pos = state.transAnim.pos;
        const x = pos > 0 ? startX + (pos - 1) * stepX : startX - 30;
        poly.setAttribute('transform', `translate(${x} 145)`);
        // Render mRNA emerging (just simple letters where transcribed)
        const polyMrna = $('#poly-mrna');
        const mrna = TRANS_DATA.mrna;
        let html = '';
        for (let i = 0; i < pos; i++) {
          const x = startX + i * stepX;
          html += `
            <circle cx="${x}" cy="180" r="13" fill="${i === pos - 1 ? '#ffd23f' : BASES[mrna[i] === 'U' ? 'A' : mrna[i]] && mrna[i] !== 'U' ? BASES[mrna[i]].color : '#a78bfa'}"
                    stroke="white" stroke-width="2"/>
            <text x="${x}" y="185" font-size="13" font-family="ui-rounded, sans-serif" font-weight="700" fill="white" text-anchor="middle">${mrna[i]}</text>
          `;
        }
        polyMrna.innerHTML = html;
      }

      function updateTransReadout() {
        const tpl = TRANS_DATA.template;
        const mrna = TRANS_DATA.mrna;
        const pos = state.transAnim.pos;
        const dnaHTML = tpl.split('').map((b, i) =>
          `<span class="base ${b}${i === pos - 1 ? ' is-new' : ''}">${b}</span>`
        ).join('');
        const mrnaHTML = mrna.split('').map((b, i) =>
          i < pos
            ? `<span class="base ${b}${i === pos - 1 ? ' is-new' : ''}">${b}</span>`
            : `<span class="base placeholder">·</span>`
        ).join('');
        const out = $('#trans-readout');
        if (out) {
          out.innerHTML = `
            <div><span class="strand-label">DNA →</span> ${dnaHTML}</div>
            <div><span class="strand-label">mRNA →</span> ${mrnaHTML}</div>
          `;
        }
        const posEl = $('#trans-pos'); if (posEl) posEl.textContent = pos;
        const lenEl = $('#trans-len'); if (lenEl) lenEl.textContent = tpl.length;
        positionPolymerase();
      }

      function stepTrans() {
        if (state.transAnim.pos < TRANS_DATA.template.length) {
          state.transAnim.pos++;
          updateTransReadout();
        }
      }

      function togglePlayTrans() {
        const a = state.transAnim;
        const btn = $('#trans-play');
        if (a.playing) {
          clearInterval(a.intervalId);
          a.playing = false;
          if (btn) btn.innerHTML = '▶ Play';
        } else {
          if (a.pos >= TRANS_DATA.template.length) {
            a.pos = 0;
            updateTransReadout();
          }
          a.playing = true;
          if (btn) btn.innerHTML = '⏸ Pause';
          a.intervalId = setInterval(() => {
            if (a.pos >= TRANS_DATA.template.length) {
              clearInterval(a.intervalId);
              a.playing = false;
              if (btn) btn.innerHTML = '↺ Play again';
              return;
            }
            stepTrans();
          }, 550);
        }
      }

      function resetTrans() {
        const a = state.transAnim;
        clearInterval(a.intervalId);
        state.transAnim = { pos: 0, playing: false, intervalId: null };
        updateTransReadout();
        const btn = $('#trans-play');
        if (btn) btn.innerHTML = '▶ Play';
      }
