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
const AuthContext = createContext<AuthContextType>({player: undefined, login: notInstantiated, register: notInstantiated, logout: notInstantiated});

const AuthContextProvider: FC<ChildProps> = (props: ChildProps) => {
    const [player, setPlayer] = useState(() => {
        let playerProfile = localStorage.getItem("playerProfile");
        if (playerProfile) {
            return JSON.parse(playerProfile);
        }
        return undefined;
    });
    const navigate = useNavigate();
    const authLogin = async (loginData: LoginDataType) => {
        const apiResponse: AxiosResponse<PlayerAPIDataType> = await loginAPICall(loginData)
        const playerAPIData: PlayerAPIDataType = apiResponse.data;
        localStorage.setItem("playerProfile", JSON.stringify(playerAPIData));
        setPlayer(playerAPIData.player);
        navigate("/");
    };

    const authRegister = async (registerData: RegisterDataType) => {
        const apiResponse: AxiosResponse<PlayerAPIDataType> = await registerAPICall(registerData)
        const playerAPIData: PlayerAPIDataType = apiResponse.data;
        localStorage.setItem("playerProfile", JSON.stringify(playerAPIData));
        setPlayer(playerAPIData.player);
        navigate("/");
    }

    const authLogout = async () => {
        localStorage.removeItem("playerProfile");
        setPlayer(undefined);
        navigate("/login");
    }

    return (
        <>
            <AuthContext.Provider value={{ player, login: authLogin, register: authRegister, logout: authLogout }}>
                {props.children}
            </AuthContext.Provider>
        </>
    );
};

export { AuthContext, AuthContextProvider };
