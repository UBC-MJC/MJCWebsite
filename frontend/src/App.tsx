import React from 'react'
import { Route, Routes } from "react-router-dom"

import './App.css';
import Home from "./home/Home";
import Login from "./login/Login";
import GameHistory from "./gamehistory/GameHistory";

const App: React.FC = () => {
    return (
        <main className='App'>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/games/view/:id" element={<GameHistory />} />
            </Routes>
        </main>
    )
}

export default App;
