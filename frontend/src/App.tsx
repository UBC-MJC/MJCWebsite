import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.scss";
import WithoutNav from "./common/WithoutNav";
import WithNav from "./common/WithNav";
import { AuthContextProvider } from "./common/AuthContext";

import Home from "./home/Home";
import Leaderboard from "./leaderboard/Leaderboard";
import { LiveGames } from "./game/LiveGames";
import CreateGame from "./game/CreateGame";
import Game from "./game/Game";
import Statistics from "./statistics/Statistics";
import Login from "./login/Login";
import Admin from "./admin/Admin";
import Register from "./login/Register";
import Unauthorized from "./common/Unauthorized";
import Settings from "./account/Settings";
import RequestPasswordReset from "./login/RequestPasswordReset";
import PasswordReset from "./login/PasswordReset";
import { Resources } from "./resources/Resources";
import GameLogs from "./game/GameLogs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTheme, CssBaseline, ThemeProvider, useMediaQuery } from "@mui/material";

const useQuery = () => {
    const { search } = useLocation();

    return React.useMemo(() => new URLSearchParams(search), [search]);
};
export const ColorModeContext = React.createContext({
    toggleColorMode: (e: "light" | "dark" | "system") => { console.warn("Color mode context not initialized") },
});

const App: React.FC = () => {
    const query = useQuery();
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5000,
            },
        },
    });
    const systemMode = useMediaQuery("(prefers-color-scheme: dark)") ? "dark" : "light";
    const root = window.document.documentElement;
    const [mode, setMode] = React.useState<"light" | "dark">(systemMode);
    root.setAttribute("data-bs-theme", mode);
    const colorMode = {
        toggleColorMode: (mode: "light" | "dark" | "system") => {
            if (mode === "system") {
                setMode(systemMode);
                root.setAttribute("data-bs-theme", systemMode);
                return;
            }
            root.setAttribute("data-bs-theme", mode);
            setMode(mode);
        },
    };
    const theme = createTheme({
        palette: {
            mode: mode,
        },
    });

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <QueryClientProvider client={queryClient}>
                    <AuthContextProvider>
                        <CssBaseline />
                        <main className="App">
                            <Routes>
                                <Route element={<WithNav />}>
                                    <Route path="/" element={<Home />} />
                                    <Route
                                        path="/leaderboard/jp"
                                        element={
                                            <Leaderboard gameVariant="jp" gameType={"RANKED"} />
                                        }
                                    />
                                    <Route
                                        path="/leaderboard/jp/casual"
                                        element={
                                            <Leaderboard gameVariant="jp" gameType={"CASUAL"} />
                                        }
                                    />
                                    <Route
                                        path="/leaderboard/hk"
                                        element={
                                            <Leaderboard gameVariant="hk" gameType={"RANKED"} />
                                        }
                                    />
                                    <Route
                                        path="/leaderboard/hk/casual"
                                        element={
                                            <Leaderboard gameVariant="hk" gameType={"CASUAL"} />
                                        }
                                    />
                                    <Route path="/games/:variant/:id" element={<Game />} />
                                    <Route
                                        path="/games/current/jp"
                                        element={<LiveGames gameVariant="jp" gameType={"RANKED"} />}
                                    />
                                    <Route
                                        path="/games/current/hk"
                                        element={<LiveGames gameVariant="hk" gameType={"RANKED"} />}
                                    />
                                    <Route
                                        path="/games/create/jp"
                                        element={
                                            <CreateGame gameVariant="jp" gameType={"RANKED"} />
                                        }
                                    />
                                    <Route
                                        path="/games/create/jp/casual"
                                        element={
                                            <CreateGame gameVariant="jp" gameType={"CASUAL"} />
                                        }
                                    />
                                    <Route
                                        path="/games/create/hk"
                                        element={
                                            <CreateGame gameVariant="hk" gameType={"RANKED"} />
                                        }
                                    />
                                    <Route
                                        path="/games/create/hk/casual"
                                        element={
                                            <CreateGame gameVariant="hk" gameType={"CASUAL"} />
                                        }
                                    />
                                    <Route path="/games" element={<GameLogs />} />
                                    <Route path="/resources" element={<Resources />} />
                                    <Route
                                        path="/stats/jp"
                                        element={<Statistics gameVariant={"jp"} />}
                                    />
                                    <Route path="/admin" element={<Admin />} />
                                    <Route path="/settings" element={<Settings />} />
                                    <Route path="/unauthorized" element={<Unauthorized />} />
                                </Route>
                                <Route element={<WithoutNav />}>
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/register" element={<Register />} />
                                    <Route
                                        path="/request-password-reset"
                                        element={<RequestPasswordReset />}
                                    />
                                    <Route
                                        path="/password-reset"
                                        element={
                                            <PasswordReset
                                                playerId={query.get("id")}
                                                token={query.get("token")}
                                            />
                                        }
                                    />
                                </Route>
                                <Route
                                    path="*" // redirect to home if no route matches
                                    element={<Navigate to="/" replace />}
                                />
                            </Routes>
                        </main>
                    </AuthContextProvider>
                </QueryClientProvider>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};

export default App;
