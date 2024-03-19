import axios, { AxiosResponse } from "axios";
import { baseUrl, getAuthConfig } from "./APIUtils";

const getCurrentPlayer = (authToken: string): Promise<AxiosResponse<PlayerAPIDataType>> => {
    return axios.get(baseUrl + "/players/current", getAuthConfig(authToken));
};

const submitRequestPasswordResetAPI = async (
    username: string,
): Promise<AxiosResponse<ResetPasswordDataType>> => {
    return axios.post(baseUrl + "/request-password-reset", { username });
};

const submitPasswordResetAPI = async (
    playerId: string,
    token: string,
    newPassword: string,
): Promise<AxiosResponse> => {
    return axios.post(baseUrl + "/password-reset", { playerId, token, newPassword });
};

const updateSettingsAPI = async (authToken: string, settings: Setting): Promise<AxiosResponse> => {
    return axios.put(baseUrl + "/players/current/settings", { settings }, getAuthConfig(authToken));
};

export {
    getCurrentPlayer,
    submitRequestPasswordResetAPI,
    submitPasswordResetAPI,
    updateSettingsAPI,
};
