# Muslin — fit before you buy

**Muslin** measures clothes you already love, then checks secondhand listings against those measurements before you buy. It is Rishik Rontala's entry for **[LUMA Hackathon](https://luma-hackathon-fall.devpost.com/)** (deadline Mon Sep 28, 2026 · 5:00 PM EDT).

**Live demo:** https://rishikrrontala-bot.github.io/luma-hackathon-fall/

## The judge path

1. Open **Measure** and choose **Use demo photo**. The app shows on-device garment measurements with uncertainty.
2. Open **Fit check** and edit the seller's measurements. The overlay and per-dimension deltas update immediately.
3. Open **Closet** to switch the reference garment. All data in this demo is local to the browser.

## How it works

The production core in `src/cv/` is a dependency-free TypeScript pipeline: paper detection → perspective correction → garment segmentation → landmarks → measurements with uncertainty. The interface currently includes a deterministic demo path so a cold judge visit never depends on an API key or account.

## Run locally

```bash
npm install
npm run dev
```

Checks: `npm run build`, `npm run typecheck`, `npm run lint`.

## Honest limits

The demo measurements are a visual aid, not a guarantee of fit. Fabric stretch, body shape, drape and seller measurement errors are not inferred. Photos stay local in the intended product; this submission demo uses a seeded example so it is reliable during judging.

Built by **Rishik Rontala** with Claude Code as an AI coding agent, directed by Rishik.
