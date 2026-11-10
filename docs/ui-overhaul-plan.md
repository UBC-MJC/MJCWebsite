# UI overhaul plan

Context for anyone (human or agent) working on the front-end redesign. Read this before touching UI.

## Goal

Redesign ubc.gg in small, independently mergeable PRs off current `main`, keeping the best of the
`ui-overhaul-integration` branch while fixing the two complaints it got: too many changes at once,
and looking AI-generated.

## Constraints

- Stack stays as is: React Router (framework mode), MUI v7 + Emotion, TanStack Query. No Tailwind,
  no shadcn, no new component library, no styling migration.
- Design values live in the MUI theme (`frontend/src/theme/`). Components use theme values, not raw hex.
- Each PR: one area, branched from `main`, mergeable alone, with screenshots at 390px and 1440px in
  light and dark, and `npm run typecheck` + `npm run lint` passing.
- Visual changes and behaviour changes go in separate PRs.
- Credit the original author on ported work with a `Co-authored-by:` trailer.

## Users

- Members recording rounds on a phone at the table, mid-game. Speed and error-proofing matter most.
- Members checking the leaderboard, their stats, and live games, mostly on phones.
- Prospective members landing on the home page (club room, Discord, Instagram, how to start).
- Club execs using the admin pages.

## The `ui-overhaul-integration` branch

Based on `main` as of 2026-05-27. Since then `main` moved to React Router framework mode (`App.tsx`
and `index.tsx` no longer exist; routes are in `src/routes.ts` + `src/routes/`), added the Activity /
check-in page, and changed seasons. **Port from it; never merge or rebase it.** The `pr-1` … `pr-11`
branches are stacked (each contains all earlier ones), so treat individual commits as the reference:

| Commit | What | Verdict |
| --- | --- | --- |
| `7cfa7e5` | Theme foundation: tokens, light/dark, 3-accent switcher, Manrope, DESIGN.md | Rework: keep the idea of tokens + a real font; one accent, no glass/glow tokens |
| `edc523a` | Atoms: StatCard, IconBadge, SectionHeader | Drop IconBadge; replace StatCard tiles with typographic rows |
| `20e8c18` | NavBar split into `navbar/`; 4 links + Record button | Keep; add Activity back |
| `01bc9f1` | Home hero with artwork | Rework (see AI tells below) |
| `54da287` | Stats: placement distribution bar + history chart | Keep charts; drop tiles and cards-in-cards; fix 4th-place colour |
| `97ca89b` | One `/leaderboard` page with `?variant=&type=` and legacy redirects | Keep (behaviour change: own PR) |
| `c9c0dc6` | Auth pages + settings accent picker (dragon tiles) | Keep auth layout; defer picker |
| `cf5d45d` | Resources page | Rework: plain grouped list, no pills or EN/ZH badges |
| `37b74b5` | Incidental cleanup | Cherry-pick what still applies |
| `5e74787` | One Games page: live + logs, Riichi/HK toggle | Keep; hide empty Elo column on live games |
| `bde973c` | Stepped record-game flow + validation changes | Keep UI; **do not port the default-hand change** |

### Do not port

- **Default hand change** in `game/common/constants.ts`: `JP_UNDEFINED_HAND` becomes
  `{han: 1, fu: 30}` and HK becomes `HK_DEFAULT_HAND = 3`. The JP validator only demands a hand
  while `han === -2`, so a recorder who forgets to enter the hand would silently record a 1-han win
  that feeds Elo. Keep main's sentinel values.
- Hardcoded "Season Active" / "VRO 2026 Open" chips and the `/vro2026` link (VRO ran July 18–19;
  the route is commented out on main).
- The accent switcher (3 accents × 2 schemes = 6 themes to QA). Maybe later, as its own PR.
- Hiding the Chombos column by default: team decision, not a design change.

## Avoid (why the branch read as AI-made)

