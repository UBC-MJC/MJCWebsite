import React from "react";
import {Container, Navbar, Nav, NavDropdown} from 'react-bootstrap';

const NavBar: React.FC = () => {
    return <Navbar bg="light" expand="md">
        <Container fluid>
            <Navbar.Brand href="/">
                <h3 className="m-0">UBC Mahjong Club</h3>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    <NavDropdown title="Leaderboard" id="leaderboard-nav-dropdown">
                        <NavDropdown.Item href="/">Riichi</NavDropdown.Item>
                        <NavDropdown.Item href="/">Hong Kong</NavDropdown.Item>
                    </NavDropdown>
                    <NavDropdown title="Record Game" id="record-game-nav-dropdown">
                        <NavDropdown.Item href="/games/create">Riichi</NavDropdown.Item>
                        <NavDropdown.Item href="/games/create">Hong Kong</NavDropdown.Item>
                    </NavDropdown>
                    <Nav.Link href="/stats">Statistics</Nav.Link>
                </Nav>
                <Nav>
                    <Nav.Link href="/admin">Admin</Nav.Link>
                    <Nav.Link href="/login">Login</Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Container>
    </Navbar>
}

export default NavBar;
