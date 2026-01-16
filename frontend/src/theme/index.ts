import { createTheme, Theme, ThemeOptions } from "@mui/material/styles";
import { enUS } from "@mui/x-date-pickers/locales";

const colors = {
    primary: "#2E7D32",
    secondary: "#A1887F",
    light: "#FAFAFA",
} as const;

export const createAppTheme = (): Theme => {
    const baseThemeOptions: ThemeOptions = {
        palette: {
            primary: {
                main: colors.primary,
            },
            secondary: {
                main: colors.secondary,
            },
            background: {
                default: colors.light,
                paper: "#ffffff",
            },
        },
        typography: {
            h1: {
                fontSize: "clamp(2rem, 5vw, 3rem)",
            },
            h2: {
                fontSize: "clamp(1.5rem, 3.5vw, 2.125rem)",
            },
            h3: {
                fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
            },
            h4: {
                fontSize: "1.5rem",
            },
            h5: {
                fontSize: "1.25rem",
            },
            h6: {
                fontSize: "1.1rem",
            },

            button: {
                textTransform: "none", // More modern, readable buttons
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

    return createTheme({ ...baseThemeOptions, colorSchemes: { dark: true } }, enUS);
};
