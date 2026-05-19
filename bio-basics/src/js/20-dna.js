      const DNA_QUIZ = [
        { q: 'How many letters are in the DNA alphabet?',
          options: ['2', '4', '20', '64'],
          correct: 1,
          why: 'Yep — just 4: A, T, G, C. That tiny alphabet writes every recipe in every living thing.',
          wrongHint: 'Think small. The simplest building blocks of DNA.' },
        { q: 'A pairs with ___, and G pairs with ___.',
          options: ['T and C', 'C and T', 'G and A', 'U and T'],
          correct: 0,
          why: 'Right! A↔T and G↔C. The pairing is always the same — that\'s how DNA copies itself reliably.',
          wrongHint: 'Remember: A-T and G-C. Always. Everywhere.' },
        { q: 'A "gene" is best described as:',
          options: ['One letter of DNA', 'One recipe in the book', 'The whole DNA', 'A type of cell'],
          correct: 1,
          why: 'Yes — a gene is one recipe. Usually for one specific protein. You have ~20,000 of them.',
          wrongHint: 'Think recipe-book-page level, not whole-book and not single-letter.' },
        { q: 'About what percent of your DNA do you share with a chimpanzee?',
          options: ['25%', '60%', '85%', '99%'],
          correct: 3,
          why: '99%. We\'re extraordinarily close — the differences make a huge difference, but the shared code is enormous.',
          wrongHint: 'Closer than you might guess. We\'re primates too, after all.' },
        { q: 'If you stretched the DNA from one of your cells, about how long would it be?',
          options: ['2 millimeters', '2 centimeters', '2 meters', '2 kilometers'],
          correct: 2,
          why: 'Yes — about 2 meters. Per cell. And you have ~37 trillion cells. Do the math…',
          wrongHint: 'It\'s longer than you\'d expect — a lot longer.' },
      ];

      // =====================================================================
      // MODULE 2 — DNA: data + SVG + renderers
      // =====================================================================

      const BASES = {
        A: { letter: 'A', name: 'Adenine',  pair: 'T', color: '#5fb8ff', tint: 'var(--sky-100)',
             desc: 'Adenine. One of two "purine" bases — has a bigger 2-ring shape. Always pairs with T (thymine) on the opposite strand, held by 2 hydrogen bonds.',
             fact: 'Adenine also shows up in ATP — your cell\'s energy currency. Same letter, different job.' },
        T: { letter: 'T', name: 'Thymine',  pair: 'A', color: '#ff7878', tint: 'var(--coral-100)',
             desc: 'Thymine. A "pyrimidine" — smaller 1-ring shape. Always pairs with A. Only found in DNA — RNA uses U (uracil) instead.',
             fact: 'Thymine is what gives DNA its stability. Replacing it with U (in RNA) is why RNA is more fragile.' },
        G: { letter: 'G', name: 'Guanine',  pair: 'C', color: '#22c896', tint: 'var(--leaf-100)',
             desc: 'Guanine. A "purine" — bigger 2-ring shape. Always pairs with C, held by 3 hydrogen bonds (the strongest base pair).',
             fact: 'G-C-rich sections of DNA are stickier and harder to pull apart — it takes more energy to copy them.' },
        C: { letter: 'C', name: 'Cytosine', pair: 'G', color: '#ffc73d', tint: 'var(--sun-100)',
             desc: 'Cytosine. A "pyrimidine" — smaller 1-ring shape. Always pairs with G. C and G hold each other tight with 3 hydrogen bonds.',
             fact: 'Cytosine can pick up a tiny chemical tag (a methyl group) that turns nearby genes OFF. That\'s called epigenetics.' },
      };

      const DNA_SHARE = [
        { name: 'Identical twin', icon: '👯', pct: 100 },
        { name: 'Sibling',        icon: '👨‍👦', pct: 50  },
        { name: 'Chimpanzee',     icon: '🐵', pct: 99  },
        { name: 'Mouse',          icon: '🐭', pct: 85  },
        { name: 'Banana',         icon: '🍌', pct: 60, kind: 'banana' },
        { name: 'Oak tree',       icon: '🌳', pct: 25, kind: 'tree'   },
      ];

      // Animated double helix — used in DNA hook, transcription hook, etc.
      function dnaHelixSVG(opts) {
        const turns = (opts && opts.turns) || 5;
        const cx = 110, amp = 60;
        const turnH = 60;
        const totalH = 30 + turns * turnH + 30;
        // generate two strand paths
        let strandA = `M ${cx - amp},20`;
        let strandB = `M ${cx + amp},20`;
        for (let i = 1; i <= turns; i++) {
          const yMid = 20 + i * turnH - turnH / 2;
          const yEnd = 20 + i * turnH;
          const xEndA = i % 2 === 0 ? cx - amp : cx + amp;
          const xEndB = i % 2 === 0 ? cx + amp : cx - amp;
          strandA += ` Q ${cx},${yMid} ${xEndA},${yEnd}`;
          strandB += ` Q ${cx},${yMid} ${xEndB},${yEnd}`;
        }
        // 5 base pairs at "wide" points (where strands are far apart): y = 20, 80, 140, 200, 260
        const pairs = [
          { top: 'A', bot: 'T' },
          { top: 'G', bot: 'C' },
          { top: 'T', bot: 'A' },
          { top: 'C', bot: 'G' },
          { top: 'A', bot: 'T' },
        ];
        let rungs = '';
        for (let i = 0; i < pairs.length; i++) {
          const y = 20 + i * turnH;
          const flipped = i % 2 === 1;
          const xL = flipped ? cx + amp : cx - amp;
          const xR = flipped ? cx - amp : cx + amp;
          const tBase = BASES[pairs[i].top];
          const bBase = BASES[pairs[i].bot];
          rungs += `
            <line x1="${xL}" y1="${y}" x2="${xR}" y2="${y}" stroke="#e8d8ff" stroke-width="3" stroke-dasharray="3 3" opacity="0.85"/>
            <circle cx="${xL}" cy="${y}" r="14" fill="${tBase.color}"/>
            <text x="${xL}" y="${y+5}" font-size="13" font-family="ui-rounded, sans-serif" font-weight="700" fill="white" text-anchor="middle">${pairs[i].top}</text>
            <circle cx="${xR}" cy="${y}" r="14" fill="${bBase.color}"/>
            <text x="${xR}" y="${y+5}" font-size="13" font-family="ui-rounded, sans-serif" font-weight="700" fill="white" text-anchor="middle">${pairs[i].bot}</text>
          `;
        }
        return `
          <svg viewBox="0 0 220 ${totalH}" xmlns="http://www.w3.org/2000/svg" aria-label="Animated DNA double helix">
            <g style="transform-origin: ${cx}px ${totalH/2}px; animation: dnaWiggle 6s ease-in-out infinite;">
              <path d="${strandA}" stroke="#a78bfa" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.9"/>
              <path d="${strandB}" stroke="#8b5cf6" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.9"/>
              ${rungs}
            </g>
          </svg>
        `;
      }

      // Interactive DNA strand — 4 clickable base-pair "rungs", one of each base on top
      function dnaInteractiveSVG() {
        // 4 base pairs spread horizontally
        const topBases = ['A', 'G', 'T', 'C'];
        const w = 600, h = 320;
        const startX = 70, gap = (w - 140) / 3;
        let strandTop = `M 30 80`;
        let strandBot = `M 30 240`;
        for (let i = 0; i < topBases.length; i++) {
          const x = startX + i * gap;
          strandTop += ` Q ${x - gap/2} ${i % 2 === 0 ? 60 : 100} ${x} 80`;
          strandBot += ` Q ${x - gap/2} ${i % 2 === 0 ? 260 : 220} ${x} 240`;
        }
        strandTop += ` L ${w - 30} 80`;
        strandBot += ` L ${w - 30} 240`;
        let pairs = '';
        for (let i = 0; i < topBases.length; i++) {
          const x = startX + i * gap;
          const top = topBases[i];
          const bot = BASES[top].pair;
          pairs += `
            <g class="bp" data-base="${top}" style="cursor: pointer;">
              <line x1="${x}" y1="80" x2="${x}" y2="240" stroke="#e8d8ff" stroke-width="3" stroke-dasharray="4 4"/>
              <g class="bp-top">
                <circle cx="${x}" cy="80" r="28" fill="${BASES[top].color}" stroke="white" stroke-width="3"/>
                <text x="${x}" y="88" font-size="26" font-family="ui-rounded, sans-serif" font-weight="700" fill="white" text-anchor="middle">${top}</text>
              </g>
              <g class="bp-bot">
                <circle cx="${x}" cy="240" r="28" fill="${BASES[bot].color}" stroke="white" stroke-width="3"/>
                <text x="${x}" y="248" font-size="26" font-family="ui-rounded, sans-serif" font-weight="700" fill="white" text-anchor="middle">${bot}</text>
              </g>
              <text x="${x}" y="305" font-size="11" font-family="ui-rounded, sans-serif" font-weight="600" fill="#6d7592" text-anchor="middle">click me</text>
            </g>
          `;
        }
        return `
          <svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" aria-label="Interactive DNA strand">
            <path d="${strandTop}" stroke="#cdb8ff" stroke-width="6" fill="none" stroke-linecap="round"/>
            <path d="${strandBot}" stroke="#cdb8ff" stroke-width="6" fill="none" stroke-linecap="round"/>
            ${pairs}
          </svg>
        `;
      }

      function renderDnaHook() {
        const stage = $('#dna-hook-stage');
        if (stage) stage.innerHTML = dnaHelixSVG();
      }

      function renderDnaInteractive() {
        const stage = $('#dna-stage');
        if (!stage) return;
        stage.innerHTML = dnaInteractiveSVG();
        const info = $('#dna-info');
        if (info) {
          info.classList.remove('has-active');
          info.innerHTML = `
            <div class="placeholder">
              <span class="hint-icon">👆</span>
              Click any letter to see its pair.
            </div>`;
        }
        $('#dna-pct').textContent = `${state.basesSeen.size}/4`;
        $('#dna-bar').style.width = `${(state.basesSeen.size / 4) * 100}%`;
        $$('.bp', stage).forEach(g => {
          g.addEventListener('click', () => selectBase(g.dataset.base));
        });
      }

      function selectBase(letter) {
        const base = BASES[letter];
        if (!base) return;
        state.basesSeen.add(letter);
        $$('.bp').forEach(g => {
          g.classList.toggle('active', g.dataset.base === letter);
          g.classList.toggle('dim', g.dataset.base !== letter);
        });
        const info = $('#dna-info');
        info.classList.add('has-active');
        info.innerHTML = `
          <div class="part-icon" style="background: ${base.tint}; color: ${base.color}; font-family: var(--font-display); font-weight: 800;">${base.letter}</div>
          <h3>${base.name} (${base.letter})</h3>
          <div class="city-tag">🔗 Pairs only with ${BASES[base.pair].name} (${base.pair})</div>
          <p class="description">${base.desc}</p>
          <div class="fun-fact">
            <strong>Fun fact</strong>
            ${base.fact}
          </div>
        `;
        $('#dna-pct').textContent = `${state.basesSeen.size}/4`;
        $('#dna-bar').style.width = `${(state.basesSeen.size / 4) * 100}%`;
      }

      function renderDnaShare() {
        const wrap = $('#dna-share-chart');
        if (!wrap) return;
        wrap.innerHTML = DNA_SHARE.map(item => `
          <div class="share-row ${item.kind || ''}">
            <span class="label"><span class="ic">${item.icon}</span>${item.name}</span>
            <span class="bar-track"><span class="bar-fill" data-pct="${item.pct}"></span></span>
            <span class="pct-num">${item.pct}%</span>
          </div>
        `).join('');
        // Animate bars in
        setTimeout(() => {
          $$('.bar-fill', wrap).forEach(b => { b.style.width = b.dataset.pct + '%'; });
        }, 150);
      }
