import axios, { AxiosResponse } from "axios";
import { baseUrl, getAuthConfig } from "./APIUtils";

const getCurrentPlayer = (authToken: string): Promise<AxiosResponse<PlayerAPIDataType>> => {
    return axios.get(baseUrl + "/players/current", getAuthConfig(authToken));
};

const updateSettingsAPI = async (authToken: string, settings: Setting): Promise<AxiosResponse> => {
    return axios.put(baseUrl + "/players/current/settings", { settings }, getAuthConfig(authToken));
};

export { getCurrentPlayer, updateSettingsAPI };
