/*
 * Bare DAW — a tiny browser DAW.
 *
 * Audio engine: Tone.js (CDN). Notation: VexFlow 4 (CDN).
 *
 * Data model:
 *   state.tracks[]     — the synth roster (id, key, muted, inst). No pattern data.
 *   state.sections[]   — ordered list of sections. Each owns:
 *                          { id, name, stepsCount, data: { [trackId]: {steps|notes} } }
 *   state.playMode     — 'loop' (current section) or 'song' (chain all sections).
 *
 * Note insertion pipeline (insertNoteAtCursor) is shared by mouse, QWERTY, and MIDI.
 */

// ---------------- Instrument catalog ----------------
const INSTRUMENTS = {
  kick: {
    name: 'Kick', kind: 'drum', color: '#ff4d6d', midiNote: 36,
    create: (dest) => new Tone.MembraneSynth({
      pitchDecay: 0.05, octaves: 6,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.2 },
    }).connect(dest),
    trigger: (inst, time) => inst.triggerAttackRelease('C1', '8n', time),
  },
  snare: {
    name: 'Snare', kind: 'drum', color: '#ffd23f', midiNote: 38,
    create: (dest) => new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0 },
    }).connect(dest),
    trigger: (inst, time) => inst.triggerAttackRelease('16n', time),
  },
  hihat: {
    name: 'Hi-Hat', kind: 'drum', color: '#06d6a0', midiNote: 42,
    create: (dest) => new Tone.MetalSynth({
      frequency: 250,
      envelope: { attack: 0.001, decay: 0.08, release: 0.01 },
      harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5,
      volume: -12,
    }).connect(dest),
    trigger: (inst, time) => inst.triggerAttackRelease('C6', '32n', time),
  },
  clap: {
    name: 'Clap', kind: 'drum', color: '#118ab2', midiNote: 39,
    create: (dest) => new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.005, decay: 0.18, sustain: 0 },
    }).connect(dest),
    trigger: (inst, time) => inst.triggerAttackRelease('8n', time),
  },
  bass: {
    name: 'Bass', kind: 'melodic', color: '#7209b7',
    create: (dest) => new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.2 },
      filter: { Q: 2, type: 'lowpass', rolloff: -24 },
      filterEnvelope: {
        attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.2,
        baseFrequency: 120, octaves: 3,
      },
      volume: -6,
    }).connect(dest),
    trigger: (inst, time, note, dur) =>
      inst.triggerAttackRelease(note, dur || '8n', time),
  },
  lead: {
    name: 'Lead', kind: 'melodic', color: '#f72585',
    create: (dest) => new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.2 },
      volume: -6,
    }).connect(dest),
    trigger: (inst, time, note, dur) =>
      inst.triggerAttackRelease(note, dur || '8n', time),
  },
  pad: {
    name: 'Pad', kind: 'melodic', color: '#4361ee',
    create: (dest) => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.1, decay: 0.3, sustain: 0.6, release: 0.8 },
      volume: -10,
    }).connect(dest),
    trigger: (inst, time, note, dur) =>
      inst.triggerAttackRelease(note, dur || '2n', time),
  },
  pluck: {
    name: 'Pluck', kind: 'melodic', color: '#00b4d8',
    create: (dest) => new Tone.PluckSynth({
      attackNoise: 1, dampening: 4000, resonance: 0.9,
    }).connect(dest),
    trigger: (inst, time, note, dur) =>
      inst.triggerAttackRelease(note, dur || '8n', time),
  },
};

// ---------------- Piano-roll pitch range ----------------
const LO_MIDI = 36;
const HI_MIDI = 83;
const TOTAL_ROWS = HI_MIDI - LO_MIDI + 1;

// ---------------- QWERTY piano map ----------------
const KEY_MAP = {
  'a': 0,  'w': 1,  's': 2,  'e': 3,  'd': 4,  'f': 5,
  't': 6,  'g': 7,  'y': 8,  'h': 9,  'u': 10, 'j': 11,
  'k': 12,
};

// ---------------- State ----------------
const state = {
  tracks: [],
  sections: [newSection('Section 1', 16)],
  currentSectionIdx: 0,
  nextId: 1,
  nextSectionId: 2,
  playMode: 'loop',
  playing: false,
  loop: null,
  playhead: { sectionIdx: 0, step: -1 },
};

function newSection(name, stepsCount) {
  return { id: 1, name, stepsCount, data: {} };
}

let selectedTrack = null;
let cursorStep = 0;
let keyboardOctave = 4;
let insertLength = 1;
let midiLastNoteTime = 0;
let midiAccess = null;
let dragState = null;

// ---------------- DOM helpers ----------------
const $ = (id) => document.getElementById(id);
const paletteEl = $('paletteList');
const tracksEl = $('tracks');
const emptyEl = $('timelineEmpty');
const stepRulerEl = $('stepRuler');
const bpmEl = $('bpm');
const stepsSelect = $('steps');
const playBtn = $('playBtn');
const stopBtn = $('stopBtn');
const playModeBtn = $('playModeBtn');
const timelineEl = $('timeline');
const statusEl = $('status');
const octaveInfoEl = $('octaveInfo');
const toastEl = $('toast');
const midiBtn = $('midiBtn');
const notationEl = $('notation');
const notationLabelEl = $('notationLabel');
const notationToggleBtn = $('notationToggle');
const sectionTabsEl = $('sectionTabs');
const addSectionBtn = $('addSectionBtn');
const dupSectionBtn = $('dupSectionBtn');

function toast(msg, ms = 2200) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toastEl.classList.remove('show'), ms);
}
function setStatus(msg) { statusEl.textContent = msg; }
function kindOf(track) { return INSTRUMENTS[track.key].kind; }

// ---------------- Section helpers ----------------
function curSection() { return state.sections[state.currentSectionIdx]; }

function trackData(track, section) {
  section = section || curSection();
  let d = section.data[track.id];
  if (!d) {
    d = kindOf(track) === 'drum'
      ? { steps: new Array(section.stepsCount).fill(false) }
      : { notes: [] };
    section.data[track.id] = d;
  }
  return d;
}

