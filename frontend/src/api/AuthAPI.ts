import axios from "axios"
import {baseUrl} from "./APIUtils";

const loginAPICall = (loginData: LoginDataType) => {
    return axios.post(baseUrl + "/login", loginData, {
        withCredentials: true,
    });
}

const registerAPICall = (registerData: RegisterDataType) => {
    return axios.post(baseUrl + "/register", registerData, {
        withCredentials: true,
    });
}

const logoutAPICall = () => {
    return axios.post(baseUrl + "/logout", {
        withCredentials: true,
    });
}

export {loginAPICall, registerAPICall, logoutAPICall}
