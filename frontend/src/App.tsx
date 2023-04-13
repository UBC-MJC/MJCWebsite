import React from 'react'
import { Route, Routes } from "react-router-dom"

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

import './App.css';
import Home from "./home/Home";
import CreateGame from "./game/CreateGame";
import Game from "./game/Game";
import Statistics from "./statistics/Statistics";
import Login from "./login/Login";
import Admin from "./admin/Admin";

const App: React.FC = () => {
    return (
        <main className='App'>
            <Navbar bg="light" expand="md">
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
                            <Nav.Link href="stats">Statistics</Nav.Link>
                        </Nav>
                        <Nav>
                            <Nav.Link href="admin">Admin</Nav.Link>
                            <Nav.Link href="login">Login</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/games/view/:id" element={<Game />} />
                <Route path="/games/create" element={<CreateGame />} />
                <Route path="/stats" element={<Statistics />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<Admin />} />
            </Routes>
        </main>
    )
}

export default App;
