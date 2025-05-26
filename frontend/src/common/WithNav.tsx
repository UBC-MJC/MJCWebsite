import { FC } from "react";
import { Outlet } from "react-router";
import NavBar from "./NavBar";
import { Container } from "@mui/material";

const WithNav: FC = () => {
    return (
        <>
            <NavBar />
            <Container>
                <Outlet />
            </Container>
        </>
    );
};

export default WithNav;
