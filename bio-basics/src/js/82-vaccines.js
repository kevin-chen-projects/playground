      const VACCINES_QUIZ = [
        { q: 'What does a vaccine actually do?',
          options: [
            'Kills the virus inside your body if you\'re already infected',
            'Shows your immune system a fake invader so memory cells are ready before the real one arrives',
            'Boosts your overall energy levels',
            'Cleans your blood of toxins'
          ],
          correct: 1,
          why: 'Right — vaccines are practice fights. The real value is the memory cells left over after.',
          wrongHint: 'Think about what you learned in the immune module. What\'s special about a second encounter?' },
        { q: 'Why do some vaccines need boosters?',
          options: [
            'They wear off in the bloodstream after a few weeks',
            'Memory cell populations slowly decline over years, so a booster re-primes them',
            'Doctors want extra visits',
            'Boosters are only for kids'
          ],
          correct: 1,
          why: 'Right — memory wanes over years. A booster re-primes the immune response.',
          wrongHint: 'It\'s about the memory cells, not the vaccine itself.' },
        { q: 'What is herd immunity?',
          options: [
            'When animals get vaccinated',
            'When enough of a population is immune that the pathogen can\'t find new hosts to spread',
            'A vaccine made from cattle',
            'When everyone gets sick at once'
          ],
          correct: 1,
          why: 'Right — break the chain of transmission. Pathogen runs out of susceptible targets.',
          wrongHint: '"Herd" = group. Think transmission chains.' },
        { q: 'Why does measles need ~95% of people vaccinated for herd immunity, while flu only needs ~25%?',
          options: [
            'Measles vaccines are less effective',
            'Measles has a much higher R₀ (basic reproduction number) — it\'s far more contagious',
            'Flu spreads through water; measles through air',
            'Measles infects more cells per person'
          ],
          correct: 1,
          why: 'Right — R₀ drives the herd threshold. Measles R₀ ≈ 15–20. Flu R₀ ≈ 1.3.',
          wrongHint: 'The math: threshold = 1 − 1/R₀. Higher R₀ → higher threshold needed.' },
        { q: 'Who benefits most from high vaccination rates besides yourself?',
          options: [
            'No one — vaccines only protect the recipient',
            'People who can\'t be vaccinated (newborns, chemo patients, immunocompromised)',
            'Only doctors and nurses',
            'Only people in cities'
          ],
          correct: 1,
          why: 'Right — herd immunity protects those who can\'t be vaccinated. That\'s the moral case.',
          wrongHint: 'The chain of transmission breaks for everyone — including those who can\'t protect themselves directly.' },
      ];

      const VACCINE_TYPES = [
        { id: 'live',     name: 'Live-attenuated', icon: '🌱',
          detail: 'Weakened live version of the pathogen. Strong, long-lasting immunity (often one dose is enough). Can\'t be given to immunocompromised people. Examples: MMR, chickenpox, yellow fever.' },
        { id: 'inactive', name: 'Inactivated',     icon: '🚫',
          detail: 'The actual pathogen, killed with heat/chemicals. Safe for everyone, but immune response is weaker — usually needs boosters. Examples: polio (Salk), rabies, flu shot.' },
        { id: 'subunit',  name: 'Subunit / recombinant', icon: '🧩',
          detail: 'Just one piece of the pathogen — usually a surface protein. Very safe (can\'t cause disease). Examples: hepatitis B, HPV, pertussis component of DTaP.' },
        { id: 'mrna',     name: 'mRNA',            icon: '📜',
          detail: 'You\'re given mRNA coding for one viral protein; your own cells make the protein for ~24h, your immune system sees it and learns. The big COVID-vaccine breakthrough. Fast to design.' },
        { id: 'vector',   name: 'Viral vector',    icon: '📦',
          detail: 'A harmless virus (like an adenovirus) is engineered to carry the gene for the target protein. Your cells make the protein, immune system reacts. Examples: AstraZeneca COVID, Ebola.' },
      ];

      function vaccinesHookSVG() {
        return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="#fff3c2" rx="20"/><g transform="translate(200 200)"><rect x="-110" y="-12" width="180" height="24" rx="4" fill="#ffd23f" stroke="#b88a00" stroke-width="2"/><rect x="-130" y="-20" width="22" height="40" rx="3" fill="#b88a00"/><polygon points="70,-3 110,0 70,3" fill="#b88a00"/><line x1="115" y1="0" x2="145" y2="0" stroke="#b88a00" stroke-width="2"/></g><text x="200" y="60" font-size="14" font-family="ui-rounded, sans-serif" font-weight="700" fill="#1a1f36" text-anchor="middle">Vaccine = training material</text><text x="200" y="78" font-size="11" font-family="ui-rounded, sans-serif" fill="#6d7592" text-anchor="middle">Shows the immune system a fake invader</text></svg>`;
      }

      function renderVaccinesHook() {
        const stage = $('#vaccines-hook-stage');
        if (stage) stage.innerHTML = vaccinesHookSVG();
      }

      function renderVaccineTypes() {
        const grid = $('#vaccine-types');
        const detail = $('#vaccine-detail');
        if (!grid) return;
        grid.innerHTML = VACCINE_TYPES.map(t => `<button class="stage-card" data-id="${t.id}"><div class="stage-icon">${t.icon}</div><div class="stage-name">${t.name}</div></button>`).join('');
        grid.querySelectorAll('.stage-card').forEach(btn => {
          btn.addEventListener('click', () => {
            grid.querySelectorAll('.stage-card').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const t = VACCINE_TYPES.find(x => x.id === btn.dataset.id);
            if (t && detail) {
              detail.innerHTML = `<strong>${t.icon} ${t.name}</strong><p style="margin-top: 6px;">${t.detail}</p>`;
            }
          });
        });
      }
