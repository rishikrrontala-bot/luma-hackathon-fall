# PROGRESS: LUMA Hackathon (Fall 2026)

**Deadline:** Mon Sep 28, 2026 · 5:00 PM EDT (`2026-09-28T17:00:00-04:00`)
**Internal "done" target:** Sun Sep 27, 2026 · 5:00 PM EDT (≥24 h before the deadline, per CLAUDE.md lesson 2)

## ▶ RESUME HERE (paused Wed Sep 23 · 11:02 PM EDT, 114.0 h to deadline, at Rishik's request)
State: research, concept (**Muslin**), PRODUCT.md, DESIGN.md v0 and the impeccable direction contract are done and pushed. The CV core compiles (`npx tsc -p tsconfig.app.json --noEmit` is clean) but has **no tests yet and hasn't been run on an image**.

Written so far (all in `src/`):
- `cv/geometry.ts`: points, RDP, convex hull, convexity defects, crossings, line fit
- `cv/homography.ts`: DLT, inverse, Zhang–He rectangle aspect recovery
- `cv/image.ts`: Lab, box blur, downscale · `cv/segment.ts`: Otsu, morphology, components, hole fill, Moore tracing
- `cv/paper.ts`: paper detection (whiteness thresholds → quads → edge-line refinement)
- `cv/garment.ts`: floor k-means model → distance map → Otsu → garment blob + contour
- `cv/measure.ts`: symmetry-axis alignment, top/bottom landmarks, orientation scoring
- `cv/plane.ts`: homography from corners, lengths, Monte-Carlo ± · `cv/pipeline.ts`: `analyzePhoto()` end to end
- `domain/paper.ts` (Letter/A4), `domain/silhouette.ts` (parametric tee/longsleeve/hoodie/jeans/shorts with ground truth)

Next steps, in order:
1. `tests/*.test.ts` (Vitest) for geometry, homography, segment, silhouette truth, and a pipeline test on a rendered synthetic image.
2. `bench/render.ts` (@napi-rs/canvas scene: floor texture, garment, paper, perspective warp, noise, JPEG) → `bench/make-samples.ts` (public/samples + manifest) → `bench/run.ts` (error table → bench/RESULTS.md). Tune the CV until the numbers are good; report honestly.
3. UI (React, thrift-tag world per DESIGN.md), worker, CI, e2e, then business docs, video, submission kit, HANDOFF.

## Countdown log
| Phase start (ET) | Hours to deadline | Phase |
|---|---|---|
| Wed Sep 23 · 10:33 PM EDT | 114.4 h | 0: setup + plan |
| Wed Sep 23 · 10:36 PM EDT | 114.4 h | 1–2: research |
| Wed Sep 23 · 10:44 PM EDT | 114.3 h | 3: concept (pushed 10:45 PM) |
| Wed Sep 23 · 10:47 PM EDT | 114.2 h | 4: design direction |
| Wed Sep 23 · 10:50 PM EDT | 114.2 h | 5: build (CV core) → paused 11:02 PM |

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
- **Phase 5 in progress** (Wed 10:56 PM EDT, 114.1 h left): project scaffolded (package.json, tsconfig, vite, eslint; deps installed). CV core being written in `src/cv/`: geometry.ts, homography.ts (DLT + Zhang–He aspect recovery), image.ts (Lab, blur, downscale), segment.ts (Otsu, morphology, components, Moore tracing), paper.ts (paper detection). **Next:** `src/cv/garment.ts` (background model → mask → contour), `src/cv/measure.ts` (symmetry axis, pits/HPS/shoulder/sleeve, pants), `src/cv/uncertainty.ts`, `src/cv/pipeline.ts`, then tests, bench, UI.
- **Phase 4** (Wed ~11:00 PM EDT): impeccable run from the cloned source (launcher works offline; concept-seed ran **degraded**: its roll service is unreachable from this network, so no challengers). PRODUCT.md written from the brief with inferred facts labelled (Rishik unavailable, so no interview). Direction assigned by the seed: **thrift-store tag system** (position 4 of 7). Contract in `.impeccable/surfaces/index-html.md`; DESIGN.md v0 with verified contrast ratios.
- **Phases 1–3** (done Wed 10:45 PM EDT, 114.3 h left): network policy blocks devpost.com / youtube / jsdelivr / huggingface / most hosts; WebSearch works, so event facts were re-verified through the search index (no changes; rubric descriptions + themes + organizer added to HACKATHON.md). No LUMA winner gallery is published, so 6 same-domain winner briefs were written from official sources (CAC 2025 ×3, Technovation 2025, Blue Ocean ×2), each marked with what was and wasn't verifiable. Concept picked: **Muslin** (4.75 vs 3.50 vs 3.38), see research/CONCEPTS.md.
- **Phase 0** (Wed 10:33 PM EDT, 114.4 h left): repo read, tools checked, this file created.
