import axios from "axios";
import { baseUrl, getAuthConfig } from "./APIUtils";

const getCurrentPlayer = () => {
    return axios.get<PlayerAPIDataType>(baseUrl + "/players/current", getAuthConfig());
};

const submitRequestPasswordResetAPI = async (username: string) => {
    return axios.post<ResetPasswordDataType>(baseUrl + "/request-password-reset", { username });
};

const submitPasswordResetAPI = async (playerId: string, token: string, newPassword: string) => {
    return axios.post(baseUrl + "/password-reset", { playerId, token, newPassword });
};

const updateSettingsAPI = async (settings: Setting) => {
    return axios.put(baseUrl + "/players/current/settings", { settings }, getAuthConfig());
};

const updateUsernameAPI = async (username: string) => {
    return axios.put(baseUrl + "/players/current/username", { username }, getAuthConfig());
};

export {
    getCurrentPlayer,
    submitRequestPasswordResetAPI,
    submitPasswordResetAPI,
    updateSettingsAPI,
    updateUsernameAPI,
};
