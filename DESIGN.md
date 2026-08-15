# WebToWallStreet — Design System

A beginner's path into consulting, built as a field-tracker interface. Each study day is a
region on a map; each concept is a logged sighting; progress is territory explored.

This document is the source of truth for anyone (including future-me) extending the system.
Day 0 (`Day_0.html`) and Day 1 (`Day_1.html`) are the reference implementations.

---

## 1. Origin, and what we may not borrow

The visual grammar was developed against a reference: the *Spider-Man: Brand New Day*
promotional tracker at `spideytracker.net`. What that reference contributes is an **interface
idea** — a dark cartographic field, a chunky pixel HUD frame around it, coloured node markers
scattered across territory, a web-geometry radar in the corner, a scrolling ticker along the
bottom, and a persistent count of things not yet found.

That grammar is ours to build in. The following are **not**, and must never appear in
WebToWallStreet:

| Off limits | Why |
|---|---|
| The Spider-Man mask, character sprite, or any Marvel character design | Marvel-owned character IP |
| The film wordmark, logo lockups, key art, or the "SPIDEY TRACKER" name | Trademarked branding |
| Any asset lifted from the reference site | Straightforward copying |
| Partner branding (Samsung, Sony, etc.) | Not ours |

**Every sprite in Day 0 and Day 1 is original geometry**, drawn as SVG `<rect>` grids from
scratch — the arachnid markers, the octagonal HUD emblem, the field-unit figure. Keep it that
way. The practical stakes are real: this is a public site for a recruiting audience. Original
pixel art reads as *this person built something*. Pasted Marvel assets read as a fan edit, and
one is a signal in your favour while the other is a signal against.

**Naming.** "Web" in WebToWallStreet works because it carries three meanings at once — the web
of the site, the spider-web motif, and the interconnected structure of an issue tree. Lean on
the third one in copy. Never lean on the character.

---

## 2. Design tokens

Declared once in `:root`. Never hardcode a hex outside this table.

### Colour

```css
--void:   #050E24;  /* page background, deepest layer */
--deep:   #0A1B3F;  /* pixel-frame outer glow */
--panel:  #0F2551;  /* card and panel surfaces */
--panel2: #14346B;  /* raised surfaces, table headers */
--grid:   #1B3F7A;  /* hairlines, borders, map grid */
--cyan:   #5CE1E6;  /* primary accent, active state, frames */
--blue:   #3D7BF0;  /* secondary accent, structural lines */
--red:    #E8412F;  /* costs, warnings, "don't", wrong */
--green:  #4FBF52;  /* revenue, "do", correct, on-track */
--amber:  #F2C46A;  /* taglines, formulas, "say this" */
--ink:    #D8E6FF;  /* body text */
--dim:    #7D9BD1;  /* secondary text, captions */
```

**Semantic rules that must hold across all days.** Colour carries meaning here, not decoration:

- **Green = money in, correct, do this, on track.** Revenue branches, right answers, do-lists.
- **Red = money out, wrong, don't, urgent.** Cost branches, anti-patterns, time running out.
- **Amber = the voice.** Formulas, taglines, and anything phrased as *"say it like this."*
- **Cyan = the system talking.** Frames, labels, the interface's own chrome.

A red node must never mean "important." It means cost, error, or warning. Consistency here is
what lets a returning learner read a diagram without a legend.

### Type

```css
--display: 'Press Start 2P', monospace;   /* pixel face — headings, numbers, buttons */
--hud:     'VT323', monospace;            /* terminal face — labels, tables, captions */
--body:    'Space Grotesk', system-ui;    /* the only face you read paragraphs in */
```

Three faces, three jobs, no crossover:

- **Press Start 2P** is expensive per character and unreadable in bulk. Section numbers,
  headings, button labels, console titles. Never a sentence longer than about eight words.
  On phones, formulas switch off this face to VT323 so they can wrap.
- **VT323** is the connective tissue — table cells, callout labels, tree nodes, slider
  readouts. Renders large (17–22px) because its x-height is small.
- **Space Grotesk** carries every paragraph. If a learner has to *read* it, it's this face.

Base body: `17px / 1.72`, dropping to `16px / 1.68` under 640px.

### Layout

