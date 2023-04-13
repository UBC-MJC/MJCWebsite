import React from 'react'
import { Route, Routes } from "react-router-dom"

import './App.css';
import WithoutNav from "./common/WithoutNav";
import WithNav from "./common/WithNav";

import Home from "./home/Home";
import CreateGame from "./game/CreateGame";
import Game from "./game/Game";
import Statistics from "./statistics/Statistics";
import Login from "./login/Login";
import Admin from "./admin/Admin";
import SignUp from "./login/SignUp";

const App: React.FC = () => {
    return (
        <main className='App'>
            <Routes>
                <Route element={<WithNav />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/games/view/:id" element={<Game />} />
                    <Route path="/games/create" element={<CreateGame />} />
                    <Route path="/stats" element={<Statistics />} />
                    <Route path="/admin" element={<Admin />} />
                </Route>
                <Route element={<WithoutNav />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                </Route>
            </Routes>
        </main>
    )
}

export default App;
