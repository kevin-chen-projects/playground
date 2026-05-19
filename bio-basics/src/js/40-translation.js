      const TRANSL_QUIZ = [
        { q: 'How many mRNA letters does it take to specify ONE amino acid?',
          options: ['1', '2', '3', '4'],
          correct: 2,
          why: 'Right — 3. Each 3-letter "word" of mRNA is called a codon, and it picks one amino acid.',
          wrongHint: 'It\'s a small number. Codons are 3-letter words.' },
        { q: 'About how many different amino acids are used to build proteins in your body?',
          options: ['4', '20', '64', '20,000'],
          correct: 1,
          why: 'Yes — about 20. They chain together in different orders to make every protein in you.',
          wrongHint: 'It\'s more than DNA letters but fewer than codons.' },
        { q: 'What does tRNA do?',
          options: [
            'Stores DNA',
            'Cuts DNA',
            'Delivers amino acids to the ribosome',
            'Makes more ribosomes'
          ],
          correct: 2,
          why: 'Exactly — tRNA is the delivery truck. Each one carries an amino acid that matches a specific codon.',
          wrongHint: 'It has "transfer" in the name. Think delivery.' },
        { q: 'Where does translation happen?',
          options: ['Inside the nucleus', 'On the ribosome', 'On the cell membrane', 'Inside mitochondria'],
          correct: 1,
          why: 'Right — translation happens at the ribosome. mRNA threads through it; amino acids snap together on top.',
          wrongHint: 'Think of the assembly line. Where do proteins get built?' },
        { q: 'What happens AFTER the amino acid chain is built?',
          options: [
            'It\'s erased',
            'It folds into a 3D shape',
            'It turns back into DNA',
            'It leaves the cell'
          ],
          correct: 1,
          why: 'Yes — the chain folds into a 3D shape. That shape is what makes the protein actually do its job.',
          wrongHint: 'A flat string can\'t do much. Proteins have to take a specific shape.' },
      ];

      // =====================================================================
      // MODULE 4 — TRANSLATION: data + SVG + renderers
      // =====================================================================

      const AA_NAMES = {
        Phe: 'Phenylalanine', Leu: 'Leucine',  Ile: 'Isoleucine',  Met: 'Methionine',
        Val: 'Valine',        Ser: 'Serine',   Pro: 'Proline',     Thr: 'Threonine',
        Ala: 'Alanine',       Tyr: 'Tyrosine', His: 'Histidine',   Gln: 'Glutamine',
        Asn: 'Asparagine',    Lys: 'Lysine',   Asp: 'Aspartic acid', Glu: 'Glutamic acid',
        Cys: 'Cysteine',      Trp: 'Tryptophan', Arg: 'Arginine',  Gly: 'Glycine',
      };

      const AA_COLORS = {
        Met: '#ffd23f', Phe: '#ff7878', Leu: '#ff9a9a', Ile: '#a78bfa',
        Val: '#c2adff', Ser: '#5fb8ff', Pro: '#a8d6ff', Thr: '#22c896',
        Ala: '#4cd9a8', Tyr: '#ee5a5a', His: '#8fe9c4', Gln: '#ffc73d',
        Asn: '#ffe082', Lys: '#fadf66', Asp: '#cdb8ff', Glu: '#b9a3ff',
        Cys: '#d6ecff', Trp: '#dcf7e9', Arg: '#ffb6b6', Gly: '#ffe0e0',
      };

      const CODON_BY_AA = {
        Phe: ['UUU','UUC'],
        Leu: ['UUA','UUG','CUU','CUC','CUA','CUG'],
        Ile: ['AUU','AUC','AUA'],
        Met: ['AUG'],
        Val: ['GUU','GUC','GUA','GUG'],
        Ser: ['UCU','UCC','UCA','UCG','AGU','AGC'],
        Pro: ['CCU','CCC','CCA','CCG'],
        Thr: ['ACU','ACC','ACA','ACG'],
        Ala: ['GCU','GCC','GCA','GCG'],
        Tyr: ['UAU','UAC'],
        His: ['CAU','CAC'],
        Gln: ['CAA','CAG'],
        Asn: ['AAU','AAC'],
        Lys: ['AAA','AAG'],
        Asp: ['GAU','GAC'],
        Glu: ['GAA','GAG'],
        Cys: ['UGU','UGC'],
        Trp: ['UGG'],
        Arg: ['CGU','CGC','CGA','CGG','AGA','AGG'],
        Gly: ['GGU','GGC','GGA','GGG'],
        STOP:['UAA','UAG','UGA'],
      };

      const CODON_TABLE = (() => {
        const t = {};
        Object.entries(CODON_BY_AA).forEach(([aa, codons]) => {
          codons.forEach(c => {
            t[c] = {
              codon: c,
              aa,
              name: aa === 'STOP' ? 'STOP' : (AA_NAMES[aa] || aa),
              isStart: c === 'AUG',
              isStop: aa === 'STOP',
            };
          });
        });
        return t;
      })();

      const CODON_DESCRIPTIONS = {
        Met: 'The "start" codon — every protein begins with methionine.',
        STOP: 'A stop codon. No amino acid is added; the ribosome lets go and the protein is finished.',
        Phe: 'Hydrophobic — likes to fold into the inside of a protein.',
        Leu: 'The most common amino acid in human proteins.',
        Lys: 'Positively charged. Often on protein surfaces, water-friendly.',
        Cys: 'Forms disulfide bridges that lock 3D protein shapes in place.',
        Gly: 'The smallest amino acid — gives proteins flexibility at hinges.',
        Pro: 'Has a kinked shape. Often where proteins bend or turn.',
        Trp: 'The biggest amino acid. Rare, but visually distinctive — used to find proteins on instruments.',
        Tyr: 'Has a benzene ring. Common at protein "active sites" where chemistry happens.',
      };

      const TRANSL_DATA = {
        // start codon, then 6 amino acids, then stop
        mrna: 'AUG' + 'GCU' + 'ACG' + 'GUG' + 'AAU' + 'CCG' + 'UAC' + 'UAA',
      };
      TRANSL_DATA.codons = [];
      for (let i = 0; i < TRANSL_DATA.mrna.length; i += 3) {
        TRANSL_DATA.codons.push(TRANSL_DATA.mrna.slice(i, i + 3));
      }

      // Translation hook — cute ribosome with growing chain
      function translHookSVG() {
        return `
          <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-label="Ribosome translating mRNA">
            <circle cx="200" cy="200" r="180" fill="#fff5f5"/>
            <path d="M 30,220 L 370,220" stroke="#5fb8ff" stroke-width="6" stroke-linecap="round"/>
            <g font-family="ui-monospace, monospace" font-size="13" font-weight="700" fill="#2270b8">
              <text x="60" y="216" text-anchor="middle">A</text>
              <text x="80" y="216" text-anchor="middle">U</text>
              <text x="100" y="216" text-anchor="middle">G</text>
              <text x="120" y="216" text-anchor="middle">C</text>
              <text x="140" y="216" text-anchor="middle">G</text>
              <text x="160" y="216" text-anchor="middle">U</text>
              <text x="240" y="216" text-anchor="middle">A</text>
              <text x="260" y="216" text-anchor="middle">C</text>
              <text x="280" y="216" text-anchor="middle">C</text>
              <text x="300" y="216" text-anchor="middle">A</text>
              <text x="320" y="216" text-anchor="middle">A</text>
              <text x="340" y="216" text-anchor="middle">U</text>
            </g>
            <g style="transform-origin: 200px 195px; animation: pulse 4s ease-in-out infinite;">
              <ellipse cx="200" cy="170" rx="80" ry="55" fill="#9aa3b8" stroke="#6d7592" stroke-width="3"/>
              <ellipse cx="200" cy="225" rx="80" ry="35" fill="#cdd2dc" stroke="#9aa3b8" stroke-width="3"/>
              <text x="200" y="200" font-size="11" font-family="ui-rounded, sans-serif" font-weight="700" fill="#404763" text-anchor="middle">RIBOSOME</text>
            </g>
            <g style="transform-origin: 200px 100px; animation: drift 4s ease-in-out infinite;">
              <line x1="200" y1="115" x2="200" y2="55" stroke="#cdd2dc" stroke-width="2"/>
              <circle cx="200" cy="100" r="14" fill="#ffd23f" stroke="white" stroke-width="2"/>
              <circle cx="190" cy="80" r="14" fill="#ff7878" stroke="white" stroke-width="2"/>
              <circle cx="208" cy="60" r="14" fill="#a78bfa" stroke="white" stroke-width="2"/>
              <circle cx="195" cy="40" r="14" fill="#22c896" stroke="white" stroke-width="2"/>
              <text x="240" y="60" font-size="12" font-family="ui-rounded, sans-serif" font-weight="700" fill="#404763">protein</text>
              <text x="240" y="76" font-size="12" font-family="ui-rounded, sans-serif" font-weight="700" fill="#404763">chain</text>
            </g>
            <g style="animation: drift 5s ease-in-out infinite reverse;">
              <path d="M 305 290 L 305 250 L 275 240 L 275 280 Z" fill="#fff3c2" stroke="#ffc73d" stroke-width="2.5"/>
              <circle cx="290" cy="225" r="11" fill="#ff9a9a" stroke="white" stroke-width="2"/>
              <text x="290" y="320" font-size="11" font-family="ui-rounded, sans-serif" font-weight="700" fill="#b88a00" text-anchor="middle">tRNA</text>
            </g>
          </svg>
        `;
      }

      // Translation stage — ribosome sliding along mRNA
      function translStageSVG() {
        const codons = TRANSL_DATA.codons;
        const startX = 60, endX = 540, baseY = 200;
        const codonW = (endX - startX) / codons.length;
        let codonHTML = '';
        codons.forEach((c, i) => {
          const cx = startX + i * codonW + codonW / 2;
          const ct = CODON_TABLE[c];
          codonHTML += `
            <g class="codon-block" data-i="${i}">
              <rect x="${startX + i * codonW + 4}" y="${baseY - 16}" width="${codonW - 8}" height="32" rx="6"
                    fill="${ct.isStop ? 'var(--coral-100)' : ct.isStart ? 'var(--sun-100)' : 'var(--sky-100)'}"
                    stroke="${ct.isStop ? 'var(--coral-500)' : ct.isStart ? 'var(--sun-500)' : 'var(--sky-500)'}"
                    stroke-width="2"/>
              <text x="${cx}" y="${baseY + 5}" font-size="13" font-family="ui-monospace, monospace" font-weight="700"
                    fill="#404763" text-anchor="middle">${c}</text>
            </g>
          `;
        });
        return `
          <svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" aria-label="Ribosome translating mRNA">
            <rect x="0" y="0" width="600" height="360" fill="#fef6e8"/>
            <line x1="${startX - 30}" y1="${baseY}" x2="${endX + 30}" y2="${baseY}" stroke="#5fb8ff" stroke-width="4"/>
            ${codonHTML}
            <g class="ribosome" id="ribosome">
              <ellipse cx="0" cy="-30" rx="60" ry="46" fill="#9aa3b8" stroke="#6d7592" stroke-width="3"/>
              <ellipse cx="0" cy="22" rx="60" ry="32" fill="#cdd2dc" stroke="#9aa3b8" stroke-width="3"/>
              <text x="0" y="-2" font-size="10" font-family="ui-rounded, sans-serif" font-weight="700"
                    fill="#404763" text-anchor="middle">RIBOSOME</text>
            </g>
            <g class="protein-chain" id="protein-chain"></g>
            <g class="trna-arrival" id="trna-arrival"></g>
          </svg>
        `;
      }

      function renderTranslHook() {
        const stage = $('#transl-hook-stage');
        if (stage) stage.innerHTML = translHookSVG();
      }

      function renderTransl() {
        state.translAnim = { pos: 0, playing: false, intervalId: null };
        $('#transl-stage').innerHTML = translStageSVG();
        positionRibosome();
        updateTranslReadout();
        const playBtn = $('#transl-play');
        const stepBtn = $('#transl-step');
        const resetBtn = $('#transl-reset');
        if (playBtn) playBtn.onclick = togglePlayTransl;
        if (stepBtn) stepBtn.onclick = stepTransl;
        if (resetBtn) resetBtn.onclick = resetTransl;
      }

      function positionRibosome() {
        const ribo = $('#ribosome');
        if (!ribo) return;
        const codons = TRANSL_DATA.codons;
        const startX = 60, endX = 540;
        const codonW = (endX - startX) / codons.length;
        const pos = state.translAnim.pos;
        const x = startX + Math.max(0, pos - 1) * codonW + codonW / 2;
        ribo.setAttribute('transform', `translate(${x} 200)`);

        // Protein chain emerging upward
        const chain = $('#protein-chain');
        let chainHTML = '';
        const chainBaseX = x;
        const chainStartY = 145;
        const aaCircleR = 13;
        for (let i = 0; i < pos; i++) {
          const c = codons[i];
          const ct = CODON_TABLE[c];
          if (!ct || ct.isStop) continue;
          const yi = chainStartY - (i * 24);
          const xi = chainBaseX + (i % 2 === 0 ? -8 : 8);
          chainHTML += `
            ${i > 0 ? `<line x1="${chainBaseX + ((i-1) % 2 === 0 ? -8 : 8)}" y1="${chainStartY - ((i-1) * 24)}" x2="${xi}" y2="${yi}" stroke="#cdd2dc" stroke-width="2"/>` : `<line x1="${chainBaseX}" y1="155" x2="${xi}" y2="${yi}" stroke="#cdd2dc" stroke-width="2"/>`}
            <circle cx="${xi}" cy="${yi}" r="${aaCircleR}" fill="${AA_COLORS[ct.aa] || 'var(--sun-300)'}" stroke="white" stroke-width="2"/>
            <text x="${xi}" y="${yi + 4}" font-size="9" font-family="ui-rounded, sans-serif" font-weight="800"
                  fill="#404763" text-anchor="middle">${ct.aa[0]}</text>
          `;
        }
        chain.innerHTML = chainHTML;

        // tRNA arrival animation — only during play and current codon isn't stop
        const trna = $('#trna-arrival');
        if (trna) {
          if (pos > 0 && pos <= codons.length) {
            const c = codons[pos - 1];
            const ct = CODON_TABLE[c];
            if (ct && !ct.isStop) {
              const tx = x + 30;
              const ty = 270;
              trna.innerHTML = `
                <path d="M ${tx} ${ty + 30} L ${tx} ${ty - 5} L ${tx - 25} ${ty - 15} L ${tx - 25} ${ty + 25} Z"
                      fill="#fff3c2" stroke="#ffc73d" stroke-width="2.5"/>
                <circle cx="${tx - 12}" cy="${ty - 30}" r="11" fill="${AA_COLORS[ct.aa]}" stroke="white" stroke-width="2"/>
                <text x="${tx - 12}" y="${ty - 26}" font-size="9" font-family="ui-rounded, sans-serif" font-weight="800"
                      fill="#404763" text-anchor="middle">${ct.aa[0]}</text>
              `;
            } else {
              trna.innerHTML = '';
            }
          } else {
            trna.innerHTML = '';
          }
        }
      }

      function updateTranslReadout() {
        const codons = TRANSL_DATA.codons;
        const pos = state.translAnim.pos;
        const mrnaHTML = codons.map((c, i) => {
          const cls = i === pos - 1 ? 'is-new' : '';
          const cellBg = i < pos ? 'background: var(--leaf-50); padding: 2px 4px; border-radius: 4px;' : '';
          return `<span style="display: inline-block; ${cellBg} margin-right: 4px;">${c.split('').map(b => `<span class="base ${b} ${cls}">${b}</span>`).join('')}</span>`;
        }).join('');
        const chainHTML = codons.slice(0, pos).map(c => {
          const ct = CODON_TABLE[c];
          if (!ct) return '';
          if (ct.isStop) return `<span style="display: inline-block; padding: 4px 10px; border-radius: 8px; background: var(--coral-100); color: var(--coral-600); font-weight: 700; font-family: var(--font-display); font-size: 0.85rem;">★ STOP</span>`;
          return `<span style="display: inline-block; padding: 4px 10px; border-radius: 8px; background: ${AA_COLORS[ct.aa] || 'var(--ink-100)'}; color: var(--ink-900); font-weight: 700; font-family: var(--font-display); font-size: 0.85rem;">${ct.aa}</span>`;
        }).join('<span style="display: inline-block; margin: 0 4px; color: var(--ink-300);">—</span>');
        const out = $('#transl-readout');
        if (out) {
          out.innerHTML = `
            <div><span class="strand-label">mRNA →</span> ${mrnaHTML}</div>
            <div style="margin-top: 10px; line-height: 1.8;"><span class="strand-label">Protein →</span> ${chainHTML || '<span class="base placeholder">·</span>'}</div>
          `;
        }
        const posEl = $('#transl-pos'); if (posEl) posEl.textContent = pos;
        const lenEl = $('#transl-len'); if (lenEl) lenEl.textContent = codons.length;
        positionRibosome();
      }

      function stepTransl() {
        if (state.translAnim.pos < TRANSL_DATA.codons.length) {
          state.translAnim.pos++;
          updateTranslReadout();
        }
      }

      function togglePlayTransl() {
        const a = state.translAnim;
        const btn = $('#transl-play');
        if (a.playing) {
          clearInterval(a.intervalId);
          a.playing = false;
          if (btn) btn.innerHTML = '▶ Play';
        } else {
          if (a.pos >= TRANSL_DATA.codons.length) {
            a.pos = 0;
            updateTranslReadout();
          }
          a.playing = true;
          if (btn) btn.innerHTML = '⏸ Pause';
          a.intervalId = setInterval(() => {
            if (a.pos >= TRANSL_DATA.codons.length) {
              clearInterval(a.intervalId);
              a.playing = false;
              if (btn) btn.innerHTML = '↺ Play again';
              return;
            }
            stepTransl();
          }, 800);
        }
      }

      function resetTransl() {
        const a = state.translAnim;
        clearInterval(a.intervalId);
        state.translAnim = { pos: 0, playing: false, intervalId: null };
        updateTranslReadout();
        const btn = $('#transl-play');
        if (btn) btn.innerHTML = '▶ Play';
      }

      function renderCodonPicker() {
        const wrap = $('#codon-picker');
        if (!wrap) return;
        const codons = Object.keys(CODON_TABLE).sort();
        wrap.innerHTML = codons.map(c => {
          const t = CODON_TABLE[c];
          let cls = 'codon-cell';
          if (t.isStart) cls += ' start';
          if (t.isStop) cls += ' stop';
          return `<button class="${cls}" data-codon="${c}">${c}</button>`;
        }).join('');
        // Make sure result card exists right after picker
        let result = $('#codon-result');
        if (!result) {
          result = document.createElement('div');
          result.id = 'codon-result';
          result.className = 'codon-result empty';
          wrap.parentNode.insertBefore(result, wrap.nextSibling);
        }
        result.classList.add('empty');
        result.classList.remove('has-pick');
        result.innerHTML = `
          <div class="codon-big">···</div>
          <div>
            <div class="codon-aa-name">Click a codon to see its amino acid</div>
            <div class="codon-aa-desc">Notice which codons share an amino acid — that's a feature, not a bug.</div>
          </div>
        `;
        $$('.codon-cell', wrap).forEach(btn => {
          btn.addEventListener('click', () => selectCodon(btn.dataset.codon));
        });
      }

      function selectCodon(codon) {
        const t = CODON_TABLE[codon];
        if (!t) return;
        const sameAA = Object.entries(CODON_TABLE).filter(([_, v]) => v.aa === t.aa).map(([k]) => k);
        $$('.codon-cell').forEach(b => {
          b.classList.toggle('selected', sameAA.includes(b.dataset.codon));
        });
        const result = $('#codon-result');
        if (!result) return;
        result.classList.remove('empty');
        result.classList.add('has-pick');
        const isStop = t.isStop;
        const desc = CODON_DESCRIPTIONS[t.aa] || (isStop
          ? 'A stop codon — tells the ribosome the protein is done.'
          : 'One of the 20 standard amino acids. Used as a building block in proteins.');
        const bg = AA_COLORS[t.aa] || (isStop ? 'var(--coral-100)' : 'var(--leaf-100)');
        result.innerHTML = `
          <div class="codon-big" style="background: ${bg}; color: ${isStop ? 'var(--coral-600)' : 'var(--ink-900)'};">${codon}</div>
          <div>
            <div class="codon-aa-name">${t.name}${t.isStart ? ' (START)' : ''}${isStop ? '' : ` — ${t.aa}`}</div>
            <div class="codon-aa-desc">${desc} <strong>${sameAA.length}</strong> codon${sameAA.length > 1 ? 's' : ''} code${sameAA.length === 1 ? 's' : ''} for this${isStop ? ' stop signal' : ' amino acid'}.</div>
          </div>
        `;
      }
