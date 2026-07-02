import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { ThemeProvider } from "@mui/material/styles";
import { createAppTheme } from "@/theme";
import type { AccentKey } from "@/theme/tokens";

const STORAGE_KEY = "mjc-accent";
const DEFAULT_ACCENT: AccentKey = "red";

const isAccentKey = (value: string | null): value is AccentKey =>
    value === "red" || value === "blue" || value === "green";

const readStoredAccent = (): AccentKey => {
    if (typeof window === "undefined") {
        return DEFAULT_ACCENT;
    }
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return isAccentKey(stored) ? stored : DEFAULT_ACCENT;
    } catch {
        return DEFAULT_ACCENT;
    }
};

interface AccentContextValue {
    accent: AccentKey;
    setAccent: (accent: AccentKey) => void;
}

const AccentContext = createContext<AccentContextValue>({
    accent: DEFAULT_ACCENT,
    setAccent: () => {
        /* overridden by AccentProvider */
    },
});

/** Read/set the active accent. Orthogonal to MUI's `useColorScheme` (mode). */
export const useAccent = (): AccentContextValue => useContext(AccentContext);

/**
 * Persists the accent choice in localStorage (default "red") and rebuilds the
 * MUI theme via ThemeProvider when it changes. Accent and color scheme are
 * independent: switching accent rebuilds the theme but preserves both schemes,
 * so MUI's `useColorScheme` mode handling is untouched.
 */
export const AccentProvider = ({ children }: { children: ReactNode }) => {
    const [accent, setAccentState] = useState<AccentKey>(readStoredAccent);

    const setAccent = useCallback((next: AccentKey) => {
        setAccentState(next);
        try {
            window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
            /* ignore persistence failures (private mode, storage disabled, etc.) */
        }
    }, []);

    const theme = useMemo(() => createAppTheme(accent), [accent]);
    const value = useMemo<AccentContextValue>(() => ({ accent, setAccent }), [accent, setAccent]);

    return (
        <AccentContext.Provider value={value}>
            <ThemeProvider theme={theme} defaultMode="system">
                {children}
            </ThemeProvider>
        </AccentContext.Provider>
    );
};
