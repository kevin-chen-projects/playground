// background.js — service worker. Handles YouTube Data API calls and scoring.
// Content scripts send messages; we reply with a channel analysis.

import { analyzeChannel } from "./heuristics.js";

const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6h — channel stats change slowly

async function getCached(key) {
  const { [key]: entry } = await chrome.storage.local.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) return null;
  return entry.result;
}

async function setCached(key, result) {
  await chrome.storage.local.set({ [key]: { timestamp: Date.now(), result } });
}

async function analyze({ id, handle }) {
  const cacheKey = id ? `channel:${id}` : `handle:${handle}`;
  const cached = await getCached(cacheKey);
  if (cached) return { ...cached, cached: true };

  const result = await analyzeChannel({ id, handle });
  // Dual-key cache: store by resolved channelId too, so future ID-based lookups hit.
  if (result.channelId) await setCached(`channel:${result.channelId}`, result);
  await setCached(cacheKey, result);
  return { ...result, cached: false };
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type !== "analyzeChannel") return;
  if (!msg.channelId && !msg.channelHandle) {
    sendResponse({ ok: false, error: "Missing channelId or channelHandle" });
    return;
  }

  analyze({ id: msg.channelId, handle: msg.channelHandle })
    .then((result) => sendResponse({ ok: true, result }))
    .catch((err) => sendResponse({ ok: false, error: err.message }));

  return true; // keep the message channel open for async response
});
