# DESIGN.md — UI/UX & Responsive Guidelines for Claude

This file is the design source-of-truth for **Claude Code** when building or changing
UI in this repo (React + TypeScript + Vite + **Material-UI v7**, **dark theme only**).
Read it before touching anything visual. Rules are imperative on purpose — follow them
unless the user explicitly overrides.

It distills MUI's [Responsive UI guide](https://mui.com/material-ui/guides/responsive-ui/)
(Grid, Container, Breakpoints, `useMediaQuery`) and was cross-checked against a UI/UX
rule set (accessibility, touch, performance, layout, typography, animation). The current
theme tokens and config are embedded at the bottom as the single reference.

---

## 0. How to use this file

- **Style with the theme, not hardcoded values.** Import tokens from `@/theme/tokens`,
  reuse `sx` presets from `@/theme/utils`, and rely on the component overrides in
  `@/theme` (`createAppTheme`). Never paste raw hex/rgba into a component.
- **Match the surrounding file.** Existing code is `any`-free, uses the `sx` prop, and
  responsive objects — keep that idiom.
- **When in doubt, mobile-first + CSS-first.** Default base styles to `xs`, layer larger
  breakpoints on top, and prefer responsive `sx` over JS branching.

---

## 1. Core principles

1. **Mobile-first.** Write the `xs` (smallest) case as the base, then add `sm`/`md`/`lg`
   overrides that *enlarge*. Use `theme.breakpoints.up(key)` in styled/CSS contexts.
2. **CSS-first responsiveness.** Use the `sx` prop's responsive object syntax for layout
   and styling. Only reach for `useMediaQuery` when you must **conditionally render**
   different React (e.g. swap a `Dialog` for a `Drawer`, toggle DataGrid `density`),
   never for styling that CSS can express.
3. **Token discipline.** All color/shadow/timing/gradient values come from
   `@/theme/tokens`. If you need a new value, add a token there first.
4. **Consistency over novelty.** Reuse existing components, spacing rhythm, and the
   established radius/shadow scale. Uniform elements + spacing = the MUI/Material baseline.
5. **Accessibility is not optional.** Contrast, focus, keyboard, labels, reduced-motion
   are CRITICAL — see §8.

---

## 2. Breakpoints (MUI defaults — do not change)

| key | min width | typical device |
|-----|-----------|----------------|
| `xs` | 0px    | phones |
| `sm` | 600px  | large phones / small tablets |
| `md` | 900px  | tablets / small laptops |
| `lg` | 1200px | laptops / desktops |
| `xl` | 1536px | large desktops |

- Always reference breakpoints by **named key**, never magic pixels.
- Responsive object syntax (preferred):
  ```tsx
  <Box sx={{ py: { xs: 4, md: 7 }, fontSize: { xs: "1rem", md: "1.15rem" } }} />
  <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 2, md: 3 }} />
  ```
- In `styled()`/theme overrides use helpers: `theme.breakpoints.up("md")`,
  `.down()`, `.between(a, b)`, `.only()`.
- `useMediaQuery` only for render logic:
  ```tsx
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  // density / Dialog-vs-Drawer / tap-vs-doubleclick — not styling
  ```

---

## 3. Layout

- **`Container`** centers content and applies responsive gutters (already themed: 16px,
  24px ≥md). Use `maxWidth="lg"` for page content; one Container per content band.
- **`Stack`** for 1-D flows. Use `direction={{ xs: "column", sm: "row" }}` to stack on
  mobile and row on larger screens. Add `useFlexGap flexWrap="wrap"` when items should
  wrap instead of overflow.
- **`Grid`** (v7 `size={{ xs, md }}`) for 2-D responsive layouts.
- **No horizontal scroll** on any breakpoint. Test at **375px** width. Use `minWidth: 0`
  on flex children that contain text so they can shrink/ellipsize instead of overflowing.
- **Full-bleed sections** (e.g. hero): a full-width wrapper with an inner `Container`.
- **Respect safe areas** for fixed/sticky UI: pad with `env(safe-area-inset-*)`
  (the NavBar drawer and Game footer already do this).
- **Fixed/sticky bars must reserve space** so content isn't hidden beneath them
  (see Game.tsx footer padding via `--game-footer-height`).

---

## 4. Spacing & sizing

- **8px spacing scale** (theme `spacing: 8`). `spacing={2}` = 16px. Use the scale for
  padding/margins/gaps — no arbitrary px.
- Vertical rhythm tiers: ~16 / 24 / 32 / 48 (`2 / 3 / 4 / 6`) by hierarchy level.
- **Touch targets ≥ 44px.** Already enforced for `MuiButton`, `MuiIconButton`
  (min 44). Keep custom interactive elements ≥44px and ≥8px apart.
