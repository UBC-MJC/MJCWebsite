/**
 * Design tokens — single source of truth for all raw values.
 * Never reference these hex/rgba strings directly in component files;
 * import a token instead so changes propagate everywhere automatically.
 *
 * ACCENT VARIANTS — the brand accent is a *named variant* (`red` | `blue`),
 * not a frozen constant. Every accent-derived value (the primary ramp, icon
 * badges, overlay tints, accent gradient, and both per-scheme accent ramps +
 * gradient titles) is produced from an `AccentDefinition` via `buildAccentTokens`
 * / `buildSchemeTokens`. The default is `red`, whose values are pixel-identical
 * to the historical hardcoded ones. The active accent is chosen at runtime (see
 * theme/AccentContext) and rebuilds the MUI theme; components that must follow
 * the switch read the accent through `theme.vars.palette.*` /
 * `var(--mui-palette-*)` rather than importing the static red bundle below.
 *
 * Scheme-aware neutrals (surfaces / overlays / glass / gradients / shadows)
 * live in `buildSchemeTokens` further down and flip per color scheme via CSS
 * variables. Accent and color scheme are orthogonal.
 */

export type AccentKey = "red" | "blue" | "green";

interface AccentDefinition {
    /**
     * Frozen pastel ramp — used verbatim as the dark-scheme accent, and as the
     * source for icon badges, overlay tints, and the accent gradient.
     */
    pastel: { main: string; light: string; dark: string };
    /** RGB channels of `pastel.main`, for building translucent accent tints. */
    mainRgb: string;
    /**
     * Deeper, contrast-safe ramp for the light scheme — clears ~4.5:1 on white
     * where the pastel ramp is too light to read.
     */
    light: { main: string; light: string; dark: string };
    /** Start color of the light-scheme gradient title (paired with `pastel.light`). */
    lightTitleStart: string;
}

/**
 * The two accent variants. `blue` is `red` hue-rotated 0°→220° (a true azure)
 * with lightness/saturation held constant, so it reads as the same pastel/depth
 * just in blue. Blues are perceptually darker than reds at equal HSL lightness,
 * so the light-scheme blue ramp clears 4.5:1 on white with margin.
 */
export const accents: Record<AccentKey, AccentDefinition> = {
    red: {
        pastel: { main: "#E78B8B", light: "#F2B0B0", dark: "#C56A6A" },
        mainRgb: "231,139,139",
        light: { main: "#AE424A", light: "#C1585F", dark: "#8A2F37" },
        lightTitleStart: "#cf5252",
    },
    blue: {
        pastel: { main: "#8BA9E7", light: "#B0C6F2", dark: "#6A88C5" },
        mainRgb: "139,169,231",
        light: { main: "#4266AE", light: "#587BC1", dark: "#2F4D8A" },
        lightTitleStart: "#527CCF",
    },
    green: {
        pastel: { main: "#8BE7B6", light: "#B0F2CF", dark: "#6AC594" },
        mainRgb: "139,231,182",
        light: { main: "#1D7546", light: "#228A53", dark: "#165A36" },
        lightTitleStart: "#238D54",
    },
};

/** Accent-derived token bundle (primary ramp, icon badges, overlays, gradient). */
export interface AccentTokens {
    primary: { main: string; light: string; dark: string };
    icon: { badgeLight: string; badgeDark: string };
    overlayAccent: { row: string; focus: string; glow: string; card: string };
    gradientAccent: { primary: string };
}

export const buildAccentTokens = (key: AccentKey): AccentTokens => {
    const a = accents[key];
    return {
        // Pastel accent ramp (frozen per variant).
        primary: { ...a.pastel },
        icon: {
            // Light pastel — used for the animated accent bar / nav underline.
            badgeLight: a.pastel.light,
            badgeDark: `rgba(${a.mainRgb},0.15)`,
        },
        // Pastel-tinted accent overlays — translucent so they read on either a
        // dark or a light surface (intentionally scheme-independent).
        overlayAccent: {
            row: `rgba(${a.mainRgb},0.08)`,
            focus: `rgba(${a.mainRgb},0.20)`,
            glow: `rgba(${a.mainRgb},0.25)`,
            card: `rgba(${a.mainRgb},0.18)`,
        },
        // Accent gradient (white-free) — same in both schemes.
        gradientAccent: {
            primary: `linear-gradient(90deg, ${a.pastel.main}, ${a.pastel.light})`,
        },
    };
};

/** Frozen finishing-position medal colors — never accent-dependent. */
const medal = {
    gold: { text: "#E6C65C", bg: "rgba(212,175,55,0.14)" },
    silver: { text: "#C7C7C7", bg: "rgba(199,199,199,0.12)" },
    bronze: { text: "#C58A4B", bg: "rgba(197,138,75,0.14)" },
} as const;

