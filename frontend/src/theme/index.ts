import "@fontsource-variable/source-sans-3";
import type {} from "@mui/x-data-grid/themeAugmentation";
import { createTheme, Theme, ThemeOptions } from "@mui/material/styles";
import { enUS } from "@mui/x-date-pickers/locales";

const colors = {
    light: "#FAFAFA",
} as const;

// "Source Sans 3 Fallback" is Arial scaled to Source Sans 3's metrics, so text doesn't reflow when the web font swaps in
const fontFamily = '"Source Sans 3 Variable", "Source Sans 3 Fallback", system-ui, sans-serif';

export const createAppTheme = (): Theme => {
    const baseThemeOptions: ThemeOptions = {
        palette: {
            background: {
                default: colors.light,
                paper: "#ffffff",
            },
        },
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
                styleOverrides: {
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
            // Consistent card styling with hover effects
            MuiCard: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        borderRadius: 12,
                        border: "1px solid",
                        borderColor: theme.palette.divider,
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }),
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

    return createTheme({ ...baseThemeOptions, colorSchemes: { dark: true } }, enUS);
};
