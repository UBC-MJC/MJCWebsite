import React, { FC } from "react";
import { withPlayerCondition } from "../common/withPlayerCondition";
import { Container, Tabs, Tab, Box } from "@mui/material";
import AdminPlayers from "./AdminPlayers";
import AdminSeason from "./AdminSeason";
import AdminChombo from "./AdminChombo";
const AdminComponent: FC = () => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Container maxWidth="lg" className="my-4">
            <Tabs value={value} onChange={handleChange} variant="fullWidth">
                <Tab label="Players" />
                <Tab label="Season" />
                <Tab label="Chombo" />
            </Tabs>
            <Box hidden={value !== 0}>
                <AdminPlayers />
            </Box>
            <Box hidden={value !== 1}>
                <AdminSeason />
            </Box>
            <Box hidden={value !== 2}>
                <AdminChombo />
            </Box>
        </Container>
    );
};

const hasAdminPermissions = (player: Player | undefined): boolean => {
    return typeof player !== "undefined" && player.admin;
};

const Admin = withPlayerCondition(AdminComponent, hasAdminPermissions, "/unauthorized");

export default Admin;