function setCurrentSection(idx) {
  if (idx < 0 || idx >= state.sections.length) return;
  state.currentSectionIdx = idx;
  const sec = curSection();
  cursorStep = Math.min(cursorStep, sec.stepsCount);
  stepsSelect.value = String(sec.stepsCount);
  renderSections();
  renderRuler();
  renderTracks();
  renderNotation();
  if (state.playing && state.playhead.sectionIdx === idx) {
    highlightStep(idx, state.playhead.step);
  }
}

function addSection() {
  const sec = {
    id: state.nextSectionId++,
    name: `Section ${state.sections.length + 1}`,
    stepsCount: curSection().stepsCount,
    data: {},
  };
  state.sections.push(sec);
  setCurrentSection(state.sections.length - 1);
  toast(`Added "${sec.name}"`);
}

function duplicateSection() {
  const src = curSection();
  const copy = {
    id: state.nextSectionId++,
    name: src.name + ' copy',
    stepsCount: src.stepsCount,
    data: JSON.parse(JSON.stringify(src.data)),
  };
  state.sections.splice(state.currentSectionIdx + 1, 0, copy);
  setCurrentSection(state.currentSectionIdx + 1);
  toast(`Duplicated as "${copy.name}"`);
}

function removeSection(idx) {
  if (state.sections.length <= 1) {
    toast('Need at least one section.');
    return;
  }
  state.sections.splice(idx, 1);
  if (state.currentSectionIdx >= state.sections.length) {
    state.currentSectionIdx = state.sections.length - 1;
  }
  if (state.playhead.sectionIdx >= state.sections.length) {
    state.playhead.sectionIdx = 0;
    state.playhead.step = -1;
  }
  setCurrentSection(state.currentSectionIdx);
}

function renameSectionPrompt(idx) {
  const sec = state.sections[idx];
  const name = prompt('Rename section:', sec.name);
  if (name != null && name.trim()) {
    sec.name = name.trim();
    renderSections();
    renderNotation();
  }
}

function renderSections() {
  sectionTabsEl.innerHTML = '';
  state.sections.forEach((sec, idx) => {
    const tab = document.createElement('div');
    tab.className = 'section-tab';
    tab.dataset.idx = idx;
    if (idx === state.currentSectionIdx) tab.classList.add('active');
    if (state.playing && idx === state.playhead.sectionIdx) tab.classList.add('playing');
    tab.setAttribute('role', 'tab');

    const nameEl = document.createElement('span');
    nameEl.className = 'section-tab-name';
    nameEl.textContent = sec.name;
    nameEl.title = `${sec.name} · ${sec.stepsCount} steps`;
    tab.appendChild(nameEl);

    const close = document.createElement('span');
    close.className = 'section-tab-close';
    close.textContent = '×';
    close.title = 'Delete section';
    close.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.sections.length <= 1) return toast('Need at least one section.');
      if (!confirm(`Delete "${sec.name}"?`)) return;
      removeSection(idx);
    });
    tab.appendChild(close);

    tab.addEventListener('click', () => setCurrentSection(idx));
    nameEl.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      renameSectionPrompt(idx);
    });

    sectionTabsEl.appendChild(tab);
  });
}

// ---------------- Music theory helpers ----------------
const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const BLACK_KEYS = new Set([1, 3, 6, 8, 10]);

function midiToNoteName(midi) {
  const octave = Math.floor(midi / 12) - 1;
  return NOTE_NAMES[midi % 12] + octave;
}
function isBlackKey(midi) { return BLACK_KEYS.has(midi % 12); }

function getCellWidth() {
  return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell'), 10) || 34;
}
function getRowHeight() {
  return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--pr-row'), 10) || 16;
}
function getGutterWidth() {
  return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--gutter'), 10) || 56;
}
function secondsPerStep() {
  const bpm = parseFloat(bpmEl.value) || 110;
  return 60 / bpm / 4;
}

// ---------------- Palette ----------------
function renderPalette() {
  paletteEl.innerHTML = '';
  for (const [key, def] of Object.entries(INSTRUMENTS)) {
    const el = document.createElement('div');
    el.className = 'palette-item';
    el.draggable = true;
    el.dataset.key = key;
    el.innerHTML = `
      <div class="swatch" style="background:${def.color}"></div>
      <div class="name">${def.name}</div>
      <div class="kind">${def.kind}</div>
    `;
    el.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', key);
      e.dataTransfer.effectAllowed = 'copy';
      el.classList.add('dragging');
    });
    el.addEventListener('dragend', () => el.classList.remove('dragging'));
    el.addEventListener('dblclick', () => addTrack(key));
    paletteEl.appendChild(el);
  }
}

timelineEl.addEventListener('dragover', (e) => {
  if (Array.from(e.dataTransfer.types).includes('text/plain')) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    timelineEl.classList.add('drag-over');
  }
});
timelineEl.addEventListener('dragleave', (e) => {
  if (e.target === timelineEl) timelineEl.classList.remove('drag-over');
});
timelineEl.addEventListener('drop', (e) => {
  e.preventDefault();
  timelineEl.classList.remove('drag-over');
  const key = e.dataTransfer.getData('text/plain');
  if (INSTRUMENTS[key]) addTrack(key);
});

// ---------------- Track lifecycle ----------------
function addTrack(key) {
  const def = INSTRUMENTS[key];
  if (!def) return;

  const inst = def.create(Tone.getDestination());
  const track = { id: state.nextId++, key, muted: false, inst };
  state.tracks.push(track);

  // Lazy-init track data in every existing section to ensure arrays exist sized to each.
  for (const sec of state.sections) trackData(track, sec);

  if (def.kind === 'melodic' && !selectedTrack) selectedTrack = track;

  renderTracks();
  renderNotation();
  toast(`Added ${def.name}`);
  setStatus(`${state.tracks.length} track${state.tracks.length === 1 ? '' : 's'}.`);
}

