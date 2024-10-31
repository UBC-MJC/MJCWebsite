import axios from "axios";
import { baseUrl, getAuthConfig } from "./APIUtils";

const getCurrentPlayer = (authToken: string) => {
    return axios.get<PlayerAPIDataType>(baseUrl + "/players/current", getAuthConfig(authToken));
};

const submitRequestPasswordResetAPI = async (username: string) => {
    return axios.post<ResetPasswordDataType>(baseUrl + "/request-password-reset", { username });
};

const submitPasswordResetAPI = async (playerId: string, token: string, newPassword: string) => {
    return axios.post(baseUrl + "/password-reset", { playerId, token, newPassword });
};

const updateSettingsAPI = async (authToken: string, settings: Setting) => {
    return axios.put(baseUrl + "/players/current/settings", { settings }, getAuthConfig(authToken));
};

const updateUsernameAPI = async (authToken: string, username: string) => {
    return axios.put(baseUrl + "/players/current/username", { username }, getAuthConfig(authToken));
};

export {
    getCurrentPlayer,
    submitRequestPasswordResetAPI,
    submitPasswordResetAPI,
    updateSettingsAPI,
    updateUsernameAPI,
};
