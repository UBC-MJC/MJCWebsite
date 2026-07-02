import { Box, Typography } from "@mui/material";

/**
 * Centered club brand mark used atop the login/register pages: the rounded
 * mahjong-tile logo, the club name, and a page-specific subtitle.
 */
const BrandHeader = ({ subtitle }: { subtitle: string }) => (
    <Box textAlign="center">
        <Box
            sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
            }}
        >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <rect x="2" y="2" width="11" height="11" rx="2" fill="white" />
                <rect x="15" y="2" width="11" height="11" rx="2" fill="white" opacity="0.5" />
                <rect x="2" y="15" width="11" height="11" rx="2" fill="white" opacity="0.5" />
                <rect x="15" y="15" width="11" height="11" rx="2" fill="white" />
            </svg>
        </Box>
        <Typography variant="h3" fontWeight={700} gutterBottom>
            UBC Mahjong Club
        </Typography>
        <Typography variant="body2" color="text.secondary">
            {subtitle}
        </Typography>
    </Box>
);

export default BrandHeader;