function removeTrack(id) {
  const idx = state.tracks.findIndex(t => t.id === id);
  if (idx < 0) return;
  const [t] = state.tracks.splice(idx, 1);
  try { t.inst.dispose(); } catch {}
  for (const sec of state.sections) delete sec.data[id];
  if (selectedTrack?.id === id) {
    selectedTrack = state.tracks.find(tr => kindOf(tr) === 'melodic') || null;
    cursorStep = 0;
  }
  renderTracks();
  renderNotation();
  setStatus(`${state.tracks.length} track${state.tracks.length === 1 ? '' : 's'}.`);
}

function selectTrack(track) {
  if (!track || kindOf(track) !== 'melodic') return;
  if (selectedTrack === track) return;
  selectedTrack = track;
  cursorStep = 0;
  tracksEl.querySelectorAll('.track').forEach(el => {
    el.classList.toggle('selected', parseInt(el.dataset.id, 10) === track.id);
  });
  updateCursor();
  updateOctaveInfo();
  renderNotation();
}

// ---------------- Ruler ----------------
function renderRuler() {
  stepRulerEl.innerHTML = '';
  const stepsCount = curSection().stepsCount;
  for (let i = 0; i < stepsCount; i++) {
    const el = document.createElement('div');
    el.className = 'tick' + (i % 4 === 0 ? ' beat' : '');
    el.textContent = (i % 4 === 0) ? (i / 4 + 1) : '';
    stepRulerEl.appendChild(el);
  }
}

// ---------------- Track rendering ----------------
function renderTracks() {
  tracksEl.innerHTML = '';
  emptyEl.classList.toggle('hidden', state.tracks.length > 0);

  for (const track of state.tracks) {
    const def = INSTRUMENTS[track.key];
    const row = document.createElement('div');
    row.className = 'track ' + (def.kind === 'drum' ? 'drum-track' : 'piano-track');
    if (track.muted) row.classList.add('muted');
    if (selectedTrack?.id === track.id) row.classList.add('selected');
    row.dataset.id = track.id;

    if (def.kind === 'melodic') {
      row.addEventListener('mousedown', () => selectTrack(track), true);
    }

    row.appendChild(buildTrackControls(track, def));
    row.appendChild(def.kind === 'drum' ? buildDrumBody(track) : buildPianoRoll(track));
    tracksEl.appendChild(row);
  }

  if (selectedTrack) updateCursor();
  updateOctaveInfo();
}

function buildTrackControls(track, def) {
  const controls = document.createElement('div');
  controls.className = 'track-controls';

  const swatch = document.createElement('div');
  swatch.className = 'track-swatch';
  swatch.style.background = def.color;
  controls.appendChild(swatch);

  const name = document.createElement('div');
  name.className = 'track-name';
  name.title = def.name;
  name.textContent = def.name;
  controls.appendChild(name);

  const spacer = document.createElement('div');
  spacer.className = 'track-spacer';
  controls.appendChild(spacer);

  const muteBtn = document.createElement('button');
  muteBtn.className = 'icon-btn' + (track.muted ? ' active' : '');
  muteBtn.title = 'Mute';
  muteBtn.textContent = track.muted ? 'Muted' : 'Mute';
  muteBtn.style.opacity = track.muted ? '1' : '0.7';
  muteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    track.muted = !track.muted;
    renderTracks();
  });
  controls.appendChild(muteBtn);

  if (def.kind === 'melodic') {
    const clearBtn = document.createElement('button');
    clearBtn.className = 'icon-btn';
    clearBtn.title = 'Clear notes in this section';
    clearBtn.textContent = 'Clear';
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const d = trackData(track);
      if (d.notes.length === 0) return;
      d.notes = [];
      cursorStep = 0;
      renderTracks();
      renderNotation();
    });
    controls.appendChild(clearBtn);
  }

  const delBtn = document.createElement('button');
  delBtn.className = 'icon-btn';
  delBtn.title = 'Remove track';
  delBtn.textContent = '✕';
  delBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    removeTrack(track.id);
  });
  controls.appendChild(delBtn);

  return controls;
}

function buildDrumBody(track) {
  const body = document.createElement('div');
  body.className = 'drum-body';

  const gutter = document.createElement('div');
  gutter.className = 'gutter';
  body.appendChild(gutter);

  const container = document.createElement('div');
  container.className = 'steps-container';

  const stepsEl = document.createElement('div');
  stepsEl.className = 'steps';
  const d = trackData(track);
  const stepsCount = curSection().stepsCount;
  for (let i = 0; i < stepsCount; i++) {
    const s = document.createElement('div');
    s.className = 'step'
      + (d.steps[i] ? ' on' : '')
      + (i % 4 === 0 && i !== 0 ? ' beat' : '');
    s.dataset.step = i;
    s.addEventListener('click', () => {
      d.steps[i] = !d.steps[i];
      s.classList.toggle('on', d.steps[i]);
      if (d.steps[i] && Tone.context.state === 'running') {
        INSTRUMENTS[track.key].trigger(track.inst, Tone.now() + 0.01);
      }
    });
    stepsEl.appendChild(s);
  }
  container.appendChild(stepsEl);

  const playhead = document.createElement('div');
  playhead.className = 'drum-playhead';
  container.appendChild(playhead);

  body.appendChild(container);
  return body;
}

