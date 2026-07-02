import { createTheme, Theme, ThemeOptions, PaletteOptions } from "@mui/material/styles";
import { enUS } from "@mui/x-date-pickers/locales";
import {
    AccentKey,
    AccentTokens,
    buildAccentTokens,
    buildSchemeTokens,
    SchemeTokens,
    timing,
} from "@/theme/tokens";

/**
 * Accent tint tokens exposed as CSS variables so components that aren't covered
 * by the MUI `primary` palette (faint badge/row tints) still follow a runtime
 * accent switch via `var(--mui-palette-accentTint-*)`.
 */
interface AccentTint {
    row: string;
    focus: string;
    glow: string;
    card: string;
    badgeLight: string;
    badgeDark: string;
}

/**
 * Custom, scheme-aware palette tokens. Registering them under each scheme's
 * `palette` lets MUI emit `--mui-palette-*` CSS variables that flip between
 * light and dark automatically. Components read them via `theme.vars.palette.*`
 * (callbacks/styled) or `var(--mui-palette-*)` (static sx objects).
 */
declare module "@mui/material/styles" {
    interface Palette {
        glass: SchemeTokens["glass"];
        gradient: SchemeTokens["gradient"] & { primary: string };
        overlayN: SchemeTokens["overlay"];
        appShadow: SchemeTokens["shadow"];
        accentTint: AccentTint;
    }
    interface PaletteOptions {
        glass?: SchemeTokens["glass"];
        gradient?: SchemeTokens["gradient"] & { primary: string };
        overlayN?: SchemeTokens["overlay"];
        appShadow?: SchemeTokens["shadow"];
        accentTint?: AccentTint;
    }
}

const schemePalette = (
    scheme: "light" | "dark",
    schemes: { light: SchemeTokens; dark: SchemeTokens },
    accentTokens: AccentTokens,
): PaletteOptions => {
    const s = schemes[scheme];
    return {
        mode: scheme,
        // Accent is toned per scheme (pastel in dark, deeper ramp in light)
        // so it stays readable on each background; see schemeTokens[*].accent.
        primary: { ...s.accent },
        // Info reuses the accent so info alerts/icons match the theme.
        info: { ...s.accent },
        background: {
            default: s.surface.background,
            paper:   s.surface.paper,
        },
        divider: s.overlay.border,
        glass: s.glass,
        gradient: { primary: accentTokens.gradientAccent.primary, ...s.gradient },
        overlayN: s.overlay,
        appShadow: s.shadow,
        accentTint: {
            ...accentTokens.overlayAccent,
            badgeLight: accentTokens.icon.badgeLight,
            badgeDark:  accentTokens.icon.badgeDark,
        },
    };
};

