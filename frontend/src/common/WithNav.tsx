import { FC, Suspense } from "react";
import { Outlet } from "react-router";
import { Box } from "@mui/material";
import NavBar from "@/common/NavBar";
import LoadingFallback from "@/common/LoadingFallback";

const WithNav: FC = () => {
    return (
        <>
            <NavBar />
            <Box component="main" id="main-content" tabIndex={-1}>
                <Suspense fallback={<LoadingFallback minHeight="50vh" />}>
                    <Outlet />
                </Suspense>
            </Box>
        </>
    );
};

export default WithNav;
