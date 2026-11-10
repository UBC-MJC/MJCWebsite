import { SxProps, Theme, styled } from "@mui/material/styles";
import ToggleButtonGroup, { toggleButtonGroupClasses } from "@mui/material/ToggleButtonGroup";

/**
 * Responsive DataGrid container with mobile-optimized heights
 * Mobile: viewport-based height
 * Desktop: 600px
 */
export const responsiveDataGridContainer: SxProps<Theme> = {
    height: {
        xs: "calc(100dvh - 350px)", // Mobile: Adapt to available space (dvh excludes the browser bars)
        md: 600,
    },
    width: "100%",
    minHeight: 400, // Ensure usability even on small screens
};

/**
 * Hover affordance for clickable cards: the card's edge darkens, nothing moves.
 * Only on devices that can hover, since a tap would otherwise leave the card stuck in its hover state
 */
export const responsiveCardHover: SxProps<Theme> = {
    transition: "outline-color 150ms ease-out",
    "@media (hover: hover)": {
        "&:hover": {
            outlineColor: (theme) => theme.palette.text.secondary,
        },
    },
    "@media (prefers-reduced-motion: reduce)": {
        transition: "none",
    },
};

/**
 * Responsive text truncation with overflow handling
 */
export const responsiveTextTruncate: SxProps<Theme> = {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: { xs: "200px", sm: "300px", md: "100%" },
};

/**
 * Shared navbar button styling - overrides theme defaults for compact nav buttons
 */
export const navButton: SxProps<Theme> = {
    minWidth: "auto",
    minHeight: "auto",
    padding: "6px 8px",
    borderRadius: 1,
    fontSize: "1rem",
    fontWeight: 500, // Lighter than action buttons, so a row of nav links doesn't read as bold
    whiteSpace: "nowrap",
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
