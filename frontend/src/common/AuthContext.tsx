import { ReactNode, useEffect, useCallback } from "react";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAPICall, registerAPICall } from "@/api/AuthAPI";
import { getCurrentPlayer } from "@/api/AccountAPI";
import { baseUrl } from "@/api/APIUtils";
import { logger } from "./logger";
import type { AuthContextType, Player, LoginDataType, RegisterDataType } from "@/types";

interface ChildProps {
    children: ReactNode;
}

const notInstantiated = () => {
    return Promise.reject();
};
const AuthContext = createContext<AuthContextType>({
    player: undefined,
    loading: true,
    login: notInstantiated,
    register: notInstantiated,
    logout: notInstantiated,
    reloadPlayer: notInstantiated,
});

const AuthContextProvider = (props: ChildProps) => {
    const navigate = useNavigate();
    const [player, setPlayer] = useState<Player | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const abortController = new AbortController();

        const checkAuth = async () => {
            // Check if user is already authenticated via cookie
            try {
                const response = await getCurrentPlayer();
                if (!abortController.signal.aborted) {
                    setPlayer(response.data.player);
                }
            } catch {
                // No valid session, user is not logged in
                if (!abortController.signal.aborted) {
                    setPlayer(undefined);
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setLoading(false);
                }
            }
        };
        checkAuth();

        return () => {
            abortController.abort();
        };
    }, []);

    const authLogin = useCallback(
        async (loginData: LoginDataType) => {
            const apiResponse = await loginAPICall(loginData);
            const playerAPIData = apiResponse.data;
            setPlayer(playerAPIData.player);
            navigate("/");
        },
        [],
    );

    const authRegister = useCallback(
        async (registerData: RegisterDataType) => {
            const apiResponse = await registerAPICall(registerData);
            const playerAPIData = apiResponse.data;
            setPlayer(playerAPIData.player);
            navigate("/");
        },
        [],
    );

    const authLogout = useCallback(async () => {
        try {
            await fetch(`${baseUrl}/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            logger.error("Logout error:", error);
        }
        setPlayer(undefined);
        navigate("/login");
    }, []);

    const reloadPlayer = useCallback(async () => {
        try {
            const response = await getCurrentPlayer();
            setPlayer(response.data.player);
        } catch (error) {
            logger.error("Error reloading player:", error);
            // If token is invalid/expired, log out
            setPlayer(undefined);
            navigate("/login");
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                player,
                loading,
                login: authLogin,
                register: authRegister,
                logout: authLogout,
                reloadPlayer,
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthContextProvider };
