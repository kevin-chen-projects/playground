# Notes

## 2026-05-21
Consolidated the useful detail from the earlier README into the normalized documentation set and kept the project focused on a clear division between overview, durable state, and append-only history. The extension remains a plain Manifest V3 Chrome extension with caption-based sponsor detection as the primary mode, an experimental visual detector, and URL-change handling for YouTube's SPA navigation.

Open questions:
- Should the next iteration remain heuristic-only or add SponsorBlock / external data?
- Is fixed-duration skipping sufficient, or should segment-end tracking be prioritized?
- Do we need per-channel allow/block rules before any broader release work?

Next step:
- Choose whether to invest next in detection reliability or a stronger data source such as SponsorBlock.