- **Use `100dvh`, not `100vh`** for full-height mobile (accounts for browser chrome).
  See `responsiveDataGridContainer`.
- Declare image/media dimensions (`width`/`height` or `aspectRatio`) to avoid layout
  shift (CLS).

---

## 5. Typography

- The theme scale (h1–h6, body1/2, caption) is in `@/theme`. Prefer `variant=` over
  custom font sizes; if you need fluid sizing, use `clamp()` (h1–h3 already do).
- Responsive font size via objects when needed: `fontSize: { xs: "1rem", md: "1.15rem" }`.
- **Body line-height 1.5–1.75**; **line length ~60–75 chars** on desktop (cap text
  blocks with `maxWidth` ~ 60ch / 520–640px).
- **Tabular numerals for data** (leaderboard ELO, scores, timers):
  `fontVariantNumeric: "tabular-nums"` to prevent column jitter.
- **Inputs must render ≥16px on mobile** — fonts < 16px trigger iOS auto-zoom on focus.
  ✅ Handled globally: the `MuiTextField` override forces input font to `16px` below `sm`
  (compact `0.9rem` on ≥sm). `Autocomplete`/`Select` inherit this via `TextField`, so you
  normally don't need a per-field override. Only override if you build an input that does
  **not** go through `TextField`.
- Weight for hierarchy: headings 700–800, labels 500–600, body 400.
- Prefer wrapping over truncation; if truncating, provide full text via tooltip.

---

## 6. Color & theming (dark mode)

- **Dark mode is the only mode.** Design and verify against the dark surfaces below.
- **Never hardcode colors.** Use `theme.palette.*` (`primary.main/light/dark`,
  `text.primary/secondary`, `background.default/paper`, `divider`) or tokens from
  `@/theme/tokens` (`surface`, `overlay`, `shadow`, `gradient`, `placement`, `palette.medal`).
- **Contrast (WCAG AA):** body text ≥ **4.5:1**, large/secondary text ≥ **3:1**,
  UI glyphs/borders ≥ 3:1. Verify new foreground/background pairs.
- **Never use color as the only signal.** Pair status color with an icon/label
  (e.g. chombo chip, live dot, placement medals all carry shape/text too).
- **Dividers/borders** are light-on-dark (`overlay.dark.border`) so they stay visible —
  keep using the token, don't invent dark borders that vanish.
- **Modal/overlay scrim 40–60% black** to isolate foreground (`overlay.dark.overlay`).
- **Gradients:** when a gradient direction is responsive, **keep its anchor consistent
  across breakpoints.** Do not flip a left-anchored scrim to vertical/right at a smaller
  breakpoint (this caused a real hero bug — the dark side appeared to jump). Prefer one
  direction that holds at all widths.

---

## 7. Interaction & animation

- **Hover only on hover-capable devices.** Guard hover transforms with
  `@media (hover: hover)` (theme already does this for Button/IconButton). On touch, a
  bare `:hover` transform latches after a tap.
- **Press feedback** within ~100ms; keep `:active` states.
- **Timing:** micro-interactions **150–300ms**; use the `timing` tokens
  (`fast 0.12s`, `normal 0.18s`, `slow 0.22s`, `ease` cubic-bezier). Avoid > 500ms.
- **Animate `transform`/`opacity` only** (never width/height/top/left) to avoid reflow.
- **Exit faster than enter** (~60–70%). Ease-out entering, ease-in exiting.
- **Respect `prefers-reduced-motion`** — gate non-essential motion:
  ```tsx
  sx={{ "@media (prefers-reduced-motion: reduce)": { transition: "none", animation: "none" } }}
  ```
- Reuse `responsiveCardHover` for card hover affordances (it already disables lift on `xs`).

---

## 8. Accessibility (CRITICAL — verify every change)

- **Contrast** meets §6 thresholds.
- **Visible focus rings** — never remove `:focus-visible` outlines; the theme adds a
  focus ring on inputs (`overlay.primary.focus`). Custom controls need a focus indicator.
- **Icon-only buttons need `aria-label`** (or visually-hidden text).
- **Keyboard:** everything operable by keyboard; tab order matches visual order;
  don't trap focus except in modals (which must offer Esc/close).
- **Headings sequential** (h1→h2→h3, no skipping) per page.
- **Images:** meaningful images get descriptive `alt`; decorative ones get `alt=""`
  + `aria-hidden`.
- **Forms:** see §9.
- **Reduced motion** respected (§7).
- **Color never the sole indicator** (§6).

---

## 9. Forms & feedback

- **Visible label per field** (not placeholder-only). Mark required fields.
- **Errors below the related field**, stated as cause + fix (not "Invalid"). Use
  `role="alert"` / `aria-live="polite"` so screen readers announce them; focus the first
  invalid field on submit.
