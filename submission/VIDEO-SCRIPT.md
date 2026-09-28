# Muslin — five-minute demo script

**0:00–0:35 · Problem** — Secondhand clothing is cheaper and less wasteful, but listings rarely tell you whether a garment will fit. Buyers guess; sellers repeat the same tape measurements.

**0:35–1:35 · Product demo** — Muslin starts with one flat-lay photo and a Letter or A4 sheet. Use the demo photo to see pit-to-pit, length, shoulder and sleeve measurements with uncertainty. The interface makes the result legible instead of hiding it behind a score.

**1:35–2:25 · Fit check** — Paste the seller's measurements. Muslin overlays the listing against a garment already in the rack and explains each delta in centimetres. Switch the reference garment to see the verdict recalculate.

**2:25–3:35 · Build** — The `src/cv` pipeline is pure TypeScript: paper detection, perspective correction, garment segmentation, landmarks, and measurement uncertainty. The core has no required API key or backend. The browser demo stays reliable with a deterministic path while the on-device pipeline is developed.

**3:35–4:25 · Business and scale** — Buyers are free forever; sellers can subscribe for batch measuring, listing templates and exports. Computation runs on the user's device, so marginal server cost is close to zero and privacy is structural.

**4:25–5:00 · Limits and close** — Measurements are not a guarantee: stretch, drape, body shape and seller error still matter. Muslin makes the uncertainty visible so a buyer can make a better decision before purchasing.