- Content column: `max-width: 1200px`, padding `0 20px` → `0 16px` (tablet) → `0 12px` (phone).
- Section rhythm: `70px` between modules → `46px` on phone.
- `scroll-margin-top: 84px` on every anchor target → `64px` on phone (clears the sticky bar).
- **Zero border-radius, everywhere.** The pixel aesthetic depends on it absolutely.

---

## 3. Component inventory

Implemented in Day 1, reused unchanged in Day 0. Extend rather than reinvent.

### Structural

| Class | Role |
|---|---|
| `.map-bg` | Fixed dual-layer grid (44px major / 11px minor) + radial glow + scanline overlay |
| `.px` | Primary pixel frame: 3px cyan border, layered box-shadows, hard offset shadow |
| `.px-flat` | Quieter frame: grid-coloured border, single offset shadow |
| `.topbar` | Sticky HUD strip: emblem, badge, live tick readout |
| `.wrap` | Content column above the fixed background |

### Navigation — the sighting map

`.tracker` holds `.markers`, a responsive grid of `.marker` links. Each marker is a `.pin`
(octagon-clipped, colour-cycled via `:nth-child`) containing a 24×24 original arachnid sprite
and a small numbered tag, plus a title (`.m-t`) and subtitle (`.m-s`).

Ambient furniture: `.radar` (web-geometry with a `steps(16)` sweep and pulsing blips),
`.webcorner` (strand bracket), `.agent` (corner field-unit sprite with a `FIELD UNIT` tag).

**This component is the seed of the whole-site map.** See §6.

### Content blocks

| Class | Use |
|---|---|
| `.formula` | Centred equation on dashed blue border. The load-bearing idea of a section |
| `.callout` | Red default. `.good` green, `.say` amber. Each carries a `.lab` |
| `.card` in `.split` | Two-up comparison. `.red` / `.green` variants for right-vs-wrong |
| `.tree` / `.tnode` / `.trow` / `.tbranch` | Issue-tree diagram. `.t0` root, `.t1` branch, `.t2` leaf |
| `.sense` | "Sense check" — the intuition anchor. Bug icon + cyan left rule |
| `.checkpoint` | Dashed green self-test closing each section |
| `.console` | Interactive widget: `.ctrl` sliders, `.readout` of `.rd` tiles, `.verdict` line |
| `.tscroll` | Horizontal scroll container. **Every table must be wrapped in one** |
| `.strandline` | Web-strand section divider |

### The sense-check convention

Each `.sense` block ties an abstract concept to a physical intuition, using web and
swing imagery rather than character reference:

> *"Your structure is the web you anchor before you step out onto it. Anchor it badly and every
> move afterwards is a scramble."*

These are the memory hooks. Aim for roughly one per two or three sections — enough to land,
sparse enough to stay special. They must always explain something real; if the metaphor doesn't
clarify the mechanism, cut it.

---

## 4. Content architecture

Every day file follows the same skeleton, and every section within it follows the same shape.

```
topbar → hero (.plate with corner brackets) → sighting map → §01…§N → strandline → footer
```

**Section anatomy:**

```
.mod-head   →  numbered chip + heading (display face, uppercase)
.tagline    →  one line, amber, HUD face, uppercase — what this section is FOR
body        →  plain-language prose, examples, tables, diagrams
.checkpoint →  3–5 self-test questions
back to map →  anchor to #map
```

### Voice rules

The audience is someone who has never heard the word *engagement* used as a noun. Copy
discipline that makes Day 0 and Day 1 work:

1. **Define every term the first time it appears.** No exceptions, no "as you know."
2. **Show the wrong version next to the right one.** Red card / green card beats explanation.
3. **Real numbers, always.** Dollar-denominated worked examples over abstract variables,
   in a US setting. See `CONTEXT.md` §5 for the conversion rule that keeps them consistent.
4. **Give the exact words to say.** `.callout.say` blocks contain script a learner can use
   verbatim. This is the single most useful thing on the page for a nervous first-timer.
5. **Name the failure mode explicitly.** Sections gain their force from "here is the mistake
   almost everyone makes, and here is why it reads badly."
6. **Sentence case in prose; uppercase only in the pixel/HUD chrome.**

### Interactive consoles

