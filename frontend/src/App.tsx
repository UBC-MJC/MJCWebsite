import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import "./App.css";
import WithoutNav from "./common/WithoutNav";
import WithNav from "./common/WithNav";
import { AuthContextProvider } from "./common/AuthContext";

import Home from "./home/Home";
import Leaderboard from "./leaderboard/Leaderboard";
import CreateGame from "./game/CreateGame";
import Game from "./game/Game";
import Statistics from "./statistics/Statistics";
import Login from "./login/Login";
import Admin from "./admin/Admin";
import Register from "./login/Register";
import Unauthorized from "./common/Unauthorized";
import Settings from "./account/Settings";

const App: React.FC = () => {
    return (
        <main className="App">
            <AuthContextProvider>
                <Routes>
                    <Route element={<WithNav />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/leaderboard/jp" element={<Leaderboard gameVariant="jp" />} />
                        <Route path="/leaderboard/hk" element={<Leaderboard gameVariant="hk" />} />
                        <Route path="/games/:variant/:id" element={<Game />} />
                        <Route path="/games/create/jp" element={<CreateGame gameVariant="jp" />} />
                        <Route path="/games/create/hk" element={<CreateGame gameVariant="hk" />} />
                        <Route path="/stats" element={<Statistics />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />
                    </Route>
                    <Route element={<WithoutNav />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                    </Route>
                    <Route
                        path="*" // redirect to home if no route matches
                        element={<Navigate to="/" replace />}
                    />
                </Routes>
            </AuthContextProvider>
        </main>
    );
};

export default App;
