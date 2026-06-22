import { createTheme, Theme, ThemeOptions } from "@mui/material/styles";
import { enUS } from "@mui/x-date-pickers/locales";
import { palette as t, overlay, shadow, surface, timing } from "@/theme/tokens";

export const createAppTheme = (): Theme => {
    const baseThemeOptions: ThemeOptions = {
        palette: {
            mode: "dark",
            primary: {
                main:  t.primary.main,
                light: t.primary.light,
                dark:  t.primary.dark,
                contrastText: "#0B0B0C",
            },
            // Info reuses the accent so info alerts/icons match the theme (no blue).
            info: {
                main:  t.primary.main,
                light: t.primary.light,
                dark:  t.primary.dark,
                contrastText: "#0B0B0C",
            },
            background: {
                default: surface.background,
                paper:   surface.paper,
            },
            divider: overlay.dark.border,
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
                    contained: {
                        boxShadow: "none",
                        "&:hover": { boxShadow: shadow.button },
                    },
                    sizeSmall: { minHeight: 40, padding: "5px 12px", fontSize: "0.8rem" },
                    sizeLarge: { minHeight: 46, padding: "12px 24px" },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        borderRadius: 12,
                        border: "1px solid",
                        borderColor: theme.palette.divider,
                        boxShadow: "none",
                        transition: `border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease`,
                        "&:hover": { borderColor: theme.palette.primary.light },
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
                    elevation1: { boxShadow: shadow.sm },
                    elevation3: { boxShadow: shadow.md },
                },
            },
            MuiTextField: {
                defaultProps: { size: "small" },
                styleOverrides: {
                    root: {
                        "& .MuiOutlinedInput-root": {
                            borderRadius: 8,
                            transition: `box-shadow ${timing.fast} ease`,
                            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: t.primary.light },
                            "&.Mui-focused": { boxShadow: `0 0 0 3px ${overlay.primary.focus}` },
                        },
                    },
                },
            },
            MuiAutocomplete: {
                defaultProps: { size: "small" },
                styleOverrides: {
                    paper:  { borderRadius: 10, boxShadow: shadow.nav },
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
                    root: {
                        boxShadow: "none",
                        borderBottom: `1px solid ${overlay.dark.border}`,
                    },
                },
            },
            MuiMenu: {
                styleOverrides: {
                    paper: {
                        borderRadius: 10,
                        boxShadow: shadow.nav,
                        border: `1px solid ${overlay.dark.border}`,
                    },
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
                    root: {
                        borderRadius: 12,
                        padding: "10px 16px",
                        fontSize: "0.9rem",
                        alignItems: "center",
                        backgroundColor: surface.paper,
                        backdropFilter: "blur(8px)",
                        border: "1px solid",
                        borderColor: overlay.dark.border,
                    },
                    icon: { opacity: 0.9 },
                    message: { paddingTop: 0, paddingBottom: 0, fontWeight: 500 },
                    standardError:   { borderColor: "rgba(244,67,54,0.4)" },
                    standardSuccess: { borderColor: "rgba(102,187,106,0.4)" },
                    standardWarning: { borderColor: "rgba(255,167,38,0.4)" },
                    standardInfo:    { borderColor: overlay.primary.focus },
                    outlinedInfo:    { borderColor: overlay.primary.focus, color: t.primary.light },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: { borderRadius: 16, boxShadow: shadow.dialog },
                },
            },
            MuiTooltip: {
                styleOverrides: {
                    tooltip: { borderRadius: 6, fontSize: "0.75rem" },
                },
            },
            MuiDataGrid: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        border: `1px solid ${overlay.dark.border}`,
                        "& .MuiDataGrid-columnHeader": {
                            backgroundColor: overlay.dark.header,
                            fontWeight: 600,
                        },
                        "& .MuiDataGrid-row": { transition: `background ${timing.fast}` },
                        "& .MuiDataGrid-row:hover": {
                            backgroundColor: overlay.primary.row,
                            cursor: "pointer",
                        },
                        "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
                            outline: "none",
                        },
                    },
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