# DESIGN.md

How ubc.gg should look and behave. Read it with `PRODUCT.md` (who the site is for) and
`docs/ui-overhaul-plan.md` (the redesign sequence) before touching UI.

This file records decisions and rules, not values. Colours, type sizes, radii and spacing live in the
MUI theme (`frontend/src/theme/`). Components take values from the theme, never raw hex.

## Brand facts

- **Brand colour: none confirmed.** The club has no brand colour. The red in the MJC logo is a
  candidate for the accent, nothing more. Open, see below.
- **Placement colours: confirmed.** Gold, silver and bronze mark 1st, 2nd and 3rd. 4th is a neutral
  grey; its exact value is open, but it must meet the contrast targets below in both modes.
- **Typeface: Source Sans 3, confirmed** (2026-10-21). One family for every role, self-hosted from
  `@fontsource-variable/source-sans-3`. It was picked for its narrow tabular digits, so scores fit
  phone columns. Round notation and other CJK text use each device's own CJK font.
- **Colour modes:** light, dark and system, chosen in Settings. Both modes are first-class: design and
  check every change in both.

## Visual direction

1. **App pages are for operating.** Colour marks actions, state and data, never decoration. The home
   page is for persuading and may use type and colour more boldly, but within the same theme.
2. **One accent.** It marks primary actions, the active nav item, focus and selection. Headings,
   icons and backgrounds don't get it.
3. **Flat surfaces.** Spacing and dividers separate content. At most one level of card. Elevation is
   only for things that float: menus, dialogs, the nav drawer.
4. **Type carries the hierarchy.** One family in four roles: heading, body, label, data. Body text is
   16px.
5. **Numbers read as data.** Right-aligned in columns. Score and Elo changes show a sign (+12, −8),
   not just a colour.
6. **Stats are rows, not tiles.** A label, then the value, in plain type.
7. **Text is left-aligned.** Centre only short standalone items, such as an empty state.
8. **Buttons fit their label.** The theme doesn't force full-width or minimum-width buttons.
9. **The identity is mahjong itself:** 中/白/發 dragon tiles, round notation like 東四局 0本場,
   and medal colours for 1st–3rd.
10. **Phone first.** Design at 390px, then widen. When surfaces compete, the recorder's flow wins.

## Avoid

These are why the old branch read as AI-made.

- Gradient-filled text; glows and accent-tinted shadows; pulsing dots
- Small uppercase labels above headings ("eyebrows") as decoration
- Icons in tinted squares; pills and chips for things that are just links
- KPI tiles; bordered cards nested in bordered panels
- Status chips not backed by data
- Mixed alignment (the global `.App { text-align: center }` in `frontend/src/App.scss` causes most
  of it)
- Generated illustration behind body text. If the hero art stays, credit the artist and keep it out
  from under the copy on phones.

## Engineering rules

Main doesn't follow most of these yet: `frontend/src/theme/utils.ts` uses `100vh` and a bare
`:hover`. The theme PR fixes the global cases. Page PRs fix their own pages.

**Inputs are at least 16px on phones.** iOS Safari zooms the page when it focuses a smaller input. MUI
inputs use `body1`, which the theme keeps at 1rem, so `TextField`, `Select` and `Autocomplete` are
covered. Don't shrink `body1` or give an input a smaller font. Only an input built outside MUI needs
its own rule.

**Hover only on devices that can hover.** On touch screens a `:hover` style sticks after a tap.

```tsx
sx={{ "@media (hover: hover)": { "&:hover": { bgcolor: "action.hover" } } }}
```

**Respect reduced motion.** Keep transitions short (150–300ms) and animate only `transform` and
`opacity`. Turn non-essential motion off when the user asks:

```tsx
sx={{ "@media (prefers-reduced-motion: reduce)": { transition: "none", animation: "none" } }}
```

**`100dvh`, not `100vh`.** On phones `100vh` includes the area behind the browser bars, so
full-height layouts overflow.

**Tabular numbers** for scores, points, Elo, deltas, ranks and timers, so digits line up and don't
shift when values update. The theme sets `fontVariantNumeric: "tabular-nums"` on `body`. A component
whose styles use the `font` shorthand resets it, as DataGrid does, and needs its own override in the
theme.

**Contrast targets,** checked in light *and* dark:
- 4.5:1 for body text
- 3:1 for large text (24px, or 18.7px bold)
- 3:1 for UI parts: icons, borders, focus rings, chart marks, placement colours

These are targets; the club hasn't formally committed to WCAG. Known failures are listed in the plan.
On main, the 4th-place colour `#404040` in `statistics/PlacementHistoryGraph.tsx` is 1.8:1 against
MUI's dark background.

**Colour is never the only signal.** Placements also show the rank, deltas a sign, status a word or
icon.

**Touch targets are at least 44px and 8px apart.** The theme already gives `Button` and `IconButton`
44px. Keep custom controls the same size.

**No horizontal scroll at 390px.** Give flex children that hold text `minWidth: 0` so they can shrink.
The record-game page currently fails this.

**Fixed and sticky bars respect safe areas.** Pad them with `env(safe-area-inset-*)` and reserve their
height so content doesn't hide under them. `env()` only returns non-zero values once the viewport meta
in `frontend/src/root.tsx` has `viewport-fit=cover`, which main doesn't set yet.

**Breakpoints are MUI's defaults:** xs 0, sm 600, md 900, lg 1200, xl 1536.
- Refer to them by name, never by pixel value.
- Write the `xs` case first, then add larger keys in responsive `sx` objects.
- Use `useMediaQuery` only to render something different, never for styling CSS can do.

**Images are WebP** (or AVIF), with `width`/`height` or `aspectRatio` set, and lazy-loaded below the
fold.

PR checks (screenshots, typecheck, lint, critique) are in the plan's Constraints section.

## Open decisions

- TODO: Light and dark, or dark only? Default: keep both (Settings already offers them).
- TODO: One accent, or the dragon-tile accent picker? Default: one accent. The picker would come later,
  as its own PR.
- TODO: Which accent colour? The logo red (中) is the candidate. The club has no brand colour to
  match.
- TODO: Hero image: keep the generated illustration (credited), commission new art, or use club
  photos?
- TODO: Chombos column visible by default or hidden? A team decision, not a design one.
