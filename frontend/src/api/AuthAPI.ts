import axios from "axios";
import { baseUrl } from "./APIUtils";
import type { LoginDataType, RegisterDataType, PlayerAPIDataType } from "../types";

const loginAPICall = (loginData: LoginDataType) => {
    return axios.post<PlayerAPIDataType>(baseUrl + "/login", loginData, {
        withCredentials: true,
    });
};

const registerAPICall = (registerData: RegisterDataType) => {
    return axios.post<PlayerAPIDataType>(baseUrl + "/register", registerData, {
        withCredentials: true,
    });
};

export { loginAPICall, registerAPICall };
