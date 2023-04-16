import { FC, ReactNode } from 'react';
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {loginAPICall, registerAPICall} from "../api/AuthAPI";
import {AxiosResponse} from "axios";

type ChildProps = {
    children: ReactNode
};

const notInstantiated = () => {
    return Promise.reject()
}
const AuthContext = createContext<AuthContextType>({authToken: undefined, player: undefined, login: notInstantiated, register: notInstantiated, logout: notInstantiated});

const AuthContextProvider: FC<ChildProps> = (props: ChildProps) => {
    const [authToken, setAuthToken] = useState<string | undefined>(() =>{
        const token = localStorage.getItem("authToken");
        if (token) {
            return token;
        }
        return undefined;
    });
    const [player, setPlayer] = useState(() => {
        const playerProfile = localStorage.getItem("player");
        if (playerProfile) {
            return JSON.parse(playerProfile);
        }
        return undefined;
    });
    const navigate = useNavigate();
    const authLogin = async (loginData: LoginDataType) => {
        const apiResponse: AxiosResponse<PlayerAPIDataType> = await loginAPICall(loginData)
        const playerAPIData: PlayerAPIDataType = apiResponse.data;
        localStorage.setItem("player", JSON.stringify(playerAPIData.player));
        localStorage.setItem("authToken", playerAPIData.authToken);
        setPlayer(playerAPIData.player);
        setAuthToken(playerAPIData.authToken);
        navigate("/");
    };

    const authRegister = async (registerData: RegisterDataType) => {
        const apiResponse: AxiosResponse<PlayerAPIDataType> = await registerAPICall(registerData)
        const playerAPIData: PlayerAPIDataType = apiResponse.data;
        localStorage.setItem("player", JSON.stringify(playerAPIData.player));
        localStorage.setItem("authToken", playerAPIData.authToken);
        setPlayer(playerAPIData.player);
        setAuthToken(playerAPIData.authToken);
        navigate("/");
    }

    const authLogout = async () => {
        localStorage.removeItem("player");
        localStorage.removeItem("authToken");
        setPlayer(undefined);
        setAuthToken(undefined)
        navigate("/login");
    }

    return (
        <>
            <AuthContext.Provider value={{ authToken, player, login: authLogin, register: authRegister, logout: authLogout }}>
                {props.children}
            </AuthContext.Provider>
        </>
    );
};

export { AuthContext, AuthContextProvider };
