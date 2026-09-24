# DESIGN: Muslin

> **Status:** v0, written at the direction stage from the direction contract (`.impeccable/surfaces/index-html.md`). Impeccable rewrites DESIGN.md from the *built* world at the finish review; this version is the plan the build follows.

## World: the thrift-store tag system
Every thrift store runs on the same small visual language: a **weekly tag colour** (this week, pink tags are half off), die-cut paper tags punched and fired onto garments with a **tagging gun**, **price-gun stickers** with stamped numerals, and round **size dividers** that sort the rack. Muslin borrows that system because it's the audience's own and because it carries the product's mechanism. A measurement is a tag fired onto the garment; the closet is a rack; a fit verdict is a size divider.

**Refused:** the category default (white SaaS page, phone mockup, gradient, "AI-powered" badge), its dark neon-scanner opposite, and the name's literal reading (cream muslin, tailoring serif), which is the model's rendition rut.

## Colour
Strategy: **Committed**. One fluorescent tag stock owns the Persuade bands (30–60% of the home surface). Operate surfaces are cool fluorescent-lit white, with the tag colour as the single accent. Text on tag colours is always ink, never white.

| Token | Value | Use | Contrast with ink |
|---|---|---|---|
| `--ink` | `#111311` | text, rules, barbs, outlines | n/a |
| `--ink-2` | `#3F4540` | secondary text on paper/white/chartreuse only (3.9:1 on pink: never use there) | 8.6:1 on paper |
| `--paper` | `#EEF1EE` | Operate ground (fluorescent-lit counter) | 16.4:1 |
| `--stock` | `#FFFFFF` | tag stock, inputs, panels | 18.7:1 |
| `--tag` | weekly, default `--tag-chartreuse` | the week's colour | ≥ 7:1 for every option |
| `--tag-chartreuse` | `#DCFF3A` | default week | 16.4:1 |
| `--tag-pink` | `#FF72B6` | rotation | 7.4:1 |
| `--tag-orange` | `#FF8F3F` | rotation | 8.2:1 |
| `--tag-green` | `#52E38E` | rotation | 11.3:1 |
| `--tag-sky` | `#62C9FF` | rotation | 10.1:1 |

The weekly colour is computed from the ISO week number (deterministic; `?week=` overrides it for tests and the video). Closet garments each get one of the five tag colours as their identity, so the colours carry meaning, not decoration. Fit deltas never rely on colour alone: every delta carries a sign and a word ("2.1 cm looser").

## Type
| Role | Face | Notes |
|---|---|---|
| Display / tag labels | **Big Shoulders Display** (variable, self-hosted) | heavy condensed signage face; uppercase on tags; display max 6rem |
| Body / UI | **Atkinson Hyperlegible Next** (variable, self-hosted) | hyperlegible workhorse; 16px floor on phones |
| Measurements | **Martian Mono** (variable, self-hosted) | tabular stamped numerals, **only** for measurements, ± values and units (data, not costume) |

## Components (the tag vocabulary)
- **Tag:** die-cut rectangle with clipped top corners, a punched hole (a real circular cutout via mask) and a barb line to its anchor point. Carries a label (display face, uppercase, tracked) and a value (mono). Used for measurements, closet items and fit deltas.
- **Barb:** a 1.5px ink line ending in a T-bar, connecting a tag to the point it describes. The dimension lines on the photo are barbs with end ticks.
- **Price-gun sticker:** a small rounded strip (stock white or tag colour) with mono text; used for ± values, units, "synthetic" labels and statuses.
- **Size divider:** a circular chip with a slot notch, big display letter/number. Used for tabs (Measure / Closet / Fit check), the paper-size toggle and the unit toggle.
- **Receipt:** monospaced register receipt with perforated edges for pricing.
- **Buttons:** primary = ink fill with tag-colour text; secondary = stock with 1.5px ink border. 48px minimum hit area.

## Motion
One authored moment, **tagging**: dimension line draws (stroke-dashoffset, 280 ms, ease-out-expo) → barb pierces (60 ms) → tag swings in on its hole and settles (spring: stiffness 260, damping 18, ~500 ms). Staggered 90 ms per tag. `prefers-reduced-motion`: tags appear in place with a 120 ms opacity fade, no swing. Everything else is quiet (150–200 ms colour and transform transitions on interaction).

## Layout
- Persuade: full-bleed tag-colour bands alternating with paper bands; 12-column grid, 24px gutters; generous space above headings.
- Operate: photo stage (the largest element) plus a measurement rail (tags stacked as a list on phones).
- Breakpoints: 375 (floor), 768, 1100, 1440.

## Browser surfaces
Selection = tag colour on ink text; caret = ink; focus ring = 3px ink outline plus 2px tag-colour offset ring (visible on both paper and tag bands); scrollbars thin, ink thumb; tabular numerals everywhere numbers align.
