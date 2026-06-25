import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.scss";
import WithoutNav from "@/common/WithoutNav";
import WithNav from "@/common/WithNav";
import { AuthContextProvider } from "@/common/AuthContext";
import ErrorBoundary from "@/common/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CssBaseline } from "@mui/material";
import { AccentProvider } from "@/theme/AccentContext";
import { GameNotFound } from "@/game/common/GameNotFound";
import React from "react";
import Tournament from "./resources/Tournament";

// Lazy load route components for code splitting
const Home = React.lazy(() => import("./home/Home"));
const Leaderboard = React.lazy(() => import("./leaderboard/Leaderboard"));
const Games = React.lazy(() => import("./game/Games"));
const CreateGame = React.lazy(() => import("./game/CreateGame"));
const Game = React.lazy(() => import("./game/Game"));
const Statistics = React.lazy(() => import("./statistics/Statistics"));
const Login = React.lazy(() => import("./login/Login"));
const Admin = React.lazy(() => import("./admin/Admin"));
const Register = React.lazy(() => import("./login/Register"));
const Unauthorized = React.lazy(() => import("./common/Unauthorized"));
const Settings = React.lazy(() => import("./account/Settings"));
const RequestPasswordReset = React.lazy(() => import("./login/RequestPasswordReset"));
const PasswordReset = React.lazy(() => import("./login/PasswordReset"));
const Resources = React.lazy(() =>
    import("./resources/Resources").then((module) => ({ default: module.Resources })),
);

// Create QueryClient outside component to prevent recreation on every render
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5000,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

const useQuery = () => {
    const { search } = useLocation();

    return new URLSearchParams(search);
};

const App = () => {
    const query = useQuery();

    return (
        <ErrorBoundary>
            <AccentProvider>
                <QueryClientProvider client={queryClient}>
                    <AuthContextProvider>
                        <CssBaseline />
                        <main className="App">
                            <Routes>
                                <Route element={<WithNav />}>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/leaderboard" element={<Leaderboard />} />
                                    {/* Legacy per-board leaderboard URLs now redirect to the
                                        single condensed page, carrying the intended board so it
                                        opens on that selection. */}
                                    <Route
                                        path="/leaderboard/jp"
                                        element={
                                            <Navigate
                                                to="/leaderboard?variant=jp&type=RANKED"
                                                replace
                                            />
                                        }
                                    />
                                    <Route
                                        path="/leaderboard/jp/casual"
                                        element={
                                            <Navigate
                                                to="/leaderboard?variant=jp&type=CASUAL"
                                                replace
                                            />
                                        }
                                    />
                                    <Route
                                        path="/leaderboard/hk"
                                        element={
                                            <Navigate
                                                to="/leaderboard?variant=hk&type=RANKED"
                                                replace
                                            />
                                        }
                                    />
                                    <Route
                                        path="/leaderboard/hk/casual"
                                        element={
                                            <Navigate
                                                to="/leaderboard?variant=hk&type=CASUAL"
                                                replace
                                            />
                                        }
                                    />
                                    <Route path="/games/:variant/:id" element={<Game />} />
                                    <Route path="/games/current" element={<Games />} />
                                    <Route path="/games/create" element={<CreateGame />} />
                                    {/* Legacy per-type create routes now redirect, carrying the
                                        intended variant/type so the page opens on that selection. */}
                                    <Route
                                        path="/games/create/jp"
                                        element={
                                            <Navigate
                                                to="/games/create?variant=jp&type=RANKED"
                                                replace
                                            />
                                        }
                                    />
                                    <Route
                                        path="/games/create/jp/casual"
                                        element={
                                            <Navigate
                                                to="/games/create?variant=jp&type=CASUAL"
                                                replace
                                            />
                                        }
                                    />
                                    <Route
                                        path="/games/create/hk"
                                        element={
                                            <Navigate
                                                to="/games/create?variant=hk&type=RANKED"
                                                replace
                                            />
                                        }
                                    />
                                    <Route
                                        path="/games/create/hk/casual"
                                        element={
                                            <Navigate
                                                to="/games/create?variant=hk&type=CASUAL"
                                                replace
                                            />
                                        }
                                    />
                                    <Route path="/games/not-found" element={<GameNotFound />} />
                                    <Route path="/games" element={<Games />} />
                                    <Route path="/resources" element={<Resources />} />
                                    <Route path="/vro2026" element={<Tournament />} />
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
            </AccentProvider>
        </ErrorBoundary>
    );
};

export default App;