function buildPianoRoll(track) {
  const wrap = document.createElement('div');
  wrap.className = 'piano-wrap';

  const keysEl = document.createElement('div');
  keysEl.className = 'pr-keys';

  const gridEl = document.createElement('div');
  gridEl.className = 'pr-grid';
  const stepsCount = curSection().stepsCount;
  gridEl.style.width = `${stepsCount * getCellWidth()}px`;
  gridEl.style.height = `${TOTAL_ROWS * getRowHeight()}px`;

  const playhead = document.createElement('div');
  playhead.className = 'pr-playhead';
  gridEl.appendChild(playhead);

  const cursor = document.createElement('div');
  cursor.className = 'pr-cursor';
  gridEl.appendChild(cursor);

  for (let midi = HI_MIDI; midi >= LO_MIDI; midi--) {
    const isBlack = isBlackKey(midi);
    const isC = midi % 12 === 0;

    const keyEl = document.createElement('div');
    keyEl.className = 'pr-key ' + (isBlack ? 'black' : 'white') + (isC ? ' octave' : '');
    keyEl.textContent = isC ? midiToNoteName(midi) : '';
    keyEl.title = midiToNoteName(midi);
    keyEl.dataset.midi = midi;
    keyEl.addEventListener('mousedown', async (e) => {
      e.stopPropagation();
      selectTrack(track);
      await ensureAudio();
      playPreview(track, midi);
      flashKey(track, midi);
    });
    keysEl.appendChild(keyEl);

    const rowEl = document.createElement('div');
    rowEl.className = 'pr-row'
      + (isBlack ? ' black-row' : '')
      + (isC ? ' octave-boundary' : '');
    rowEl.dataset.midi = midi;
    for (let step = 0; step < stepsCount; step++) {
      const cell = document.createElement('div');
      cell.className = 'pr-cell'
        + (step % 4 === 0 && step !== 0 ? ' beat' : '')
        + (step % 16 === 0 && step !== 0 ? ' bar' : '');
      cell.dataset.step = step;
      cell.dataset.midi = midi;
      rowEl.appendChild(cell);
    }
    gridEl.appendChild(rowEl);
  }

  const d = trackData(track);
  for (const n of d.notes) gridEl.appendChild(createNoteEl(track, n));

  gridEl.addEventListener('mousedown', (e) => onPianoGridMouseDown(track, gridEl, e));

  wrap.appendChild(keysEl);
  wrap.appendChild(gridEl);

  queueMicrotask(() => {
    const target = (HI_MIDI - 60) * getRowHeight() - 80;
    wrap.scrollTop = Math.max(0, target);
  });

  return wrap;
}

function createNoteEl(track, note) {
  const cellW = getCellWidth();
  const rowH = getRowHeight();
  const el = document.createElement('div');
  el.className = 'pr-note';
  el.style.left = `${note.start * cellW}px`;
  el.style.width = `${Math.max(4, note.length * cellW - 1)}px`;
  el.style.top = `${(HI_MIDI - note.pitch) * rowH}px`;
  el.textContent = midiToNoteName(note.pitch);
  el.title = `${midiToNoteName(note.pitch)} · ${note.length} step${note.length === 1 ? '' : 's'}`;
  el.__note = note;
  el.__track = track;
  el.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    selectTrack(track);
    cursorStep = note.start;
    updateCursor();
    updateOctaveInfo();
    const d = trackData(track);
    const idx = d.notes.indexOf(note);
    if (idx >= 0) {
      d.notes.splice(idx, 1);
      el.remove();
      renderNotation();
    }
  });
  return el;
}

function onPianoGridMouseDown(track, gridEl, e) {
  if (!e.target.classList.contains('pr-cell')) return;
  if (e.button !== 0) return;

  const step = parseInt(e.target.dataset.step, 10);
  const midi = parseInt(e.target.dataset.midi, 10);
  if (isNaN(step) || isNaN(midi)) return;

  selectTrack(track);
  cursorStep = step;
  updateCursor();
  updateOctaveInfo();

  const d = trackData(track);
  const existing = d.notes.find(n => n.pitch === midi && n.start === step);
  if (existing) {
    d.notes.splice(d.notes.indexOf(existing), 1);
    renderTracks();
    renderNotation();
    return;
  }

  ensureAudio().then(() => playPreview(track, midi));

  const note = { pitch: midi, start: step, length: 1 };
  d.notes.push(note);
  const noteEl = createNoteEl(track, note);
  gridEl.appendChild(noteEl);
  renderNotation();

  const cellW = getCellWidth();
  const moveHandler = (ev) => {
    const rect = gridEl.getBoundingClientRect();
    const relX = ev.clientX - rect.left;
    const stepUnder = Math.max(note.start, Math.min(curSection().stepsCount - 1, Math.floor(relX / cellW)));
    const newLen = stepUnder - note.start + 1;
    if (newLen !== note.length) {
      note.length = newLen;
      noteEl.style.width = `${Math.max(4, newLen * cellW - 1)}px`;
      noteEl.title = `${midiToNoteName(note.pitch)} · ${newLen} step${newLen === 1 ? '' : 's'}`;
    }
  };
  const upHandler = () => {
    document.removeEventListener('mousemove', moveHandler);
    document.removeEventListener('mouseup', upHandler);
    cursorStep = Math.min(curSection().stepsCount, note.start + note.length);
    updateCursor();
    updateOctaveInfo();
    renderNotation();
    dragState = null;
  };
  document.addEventListener('mousemove', moveHandler);
  document.addEventListener('mouseup', upHandler);
  dragState = { track, note, noteEl };
  e.preventDefault();
}

function playPreview(track, midi) {
  const def = INSTRUMENTS[track.key];
  if (Tone.context.state !== 'running') return;
  def.trigger(track.inst, Tone.now() + 0.01, midiToNoteName(midi), 0.3);
}

function flashKey(track, midi) {
  const rowEl = tracksEl.querySelector(`.track[data-id="${track.id}"]`);
  const keyEl = rowEl?.querySelector(`.pr-key[data-midi="${midi}"]`);
  if (!keyEl) return;
  keyEl.classList.add('pressed');
  setTimeout(() => keyEl.classList.remove('pressed'), 140);
}

function updateCursor() {
  if (!selectedTrack) return;
  const rowEl = tracksEl.querySelector(`.track[data-id="${selectedTrack.id}"]`);
  const cursor = rowEl?.querySelector('.pr-cursor');
  if (!cursor) return;
  cursor.style.left = `${cursorStep * getCellWidth()}px`;
}

function updateOctaveInfo() {
  if (!selectedTrack) { octaveInfoEl.textContent = ''; return; }
  const sec = curSection();
  octaveInfoEl.textContent =
    `${INSTRUMENTS[selectedTrack.key].name} · ${sec.name} · octave ${keyboardOctave} · step ${cursorStep + 1}/${sec.stepsCount} · len ${insertLength}`;
}

