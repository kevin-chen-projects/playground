
      // =====================================================================
      // Routing & rendering
      // =====================================================================
      function showView(name) {
        state.view = name;
        $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + name));
        renderBreadcrumb();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      function renderBreadcrumb() {
        const bc = $('#breadcrumb');
        if (state.view === 'landing') {
          bc.innerHTML = `<span class="crumb current">Home</span>`;
        } else {
          const mod = MODULES[state.activeModule];
          const name = mod ? mod.name : '...';
          bc.innerHTML = `
            <span class="crumb" data-go="home">Home</span>
            <span class="sep">/</span>
            <span class="crumb current">${name}</span>
          `;
          bc.querySelector('[data-go="home"]').onclick = () => goHome();
        }
      }

      function renderModuleHead() {
        const mod = MODULES[state.activeModule];
        if (!mod) return;
        $('#module-head').innerHTML = `
          <div class="module-title-row">
            <div class="module-icon" style="background: ${mod.iconBg};">${mod.icon}</div>
            <h1>${mod.name}</h1>
          </div>
          <p style="color: var(--ink-500); max-width: 640px;">${mod.intro}</p>
          <div class="progress-dots" id="progress-dots"></div>
        `;
      }

      function goHome() {
        // Stop any running animations
        clearInterval(state.transAnim.intervalId);
        clearInterval(state.translAnim.intervalId);
        state.transAnim.playing = false;
        state.translAnim.playing = false;
        renderCurriculum();
        showView('landing');
      }

      // ----- Landing render -----
      function renderCurriculum() {
        const wrap = $('#curriculum');
        wrap.innerHTML = CURRICULUM.map((m, i) => {
          const isUnlocked = m.status === 'unlocked';
          const isCompleted = !!state.completed[m.id];
          const cls = ['module-card',
                       isUnlocked ? 'unlocked' : 'locked',
                       isCompleted ? 'completed' : ''].join(' ');
          const badge = isCompleted ? 'Done ✓' : isUnlocked ? 'Start' : 'Soon';
          return `
            <div class="${cls}" data-mod="${m.id}">
              <div class="module-icon" style="background: ${m.color};">${m.icon}</div>
              <span class="badge">${badge}</span>
              <div class="name">${(i+1)}. ${m.name}</div>
              <div class="blurb">${m.blurb}</div>
              <div class="footer">
                <span>${isUnlocked ? '~10 min' : 'Coming soon'}</span>
                ${isUnlocked ? '<span class="arrow">→</span>' : ''}
              </div>
            </div>
          `;
        }).join('');
        $$('.module-card', wrap).forEach(card => {
          card.addEventListener('click', () => {
            const id = card.dataset.mod;
            const mod = CURRICULUM.find(x => x.id === id);
            if (mod && mod.status === 'unlocked') startModule(id);
          });
        });
      }

      function renderHero() {
        $('#hero-stage').insertAdjacentHTML('beforeend', heroCellSVG());
        $('#hook-stage').innerHTML = hookCellSVG();
      }

      // ----- Module render -----
      function renderProgressDots() {
        const dots = $('#progress-dots');
        dots.innerHTML = '';
        for (let i = 0; i < 6; i++) {
          const d = document.createElement('span');
          d.className = 'dot' + (i === state.sceneIndex ? ' active' :
                                 i < state.sceneIndex ? ' done' : '');
          d.dataset.scene = i;
          d.title = `Scene ${i + 1}`;
          d.addEventListener('click', () => {
            if (i <= state.sceneIndex) goToScene(i);
          });
          dots.appendChild(d);
        }
      }

      function startModule(id) {
        if (!MODULES[id]) return;
        // Reset per-module state
        state.activeModule = id;
        state.sceneIndex = 0;
        state.partsSeen = new Set();
        state.basesSeen = new Set();
        clearInterval(state.transAnim.intervalId);
        clearInterval(state.translAnim.intervalId);
        state.transAnim = { pos: 0, playing: false, intervalId: null };
        state.translAnim = { pos: 0, playing: false, intervalId: null };
        state.cellType = 'brain';
        state.mutPicker = null;
        state.mutApplied = null;
        state.quiz = { i: 0, correct: 0, locked: false, questions: [], cardSel: '#quiz-card' };

        // Show only the active module's section
        $$('.module-section').forEach(sec => {
          sec.hidden = (sec.dataset.module !== id);
          // reset .active scene class within each module to scene 0
          $$('.scene', sec).forEach(s => s.classList.remove('active'));
          const first = sec.querySelector('.scene[data-scene="0"]');
          if (first) first.classList.add('active');
        });

        showView('module');
        renderModuleHead();
        showScene(0);
      }

      function showScene(i) {
        state.sceneIndex = i;
        const section = $(`.module-section[data-module="${state.activeModule}"]`);
        if (!section) return;
        $$('.scene', section).forEach(s => s.classList.remove('active'));
        const scene = $(`.scene[data-scene="${i}"]`, section);
        if (scene) scene.classList.add('active');
        renderProgressDots();

        // Lazy render scene-specific content using module's renderers
        const renderers = (MODULES[state.activeModule] || {}).sceneRenderers || {};
        if (renderers[i]) renderers[i]();
        if (i === 5) markCompleted();

        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      function goToScene(i) {
        if (i < 0 || i > 5) return;
        showScene(i);
      }

      function nextScene() {
        if (state.sceneIndex < 5) showScene(state.sceneIndex + 1);
      }

      // ----- Scene 3: Tour wiring -----
      function renderTour() {
        const stage = $('#tour-stage');
        stage.innerHTML = tourCellSVG();
        const info = $('#tour-info');
        // Reset info
        info.innerHTML = `
          <div class="placeholder">
            <span class="hint-icon">👆</span>
            Tap any part of the cell to learn what it does.
          </div>`;
        info.classList.remove('has-active');
        $('#tour-pct').textContent = `${state.partsSeen.size}/5`;
        $('#tour-bar').style.width = `${(state.partsSeen.size / 5) * 100}%`;

        $$('.cell-part', stage).forEach(g => {
          g.addEventListener('click', () => selectPart(g.dataset.part));
        });
      }

      function selectPart(name) {
        const part = PARTS[name];
        if (!part) return;
        state.partsSeen.add(name);

        // Highlight selected, dim others
        $$('.cell-part').forEach(g => {
          g.classList.remove('active', 'dim');
          if (g.dataset.part === name) g.classList.add('active');
          else g.classList.add('dim');
        });

        // Update info card
        const info = $('#tour-info');
        info.classList.add('has-active');
        info.innerHTML = `
          <div class="part-icon" style="background: ${part.tint};">${part.icon}</div>
          <h3>${part.name}</h3>
          <div class="city-tag">🏙️ ${part.city}</div>
          <p class="description">${part.description}</p>
          <div class="fun-fact">
            <strong>Fun fact</strong>
            ${part.fact}
          </div>
        `;

        // Update progress
        $('#tour-pct').textContent = `${state.partsSeen.size}/5`;
        $('#tour-bar').style.width = `${(state.partsSeen.size / 5) * 100}%`;
      }

      // ----- Scene 4: Compare -----
      function renderCompare() {
        const stage = $('#compare-stage');
        stage.innerHTML = compareCellSVG();
        stage.classList.remove('is-plant');
        $$('.toggle button').forEach(btn => {
          btn.addEventListener('click', () => {
            $$('.toggle button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            stage.classList.toggle('is-plant', btn.dataset.cell === 'plant');
          });
        });
      }

      // ----- Scene 5: Quiz (module-aware) -----
      function startQuiz(moduleId) {
        const mod = MODULES[moduleId];
        if (!mod) return;
        state.quiz = {
          i: 0,
          correct: 0,
          locked: false,
          questions: mod.quiz,
          cardSel: mod.quizCardSel,
          moduleId,
        };
        renderQuizQuestion();
      }

      // Back-compat: cell module's existing renderer was named renderQuiz
      function renderQuiz() { startQuiz('cell'); }

      function renderQuizQuestion() {
        const Q = state.quiz.questions;
        const card = $(state.quiz.cardSel);
        if (!card) return;
        if (state.quiz.i >= Q.length) {
          renderQuizResults();
          return;
        }
        const q = Q[state.quiz.i];
        card.innerHTML = `
          <div class="quiz-counter">Question ${state.quiz.i + 1} of ${Q.length}</div>
          <div class="quiz-q">${q.q}</div>
          <div class="quiz-options">
            ${q.options.map((opt, idx) => `
              <button class="quiz-option" data-idx="${idx}">
                <span class="letter">${String.fromCharCode(65 + idx)}</span>
                <span>${opt}</span>
              </button>
            `).join('')}
          </div>
          <div class="quiz-feedback" id="quiz-feedback"></div>
          <div style="margin-top: 24px; display: flex; justify-content: space-between; align-items: center;">
            <span style="color: var(--ink-500); font-size: 0.9rem;">
              Score: ${state.quiz.correct}/${state.quiz.i}
            </span>
            <button class="btn btn-primary" id="quiz-next" style="display: none;">
              ${state.quiz.i === Q.length - 1 ? 'See results →' : 'Next question →'}
            </button>
          </div>
        `;
        $$('.quiz-option', card).forEach(btn => {
          btn.addEventListener('click', () => answerQuiz(parseInt(btn.dataset.idx, 10)));
        });
      }

      function answerQuiz(idx) {
        if (state.quiz.locked) return;
        const Q = state.quiz.questions;
        const card = $(state.quiz.cardSel);
        if (!card) return;
        const q = Q[state.quiz.i];
        const opts = $$('.quiz-option', card);
        const fb = $('#quiz-feedback', card);
        const isRight = idx === q.correct;
        state.quiz.locked = true;

        opts.forEach((b, i) => {
          b.classList.add('locked');
          if (i === q.correct) b.classList.add('correct');
          else if (i === idx && !isRight) b.classList.add('incorrect');
          else b.classList.add('dimmed');
        });

        if (isRight) {
          state.quiz.correct++;
          fb.className = 'quiz-feedback show right';
          fb.innerHTML = `<strong>✓ Yes!</strong>${q.why}`;
        } else {
          fb.className = 'quiz-feedback show wrong';
          fb.innerHTML = `<strong>Not quite</strong>${q.wrongHint} The correct answer is highlighted in green.`;
        }

        const nextBtn = $('#quiz-next', card);
        nextBtn.style.display = 'inline-flex';
        nextBtn.onclick = () => {
          state.quiz.i++;
          state.quiz.locked = false;
          renderQuizQuestion();
        };
      }

      function renderQuizResults() {
        const card = $(state.quiz.cardSel);
        if (!card) return;
        const score = state.quiz.correct;
        const total = state.quiz.questions.length;
        const pct = score / total;
        let emoji, title, msg;
        if (pct === 1)        { emoji = '🌟'; title = 'Perfect score!';   msg = 'You absolutely nailed it.'; }
        else if (pct >= 0.8)  { emoji = '🎉'; title = 'Almost perfect!';  msg = 'You got the big stuff. Solid work.'; }
        else if (pct >= 0.6)  { emoji = '😊'; title = 'Nice job!';        msg = 'Good foundation. Want to try the quiz again?'; }
        else                  { emoji = '🌱'; title = 'You\'re learning!';  msg = 'Skim back through and re-take the quiz — you\'ll level up fast.'; }

        card.innerHTML = `
          <div class="quiz-results">
            <span class="big-emoji">${emoji}</span>
            <h3>${title}</h3>
            <div class="score">${score} / ${total} correct</div>
            <p>${msg}</p>
            <div class="actions">
              <button class="btn btn-ghost" id="quiz-retry">Try again</button>
              <button class="btn btn-primary" id="quiz-finish">Finish module →</button>
            </div>
          </div>
        `;
        $('#quiz-retry', card).onclick = () => startQuiz(state.quiz.moduleId);
        $('#quiz-finish', card).onclick = () => nextScene();

        if (pct === 1) fireConfetti(60);
        else if (pct >= 0.8) fireConfetti(30);
      }

      function fireConfetti(count) {
        const stage = document.createElement('div');
        stage.className = 'confetti-stage';
        document.body.appendChild(stage);
        const colors = ['#22c896', '#ffc73d', '#ff7878', '#a78bfa', '#5fb8ff'];
        for (let i = 0; i < count; i++) {
          const piece = document.createElement('div');
          piece.className = 'confetti-piece';
          piece.style.left = Math.random() * 100 + '%';
          piece.style.background = colors[i % colors.length];
          piece.style.animationDelay = (Math.random() * 0.6) + 's';
          piece.style.animationDuration = (1.6 + Math.random() * 1.2) + 's';
          piece.style.transform = `rotate(${Math.random() * 360}deg)`;
          stage.appendChild(piece);
        }
        setTimeout(() => stage.remove(), 4000);
      }

      // ----- Scene 6: Mark completed -----
      function markCompleted() {
        if (!state.activeModule) return;
        const all = loadState();
        all.completed = all.completed || {};
        all.completed[state.activeModule] = true;
        saveState(all);
        state.completed = all.completed;
      }

      // =====================================================================
      // Wiring
      // =====================================================================
      function wire() {
        // Brand → home
        $('#brand').addEventListener('click', () => goHome());

        // Hero CTAs
        $('#cta-start').addEventListener('click', () => startModule('cell'));
        $('#cta-scroll').addEventListener('click', () => {
          $('#curriculum-head').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        // Scene action buttons (delegated)
        document.addEventListener('click', (e) => {
          const t = e.target.closest('[data-action]');
          if (!t) return;
          const a = t.dataset.action;
          if (a === 'next') nextScene();
          else if (a === 'home') goHome();
          else if (a === 'goto') {
            const target = t.dataset.mod;
            if (target && MODULES[target]) startModule(target);
          }
        });
      }

      // =====================================================================
      // Boot
      // =====================================================================
      function boot() {
        renderHero();
        renderCurriculum();
        renderBreadcrumb();
        wire();
      }

      boot();
    })();
