/*
 * YouTube Smart Skip — content script
 *
 * Runs on every youtube.com page. On /watch URLs it attaches two
 * independent sponsor-segment detectors to the active <video>:
 *
 *   1. CAPTION DETECTION (default on)
 *      Observes the YouTube caption DOM (.ytp-caption-segment), keeps
 *      a rolling buffer of recent caption text, and triggers a skip when
 *      the buffer matches one of the sponsor keywords.
 *
 *   2. VISUAL PROGRESS-BAR DETECTION (opt-in, experimental)
 *      Every 500 ms, draws the bottom strip of the video to an offscreen
 *      canvas and scans for a horizontal band of near-constant color
 *      (typical "sponsor progress bar" overlays creators bake into the
 *      video itself). If the band is stable across frames AND grows in
 *      width over time it is treated as a progress bar.
 *      Note: cross-origin video frames may produce a tainted canvas;
 *      we silently no-op in that case.
 *
 * Skip action:
 *   - Jumps videoEl.currentTime forward by `skipSeconds` (default 30).
 *   - Shows a toast with an Undo button (5s).
 *   - Debounced to fire at most once every 5 s.
 *
 * SPA handling:
 *   YouTube is a single-page app — the page never reloads when you click
 *   a new video. We watch for URL changes and re-attach detectors.
 *
 * FILE INDEX
 *    33   DEFAULTS — settings shape + sponsor keyword seed list
 *    65   State + bootstrap (storage load, change listener, SPA watcher)
 *   105   setup() / teardown() — per-video attach/detach
 *   130   findVideo() — wait for the html5 player element
 *   145   CAPTION DETECTION — observer + keyword match
 *   195   VISUAL DETECTION — interval, bottom-strip sample, bar scan
 *   270   triggerSkip() — debounced jump + toast
 *   295   showToast() — DOM toast with Undo
 */

