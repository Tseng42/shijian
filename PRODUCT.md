# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three audiences, all confirmed as equally important (2026-08-25):
1. **General public visitors** — people learning about the vanishing 海女 (sea-women) foraging/free-diving culture on Taiwan's north coast; some may register for the "職人體驗" (artisan experience) booking.
2. **Red Dot Award (Brands & Communication Design) judges** — evaluating this as a graduation submission.
3. **The local community and documented subjects themselves** — the three real profiled people, and potential collaborators/partners.

## Product Purpose

拾間 ShiJian documents and presents Taiwan north-coast sea-women (海女) culture — a specific, real, currently-vanishing local craft and gathering tradition (石花菜 / stone-flower-moss harvesting and related free-diving practice) — through a bilingual (zh-Hant default / en) brand-identity website. It exists as a graduation project and Red Dot Award submission.

## Positioning

Confirmed 2026-08-25: closer to a **pure visual-identity design proposal** than a documentary-content-led piece. Design craft and execution are the primary thing being evaluated; real content is supporting material, not the leading claim. This supersedes an earlier, more content-led framing explored in prior rounds of this project.

## Operating Context

Bilingual site (zh-Hant / en) built in Next.js 14 App Router. Real content already exists per-section: story/tide narrative, craft process steps, ecology/crisis reporting (cites PTS News), legacy/succession framing, three documented people, four mapped locations. An "experience" booking form (Formspree-backed) lets visitors register for an in-person artisan experience; its env var is not yet configured. Real photography for the three documented people is still outstanding (placeholder images currently in use).

## Capabilities and Constraints

- Real, cited content exists for story, craft steps, ecology/crisis (cites PTS News), legacy, and 3 real people (1 with a drafted-but-unconfirmed quote, 2 with no confirmed quote yet), plus 4 mapped locations.
- The 職人體驗 experience-booking form is wired to Formspree but not yet configured with a real form ID.
- The visual system (palette, type pairing, motion language) built up in prior design rounds is **explicitly not a fixed constraint** for this redesign — the user released it as open to reconsideration.

## Brand Commitments

- The name **"拾間 ShiJian"** is fixed and non-negotiable, in both scripts, wherever a brand mark appears.
- No other visual element is currently locked. A prior geometric-mark and hand-drawn-mark logo exploration was tried and rejected by the user; the project currently ships text-only for the mark.

## Evidence on Hand

- `content/*.json` — story, craft, ecology (real citations), legacy, people (3 real profiles), locations.
- No confirmed real photography of the documented people yet (placeholder imagery in use) — future work must not fabricate or imply real photography that does not exist.
- No verbatim quote exists yet for two of the three documented people — do not invent one.

## Product Principles

1. Never fabricate quotes, historical claims, or sources — flag anything unverified and cite real sources. Hard constraint, explicitly reconfirmed for this redesign.
2. All three audiences (public visitors, Red Dot judges, the documented community/subjects) matter simultaneously; no redesign should serve one by alienating another.
3. "拾間 ShiJian" is the one fixed identity element; every other visual decision is open for this redesign.
4. Content stays real and bilingual; design may lead more assertively than in prior rounds, but never at the cost of misrepresenting real people or events.

## Accessibility & Inclusion

Prior work already established site-wide standards to carry forward: prefers-reduced-motion gating on all motion, correct aria-label/focus-visible treatment, and keyboard operability of custom components (carousel, map pins). Not new requirements — existing engineering floor for this project.
