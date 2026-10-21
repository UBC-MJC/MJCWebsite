import "@fontsource-variable/source-sans-3";
import type {} from "@mui/x-data-grid/themeAugmentation";
import { alpha, createTheme, PaletteOptions, Theme, ThemeOptions } from "@mui/material/styles";
import { enUS } from "@mui/x-date-pickers/locales";

type Placement = 1 | 2 | 3 | 4;

declare module "@mui/material/styles" {
    interface Palette {
        placement: Record<Placement, string>;
    }
    interface PaletteOptions {
        placement?: Record<Placement, string>;
    }
}

// Ink is the one accent: it marks actions, the active page, focus and selection. Hue always carries meaning:
// red and green for losses, gains and errors, gold to bronze for placements (see DESIGN.md).
// `divider` stays translucent like MUI's default: DataGrid (and Table) derive their line colour from it
// by assuming a translucent ink, and an opaque divider makes their lines vanish
const lightPalette: PaletteOptions = {
    primary: { main: "#1b1c1e", dark: "#3a3c41", contrastText: "#ffffff" }, // `dark` is the contained-button hover
    secondary: { main: "#5f6166", contrastText: "#ffffff" },
    error: { main: "#c22826" },
    warning: { main: "#a45e00" },
    info: { main: "#0e6a9b" },
    success: { main: "#137738" },
    text: { primary: "#1b1c1e", secondary: "#5f6166" },
    background: { default: "#fafafa", paper: "#ffffff" },
    divider: "rgba(27, 28, 30, 0.12)",
    placement: { 1: "#946d00", 2: "#808388", 3: "#a25e2b", 4: "#3a3d42" },
};

const darkPalette: PaletteOptions = {
    primary: { main: "#ececee", dark: "#c9cace", contrastText: "#121212" },
    secondary: { main: "#a6a8ae", dark: "#8e9096", contrastText: "#121212" },
    error: { main: "#f97770" },
    warning: { main: "#f9b64f" },
    info: { main: "#81bfeb" },
    success: { main: "#67d283" },
    text: { primary: "#ececee", secondary: "#a6a8ae" },
    background: { default: "#121212", paper: "#1c1c1f" },
    divider: "rgba(236, 236, 238, 0.12)",
    placement: { 1: "#eec651", 2: "#babec4", 3: "#da915f", 4: "#7f8793" },
};

// "Source Sans 3 Fallback" is Arial scaled to Source Sans 3's metrics, so text doesn't reflow when the web font swaps in
const fontFamily = '"Source Sans 3 Variable", "Source Sans 3 Fallback", system-ui, sans-serif';

