import React, {FC, useContext} from "react";
import {withPlayerCondition} from "../common/withPlayerCondition";
import {Container, Button, Tabs, Tab} from 'react-bootstrap';
import AdminPlayers from "./AdminPlayers";
import AdminSeason from "./AdminSeason";
import {makeDummyAdmins} from "../api/AdminAPI";
import {AuthContext} from "../common/AuthContext";

const AdminComponent: FC = () => {
    const { player } = useContext(AuthContext);

    const makeTestAdmins = () => {
        makeDummyAdmins(player!.authToken).catch((err: any) => {
            console.log("hi");
        });
    }

    return (
        <Container fluid="md" className="my-4">
            <div className="d-grid my-4">
                <Button variant="primary" onClick={makeTestAdmins}>
                    Make Admins
                </Button>
            </div>
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

const hasAdminPermissions = (player: IPlayer | undefined): boolean => {
    return typeof player !== "undefined" && player.admin
}

const Admin = withPlayerCondition(AdminComponent, hasAdminPermissions, '/unauthorized')

export default Admin
