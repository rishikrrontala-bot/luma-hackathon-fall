# Concepts: three candidates scored against LUMA's rubric

*Thu Sep 24, 2026. Rishik delegated the pick to this session (CLAUDE.md, "Override to the hackathon-win skill"). All three are consumer/prosumer products with a subscription or transaction model (the suggested lane), and none overlaps a sibling lane or a past project (checked below).*

## Constraints every concept had to meet
- **Lane:** consumer (B2C) or prosumer, with a clear subscription or transaction model (HACKATHON.md).
- **No sibling overlap:** `scripts/siblings.sh` shows no sibling has claimed a concept yet, so overlap was checked against each sibling's *lane*: school life (CSC), health and early detection (UnivaBio, DSH), law (LexHack), SDGs and climate (Acodemic), security (305), creative, game and art (NBH, InnovArt, ML-3), B2B for small businesses and B2B SaaS (Creator Colosseum, Next Founders), applied finance (GIBC).
- **No repeat of past projects:** study tools, ecosystem dashboards, concussion, music, clip engines, rent audits, acoustic modems, reporting, MRI, heat maps, anxiety, perfume tracking.
- **Static-first:** the core demo must work in a cold judge's browser with no key and no server (CLAUDE.md). This session can't reach Hugging Face or jsDelivr, so the AI core also had to be buildable and testable **without downloading model weights**.
- **Research fit (RESEARCH-BRIEF §3):** a live, visual, camera-to-answer moment; an obvious "who pays"; a scalability story that's a strength.

## The three concepts

### A. Muslin: know secondhand clothes fit before you buy
*In tailoring, a "muslin" is the test garment you sew to check the fit before cutting the real fabric.*

**Pitch:** Lay your best-fitting hoodie on the floor next to a sheet of printer paper and take one photo. Muslin measures it on your phone (chest, length, shoulders, sleeves) to within about a centimetre. Then check any secondhand listing against the clothes you already know fit.

- **Who pays:** resellers (prosumer, Pro subscription) who have to post "pit-to-pit" measurements on every Depop, eBay, Poshmark or Vinted listing. Buyers are free forever; they're the growth loop.
- **Wow moment:** photo → paper detected → perspective removed → garment outlined → dimension lines draw themselves with ± uncertainty, in under a second, on-device. Then the listing's garment silhouette is laid **to scale** over yours.
- **Riskiest technical unknown:** robustness of classical segmentation on real, messy floors (patterns, shadows, wrinkles). *Mitigation:* every automatic step has a manual override (drag the paper corners, drag the measurement endpoints), a synthetic benchmark with ground truth reports real error numbers, and LIMITATIONS says what breaks it.
- **Cut first if time runs short:** pants/shorts auto-measurement (tops first), batch mode, annotated-image export.

### B. Recur: a privacy-first subscription audit that never touches your bank login
**Pitch:** Drop in your bank's CSV export; Recur finds every recurring charge on-device (period detection, merchant normalisation, price-hike detection) and shows the annual burn, forgotten trials and cancel paths, with no Plaid link and no upload.

- **Who pays:** consumers, $3/month or $19/year.
- **Wow moment:** a year of transactions collapses into 14 subscriptions, one of which quietly went up 20%.
- **Riskiest unknown:** bank CSV formats vary wildly; the demo needs sample data, which reads as fake.
- **Cut first:** cancel-path library.

### C. Holdback: return-window and price-drop radar from receipt photos
**Pitch:** Snap a receipt; on-device OCR reads the store, date and items, applies that retailer's return and price-adjustment policy, and reminds you before money expires.