- Gradient-filled text; glows and accent-tinted shadows; pulsing dots
- Small uppercase labels above headings ("eyebrows") as decoration
- Icons in tinted squares; pills and chips for things that are just links
- KPI tiles; bordered cards nested in bordered panels
- Status chips not backed by data
- Mixed alignment (the global `.App { text-align: center }` in `App.scss` causes most of it)
- Generated illustration behind body text. If the hero art stays, credit the artist and keep
  it out from under the copy on phones; real club photos are an alternative.

## Keep (what's genuinely good)

- Mahjong-native details: 中/白/發 dragon tiles, 東四局 0本場 round notation, medal colours for
  1st–3rd; the logo's red is a candidate accent, not a brand colour (the club has none yet)
- Simpler nav; record flow with numbered steps, "requirements left" gate, grouped destructive actions
- Leaderboard: medal ranks, tabular numbers, shareable URLs
- Mobile groundwork: 16px inputs, hover only on hover-capable devices, reduced motion, `dvh`, WebP

## Known issues on main

- Record-game page overflows on phones: 529px wide at a 390px viewport.
- No web font is loaded (falls back to Helvetica/Arial); MUI's stock `info` blue AppBar.
- Every button is full-width on phones and at least 200px on desktop (theme default).
- Leaderboard player stats open on double-click on desktop (undiscoverable).
- `game/new/` is not imported anywhere; delete instead of restyling it.

## Contrast to fix

- 4th-place colour `#563a33`: 1.8:1 on the dark background.
- Light-mode title gradient end `#F2B0B0`: 1.65:1 on the hero background.

## PR sequence

1. **Context** — `PRODUCT.md` (via `/impeccable init`), short `DESIGN.md`, this file. No UI changes.
   `DESIGN.md` must record the brand colours (logo red; medal gold/silver/bronze for 1st–3rd) and
   whether a typeface is already chosen: `colorize` asks for confirmed brand colours, and `typeset`
   keeps confirmed families instead of replacing them.
2. **Theme** — in this order, each as its own commit, scoped to `frontend/src/theme/`:
   - `/impeccable typeset`: font, role scale (heading / body / label / data), tabular numbers for
     scores and Elo. Expect it to raise body text to 16px (the old branch used 0.9rem).
   - `/impeccable colorize`: surfaces, text, one accent, semantic and placement colours for light and
     dark; fixes the contrast failures above. App pages are "operate" mode: colour marks actions,
     state and data, not decoration.
   - `/impeccable quieter`: strip anything decorative left over.
   - Then remove global centring and forced full-width buttons.
   Their type scan can't read MUI `sx` values, so tell them to judge from the theme files and the
   running pages (leaderboard, a game, stats).
3. **Nav** — port `20e8c18`, include Activity.
4. **Record game (UI)** — port `bde973c` minus the default-hand change; fix the phone overflow.
   Emil's `mobile-native` and `break-ui`; `/impeccable harden`.
   4b. Validation helpers + vitest for `assignRoundAction` / `getUnmet*RoundRequirements`.
5. **Leaderboard** — UI first; query-param routing + redirects as a separate PR.
   `/impeccable typeset` on the table: rank, name and numeric roles, alignment.
6. **Games page** — port `5e74787`. `colorize` check: positive/negative score deltas not by colour alone.
7. **Stats** — port charts from `54da287`, rows instead of tiles. `/impeccable colorize` on the
   placement scale: 1st–4th distinguishable by label or shape, 4th-place contrast fixed.
8. **Home** — `/impeccable shape`, or Taste Skill with `--keep palette,type`. This page is
   "persuade" mode, so a `typeset` + `colorize` pass here may use type and colour more boldly than
   the app pages, within the theme from PR 2.
9. **Resources, auth, settings.**

After each PR: `/impeccable critique` on the changed pages, and
`npx impeccable detect http://localhost:3000/<page>` against the running app. The file-based scan
(`detect src/`) does not see MUI `sx` styles, so it reports nothing here.

## Open decisions

- Light + dark (main already lets users choose in Settings) or dark only? Default: keep both.
- One accent or the dragon-tile picker? Default: one (red 中).
- Hero: keep the illustration (credited), commission new art, or use club photos?
- Chombos column: visible by default or hidden?
