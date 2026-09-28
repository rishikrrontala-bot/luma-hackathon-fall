# Muslin — fit before you buy

**Muslin** measures clothes you already love, then checks secondhand listings against those measurements before you buy. It is Rishik Rontala's entry for **[LUMA Hackathon](https://luma-hackathon-fall.devpost.com/)** (deadline Mon Sep 28, 2026 · 5:00 PM EDT).

**Live demo:** https://rishikrrontala-bot.github.io/luma-hackathon-fall/

**Five-minute narrated demo:** https://raw.githubusercontent.com/rishikrrontala-bot/luma-hackathon-fall/main/submission/video/demo.mp4

## The judge path

1. Open **Measure** and choose **View seeded preview** to see clearly labeled sample measurements and uncertainty tags.
2. Open **Fit check** and edit the seller's measurements. The per-dimension differences update immediately.
3. Open **Closet** to switch between three sample reference garments. The app recalculates the comparison.

## How it works

The experimental core in `src/cv/` is a dependency-free TypeScript pipeline: paper detection → perspective correction → garment segmentation → landmarks → measurements with uncertainty. It is not wired to the browser interface yet. The current app demonstrates the comparison flow with deterministic sample data, without an API key or account.

## Run locally

```bash
npm install
npm run dev
```

Checks: `npm run check` runs type checking, linting, five focused tests, and the production build.

## Honest limits

The demo measurements and rack are samples. The visual overlay illustrates a comparison; it does not derive shape from the entered measurements. Fabric stretch, body shape, drape and seller measurement errors are not inferred. The photo pipeline needs integration and evaluation on varied real garments before production use.

Built by **Rishik Rontala** with Claude Code as an AI coding agent, directed by Rishik.
