import { Suspense } from "react";
import { Outlet } from "react-router";
import { Box } from "@mui/material";
import LoadingFallback from "@/common/LoadingFallback";

const WithoutNav = () => (
    <Box component="main">
        <Suspense fallback={<LoadingFallback minHeight="100vh" />}>
            <Outlet />
        </Suspense>
    </Box>
);

export default WithoutNav;
