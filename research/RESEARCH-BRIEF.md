# Research brief: LUMA Hackathon (Sep 20–28, 2026)

*Written Thu Sep 24, 2026 (ET) in the first research pass. Sources are linked inline. The network limits on this session are described in [`winners/README.md`](winners/README.md): pages were confirmed through the search index of official sources, not opened.*

## 1. The target, pinned down

| Fact | Value | Source / confidence |
|---|---|---|
| Event | LUMA Hackathon (September 20th – 28th), "Pitch your idea" | Devpost page title in the search index: https://luma-hackathon-fall.devpost.com/ ☑ |
| Deadline | **Mon Sep 28, 2026 · 5:00 PM EDT** | search index of the event page ("September 28, 2026 at 5:00pm EDT") ☑ |
| Build window | Starts Sep 20; "submissions made before this date will not be considered" | search index of the event page ☑ (this repo's first commit is Sep 23) |
| Eligibility | Ages 13–18, students only, teams of 1–5, all countries (standard exceptions) | search index ☑ |
| Devpost themes | Beginner Friendly · **Machine Learning/AI** · Open Ended | search index ☑ |
| Round 1 | A **5-minute video** covering, in order: **The Problem** · **The Build** (codebase, architecture, stack) · **The Demo** (screen recording of it working in real time) · **Scalability** ("how is this project suited to handle more data or more users") | search index of the event and rules pages ☑ |
| Round 2 | **Live Finals**: "finalists will run their code live for a panel of judges and defend their technical logic and architecture in a real time discussion" | search index ☑ |
| Prizes | Sponsorship subscriptions for every eligible participant (up to 1,000 winners). The real prize is **advancing to live finals** | search index ☑; per-person value ("over $200") seen for LUMA's spring 2026 event, ⚠ unconfirmed for this one |
| Organizer | **LUMA**, a Redmond, WA student-led nonprofit co-founded in 2024 by Jash Vohra and Ekansh Jain (then 17). They liken their competitions to *Shark Tank*: "students create a minimum viable product and have five minutes to create a video and pitch their product to judges" | Northwest Asian Weekly, Aug 2026: https://nwasianweekly.com/2026/08/how-redmond-based-luma-is-helping-create-the-next-entrepreneurs-and-business-leaders/ ☑ |
| Judges | Not published in the search index (the `/details/judges` page is blocked). LUMA's startathon describes finalists pitching to "real entrepreneurs, engineers, and innovators" | https://lumastartathon.devpost.com/ ☑ |

### The official rubric (four × 25%), in LUMA's own words
From the search index of the rules page:

| Criterion | Weight | What LUMA says it measures |
|---|---|---|
| **Technical Execution** | 25% | "Code cleanliness, structural efficiency, documentation depth, and overall functional stability of the tech stack." |
| **Innovation & UX** | 25% | "Originality of the concept paired with intuitive, fluid user flows." |
| **Business & Finance** | 25% | "Realism of the proposed business model, monetizable hooks, and pathways to financial viability." |
| **Communication** | 25% | "Performance during the video pitch and the team's agility during the live Q&A." |

Two things stand out. First, this rubric **does** score documentation depth and code cleanliness, unlike most hackathons (where `what-wins.md` says judges never read the code). The mandatory "Build" segment means judges *see* the code. Second, Business & Finance is a full quarter, and the organisers are business-minded teenagers who run *Shark Tank*-style events. A sourced, internally consistent model with real unit economics is the cheapest 25% on the table.

### LUMA's prior events (same organiser)
| Event | Devpost | Winners visible? |
|---|---|---|
| LUMA Startathon ($1,000 cash) | https://luma-startathon.devpost.com/ | no |
| LUMA Startathon / Pitch Competition 2025 (Oct 18 – Dec 1, 2025) | https://lumastartathon.devpost.com/ | "View the winners" link exists; names not indexed |
| LUMA Hackathon / Pitch Competition 2026 (Apr 4 – May 2, 2026, "$52,800") | https://luma.devpost.com/ | gallery "not published yet" |
| LUMA Pitch Competition (Jul 3–10) | https://luma-hackathon-500.devpost.com/ | not indexed |
| LUMA Hackathon (Aug 30 – Sep 7, 2026) | listed at https://www.startupnetworks.co.uk/links/link/30344-luma-hackathon-august-30th-september-7th | not indexed |
| **LUMA Hackathon (Sep 20–28, 2026)** ← this one | https://luma-hackathon-fall.devpost.com/ | n/a |
| LUMA Hackathon (Oct 11–18, 2026) | listed at https://www.startupnetworks.co.uk/links/link/30346-luma-hackathon-october-11th-18th | future |

No LUMA winner is findable, so the evidence below comes from the closest same-domain competitions (teen builders, working product, pitch, business judged). See [`winners/`](winners/).

## 2. Evidence: six verified winners

| Winner | Competition · prize | Problem framing | Demo / wow |
|---|---|---|---|
| [HealthBridge](winners/healthbridge.md) | Congressional App Challenge 2025, NY-3 · district 1st | who's hurt (the underinsured) + what it outputs (personalised clinics and insurance) | personalised result from 3 inputs; "50 states, 15 languages" |
| [Hedgex](winners/hedgex.md) | CAC 2025, TX-26 · district winner | earned authority (coached 100+ DECA teams) + the gap in existing options | $100,000 paper-trading simulator on real data; stack named (Flask + yfinance) |
| [MemoryLane](winners/memorylane.md) | CAC 2025, CA-36 · district winner | a named real person (Margo) | n/a (video not viewable) |
| [StayWoke](winners/staywoke.md) | Technovation Girls 2025 · Beginner Division Grand Prize | everyday danger (drowsy driving) | **live on-camera AI** reacting to the user; separate technical video + business plan |
| [UniversO](winners/universo.md) | Blue Ocean 2022 · 1st place (⚠ age) | one-sentence, huge value proposition | 5-minute animated explainer of the *company* |
| [Dumplings](winners/dumplings.md) | Blue Ocean (winner, ⚠ year) | simple human problem | "from winner to real product": it shipped |

## 3. The pattern

**Problem shape that wins:** a *specific person* with a *specific, everyday* problem, stated in one sentence, with the gap in existing options named. Personal-pain framing (MemoryLane, Hedgex) beats "a platform for X". We cannot invent Rishik's personal story, so our framing leads with a precise, **sourced** statistic and a moment every judge has lived (clothes that didn't fit when they arrived).

