      const CRISPR_QUIZ = [
        { q: 'Where did CRISPR originally come from?',
          options: [
            'It was invented by scientists in 2012',
            'It evolved in bacteria as defense against viruses, ~2 billion years ago',
            'It was discovered in human DNA',
            'It came from an asteroid'
          ],
          correct: 1,
          why: 'Right — bacteria use CRISPR to chop up invading virus DNA. Humans only learned to use it in 2012.',
          wrongHint: 'Bacteria had it first. Humans only learned to harness it recently.' },
        { q: 'What does the guide RNA do in CRISPR?',
          options: [
            'Cuts the DNA',
            'Tells Cas9 exactly where on the genome to cut',
            'Repairs the DNA after the cut',
            'Powers the cell'
          ],
          correct: 1,
          why: 'Right — guide RNA is the GPS. Cas9 is the scissors. The guide tells the scissors where.',
          wrongHint: 'Targeting vs cutting are separate jobs. Which job is "where"?' },
        { q: 'What happens AFTER CRISPR cuts the DNA?',
          options: [
            'The cell dies',
            'The cell\'s normal repair machinery glues the DNA back together — sometimes imperfectly',
            'The cut DNA disappears',
            'The cell becomes cancerous'
          ],
          correct: 1,
          why: 'Right — the cell\'s repair pathways create the edit. Imperfect repair = disrupted gene.',
          wrongHint: 'The cell tries to fix the break. The "fix" is what changes the gene.' },
        { q: 'What was the first CRISPR therapy approved by the FDA (2023)?',
          options: ['Cancer treatment', 'Sickle cell disease and β-thalassemia', 'Inherited blindness', 'Heart disease'],
          correct: 1,
          why: 'Right — sickle cell + β-thalassemia. CRISPR reactivates a silenced fetal hemoglobin gene.',
          wrongHint: 'A blood disease caused by a single specific mutation in hemoglobin.' },
        { q: 'Why is editing germline cells controversial?',
          options: [
            'It\'s technically impossible',
            'Edits in germline cells pass to all future descendants — a permanent change to the human gene pool',
            'It costs too much',
            'Only one country can do it'
          ],
          correct: 1,
          why: 'Right — germline edits are heritable forever. Ethics, safety, oversight unresolved.',
          wrongHint: 'What\'s different about a sperm/egg edit vs a body cell edit, in terms of who gets affected?' },
      ];

      const CRISPR_STAGES = [
        { id: 'design',  name: '1. Design guide RNA',  icon: '🎯',
          detail: 'Pick the gene you want to edit. Look up its DNA sequence. Design a 20-nucleotide guide RNA matching a 20-bp window inside the gene. Synthesize it.' },
        { id: 'deliver', name: '2. Deliver into cell', icon: '🚚',
          detail: 'Get the guide RNA + Cas9 protein into the target cell. Methods: lipid nanoparticles, viral vectors, electroporation, or ex-vivo editing.' },
        { id: 'find',    name: '3. Find the target',   icon: '🔍',
          detail: 'Inside the cell, Cas9 grabs the guide RNA and scans the genome for matching DNA. When it finds a 20-bp match, it locks on.' },
        { id: 'cut',     name: '4. Cut the DNA',       icon: '✂️',
          detail: 'Cas9 cuts BOTH strands of the DNA helix at the target. The genome is now broken — and that triggers an alarm in the cell.' },
        { id: 'repair',  name: '5. Cell repairs',      icon: '🔧',
          detail: 'The cell tries to fix the break. Either by error-prone end-joining (which usually disrupts the gene — useful if you want to knock it out) or by precise template-based repair (if you supplied a template).' },
      ];

      function crisprHookSVG() {
        return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="#dcf7e9" rx="20"/><g transform="translate(200 200)"><path d="M -100 -40 Q -50 -80 0 -40 T 100 -40" fill="none" stroke="#a78bfa" stroke-width="5"/><path d="M -100 40 Q -50 80 0 40 T 100 40" fill="none" stroke="#a78bfa" stroke-width="5"/><g stroke="#a78bfa" stroke-width="2"><line x1="-90" y1="-30" x2="-90" y2="30"/><line x1="-60" y1="-50" x2="-60" y2="50"/><line x1="-30" y1="-35" x2="-30" y2="35"/><line x1="0" y1="-30" x2="0" y2="30"/><line x1="30" y1="-35" x2="30" y2="35"/><line x1="60" y1="-50" x2="60" y2="50"/><line x1="90" y1="-30" x2="90" y2="30"/></g><g transform="translate(15 0)"><circle r="22" fill="#ff7878" stroke="#c84a4a" stroke-width="2"/><text y="6" font-size="20" text-anchor="middle">✂</text></g></g><text x="200" y="50" font-size="13" font-family="ui-rounded, sans-serif" font-weight="700" fill="#1a1f36" text-anchor="middle">CRISPR-Cas9</text><text x="200" y="68" font-size="11" font-family="ui-rounded, sans-serif" fill="#6d7592" text-anchor="middle">Molecular scissors aimed at a specific DNA target</text></svg>`;
      }

      function renderCrisprHook() {
        const stage = $('#crispr-hook-stage');
        if (stage) stage.innerHTML = crisprHookSVG();
      }

      function renderCrisprStages() {
        const grid = $('#crispr-stages');
        const detail = $('#crispr-stage-detail');
        if (!grid) return;
        grid.innerHTML = CRISPR_STAGES.map(s => `<button class="stage-card" data-id="${s.id}"><div class="stage-icon">${s.icon}</div><div class="stage-name">${s.name}</div></button>`).join('');
        grid.querySelectorAll('.stage-card').forEach(btn => {
          btn.addEventListener('click', () => {
            grid.querySelectorAll('.stage-card').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const s = CRISPR_STAGES.find(x => x.id === btn.dataset.id);
            if (s && detail) {
              detail.innerHTML = `<strong>${s.icon} ${s.name}</strong><p style="margin-top: 6px;">${s.detail}</p>`;
            }
          });
        });
      }
