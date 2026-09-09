import { ReactNode, createContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
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

const currentPlayerKey = ["currentPlayer"] as const;

const AuthContextProvider = (props: ChildProps) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const currentPlayerQuery = useQuery({
        queryKey: currentPlayerKey,
        queryFn: async (): Promise<Player | null> => {
            try {
                const response = await getCurrentPlayer();
                return response.data.player;
            } catch {
                return null;
            }
        },
        retry: false,
    });
    const player = currentPlayerQuery.data ?? undefined;
    const loading = currentPlayerQuery.isPending;

    const authLogin = async (loginData: LoginDataType) => {
        const apiResponse = await loginAPICall(loginData);
        queryClient.setQueryData(currentPlayerKey, apiResponse.data.player);
        navigate("/");
    };

    const authRegister = async (registerData: RegisterDataType) => {
        const apiResponse = await registerAPICall(registerData);
        queryClient.setQueryData(currentPlayerKey, apiResponse.data.player);
        navigate("/");
    };

    const authLogout = async () => {
        try {
            await fetch(`${baseUrl}/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            logger.error("Logout error:", error);
        }
        queryClient.setQueryData(currentPlayerKey, null);
        navigate("/login");
    };

    const reloadPlayer = async () => {
        try {
            const response = await getCurrentPlayer();
            queryClient.setQueryData(currentPlayerKey, response.data.player);
        } catch (error) {
            logger.error("Error reloading player:", error);
            queryClient.setQueryData(currentPlayerKey, null);
            navigate("/login");
        }
    };

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
