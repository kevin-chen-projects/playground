      const REG_QUIZ = [
        { q: 'A brain cell and a skin cell in your body have:',
          options: [
            'Different DNA',
            'The same DNA, but different active genes',
            'The same DNA and the same active genes',
            'No DNA in the skin cell'
          ],
          correct: 1,
          why: 'Right — same DNA, different active genes. That\'s the whole trick of cell specialization.',
          wrongHint: 'The DNA is identical. The difference is which switches are flipped.' },
        { q: 'About how many genes does a typical human cell have ON at any moment?',
          options: ['~20', '~200', 'A few thousand', 'All 20,000'],
          correct: 2,
          why: 'Yep — a few thousand. Out of ~20,000 total. Different cell types pick different subsets.',
          wrongHint: 'Way more than a handful, but way less than all of them.' },
        { q: 'What are transcription factors?',
          options: [
            'Tools to count how fast mRNA is made',
            'Proteins that turn genes on or off',
            'Bacteria that infect cells',
            'A type of vitamin'
          ],
          correct: 1,
          why: 'Right — they\'re proteins whose job is to bind DNA and decide which genes get copied.',
          wrongHint: 'They\'re proteins. They\'re regulators. The clue is in the word "factor".' },
        { q: 'Which of these can change which genes are active in your cells right now?',
          options: ['Food you eat', 'Sleep', 'Stress', 'All of the above'],
          correct: 3,
          why: 'All of them. Your DNA stays fixed, but your body is constantly tuning which genes are on.',
          wrongHint: 'Think about it — all of these are real signals your body responds to.' },
        { q: 'True or false: your DNA alone determines exactly who you are.',
          options: ['True', 'False'],
          correct: 1,
          why: 'False — your DNA gives you possibilities. Environment, choices, and timing all shape what actually happens.',
          wrongHint: 'Remember: same DNA, very different cells. Context matters a lot.' },
      ];

      // =====================================================================
      // MODULE 5 — REGULATION: data + SVG + renderers
      // =====================================================================

      const GENES = [
        { id: 'ACTB',  name: 'Actin',       on: ['muscle', 'all'] },
        { id: 'MYH7',  name: 'Myosin',      on: ['muscle'] },
        { id: 'MAP2',  name: 'MAP2',        on: ['brain'] },
        { id: 'NEFM',  name: 'Neurofil.',   on: ['brain'] },
        { id: 'KRT5',  name: 'Keratin 5',   on: ['skin'] },
        { id: 'KRT14', name: 'Keratin 14',  on: ['skin'] },
        { id: 'ALB',   name: 'Albumin',     on: ['liver'] },
        { id: 'CYP3A', name: 'CYP3A4',      on: ['liver'] },
        { id: 'INS',   name: 'Insulin',     on: [] },
        { id: 'HBB',   name: 'Hemoglobin',  on: [] },
        { id: 'OPN1',  name: 'Opsin',       on: [] },
        { id: 'GAPDH', name: 'GAPDH',       on: ['all'] },
        { id: 'TUBA1', name: 'Tubulin',     on: ['all'] },
        { id: 'TP53',  name: 'p53',         on: ['all'] },
        { id: 'NANOG', name: 'NANOG',       on: [] },
        { id: 'OCT4',  name: 'OCT4',        on: [] },
        { id: 'GLUT4', name: 'GLUT4',       on: ['muscle'] },
        { id: 'SYP',   name: 'Synapsin',    on: ['brain'] },
        { id: 'COL1',  name: 'Collagen',    on: ['skin'] },
        { id: 'ALDOB', name: 'Aldolase B',  on: ['liver'] },
      ];

      const CELL_TYPE_INFO = {
        brain:  { name: 'Brain cell (neuron)',
          explain: 'Neurons turn ON genes for long branches (MAP2, neurofilament), synaptic connections (synapsin), and basic housekeeping. Muscle, skin, and liver-specific genes stay OFF.' },
        muscle: { name: 'Muscle cell',
          explain: 'Muscle cells turn ON stretchy-fiber genes (actin, myosin), glucose import (GLUT4), and housekeeping. Brain, skin, and liver-specific genes stay OFF.' },
        skin:   { name: 'Skin cell (keratinocyte)',
          explain: 'Skin cells turn ON keratin (the tough protein in nails and hair), collagen, and housekeeping genes. Muscle, brain, and liver genes stay OFF.' },
        liver:  { name: 'Liver cell (hepatocyte)',
          explain: 'Liver cells turn ON detox enzymes (CYP3A4), albumin (a major blood protein), aldolase B (sugar metabolism), and housekeeping. Muscle, brain, and skin genes stay OFF.' },
      };

      function regHookSVG() {
        return `
          <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-label="Same DNA, different cell types">
            <!-- Brain cell on left -->
            <g transform="translate(110 200)">
              <line x1="-60" y1="0" x2="-110" y2="-90" stroke="#a78bfa" stroke-width="3" stroke-linecap="round"/>
              <line x1="-50" y1="-25" x2="-100" y2="-30" stroke="#a78bfa" stroke-width="3" stroke-linecap="round"/>
              <line x1="-50" y1="25" x2="-100" y2="40" stroke="#a78bfa" stroke-width="3" stroke-linecap="round"/>
              <line x1="60" y1="0" x2="110" y2="-90" stroke="#a78bfa" stroke-width="3" stroke-linecap="round"/>
              <line x1="50" y1="25" x2="100" y2="50" stroke="#a78bfa" stroke-width="3" stroke-linecap="round"/>
              <line x1="0" y1="60" x2="-15" y2="160" stroke="#a78bfa" stroke-width="3" stroke-linecap="round"/>
              <circle r="55" fill="#efe6ff" stroke="#a78bfa" stroke-width="3"/>
              <text x="0" y="6" font-size="36" text-anchor="middle">🧠</text>
              <text x="0" y="200" font-size="13" font-family="ui-rounded, sans-serif" font-weight="700" fill="#404763" text-anchor="middle">Brain cell</text>
            </g>
            <!-- Skin cell on right (boxy) -->
            <g transform="translate(290 200)">
              <rect x="-60" y="-50" width="120" height="100" rx="12" fill="#dcf7e9" stroke="#22c896" stroke-width="3"/>
              <rect x="-52" y="-42" width="104" height="84" rx="6" fill="none" stroke="#8fe9c4" stroke-width="2" stroke-dasharray="4 3"/>
              <text x="0" y="14" font-size="36" text-anchor="middle">🛡️</text>
              <text x="0" y="80" font-size="13" font-family="ui-rounded, sans-serif" font-weight="700" fill="#404763" text-anchor="middle">Skin cell</text>
            </g>
            <!-- "SAME DNA" tag in middle -->
            <g>
              <line x1="170" y1="200" x2="230" y2="200" stroke="#ffc73d" stroke-width="3" stroke-dasharray="5 4"/>
              <rect x="155" y="178" width="90" height="44" rx="22" fill="#fff3c2" stroke="#ffc73d" stroke-width="2"/>
              <text x="200" y="194" font-size="10" font-family="ui-rounded, sans-serif" font-weight="800" fill="#b88a00" text-anchor="middle">SAME</text>
              <text x="200" y="210" font-size="10" font-family="ui-rounded, sans-serif" font-weight="800" fill="#b88a00" text-anchor="middle">DNA</text>
            </g>
            <text x="200" y="60" font-size="14" font-family="ui-rounded, sans-serif" font-weight="700" fill="#1a1f36" text-anchor="middle">Two cells, one genome</text>
            <text x="200" y="80" font-size="12" font-family="ui-rounded, sans-serif" font-weight="500" fill="#6d7592" text-anchor="middle">Different switches flipped</text>
          </svg>
        `;
      }

      function renderRegHook() {
        const stage = $('#reg-hook-stage');
        if (stage) stage.innerHTML = regHookSVG();
      }

      function renderCelltypeToggle() {
        state.cellType = 'brain';
        applyCellType('brain');
        $$('.celltype-toggle button').forEach(btn => {
          btn.addEventListener('click', () => {
            $$('.celltype-toggle button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyCellType(btn.dataset.type);
          });
        });
      }

      function applyCellType(type) {
        state.cellType = type;
        const grid = $('#gene-grid');
        if (!grid) return;
        grid.innerHTML = GENES.map(g => {
          const isOn = g.on.includes(type) || g.on.includes('all');
          return `
            <div class="gene-cell ${isOn ? 'on' : ''}" data-id="${g.id}">
              ${g.id}
              <span class="gene-name">${g.name}</span>
            </div>
          `;
        }).join('');
        const info = CELL_TYPE_INFO[type];
        const explain = $('#celltype-explain');
        if (explain) {
          explain.innerHTML = `<strong>${info.name}</strong> — ${info.explain}`;
        }
      }
