import { SxProps, Theme, styled, alpha } from "@mui/material/styles";
import ToggleButtonGroup, { toggleButtonGroupClasses } from "@mui/material/ToggleButtonGroup";
import { palette, shadow, timing } from "@/theme/tokens";

export const responsiveDataGridContainer: SxProps<Theme> = {
    height: { xs: "calc(100vh - 320px)", md: 580 },
    width: "100%",
    minHeight: 400,
};

/**
 * Text preset — the bold, fluid white→accent gradient title used for the
 * hero heading ("UBC Mahjong Club"). Layout spacing (e.g. `mb`) is intentionally
 * left out so it can be reused anywhere; spread it and add margins as needed:
 *   <Typography variant="h1" sx={{ ...gradientTitle, mb: 2.5 }}>…</Typography>
 */
export const gradientTitle: SxProps<Theme> = {
    fontWeight: 800,
    fontSize: { xs: "2rem", sm: "2.6rem", md: "3.15rem" },
    lineHeight: 1.15,
    pb: "0.08em",
    letterSpacing: "-0.02em",
    background: `linear-gradient(90deg, #FFFFFF, ${palette.primary.light})`,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
};

export const responsiveCardHover: SxProps<Theme> = {
    position: "relative",
    overflow: "hidden",
    transition: `all ${timing.slow} ${timing.ease}`,
    "&::after": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "2px",
        background: `linear-gradient(90deg, ${palette.icon.badgeLight}, ${alpha(palette.icon.badgeLight, 0)})`,
        transform: "scaleX(0)",
        transformOrigin: "left",
        transition: `transform 0.25s ${timing.ease}`,
    },
    "&:hover": {
        transform: { xs: "none", sm: "translateY(-3px)" },
        boxShadow: { xs: "none", sm: shadow.card },
        borderColor: "primary.light",
        "&::after": { transform: "scaleX(1)" },
    },
};

export const responsiveTextTruncate: SxProps<Theme> = {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: { xs: "200px", sm: "300px", md: "100%" },
};

export const navButton: SxProps<Theme> = {
    minWidth: "auto",
    minHeight: "auto",
    padding: "5px 10px",
    borderRadius: 1.5,
    fontSize: "0.875rem",
    fontWeight: 500,
    whiteSpace: "nowrap",
    color: "inherit",
    transition: "background 0.12s, color 0.12s",
    "&:hover": {
        background: "rgba(255,255,255,0.15)",
        transform: "none",
    },
};

export const SpacedToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    gap: "0.5rem",
    [`& .${toggleButtonGroupClasses.firstButton}, & .${toggleButtonGroupClasses.middleButton}`]: {
        borderTopRightRadius: (theme.vars || theme).shape.borderRadius,
        borderBottomRightRadius: (theme.vars || theme).shape.borderRadius,
    },
    [`& .${toggleButtonGroupClasses.lastButton}, & .${toggleButtonGroupClasses.middleButton}`]: {
        borderTopLeftRadius: (theme.vars || theme).shape.borderRadius,
        borderBottomLeftRadius: (theme.vars || theme).shape.borderRadius,
        borderLeft: `1px solid ${(theme.vars || theme).palette.divider}`,
    },
}));