import { Box, type SxProps, type Theme } from "@mui/material";
import { palette } from "@/theme/tokens";

interface IconBadgeProps {
    children: React.ReactNode;
    /** Size of the badge square in pixels. Defaults to 36. */
    size?: number;
    /** Override sx on the outer Box. */
    sx?: SxProps<Theme>;
}

/**
 * Atom — a themed square container for a single icon.
 * Adapts background colour between light and dark modes automatically.
 */
const IconBadge = ({ children, size = 36, sx }: IconBadgeProps) => (
    <Box
        sx={{
            width: size,
            height: size,
            borderRadius: 2,
            bgcolor: (t) =>
                t.palette.mode === "dark" ? palette.icon.badgeDark : palette.icon.badgeLight,
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
