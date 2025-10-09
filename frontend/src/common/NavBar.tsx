import React, { FC, useContext, memo } from "react";
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
import { AuthContext } from "@/common/AuthContext";
import { Link } from "react-router-dom";
import { getGameVariantString } from "@/common/Utils";

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
                                {getGameVariantString("jp", "RANKED")}
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/leaderboard/jp/casual">
                                {getGameVariantString("jp", "CASUAL")}
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/leaderboard/hk">
                                {getGameVariantString("hk", "RANKED")}
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/leaderboard/hk/casual">
                                {getGameVariantString("hk", "CASUAL")}
                            </NavDropdown.Item>
                        </NavDropdown>
                        {player && (
                            <NavDropdown title="Record Game" id="record-game-nav-dropdown">
                                {player.japaneseQualified && (
                                    <NavDropdown.Item as={Link} to="/games/create/jp">
                                        {getGameVariantString("jp", "RANKED")}
                                    </NavDropdown.Item>
                                )}
                                <NavDropdown.Item as={Link} to="/games/create/jp/casual">
                                    {getGameVariantString("jp", "CASUAL")}
                                </NavDropdown.Item>
                                {player.hongKongQualified && (
                                    <NavDropdown.Item as={Link} to="/games/create/hk">
                                        {getGameVariantString("hk", "RANKED")}
                                    </NavDropdown.Item>
                                )}
                                <NavDropdown.Item as={Link} to="/games/create/hk/casual">
                                    {getGameVariantString("hk", "CASUAL")}
                                </NavDropdown.Item>
                            </NavDropdown>
                        )}
                        <NavDropdown title={"Live Games"} id="live-games-nav-dropdown">
                            <NavDropdown.Item as={Link} to="/games/current/jp">
                                {getGameVariantString("jp")}
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/games/current/hk">
                                {getGameVariantString("hk")}
                            </NavDropdown.Item>
                        </NavDropdown>
                        <Nav.Link as={Link} to="/games">
                            Logs
                        </Nav.Link>
                        <Nav.Link as={Link} to="/stats/jp">
                            Stats
                        </Nav.Link>
                        <Nav.Link as={Link} to="/resources">
                            Resources
                        </Nav.Link>
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

export default memo(NavBar);
