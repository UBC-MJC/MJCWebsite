import axios from "axios";
import { baseUrl, getAuthConfig } from "./APIUtils";

const getPlayerNames = async (gameVariant: string, gameType: GameType) => {
    return axios.get<PlayerNamesDataType[]>(
        `${baseUrl}/players/qualified/${gameVariant}/${gameType}/names`,
    );
};

const createGameAPI = async (
    authToken: string,
    gameType: GameType,
    gameVariant: GameVariant,
    players: string[],
) => {
    return axios.post<{ id: string }>(
        baseUrl + `/games/${gameVariant}`,
        {
            gameType,
            players,
        },
        getAuthConfig(authToken),
    );
};

const getGameAPI = async (gameId: number, gameVariant: GameVariant) => {
    return axios.get<Game>(baseUrl + `/games/${gameVariant}/${gameId}`);
};

const getGamesAPI = async (gameVariant: GameVariant, seasonId: string, playerIds: string[]) => {
    return axios.get<Game[]>(baseUrl + `/games/${gameVariant}`, {
        params: {
            seasonId: seasonId,
            playerIds: playerIds.join(","),
        },
    });
};

const getLiveGamesAPI = async (gameVariant: GameVariant) => {
    return axios.get<Game[]>(baseUrl + `/games/${gameVariant}/live`);
};

const deleteGameAPI = async (authToken: string, gameId: number, gameVariant: GameVariant) => {
    return axios.delete<void>(
        baseUrl + `/games/${gameVariant}/${gameId}`,
        getAuthConfig(authToken),
    );
};

const submitGameAPI = async (authToken: string, gameId: number, gameVariant: GameVariant) => {
    return axios.post<void>(
        baseUrl + `/games/${gameVariant}/${gameId}`,
        {},
        getAuthConfig(authToken),
    );
};

const addRoundAPI = async (
    authToken: string,
    gameId: number,
    gameVariant: GameVariant,
    round: any,
) => {
    return axios.post<Game>(
        baseUrl + `/games/${gameVariant}/${gameId}/rounds`,
        {
            roundRequest: round,
        },
        getAuthConfig(authToken),
    );
};

const deleteRoundAPI = async (authToken: string, gameId: number, gameVariant: GameVariant) => {
    return axios.delete<Game>(
        baseUrl + `/games/${gameVariant}/${gameId}/rounds`,
        getAuthConfig(authToken),
    );
};

const setChomboAPI = async (
    authToken: string,
    gameId: number,
    gameVariant: GameVariant,
    playerId: string,
    chomboCount: number,
) => {
    return axios.post<{ count: number }>(
        baseUrl + `/games/${gameVariant}/${gameId}/chombo`,
        {
            playerId: playerId,
            chomboCount: chomboCount,
        },
        getAuthConfig(authToken),
    );
};
export {
    getPlayerNames,
    createGameAPI,
    getGameAPI,
    getLiveGamesAPI,
    getGamesAPI,
    deleteGameAPI,
    submitGameAPI,
    addRoundAPI,
    deleteRoundAPI,
    setChomboAPI,
};
