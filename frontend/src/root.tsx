import type { ReactNode } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AuthContextProvider } from "@/common/AuthContext";
import ErrorBoundary from "@/common/ErrorBoundary";
import { pageMeta } from "@/common/pageMeta";
import { createAppTheme } from "@/theme";
import "@/App.scss";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5000,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

const theme = createAppTheme();

export const meta = () => pageMeta();

export function Layout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#000000" />
                <meta name="description" content="UBC Mahjong Club Website" />
                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" href="/logo192.png" />
                <link rel="manifest" href="/manifest.json" />
                <Meta />
                <Links />
            </head>
            <body>
                <noscript>You need to enable JavaScript to run this app.</noscript>
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function Root() {
    return (
        <ErrorBoundary>
            <ThemeProvider theme={theme}>
                <QueryClientProvider client={queryClient}>
                    <AuthContextProvider>
                        <CssBaseline />
                        <main className="App">
                            <Outlet />
                        </main>
                    </AuthContextProvider>
                </QueryClientProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}
