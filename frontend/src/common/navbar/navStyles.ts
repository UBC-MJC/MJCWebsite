import { Fade, alpha, type MenuProps } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { keyframes } from "@mui/system";
import { timing } from "@/theme/tokens";

// ─── Animations ────────────────────────────────────────────────────────────

// Curtain reveal — unrolls a dropdown from top to bottom.
export const openDown = keyframes`
    from { opacity: 0; clip-path: inset(0 0 100% 0); }
    to   { opacity: 1; clip-path: inset(0 0 0% 0);   }
`;

export const EASE = timing.ease;

/**
 * Hover nudge shared by every nav button — a small rightward slide that
 * mirrors the drawer's text animation (theme ListItemButton padding-left),
 * done with translateX so horizontal buttons don't reflow their neighbors.
 */
export const HOVER_TRANSFORM = "translateX(4px)";

/** Spreadable base for any interactive nav button (origin + easing). */
export const interactiveSx: SxProps<Theme> = {
    transformOrigin: "left center",
    transition: `all ${timing.normal} ${EASE}`,
};

/**
 * Frosted top-bar control shared by the Record button and the user-menu
 * button — a translucent bordered pill. The matching hover effect lives in
 * `frostedButtonHover` so callers can extend it (e.g. the Record dot).
 */
export const frostedButtonBase: SxProps<Theme> = {
    ...interactiveSx,
    px: 1.75,
    py: 0.9,
    fontSize: "0.95rem",
    fontWeight: 600,
    borderRadius: 2,
    border: `1px solid var(--mui-palette-glass-border)`,
};

/** Shared hover for frosted controls — fills and nudges right. */
export const frostedButtonHover = {
    background: "var(--mui-palette-glass-fill)",
    transform: HOVER_TRANSFORM,
    borderColor: "var(--mui-palette-glass-borderHover)",
};

// ─── Shared styles ───────────────────────────────────────────────────────────

/** Top-level nav button with an animated underline indicator. */
export const navBtnSx = (active: boolean): SxProps<Theme> => ({
    ...interactiveSx,
    position: "relative",
    minWidth: "auto",
    px: 1.75,
    py: 1,
    mx: 0.25,
    fontSize: "0.95rem",
    fontWeight: active ? 700 : 500,
    color: "inherit",
    borderRadius: 2,
    whiteSpace: "nowrap",
    "&::after": {
        content: '""',
        position: "absolute",
        left: 14,
        right: 14,
        bottom: 6,
        height: "2px",
        borderRadius: "2px",
        // Scheme-aware accent (pastel red in dark, deeper rose in light).
        backgroundColor: "var(--mui-palette-primary-light)",
        opacity: 0.85,
        transform: active ? "scaleX(1)" : "scaleX(0)",
        transformOrigin: "left center",
        transition: `transform 0.25s ${EASE}`,
    },
    "@media (hover: hover)": {
        "&:hover": {
            background: "var(--mui-palette-glass-fillSubtle)",
            transform: HOVER_TRANSFORM,
            "&::after": { transform: "scaleX(1)" },
        },
    },
});

/** Shared props for every dropdown menu — slides/grows out smoothly. */
export const menuTransition = (origin: "left" | "right"): Partial<MenuProps> => ({
    anchorOrigin: { vertical: "bottom", horizontal: origin },
    transformOrigin: { vertical: "top", horizontal: origin },
    TransitionComponent: Fade,
    transitionDuration: 260,
    slotProps: {
        paper: {
            sx: {
                mt: 1,
                overflow: "hidden",
                transformOrigin: "top center",
                boxShadow: "var(--mui-palette-appShadow-nav)",
                animation: `${openDown} 0.26s ${EASE}`,
                "& .MuiMenuItem-root": {
                    transition: `background ${timing.fast}, padding-left 0.18s ${EASE}`,
                    "&:hover": { pl: 2.4 },
                },
            },
        },
    },
});

export const chevronSx = (open: boolean): SxProps<Theme> => ({
    fontSize: "1.05rem !important",
    transition: `transform 0.25s ${EASE}`,
    transform: open ? "rotate(180deg)" : "rotate(0deg)",
});

/**
 * Row styling shared by every drawer destination. Active rows read with the
 * pastel-red accent on three channels at once — tinted fill, a left accent bar,
 * and bolder weight — so the current location is never signalled by color alone.
 */
export const drawerItemSx = (active: boolean, danger = false): SxProps<Theme> => ({
    position: "relative",
    minHeight: 48,
    borderRadius: 2,
    pl: 2,
    pr: 1.25,
    my: 0.25,
    color: danger ? "error.main" : active ? "primary.light" : "text.primary",
    ...(active && { bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.12) }),
    "& .MuiListItemIcon-root": { color: "inherit", minWidth: 40 },
    "& .MuiListItemText-primary": { fontSize: "0.95rem", fontWeight: active ? 700 : 500 },
    "&::before": {
        content: '""',
        position: "absolute",
        left: 4,
        top: "50%",
        height: 22,
        width: 3,
        borderRadius: 3,
        bgcolor: "primary.main",
        transform: `translateY(-50%) scaleX(${active ? 1 : 0})`,
        transformOrigin: "left center",
        transition: `transform ${timing.normal} ${EASE}`,
        "@media (prefers-reduced-motion: reduce)": { transition: "none" },
    },
});
