# LUMA Hackathon (September 20th – 28th)

**Event page:** https://luma-hackathon-fall.devpost.com/  ·  **Rules:** https://luma-hackathon-fall.devpost.com/rules
**Deadline:** **Mon Sep 28, 2026 · 5:00 PM EDT**  (`2026-09-28T17:00:00-04:00`)
> Round 1 is the video submission; top technical projects go to live finals.

*Facts first read from the live Devpost page on 2026-09-23; **re-verified 2026-09-24** through the search index of the event and rules pages (this cloud session's network policy blocks direct loads of `*.devpost.com`, see PROGRESS.md). Nothing had changed. Remaining ⚠ items are noted inline.*

## Organizer
**LUMA**, a Redmond, WA student-led nonprofit co-founded in 2024 by Jash Vohra and Ekansh Jain. They describe their events as *Shark Tank*-style: build a minimum viable product, then pitch it in a five-minute video ([Northwest Asian Weekly, Aug 2026](https://nwasianweekly.com/2026/08/how-redmond-based-luma-is-helping-create-the-next-entrepreneurs-and-business-leaders/)).

## Eligibility
Ages 13–18, students only (companies and professional organizations excluded), teams of 1–5, all countries and territories except the standard exceptions. The competition starts Sep 20; "submissions made before this date will not be considered."

## Theme
"Pitch your idea": execute a functional project (app, website, software tool) that solves a real-world problem through code. Devpost themes: **Beginner Friendly · Machine Learning/AI · Open Ended**.

## Prizes
- Sponsorship subscriptions for every eligible participant (up to 1,000 winners). ⚠ Per-person value ("over $200") was stated for LUMA's spring 2026 event; not confirmed for this one.
- Top technical projects advance to live finals

## Submission requirements (from the event and rules pages)
- **Round 1: a 5-minute video** covering, in order:
  1. **The Problem**: what specific technical or social challenge you are tackling
  2. **The Build**: a walkthrough of the codebase, architecture and stack used
  3. **The Demo**: a screen-share recording of the project working in real time
  4. **Scalability**: how the project is suited to handle more data or more users
- **Round 2: Live Finals.** Finalists "run their code live for a panel of judges and defend their technical logic and architecture in a real time discussion."
- Judges' decisions are final; LUMA may disqualify submissions that break the rules or the spirit of the competition.

## Judging criteria (verified, with LUMA's own descriptions)

| Criterion | Weight | LUMA's description |
|---|---|---|
| Technical Execution | 25% | Code cleanliness, structural efficiency, documentation depth, and overall functional stability of the tech stack |
| Innovation & UX | 25% | Originality of the concept paired with intuitive, fluid user flows |
| Business & Finance | 25% | Realism of the proposed business model, monetizable hooks, and pathways to financial viability |
| Communication | 25% | Performance during the video pitch and the team's agility during the live Q&A |

⚠ Judges are not listed anywhere the search index reaches.

## Event-specific deliverables (on top of CLAUDE.md's Definition of done)
- `business/BUSINESS-MODEL.md`: customer, pricing, unit economics, CAC/LTV (assumptions labelled as assumptions), TAM/SAM/SOM with sources, go-to-market, 12-month plan
- `business/financial-model.csv` (or .xlsx) with a written explanation of every formula
- `submission/deck.pdf`: 10–12 slides
- `submission/video/demo.mp4`: **~5:00**, with the four required segments in the required order
- `docs/QA-PREP.md`: 20 likely finals questions with crisp answers

## Strategy notes (starting hypotheses, which the research may overturn)
- The rubric is identical to Next Founders, so the two entries must target different markets (read the sibling CONCEPT.md files).
- Most student entries hand-wave Business & Finance. A credible, sourced model is the cheapest 25% available.
- The video must walk through the architecture, so keep the codebase clean and diagrammed from the start.

**Suggested lane:** Consumer (B2C) or prosumer product with a clear subscription or transaction model.

## Sibling entries (Rishik's other open events). Do not overlap any of them

Run `bash scripts/siblings.sh` to see which concepts are already claimed.

| Repo | Event | Deadline (ET) | Lane |
|---|---|---|---|
| [`practicetocreate`](https://github.com/rishikrrontala-bot/practicetocreate) | Practice to Create | Fri Sep 25, 2026 · 12:45 PM EDT | Open: an everyday or overlooked problem, with a visually striking result. |
| [`acodemic-hackathon`](https://github.com/rishikrrontala-bot/acodemic-hackathon) | Acodemic × G.I.R.L.S. SDG | Sun Sep 27, 2026 · 12:45 AM EDT | SDG 2 / 6 / 7 / 11 / 12 / 13 / 14 / 15 (not 3 or 4). |
| [`lexhack-2026`](https://github.com/rishikrrontala-bot/lexhack-2026) | LexHack 2026 | Sun Sep 27, 2026 · 5:00 PM EDT | AI × law (pick the track the research says is least contested). |
| [`luma-hackathon-fall`](https://github.com/rishikrrontala-bot/luma-hackathon-fall) | LUMA Hackathon **← this repo** | Mon Sep 28, 2026 · 5:00 PM EDT | Consumer (B2C) or prosumer product with a clear subscription or transaction model. |
| [`firstcommit`](https://github.com/rishikrrontala-bot/firstcommit) | FirstCommit | Wed Sep 30, 2026 · 5:00 PM EDT | Open: a delightful, ambitious web experience. |
| [`next-byte-hacks-v4`](https://github.com/rishikrrontala-bot/next-byte-hacks-v4) | Next Byte Hacks V4 | Wed Sep 30, 2026 · 11:45 PM EDT | Bold or playful: a game, creative tool or interactive experience with real impact. |
| [`305hackshellssep2026`](https://github.com/rishikrrontala-bot/305hackshellssep2026) | 305 HackShells | Wed Sep 30, 2026 · 11:45 PM EDT | Cybersecurity education (defensive, safe), optionally powered by Gemma. |
| [`gibc-v2`](https://github.com/rishikrrontala-bot/gibc-v2) | Global Innovation Build Challenge V2 | Thu Oct 1, 2026 · 11:45 AM EDT | TECH (tiny LLM trained from scratch) or Applied-Finance. |
| [`csc-back-to-school`](https://github.com/rishikrrontala-bot/csc-back-to-school) | CSC Back-to-School | Mon Oct 5, 2026 · 3:00 AM EDT | School life beyond studying: scheduling, communication, wellness, accessibility, campus logistics. |
| [`ml-build-challenge-3`](https://github.com/rishikrrontala-bot/ml-build-challenge-3) | ML Empowerment Build Challenge 3.0 | Mon Oct 5, 2026 · 8:00 PM EDT | Applied ML outside health, school and law: accessibility, environment, creative tools, local community. |
| [`univabio`](https://github.com/rishikrrontala-bot/univabio) | UnivaBio | Tue Oct 6, 2026 · 11:45 PM EDT | Person-facing early detection or living-with-illness, private on-device. Must not overlap DSH Hacks V2, Baseline (concussion) or LARMOR (MRI). |
| [`creatorcolosseumshowdown`](https://github.com/rishikrrontala-bot/creatorcolosseumshowdown) | Creator Colosseum | Sat Oct 10, 2026 · 5:00 PM EDT | Teen-founder startup: B2B for small businesses, or Thumbstop. |
| [`next-founders`](https://github.com/rishikrrontala-bot/next-founders) | Next Founders | Thu Oct 15, 2026 · 5:00 PM EDT | B2B SaaS or an underserved market. |
| [`dsh-hacks-v2`](https://github.com/rishikrrontala-bot/dsh-hacks-v2) | DSH Hacks V2 | Sun Nov 8, 2026 · 2:45 AM EST | Clinician-, researcher- or system-side healthcare AI with a genuine evaluation. |
| [`innovart2027`](https://github.com/rishikrrontala-bot/innovart2027) | InnovArt 2027 | Sat Jan 2, 2027 · 12:00 PM EST | Art × technology: generative, interactive or performative. |

## Rishik's past projects. Do not repeat these

- **Explain It Back**: explain-from-memory study tool with Socratic follow-ups
- **Habitat Pulse**: ecosystem health dashboard (Open-Meteo + GBIF)
- **Baseline**: webcam oculomotor concussion screener
- **Loop Room**: four-player collaborative music loop + music video
- **Hookline**: transcript → ranked clips, hooks, captions engine
- **LeaseLeak**: rent-roll audit against HUD FMR + Zillow ZORI
- **Earshot**: acoustic modem: text over sound between browsers
- **SAKSI**: tamper-evident anonymous misconduct reporting (web3)
- **LARMOR**: low-field MRI reconstruction
- **Shade Debt**: satellite heat mapping + tree-planting ranking
- **Breathing Room**: teen anxiety guide
- **scent-shelf**: perfume collection tracker
