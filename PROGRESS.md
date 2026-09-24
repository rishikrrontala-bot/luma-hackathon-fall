# PROGRESS: LUMA Hackathon (Fall 2026)

**Deadline:** Mon Sep 28, 2026 · 5:00 PM EDT (`2026-09-28T17:00:00-04:00`)
**Internal "done" target:** Sun Sep 27, 2026 · 5:00 PM EDT (≥24 h before the deadline, per CLAUDE.md lesson 2)

## Countdown log
| Phase start (ET) | Hours to deadline | Phase |
|---|---|---|
| Wed Sep 23 · 10:33 PM EDT | 114.4 h | 0: setup + plan |

## Phase plan (budgeted backwards from the internal target)
~90 working hours between now and the internal done target. Research gets a fixed front slice; the rest follows the hackathon-win Phase 4 split.

| Slice | Budget | Window (ET, approx.) |
|---|---|---|
| 0. Setup, tool check, plan | 0.5 h | Wed 10:30 PM |
| 1–2. Research: verify HACKATHON.md, 5–8 winner briefs, research brief | 3 h | Wed night → Thu early |
| 3. Concepts (3 scored), pick, CONCEPT.md pushed | 1 h | Thu early |
| 4. Design direction (PRODUCT.md + DESIGN.md) | 1.5 h | Thu |
| 5. Core build: wow moment → demo path → rest (~50%) | ~40 h | Thu → Sat |
| 6. Quality passes (critique → audit → polish), tests, live check | incl. in buffer | Sat |
| 7. Demo video, 5:00, four segments (~20%) | ~16 h | Sat → Sun |
| 8. Submission kit + business model + deck (~15%) | ~13 h | Sat → Sun (business model starts in parallel with build) |
| 9. Ship: merge to main, live check, HANDOFF.md | 1 h | Sun by 5 PM |
| Buffer for the thing that breaks (~15%) | ~13 h | Sun 5 PM → Mon 5 PM (hard deadline) |

## Tool check (Phase 1)
- Node v22.22.2, npm 10.9.7.
- Playwright Chromium present at `/opt/pw-browsers` (chromium-1194, headless shell).
- ffmpeg: not on PATH; installed `imageio-ffmpeg` (ffmpeg 7.0.2, libx264 + aac present; **no libass/drawtext**, so captions are rendered in-browser and recorded, not burned by ffmpeg).
- n8n: `N8N_BASE_URL` is **unset** in this environment, so there is no API access. Any workflow ships as importable `n8n/*.json` with a HANDOFF step.
- Design skills: `dataviz` and `anthropic-skills:ui-demo` are loaded. `impeccable`, `emil-design-skills:animate`, taste-skill and `hypersite` are **not** loaded in this session; fallbacks cloned to `/tmp/skills` (impeccable, emil-skills, taste-skill) and read from source. `hypersite` has no public fallback; `anthropic-skills:web-design-cheatcode` + `3d-motion-site` cover the same ground.
- Siblings (`scripts/siblings.sh`): no sibling repo has a public CONCEPT.md yet, so overlap is avoided by lane (HACKATHON.md table) and by the past-projects list.

## Log
- **Phase 0** (Wed 10:33 PM EDT, 114.4 h left): repo read, tools checked, this file created.