- **Who pays:** consumers (freemium) plus affiliate revenue.
- **Wow moment:** a crumpled receipt becomes a countdown: "Target: 11 days left to return, 3 days left for a price adjustment."
- **Riskiest unknown:** OCR accuracy on thermal receipts; keeping a policy dataset for 30+ retailers current (this session can't browse retailer sites to verify policies).
- **Cut first:** price-adjustment tracking.

## Scoring (1–5 per criterion; every criterion weighs 25%)

| Criterion (25% each) | A. Muslin | B. Recur | C. Holdback |
|---|---|---|---|
| **Technical Execution**: code cleanliness, structure, documentation, stability | **5**: a from-scratch computer-vision pipeline (homography, Otsu, contour tracing, convex hull, convexity defects) as pure TypeScript functions: highly testable, and the benchmark has **ground truth** | **4**: clean algorithms (period detection, normalisation), but a thinner technical story | **4**: OCR via Tesseract is a library call; the parsing is heuristic |
| **Innovation & UX**: originality, fluid flows | **4.5**: seller-side garment measuring exists (Tailored, Smartsizer), but **nobody closes the loop to the buyer**: fit-check against your own closet, to-scale silhouette overlay, share links that need no backend. One photo in, one answer out | **2.5**: crowded category (Rocket Money and others). Privacy is a differentiator, not a new idea | **3**: Paribus-style products existed; receipts are an unglamorous input |
| **Business & Finance**: realistic model, monetisable hooks, viability | **4.5**: willingness to pay already exists (Tailored Capture from $15/mo; crosslisting tools $12.49–$69/mo). On-device compute means **~$0 marginal cost per measurement**, so we can price under incumbents and stay >85% gross margin. Built-in growth loop (every fit-check link in a listing is an ad) | **4**: clear consumer subscription, but high CAC and churn in a category dominated by bank-linked incumbents | **3**: consumers rarely pay for this; affiliate revenue is thin |
| **Communication**: video + live Q&A | **5**: the demo is visual and self-explanatory; the live finals demo is "hand me any hoodie". The name comes with a story; scalability is a strength ("the phone is the server") | **3.5**: spreadsheets on screen; relatable, but not visual | **3.5**: visual receipt, but the payoff is a date |
| **Weighted total** | **4.75** | **3.50** | **3.38** |

**Tie-breakers checked:** (1) the event carries the **Machine Learning/AI** theme, and A is the only concept whose core *is* computer vision; (2) A is the only one where the live-finals demo becomes stronger than the video (a real garment on a real floor); (3) A's evaluation can be fully reproduced in this repo without network access (a synthetic, ground-truth benchmark), so every number in the README is reproducible, per CLAUDE.md lesson 3.

## Pick: **A. Muslin**

Why it wins on this rubric specifically:
- **Technical Execution:** the rubric scores "code cleanliness, structural efficiency, documentation depth". A pure-function CV core with tests and a documented algorithm per stage is exactly what a Build-segment walkthrough can show.
- **Innovation & UX:** the originality lives on the **buyer side** (seller tools exist; the closet-as-size-chart loop doesn't), and the flow is one photo → one answer.
- **Business & Finance:** a proven willingness to pay (incumbent pricing is public), near-zero COGS by architecture, and a growth loop inside the product. Scalability, business and architecture are the same story.
- **Communication:** a two-second-legible demo, a name with a story, a live-finals demo that can't be faked.

Honest risks we accept and document: incumbents exist on the seller side (we name them on the competition slide); accuracy on real photos is unmeasured in this session (no camera, no photo downloads), so the benchmark is **synthetic and labelled as such**, and `docs/LIMITATIONS.md` says so plainly.

## Ideas rejected before scoring (and why)
| Idea | Reason |
|---|---|
| Teen first-paycheck explainer | applied-finance lane (GIBC); weak willingness to pay |
| Envy-free roommate rent split | close to LeaseLeak (rent); transaction model is thin |
| Bike fit from webcam pose | needs real cycling footage to demo; injury claims border on health |
| Body-measurement sizing from a selfie | health/body-image sensitivity; MediaPipe weights unreachable here; less accurate than measuring garments |
| Supervised-driving logbook for learner permits | the demo needs real GPS drives; can't be shown honestly from this session |
| Pantry/meal planner, study tools, habit trackers | categories judges have seen fifty times |
