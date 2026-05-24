      const DISEASE_QUIZ = [
        { q: 'What is cancer at its core?',
          options: [
            'An infection caused by an external pathogen',
            'A cell that has accumulated mutations causing it to grow without limits',
            'A vitamin deficiency that weakens tissues',
            'A buildup of toxins in the bloodstream'
          ],
          correct: 1,
          why: 'Right — cancer is your own cell going rogue after enough mutations to ignore growth limits.',
          wrongHint: 'It comes from inside, not from a pathogen. Think about what the recipes control.' },
        { q: 'Which of these is NOT one of the four broken rules of a cancer cell?',
          options: [
            'Grows without permission',
            'Refuses to die',
            'Builds its own blood supply',
            'Becomes resistant to all antibiotics'
          ],
          correct: 3,
          why: 'Right — antibiotic resistance is a bacterial thing, not a cancer thing. The other three are real hallmarks.',
          wrongHint: 'Three of these are about defying the body\'s growth rules. One is about microbes.' },
        { q: 'What is the difference between an oncogene and a tumor suppressor when it comes to mutations?',
          options: [
            'Oncogenes need both copies broken to cause cancer; tumor suppressors need only one',
            'Tumor suppressors need both copies broken to cause cancer; oncogenes need only one',
            'Both types need both copies broken',
            'Neither type is involved in cancer'
          ],
          correct: 1,
          why: 'Right — oncogenes are gas pedals (one stuck-on copy is enough). Tumor suppressors are brakes (both copies must fail). The "two-hit rule".',
          wrongHint: 'Think gas pedal vs brakes. One stuck pedal is enough; both brake lines must fail.' },
        { q: 'Why is p53 called "the guardian of the genome"?',
          options: [
            'It physically wraps DNA to protect it',
            'It detects DNA damage and either pauses the cell to fix it or orders self-destruction',
            'It is the most common gene in all cells',
            'It is found only in immune cells'
          ],
          correct: 1,
          why: 'Right — p53 surveys for damage and decides whether to repair or order apoptosis. About half of all cancers have a broken p53.',
          wrongHint: 'It\'s a watchman. Its job involves a decision after detecting something wrong.' },
        { q: 'True or false: most cancers come from a single mutation.',
          options: ['True', 'False'],
          correct: 1,
          why: 'False — cancer almost always requires multiple mutations stacked over time (usually 5-10+). That\'s why cancer risk rises with age.',
          wrongHint: 'One mutation rarely does it. Think about why cancer is more common in older people.' },
      ];

      const HALLMARKS = [
        { id: 'growth', icon: '📈', name: 'Sustained growth signaling',
          detail: 'Normal cells wait for "grow" signals from neighbors. Cancer cells produce their own growth signals or get stuck thinking they\'ve received one. Like a thermostat that thinks it\'s always cold.' },
        { id: 'evade-growth', icon: '🚫', name: 'Evading growth suppressors',
          detail: 'Normal cells stop dividing when they get "stop" signals (crowding, hormone shifts). Cancer cells turn off the receivers for those signals. The brakes are disconnected.' },
        { id: 'evade-death', icon: '⏳', name: 'Resisting cell death',
          detail: 'Cells with bad DNA are normally ordered to self-destruct (apoptosis). Cancer cells break that command pathway and stay alive even with broken machinery.' },
        { id: 'immortality', icon: '♾️', name: 'Replicative immortality',
          detail: 'Normal cells can only divide 40–60 times before their chromosome tips (telomeres) get too short. Cancer cells reactivate an enzyme (telomerase) that rebuilds the tips — so they can divide forever.' },
        { id: 'blood', icon: '🩸', name: 'Inducing blood vessels',
          detail: 'Growing tumors need oxygen and nutrients. They release chemical signals that trick the body into sprouting new blood vessels straight into the tumor (angiogenesis).' },
        { id: 'spread', icon: '🚀', name: 'Invasion &amp; metastasis',
          detail: 'In late-stage cancer, cells break free from the original tumor, ride the bloodstream, and seed new tumors elsewhere. Most cancer deaths come from metastasis, not the original tumor.' },
      ];

      function diseaseHookSVG() {
        return `
          <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-label="Cancer cells multiplying">
            <!-- background tissue -->
            <rect width="400" height="400" fill="#ffe8e8" rx="20"/>
            <!-- normal cells (grid of small circles) -->
            <g fill="#dcf7e9" stroke="#22c896" stroke-width="2">
              <circle cx="60"  cy="60"  r="22"/>
              <circle cx="120" cy="60"  r="22"/>
              <circle cx="180" cy="60"  r="22"/>
              <circle cx="60"  cy="120" r="22"/>
              <circle cx="60"  cy="180" r="22"/>
              <circle cx="340" cy="60"  r="22"/>
              <circle cx="340" cy="120" r="22"/>
              <circle cx="340" cy="180" r="22"/>
              <circle cx="60"  cy="340" r="22"/>
              <circle cx="340" cy="340" r="22"/>
              <circle cx="180" cy="340" r="22"/>
            </g>
            <!-- tumor: cluster of misshapen cells -->
            <g fill="#ff7878" stroke="#c84a4a" stroke-width="2">
              <ellipse cx="180" cy="180" rx="50" ry="42"/>
              <ellipse cx="220" cy="160" rx="34" ry="28"/>
              <ellipse cx="160" cy="220" rx="30" ry="36"/>
              <ellipse cx="230" cy="210" rx="26" ry="24"/>
              <ellipse cx="200" cy="240" rx="22" ry="20"/>
            </g>
            <text x="200" y="60" font-size="14" font-family="ui-rounded, sans-serif" font-weight="700" fill="#1a1f36" text-anchor="middle">Healthy tissue</text>
            <text x="200" y="80" font-size="11" font-family="ui-rounded, sans-serif" fill="#6d7592" text-anchor="middle">+ tumor in the middle</text>
          </svg>
        `;
      }

      function renderDiseaseHook() {
        const stage = $('#disease-hook-stage');
        if (stage) stage.innerHTML = diseaseHookSVG();
      }

      function renderHallmarks() {
        const grid = $('#hallmark-grid');
        const detail = $('#hallmark-detail');
        if (!grid) return;
        grid.innerHTML = HALLMARKS.map(h => `
          <button class="hallmark-card" data-id="${h.id}">
            <div class="hallmark-icon">${h.icon}</div>
            <div class="hallmark-name">${h.name}</div>
          </button>
        `).join('');
        grid.querySelectorAll('.hallmark-card').forEach(btn => {
          btn.addEventListener('click', () => {
            grid.querySelectorAll('.hallmark-card').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const h = HALLMARKS.find(x => x.id === btn.dataset.id);
            if (h && detail) {
              detail.innerHTML = `<strong>${h.icon} ${h.name}</strong><p style="margin-top: 6px;">${h.detail}</p>`;
            }
          });
        });
      }
