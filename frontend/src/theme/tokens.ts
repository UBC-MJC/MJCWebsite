/**
 * Design tokens — single source of truth for all raw values.
 * Never reference these hex/rgba strings directly in component files;
 * import a token instead so changes propagate everywhere automatically.
 */

// Surface colors for the black & gold theme.
export const surface = {
    background: "#0B0B0C",
    paper:      "#161617",
} as const;

export const palette = {
    // Pastel red accent.
    primary: {
        main:  "#E78B8B",
        light: "#F2B0B0",
        dark:  "#C56A6A",
    },
    medal: {
        gold:   { text: "#E6C65C", bg: "rgba(212,175,55,0.14)" },
        silver: { text: "#C7C7C7", bg: "rgba(199,199,199,0.12)" },
        bronze: { text: "#C58A4B", bg: "rgba(197,138,75,0.14)" },
    },
    icon: {
        // Light pastel red — used for the animated accent bar / nav underline.
        badgeLight: "#F2B0B0",
        badgeDark:  "rgba(231,139,139,0.15)",
        surfaceLight: "rgba(255,255,255,0.06)",
    },
} as const;

export const overlay = {
    white: {
        subtle: "rgba(255,255,255,0.15)",
        medium: "rgba(255,255,255,0.18)",
        strong: "rgba(255,255,255,0.3)",
    },
    // Separators/surfaces on the dark theme are light-on-dark so they stay visible.
    dark: {
        header:  "rgba(255,255,255,0.03)",
        hover:   "rgba(255,255,255,0.06)",
        border:  "rgba(255,255,255,0.12)",
        shadow:  "rgba(0,0,0,0.5)",
        overlay: "rgba(0,0,0,0.6)",
    },
    // Pastel-red-tinted accent overlays.
    primary: {
        row:   "rgba(231,139,139,0.08)",
        focus: "rgba(231,139,139,0.20)",
        glow:  "rgba(231,139,139,0.25)",
        card:  "rgba(231,139,139,0.18)",
    },
} as const;

export const shadow = {
    nav:    `0 8px 24px ${overlay.dark.shadow}`,
    card:   `0 8px 24px ${overlay.primary.card}`,
    button: `0 4px 12px ${overlay.primary.glow}`,
    dialog: `0 24px 48px ${overlay.dark.overlay}`,
    sm:     `0 1px 3px ${overlay.dark.border}, 0 1px 2px ${overlay.dark.hover}`,
    md:     `0 4px 16px ${overlay.dark.border}, 0 2px 4px ${overlay.dark.hover}`,
} as const;

export const gradient = {
    primary: `linear-gradient(90deg, ${palette.primary.main}, ${palette.primary.light})`,
} as const;

export const timing = {
    fast:   "0.12s",
    normal: "0.18s",
    slow:   "0.22s",
    ease:   "cubic-bezier(0.4,0,0.2,1)",
} as const;