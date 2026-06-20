import { memo } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

interface LoadingFallbackProps {
    minHeight?: string;
    message?: string;
}

const LoadingFallback = ({ minHeight = "50vh", message = "Loading…" }: LoadingFallbackProps) => (
    <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight={minHeight}
        gap={2}
        role="status"
        aria-live="polite"
        aria-label="Loading content"
    >
        <CircularProgress size={36} thickness={3} aria-hidden="true" />
        <Typography variant="body2" color="text.secondary">
            {message}
        </Typography>
    </Box>
);

export default memo(LoadingFallback);
