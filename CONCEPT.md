# CONCEPT: Muslin

**Event:** LUMA Hackathon (Sep 20–28, 2026) · **Lane:** consumer + prosumer, subscription · **Builder:** Rishik Rontala (solo)

**One line:** Know secondhand clothes fit before you buy. Measure the clothes you already love with one photo and a sheet of paper, then check any listing against them.

*In tailoring, a "muslin" is the test garment you sew to check the fit before cutting the real fabric.*

**Problem:** Online apparel is the most-returned category (size and fit are the top reason: 53% of respondents in Coresight's US survey), and secondhand listings are usually final sale. Buyers are left asking sellers for "pit-to-pit" measurements, and sellers measure every item by hand with a tape.

**What it does**
1. **Measure (the wow):** photograph a garment laid flat next to a Letter or A4 sheet. On-device computer vision finds the paper, removes the perspective, outlines the garment and measures chest (pit-to-pit), length, shoulders and sleeves, each with a ± uncertainty. Every point can be dragged to correct it.
2. **Closet:** save the clothes that fit you well. Stored locally; nothing is uploaded.
3. **Fit check:** paste a listing's measurements, or open a seller's Muslin link. See per-dimension differences against your closest garment and both silhouettes overlaid **to scale**.
4. **Listing kit (sellers):** a copy-ready measurement block for Depop, eBay, Poshmark and Vinted, an annotated image, and a fit-check link that needs no server.

**Business:** buyers free forever (they're the growth loop); sellers get a free tier plus **Pro** (batch measuring, listing templates, CSV export). The incumbents charge $15/mo and up; our compute runs on the user's phone, so marginal cost ≈ $0.

**Stack:** Vite + TypeScript + React · a from-scratch CV pipeline in pure TypeScript inside a Web Worker (homography, Otsu thresholding, contour tracing, convex hull, convexity defects, Monte-Carlo uncertainty) · Vitest + Playwright · GitHub Pages. No backend, no API key.

**Wow moment (first 15 s of the video):** a photo of a hoodie on the floor. Measurement lines draw themselves ("Pit to pit 56.2 cm ± 0.4"), then the listing's silhouette slides over it: "2.1 cm wider than your favourite hoodie."

**Cut first:** pants auto-measurement → batch mode → annotated-image export.

Full scoring and alternatives: [`research/CONCEPTS.md`](research/CONCEPTS.md) · research: [`research/RESEARCH-BRIEF.md`](research/RESEARCH-BRIEF.md)
