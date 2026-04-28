// options.js — load/save the YouTube Data API key, clear cache.

const form = document.getElementById("key-form");
const input = document.getElementById("api-key");
const saveStatus = document.getElementById("save-status");
const cacheStatus = document.getElementById("cache-status");

init();

async function init() {
  const { ytApiKey } = await chrome.storage.sync.get("ytApiKey");
  if (ytApiKey) input.value = ytApiKey;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const key = input.value.trim();
    if (!key) {
      setStatus(saveStatus, "error", "Enter an API key first.");
      return;
    }
    await chrome.storage.sync.set({ ytApiKey: key });
    setStatus(saveStatus, "ok", "Saved.");
  });

  document.getElementById("clear-key").addEventListener("click", async () => {
    await chrome.storage.sync.remove("ytApiKey");
    input.value = "";
    setStatus(saveStatus, "ok", "API key cleared.");
  });

  document.getElementById("clear-cache").addEventListener("click", async () => {
    const all = await chrome.storage.local.get(null);
    const keys = Object.keys(all).filter((k) => k.startsWith("channel:") || k.startsWith("handle:"));
    if (keys.length === 0) {
      setStatus(cacheStatus, "ok", "Cache was already empty.");
      return;
    }
    await chrome.storage.local.remove(keys);
    setStatus(cacheStatus, "ok", `Cleared ${keys.length} cached entr${keys.length === 1 ? "y" : "ies"}.`);
  });
}

function setStatus(el, kind, msg) {
  el.textContent = msg;
  el.dataset.kind = kind;
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.textContent = "";
    delete el.dataset.kind;
  }, 3000);
}
