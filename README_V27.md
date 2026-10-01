# VOID V27 — Actual + xgdxtcom catalog

Changes:
- Added five user-provided xgdxtcom beats to the creator profile and bundled their audio previews:
  - NO TRUST — 153 BPM
  - MASTER CARD — 156 BPM
  - FOLLOW U — 200 BPM
  - МИШКАДЖЕКС — 143 BPM
  - 300726 — 140 BPM
- Added an ACTUAL section to the homepage. It shows products published within the last 60 minutes.
- The prototype feed stores timestamps in localStorage and refreshes every 30 seconds. Demo uploads can publish a timestamped item into ACTUAL.
- Removed the “Selected credits & activity” section from creator profiles.
- Genius profile section remains.

For production, the ACTUAL feed should use server/database publication timestamps rather than localStorage.
