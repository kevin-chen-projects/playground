      const IMMUNE_QUIZ = [
        { q: 'What\'s the key difference between innate and adaptive immunity?',
          options: [
            'Innate is faster but has no memory; adaptive is slower but precise and remembers',
            'Innate is precise; adaptive is generalist',
            'Adaptive is born with you; innate is acquired',
            'They are the same thing'
          ],
          correct: 0,
          why: 'Right — innate = fast, generalist, no memory. Adaptive = slow, precise, remembers.',
          wrongHint: 'Think of innate as the bouncer and adaptive as the detective.' },
        { q: 'What do B-cells produce?',
          options: ['Killer cells', 'Antibodies', 'Mucus', 'Red blood cells'],
          correct: 1,
          why: 'Right — B-cells multiply and pump out antibodies.',
          wrongHint: 'Y-shaped proteins that latch onto invaders.' },
        { q: 'What do killer T-cells do?',
          options: [
            'Produce antibodies',
            'Identify and destroy your own cells that have been infected',
            'Form scabs',
            'Carry oxygen'
          ],
          correct: 1,
          why: 'Right — killer T-cells destroy host cells with a virus inside.',
          wrongHint: 'For intracellular threats. Kill the infected cell to stop the spread.' },
        { q: 'Why does the immune system "remember" after fighting an infection?',
          options: [
            'It writes notes',
            'Memory B-cells and T-cells from the first fight stick around for years',
            'It doesn\'t — every infection feels like the first',
            'Antibodies last forever in the blood'
          ],
          correct: 1,
          why: 'Right — some lymphocytes become memory cells waiting silently for years.',
          wrongHint: 'The cells themselves stick around.' },
        { q: 'How does the body have cells that recognize any possible invader?',
          options: [
            'It has one cell type that matches everything',
            'Each B- and T-cell randomly shuffles gene segments to create a unique receptor',
            'It is taught by the parent before birth',
            'Cells receive instructions from the brain'
          ],
          correct: 1,
          why: 'Right — random genetic recombination generates ~1 billion different receptors.',
          wrongHint: 'A billion different receptors generated how?' },
      ];

      const IMMUNE_INNATE = [
        { name: 'Skin &amp; mucus', icon: '🪨', desc: 'Physical barrier. Most pathogens never get in.' },
        { name: 'Macrophages', icon: '🍽️', desc: 'Big eaters. Engulf and digest invaders. Send chemical alarms.' },
        { name: 'Neutrophils', icon: '🚨', desc: 'Fast first responders. Numerous in blood. Short-lived.' },
        { name: 'Natural killer cells', icon: '⚔️', desc: 'Detect "missing self" — cells that don\'t look right. Trigger self-destruct.' },
        { name: 'Fever &amp; inflammation', icon: '🔥', desc: 'Raised temperature slows pathogens; inflammation brings more immune cells.' },
        { name: 'Complement proteins', icon: '🧪', desc: 'Blood proteins that punch holes in bacterial membranes.' },
      ];
      const IMMUNE_ADAPTIVE = [
        { name: 'B-cells (antibody factories)', icon: '📤', desc: 'When activated, pump out millions of antibody molecules tuned to one specific invader.' },
        { name: 'Helper T-cells', icon: '📡', desc: 'Coordinate B-cells and killer T-cells. HIV destroys these — that\'s why it\'s so dangerous.' },
        { name: 'Killer T-cells', icon: '🗡️', desc: 'Find and destroy your own cells showing signs of viral infection.' },
        { name: 'Memory B-cells', icon: '📚', desc: 'After a fight, stay behind. Carry the antibody recipe for years to decades.' },
        { name: 'Memory T-cells', icon: '🧠', desc: 'Same idea, T-cell side. Ready to spring into action if the same enemy returns.' },
        { name: 'Dendritic cells', icon: '🚌', desc: 'Bridge from innate to adaptive. Present invaders to T-cells in the lymph nodes.' },
      ];

      function immuneHookSVG() {
        return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="#d6ecff" rx="20"/><g transform="translate(200 200)"><circle r="100" fill="none" stroke="#5fb8ff" stroke-width="3" stroke-dasharray="4 4"/></g><g fill="#5fb8ff" opacity="0.85"><circle cx="150" cy="170" r="12"/><circle cx="240" cy="160" r="14"/><circle cx="190" cy="230" r="13"/><circle cx="225" cy="220" r="11"/><circle cx="170" cy="200" r="10"/></g><g fill="#ff7878"><circle cx="80" cy="90" r="7"/><circle cx="320" cy="110" r="6"/><circle cx="350" cy="280" r="8"/><circle cx="60" cy="320" r="7"/><circle cx="100" cy="350" r="6"/><circle cx="330" cy="340" r="7"/></g><text x="200" y="60" font-size="13" font-family="ui-rounded, sans-serif" font-weight="700" fill="#1a1f36" text-anchor="middle">Blue: immune cells inside · Red: pathogens outside</text></svg>`;
      }

      function renderImmuneHook() {
        const stage = $('#immune-hook-stage');
        if (stage) stage.innerHTML = immuneHookSVG();
      }

      function renderImmuneToggle() {
        const toggle = $('#immune-toggle');
        const cellsEl = $('#immune-cells');
        const explainEl = $('#immune-explain');
        function show(layer) {
          const cells = layer === 'innate' ? IMMUNE_INNATE : IMMUNE_ADAPTIVE;
          if (cellsEl) {
            cellsEl.innerHTML = cells.map(c => `<div class="immune-cell"><div class="immune-cell-icon">${c.icon}</div><div class="immune-cell-name">${c.name}</div><div class="immune-cell-desc">${c.desc}</div></div>`).join('');
          }
          if (explainEl) {
            explainEl.innerHTML = layer === 'innate'
              ? '<strong>Innate immunity</strong> — fast and general-purpose. Active within minutes. No memory.'
              : '<strong>Adaptive immunity</strong> — slower (days to weeks) but exquisitely specific. Memory cells let next response be hours.';
          }
        }
        if (toggle) {
          toggle.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
              toggle.querySelectorAll('button').forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              show(btn.dataset.layer);
            });
          });
        }
        show('innate');
      }