Two per day, no more. They exist to make an idea *operable*, not to decorate:

- Day 1: breakeven calculator, elasticity explorer — both make an equation manipulable.
- Day 0: clarifier-vs-hypothesis drill (scored sorting), case clock (stage timing).

A console earns its place if a learner can get something wrong in it and learn from that.
Anything else is a diagram.

---

## 5. Known pitfalls

**The `@` stripping bug.** Day 1 shipped with every `@` character removed from the file — all
nine `@media` blocks, both `@keyframes`, and the Google Fonts `wght@400` parameter. The result
was silent: no responsive layout on any device, no radar animation, no reduced-motion support,
and Space Grotesk falling back to system sans. Nothing errors. It just quietly renders wrong.

Cause: shell here-doc and Python string handling during iterative edits. **Mitigation:** after
any scripted edit pass, assert the counts.

```bash
grep -c '@media' file.html    # expect: number of breakpoints
grep -c '@keyframes' file.html
grep -c 'wght@' file.html     # expect: 1
```

**Other invariants worth asserting after edits:**

- Every `<section class="mod" id="mNN">` has a matching `href="#mNN"` marker, and vice versa.
- Every `getElementById('x')` has a matching `id="x"` in markup.
- Open/close tag counts balance for `div`, `section`, `svg`, `table`.
- Brace, paren and bracket counts balance inside `<script>`.
- Every `<table>` sits inside a `.tscroll` wrapper.

**Build approach.** Generate day files from a Python script with content in a separate module,
rather than hand-editing a 150KB HTML file. Sprites get templated once instead of pasted
fourteen times, and the whole file is reproducible.

---

## 6. The progress map — built

`map.html` is the primary navigation and progress surface. The per-day `.tracker` stays as
each day's internal table of contents; the field map sits above it as the whole-curriculum
view.

One deliberate departure from the original plan: **regions do not unlock in sequence.**
Everything is open from the first visit. A student who already knows the economics should be
able to walk straight into frameworks, and gating that behind Day 0 would punish them for it.
Progress therefore reads as *territory explored*, never as *permission earned* — which is also
why there is no `locked` state in the table below.

### Files

```
index.html              landing — title plate, START TRACKING
map.html                the field map
assets/css/w2ws.css     shared tokens + shell (DESIGN.md §2 made real)
assets/js/curriculum.js  ← the only file you edit to add a day
assets/js/progress.js   progress store
assets/js/map.js        renders the field, wires the dossier panel
assets/js/landing.js    landing-page counters
assets/js/dayhook.js    injects the back-link + completion panel into a day file
Day_0.html …            day files, unchanged apart from four added lines each
```

Day files keep their own inline CSS. Extracting it into `w2ws.css` (the old step 1) was
deliberately *not* done: the shared sheet and the day sheets both define `.topbar`, `.px`,
`.radar` and friends, so loading both into one page would have them fight. `dayhook.js`
injects its own prefixed (`.w2*`) styles instead, and touches nothing the day file owns.

### Adding a day

1. Drop `Day_3.html` next to `index.html`.
2. Append one object to `DAYS` in `curriculum.js` — id, day number, region, title, lede,
   file, seed, and one `[anchor, title, subtitle]` row per section.
3. Add these four lines to the new day file, just before `</body>`:

```html
<div id="w2wsDone" data-day="d3"></div>
<script src="assets/js/curriculum.js"></script>
<script src="assets/js/progress.js"></script>
<script src="assets/js/dayhook.js"></script>
```

Nothing else. The territory, its coastline, its blips, the counters, the radar and the region
strip all derive from that one object. Layout is a serpentine trail, three territories per
row, so the field grows downward as days are added; `x` / `y` on a day override the auto
placement if you want to hand-tune one.

**Never rename a day `id` or a concept anchor once students have used the site** — saved
progress keys off `dayId-anchor`, and a rename silently orphans it.

### Model

```
WORLD          WebToWallStreet — the whole curriculum
  └─ REGION    one day (Day 0 Foundations, Day 1 Economics, Day 2 Frameworks…)
       └─ NODE one concept / sighting (currently a .marker)
```

### Node states

Three states, derived — never stored. A day's state is a function of how many of its
concepts are logged, so it can never disagree with the counters:

