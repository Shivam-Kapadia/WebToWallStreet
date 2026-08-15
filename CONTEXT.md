# WebToWallStreet — project context

Why this exists, who it is for, and which decisions are already settled. `DESIGN.md` covers
*how it looks*, `README.md` covers *how to run and extend it*. This file covers *why*, and it
is the one to read first.

---

## 1. What it is

A self-paced course that takes someone from knowing nothing about consulting to being able to
hold their own in a case interview. It is delivered as a **field tracker**: each study day is
a region on a map, each concept is a sighting to log, progress is territory explored.

It is a static site. No backend, no build step, no framework, no dependencies. Three fonts
from Google Fonts are the only external request.

## 2. Who it is for

**Primary: a complete beginner.** Someone who has never heard *engagement* used as a noun.
The Day 0 copy assumes zero business background and defines every term on first use. This is
the constraint that makes the writing hard and the project worth doing — most consulting prep
material quietly assumes you already speak the language.

**Specifically, students targeting the UIUC consulting clubs** — NOBE, CUBE, IBC (Gies) and
OTCR. Day 0 §02 names them, describes how their semesters run, and says what each one wants
to hear. That specificity is the point: "why us?" answered generically reads as filler.

**Secondarily: recruiters.** This is a public site with the author's name attached. That is
why `DESIGN.md` §1 is uncompromising about original artwork — pasted Marvel assets read as a
fan edit, hand-drawn pixel geometry reads as *this person built something*. Both audiences are
served by the same decision, but when they conflict, the learner wins.

## 3. Where it stands

| | |
|---|---|
| **Day 0** — Foundations | 14 sections. What consulting is, the clubs, the four-stage case skeleton, MECE, issue trees, sizing, signposting |
| **Day 1** — Economics | 14 sections. Profit equation, costs, margins, elasticity, pricing, scale, unit economics |
| **Day 2** — Frameworks | 12 sections. Six case types reduced to one shape, case maths, four practice cases |
| **The map** | `index.html` + `map.html`. 3 regions, 40 sightings, progress in `localStorage` |

Days are written and added one at a time, on no fixed schedule. The map is built to absorb
them without modification — see `README.md`.

## 4. Decisions already made

Do not relitigate these without a reason.

**Nothing is locked.** Regions were originally specced to unlock in sequence. They do not. A
student who already knows the economics should be able to walk into frameworks, and gating
that punishes them for knowing something. Progress means *territory explored*, never
*permission earned*.

**Day state is derived, never stored.** A day is cleared when all its concepts are logged, in
progress when some are. Storing the state separately would let it drift from the counters.

**Day files keep their own inline CSS.** The shared stylesheet and the day stylesheets both
define `.topbar`, `.px`, `.radar`. Loading both into one page makes them fight. `dayhook.js`
injects prefixed `.w2*` styles instead and touches nothing a day file owns. This is why
`DESIGN.md`'s original "extract the shared CSS first" step was dropped.

**Territories are generated, not drawn.** A seeded wobble produces each island's coastline, so
adding a day needs no artwork. The alternative — hand-drawing a landmass per day — would have
made every new day a design task instead of a data entry.

**`localStorage`, not `window.storage`.** The artifact-storage rule in `DESIGN.md` §7 applies
to artifact contexts. This site is served from GitHub Pages, a normal web origin, where
`localStorage` is correct. The store degrades to memory-only if a browser blocks it.

**Interactive consoles: two per day, no more.** A console earns its place only if a learner
can get something wrong in it and learn from that. Anything else is a diagram.

## 5. Content conventions that carry meaning

Colour is semantic, not decorative — **green** is money in / correct / on track, **red** is
money out / wrong / urgent, **amber** is *say it like this*, **cyan** is the interface talking.
A red node never means "important". A returning learner should be able to read a diagram
without a legend.

Worked examples use **real numbers, dollar-denominated**, in a US setting. Day 1 and Day 2
are consistent on this.

The content was originally written in rupees against Indian examples and converted in one
pass. Two rules governed that conversion, and they govern any new content too:

- **Money was divided by ten.** A constant factor, applied to every monetary figure and
  nothing else, so every sum, margin, ratio and breakeven *unit count* stayed exactly
  correct — only the magnitudes moved. `crore` maps cleanly onto `$ million` under it.
- **Quantities were not scaled**, only renotated: unit counts, cups, jars and populations
  keep their value; `lakh`/`crore` become thousands/millions/billions.

Populations were the exception — they were *replaced*, not converted, and every chain
hanging off them re-derived. The sizing example runs on Chicago (~9 million) and the
reference figures on the US (~340 million, ~83% urban, ~2.5 people per household).

Every section closes with a `.checkpoint` — 3 to 5 self-test questions. Roughly one `.sense`
block per two or three sections ties an abstract idea to a physical intuition, using web and
swing imagery only, never character reference.

## 6. Open questions

Things a future contributor should decide deliberately, not by accident.

**Checkpoints are passive.** They ask good questions and do nothing with the answers. They are
the honest "I learned this" signal that a manual tick box is not. Wiring them to mark their own
section complete is the highest-value remaining piece of work.

**Logging happens away from reading.** Progress is logged in the map dossier or by one button
at the bottom of a day page — not next to the section you just read. Concept-level state on
the day pages themselves would close that gap.

**Day 2's top bar drifted.** It uses `.topbar-in` / `.tb-name` / `.tb-badge` where Day 0 and
Day 1 use `.badge` / `.tick`. The new shared sheet follows Day 2's naming. Two real bugs in
that drift are fixed (its top bar did not wrap, and its marker titles ran into their
subtitles at every width), but the naming still differs. Day 3 should follow Day 2, and the
older two should eventually catch up.

**The sizing example is now Chicago coffee, not Mumbai tea.** The cross-check still lands the
same way — top-down 4.7 million against bottom-up 4.5 million, the same near-miss that made
the original lesson work. If the numbers are ever edited, that near-agreement is the point of
the section and has to survive.

## 7. Which file answers what

| Question | File |
|---|---|
| Why does this exist, who is it for, what is settled | `CONTEXT.md` — this file |
| What colour / font / component do I use | `DESIGN.md` |
| How do I run it, deploy it, add Day 3 | `README.md` |
| I am an AI agent, what are the rules | `AGENTS.md` |
