// content.js — injected into YouTube pages. Detects watch-page navigation,
// extracts channel identity, asks background to analyze, renders a badge overlay.

const STATE = {
  currentChannelKey: null, // "id:UC..." or "handle:@..." to dedupe
  badgeEl: null,
  panelEl: null,
  lastResult: null,
  lastState: "idle", // "idle" | "loading" | "error" | "done"
  lastError: null,
};

init();

function init() {
  // YouTube is a SPA; it fires yt-navigate-finish on soft navigation.
  window.addEventListener("yt-navigate-finish", handleNavigation);
  // Also run once on hard load.
  handleNavigation();

  // Popup asks us for the current analysis state.
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type !== "getCurrentAnalysis") return;
    sendResponse({
      state: STATE.lastState,
      result: STATE.lastResult,
      error: STATE.lastError,
    });
    return true;
  });
}

function handleNavigation() {
  if (location.pathname !== "/watch") {
    removeBadge();
    STATE.currentChannelKey = null;
    STATE.lastState = "idle";
    STATE.lastResult = null;
    STATE.lastError = null;
    return;
  }
  // DOM may not be populated yet after SPA nav; poll briefly.
  waitForChannelLink().then((idOrHandle) => {
    if (!idOrHandle) return;
    const key = idOrHandle.type === "id" ? `id:${idOrHandle.value}` : `handle:${idOrHandle.value}`;
    if (key === STATE.currentChannelKey) return;
    STATE.currentChannelKey = key;
    renderLoading();
    requestAnalysis(idOrHandle);
  });
}

function waitForChannelLink(timeoutMs = 8000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const tick = () => {
      const found = extractChannelFromDom();
      if (found) return resolve(found);
      if (Date.now() - start > timeoutMs) return resolve(null);
      setTimeout(tick, 250);
    };
    tick();
  });
}

function extractChannelFromDom() {
  // Video-owner block is the most reliable place.
  const scopes = [
    document.querySelector("ytd-video-owner-renderer"),
    document.querySelector("#upload-info"),
    document.querySelector("ytd-channel-name"),
    document,
  ].filter(Boolean);

  for (const scope of scopes) {
    const links = scope.querySelectorAll('a[href^="/channel/"], a[href^="/@"]');
    for (const a of links) {
      const href = a.getAttribute("href") || "";
      const idMatch = href.match(/^\/channel\/(UC[\w-]{20,})/);
      if (idMatch) return { type: "id", value: idMatch[1] };
      const handleMatch = href.match(/^\/(@[\w.-]+)/);
      if (handleMatch) return { type: "handle", value: handleMatch[1] };
    }
  }
  return null;
}

function requestAnalysis({ type, value }) {
  const payload = { type: "analyzeChannel" };
  if (type === "id") payload.channelId = value;
  else payload.channelHandle = value;

  STATE.lastState = "loading";
  STATE.lastResult = null;
  STATE.lastError = null;

  chrome.runtime.sendMessage(payload, (response) => {
    if (chrome.runtime.lastError) {
      STATE.lastState = "error";
      STATE.lastError = chrome.runtime.lastError.message;
      renderError(chrome.runtime.lastError.message);
      return;
    }
    if (!response?.ok) {
      STATE.lastState = "error";
      STATE.lastError = response?.error ?? "Unknown error";
      renderError(STATE.lastError);
      return;
    }
    STATE.lastState = "done";
    STATE.lastResult = response.result;
    renderResult(response.result);
  });
}

// ---- rendering ----

function ensureBadge() {
  if (STATE.badgeEl && document.body.contains(STATE.badgeEl)) return;

  const root = document.createElement("div");
  root.id = "slop-shield-root";
  root.className = "slop-shield-root";

  const pill = document.createElement("button");
  pill.className = "slop-shield-pill";
  pill.type = "button";
  pill.setAttribute("aria-label", "Slop Shield analysis");
  pill.addEventListener("click", togglePanel);

  const panel = document.createElement("div");
  panel.className = "slop-shield-panel";
  panel.hidden = true;

  root.appendChild(pill);
  root.appendChild(panel);
  document.body.appendChild(root);

  STATE.badgeEl = pill;
  STATE.panelEl = panel;
}

function removeBadge() {
  const root = document.getElementById("slop-shield-root");
  if (root) root.remove();
  STATE.badgeEl = null;
  STATE.panelEl = null;
}

function togglePanel() {
  if (!STATE.panelEl) return;
  STATE.panelEl.hidden = !STATE.panelEl.hidden;
}

function renderLoading() {
  ensureBadge();
  STATE.badgeEl.dataset.state = "loading";
  STATE.badgeEl.textContent = "Slop Shield: analyzing…";
  STATE.panelEl.innerHTML = `<div class="slop-shield-panel-body">Fetching channel signals…</div>`;
}

function renderError(message) {
  ensureBadge();
  STATE.badgeEl.dataset.state = "error";
  STATE.badgeEl.textContent = "Slop Shield: error";
  STATE.panelEl.innerHTML = `<div class="slop-shield-panel-body">${escapeHtml(message)}</div>`;
}

function renderResult(result) {
  ensureBadge();
  const score = result.score;
  const tier = tierFromScore(score);
  STATE.badgeEl.dataset.state = tier;
  STATE.badgeEl.textContent = `Slop Shield: ${labelFromTier(tier)}${
    score == null ? "" : ` (${Math.round(score * 100)}%)`
  }`;

  const header = `
    <div class="slop-shield-panel-header">
      <div class="slop-shield-panel-title">${escapeHtml(result.channelTitle ?? "Unknown channel")}</div>
      <div class="slop-shield-panel-subtitle">${labelFromTier(tier)}${
    score == null ? "" : ` · score ${score.toFixed(2)}`
  }${result.cached ? " · cached" : ""}</div>
    </div>`;

  const signalsHtml =
    (result.signals ?? [])
      .map(
        (s) => `
      <li class="slop-shield-signal" data-tier="${tierFromScore(s.score)}">
        <div class="slop-shield-signal-name">${escapeHtml(s.name.replace(/_/g, " "))}</div>
        <div class="slop-shield-signal-bar"><span style="width:${Math.round(s.score * 100)}%"></span></div>
        <div class="slop-shield-signal-detail">${escapeHtml(s.detail ?? "")}</div>
      </li>`,
      )
      .join("") || `<li class="slop-shield-signal-empty">No signals produced a score.</li>`;

  STATE.panelEl.innerHTML = `
    ${header}
    <ul class="slop-shield-signals">${signalsHtml}</ul>
    <div class="slop-shield-panel-footer">
      Channel-level heuristics only. Voice/text/face signals not yet implemented.
    </div>`;
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
    loading: "Analyzing",
    error: "Error",
  }[tier];
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