export const createAppTheme = (accent: AccentKey): Theme => {
    const schemes = buildSchemeTokens(accent);
    const accentTokens = buildAccentTokens(accent);
    const { overlayAccent } = accentTokens;
    const baseThemeOptions: ThemeOptions = {
        // CSS variables let both schemes coexist; the manual toggle flips the
        // `data-mui-color-scheme` attribute on <html> with no re-render flash.
        cssVariables: { colorSchemeSelector: "data" },
        colorSchemes: {
            light: { palette: schemePalette("light", schemes, accentTokens) },
            dark:  { palette: schemePalette("dark", schemes, accentTokens) },
        },
        typography: {
            fontFamily: '"Manrope", "system-ui", -apple-system, sans-serif',
            h1: { fontSize: "clamp(1.6rem, 4vw, 2.2rem)",   fontWeight: 800, letterSpacing: "-0.02em"  },
            h2: { fontSize: "clamp(1.25rem, 3vw, 1.6rem)",  fontWeight: 700, letterSpacing: "-0.015em" },
            h3: { fontSize: "clamp(1rem, 2.5vw, 1.25rem)",  fontWeight: 700, letterSpacing: "-0.01em"  },
            h4: { fontSize: "1.1rem",  fontWeight: 700 },
            h5: { fontSize: "1rem",    fontWeight: 700 },
            h6: { fontSize: "0.95rem", fontWeight: 600 },
            body1:   { fontSize: "0.9rem",   lineHeight: 1.6 },
            body2:   { fontSize: "0.825rem", lineHeight: 1.5 },
            caption: { fontSize: "0.75rem" },
            button:  { textTransform: "none", fontWeight: 500 },
        },
        shape: { borderRadius: 10 },
        components: {
            MuiButton: {
                defaultProps: { disableElevation: true },
                styleOverrides: {
                    root: {
                        minHeight: 44,
                        padding: "8px 18px",
                        borderRadius: 8,
                        fontWeight: 500,
                        transition: `all ${timing.normal} ${timing.ease}`,
                        // Only lift on real hover devices; on touch a :hover transform
                        // latches after a tap until the next interaction.
                        "@media (hover: hover)": {
                            "&:hover": { transform: "translateY(-1px)" },
                        },
                        "&:active": { transform: "translateY(0)" },
                    },
                    contained: ({ theme }) => ({
                        boxShadow: "none",
                        "&:hover": { boxShadow: theme.vars.palette.appShadow.button },
                    }),
                    sizeSmall: { minHeight: 40, padding: "5px 12px", fontSize: "0.8rem" },
                    sizeLarge: { minHeight: 46, padding: "12px 24px" },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        borderRadius: 12,
                        border: "1px solid",
                        borderColor: theme.vars.palette.divider,
                        boxShadow: "none",
                        transition: `border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease`,
                        "&:hover": { borderColor: theme.vars.palette.primary.light },
                    }),
                },
            },
            MuiCardActionArea: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        "&:hover .MuiCardActionArea-focusHighlight": { opacity: 0.04 },
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root:       { backgroundImage: "none" },
                    elevation1: ({ theme }) => ({ boxShadow: theme.vars.palette.appShadow.sm }),
                    elevation3: ({ theme }) => ({ boxShadow: theme.vars.palette.appShadow.md }),
                },
            },
            MuiTextField: {
                defaultProps: { size: "small" },
                styleOverrides: {
                    root: ({ theme }) => ({
                        "& .MuiOutlinedInput-root": {
                            borderRadius: 8,
                            transition: `box-shadow ${timing.fast} ease`,
                            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: theme.vars.palette.primary.light },
                            "&.Mui-focused": { boxShadow: `0 0 0 3px ${overlayAccent.focus}` },
                        },
                        // iOS auto-zooms when a focused input's font is < 16px. Keep
                        // the compact 0.9rem on ≥sm, but bump to 16px on phones.
                        "& .MuiInputBase-input": {
                            [theme.breakpoints.down("sm")]: { fontSize: 16 },
                        },
                    }),
                },
            },
            MuiAutocomplete: {
                defaultProps: { size: "small" },
                styleOverrides: {
                    paper:  ({ theme }) => ({ borderRadius: 10, boxShadow: theme.vars.palette.appShadow.nav }),
                    option: { borderRadius: 6, margin: "2px 6px", padding: "6px 8px", fontSize: "0.875rem" },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root:      { borderRadius: 20, fontWeight: 500, fontSize: "0.75rem" },
                    sizeSmall: { height: 22, fontSize: "0.7rem" },
                },
            },
            MuiContainer: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        paddingLeft:  theme.spacing(2),
                        paddingRight: theme.spacing(2),
                        paddingTop:    theme.spacing(3),
                        paddingBottom: theme.spacing(3),
                        [theme.breakpoints.up("md")]: {
                            paddingLeft:  theme.spacing(3),
                            paddingRight: theme.spacing(3),
                        },
                    }),
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        boxShadow: "none",
                        borderBottom: `1px solid ${theme.vars.palette.divider}`,
                    }),
                },
            },
            MuiMenu: {
                styleOverrides: {
                    paper: ({ theme }) => ({
                        borderRadius: 10,
                        boxShadow: theme.vars.palette.appShadow.nav,
                        border: `1px solid ${theme.vars.palette.divider}`,
                    }),
                },
            },
            MuiMenuItem: {
                styleOverrides: {
                    root: {
                        borderRadius: 6,
                        margin: "2px 6px",
                        padding: "7px 10px",
                        fontSize: "0.875rem",
                        minWidth: 160,
                        transition: `background ${timing.fast}`,
                    },
                },
            },
            MuiAlert: {
                defaultProps: { variant: "outlined" },
                styleOverrides: {
                    root: ({ theme }) => ({
                        borderRadius: 12,
                        padding: "10px 16px",
                        fontSize: "0.9rem",
                        alignItems: "center",
                        backgroundColor: theme.vars.palette.background.paper,
                        backdropFilter: "blur(8px)",
                        border: "1px solid",
                        borderColor: theme.vars.palette.divider,
                    }),
                    icon: { opacity: 0.9 },
                    message: { paddingTop: 0, paddingBottom: 0, fontWeight: 500 },
                    standardError:   { borderColor: "rgba(244,67,54,0.4)" },
                    standardSuccess: { borderColor: "rgba(102,187,106,0.4)" },
                    standardWarning: { borderColor: "rgba(255,167,38,0.4)" },
                    standardInfo:    { borderColor: overlayAccent.focus },
                    outlinedInfo:    ({ theme }) => ({ borderColor: overlayAccent.focus, color: theme.vars.palette.primary.light }),
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: ({ theme }) => ({ borderRadius: 16, boxShadow: theme.vars.palette.appShadow.dialog }),
                },
            },
            MuiTooltip: {
                styleOverrides: {
                    tooltip: { borderRadius: 6, fontSize: "0.75rem" },
                },
            },
            MuiDataGrid: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        borderRadius: 12,
                        border: `1px solid ${theme.vars.palette.divider}`,
                        "& .MuiDataGrid-columnHeader": {
                            backgroundColor: theme.vars.palette.overlayN.header,
                            fontWeight: 600,
                        },
                        "& .MuiDataGrid-row": { transition: `background ${timing.fast}` },
                        "& .MuiDataGrid-row:hover": {
                            backgroundColor: overlayAccent.row,
                            cursor: "pointer",
                        },
                        "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
                            outline: "none",
                        },
                    }),
                },
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        // 44px minimum keeps icon buttons within reach as touch targets.
                        minWidth: 44,
                        minHeight: 44,
                        borderRadius: 8,
                        transition: `background ${timing.fast}, transform ${timing.fast}`,
                        "@media (hover: hover)": {
                            "&:hover": { transform: "scale(1.08)" },
                        },
                    },
                },
            },
            MuiPagination: {
                styleOverrides: {
                    root: {
                        "& .MuiPaginationItem-root": {
                            borderRadius: 8,
                            fontWeight: 500,
                            transition: `all ${timing.fast}`,
                        },
                        "& .MuiPaginationItem-root:hover": { transform: "translateY(-1px)" },
                    },
                },
            },
            MuiListItemButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        margin: "1px 6px",
                        transition: `background ${timing.fast}, padding-left 0.15s`,
                        "&:hover": { paddingLeft: "20px" },
                    },
                },
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: { borderRadius: "0 16px 16px 0" },
                },
            },
        },
        spacing: 8,
    };

    return createTheme(baseThemeOptions, enUS);
};
