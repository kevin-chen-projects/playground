// heuristics.js — Layer 1 channel scoring. Pure functions over YouTube Data API responses.
// Each signal returns { name, score (0-1, higher = more slop-like), detail, weight }.

import { fetchChannel, fetchChannelByHandle, fetchRecentUploads, fetchVideoDetails } from "./youtube-api.js";

const DAY_MS = 1000 * 60 * 60 * 24;

export async function analyzeChannel({ id, handle }) {
  let channel = null;
  if (id) channel = await fetchChannel(id);
  else if (handle) channel = await fetchChannelByHandle(handle);
  if (!channel) {
    return { channelId: id ?? null, handle: handle ?? null, score: null, signals: [], error: "Channel not found" };
  }

  const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;
  const uploads = uploadsPlaylistId ? await fetchRecentUploads(uploadsPlaylistId, 20) : [];
  const videoIds = uploads.map((u) => u.contentDetails?.videoId).filter(Boolean);
  const videoDetails = videoIds.length ? await fetchVideoDetails(videoIds) : [];

  const ctx = { channel, uploads, videoDetails };
  const signalFns = [
    channelAgeSignal,
    uploadCadenceSignal,
    viewSubRatioSignal,
    durationConsistencySignal,
    titleEntropySignal,
    descriptionBoilerplateSignal,
    // TODO: thumbnailSimilaritySignal — needs ONNX CLIP in-browser
  ];
  const signals = signalFns.map((fn) => fn(ctx)).filter((s) => s && s.score !== null);

  return {
    channelId: channel.id,
    channelTitle: channel.snippet?.title,
    channelThumb: channel.snippet?.thumbnails?.default?.url,
    score: composite(signals),
    signals,
    metadata: {
      subscriberCount: Number(channel.statistics?.subscriberCount ?? 0),
      viewCount: Number(channel.statistics?.viewCount ?? 0),
      videoCount: Number(channel.statistics?.videoCount ?? 0),
      publishedAt: channel.snippet?.publishedAt,
    },
  };
}

function composite(signals) {
  if (signals.length === 0) return null;
  const totalWeight = signals.reduce((s, x) => s + (x.weight ?? 1), 0);
  const weighted = signals.reduce((s, x) => s + x.score * (x.weight ?? 1), 0);
  return weighted / totalWeight;
}

// ---- individual signals ----

function channelAgeSignal({ channel }) {
  const publishedAt = channel.snippet?.publishedAt;
  if (!publishedAt) return { name: "channel_age", score: null };
  const ageDays = (Date.now() - new Date(publishedAt).getTime()) / DAY_MS;
  // < 30d: 1.0, 30-365d: linear, > 365d: 0. Young alone isn't suspicious, so weight is low.
  let score;
  if (ageDays < 30) score = 1.0;
  else if (ageDays < 365) score = 1.0 - (ageDays - 30) / 335;
  else score = 0;
  return {
    name: "channel_age",
    score,
    detail: `Channel is ${Math.round(ageDays)} days old`,
    weight: 0.5,
  };
}

function uploadCadenceSignal({ channel }) {
  const videoCount = Number(channel.statistics?.videoCount ?? 0);
  const publishedAt = channel.snippet?.publishedAt;
  if (!publishedAt || videoCount === 0) return { name: "upload_cadence", score: null };
  const ageDays = Math.max(1, (Date.now() - new Date(publishedAt).getTime()) / DAY_MS);
  const perDay = videoCount / ageDays;
  // Most humans: < 0.3/day. AI farms: 1-5/day. Map: 0.3 → 0, 1 → 0.5, 3 → 1.0.
  let score;
  if (perDay < 0.3) score = 0;
  else if (perDay < 3) score = (perDay - 0.3) / 2.7;
  else score = 1.0;
  return {
    name: "upload_cadence",
    score,
    detail: `${perDay.toFixed(2)} uploads/day lifetime average`,
    weight: 2.0, // strong signal
  };
}

