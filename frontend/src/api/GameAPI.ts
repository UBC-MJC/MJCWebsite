import axios, { AxiosResponse } from "axios";
import { baseUrl, getAuthConfig } from "./APIUtils";

const getPlayerNames = async (
    gameType: string,
): Promise<AxiosResponse<{ playerNames: string[] }>> => {
    return axios.get(baseUrl + "/players/gametype/" + gameType + "/names");
};

const createGameAPI = async (
    authToken: string,
    gameType: GameType,
    gameVariant: GameVariant,
    players: string[],
): Promise<AxiosResponse> => {
    return axios.post(
        baseUrl + `/games/${gameVariant}`,
        {
            gameType,
            players,
        },
        getAuthConfig(authToken),
    );
};

const getGameAPI = async (
    gameId: number,
    gameVariant: GameVariant,
): Promise<AxiosResponse<Game>> => {
    return axios.get(baseUrl + `/games/${gameVariant}/${gameId}`);
};

const deleteGameAPI = async (
    authToken: string,
    gameId: number,
    gameVariant: GameVariant,
): Promise<AxiosResponse> => {
    return axios.delete(baseUrl + `/games/${gameVariant}/${gameId}`, getAuthConfig(authToken));
};

const submitGameAPI = async (
    authToken: string,
    gameId: number,
    gameVariant: GameVariant,
): Promise<AxiosResponse> => {
    return axios.post(baseUrl + `/games/${gameVariant}/${gameId}`, {}, getAuthConfig(authToken));
};

const addRoundAPI = async (
    authToken: string,
    gameId: number,
    gameVariant: GameVariant,
    round: any,
): Promise<AxiosResponse> => {
    return axios.post(
        baseUrl + `/games/${gameVariant}/${gameId}/rounds`,
        {
            roundRequest: round,
        },
        getAuthConfig(authToken),
    );
};

const deleteRoundAPI = async (
    authToken: string,
    gameId: number,
    gameVariant: GameVariant,
): Promise<AxiosResponse> => {
    return axios.delete(
        baseUrl + `/games/${gameVariant}/${gameId}/rounds`,
        getAuthConfig(authToken),
    );
};

export {
    getPlayerNames,
    createGameAPI,
    getGameAPI,
    deleteGameAPI,
    submitGameAPI,
    addRoundAPI,
    deleteRoundAPI,
};
