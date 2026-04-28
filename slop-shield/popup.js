// popup.js — reads current tab state and renders the analysis, or a setup prompt.

document.getElementById("open-options").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

init();

async function init() {
  const { ytApiKey } = await chrome.storage.sync.get("ytApiKey");
  if (!ytApiKey) {
    setStatus("error", "No YouTube API key set. Click 'Options & API key' below to configure.");
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url || !/^https?:\/\/([^.]+\.)?youtube\.com\//.test(tab.url)) {
    setStatus("info", "Open a YouTube video to see Slop Shield analysis.");
    return;
  }
  if (!/\/watch\b/.test(tab.url)) {
    setStatus("info", "Navigate to a YouTube watch page (/watch) to run analysis.");
    return;
  }

  // Ask the content script for its most recent result.
  chrome.tabs.sendMessage(tab.id, { type: "getCurrentAnalysis" }, (response) => {
    if (chrome.runtime.lastError || !response) {
      setStatus("info", "Content script not ready. Reload the YouTube tab and try again.");
      return;
    }
    if (response.state === "error") {
      setStatus("error", response.error ?? "Analysis failed.");
      return;
    }
    if (response.state === "loading" || !response.result) {
      setStatus("info", "Still analyzing this video…");
      return;
    }
    renderResult(response.result);
  });
}

function setStatus(state, message) {
  const status = document.getElementById("status");
  status.dataset.state = state;
  status.querySelector(".popup-status-message").textContent = message;
  status.hidden = false;
  document.getElementById("result").hidden = true;
}

function renderResult(result) {
  document.getElementById("status").hidden = true;
  const section = document.getElementById("result");
  section.hidden = false;

  const tier = tierFromScore(result.score);
  section.dataset.tier = tier;
  section.querySelector(".popup-result-title").textContent = result.channelTitle ?? "Unknown channel";
  section.querySelector(".popup-result-subtitle").textContent =
    result.score == null
      ? labelFromTier(tier)
      : `${labelFromTier(tier)} · score ${result.score.toFixed(2)}${result.cached ? " · cached" : ""}`;

  const list = section.querySelector(".popup-signals");
  list.innerHTML = "";
  for (const s of result.signals ?? []) {
    const li = document.createElement("li");
    li.className = "popup-signal";
    li.dataset.tier = tierFromScore(s.score);
    li.innerHTML = `
      <div class="popup-signal-name">${escapeHtml(s.name.replace(/_/g, " "))}</div>
      <div class="popup-signal-bar"><span style="width:${Math.round(s.score * 100)}%"></span></div>
      <div class="popup-signal-detail">${escapeHtml(s.detail ?? "")}</div>`;
    list.appendChild(li);
  }
}

function tierFromScore(score) {
  if (score == null) return "unknown";
  if (score >= 0.65) return "high";
  if (score >= 0.35) return "medium";
  return "low";
}

function labelFromTier(tier) {
  return {
    low: "Looks human",
    medium: "Mixed signals",
    high: "Likely AI slop",
    unknown: "Insufficient data",
  }[tier];
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
