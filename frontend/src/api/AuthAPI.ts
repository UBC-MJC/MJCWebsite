import axios from "axios";
import { baseUrl } from "./APIUtils";

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