// ---------------- Insertion pipeline ----------------
function insertNoteAtCursor(pitch, length = insertLength, opts = {}) {
  if (!selectedTrack || kindOf(selectedTrack) !== 'melodic') return;
  const sec = curSection();
  if (cursorStep >= sec.stepsCount) return;

  length = Math.min(length, sec.stepsCount - cursorStep);
  const note = { pitch, start: cursorStep, length };
  const d = trackData(selectedTrack, sec);
  d.notes.push(note);

  const rowEl = tracksEl.querySelector(`.track[data-id="${selectedTrack.id}"]`);
  const gridEl = rowEl?.querySelector('.pr-grid');
  if (gridEl) gridEl.appendChild(createNoteEl(selectedTrack, note));

  if (!opts.chord) {
    cursorStep = Math.min(sec.stepsCount, cursorStep + length);
  }
  updateCursor();
  updateOctaveInfo();
  flashKey(selectedTrack, pitch);
  playPreview(selectedTrack, pitch);
  scrollToKeepVisible(selectedTrack, note);
  renderNotation();
}

function backspaceNote() {
  if (!selectedTrack) return;
  const d = trackData(selectedTrack);
  if (d.notes.length === 0) return;
  const removed = d.notes.pop();

  const rowEl = tracksEl.querySelector(`.track[data-id="${selectedTrack.id}"]`);
  const noteEls = rowEl?.querySelectorAll('.pr-note');
  if (noteEls) {
    for (const el of noteEls) {
      if (el.__note === removed) { el.remove(); break; }
    }
  }

  cursorStep = Math.max(0, removed.start);
  updateCursor();
  updateOctaveInfo();
  renderNotation();
}

function moveCursor(delta) {
  const sec = curSection();
  cursorStep = Math.max(0, Math.min(sec.stepsCount, cursorStep + delta));
  updateCursor();
  updateOctaveInfo();
}

function scrollToKeepVisible(track, note) {
  const rowEl = tracksEl.querySelector(`.track[data-id="${track.id}"]`);
  const wrap = rowEl?.querySelector('.piano-wrap');
  if (!wrap) return;

  const rowH = getRowHeight();
  const noteTop = (HI_MIDI - note.pitch) * rowH;
  if (noteTop < wrap.scrollTop || noteTop > wrap.scrollTop + wrap.clientHeight - rowH) {
    wrap.scrollTop = Math.max(0, noteTop - wrap.clientHeight / 2);
  }

  const cellW = getCellWidth();
  const gutterW = getGutterWidth();
  const cursorX = gutterW + cursorStep * cellW;
  if (cursorX < wrap.scrollLeft + gutterW) {
    wrap.scrollLeft = Math.max(0, cursorX - gutterW - 80);
  } else if (cursorX > wrap.scrollLeft + wrap.clientWidth - 40) {
    wrap.scrollLeft = cursorX - wrap.clientWidth + 80;
  }
}

// ---------------- Steps count per section ----------------
function setStepsCount(n) {
  n = parseInt(n, 10) || 16;
  const sec = curSection();
  sec.stepsCount = n;
  for (const track of state.tracks) {
    const d = trackData(track, sec);
    if (kindOf(track) === 'drum') {
      if (d.steps.length < n) d.steps = d.steps.concat(new Array(n - d.steps.length).fill(false));
      else d.steps = d.steps.slice(0, n);
    } else {
      d.notes = d.notes.filter(note => note.start < n);
      for (const note of d.notes) if (note.start + note.length > n) note.length = n - note.start;
    }
  }
  if (cursorStep > n) cursorStep = n;
  renderRuler();
  renderTracks();
  renderNotation();
}

// ---------------- Playback ----------------
async function ensureAudio() {
  if (Tone.context.state !== 'running') await Tone.start();
}

async function startPlayback() {
  if (state.playing) return;
  await ensureAudio();
  Tone.Transport.bpm.value = parseFloat(bpmEl.value) || 110;

  state.playhead = { sectionIdx: state.currentSectionIdx, step: -1 };

  state.loop = new Tone.Loop((time) => {
    let sec = state.sections[state.playhead.sectionIdx];
    state.playhead.step++;
    if (state.playhead.step >= sec.stepsCount) {
      if (state.playMode === 'song' && state.sections.length > 1) {
        state.playhead.sectionIdx = (state.playhead.sectionIdx + 1) % state.sections.length;
        state.playhead.step = 0;
        sec = state.sections[state.playhead.sectionIdx];
      } else {
        state.playhead.step = 0;
      }
    }

    const step = state.playhead.step;
    const stepSec = secondsPerStep();

    for (const track of state.tracks) {
      if (track.muted) continue;
      const def = INSTRUMENTS[track.key];
      const d = trackData(track, sec);
      if (def.kind === 'drum') {
        if (d.steps[step]) def.trigger(track.inst, time);
      } else {
        for (const n of d.notes) {
          if (n.start !== step) continue;
          const dur = Math.max(0.05, n.length * stepSec * 0.95);
          def.trigger(track.inst, time, midiToNoteName(n.pitch), dur);
        }
      }
    }

    const secIdx = state.playhead.sectionIdx;
    Tone.Draw.schedule(() => highlightStep(secIdx, step), time);
  }, '16n').start(0);

  Tone.Transport.start();
  state.playing = true;
  playBtn.classList.add('playing');
  playBtn.querySelector('.label').textContent = 'Stop';
  setStatus(state.playMode === 'song' ? 'Playing song.' : 'Looping section.');
}

function stopPlayback() {
  if (state.loop) { state.loop.stop(); state.loop.dispose(); state.loop = null; }
  Tone.Transport.stop();
  Tone.Transport.cancel();
  state.playing = false;
  state.playhead.step = -1;
  playBtn.classList.remove('playing');
  playBtn.querySelector('.label').textContent = 'Play';
  clearStepHighlight();
  // Clear playing tab indicator.
  document.querySelectorAll('.section-tab.playing').forEach(el => el.classList.remove('playing'));
  setStatus('Stopped.');
}

