import { FC, useContext } from "react";
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
import { AuthContext } from "./AuthContext";
import { Link } from "react-router-dom";
import { getGameTypeString } from "./Utils";

const NavBar: FC = () => {
    const { player, logout } = useContext(AuthContext);

    return (
        <Navbar bg="info" expand="md">
            <Container fluid>
                <Navbar.Brand as={Link} to="/">
                    <h3 className="m-0">UBC Mahjong Club</h3>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <NavDropdown title="Leaderboard" id="leaderboard-nav-dropdown">
                            <NavDropdown.Item as={Link} to="/leaderboard/jp">
                                {getGameTypeString("jp")}
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/leaderboard/hk">
                                {getGameTypeString("hk")}
                            </NavDropdown.Item>
                        </NavDropdown>
                        {player && (player.japaneseQualified || player.hongKongQualified) && (
                            <NavDropdown title="Record Game" id="record-game-nav-dropdown">
                                {player.japaneseQualified && (
                                    <NavDropdown.Item as={Link} to="/games/create/jp">
                                        {getGameTypeString("jp")}
                                    </NavDropdown.Item>
                                )}
                                {player.hongKongQualified && (
                                    <NavDropdown.Item as={Link} to="/games/create/hk">
                                        {getGameTypeString("hk")}
                                    </NavDropdown.Item>
                                )}
                            </NavDropdown>
                        )}
                        <NavDropdown title={"Current Games"} id="current-games-nav-dropdown">
                            <NavDropdown.Item as={Link} to="/games/current/jp">
                                {getGameTypeString("jp")}
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/games/current/hk">
                                {getGameTypeString("hk")}
                            </NavDropdown.Item>
                        </NavDropdown>
                        <Nav.Link as={Link} to="/resources">
                            Resources
                        </Nav.Link>
                        {/*<Nav.Link as={Link} to="/stats">*/}
                        {/*    Statistics*/}
                        {/*</Nav.Link>*/}
                    </Nav>
                    <Nav>
                        {player && player.admin && (
                            <Nav.Link as={Link} to="/admin">
                                Admin
                            </Nav.Link>
                        )}
                        {player ? (
                            <NavDropdown title={player.username} id="record-game-nav-dropdown">
                                <NavDropdown.Item as={Link} to="/settings">
                                    Settings
                                </NavDropdown.Item>
                                <NavDropdown.Item onClick={logout}>Log Out</NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <Nav.Link as={Link} to="/login">
                                Login
                            </Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavBar;