**Demo shape that wins:** a single **live, visual moment where the product reacts to the real world** (StayWoke's camera; Hedgex's live market data), then a clear technical walkthrough as its own segment (Technovation's separate technical video maps directly onto LUMA's mandatory "Build" segment). At 5 minutes, animated diagrams carry the explanation (UniversO).

**Scope ceiling:** a CAC/Technovation winner has 1–3 features working end to end on real input. The LUMA window is 8 days (we have ~4.5). Realistic ceiling: **one core feature done extremely well** (the wow), **one feature that makes it a business** (the loop that makes money), and polish.

**What winners consistently skipped:** exhaustive feature lists, accounts and logins, settings screens, backends they didn't need. None of the indexed winners leads with infrastructure.

**Judge bias (visible):** LUMA is run by teen founders who run *Shark Tank*-style events. They reward a **company**, not a project: customer, price, why they'd pay, how it grows. Round 2 is a live code defence, so the architecture must be something Rishik can explain from memory. Devpost tags the event **Machine Learning/AI**, so a genuine on-device vision/ML core fits the event's own framing.

**What this means for concept selection:**
1. Consumer or prosumer product with an obvious *who pays and why* (a WTP benchmark that already exists in the market).
2. A **camera-to-answer** wow moment that runs live in a judge's browser and live in the finals (no API key, no server).
3. Architecture that makes the **Scalability** segment a strength: if compute runs on the user's device, cost per extra user is ~$0, and that becomes the unit-economics story too.
4. Code a judge can read: pure-function core, tests, diagrams, documented algorithms.

## 4. Pre-mortem: "it's judging day and we lost. Why?"
- *"We've seen this app fifty times."* Avoid subscription trackers, budgeting dashboards, study tools and AI chat wrappers.
- *"The business part was a pricing table."* Build a real model: CAC/LTV with labelled assumptions, TAM/SAM/SOM with sources, a growth loop built into the product.
- *"The video ran over, or skipped a required segment."* Script to 5:00 with the four segments in the mandated order, each timed.
- *"It broke live in finals."* On-device, no network dependency, deterministic pipeline, a manual fallback for every automatic step.
- *"The accuracy claim didn't hold up in Q&A."* Only report numbers the repo reproduces (`npm run bench`), label synthetic data as synthetic, and ship `docs/LIMITATIONS.md`.
