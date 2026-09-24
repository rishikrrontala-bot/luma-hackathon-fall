# Product

<!-- impeccable:product-schema 1 -->

> **How this was written.** Rishik Rontala (the builder) is unavailable during this unattended cloud build and delegated every product decision to it (PROMPT.md, CLAUDE.md). There was no interview. Every fact below comes from the explicit brief (HACKATHON.md, CLAUDE.md, CONCEPT.md, research/) and is labelled **[inferred]** where the brief doesn't state it outright. Nothing here is a customer claim.

## Platform

web (mobile-first: the core action is taking a photo on a phone; also desktop for judges and sellers who upload from a computer)

## Stack

Pinned by CLAUDE.md: Vite + TypeScript, static site on GitHub Pages, `base: './'`, no required backend, no API key, Vitest + Playwright, CI on every push. Delegated within that: React 19 for the UI [inferred]; computer vision written from scratch in pure TypeScript and run in a Web Worker (no OpenCV, no model download), so the whole pipeline is unit-testable and works offline.

## Users

- **Secondhand clothing buyers**, mostly teens and young adults shopping on Depop, Vinted, eBay, Poshmark and Grailed on their phones. The job: decide whether a final-sale item will fit before paying. Today they ask the seller for "pit-to-pit" measurements and compare them in their head to a size label that means different things across brands and decades. Evidence: 46% of upper-income US teens had bought clothes secondhand and 53% had sold on a secondhand marketplace (Piper Sandler, *Taking Stock With Teens*, Spring 2024).
- **Resellers** (prosumer): anyone listing secondhand clothes, from a teen clearing their closet to a full-time flipper. The job: publish accurate flat measurements on every listing without measuring each item by hand with a tape. They already pay for tools (crosslisters from $12.49/mo; Tailored's garment-measuring app from $15/mo).

## Product Purpose

Muslin makes fit knowable before purchase. You measure the clothes you already know fit you well, with one photo and a sheet of printer paper as the scale, and those garments become your personal size chart. Any listing's measurements, typed in or opened from a seller's Muslin link, are compared against that closet: which of your garments it's closest to, and by how many centimetres in each dimension.

Success: a buyer can answer "will this fit like my favourite hoodie?" in under a minute, and a seller can produce a listing's measurement block from one photo in under a minute.

## Positioning

Seller-side garment measuring exists (Tailored Capture, Smartsizer, others). Muslin's mechanism is the **buyer loop**: the buyer's own clothes are the reference, the comparison is shown as two silhouettes overlaid at true scale, and a seller's measurements travel as a link that needs no server and no account. All computation runs on the user's device, so nothing is uploaded and serving one more user costs close to nothing.

## Operating Context

- A phone camera pointed down at a garment laid flat on a floor, bed or table, next to a Letter (US) or A4 sheet of paper. Indoor light, uneven shadows, patterned floors.
- Listing pages on Depop, Vinted, eBay, Poshmark and Grailed, where sellers write "pit to pit", "length", "shoulder" and "sleeve" in inches or centimetres.
- Judges evaluating on a laptop, with no garment to hand: the product must demo from bundled sample photos (labelled synthetic) as well as from the camera.

## Capabilities and Constraints

- Measures **tops** automatically (T-shirts, long-sleeves, hoodies, sweatshirts): pit-to-pit (chest), body length, shoulder width and sleeve length, each with a ± uncertainty. Every automatic point is manually adjustable.
- Bottoms (pants, shorts) are measured semi-manually: the user places the points [inferred scope; auto-detection is a stretch goal].
- Paper reference: US Letter (215.9 × 279.4 mm) or A4 (210 × 297 mm), chosen by the user; default from browser locale.
- Units: centimetres and inches.
- Storage: closet saved locally in the browser (IndexedDB/localStorage). No accounts in the MVP.
- Fit-check links encode measurements (and a simplified outline) in the URL fragment: no backend.
- Pro plan (sellers) is **proposed**, not live: there is no payment integration in the MVP. The page states that honestly.
- Uninventable: accuracy numbers other than those the repo's benchmark reproduces; users, testimonials, traction, partnerships.

## Brand Commitments

- Name: **Muslin**. In tailoring, a muslin is the test garment sewn to check fit before cutting the real fabric [inferred name, chosen by this build].
- Credit: a visible "Built by Rishik Rontala" and `<meta name="author" content="Rishik Rontala">` (CLAUDE.md).
- Voice: plain, precise, measurement-literate; talks like someone who has actually measured clothes. No hype, no "revolutionary", no emoji headers.
- Own art direction, not shared with Rishik's other entries; banned: purple/blue gradients, centred-card SaaS templates, emoji section headers, Playfair + drop shadows, generic 3D blobs, stock hero illustrations (CLAUDE.md).

## Evidence on Hand

- Market and problem statistics with sources: `research/RESEARCH-BRIEF.md`, `business/BUSINESS-MODEL.md`.
- Sample garment photos: **synthetic**, rendered by the repo's own generator with known ground-truth measurements. Always labelled synthetic in the UI and the video.
- Accuracy numbers: only from `npm run bench` on the synthetic set.
- Absent, and never to be fabricated: real user photos, user counts, testimonials, reseller interviews, partnerships, revenue.

## Product Principles

1. **One photo, one answer.** Every flow collapses to a photo in and a number out; everything else is optional.
2. **Show the uncertainty.** Every measurement carries its ± and every automatic point can be moved. The tool never claims more precision than the pixels allow.
3. **Your clothes are the size chart.** Compare against garments the user already knows fit, not against brand size labels.
4. **Nothing leaves the phone.** Computation, storage and sharing all work without a server.
5. **Honest by default.** Synthetic data is labelled, limits are written down, the proposed business is described as proposed.

## Accessibility & Inclusion

WCAG 2.2 AA (CLAUDE.md): contrast, full keyboard paths including point adjustment (arrow keys nudge a selected handle), visible focus, `prefers-reduced-motion`, semantic HTML, alt text, works at 375 px. Measurements are always available as text, never only as drawn lines.
