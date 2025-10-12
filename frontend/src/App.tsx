import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.scss";
import WithoutNav from "@/common/WithoutNav";
import WithNav from "@/common/WithNav";
import { AuthContextProvider } from "@/common/AuthContext";
import ErrorBoundary from "@/common/ErrorBoundary";
import { logger } from "@/common/logger";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTheme, CssBaseline, ThemeProvider, useMediaQuery } from "@mui/material";
import { enUS } from "@mui/x-date-pickers/locales";
import {GameNotFound} from "@/game/common/GameNotFound";

// Lazy load route components for code splitting
const Home = React.lazy(() => import("./home/Home"));
const Leaderboard = React.lazy(() => import("./leaderboard/Leaderboard"));
const LiveGames = React.lazy(() =>
    import("./game/LiveGames").then((module) => ({ default: module.LiveGames })),
);
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
const GameLogs = React.lazy(() => import("./game/GameLogs"));

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

    return React.useMemo(() => new URLSearchParams(search), [search]);
};

export const ColorModeContext = React.createContext({
    toggleColorMode: (_: "light" | "dark" | "system") => {
        void 0;
    },
});

const COLOR_MODE_STORAGE_KEY = "colorMode";

const App: React.FC = () => {
    const query = useQuery();
    const systemMode = useMediaQuery("(prefers-color-scheme: dark)") ? "dark" : "light";
    const root = window.document.documentElement;

    // Initialize mode from localStorage, or fall back to system preference
    const getInitialMode = (): "light" | "dark" => {
        try {
            const stored = localStorage.getItem(COLOR_MODE_STORAGE_KEY);
            if (stored === "light" || stored === "dark") {
                return stored;
            }
            if (stored === "system") {
                return systemMode;
            }
        } catch (error) {
            logger.error("Error reading color mode from localStorage:", error);
        }
        return systemMode;
    };

    const [mode, setMode] = React.useState<"light" | "dark">(getInitialMode);

    // Set initial theme attribute
    React.useEffect(() => {
        root.setAttribute("data-bs-theme", mode);
    }, [mode, root]);

    const colorMode = {
        toggleColorMode: (newMode: "light" | "dark" | "system") => {
            try {
                localStorage.setItem(COLOR_MODE_STORAGE_KEY, newMode);
            } catch (error) {
                logger.error("Error saving color mode to localStorage:", error);
            }

            if (newMode === "system") {
                setMode(systemMode);
                root.setAttribute("data-bs-theme", systemMode);
                return;
            }
            root.setAttribute("data-bs-theme", newMode);
            setMode(newMode);
        },
    };
    const theme = createTheme(
        {
            palette: {
                mode: mode,
                ...(mode === "dark" && {
                    primary: {
                        main: "#90caf9",
                    },
                }),
            },
            components: {
                MuiLink: {
                    styleOverrides: {
                        root: {
                            color: mode === "dark" ? "#90caf9" : "#1976d2",
                            "&:hover": {
                                color: mode === "dark" ? "#bbdefb" : "#1565c0",
                            },
                        },
                    },
                },
                MuiCssBaseline: {
                    styleOverrides: {
                        a: {
                            color: mode === "dark" ? "#90caf9" : "#1976d2",
                            "&:hover": {
                                color: mode === "dark" ? "#bbdefb" : "#1565c0",
                            },
                        },
                    },
                },
            },
        },
        enUS,
    );

    return (
        <ErrorBoundary>
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
                                            element={
                                                <LiveGames gameVariant="jp" gameType={"RANKED"} />
                                            }
                                        />
                                        <Route
                                            path="/games/current/hk"
                                            element={
                                                <LiveGames gameVariant="hk" gameType={"RANKED"} />
                                            }
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
                                        <Route path="/games/not-found" element={<GameNotFound />} />
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
        </ErrorBoundary>
    );
};

export default App;
