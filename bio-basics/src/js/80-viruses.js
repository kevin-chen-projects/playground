      const VIRUSES_QUIZ = [
        { q: 'Is a virus alive?',
          options: [
            'Yes — it has DNA so it counts as life',
            'No — it has no cells, no metabolism, and can\'t reproduce on its own',
            'Yes — it can infect cells',
            'It\'s alive only when inside a host'
          ],
          correct: 1,
          why: 'Right — most biologists put viruses just outside the definition of life. They\'re packaged genetic instructions that need a host to do anything.',
          wrongHint: 'A protein-wrapped genome with no metabolism and no cell — does that match the usual definition of life?' },
        { q: 'Why do flu vaccines change every year?',
          options: [
            'Vaccines wear out after 12 months',
            'Flu is an RNA virus and its sloppy copy enzyme creates new variants quickly',
            'Doctors want repeat business',
            'Each year is randomly assigned a different vaccine'
          ],
          correct: 1,
          why: 'Right — flu\'s RNA-copying enzyme makes errors fast, so surface proteins drift each year.',
          wrongHint: 'Flu is an RNA virus. What did the module say about RNA virus mutation rates?' },
        { q: 'What determines which cells a virus can infect?',
          options: [
            'The virus\'s size',
            'Whether the virus has DNA or RNA',
            'Whether the surface keys (spike proteins) fit the cell\'s receptors',
            'How fast the virus moves'
          ],
          correct: 2,
          why: 'Right — viruses need a key that fits the cell\'s lock. Different viruses target different cell types.',
          wrongHint: 'The metaphor was keys and locks. What determines which doors a key opens?' },
        { q: 'What is a retrovirus?',
          options: [
            'A virus from the 1970s',
            'A virus that reverse-transcribes its RNA into DNA and inserts it into the host genome',
            'A virus that infects bacteria',
            'A virus made of DNA only'
          ],
          correct: 1,
          why: 'Right — retroviruses (HIV) reverse the usual flow: RNA → DNA → permanent inclusion in the host genome.',
          wrongHint: '"Retro" hints at running things backward. What flows backward compared to the central dogma?' },
        { q: 'Roughly how many viruses are there on Earth?',
          options: [
            'A few billion',
            'About 100 quadrillion',
            'More than 10³¹ (more than stars in the universe)',
            'A few thousand'
          ],
          correct: 2,
          why: 'Right — viruses outnumber stars by a lot. The most numerous biological entity on the planet.',
          wrongHint: 'It\'s a comparison-to-stars hook for a reason. The number is enormous.' },
      ];

      const VIRUS_STAGES = [
        { id: 'attach',   name: '1. Attach',    icon: '🔌',
          detail: 'The virus floats around until its surface keys randomly meet matching receptors on a host cell. This determines tissue specificity — flu hits lung cells; HIV hits T-cells.' },
        { id: 'enter',    name: '2. Enter',     icon: '🚪',
          detail: 'The virus gets inside. Sometimes engulfed by the cell; sometimes the viral envelope fuses with the cell membrane. Either way: the genome is now in the cell.' },
        { id: 'replicate', name: '3. Replicate', icon: '🧬',
          detail: 'The viral genome takes over. It uses the cell\'s ribosomes to make viral proteins and either the cell\'s machinery (DNA viruses) or its own enzyme (RNA viruses) to copy the genome hundreds of times.' },
        { id: 'assemble', name: '4. Assemble',  icon: '🧱',
          detail: 'Freshly-made viral proteins and copied genomes self-assemble into new virus particles. A remarkable molecular self-assembly — no glue, no instructions needed.' },
        { id: 'release',  name: '5. Release',   icon: '💥',
          detail: 'Hundreds of new virus particles burst out. Some lyse the cell (killing it); others bud through the membrane. Each released particle restarts the cycle.' },
      ];

      function virusesHookSVG() {
        return `
          <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="400" fill="#efe6ff" rx="20"/>
            <g transform="translate(200 200)">
              <circle r="80" fill="#a78bfa" stroke="#6d4ae0" stroke-width="3"/>
              <g stroke="#6d4ae0" stroke-width="4" stroke-linecap="round">
                <line x1="0" y1="-80" x2="0" y2="-110"/>
                <line x1="80" y1="0" x2="110" y2="0"/>
                <line x1="0" y1="80" x2="0" y2="110"/>
                <line x1="-80" y1="0" x2="-110" y2="0"/>
                <line x1="57" y1="-57" x2="78" y2="-78"/>
                <line x1="-57" y1="-57" x2="-78" y2="-78"/>
                <line x1="57" y1="57" x2="78" y2="78"/>
                <line x1="-57" y1="57" x2="-78" y2="78"/>
              </g>
              <g fill="#ffd23f">
                <circle cx="0" cy="-110" r="6"/>
                <circle cx="110" cy="0" r="6"/>
                <circle cx="0" cy="110" r="6"/>
                <circle cx="-110" cy="0" r="6"/>
                <circle cx="78" cy="-78" r="6"/>
                <circle cx="-78" cy="-78" r="6"/>
                <circle cx="78" cy="78" r="6"/>
                <circle cx="-78" cy="78" r="6"/>
              </g>
              <path d="M -30 -10 Q -10 20 10 -10 Q 30 20 50 -10" fill="none" stroke="#fff8ec" stroke-width="3"/>
            </g>
            <text x="200" y="50" font-size="14" font-family="ui-rounded, sans-serif" font-weight="700" fill="#1a1f36" text-anchor="middle">Virus particle</text>
            <text x="200" y="68" font-size="11" font-family="ui-rounded, sans-serif" fill="#6d7592" text-anchor="middle">Capsid (purple) + spikes (gold) + genome (white)</text>
          </svg>
        `;
      }

      function renderVirusesHook() {
        const stage = $('#viruses-hook-stage');
        if (stage) stage.innerHTML = virusesHookSVG();
      }

      function renderVirusStages() {
        const grid = $('#virus-stages');
        const detail = $('#virus-stage-detail');
        if (!grid) return;
        grid.innerHTML = VIRUS_STAGES.map(s => `
          <button class="stage-card" data-id="${s.id}">
            <div class="stage-icon">${s.icon}</div>
            <div class="stage-name">${s.name}</div>
          </button>
        `).join('');
        grid.querySelectorAll('.stage-card').forEach(btn => {
          btn.addEventListener('click', () => {
            grid.querySelectorAll('.stage-card').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const s = VIRUS_STAGES.find(x => x.id === btn.dataset.id);
            if (s && detail) {
              detail.innerHTML = `<strong>${s.icon} ${s.name}</strong><p style="margin-top: 6px;">${s.detail}</p>`;
            }
          });
        });
      }
