import { FC, Suspense } from "react";
import { Outlet } from "react-router";
import NavBar from "@/common/NavBar";
import LoadingFallback from "@/common/LoadingFallback";

const WithNav: FC = () => {
    return (
        <>
            <NavBar />
            <Suspense fallback={<LoadingFallback minHeight="50vh" />}>
                <Outlet />
            </Suspense>
        </>
    );
};

export default WithNav;