| State | Condition | Treatment |
|---|---|---|
| `s-new` | 0 logged | Red pin, red markers, red plate rule |
| `s-part` | some logged | Amber pin, amber plate rule, logged markers turn green |
| `s-done` | all logged | Green pin, green plate rule, flag planted on the territory |

**Red means outstanding here, and that is the one extension to §2's vocabulary.** It is
consistent with "urgent" rather than a new meaning — an unexplored sighting is work still
owed. It also makes the map's red markers agree with the red radar blips and the
`N SIGHTINGS UNEXPLORED` counter, which all count the same thing.

**Cyan is now chrome only** — frames, routes, labels, the *you are here* ring. It was doing
double duty as both interface colour and the "unexplored" state, which is exactly the
ambiguity §2 exists to prevent. Nothing on the map uses cyan to mean a state.

Plus one non-state: a pulsing cyan ring marks the region you are furthest into, computed by
`progress.resumeDay()`. It is a hint, not a gate.

### Shape carries kind, colour carries state

An ordinary sighting is an octagon; a region's final section — its capstone — is a star. The
star says *this one matters* at every progress level, so the two axes never collide. Add new
marker kinds as shapes, never as colours.

The `.pin` `:nth-child` colour cycling in the day files is now the only place colour means
variety rather than progress. It stays confined there; nothing on the map uses it.

### Where this leaves colour-blind readers

Red and green are the hardest pair to tell apart, and the map now leans on them. Nothing is
colour-only at the region level: every territory carries its `6 / 14 SIGHTINGS` count in
text, the region chips repeat it, the counter totals it, and a cleared region plants a flag —
a shape, not a hue. The individual concept markers *are* colour-only, and they are deliberately
the secondary readout rather than the primary one. If that ever stops being good enough, give
logged markers a distinct shape rather than a lighter green.

### Regional layout

Territories are **generated, not drawn**. Each day gets a seeded radial wobble
(3 sine terms over `atan2`) rasterised onto the 16-unit cell grid, which gives a distinct
blocky coastline per seed without anyone drawing artwork. Cells are merged into horizontal
runs before emitting — about 25 `<rect>`s per island instead of 600.

Territories are joined by dashed `.route` strands. Concept blips ring the inside of each
coastline, so a glance at an island tells you how much of it you hold.

`RX` is deliberately held under half the column gap: let it grow and neighbouring islands
fuse into one continent and the map stops reading as separate regions.

The radar is a real progress indicator — six blips, green in proportion to percent explored.
The reference's `63 UNEXPLORED SIGHTINGS` plaque is a computed count.

### Persistence

`localStorage`, one key (`w2ws:progress:v1`), one object, read once into memory and written
back debounced:

```js
{ nodes: { 'd0-m06': 1, 'd1-m03': 1 }, updated: 1755300000000 }
```

Batching matters — a 40-node map doing 40 sequential reads would feel broken, so it does one
read at load and every query after that is memory. If storage is blocked (private mode,
embedded webview) the store degrades to memory-only and the map says so rather than throwing.

### What is left

1. Wire the `.checkpoint` blocks to mark their own section complete — they are still passive
   prompts, and they are the honest signal of "I learned this" that a manual tick is not.
2. Concept-level state on the day pages themselves, so logging happens where reading happens
   rather than only in the dossier.
3. A `mastered` state once checkpoints can be passed — green plus a web-strand halo.

---

## 7. Quality floor

Non-negotiable on every page:

- Responsive at 900px, 640px and 380px, verified — not assumed.
- `@media (prefers-reduced-motion: reduce)` disables all animation and transition.
- Visible keyboard focus on every interactive element (`:focus-visible` alongside `:hover`).
- Touch targets at least 44px on phone; hover transforms disabled, `:active` states instead.
- Tables scroll horizontally rather than breaking layout.
- Decorative SVG carries `aria-hidden="true"`; navigation carries a real `aria-label`.
- No `localStorage` / `sessionStorage` in artifact contexts — they fail silently there.
  **This site is not one.** Served as static files from GitHub Pages it is a normal web
  origin, and `localStorage` is the correct tool; see §6. Keep the distinction straight — the
  rule above still applies to anything pasted into an artifact.
