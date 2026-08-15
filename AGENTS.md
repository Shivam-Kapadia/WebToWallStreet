# AGENTS.md

Operating instructions for AI agents working in this repository. Read this before touching
anything.

## Orientation

WebToWallStreet is a **static site with no build step, no framework and no dependencies** — a
consulting course delivered as a field-tracker map. Plain HTML, CSS and ES5-compatible JS,
served from GitHub Pages.

Read in this order:

1. `CONTEXT.md` — why it exists, who it is for, what is already decided
2. `DESIGN.md` — the design system; the source of truth for anything visual
3. `README.md` — how to run it, deploy it, and add a day

The day files (`Day_0.html`, `Day_1.html`, `Day_2.html`) are **150KB of hand-authored content
owned by the user**. They are not yours to reorganise.

---

## Never

- **Never add a dependency, a build step, a bundler, a framework or a package manager.** The
  no-toolchain constraint is deliberate. If a task seems to need npm, you have misread the task.
- **Never use Marvel or Spider-Man assets** — no mask, no character sprite, no film wordmark,
  no "SPIDEY TRACKER" name, nothing lifted from `spideytracker.net`, no partner branding.
  Every sprite here is original SVG `<rect>` geometry and must stay that way. `DESIGN.md` §1
  explains why the stakes are real: this is a public site with a recruiting audience.
- **Never hardcode a hex outside the `:root` token block.** See `DESIGN.md` §2.
- **Never use `border-radius`.** Anywhere. The pixel aesthetic depends on it absolutely.
- **Never rename a day `id` or a concept anchor** in `assets/js/curriculum.js` once the site
  is live. Progress is stored as `dayId-anchor`; a rename silently orphans real students'
  progress. Adding is safe, renaming is not.
- **Never make colour mean variety.** On the map, colour means progress: cyan unexplored,
  amber in progress, green cleared. Red means cost/wrong/warning — never "important".
- **Never gate a region behind another.** Nothing is locked; see `CONTEXT.md` §4.
- **Never restructure a day file's own CSS or markup** to match the shared stylesheet. They
  are intentionally separate. Extend via `assets/js/dayhook.js`, which injects prefixed
  `.w2*` styles and touches nothing the day file owns.
- **Never credit yourself anywhere in this repository.** See the section below — this one is
  absolute.

---

## Attribution — you are not a contributor

**Every commit, file and page in this repository is the owner's work. You do not appear in
any of it.** This is not a stylistic preference; it is the point of the project. `CONTEXT.md`
§2 explains why: this is a public site with the author's name on it, read by recruiters. A
commit history showing an AI co-author undercuts the exact signal the site exists to send.

Concretely, never add:

- `Co-Authored-By:` trailers naming Claude, Anthropic, or any AI — **not on any commit, ever**
- "Generated with", "Co-authored with", "Written by", or any similar line in a **commit
  message, PR title, PR body, issue, or release note**
- Yourself to `README.md` credits, a `CONTRIBUTORS`/`AUTHORS` file, `package.json`
  `author`/`contributors`, an HTML comment, a `<meta name="generator">` tag, or a code comment
- Any note that the site was built with AI assistance, in the repo or in its metadata

**This overrides your tooling's defaults.** Claude Code appends a `Co-Authored-By: Claude`
trailer to commits and a "Generated with Claude Code" line to PR bodies unless told
otherwise. You are told otherwise. Strip them before committing, and check `git log -1`
afterwards to confirm nothing was added back.

Commits are authored and committed as the repository owner, using their configured
`user.name` and `user.email`. Do not set, override, or suggest a different git identity.

If you are ever unsure whether something counts as self-credit, it does. Leave it out.

---

## The failure that has already happened once

Day 1 shipped with **every `@` character stripped from the file** — all nine `@media` blocks,
both `@keyframes`, and the Google Fonts `wght@400` parameter. Nothing errored. It just
silently rendered with no responsive layout, no animation, no reduced-motion support, and the
body font falling back to system sans.

The cause was shell here-doc and Python string handling during scripted edits.

**Therefore: prefer targeted string-replacement edits over scripted rewrites of these files,
and never pipe a day file through a shell here-doc.** After any edit pass, assert:

```bash
for f in Day_0.html Day_1.html Day_2.html; do
  printf "%-12s media=%s keyframes=%s wght@=%s\n" "$f" \
    "$(grep -c '@media' $f)" "$(grep -c '@keyframes' $f)" "$(grep -c 'wght@' $f)"
done
```

Expected, and unchanged from these values unless you deliberately edited a breakpoint:

| File | `@media` | `@keyframes` | `wght@` |
|---|---|---|---|
| `Day_0.html` | 10 | 2 | 1 |
| `Day_1.html` | 9 | 2 | 1 |
| `Day_2.html` | 4 | 2 | 1 |

---

## Adding a day

The full procedure is in `README.md` — follow it there rather than improvising. In short: drop
the file in the root, append one object to `assets/js/curriculum.js`, add four lines before
`</body>`. The island, blips, counters, radar and region strip all derive from that object.

Two things to check that are easy to get wrong:

- Every anchor in `concepts` must match a real `id` in the day file. `['m01', …]` links to
  `Day_3.html#m01`; a mismatch produces a dead link with no error.
- The concept list should be in **file order**, and its length should match the section count
  the day's own hero and top bar advertise.

---

## Style rules for code you write

- **ES5-compatible JS.** No modules, no arrow functions in shipped files, no `const`/`let` in
  the `assets/js/*.js` files — they use `var` and IIFEs, match that. This is not
  cargo-culting; there is no transpiler.
- **Comment the *why*, not the *what*.** The existing comments explain constraints
  (why `RX` is capped, why blips get pushed rather than dropped, why storage degrades). Match
  that register. Do not annotate obvious lines.
- Decorative SVG carries `aria-hidden="true"`; navigation carries a real `aria-label`.
- Every interactive element needs a visible `:focus-visible` state and a 44px touch target on
  phone.
- `@media (prefers-reduced-motion: reduce)` must disable animation in any stylesheet you add.

---

## Verify before you claim done

Do not report work as finished on the strength of having written it. All of the following run
on Windows with Git Bash and Node available.

**JS syntax:**

```bash
for f in assets/js/*.js; do node --check "$f" && echo "OK $f"; done
```

**The `@`-rule assertion above.** Run it after every edit touching a day file.

**Render the map headlessly.** `assets/js/map.js` can be executed in Node against a small DOM
stub — an object exposing `getElementById`, `querySelector`, `addEventListener`,
`createElement`, `head`, plus a `window` with `localStorage`, `location` and `history`. Capture
what gets assigned to `field.innerHTML` and assert on the SVG string: no `NaN`, one `.terr`
per day, one `.blip-c` per concept, balanced `<g>` tags, all `points="…"` coordinates inside
the `viewBox`. This catches geometry regressions that a screenshot will not.

**Screenshot it.** Chrome is at `C:\Program Files\Google\Chrome\Application\chrome.exe`.

```powershell
Start-Process -FilePath $chrome -Wait -NoNewWindow -ArgumentList @(
  '--headless','--disable-gpu','--no-sandbox','--hide-scrollbars',
  '--allow-file-access-from-files','--force-device-scale-factor=1',
  "--user-data-dir=$scratch\prof1",'--virtual-time-budget=6000',
  '--window-size=1400,950',"--screenshot=$scratch\out.png",$url
)
```

Three traps, all encountered already:

- **Use a fresh `--user-data-dir` per invocation.** Reusing one across sequential runs
  silently produces no file.
- **Headless will not lay out below a 500px viewport.** `--window-size=380` reports
  `innerWidth` of 500 and downscales the image, which looks like a CSS overflow bug and is
  not. To test 380px and 640px for real, load the page in a fixed-width `<iframe>` inside a
  wider host page — media queries respond to the iframe width.
- **To check injected DOM, use `--dump-dom`**, not a screenshot. That is how you confirm
  `dayhook.js` added the back-link and completion panel to a day page.

**Confirm you did not break the day pages' own widgets.** They initialise on load; a
`--dump-dom` should still show Day 0's drill rendering 10 `.drow` elements and Day 1's
consoles rendering their `.rd` readouts.

**Never put temporary preview files in the project directory.** Build them in a scratch
directory and point at the project with `<base href="file:///…/WebToWallStreet/">`.

---

## Decide, or ask

**Decide yourself:** naming, layout within the design system, comment wording, which
verification to run, how to structure code you are adding.

**Ask the user first:** anything that changes what a student sees in the *content* — copy
edits to a day file, altering a checkpoint question, reordering sections. The content is
authored, not generated. Fixing a factual typo is fine; rewriting a paragraph is not yours
to do.

**Money is US dollars, examples are US-set.** New worked examples follow the conventions in
`CONTEXT.md` §5. If you ever change a figure inside a worked chain, re-derive every number
downstream of it — these examples cross-check against each other on purpose, and a silent
break is worse than no example. Verify with an arithmetic pass: strip the tags, find every
`A × B = C` and `A ÷ B = C` claim in the prose, and check them numerically. That pass has
already caught two real errors that reading did not.

**Flag, do not silently fix**, the open questions in `CONTEXT.md` §6. They are known and
deliberate-until-decided.