- **Validate on blur**, not per keystroke.
- **Submit feedback:** disable the button + show progress during async; confirm success.
- **Semantic input types** (`email`, `tel`, `number`) for correct mobile keyboards;
  password fields get a show/hide toggle; enable autofill (`autocomplete`).
- **Disabled state:** reduced opacity (~0.38–0.5) + non-interactive; distinct from read-only.
- **Confirm destructive actions** (use `confirmDialog`, which exists) and prefer undo where feasible.

---

## 10. Navigation

- **Active location highlighted** (color/weight/indicator) — NavBar uses `isActive`.
- **Adaptive:** sidebar/drawer on small screens, inline bar on desktop (NavBar already
  switches at `md`). Don't mix tab + sidebar + bottom nav at the same level.
- **Deep-linkable:** key screens reachable by URL (e.g. `/leaderboard?variant=jp&type=RANKED`).
- **Back is predictable;** preserve scroll/filter state where possible.
- **Destructive items** (logout, delete) visually separated from normal nav.

---

## 11. Data grids & charts

- **DataGrid** styling is themed (`MuiDataGrid` override + `responsiveDataGridContainer`).
  Use `density="compact"` and `disableColumnMenu` on mobile (`useMediaQuery`), and the
  `100dvh`-based height so the grid fits the visible viewport.
- **Tabular numerals** in numeric columns; right-align numbers.
- **Charts:** match type to data (trend→line, comparison→bar, proportion→pie ≤5 slices);
  always show a legend + tooltips; **don't rely on color alone** (add labels/patterns —
  `placement` colors are paired with rank numbers); provide loading & empty states;
  reflow/simplify on small screens; respect reduced-motion for entrance animation.

---

## 12. Performance

- **Optimize images:** prefer **WebP/AVIF**, provide responsive sizes, and **lazy-load
  below-the-fold** media (`loading="lazy"`).
  ✅ The hero is now `public/hero.webp` (~113 KB, was a 6.5 MB PNG). Keep new raster
  assets in WebP/AVIF; convert with `npx sharp-cli --input x.png --output x.webp --format webp -q 82`.
- **Reserve space** for async/media content (declare dimensions / `aspectRatio`) to keep
  **CLS < 0.1**.
- **Code-split routes** — keep using `React.lazy` per route (see `App.tsx`).
- **Virtualize** lists of 50+ rows (DataGrid handles this).
- Batch DOM reads/writes; debounce/throttle scroll/resize/input handlers.

---

## 13. Recorded gotchas (lessons from this codebase)

- **Gradient/scrim breakpoint flip:** a scrim that was horizontal (dark-left) at `md`
  but vertical at `xs` made the dark area "jump" when narrowing. Keep one anchor across
  breakpoints (§6).
- **Sticky touch hover:** transforms on `:hover` without `@media (hover: hover)` stick
  after a tap on touch devices (§7).
- **`100vh` mobile overflow:** use `100dvh` (§4).
- **iOS input zoom:** inputs < 16px auto-zoom on focus (§5).
- **HK cascade asymmetry** (backend) — unrelated to UI but noted in CLAUDE.md.

---

## 14. Pre-commit UI checklist

- [ ] Renders with no horizontal scroll at 375px, and at sm/md/lg.
- [ ] Spacing uses the 8px scale; touch targets ≥44px and ≥8px apart.
- [ ] No hardcoded colors — tokens / theme palette only.
- [ ] Text contrast ≥4.5:1 (≥3:1 large/secondary); color never the only signal.
- [ ] Focus visible; icon-only buttons have `aria-label`; keyboard operable.
- [ ] Hover effects guarded by `@media (hover: hover)`; motion ≤300ms and respects
      `prefers-reduced-motion`.
- [ ] Images have `alt`, declared dimensions, and are lazy-loaded below the fold.
- [ ] Responsive gradients keep a consistent anchor across breakpoints.
- [ ] `npx tsc --noEmit` and `npx eslint` pass for changed files.

---

## 15. Theme & token reference (current — single source of truth)

> Source: `frontend/src/theme/tokens.ts`, `frontend/src/theme/index.ts`,
> `frontend/src/theme/utils.ts`. Keep this section in sync if the theme changes.

### Palette mode: **dark only** (`createTheme(..., { palette: { mode: "dark" } })`)

**Surfaces** (`tokens.surface`)
| token | value |
|-------|-------|
| `background` | `#0B0B0C` |
| `paper` | `#161617` |

**Primary / accent** (`tokens.palette.primary`) — pastel red; `info` reuses these
| token | value |
|-------|-------|
| `primary.main` | `#E78B8B` |
| `primary.light` | `#F2B0B0` |
| `primary.dark` | `#C56A6A` |
| `primary.contrastText` | `#0B0B0C` |

