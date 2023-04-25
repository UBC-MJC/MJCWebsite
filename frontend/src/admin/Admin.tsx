import React, {FC, useContext, useState} from "react";
import {withPlayerCondition} from "../common/withPlayerCondition";
import {Nav, Container, Button} from 'react-bootstrap';
import AdminPlayers from "./AdminPlayers";
import AdminSeason from "./AdminSeason";
import {makeDummyAdmins} from "../api/AdminAPI";
import {AuthContext} from "../common/AuthContext";
import {AxiosError} from "axios/index";


type AdminTab = "players" | "season"

const AdminComponent: FC = () => {
    const { player } = useContext(AuthContext);

    const [tab, setTab] = useState<AdminTab>("players");

    const handleSelect = (eventKey: any) => {
        setTab(eventKey)
    }

    const playersHeader = AdminPlayers({})
    const seasonHeader = AdminSeason({})

    const getTabContent = (tab: AdminTab) => {
        switch (tab) {
            case "players":
                return playersHeader
            case "season":
                return seasonHeader
        }
    }

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
            <Nav variant="tabs" defaultActiveKey="players" onSelect={handleSelect}>
                <Nav.Item>
                    <Nav.Link eventKey="players">Players</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="season">Season</Nav.Link>
                </Nav.Item>
            </Nav>
            {getTabContent(tab)}
        </Container>
    );
}

const hasAdminPermissions = (player: IPlayer | undefined): boolean => {
    return typeof player !== "undefined" && player.admin
}

const Admin = withPlayerCondition(AdminComponent, hasAdminPermissions, '/unauthorized')

export default Admin