function viewSubRatioSignal({ channel }) {
  const views = Number(channel.statistics?.viewCount ?? 0);
  const subs = Number(channel.statistics?.subscriberCount ?? 0);
  if (subs === 0 || views === 0) return { name: "view_sub_ratio", score: null };
  const ratio = views / subs;
  // Healthy channels: 10-50. Algo-boosted slop: 100-1000+.
  let score;
  if (ratio < 30) score = 0;
  else if (ratio < 300) score = (ratio - 30) / 270;
  else score = 1.0;
  return {
    name: "view_sub_ratio",
    score,
    detail: `${ratio.toFixed(0)}:1 view-to-subscriber ratio`,
    weight: 1.0,
  };
}

function durationConsistencySignal({ videoDetails }) {
  if (videoDetails.length < 5) return { name: "duration_consistency", score: null };
  const durations = videoDetails
    .map((v) => parseIso8601Duration(v.contentDetails?.duration))
    .filter((d) => d > 0);
  if (durations.length < 5) return { name: "duration_consistency", score: null };
  const mean = durations.reduce((s, d) => s + d, 0) / durations.length;
  const variance = durations.reduce((s, d) => s + (d - mean) ** 2, 0) / durations.length;
  const cv = Math.sqrt(variance) / mean; // coefficient of variation
  // Humans: CV > 0.4. Template-length slop: CV < 0.15.
  let score;
  if (cv > 0.4) score = 0;
  else if (cv > 0.1) score = 1.0 - (cv - 0.1) / 0.3;
  else score = 1.0;
  return {
    name: "duration_consistency",
    score,
    detail: `Durations cluster at ~${Math.round(mean / 60)}min (CV=${cv.toFixed(2)})`,
    weight: 1.0,
  };
}

function titleEntropySignal({ uploads }) {
  if (uploads.length < 5) return { name: "title_entropy", score: null };
  const tokens = uploads
    .flatMap((u) => tokenize(u.snippet?.title ?? ""))
    .filter((t) => t.length > 2); // drop stopword-ish short tokens
  if (tokens.length < 20) return { name: "title_entropy", score: null };
  const entropy = shannonEntropy(tokens);
  // Diverse human titles: entropy > 5.5. Template slop: < 4.0.
  let score;
  if (entropy > 5.5) score = 0;
  else if (entropy > 3.5) score = 1.0 - (entropy - 3.5) / 2.0;
  else score = 1.0;
  return {
    name: "title_entropy",
    score,
    detail: `Title vocabulary entropy ${entropy.toFixed(2)} bits`,
    weight: 1.0,
  };
}

function descriptionBoilerplateSignal({ channel }) {
  const desc = channel.snippet?.description ?? "";
  if (desc.length < 20) return { name: "description_boilerplate", score: null };
  const patterns = [
    /\bwelcome to (our|my|the) channel\b/i,
    /\bdon'?t forget to (like|subscribe|hit the bell)\b/i,
    /\bsubscribe for (more|daily)\b/i,
    /\bbusiness inquiries?\s*:\s*\S+@\S+/i,
    /\bamzn\.to\/|\bgeni\.us\/|\bbit\.ly\//i, // affiliate-link patterns
    /\ball credit goes to (the )?(original )?(owner|creator)s?\b/i,
    /\bthis video (is|was) (generated|created) (using|with) ai\b/i,
  ];
  const hits = patterns.filter((p) => p.test(desc)).length;
  const score = Math.min(1.0, hits / 3); // 3+ patterns → fully suspicious
  return {
    name: "description_boilerplate",
    score,
    detail: `${hits} boilerplate pattern${hits === 1 ? "" : "s"} matched in channel description`,
    weight: 0.7,
  };
}

// ---- utilities ----

function parseIso8601Duration(iso) {
  if (!iso) return 0;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const [, h, min, s] = m;
  return Number(h ?? 0) * 3600 + Number(min ?? 0) * 60 + Number(s ?? 0);
}

function tokenize(str) {
  return str
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function shannonEntropy(tokens) {
  const counts = new Map();
  for (const t of tokens) counts.set(t, (counts.get(t) ?? 0) + 1);
  const n = tokens.length;
  let h = 0;
  for (const c of counts.values()) {
    const p = c / n;
    h -= p * Math.log2(p);
  }
  return h;
}
