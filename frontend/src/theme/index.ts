import { createTheme, Theme, ThemeOptions } from "@mui/material/styles";
import { enUS } from "@mui/x-date-pickers/locales";

const colors = {
    primary: "#2E7D32",
    secondary: "#A1887F",
    tertiary: "#C0E6C3",
    danger: "#C62828",
    warning: "#ED6C02",
    success: "#2E7D32",
    info: "#0277BD",
    light: "#FAFAFA",
} as const;

export const createAppTheme = (mode: "light" | "dark"): Theme => {
    const baseThemeOptions: ThemeOptions = {
        palette: {
            mode,
            primary: {
                main: colors.primary,
            },
            secondary: {
                main: colors.secondary,
            },
            info: {
                main: colors.info,
            },
            error: {
                main: colors.danger,
            },
            warning: {
                main: colors.warning,
            },
            success: {
                main: colors.success,
            },
            background:
                mode === "dark"
                    ? {
                          default: "#121212",
                          paper: "#1e1e1e",
                      }
                    : {
                          default: "#fafafa",
                          paper: "#ffffff",
                      },
        },
        typography: {
            fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
            // Responsive typography - scales down on mobile
            h1: {
                fontFamily: `"Merriweather", serif`,
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: 650,
            },
            h2: {
                fontFamily: `"Merriweather", serif`,
                fontSize: "clamp(1.5rem, 3.5vw, 2.125rem)",
                fontWeight: 600,
            },
            h3: {
                fontFamily: `"Merriweather", serif`,
                fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
                fontWeight: 600,
            },
            h4: {
                fontFamily: `"Merriweather", serif`,
                fontWeight: 600,
                fontSize: "1.5rem",
            },
            h5: {
                fontFamily: `"Merriweather", serif`,
                fontWeight: 500,
                fontSize: "1.25rem",
            },
            h6: {
                fontFamily: `"Merriweather", serif`,
                fontWeight: 500,
                fontSize: "1.1rem",
            },
            subtitle1: {
                fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
                fontWeight: 600,
                lineHeight: 1.4,
            },
            body1: {
                fontFamily: `"Inter", sans-serif`,
                fontSize: "1rem",
                fontWeight: 400,
            },
            body2: {
                fontFamily: `"Inter", sans-serif`,
                fontSize: "0.875rem",
                fontWeight: 400,
            },
            button: {
                fontFamily: `"Inter", sans-serif`,
                textTransform: "none", // More modern, readable buttons
                fontWeight: 500,
            },
        },
        components: {
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
            MuiLink: {
                styleOverrides: {
                    root: {
                        color: "inherit",
                        textDecoration: "none",
                    },
                },
            },
            // Global styles for anchor tags
            MuiCssBaseline: {
                styleOverrides: {
                    a: {
                        textDecoration: "none",
                    },
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
            // Chip styling for status indicators
            MuiChip: {
                styleOverrides: {
                    root: {
                        fontWeight: 500,
                    },
                },
            },
            // Typography spacing - responsive margins for all heading variants
            MuiTypography: {
                styleOverrides: {
                    subtitle1: ({ theme }) => ({
                        marginBottom: theme.spacing(1),
                        [theme.breakpoints.up("md")]: {
                            marginBottom: theme.spacing(1.5),
                        },
                    }),
                },
            },
            MuiStack: {
                defaultProps: {
                    spacing: {
                        xs: 2,
                        sm: 3,
                    },
                },
            },
            // ListItemText styling - ensure text color is consistent in drawers/menus
            MuiListItemText: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        color: theme.palette.text.primary,
                    }),
                },
            },
        },
        // Responsive spacing scale (8px base unit)
        spacing: 8,
    };

    return createTheme(baseThemeOptions, enUS);
};
