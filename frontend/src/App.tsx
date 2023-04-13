import React from 'react'
import { Route, Routes } from "react-router-dom"

import './App.css';
import WithoutNav from "./common/WithoutNav";
import WithNav from "./common/WithNav";

import Home from "./home/Home";
import Leaderboard from "./leaderboard/Leaderboard";
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
                    <Route path="/leaderboard/jp" element={<Leaderboard gameType="jp" />} />
                    <Route path="/leaderboard/hk" element={<Leaderboard gameType="hk" />} />
                    <Route path="/games/view/:id" element={<Game />} />
                    <Route path="/games/create/jp" element={<CreateGame gameType="jp" />} />
                    <Route path="/games/create/hk" element={<CreateGame gameType="hk" />} />
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
