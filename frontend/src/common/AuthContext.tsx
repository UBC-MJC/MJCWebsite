import { FC, ReactNode, useEffect, useCallback } from "react";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAPICall, registerAPICall } from "../api/AuthAPI";
import { getCurrentPlayer } from "../api/AccountAPI";

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
    const [player, setPlayer] = useState(() => {
        const playerProfile = localStorage.getItem("player");
        if (playerProfile) {
            return JSON.parse(playerProfile);
        }
        return undefined;
    });

    useEffect(() => {
        if (typeof player !== "undefined") {
            getCurrentPlayer(player.authToken).then((newPlayer) => {
                localStorage.setItem("player", JSON.stringify(newPlayer.data.player));
                setPlayer(newPlayer.data.player);
            });
        }
    }, []);

    const authLogin = useCallback(async (loginData: LoginDataType) => {
        const apiResponse = await loginAPICall(loginData);
        const playerAPIData = apiResponse.data;
        localStorage.setItem("player", JSON.stringify(playerAPIData.player));
        setPlayer(playerAPIData.player);
        navigate("/");
    }, [navigate]);

    const authRegister = useCallback(async (registerData: RegisterDataType) => {
        const apiResponse = await registerAPICall(registerData);
        const playerAPIData = apiResponse.data;
        localStorage.setItem("player", JSON.stringify(playerAPIData.player));
        setPlayer(playerAPIData.player);
        navigate("/");
    }, [navigate]);

    const authLogout = useCallback(async () => {
        localStorage.removeItem("player");
        setPlayer(undefined);
        navigate("/login");
    }, [navigate]);

    const reloadPlayer = useCallback(async () => {
        if (typeof player === "undefined") {
            console.log("Error: Player not logged in");
            return;
        }

        const newPlayer = await getCurrentPlayer(player.authToken);
        localStorage.setItem("player", JSON.stringify(newPlayer.data.player));
        setPlayer(newPlayer.data.player);
    }, [player]);

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