export const createAppTheme = (): Theme => {
    const baseThemeOptions: ThemeOptions = {
        // Roles: heading (h1 page title, h2 section, h3 subsection; h4–h6 step down to body size),
        // body (body1/body2), label (subtitle, caption, button) and data (tabular figures, set on body below)
        typography: {
            fontFamily,
            h1: {
                fontSize: "clamp(1.75rem, 1.35rem + 1.6vw, 2.25rem)", // 28px phone → 36px desktop
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
                textWrap: "balance",
            },
            h2: {
                fontSize: "clamp(1.5rem, 1.25rem + 1vw, 1.875rem)", // 24px → 30px
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: "-0.005em",
                textWrap: "balance",
            },
            h3: {
                fontSize: "clamp(1.375rem, 1.3rem + 0.4vw, 1.5rem)", // 22px → 24px
                fontWeight: 600,
                lineHeight: 1.25,
                letterSpacing: 0,
                textWrap: "balance",
            },
            h4: {
                fontSize: "1.25rem",
                fontWeight: 600,
                lineHeight: 1.3,
                letterSpacing: 0,
            },
            h5: {
                fontSize: "1.125rem",
                fontWeight: 600,
                lineHeight: 1.35,
                letterSpacing: 0,
            },
            h6: {
                fontSize: "1rem",
                fontWeight: 600,
                lineHeight: 1.4,
                letterSpacing: 0,
            },
            subtitle1: {
                fontWeight: 600,
                lineHeight: 1.5,
            },
            subtitle2: {
                fontWeight: 600,
            },
            body1: {
                lineHeight: 1.5,
                textWrap: "pretty",
            },
            caption: {
                fontSize: "0.8125rem",
                lineHeight: 1.4,
                letterSpacing: "0.01em",
            },
            button: {
                textTransform: "none", // More modern, readable buttons
                fontSize: "0.9375rem",
                fontWeight: 600,
                letterSpacing: "0.01em",
            },
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: (theme) => ({
                    "@font-face": {
                        fontFamily: "Source Sans 3 Fallback",
                        src: 'local("Arial")',
                        sizeAdjust: "92.6%",
                        ascentOverride: "110.2%",
                        descentOverride: "43.2%",
                        lineGapOverride: "0%",
                    },
                    // Scores, Elo and deltas line up in columns and don't shift as values change
                    body: {
                        fontVariantNumeric: "tabular-nums",
                        accentColor: theme.palette.primary.main,
                    },
                    "::selection": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    },
                }),
            },
            // Flat bar on the page surface; the accent marks the active link, not the bar
            MuiAppBar: {
                defaultProps: {
                    elevation: 0,
                },
                styleOverrides: {
                    root: ({ theme }) => ({
                        borderBottom: `1px solid ${theme.palette.divider}`,
                    }),
                },
            },
            // Keyboard focus gets a visible ring in the accent, on every button-like control
            MuiButtonBase: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        "&.Mui-focusVisible": {
                            outline: `2px solid ${theme.palette.primary.main}`,
                            outlineOffset: 2,
                        },
                    }),
                },
            },
            // Ink text needs an underline to read as a link, and a hover-only underline never shows on phones
            MuiLink: {
                styleOverrides: {
                    root: {
                        textUnderlineOffset: "0.15em",
                    },
                    underlineHover: ({ theme }) => ({
                        textDecoration: "underline",
                        textDecorationColor: alpha(theme.palette.text.primary, 0.4),
                        "&:hover": {
                            textDecorationColor: "currentColor",
                        },
                    }),
                },
            },
            // Field outlines reach 3:1 so empty inputs are findable at the table
            MuiOutlinedInput: {
                styleOverrides: {
                    notchedOutline: ({ theme }) => ({
                        borderColor: "#83868b",
                        ...theme.applyStyles("dark", {
                            borderColor: "#707378",
                        }),
                    }),
                },
            },
            // A selected toggle (winner, deal-in, riichi) is filled, so it can't be mistaken for unselected.
            // Unselected ones stay quiet, and the weight doesn't change on selection so labels don't shift
            MuiToggleButton: {
                styleOverrides: {
                    root: ({ theme, ownerState }) => {
                        const color =
                            ownerState.color && ownerState.color !== "standard"
                                ? theme.palette[ownerState.color]
                                : theme.palette.primary;
                        return {
                            fontWeight: 500,
                            color: theme.palette.text.secondary,
                            "&.Mui-selected, &.Mui-selected:hover": {
                                backgroundColor: color.main,
                                color: color.contrastText,
                            },
                            "@media (hover: hover)": {
                                "&.Mui-selected:hover": {
                                    backgroundColor: color.dark,
                                },
                            },
                        };
                    },
                },
            },
            // DataGrid sets the `font` shorthand on its root, which resets the tabular figures inherited from body
            MuiDataGrid: {
                styleOverrides: {
                    root: {
                        fontVariantNumeric: "tabular-nums",
                    },
                },
            },
            // Touch-friendly buttons (minimum 44px height for iOS/Android)
            MuiButton: {
                defaultProps: {
                    disableElevation: true,
                    sx: {
                        minHeight: 44,
                        padding: "10px 20px",
                        minWidth: {
                            xs: "100%",
                            sm: "200px",
                        },
                    },
                },
                styleOverrides: {
                    sizeLarge: {
                        minHeight: 48,
                        padding: "12px 24px",
                    },
                    sizeSmall: {
                        minHeight: 36,
                        padding: "6px 12px",
                    },
                },
            },
            // Default panels (elevation 1: plain Paper, Card) are flat with a hairline edge. Shadows stay
            // for things that float: menus (8), the score footer (8), the drawer (16) and dialogs (24).
            // The edge is an inset outline rather than a border, so it takes no space and layouts don't shift
            MuiPaper: {
                styleOverrides: {
                    root: ({ theme, ownerState }) =>
                        ownerState.variant === "elevation" && ownerState.elevation === 1
                            ? {
                                  boxShadow: "none",
                                  backgroundImage: "none",
                                  outline: `1px solid ${theme.palette.divider}`,
                                  outlineOffset: -1,
                              }
                            : {},
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                    },
                },
            },
            // Container with responsive vertical/horizontal spacing
            MuiContainer: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        paddingLeft: theme.spacing(2),
                        paddingRight: theme.spacing(2),
                        paddingTop: theme.spacing(2),
                        paddingBottom: theme.spacing(2),
                        [theme.breakpoints.up("md")]: {
                            paddingLeft: theme.spacing(3),
                            paddingRight: theme.spacing(3),
                            paddingTop: theme.spacing(3),
                            paddingBottom: theme.spacing(3),
                        },
                    }),
                },
            },

            // IconButton touch targets
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        padding: 12, // Ensures 44px touch target with 20px icon
                    },
                },
            },
        },
        // Responsive spacing scale (8px base unit)
        spacing: 8,
    };

    return createTheme(
        {
            ...baseThemeOptions,
            colorSchemes: { light: { palette: lightPalette }, dark: { palette: darkPalette } },
        },
        enUS,
    );
};
