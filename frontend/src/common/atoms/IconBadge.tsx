import { Box, type SxProps, type Theme } from "@mui/material";

interface IconBadgeProps {
    children: React.ReactNode;
    /** Size of the badge square in pixels. Defaults to 36. */
    size?: number;
    /** Override sx on the outer Box. */
    sx?: SxProps<Theme>;
}

/**
 * Atom — a themed square container for a single icon (dark theme).
 */
const IconBadge = ({ children, size = 36, sx }: IconBadgeProps) => (
    <Box
        sx={{
            width: size,
            height: size,
            borderRadius: 2,
            bgcolor: "var(--mui-palette-accentTint-badgeDark)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "primary.main",
            flexShrink: 0,
            ...sx,
        }}
    >
        {children}
    </Box>
);

export default IconBadge;
