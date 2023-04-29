import React, {FC} from "react";
import {withPlayerCondition} from "../common/withPlayerCondition";
import {Container, Tabs, Tab} from 'react-bootstrap';
import AdminPlayers from "./AdminPlayers";
import AdminSeason from "./AdminSeason";

const AdminComponent: FC = () => {
    return (
        <Container fluid="lg" className="my-4">
            <Tabs variant="tabs" defaultActiveKey="players">
                <Tab eventKey="players" title="Players">
                    <AdminPlayers />
                </Tab>
                <Tab eventKey="season" title="Season">
                    <AdminSeason />
                </Tab>
            </Tabs>
        </Container>
    );
}

const hasAdminPermissions = (player: Player | undefined): boolean => {
    return typeof player !== "undefined" && player.admin
}

const Admin = withPlayerCondition(AdminComponent, hasAdminPermissions, '/unauthorized')

export default Admin
