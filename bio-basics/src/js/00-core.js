    // =========================================================================
    // Bio Basics — single IIFE
    // =========================================================================
    (function () {
      'use strict';

      // ----- Persistence -----
      const STORE_KEY = 'biobasics_state_v1';
      function loadState() {
        try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
        catch { return {}; }
      }
      function saveState(s) {
        try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch {}
      }

      const state = {
        view: 'landing',          // 'landing' | 'module'
        activeModule: null,       // 'cell' | 'dna' | 'transcription' | 'translation' | 'regulation' | 'evolve'
        sceneIndex: 0,
        partsSeen: new Set(),     // module 1 (cell tour)
        basesSeen: new Set(),     // module 2 (DNA bases)
        transAnim: { pos: 0, playing: false, intervalId: null },   // module 3
        translAnim: { pos: 0, playing: false, intervalId: null },  // module 4
        cellType: 'brain',        // module 5
        mutPicker: null,          // module 6: { codonIdx, baseIdx } when an option panel is open
        mutApplied: null,         // module 6: { codonIdx, baseIdx, fromBase, toBase, originalCodon, newCodon, classification }
        quiz: { i: 0, correct: 0, locked: false, questions: [], cardSel: '#quiz-card' },
        completed: loadState().completed || {},  // { moduleId: true }
      };

      // ----- Curriculum -----
      const CURRICULUM = [
        { id: 'cell',          name: 'What is a cell?',           icon: '🦠', color: 'var(--leaf-100)',
          blurb: 'Meet the tiny living city. Membrane, nucleus, mitochondria & friends.', status: 'unlocked' },
        { id: 'dna',           name: 'What is DNA?',              icon: '🧬', color: 'var(--grape-100)',
          blurb: 'The recipe book that lives in every cell. Double helix, base pairs, you.', status: 'unlocked' },
        { id: 'transcription', name: 'Transcription',             icon: '📝', color: 'var(--sky-100)',
          blurb: 'How DNA gets copied into RNA so the message can leave the nucleus.', status: 'unlocked' },
        { id: 'translation',   name: 'Translation',               icon: '🔤', color: 'var(--coral-100)',
          blurb: 'How RNA becomes a working protein. Ribosomes, tRNA, the genetic code.', status: 'unlocked' },
        { id: 'regulation',    name: 'Gene Regulation',           icon: '🎛️', color: 'var(--sun-100)',
          blurb: 'Every cell has the same DNA. So why is a brain cell different from a skin cell?', status: 'unlocked' },
        { id: 'evolve',        name: 'Mutations & Evolution',     icon: '🦎', color: 'var(--leaf-100)',
          blurb: 'Tiny copy errors → giant changes over time. The engine of life.', status: 'unlocked' },
        { id: 'disease',       name: 'Cancer & Genetic Disease',  icon: '🩺', color: 'var(--coral-100)',
          blurb: 'When the recipes get scrambled. What goes wrong, and what we can do about it.', status: 'soon' },
        { id: 'viruses',       name: 'Viruses',                   icon: '🦠', color: 'var(--grape-100)',
          blurb: 'The freeloaders. How they hijack your cells to make more of themselves.', status: 'soon' },
        { id: 'immune',        name: 'The Immune System',         icon: '🛡️', color: 'var(--sky-100)',
          blurb: 'Your body\'s built-in security force. Antibodies, T-cells, memory.', status: 'soon' },
        { id: 'vaccines',      name: 'Vaccines & Pandemics',      icon: '💉', color: 'var(--sun-100)',
          blurb: 'How vaccines train your immune system. Why pandemics happen.', status: 'soon' },
        { id: 'crispr',        name: 'CRISPR & Modern Tools',     icon: '✂️', color: 'var(--leaf-100)',
          blurb: 'Bacteria invented gene editing. Now we use it to cure disease.', status: 'soon' },
      ];

      // ----- DOM helpers -----
      const $ = (sel, root) => (root || document).querySelector(sel);
      const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
