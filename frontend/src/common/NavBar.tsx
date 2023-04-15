import {FC, useContext} from "react";
import {Container, Navbar, Nav, NavDropdown} from 'react-bootstrap';
import {AuthContext} from "./AuthContext";

const NavBar: FC = () => {
    const { player, logout } = useContext(AuthContext);

    return <Navbar bg="light" expand="md">
        <Container fluid>
            <Navbar.Brand href="/">
                <h3 className="m-0">UBC Mahjong Club</h3>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    <NavDropdown title="Leaderboard" id="leaderboard-nav-dropdown">
                        <NavDropdown.Item href="/leaderboard/jp">Riichi</NavDropdown.Item>
                        <NavDropdown.Item href="/leaderboard/hk">Hong Kong</NavDropdown.Item>
                    </NavDropdown>
                    <NavDropdown title="Record Game" id="record-game-nav-dropdown">
                        <NavDropdown.Item href="/games/create/jp">Riichi</NavDropdown.Item>
                        <NavDropdown.Item href="/games/create/hk">Hong Kong</NavDropdown.Item>
                    </NavDropdown>
                    <Nav.Link href="/stats">Statistics</Nav.Link>
                </Nav>
                <Nav>
                    <Nav.Link href="/admin">Admin</Nav.Link>
                    {player ?
                        <NavDropdown title="Account" id="record-game-nav-dropdown">
                            <NavDropdown.Item onClick={logout}>Log Out</NavDropdown.Item>
                        </NavDropdown>
                        :
                        <Nav.Link href="/login">Login</Nav.Link>
                    }
                </Nav>
            </Navbar.Collapse>
        </Container>
    </Navbar>
}

export default NavBar;
