import { FC, memo } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

interface LoadingFallbackProps {
    minHeight?: string;
    message?: string;
}

const LoadingFallback: FC<LoadingFallbackProps> = ({
    minHeight = "50vh",
    message = "Loading...",
}) => (
    <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight={minHeight}
        role="status"
        aria-live="polite"
        aria-label="Loading content"
    >
        <CircularProgress aria-hidden="true" />
        <Typography variant="body1" sx={{ mt: 2, color: "text.secondary" }}>
            {message}
        </Typography>
    </Box>
);

export default memo(LoadingFallback);
