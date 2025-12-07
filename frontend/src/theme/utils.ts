import { SxProps, Theme, styled } from "@mui/material/styles";
import ToggleButton, { toggleButtonClasses } from '@mui/material/ToggleButton';
import ToggleButtonGroup, {
    toggleButtonGroupClasses,
} from '@mui/material/ToggleButtonGroup';

/**
 * Responsive DataGrid container with mobile-optimized heights
 * Mobile: viewport-based height
 * Desktop: 600px
 */
export const responsiveDataGridContainer: SxProps<Theme> = {
    height: {
        xs: "calc(100vh - 350px)", // Mobile: Adapt to available space
        md: 600,
    },
    width: "100%",
    minHeight: 400, // Ensure usability even on small screens
};

/**
 * Responsive card hover effects
 * Reduced transform on mobile to prevent layout shifts
 */
export const responsiveCardHover: SxProps<Theme> = {
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
        transform: { xs: "none", sm: "translateY(-4px)" },
        boxShadow: { xs: 2, sm: 6 },
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
    whiteSpace: "nowrap",
};

export const SpacedToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    gap: '0.5rem',
    [`& .${toggleButtonGroupClasses.firstButton}, & .${toggleButtonGroupClasses.middleButton}`]:
        {
            borderTopRightRadius: (theme.vars || theme).shape.borderRadius,
            borderBottomRightRadius: (theme.vars || theme).shape.borderRadius,
        },
    [`& .${toggleButtonGroupClasses.lastButton}, & .${toggleButtonGroupClasses.middleButton}`]:
        {
            borderTopLeftRadius: (theme.vars || theme).shape.borderRadius,
            borderBottomLeftRadius: (theme.vars || theme).shape.borderRadius,
            borderLeft: `1px solid ${(theme.vars || theme).palette.divider}`,
        },
}));