function highlightStep(sectionIdx, step) {
  clearStepHighlight();

  document.querySelectorAll('.section-tab').forEach((tab, idx) => {
    tab.classList.toggle('playing', idx === sectionIdx);
  });

  if (sectionIdx !== state.currentSectionIdx) return;

  const cellW = getCellWidth();
  for (const track of state.tracks) {
    const rowEl = tracksEl.querySelector(`.track[data-id="${track.id}"]`);
    if (!rowEl) continue;
    const ph = rowEl.querySelector('.drum-playhead, .pr-playhead');
    if (ph) {
      ph.style.left = `${step * cellW}px`;
      ph.classList.add('active');
    }
  }
}

function clearStepHighlight() {
  tracksEl.querySelectorAll('.drum-playhead.active, .pr-playhead.active')
    .forEach(el => el.classList.remove('active'));
}

function togglePlayMode() {
  state.playMode = state.playMode === 'loop' ? 'song' : 'loop';
  updatePlayModeButton();
  if (state.playing) setStatus(state.playMode === 'song' ? 'Playing song.' : 'Looping section.');
}
function updatePlayModeButton() {
  playModeBtn.textContent = state.playMode === 'loop' ? 'Loop' : 'Song';
  playModeBtn.classList.toggle('mode-song', state.playMode === 'song');
  playModeBtn.classList.toggle('mode-loop', state.playMode === 'loop');
  playModeBtn.title = state.playMode === 'loop'
    ? 'Loop current section'
    : 'Play all sections in sequence';
}

// ---------------- WAV export (all sections) ----------------
async function exportWav() {
  if (state.tracks.length === 0) return toast('Add a track first.');
  if (!hasAnyNotes()) return toast('Program at least one step or note.');

  const bpm = parseFloat(bpmEl.value) || 110;
  const stepSec = 60 / bpm / 4;
  const totalPattern = state.sections.reduce((acc, s) => acc + s.stepsCount, 0) * stepSec;
  const tail = 2.0;

  setStatus('Rendering WAV…');
  toast('Rendering…');

  try {
    const buffer = await Tone.Offline(async () => {
      const dest = Tone.getDestination();
      const insts = new Map();
      for (const track of state.tracks) {
        if (track.muted) continue;
        insts.set(track.id, INSTRUMENTS[track.key].create(dest));
      }

      let offset = 0;
      for (const sec of state.sections) {
        for (const track of state.tracks) {
          if (track.muted) continue;
          const def = INSTRUMENTS[track.key];
          const inst = insts.get(track.id);
          const d = trackData(track, sec);
          if (def.kind === 'drum') {
            for (let i = 0; i < sec.stepsCount; i++) {
              if (!d.steps[i]) continue;
              def.trigger(inst, offset + i * stepSec);
            }
          } else {
            for (const n of d.notes) {
              const t = offset + n.start * stepSec;
              const dur = Math.max(0.05, n.length * stepSec * 0.95);
              def.trigger(inst, t, midiToNoteName(n.pitch), dur);
            }
          }
        }
        offset += sec.stepsCount * stepSec;
      }
    }, totalPattern + tail);

    const wav = audioBufferToWav(buffer.get ? buffer.get() : buffer);
    downloadBlob(wav, `bare-daw-${Date.now()}.wav`);
    setStatus('WAV exported.');
    toast('WAV saved');
  } catch (err) {
    console.error(err);
    setStatus('WAV export failed.');
    toast('WAV export failed — see console.');
  }
}

function hasAnyNotes() {
  for (const sec of state.sections) {
    for (const track of state.tracks) {
      const d = trackData(track, sec);
      if (kindOf(track) === 'drum' ? d.steps.some(Boolean) : d.notes.length > 0) return true;
    }
  }
  return false;
}

function audioBufferToWav(ab) {
  const numChannels = ab.numberOfChannels;
  const sampleRate = ab.sampleRate;
  const bitDepth = 16;

  const samples = numChannels === 2
    ? interleave(ab.getChannelData(0), ab.getChannelData(1))
    : ab.getChannelData(0);

  const bytesPerSample = bitDepth / 8;
  const dataLength = samples.length * bytesPerSample;
  const bufferLength = 44 + dataLength;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, bufferLength - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
  view.setUint16(32, numChannels * bytesPerSample, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }
  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function interleave(l, r) {
  const out = new Float32Array(l.length + r.length);
  for (let i = 0, j = 0; i < l.length; i++) { out[j++] = l[i]; out[j++] = r[i]; }
  return out;
}
function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}

// ---------------- MIDI export (all sections) ----------------
function exportMidi() {
  if (state.tracks.length === 0) return toast('Add a track first.');
  if (!hasAnyNotes()) return toast('Program at least one step or note.');

  const bpm = parseFloat(bpmEl.value) || 110;
  const PPQ = 480;
  const stepTicks = PPQ / 4;

  const microsPerBeat = Math.round(60000000 / bpm);
  const tempoBytes = [
    ...vlq(0), 0xFF, 0x51, 0x03,
    (microsPerBeat >> 16) & 0xFF,
    (microsPerBeat >> 8) & 0xFF,
    microsPerBeat & 0xFF,
    ...vlq(0), 0xFF, 0x2F, 0x00,
  ];
  const chunks = [makeTrackChunk(tempoBytes)];

  let melodicChannel = 0;
  for (const track of state.tracks) {
    if (track.muted) continue;
    const def = INSTRUMENTS[track.key];
    const isDrum = def.kind === 'drum';
    let channel;
    if (isDrum) channel = 9;
    else {
      channel = melodicChannel;
      melodicChannel++;
      if (melodicChannel === 9) melodicChannel++;
      if (melodicChannel > 15) melodicChannel = 0;
    }

    const events = [];
    let offset = 0;
    for (const sec of state.sections) {
      const d = trackData(track, sec);
      if (isDrum) {
        const pitch = def.midiNote;
        for (let i = 0; i < sec.stepsCount; i++) {
          if (!d.steps[i]) continue;
          const start = offset + i * stepTicks;
          const off = start + Math.max(1, Math.floor(stepTicks * 0.9));
          events.push({ t: start, kind: 'on', pitch, ch: channel });
          events.push({ t: off,   kind: 'off', pitch, ch: channel });
        }
      } else {
        for (const n of d.notes) {
          const start = offset + n.start * stepTicks;
          const off = start + Math.max(1, Math.floor(n.length * stepTicks * 0.95));
          events.push({ t: start, kind: 'on', pitch: n.pitch, ch: channel });
          events.push({ t: off,   kind: 'off', pitch: n.pitch, ch: channel });
        }
      }
      offset += sec.stepsCount * stepTicks;
    }
    events.sort((a, b) => a.t - b.t || (a.kind === 'off' ? -1 : 1));

    const bytes = [];
    let lastTick = 0;
    for (const ev of events) {
      bytes.push(...vlq(ev.t - lastTick));
      const status = (ev.kind === 'on' ? 0x90 : 0x80) | (ev.ch & 0x0F);
      bytes.push(status, ev.pitch & 0x7F, ev.kind === 'on' ? 100 : 0);
      lastTick = ev.t;
    }
    bytes.push(...vlq(0), 0xFF, 0x2F, 0x00);
    chunks.push(makeTrackChunk(bytes));
  }

  const ntrks = chunks.length;
  const header = [
    0x4D, 0x54, 0x68, 0x64,
    0x00, 0x00, 0x00, 0x06,
    0x00, 0x01,
    (ntrks >> 8) & 0xFF, ntrks & 0xFF,
    (PPQ >> 8) & 0xFF, PPQ & 0xFF,
  ];

  const flat = [];
  for (const b of header) flat.push(b);
  for (const chunk of chunks) for (const b of chunk) flat.push(b);

  const blob = new Blob([new Uint8Array(flat)], { type: 'audio/midi' });
  downloadBlob(blob, `bare-daw-${Date.now()}.mid`);
  setStatus('MIDI exported.');
  toast('MIDI saved');
}

