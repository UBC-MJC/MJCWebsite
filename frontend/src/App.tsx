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
import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";

const useQuery = () => {
    const { search } = useLocation();

    return React.useMemo(() => new URLSearchParams(search), [search]);
};
export const ColorModeContext = React.createContext({
    toggleColorMode: (e: "light" | "dark" | "system") => {
        e;
    },
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
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    const [mode, setMode] = React.useState<"light" | "dark">(prefersDarkMode ? "dark" : "light");

    const colorMode = React.useMemo(() => {
        const root = window.document.documentElement;
        return {
            toggleColorMode: (theme: "light" | "dark" | "system") => {
                if (theme === "system") {
                    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
                        ? "dark"
                        : "light";
                    setMode(systemTheme);
                    root.setAttribute("data-bs-theme", systemTheme);
                    return;
                } else {
                    setMode(theme);
                    root.setAttribute("data-bs-theme", theme);
                }
            },
        };
    }, []);

    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode: mode,
                },
            }),
        [mode],
    );

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <QueryClientProvider client={queryClient}>
                    <AuthContextProvider>
                        <main className="App">
                            <Routes>
                                <Route element={<WithNav />}>
                                    <Route path="/" element={<Home />} />
                                    <Route
                                        path="/leaderboard/jp"
                                        element={<Leaderboard gameVariant="jp" />}
                                    />
                                    <Route
                                        path="/leaderboard/hk"
                                        element={<Leaderboard gameVariant="hk" />}
                                    />
                                    <Route path="/games/:variant/:id" element={<Game />} />
                                    <Route
                                        path="/games/current/jp"
                                        element={<LiveGames gameVariant="jp" />}
                                    />
                                    <Route
                                        path="/games/current/hk"
                                        element={<LiveGames gameVariant="hk" />}
                                    />
                                    <Route
                                        path="/games/create/jp"
                                        element={<CreateGame gameVariant="jp" />}
                                    />
                                    <Route
                                        path="/games/create/hk"
                                        element={<CreateGame gameVariant="hk" />}
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
