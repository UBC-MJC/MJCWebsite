import { FC, ReactNode } from "react";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAPICall, registerAPICall } from "../api/AuthAPI";
import { AxiosResponse } from "axios";
import { getCurrentPlayer } from "../api/AccountAPI";

type ChildProps = {
    children: ReactNode;
};

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

    const authLogin = async (loginData: LoginDataType) => {
        const apiResponse: AxiosResponse<PlayerAPIDataType> = await loginAPICall(loginData);
        const playerAPIData: PlayerAPIDataType = apiResponse.data;
        localStorage.setItem("player", JSON.stringify(playerAPIData.player));
        setPlayer(playerAPIData.player);
        navigate("/");
    };

    const authRegister = async (registerData: RegisterDataType) => {
        const apiResponse: AxiosResponse<PlayerAPIDataType> = await registerAPICall(registerData);
        const playerAPIData: PlayerAPIDataType = apiResponse.data;
        localStorage.setItem("player", JSON.stringify(playerAPIData.player));
        setPlayer(playerAPIData.player);
        navigate("/");
    };

    const authLogout = async () => {
        localStorage.removeItem("player");
        setPlayer(undefined);
        navigate("/login");
    };

    const reloadPlayer = async () => {
        if (typeof player === "undefined") {
            console.log("Error: Player not logged in");
            return;
        }

        const newPlayer = await getCurrentPlayer(player.authToken);
        localStorage.setItem("player", JSON.stringify(newPlayer.data.player));
        setPlayer(newPlayer.data.player);
    };

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