/** Default (red) accent bundle. */
const redTokens = buildAccentTokens("red");

/**
 * Static default (red) accent exports, kept for components that read these at
 * import time AND don't need to follow a runtime accent switch (e.g. the medal
 * palette). Anything that should follow the switch reads the accent through the
 * theme (`theme.vars.palette.*` / `var(--mui-palette-*)`) instead.
 */
export const palette = {
    primary: redTokens.primary,
    medal,
    icon: redTokens.icon,
} as const;

export const overlayAccent = redTokens.overlayAccent;
export const gradientAccent = redTokens.gradientAccent;

/** Dark ink for text/icons sitting on bright accent fills (gradient chips, placement bars). */
export const onAccent = {
    strong: "rgba(0,0,0,0.85)",
    muted: "rgba(0,0,0,0.75)",
} as const;

/**
 * Finishing-position colors (1st–4th). Single source of truth shared by the
 * placement history chart, the placement stat cards, and the distribution bar.
 * 1st–3rd reuse the (frozen) medal palette; 4th is a dark grayish copper that
 * stays legible on both light and dark surfaces.
 */
export const placement = {
    1: palette.medal.gold.text,
    2: palette.medal.silver.text,
    3: palette.medal.bronze.text,
    4: "#3c2823",
} as const;

export const timing = {
    fast: "0.12s",
    normal: "0.18s",
    slow: "0.22s",
    ease: "cubic-bezier(0.4,0,0.2,1)",
} as const;

/** Shape of one scheme's neutral token set. */
export interface SchemeTokens {
    /**
     * Scheme-appropriate rendering of the brand accent for the MUI `primary`
     * (and `info`) palette. Dark mode uses the variant's pastel ramp verbatim;
     * light mode uses a deeper ramp so accent text/buttons stay readable on
     * white. This only governs how the accent is *toned per scheme* for contrast.
     */
    accent: { main: string; light: string; dark: string; contrastText: string };
    surface: { background: string; paper: string };
    /** Neutral on-surface separators/overlays (scheme-appropriate contrast). */
    overlay: {
        header: string;
        hover: string;
        border: string;
        shadow: string;
        overlay: string;
    };
    /**
     * Translucent "glass" system for the sticky AppBar and its controls
     * (blurred bar + frosted buttons). Dark mode layers light-on-dark; light
     * mode layers dark-on-light so the same elements stay visible.
     */
    glass: {
        bar: string;
        border: string;
        borderHover: string;
        fillSubtle: string;
        fill: string;
        cta: string;
        iconHover: string;
        fillStrong: string;
        skeleton: string;
    };
    /** White/near-black-built gradients, adapted per scheme (accent stays per-variant). */
    gradient: {
        title: string;
        hero: string;
        heroScrim: string;
        /** Bottom-fixed game Footer: transparent → solid surface (top→bottom). */
        footerFade: string;
    };
    shadow: {
        nav: string;
        card: string;
        button: string;
        dialog: string;
        sm: string;
        md: string;
    };
}

const darkOverlay: SchemeTokens["overlay"] = {
    // Separators/surfaces on the dark theme are light-on-dark so they stay visible.
    header: "rgba(255,255,255,0.03)",
    hover: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.12)",
    shadow: "rgba(0,0,0,0.5)",
    overlay: "rgba(0,0,0,0.6)",
};

const lightOverlay: SchemeTokens["overlay"] = {
    // Light-on-light counterparts: dark-tinted so separators/hover/shadows
    // stay clearly visible against a near-white surface. Kept deliberately
    // stronger than a naive 0.05/0.12 set, which washes out on white.
    header: "rgba(0,0,0,0.05)",
    hover: "rgba(0,0,0,0.08)",
    border: "rgba(0,0,0,0.22)",
    shadow: "rgba(0,0,0,0.22)",
    overlay: "rgba(0,0,0,0.5)",
};

/**
 * Build the per-scheme neutral token sets for a given accent. Only the
 * accent-derived values (per-scheme `accent` ramp, `gradient.title`, and the
 * accent-tinted card/button shadows) depend on the accent; every neutral
 * surface/overlay/glass/hero token is identical across variants.
 */