**Medals** (`tokens.palette.medal`) — text + translucent bg
| place | text | bg |
|-------|------|----|
| gold | `#E6C65C` | `rgba(212,175,55,0.14)` |
| silver | `#C7C7C7` | `rgba(199,199,199,0.12)` |
| bronze | `#C58A4B` | `rgba(197,138,75,0.14)` |

**Placement colors** (`tokens.placement`, used by charts/stats)
`1 → gold`, `2 → silver`, `3 → bronze`, `4 → #8C8C92` (neutral gray).

**Icon tokens** (`tokens.palette.icon`)
`badgeLight #F2B0B0`, `badgeDark rgba(231,139,139,0.15)`, `surfaceLight rgba(255,255,255,0.06)`.

**Overlays** (`tokens.overlay`)
| group | token | value |
|-------|-------|-------|
| white | `subtle / medium / strong` | `rgba(255,255,255, 0.15 / 0.18 / 0.3)` |
| dark | `header` | `rgba(255,255,255,0.03)` |
| dark | `hover` | `rgba(255,255,255,0.06)` |
| dark | `border` (= `divider`) | `rgba(255,255,255,0.12)` |
| dark | `shadow` | `rgba(0,0,0,0.5)` |
| dark | `overlay` (scrim) | `rgba(0,0,0,0.6)` |
| primary | `row` | `rgba(231,139,139,0.08)` |
| primary | `focus` | `rgba(231,139,139,0.20)` |
| primary | `glow` | `rgba(231,139,139,0.25)` |
| primary | `card` | `rgba(231,139,139,0.18)` |

**Shadows** (`tokens.shadow`)
`nav`, `card`, `button`, `dialog`, `sm`, `md` — built from the overlay tokens above.
(`elevation1 → sm`, `elevation3 → md`; Paper `backgroundImage: none`.)

**Gradients** (`tokens.gradient`)
| token | value |
|-------|-------|
| `primary` | `linear-gradient(90deg, #E78B8B, #F2B0B0)` |
| `title` | `linear-gradient(90deg, #FFFFFF, #F2B0B0)` (hero/gradient-title look) |

**Motion** (`tokens.timing`)
`fast 0.12s`, `normal 0.18s`, `slow 0.22s`, `ease cubic-bezier(0.4,0,0.2,1)`.

### Typography (`theme.typography`)
- `fontFamily`: `"Manrope", "system-ui", -apple-system, sans-serif`.
- Fluid headings (`clamp`): `h1 1.6→2.2rem / 800`, `h2 1.25→1.6rem / 700`,
  `h3 1→1.25rem / 700`. Static: `h4 1.1rem`, `h5 1rem`, `h6 0.95rem` (600–700).
- `body1 0.9rem / 1.6`, `body2 0.825rem / 1.5`, `caption 0.75rem`.
- `button`: `textTransform: none`, weight 500.
- ⚠️ Body is < 16px — see §5 note about mobile inputs.

### Shape & spacing
- `shape.borderRadius: 10`; component radii: Button 8, Card/Alert 12, Dialog 16,
  Menu/Autocomplete 10, Chip 20, Drawer paper `0 16px 16px 0`.
- `spacing: 8` (8px base unit).

### Key component overrides (`theme.components`)
- **Button:** min-height 44 (sm 40, lg 46), no elevation, lift on hover only via
  `@media (hover: hover)`, contained gets `shadow.button` on hover.
- **IconButton:** min 44×44, scale 1.08 on hover (hover devices only).
- **Card:** 12px radius, 1px divider border, border→`primary.light` on hover.
- **TextField/Autocomplete:** `size="small"` default, 8–10px radius, focus ring
  `0 0 0 3px overlay.primary.focus`, hover border `primary.light`.
- **Container:** responsive padding (16px, 24px ≥md; 24px top/bottom).
- **AppBar/Menu:** flat, 1px `overlay.dark.border`, `shadow.nav` on menus.
- **DataGrid:** 12px radius, header bg `overlay.dark.header`, row hover
  `overlay.primary.row` + pointer, no cell focus outline.
- **Alert:** outlined default, 12px radius, blurred paper bg, per-severity border colors.
- **ListItemButton:** 8px radius, indents 4px on hover.

### Reusable `sx` presets (`@/theme/utils`)
| export | use for |
|--------|---------|
| `responsiveDataGridContainer` | DataGrid wrapper sizing (`100dvh`-aware height, minHeight 400) |
| `gradientTitle` | white→accent gradient heading (fluid 2→3.15rem) |
| `responsiveCardHover` | card hover lift + accent top-bar (disabled on `xs`) |
| `responsiveTextTruncate` | ellipsis with responsive max-width |
| `navButton` | compact nav button styling |
| `SpacedToggleButtonGroup` | `styled` ToggleButtonGroup with gap + rounded segments |
