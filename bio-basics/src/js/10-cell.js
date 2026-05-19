      // =====================================================================
      // SVG factories
      // =====================================================================

      // Big animated cell for the landing hero
      function heroCellSVG() {
        return `
          <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-label="Animated cell illustration">
            <defs>
              <radialGradient id="hero-membrane" cx="35%" cy="35%">
                <stop offset="0%" stop-color="#dcf7e9"/>
                <stop offset="65%" stop-color="#8fe9c4"/>
                <stop offset="100%" stop-color="#4cd9a8"/>
              </radialGradient>
              <radialGradient id="hero-nucleus" cx="40%" cy="40%">
                <stop offset="0%" stop-color="#efe6ff"/>
                <stop offset="80%" stop-color="#a78bfa"/>
                <stop offset="100%" stop-color="#8b5cf6"/>
              </radialGradient>
            </defs>
            <g style="transform-origin: 200px 200px; animation: pulse 6s ease-in-out infinite;">
              <ellipse cx="200" cy="200" rx="170" ry="155" fill="url(#hero-membrane)" stroke="#22c896" stroke-width="3"/>
              <!-- Mitochondria -->
              <g style="transform-origin: center; animation: glow 4s ease-in-out infinite;">
                <ellipse cx="80" cy="140" rx="28" ry="14" fill="#ff7878" transform="rotate(-25 80 140)"/>
                <ellipse cx="320" cy="170" rx="32" ry="15" fill="#ff7878" transform="rotate(20 320 170)"/>
                <ellipse cx="100" cy="290" rx="26" ry="13" fill="#ff9a9a" transform="rotate(15 100 290)"/>
              </g>
              <!-- Ribosomes -->
              <g fill="#ffc73d">
                <circle cx="120" cy="100" r="4"/><circle cx="280" cy="110" r="3.5"/>
                <circle cx="150" cy="80" r="3"/><circle cx="100" cy="200" r="3.5"/>
                <circle cx="310" cy="240" r="4"/><circle cx="300" cy="290" r="3"/>
                <circle cx="180" cy="320" r="3.5"/><circle cx="240" cy="320" r="3"/>
                <circle cx="80" cy="240" r="3"/><circle cx="340" cy="200" r="3"/>
              </g>
              <!-- Nucleus -->
              <circle cx="200" cy="200" r="62" fill="url(#hero-nucleus)" stroke="#8b5cf6" stroke-width="2.5"/>
              <!-- DNA inside nucleus -->
              <g style="transform-origin: 200px 200px; animation: dnaWiggle 3.5s ease-in-out infinite;">
                <path d="M 168 200 Q 184 180, 200 200 T 232 200" stroke="#8b5cf6" stroke-width="3" fill="none" stroke-linecap="round"/>
                <path d="M 168 200 Q 184 220, 200 200 T 232 200" stroke="#8b5cf6" stroke-width="3" fill="none" stroke-linecap="round"/>
                <line x1="174" y1="195" x2="174" y2="205" stroke="#8b5cf6" stroke-width="2"/>
                <line x1="184" y1="187" x2="184" y2="213" stroke="#8b5cf6" stroke-width="2"/>
                <line x1="200" y1="184" x2="200" y2="216" stroke="#8b5cf6" stroke-width="2"/>
                <line x1="216" y1="187" x2="216" y2="213" stroke="#8b5cf6" stroke-width="2"/>
                <line x1="226" y1="195" x2="226" y2="205" stroke="#8b5cf6" stroke-width="2"/>
              </g>
              <!-- Cytoplasm sparkles -->
              <g fill="#5fb8ff" opacity="0.5">
                <circle cx="60" cy="180" r="2"/><circle cx="350" cy="130" r="2"/>
                <circle cx="130" cy="260" r="2"/><circle cx="260" cy="80" r="2"/>
                <circle cx="290" cy="300" r="2"/>
              </g>
            </g>
          </svg>
        `;
      }

      // Smaller breathing cell for the hook scene
      function hookCellSVG() {
        return heroCellSVG().replace('aria-label="Animated cell illustration"',
                                     'aria-label="Pulsing cell"');
      }

      // Big interactive cell for the tour scene — has cell-part hit groups
      function tourCellSVG() {
        return `
          <svg viewBox="0 0 600 510" xmlns="http://www.w3.org/2000/svg" aria-label="Interactive cell diagram">
            <defs>
              <radialGradient id="tour-membrane" cx="35%" cy="35%">
                <stop offset="0%" stop-color="#ecfbf3"/>
                <stop offset="60%" stop-color="#b9f0d9"/>
                <stop offset="100%" stop-color="#8fe9c4"/>
              </radialGradient>
              <radialGradient id="tour-nucleus" cx="40%" cy="40%">
                <stop offset="0%" stop-color="#efe6ff"/>
                <stop offset="80%" stop-color="#a78bfa"/>
                <stop offset="100%" stop-color="#8b5cf6"/>
              </radialGradient>
              <radialGradient id="tour-mito" cx="40%" cy="40%">
                <stop offset="0%" stop-color="#ffd3d3"/>
                <stop offset="100%" stop-color="#ff7878"/>
              </radialGradient>
            </defs>

            <!-- Cytoplasm + membrane group -->
            <g class="cell-part" data-part="cytoplasm">
              <ellipse cx="300" cy="255" rx="260" ry="225" fill="url(#tour-membrane)" stroke="transparent"/>
            </g>
            <g class="cell-part" data-part="membrane">
              <ellipse cx="300" cy="255" rx="260" ry="225" fill="none"
                       stroke="#22c896" stroke-width="6" stroke-dasharray="0"/>
              <ellipse cx="300" cy="255" rx="252" ry="217" fill="none"
                       stroke="#4cd9a8" stroke-width="2" stroke-dasharray="6 6" opacity="0.6"/>
            </g>

            <!-- Mitochondria group (3 beans) -->
            <g class="cell-part" data-part="mitochondria">
              <g transform="translate(135 175) rotate(-22)">
                <ellipse cx="0" cy="0" rx="48" ry="22" fill="url(#tour-mito)"/>
                <path d="M -38 0 Q -28 -10, -18 0 Q -8 10, 2 0 Q 12 -10, 22 0 Q 32 10, 42 0"
                      stroke="#ee5a5a" stroke-width="2" fill="none" opacity="0.7"/>
              </g>
              <g transform="translate(470 220) rotate(18)">
                <ellipse cx="0" cy="0" rx="52" ry="23" fill="url(#tour-mito)"/>
                <path d="M -42 0 Q -32 -10, -22 0 Q -12 10, -2 0 Q 8 -10, 18 0 Q 28 10, 38 0 Q 48 -8, 50 0"
                      stroke="#ee5a5a" stroke-width="2" fill="none" opacity="0.7"/>
              </g>
              <g transform="translate(160 380) rotate(12)">
                <ellipse cx="0" cy="0" rx="44" ry="20" fill="url(#tour-mito)"/>
                <path d="M -36 0 Q -26 -10, -16 0 Q -6 10, 4 0 Q 14 -10, 24 0 Q 34 8, 36 0"
                      stroke="#ee5a5a" stroke-width="2" fill="none" opacity="0.7"/>
              </g>
            </g>

            <!-- Ribosomes (lots of dots) -->
            <g class="cell-part" data-part="ribosomes" fill="#ffc73d">
              <circle cx="200" cy="120" r="5"/><circle cx="240" cy="95"  r="4"/>
              <circle cx="395" cy="120" r="5"/><circle cx="430" cy="155" r="4"/>
              <circle cx="115" cy="290" r="4"/><circle cx="95"  cy="345" r="5"/>
              <circle cx="475" cy="345" r="5"/><circle cx="500" cy="290" r="4"/>
              <circle cx="265" cy="430" r="5"/><circle cx="335" cy="430" r="4"/>
              <circle cx="180" cy="105" r="3"/><circle cx="410" cy="380" r="3.5"/>
              <circle cx="510" cy="240" r="3"/><circle cx="100" cy="220" r="3.5"/>
              <circle cx="225" cy="400" r="3"/><circle cx="380" cy="400" r="3"/>
            </g>

            <!-- Nucleus -->
            <g class="cell-part" data-part="nucleus">
              <circle cx="300" cy="245" r="95" fill="url(#tour-nucleus)" stroke="#8b5cf6" stroke-width="3"/>
              <g style="transform-origin: 300px 245px; animation: dnaWiggle 4s ease-in-out infinite;">
                <path d="M 245 245 Q 270 220, 300 245 T 355 245" stroke="#8b5cf6" stroke-width="3.5" fill="none" stroke-linecap="round"/>
                <path d="M 245 245 Q 270 270, 300 245 T 355 245" stroke="#8b5cf6" stroke-width="3.5" fill="none" stroke-linecap="round"/>
                <line x1="255" y1="237" x2="255" y2="253" stroke="#8b5cf6" stroke-width="2.2"/>
                <line x1="270" y1="225" x2="270" y2="265" stroke="#8b5cf6" stroke-width="2.2"/>
                <line x1="285" y1="220" x2="285" y2="270" stroke="#8b5cf6" stroke-width="2.2"/>
                <line x1="300" y1="218" x2="300" y2="272" stroke="#8b5cf6" stroke-width="2.2"/>
                <line x1="315" y1="220" x2="315" y2="270" stroke="#8b5cf6" stroke-width="2.2"/>
                <line x1="330" y1="225" x2="330" y2="265" stroke="#8b5cf6" stroke-width="2.2"/>
                <line x1="345" y1="237" x2="345" y2="253" stroke="#8b5cf6" stroke-width="2.2"/>
              </g>
              <!-- nucleolus -->
              <circle cx="320" cy="225" r="14" fill="#8b5cf6" opacity="0.5"/>
            </g>

            <!-- Labels (small text near each part) -->
            <g font-family="ui-rounded, sans-serif" font-size="13" font-weight="600" fill="#404763" pointer-events="none">
              <text x="300" y="80" text-anchor="middle">Cell membrane</text>
              <text x="300" y="245" text-anchor="middle" fill="#8b5cf6" font-size="14">Nucleus</text>
              <text x="135" y="222" text-anchor="middle" fill="#ee5a5a">Mitochondrion</text>
              <text x="200" y="145" text-anchor="middle" fill="#b88a00">Ribosomes</text>
              <text x="510" y="445" text-anchor="middle">Cytoplasm</text>
            </g>
          </svg>
        `;
      }

      // Animal/plant comparison — base = animal cell, .plant-only adds plant features
      function compareCellSVG() {
        return `
          <svg viewBox="0 0 720 460" xmlns="http://www.w3.org/2000/svg" aria-label="Animal vs plant cell">
            <defs>
              <radialGradient id="cmp-membrane" cx="35%" cy="35%">
                <stop offset="0%" stop-color="#ecfbf3"/>
                <stop offset="65%" stop-color="#b9f0d9"/>
                <stop offset="100%" stop-color="#8fe9c4"/>
              </radialGradient>
              <radialGradient id="cmp-nuc" cx="40%" cy="40%">
                <stop offset="0%" stop-color="#efe6ff"/>
                <stop offset="80%" stop-color="#a78bfa"/>
                <stop offset="100%" stop-color="#8b5cf6"/>
              </radialGradient>
              <radialGradient id="cmp-vac" cx="35%" cy="35%">
                <stop offset="0%" stop-color="#d6ecff"/>
                <stop offset="100%" stop-color="#a8d6ff"/>
              </radialGradient>
              <radialGradient id="cmp-chloro" cx="35%" cy="35%">
                <stop offset="0%" stop-color="#b9f0d9"/>
                <stop offset="100%" stop-color="#22c896"/>
              </radialGradient>
            </defs>
            <!-- Plant-only cell wall -->
            <g class="plant-only">
              <rect x="20" y="40" width="680" height="380" rx="28" fill="none" stroke="#b88a00" stroke-width="6" stroke-dasharray="14 6"/>
              <rect x="32" y="52" width="656" height="356" rx="22" fill="none" stroke="#ffd566" stroke-width="2"/>
            </g>

            <!-- Plant-only big vacuole behind everything -->
            <g class="plant-only">
              <ellipse cx="380" cy="240" rx="240" ry="160" fill="url(#cmp-vac)" opacity="0.55"/>
              <text x="380" y="385" text-anchor="middle" font-family="ui-rounded, sans-serif" font-size="13" font-weight="600" fill="#3a7bc4">Big vacuole</text>
            </g>

            <!-- Membrane / cytoplasm -->
            <ellipse cx="360" cy="230" rx="320" ry="195" fill="url(#cmp-membrane)" stroke="#22c896" stroke-width="5"/>

            <!-- Mitochondria (both have them) -->
            <g>
              <ellipse cx="160" cy="160" rx="36" ry="16" fill="#ff7878" transform="rotate(-22 160 160)"/>
              <ellipse cx="560" cy="180" rx="38" ry="17" fill="#ff7878" transform="rotate(20 560 180)"/>
              <ellipse cx="180" cy="330" rx="34" ry="15" fill="#ff9a9a" transform="rotate(12 180 330)"/>
            </g>

            <!-- Ribosomes -->
            <g fill="#ffc73d">
              <circle cx="240" cy="120" r="4"/><circle cx="290" cy="100" r="3.5"/>
              <circle cx="470" cy="115" r="4"/><circle cx="510" cy="140" r="3.5"/>
              <circle cx="150" cy="280" r="3.5"/><circle cx="120" cy="320" r="4"/>
              <circle cx="580" cy="320" r="4"/><circle cx="600" cy="270" r="3.5"/>
              <circle cx="320" cy="380" r="4"/><circle cx="400" cy="385" r="3.5"/>
            </g>

            <!-- Nucleus -->
            <circle cx="360" cy="220" r="78" fill="url(#cmp-nuc)" stroke="#8b5cf6" stroke-width="3"/>
            <circle cx="380" cy="200" r="11" fill="#8b5cf6" opacity="0.5"/>

            <!-- Plant-only chloroplasts -->
            <g class="plant-only">
              <ellipse cx="100" cy="240" rx="30" ry="18" fill="url(#cmp-chloro)" stroke="#18a87a" stroke-width="2" transform="rotate(-25 100 240)"/>
              <ellipse cx="640" cy="240" rx="32" ry="18" fill="url(#cmp-chloro)" stroke="#18a87a" stroke-width="2" transform="rotate(20 640 240)"/>
              <ellipse cx="500" cy="370" rx="28" ry="16" fill="url(#cmp-chloro)" stroke="#18a87a" stroke-width="2" transform="rotate(8 500 370)"/>
              <text x="100" y="280" text-anchor="middle" font-family="ui-rounded, sans-serif" font-size="12" font-weight="600" fill="#18a87a">Chloroplast</text>
            </g>

            <!-- Animal-only label (square-ish round shape hint) -->
            <g class="animal-only" pointer-events="none">
              <text x="360" y="430" text-anchor="middle" font-family="ui-rounded, sans-serif" font-size="13" font-weight="600" fill="#6d7592">
                Animal cell — round, no walls or chloroplasts
              </text>
            </g>
            <g class="plant-only" pointer-events="none">
              <text x="360" y="445" text-anchor="middle" font-family="ui-rounded, sans-serif" font-size="13" font-weight="700" fill="#18a87a">
                Plant cell — boxy, with wall, chloroplasts, and big vacuole
              </text>
            </g>
          </svg>
        `;
      }

      // =====================================================================
      // Cell parts info (used by tour sidebar)
      // =====================================================================
      const PARTS = {
        membrane: {
          icon: '🦠',
          tint: 'var(--leaf-100)',
          name: 'Cell membrane',
          city: 'The city walls',
          description: 'A flexible double layer of fat (lipids) wrapping the whole cell. It decides what gets in and out — like a smart, picky door system. Without it, the cell\'s contents would just leak everywhere.',
          fact: 'It\'s only 2 molecules thick, but covers every cell in your body.',
        },
        nucleus: {
          icon: '📚',
          tint: 'var(--grape-100)',
          name: 'Nucleus',
          city: 'The library',
          description: 'The control center. It holds your DNA — the complete instructions for building everything the cell makes. The nucleus is wrapped in its own little membrane to keep the DNA safe.',
          fact: 'If you stretched the DNA from one cell\'s nucleus, it would be about 2 meters long.',
        },
        mitochondria: {
          icon: '⚡',
          tint: 'var(--coral-100)',
          name: 'Mitochondria',
          city: 'The power plants',
          description: 'These bean-shaped organelles take in food (sugars) and oxygen and turn them into ATP — the cell\'s energy currency. Cells that need lots of energy (like muscle and heart cells) have hundreds of them.',
          fact: 'Mitochondria used to be free-living bacteria! They got "adopted" by ancient cells billions of years ago.',
        },
        ribosomes: {
          icon: '🏭',
          tint: 'var(--sun-100)',
          name: 'Ribosomes',
          city: 'The factories',
          description: 'Tiny machines that read instructions copied from the nucleus and assemble proteins, one amino-acid bead at a time. A single cell has millions of them.',
          fact: 'A ribosome can build a protein in seconds. They never stop working while a cell is alive.',
        },
        cytoplasm: {
          icon: '💧',
          tint: 'var(--sky-100)',
          name: 'Cytoplasm',
          city: 'The neighborhoods',
          description: 'The jelly-like fluid that fills the cell. Everything floats and works inside it — proteins, nutrients, organelles. It\'s mostly water, plus dissolved salts, sugars, and proteins.',
          fact: 'About 70% of every cell — and therefore about 70% of you — is just water.',
        },
      };

      // =====================================================================
      // Quiz
      // =====================================================================
      const QUIZ = [
        {
          q: 'About how many cells are in your body right now?',
          options: ['37 thousand', '37 million', '37 billion', '37 trillion'],
          correct: 3,
          why: 'Yes — about 37 trillion. (Trillion with a T. You contain a small galaxy.)',
          wrongHint: 'Think bigger. Way bigger. Trillion-with-a-T territory.',
        },
        {
          q: 'Which part of the cell stores the instructions (DNA)?',
          options: ['Mitochondria', 'Nucleus', 'Ribosomes', 'Cell membrane'],
          correct: 1,
          why: 'Right! The nucleus is the cell\'s library. All the recipes are kept there.',
          wrongHint: 'Remember the city analogy — which building is the library?',
        },
        {
          q: 'Mitochondria are best described as:',
          options: ['Trash cans', 'Walls', 'Power plants', 'Roads'],
          correct: 2,
          why: 'Exactly. They turn food into usable energy (ATP) for the cell.',
          wrongHint: 'Think energy. What in a real city makes the power?',
        },
        {
          q: 'Which of these does a plant cell have that an animal cell does NOT?',
          options: ['Nucleus', 'Mitochondria', 'Cell membrane', 'Cell wall'],
          correct: 3,
          why: 'Yep — the cell wall. It\'s the stiff outer layer that lets plants stand tall.',
          wrongHint: 'Both animal and plant cells have most parts. Only one of these is plant-only.',
        },
        {
          q: 'True or false: every living thing — bacteria, mushrooms, oak trees, you — is made of cells.',
          options: ['True', 'False'],
          correct: 0,
          why: 'True! It\'s called cell theory, and it\'s one of the foundational ideas of biology.',
          wrongHint: 'Think about it — can you name anything alive that isn\'t made of cells?',
        },
      ];

      // =====================================================================
      // QUIZZES — modules 2-5
      // =====================================================================
