/*
 * YouTube Smart Skip — popup controller
 * Read defaults from storage.sync, render into form, persist on change.
 * content.js listens to storage.onChanged and reattaches.
 */

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

const $ = (id) => document.getElementById(id);

function load() {
  chrome.storage.sync.get(DEFAULTS, (cfg) => {
    $('enabled').checked       = !!cfg.enabled;
    $('captionDetect').checked = !!cfg.captionDetect;
    $('visualDetect').checked  = !!cfg.visualDetect;
    $('showToast').checked     = !!cfg.showToast;

    $('skipSeconds').value         = cfg.skipSeconds;
    $('skipSecondsLabel').textContent = cfg.skipSeconds + 's';

    const sens = Number(cfg.sensitivity);
    $('sensitivity').value         = sens;
    $('sensitivityLabel').textContent = sens.toFixed(2);

    $('keywords').value = (cfg.keywords || []).join('\n');
  });
}

function save(obj) {
  chrome.storage.sync.set(obj);
}

function bindCheckbox(id) {
  $(id).addEventListener('change', (e) => save({ [id]: e.target.checked }));
}

['enabled', 'captionDetect', 'visualDetect', 'showToast'].forEach(bindCheckbox);

$('skipSeconds').addEventListener('input', (e) => {
  const v = parseInt(e.target.value, 10);
  $('skipSecondsLabel').textContent = v + 's';
  save({ skipSeconds: v });
});

$('sensitivity').addEventListener('input', (e) => {
  const v = parseFloat(e.target.value);
  $('sensitivityLabel').textContent = v.toFixed(2);
  save({ sensitivity: v });
});

$('keywords').addEventListener('input', (e) => {
  const list = e.target.value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  save({ keywords: list });
});

$('reset').addEventListener('click', () => {
  chrome.storage.sync.set(DEFAULTS, load);
});

load();
