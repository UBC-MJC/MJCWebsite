import { FC, ReactNode, useEffect, useCallback } from "react";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAPICall, registerAPICall } from "@/api/AuthAPI";
import { getCurrentPlayer } from "@/api/AccountAPI";
import { baseUrl } from "@/api/APIUtils";
import type { AuthContextType, Player, LoginDataType, RegisterDataType } from "@/types";

interface ChildProps {
    children: ReactNode;
}

const notInstantiated = () => {
    return Promise.reject();
};
const AuthContext = createContext<AuthContextType>({
    player: undefined,
    login: notInstantiated,
    register: notInstantiated,
    logout: notInstantiated,
    reloadPlayer: notInstantiated,
});

const AuthContextProvider: FC<ChildProps> = (props: ChildProps) => {
    const navigate = useNavigate();
    const [player, setPlayer] = useState<Player | undefined>(undefined);

    useEffect(() => {
        // Check if user is already authenticated via cookie
        getCurrentPlayer()
            .then((response) => {
                setPlayer(response.data.player);
            })
            .catch(() => {
                // No valid session, user is not logged in
                setPlayer(undefined);
            });
    }, []);

    const authLogin = useCallback(
        async (loginData: LoginDataType) => {
            const apiResponse = await loginAPICall(loginData);
            const playerAPIData = apiResponse.data;
            setPlayer(playerAPIData.player);
            navigate("/");
        },
        [navigate],
    );

    const authRegister = useCallback(
        async (registerData: RegisterDataType) => {
            const apiResponse = await registerAPICall(registerData);
            const playerAPIData = apiResponse.data;
            setPlayer(playerAPIData.player);
            navigate("/");
        },
        [navigate],
    );

    const authLogout = useCallback(async () => {
        try {
            await fetch(`${baseUrl}/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("Logout error:", error);
        }
        setPlayer(undefined);
        navigate("/login");
    }, [navigate]);

    const reloadPlayer = useCallback(async () => {
        try {
            const response = await getCurrentPlayer();
            setPlayer(response.data.player);
        } catch (error) {
            console.error("Error reloading player:", error);
            // If token is invalid/expired, log out
            setPlayer(undefined);
            navigate("/login");
        }
    }, [navigate]);

    return (
        <>
            <AuthContext.Provider
                value={{
                    player,
                    login: authLogin,
                    register: authRegister,
                    logout: authLogout,
                    reloadPlayer,
                }}
            >
                {props.children}
            </AuthContext.Provider>
        </>
    );
};

export { AuthContext, AuthContextProvider };