function makeTrackChunk(eventBytes) {
  const length = eventBytes.length;
  return [
    0x4D, 0x54, 0x72, 0x6B,
    (length >> 24) & 0xFF,
    (length >> 16) & 0xFF,
    (length >> 8) & 0xFF,
    length & 0xFF,
    ...eventBytes,
  ];
}
function vlq(n) {
  if (n < 0) n = 0;
  if (n === 0) return [0];
  const out = [];
  while (n > 0) { out.unshift(n & 0x7F); n >>= 7; }
  for (let i = 0; i < out.length - 1; i++) out[i] |= 0x80;
  return out;
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------------- Web MIDI input ----------------
async function initMidi() {
  if (midiAccess) return;
  if (!navigator.requestMIDIAccess) {
    toast('Web MIDI not supported (try Chrome/Edge).');
    return;
  }
  try {
    midiAccess = await navigator.requestMIDIAccess();
    wireMidiInputs();
    midiAccess.onstatechange = wireMidiInputs;
    const count = countMidiInputs();
    midiBtn.classList.add('on');
    midiBtn.textContent = `MIDI: ${count} in`;
    toast(count > 0 ? `MIDI ready (${count} input${count === 1 ? '' : 's'}).` : 'MIDI ready — no inputs detected yet.');
  } catch (err) {
    console.error(err);
    toast('MIDI access denied.');
  }
}
function wireMidiInputs() {
  if (!midiAccess) return;
  midiAccess.inputs.forEach(input => { input.onmidimessage = onMidiMessage; });
  midiBtn.textContent = `MIDI: ${countMidiInputs()} in`;
}
function countMidiInputs() {
  if (!midiAccess) return 0;
  let n = 0;
  midiAccess.inputs.forEach(() => n++);
  return n;
}
function onMidiMessage(e) {
  const [status, data1, data2] = e.data;
  const cmd = status & 0xF0;
  if (cmd === 0x90 && data2 > 0) {
    const now = performance.now();
    const chord = (now - midiLastNoteTime) < 150;
    midiLastNoteTime = now;
    ensureAudio().then(() => insertNoteAtCursor(data1, insertLength, { chord }));
  }
}

// ---------------- Notation (VexFlow) ----------------
function renderNotation() {
  if (!notationEl) return;

  if (!selectedTrack || kindOf(selectedTrack) !== 'melodic') {
    notationEl.innerHTML = '<div class="notation-empty">Select a melodic track to see notation.</div>';
    notationLabelEl.textContent = 'Notation';
    return;
  }

  const sec = curSection();
  notationLabelEl.textContent = `Notation · ${INSTRUMENTS[selectedTrack.key].name} · ${sec.name}`;

  if (!window.Vex || !Vex.Flow) {
    notationEl.innerHTML = '<div class="notation-empty">Notation library unavailable.</div>';
    return;
  }

  notationEl.innerHTML = '';

  const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } = Vex.Flow;

  const d = trackData(selectedTrack, sec);
  const notes = d.notes;
  const stepsCount = sec.stepsCount;
  const stepsPerBar = 16;
  const numBars = Math.max(1, Math.ceil(stepsCount / stepsPerBar));

  // Group notes that start at the same step into chord events.
  const chordMap = new Map();
  for (const n of notes) {
    const arr = chordMap.get(n.start) || [];
    arr.push(n);
    chordMap.set(n.start, arr);
  }

  const clef = selectedTrack.key === 'bass' ? 'bass' : 'treble';
  const restAnchor = clef === 'bass' ? 'd/3' : 'b/4';

  const staveWidth = 240;
  const firstStaveExtra = 70;
  const totalWidth = 20 + firstStaveExtra + numBars * staveWidth;
  const height = 150;

  const renderer = new Renderer(notationEl, Renderer.Backends.SVG);
  renderer.resize(totalWidth, height);
  const context = renderer.getContext();

  let x = 10;
  for (let b = 0; b < numBars; b++) {
    const width = (b === 0 ? staveWidth + firstStaveExtra : staveWidth);
    const stave = new Stave(x, 10, width);
    if (b === 0) {
      stave.addClef(clef);
      stave.addTimeSignature('4/4');
    }
    stave.setContext(context).draw();

    const barStart = b * stepsPerBar;
    const barEnd = Math.min((b + 1) * stepsPerBar, stepsCount);
    const vfNotes = buildBarTickables(chordMap, barStart, barEnd, clef, restAnchor, StaveNote, Accidental);

    if (vfNotes.length > 0) {
      try {
        const voice = new Voice({ num_beats: 4, beat_value: 4 }).setStrict(false);
        voice.addTickables(vfNotes);
        new Formatter().joinVoices([voice]).format([voice], width - 60);
        voice.draw(context, stave);
      } catch (err) {
        console.warn('Notation render error on bar', b, err);
      }
    }

    x += width;
  }
}

