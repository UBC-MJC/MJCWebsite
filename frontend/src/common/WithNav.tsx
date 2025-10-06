import { FC, Suspense } from "react";
import { Outlet } from "react-router";
import NavBar from "./NavBar";
import LoadingFallback from "./LoadingFallback";

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
