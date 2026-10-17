import { ReactNode, createContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { isAxiosError } from "axios";
import { Alert, Button, Container, Stack } from "@mui/material";
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
            } catch (error) {
                if (isAxiosError(error) && error.response?.status === 401) {
                    return null;
                }
                throw error;
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
        const result = await currentPlayerQuery.refetch();
        if (result.isError) {
            logger.error("Error reloading player:", result.error);
        } else if (result.data === null) {
            navigate("/login");
        }
    };

    if (currentPlayerQuery.isError && currentPlayerQuery.data === undefined) {
        return (
            <Container maxWidth="sm" sx={{ py: 4 }}>
                <Stack spacing={2}>
                    <Alert severity="error">Unable to check your session. Please try again.</Alert>
                    <Button
                        variant="contained"
                        disabled={currentPlayerQuery.isFetching}
                        onClick={() => void currentPlayerQuery.refetch()}
                    >
                        Retry
                    </Button>
                </Stack>
            </Container>
        );
    }

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
