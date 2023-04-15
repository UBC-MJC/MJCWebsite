import { FC, ReactNode } from 'react';
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {loginAPICall, registerAPICall} from "../api/AuthAPI";

type ChildProps = {
    children: ReactNode
};

const AuthContext = createContext<any>({});

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
        const apiResponse = await loginAPICall(loginData)
        localStorage.setItem("playerProfile", JSON.stringify(apiResponse.data));
        setPlayer(apiResponse.data.player);
        navigate("/");
    };

    const authRegister = async (registerData: RegisterDataType) => {
        const apiResponse = await registerAPICall(registerData)
        localStorage.setItem("playerProfile", JSON.stringify(apiResponse.data));
        setPlayer(apiResponse.data.player);
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
