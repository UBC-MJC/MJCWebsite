import { FC, Suspense } from "react";
import { Outlet } from "react-router";
import LoadingFallback from "./LoadingFallback";

const WithoutNav: FC = () => (
    <Suspense fallback={<LoadingFallback minHeight="100vh" />}>
        <Outlet />
    </Suspense>
);

export default WithoutNav;
