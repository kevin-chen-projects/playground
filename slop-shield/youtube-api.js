// youtube-api.js — thin wrapper around YouTube Data API v3.
// All calls require an API key stored in chrome.storage.sync under "ytApiKey".

const BASE = "https://www.googleapis.com/youtube/v3";

async function getApiKey() {
  const { ytApiKey } = await chrome.storage.sync.get("ytApiKey");
  if (!ytApiKey) throw new Error("No YouTube Data API key set. Open the extension options to add one.");
  return ytApiKey;
}

async function call(path, params) {
  const key = await getApiKey();
  const url = new URL(`${BASE}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("key", key);

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

export async function fetchChannel(channelId) {
  const data = await call("channels", {
    part: "snippet,statistics,contentDetails",
    id: channelId,
  });
  return data.items?.[0] ?? null;
}

export async function fetchChannelByHandle(handle) {
  const clean = handle.startsWith("@") ? handle : `@${handle}`;
  const data = await call("channels", {
    part: "snippet,statistics,contentDetails",
    forHandle: clean,
  });
  return data.items?.[0] ?? null;
}

export async function fetchRecentUploads(uploadsPlaylistId, maxResults = 20) {
  const data = await call("playlistItems", {
    part: "snippet,contentDetails",
    playlistId: uploadsPlaylistId,
    maxResults: String(maxResults),
  });
  return data.items ?? [];
}

export async function fetchVideoDetails(videoIds) {
  if (videoIds.length === 0) return [];
  const data = await call("videos", {
    part: "contentDetails,statistics",
    id: videoIds.join(","),
  });
  return data.items ?? [];
}
