import { Suspense } from "react";
import { Outlet } from "react-router";
import LoadingFallback from "@/common/LoadingFallback";

const WithoutNav = () => (
    <Suspense fallback={<LoadingFallback minHeight="100vh" />}>
        <Outlet />
    </Suspense>
);

export default WithoutNav;