(() => {
  'use strict';

  // ---------------- DEFAULTS ----------------
  const DEFAULTS = {
    enabled: true,
    captionDetect: true,
    visualDetect: false,
    skipSeconds: 30,
    showToast: true,
    sensitivity: 0.7,
    keywords: [
      'sponsor of',
      'sponsored by',
      'brought to you by',
      'thanks to our sponsor',
      "today's video is brought",
      "today's sponsor",
      'use code',
      'promo code',
      'discount code',
      'first 100',
      'limited time offer',
      'sign up at',
      'link in the description',
      'check out their website',
      '% off your first'
    ]
  };

  let cfg = { ...DEFAULTS };
  let videoEl = null;
  let captionObserver = null;
  let visualInterval = null;
  let recentCaptions = [];
  let lastSkipTime = 0;
  let canvas = null;
  let canvasCtx = null;
  let lastSettingsLoaded = false;

  // ---------------- BOOTSTRAP ----------------
  chrome.storage.sync.get(DEFAULTS, (loaded) => {
    cfg = { ...DEFAULTS, ...loaded };
    lastSettingsLoaded = true;
    setup();
  });

  if (chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'sync') return;
      for (const [key, { newValue }] of Object.entries(changes)) {
        if (key in cfg) cfg[key] = newValue;
      }
      teardown();
      setup();
    });
  }

  // SPA navigation watcher — YouTube swaps videos without a page reload.
  let lastUrl = location.href;
  const navObserver = new MutationObserver(() => {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    teardown();
    // Wait for the new player to mount.
    setTimeout(() => { if (lastSettingsLoaded) setup(); }, 1000);
  });
  navObserver.observe(document.documentElement, { childList: true, subtree: true });

  // ---------------- SETUP / TEARDOWN ----------------
  function setup() {
    if (!cfg.enabled) return;
    if (!location.pathname.startsWith('/watch')) return;

    findVideo()
      .then((v) => {
        videoEl = v;
        recentCaptions = [];
        if (cfg.captionDetect) startCaptionWatch();
        if (cfg.visualDetect) startVisualWatch();
      })
      .catch(() => { /* no player yet — give up silently */ });
  }

  function teardown() {
    if (captionObserver) { captionObserver.disconnect(); captionObserver = null; }
    if (visualInterval) { clearInterval(visualInterval); visualInterval = null; }
    recentCaptions = [];
  }

  function findVideo(retries = 30) {
    return new Promise((resolve, reject) => {
      const tick = () => {
        const v = document.querySelector('video.html5-main-video') ||
                  document.querySelector('video');
        if (v && v.readyState >= 1) return resolve(v);
        if (--retries <= 0) return reject(new Error('no video'));
        setTimeout(tick, 500);
      };
      tick();
    });
  }

  // ---------------- CAPTION DETECTION ----------------
  function startCaptionWatch() {
    captionObserver = new MutationObserver(() => {
      const segments = document.querySelectorAll(
        '.ytp-caption-segment, .caption-visual-line, .ytp-caption-window-container .caption-window'
      );
      if (!segments.length) return;

      const text = Array.from(segments)
        .map((s) => s.innerText || s.textContent || '')
        .join(' ')
        .toLowerCase()
        .trim();
      if (!text) return;

      // Append to rolling buffer (dedupe consecutive duplicates).
      if (recentCaptions[recentCaptions.length - 1] !== text) {
        recentCaptions.push(text);
        if (recentCaptions.length > 25) recentCaptions.shift();
      }

      const buffered = recentCaptions.join(' ');
      if (matchesSponsorKeywords(buffered)) {
        triggerSkip('caption');
        // After a skip, drop the buffer so we don't immediately retrigger
        // on the same window of captions.
        recentCaptions = [];
      }
    });

    captionObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  function matchesSponsorKeywords(text) {
    if (!cfg.keywords || !cfg.keywords.length) return false;
    let strongHits = 0;
    for (const raw of cfg.keywords) {
      const kw = String(raw).toLowerCase().trim();
      if (!kw) continue;
      if (text.includes(kw)) strongHits++;
    }
    // Single-phrase trigger is fine — sponsor phrases are very specific.
    return strongHits >= 1;
  }

  // ---------------- VISUAL PROGRESS-BAR DETECTION ----------------
  function startVisualWatch() {
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvasCtx = canvas.getContext('2d', { willReadFrequently: true });
    }

    let prevColor = null;
    let prevWidth = 0;
    let stableFrames = 0;
    let growingFrames = 0;

    visualInterval = setInterval(() => {
      if (!videoEl || videoEl.paused || videoEl.ended) return;

      const sample = sampleBottomStrip();
      if (!sample) return;

      const bar = detectHorizontalBar(sample);

      if (bar.found) {
        if (prevColor && colorsClose(prevColor, bar.color)) {
          stableFrames++;
          if (bar.width >= prevWidth) growingFrames++;
        } else {
          stableFrames = 1;
          growingFrames = 0;
        }
        prevColor = bar.color;
        prevWidth = bar.width;

        // Persisted >3s and width is non-decreasing → likely a progress bar.
        if (stableFrames >= 6 && growingFrames >= 4) {
          triggerSkip('visual');
          stableFrames = 0;
          growingFrames = 0;
          prevColor = null;
        }
      } else {
        stableFrames = 0;
        growingFrames = 0;
        prevColor = null;
      }
    }, 500);
  }

  function sampleBottomStrip() {
    if (!videoEl || !videoEl.videoWidth || !videoEl.videoHeight) return null;
    // Downsample bottom 12% of the frame.
    const w = 200;
    const h = 24;
    const srcY = Math.floor(videoEl.videoHeight * 0.88);
    const srcH = videoEl.videoHeight - srcY;
    canvas.width = w;
    canvas.height = h;
    try {
      canvasCtx.drawImage(videoEl, 0, srcY, videoEl.videoWidth, srcH, 0, 0, w, h);
      return canvasCtx.getImageData(0, 0, w, h);
    } catch (e) {
      // Tainted canvas (cross-origin video) — disable visual mode for now.
      if (visualInterval) { clearInterval(visualInterval); visualInterval = null; }
      console.warn('[YT Smart Skip] visual detection disabled — canvas tainted by cross-origin video');
      return null;
    }
  }

  function detectHorizontalBar(imageData) {
    const { data, width, height } = imageData;
    let best = { found: false, color: [0, 0, 0], width: 0, score: 0, y: -1 };

    for (let y = 0; y < height; y++) {
      let r = 0, g = 0, b = 0;
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        r += data[i]; g += data[i + 1]; b += data[i + 2];
      }
      r /= width; g /= width; b /= width;

      // Find the longest run of pixels in this row whose color stays close
      // to the row mean. That run length is a proxy for "bar width".
      let maxRun = 0, run = 0;
      let varianceAccum = 0;
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const dr = data[i] - r, dg = data[i + 1] - g, db = data[i + 2] - b;
        const d2 = dr * dr + dg * dg + db * db;
        varianceAccum += d2;
        if (d2 < 600) {
          run++;
          if (run > maxRun) maxRun = run;
        } else {
          run = 0;
        }
      }
      const variance = varianceAccum / width;
      const consistencyRatio = maxRun / width;
      const score = consistencyRatio - Math.min(1, variance / 6000);

      if (score > best.score && consistencyRatio > 0.3) {
        best = { found: false, color: [r, g, b], width: maxRun, score, y };
      }
    }

    best.found = best.score > cfg.sensitivity;
    return best;
  }

  function colorsClose(a, b) {
    const dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2];
    return dr * dr + dg * dg + db * db < 1500;
  }

  // ---------------- SKIP ACTION ----------------
  function triggerSkip(source) {
    if (!videoEl) return;
    const now = Date.now();
    if (now - lastSkipTime < 5000) return; // debounce
    lastSkipTime = now;

    const before = videoEl.currentTime;
    const target = Math.min((videoEl.duration || before + cfg.skipSeconds) - 0.5,
                             before + cfg.skipSeconds);
    if (target <= before) return;

    videoEl.currentTime = target;

    if (cfg.showToast) {
      const label = source === 'caption' ? 'sponsor phrase' : 'progress bar';
      showToast(`Skipped ${cfg.skipSeconds}s — detected ${label}`, before);
    }
  }

  // ---------------- TOAST ----------------
  function showToast(msg, undoTime) {
    let toast = document.getElementById('yss-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'yss-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = '';

    const dot = document.createElement('span');
    dot.className = 'yss-dot';
    toast.appendChild(dot);

    const span = document.createElement('span');
    span.className = 'yss-msg';
    span.textContent = msg;
    toast.appendChild(span);

    if (typeof undoTime === 'number') {
      const undo = document.createElement('button');
      undo.textContent = 'Undo';
      undo.className = 'yss-undo';
      undo.addEventListener('click', () => {
        if (videoEl) videoEl.currentTime = undoTime;
        toast.classList.remove('show');
      });
      toast.appendChild(undo);
    }

    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 5000);
  }
})();
