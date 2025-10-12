import React from "react";
import { withPlayerCondition } from "@/common/withPlayerCondition";
import { Container, Tabs, Tab } from "@mui/material";
import AdminPlayers from "./AdminPlayers";
import AdminSeason from "./AdminSeason";
import AdminChombo from "./AdminChombo";
import type { Player } from "@/types";

const AdminComponent = () => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Container maxWidth="lg">
            <Tabs value={value} onChange={handleChange} variant="fullWidth">
                <Tab label="Players" />
                <Tab label="Season" />
                <Tab label="Chombo" />
            </Tabs>
            {value === 0 ? <AdminPlayers /> : null}
            {value === 1 ? <AdminSeason /> : null}
            {value === 2 ? <AdminChombo /> : null}
        </Container>
    );
};

const hasAdminPermissions = (player: Player | undefined): boolean => {
    return typeof player !== "undefined" && player.admin;
};

const Admin = withPlayerCondition(AdminComponent, hasAdminPermissions, "/unauthorized");

export default Admin;