export const buildSchemeTokens = (key: AccentKey): { light: SchemeTokens; dark: SchemeTokens } => {
    const a = accents[key];
    const t = buildAccentTokens(key);

    const buildShadow = (o: SchemeTokens["overlay"]): SchemeTokens["shadow"] => ({
        nav: `0 8px 24px ${o.shadow}`,
        card: `0 8px 24px ${t.overlayAccent.card}`,
        button: `0 4px 12px ${t.overlayAccent.glow}`,
        dialog: `0 24px 48px ${o.overlay}`,
        sm: `0 1px 3px ${o.border}, 0 1px 2px ${o.hover}`,
        md: `0 4px 16px ${o.border}, 0 2px 4px ${o.hover}`,
    });

    return {
        dark: {
            // Pastel accent verbatim for the dark scheme.
            accent: {
                main: a.pastel.main,
                light: a.pastel.light,
                dark: a.pastel.dark,
                contrastText: "#0B0B0C",
            },
            surface: { background: "#0B0B0C", paper: "#161617" },
            overlay: darkOverlay,
            glass: {
                bar: "rgba(0,0,0,0.65)", // blurred translucent AppBar background
                border: "rgba(255,255,255,0.3)", // frosted control border (resting)
                borderHover: "rgba(255,255,255,0.5)", // frosted control border (hover)
                fillSubtle: "rgba(255,255,255,0.14)", // nav-link hover background
                fill: "rgba(255,255,255,0.18)", // control fill (logo tile / button hover)
                cta: "rgba(255,255,255,0.2)", // login CTA resting fill
                iconHover: "rgba(255,255,255,0.28)", // logo tile hover fill
                fillStrong: "rgba(255,255,255,0.32)", // login CTA hover fill
                skeleton: "rgba(255,255,255,0.12)", // skeleton placeholder on the bar
            },
            gradient: {
                // White → accent; the hero "gradient title" look, reused for accents elsewhere.
                title: `linear-gradient(90deg, #FFFFFF, ${a.pastel.light})`,
                // Home hero: warm-tinted dark diagonal base.
                hero: "linear-gradient(135deg, #1A1416 0%, #161617 45%, #0B0B0C 100%)",
                // Home hero: left-anchored horizontal scrim carrying the copy (must stay
                // left-anchored at every width — see DESIGN.md §6/§13).
                heroScrim:
                    "linear-gradient(90deg, rgba(16,16,17,0.97) 0%, rgba(18,18,19,0.88) 40%, rgba(22,22,23,0.45) 70%, rgba(22,22,23,0) 95%)",
                // Game Footer fades to the near-black paper surface (#161617).
                footerFade:
                    "linear-gradient(to bottom, rgba(22,22,23,0) 0%, rgba(22,22,23,0.6) 25%, rgba(22,22,23,1) 50%)",
            },
            shadow: buildShadow(darkOverlay),
        },
        light: {
            // Deeper ramp so accent text/buttons clear ~4.5:1 on white, where
            // the pastel ramp is too light to read.
            accent: {
                main: a.light.main, // links, contained-button bg (white text), accents
                light: a.light.light, // accent foreground text/icons on light surfaces
                dark: a.light.dark, // hover/emphasis
                contrastText: "#FFFFFF",
            },
            // Slightly deeper warm page background so white cards/paper read as
            // distinct raised surfaces against it.
            surface: { background: "#EFEBE6", paper: "#FFFFFF" },
            overlay: lightOverlay,
            glass: {
                bar: "rgba(249,247,245,0.9)", // mostly-opaque frosted AppBar so text stays legible
                border: "rgba(0,0,0,0.22)", // frosted control border (resting)
                borderHover: "rgba(0,0,0,0.38)", // frosted control border (hover)
                fillSubtle: "rgba(0,0,0,0.06)", // nav-link hover background
                fill: "rgba(0,0,0,0.09)", // control fill (logo tile / button hover)
                cta: "rgba(0,0,0,0.06)", // login CTA resting fill
                iconHover: "rgba(0,0,0,0.14)", // logo tile hover fill
                fillStrong: "rgba(0,0,0,0.16)", // login CTA hover fill
                skeleton: "rgba(0,0,0,0.1)", // skeleton placeholder on the bar
            },
            gradient: {
                // Near-black/deep-accent → accent so the "gradient title" reads on a light surface.
                title: `linear-gradient(90deg, ${a.lightTitleStart}, ${a.pastel.light})`,
                // Home hero: warm-tinted light diagonal base.
                hero: "linear-gradient(135deg, #FBEDED 0%, #F6F4F2 45%, #EFEAE6 100%)",
                // Home hero: left-anchored horizontal scrim, light-on-light variant.
                heroScrim:
                    "linear-gradient(90deg, rgba(250,247,245,0.97) 0%, rgba(248,245,243,0.88) 40%, rgba(246,244,242,0.45) 70%, rgba(246,244,242,0) 95%)",
                // Game Footer fades to the white paper surface (#FFFFFF).
                footerFade:
                    "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 25%, rgba(255,255,255,1) 50%)",
            },
            shadow: buildShadow(lightOverlay),
        },
    };
};
