import axios from "axios";
import { baseUrl, getAuthConfig } from "./APIUtils";

const getPlayerNames = async (gameVariant: string, gameType: GameType) => {
    return axios.get<PlayerNamesDataType[]>(
        `${baseUrl}/players/qualified/${gameVariant}/${gameType}/names`,
    );
};

const createGameAPI = async (
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
        getAuthConfig(),
    );
};

const getGameAPI = async <T extends GameVariant>(gameId: number, gameVariant: GameVariant) => {
    return axios.get<Game<T>>(baseUrl + `/games/${gameVariant}/${gameId}`);
};

const getGamesAPI = async <T extends GameVariant>(
    gameVariant: GameVariant,
    seasonId: string,
    playerIds: string[],
) => {
    return axios.get<Game<T>[]>(baseUrl + `/games/${gameVariant}`, {
        params: {
            seasonId: seasonId,
            playerIds: playerIds.join(","),
        },
    });
};

const getLiveGamesAPI = async <T extends GameVariant>(gameVariant: GameVariant) => {
    return axios.get<Game<T>[]>(baseUrl + `/games/${gameVariant}/live`);
};

const deleteGameAPI = async (gameId: number, gameVariant: GameVariant) => {
    return axios.delete<void>(
        baseUrl + `/games/${gameVariant}/${gameId}`,
        getAuthConfig(),
    );
};

const submitGameAPI = async (gameId: number, gameVariant: GameVariant) => {
    return axios.post<void>(
        baseUrl + `/games/${gameVariant}/${gameId}`,
        {},
        getAuthConfig(),
    );
};

const addRoundAPI = async <T extends GameVariant>(
    gameId: number,
    gameVariant: GameVariant,
    round: RoundByVariant<T>,
) => {
    return axios.post<Game<T>>(
        baseUrl + `/games/${gameVariant}/${gameId}/rounds`,
        {
            roundRequest: round,
        },
        getAuthConfig(),
    );
};

const deleteRoundAPI = async <T extends GameVariant>(
    gameId: number,
    gameVariant: GameVariant,
) => {
    return axios.delete<Game<T>>(
        baseUrl + `/games/${gameVariant}/${gameId}/rounds`,
        getAuthConfig(),
    );
};

const setChomboAPI = async (
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
        getAuthConfig(),
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
