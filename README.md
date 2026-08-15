# WebToWallStreet

A beginner's path into consulting, built as a field tracker. Each study day is a **region** on
a map, each concept inside it is a **sighting** you log, and progress is territory explored.

Nothing is locked. A student who already knows the economics can walk straight into
frameworks.

New here? Read [`CONTEXT.md`](CONTEXT.md) first — it covers who this is for and which
decisions are already settled.

---

## Running it

It is a static site with no build step. Open `index.html`, or serve the folder:

```bash
python -m http.server 8000     # then visit http://localhost:8000
```

A local server is worth using over `file://` — some browsers restrict `localStorage` on
`file://`, and that is where progress lives.

## Deploying to GitHub Pages

1. Push the folder to a repository.
2. **Settings → Pages → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
3. It publishes at `https://<user>.github.io/<repo>/`.

`index.html` is at the root, so Pages picks it up with no configuration. All paths are
relative, so the site works from a subpath without changes.

---

## Layout

```
index.html                 landing page
map.html                   the field map
Day_0.html Day_1.html …    the day content
CONTEXT.md                 why this exists, who it is for, what is already decided
DESIGN.md                  design system — read this before changing anything visual
AGENTS.md                  rules and verification steps for AI agents
assets/
  css/w2ws.css             tokens + shell for the landing page and map
  js/curriculum.js         ← the only file you edit to add a day
  js/progress.js           progress store (localStorage)
  js/map.js                renders the map, wires the dossier panel
  js/landing.js            landing-page counters
  js/dayhook.js            adds the back-link + completion panel to a day file
```

## Adding Day 3

**1.** Drop `Day_3.html` in the root, next to `index.html`.

**2.** Append one object to `DAYS` in `assets/js/curriculum.js`:

```js
{
  id: 'd3',                       // never change this later — progress is keyed on it
  day: 3,
  region: 'CHARTS',               // one word, shown under the pin
  title: 'Charts, Tables & Odd Cases',
  lede: 'One or two sentences for the dossier panel.',
  file: 'Day_3.html',
  seed: 5150,                     // any integer — changes the island's shape
  concepts: [
    ['m01', 'Reading A Chart Fast', 'What the axes are hiding'],
    ['m02', 'Tables Under Time',    'Find the number that matters']
    // one row per section, in file order
  ]
}
```

**3.** Add these four lines to `Day_3.html`, just before `</body>`:

```html
<div id="w2wsDone" data-day="d3"></div>
<script src="assets/js/curriculum.js"></script>
<script src="assets/js/progress.js"></script>
<script src="assets/js/dayhook.js"></script>
```

That is the whole job. The island, its coastline, its concept blips, the counters, the radar
and the region strip all derive from that one object. Territories lay out on a serpentine
trail three per row, so the map grows downward as days are added.

Optional: add `x` and `y` (on a 1600-wide field) to hand-place a territory instead.

### Two rules

- **Never rename a day `id` or a concept anchor once students have used the site.** Progress
  is stored as `dayId-anchor`; renaming one silently orphans that student's progress.
- **`concepts` anchors must match real `id`s in the day file.** `['m01', …]` links to
  `Day_3.html#m01`. If the section ids do not match, the dossier links go nowhere.

---

## How progress works

One `localStorage` key, `w2ws:progress:v1`, holding one object. It is read once at load and
every query after that is served from memory, with writes debounced — a 40-node map doing 40
sequential storage reads would feel broken.

A day's state is **derived**, never stored: all concepts logged → cleared, some → in progress,
none → unexplored. It cannot drift out of sync with the counters.

Students log progress two ways: **MARK REGION EXPLORED** at the bottom of a day page, or
concept by concept in the map's dossier panel. **RESET PROGRESS** on the map clears everything
after a confirm.

If a browser blocks storage (private mode, some embedded webviews), the store falls back to
memory-only and the map says so instead of failing silently.

---

## Attribution

Every sprite — the arachnid markers, the octagonal emblem, the field-unit figure, the island
coastlines — is original geometry drawn as SVG rects and polygons. The interface *grammar*
was developed against a promotional site as a reference, but no asset, character, wordmark or
partner branding is borrowed from it. See `DESIGN.md` §1, which lists what is off limits and
why it matters for a public site aimed at recruiters.
