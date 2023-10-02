import { FC } from "react";
import { Outlet } from "react-router";
import NavBar from "./NavBar";

const WithNav: FC = () => {
    return (
        <>
            <NavBar />
            <Outlet />
        </>
    );
};

export default WithNav;
