import { FC, memo } from "react";
import { Box, CircularProgress } from "@mui/material";

interface LoadingFallbackProps {
    minHeight?: string;
}

const LoadingFallback: FC<LoadingFallbackProps> = ({ minHeight = "50vh" }) => (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight={minHeight}>
        <CircularProgress />
    </Box>
);

export default memo(LoadingFallback);
