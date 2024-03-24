import axios, { AxiosResponse } from "axios";
import { baseUrl, getAuthConfig } from "./APIUtils";

const getPlayersAdminAPI = async (authToken: string) => {
    return axios.get(baseUrl + "/admin/players", getAuthConfig(authToken));
};

const deletePlayerAPI = async (
    authToken: string,
    playerId: string,
): Promise<AxiosResponse<Player>> => {
    return axios.delete(baseUrl + "/admin/players/" + playerId, getAuthConfig(authToken));
};

const updatePlayerAPI = async (
    authToken: string,
    player: Player,
): Promise<AxiosResponse<Player>> => {
    return axios.put(baseUrl + "/admin/players/" + player.id, { player }, getAuthConfig(authToken));
};

const getSeasonsAPI = async (): Promise<AxiosResponse<SeasonsAPIDataType>> => {
    return axios.get(baseUrl + "/seasons");
};

const createSeasonAdminAPI = async (
    authToken: string,
    season: Partial<Season>,
): Promise<AxiosResponse<Season>> => {
    return axios.post(baseUrl + "/admin/seasons", { season }, getAuthConfig(authToken));
};

const updateSeasonAPI = async (
    authToken: string,
    season: Season,
): Promise<AxiosResponse<Season>> => {
    return axios.put(baseUrl + "/admin/seasons/" + season.id, { season }, getAuthConfig(authToken));
};

const makeDummyAdminsAPI = async (authToken: string): Promise<AxiosResponse<void>> => {
    return axios.post(baseUrl + "/admin/makeDummyAdmins", {}, getAuthConfig(authToken));
};

const recalcSeasonAPI = async (
    authToken: string,
    variant: GameVariant,
): Promise<AxiosResponse<void>> => {
    return axios.put(baseUrl + "/admin/recalc/" + variant, {}, getAuthConfig(authToken));
};
export {
    getPlayersAdminAPI,
    deletePlayerAPI,
    updatePlayerAPI,
    getSeasonsAPI,
    createSeasonAdminAPI,
    updateSeasonAPI,
    makeDummyAdminsAPI,
    recalcSeasonAPI,
};