function buildBarTickables(chordMap, barStart, barEnd, clef, restAnchor, StaveNote, Accidental) {
  const result = [];
  let cursor = barStart;
  while (cursor < barEnd) {
    const chord = chordMap.get(cursor);
    if (chord && chord.length > 0) {
      const sorted = [...chord].sort((a, b) => a.pitch - b.pitch);
      let durSteps = Math.min(...sorted.map(n => n.length));
      // Truncate if a new chord starts before this one ends.
      for (let s = cursor + 1; s < cursor + durSteps; s++) {
        if (chordMap.has(s)) { durSteps = s - cursor; break; }
      }
      durSteps = Math.min(durSteps, barEnd - cursor);

      const keys = sorted.map(n => midiToVfKey(n.pitch));
      const dur = stepsToVfDuration(durSteps);
      try {
        const note = new StaveNote({ keys, duration: dur, clef });
        keys.forEach((k, i) => {
          const m = /^([a-g])(#|b)/.exec(k);
          if (m) note.addModifier(new Accidental(m[2]), i);
        });
        result.push(note);
      } catch (e) {
        console.warn('StaveNote failed', keys, dur, e);
      }
      cursor += durSteps;
    } else {
      // Rest until next event or bar end.
      let next = barEnd;
      for (let s = cursor + 1; s < barEnd; s++) {
        if (chordMap.has(s)) { next = s; break; }
      }
      const restSteps = next - cursor;
      const dur = stepsToVfDuration(restSteps);
      try {
        result.push(new StaveNote({ keys: [restAnchor], duration: dur + 'r', clef }));
      } catch (e) {
        console.warn('Rest failed', dur, e);
      }
      cursor += restSteps;
    }
  }
  return result;
}

function midiToVfKey(midi) {
  const names = ['c','c#','d','d#','e','f','f#','g','g#','a','a#','b'];
  const octave = Math.floor(midi / 12) - 1;
  return `${names[midi % 12]}/${octave}`;
}
// Simplified duration mapping — rounds down to the nearest power-of-2 value.
// Non-standard lengths (3, 5, 6, 7…) render as the nearest smaller duration
// in the staff; the piano roll remains the source of truth for precise timing.
function stepsToVfDuration(steps) {
  if (steps >= 16) return 'w';
  if (steps >= 8) return 'h';
  if (steps >= 4) return 'q';
  if (steps >= 2) return '8';
  return '16';
}

// ---------------- Wiring ----------------
playBtn.addEventListener('click', async () => {
  if (state.playing) stopPlayback();
  else await startPlayback();
});
stopBtn.addEventListener('click', () => stopPlayback());
playModeBtn.addEventListener('click', togglePlayMode);

bpmEl.addEventListener('change', () => {
  const v = Math.max(40, Math.min(240, parseFloat(bpmEl.value) || 110));
  bpmEl.value = v;
  Tone.Transport.bpm.value = v;
});

stepsSelect.addEventListener('change', () => {
  const wasPlaying = state.playing;
  if (wasPlaying) stopPlayback();
  setStepsCount(stepsSelect.value);
  if (wasPlaying) startPlayback();
});

$('exportWavBtn').addEventListener('click', exportWav);
$('exportMidiBtn').addEventListener('click', exportMidi);
midiBtn.addEventListener('click', initMidi);
addSectionBtn.addEventListener('click', addSection);
dupSectionBtn.addEventListener('click', duplicateSection);

notationToggleBtn.addEventListener('click', () => {
  const panel = document.querySelector('.notation-panel');
  panel.classList.toggle('collapsed');
  notationToggleBtn.textContent = panel.classList.contains('collapsed') ? 'Show' : 'Hide';
});

function isTyping() {
  const el = document.activeElement;
  return !!el && /INPUT|SELECT|TEXTAREA/.test(el.tagName);
}

document.addEventListener('keydown', (e) => {
  if (isTyping()) return;

  if (e.code === 'Space') {
    e.preventDefault();
    if (state.playing) stopPlayback();
    else startPlayback();
    return;
  }

  if (!selectedTrack || kindOf(selectedTrack) !== 'melodic') return;

  const key = e.key.toLowerCase();

  if (key === '[') { e.preventDefault(); keyboardOctave = Math.max(0, keyboardOctave - 1); updateOctaveInfo(); return; }
  if (key === ']') { e.preventDefault(); keyboardOctave = Math.min(8, keyboardOctave + 1); updateOctaveInfo(); return; }
  if (e.code === 'Backspace') { e.preventDefault(); backspaceNote(); return; }
  if (e.code === 'ArrowLeft')  { e.preventDefault(); moveCursor(-1); return; }
  if (e.code === 'ArrowRight') { e.preventDefault(); moveCursor(1);  return; }
  if (e.code === 'Home') { e.preventDefault(); cursorStep = 0; updateCursor(); updateOctaveInfo(); return; }
  if (e.code === 'End')  { e.preventDefault(); cursorStep = curSection().stepsCount - 1; updateCursor(); updateOctaveInfo(); return; }

  if (/^[1-8]$/.test(key) && !e.repeat) {
    e.preventDefault();
    insertLength = parseInt(key, 10);
    updateOctaveInfo();
    return;
  }

  if (e.repeat) return;

  if (key in KEY_MAP) {
    e.preventDefault();
    const pitch = (keyboardOctave + 1) * 12 + KEY_MAP[key];
    ensureAudio().then(() => insertNoteAtCursor(pitch, insertLength));
  }
});

// ---------------- Boot ----------------
renderPalette();
renderSections();
updatePlayModeButton();
renderRuler();
renderTracks();
renderNotation();
setStatus('Drag an instrument into the timeline to begin.');
