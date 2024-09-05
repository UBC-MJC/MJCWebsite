import axios from "axios";
import { baseUrl, getAuthConfig } from "./APIUtils";

const getPlayersAdminAPI = async (authToken: string) => {
    return axios.get<{ players: Player[] }>(baseUrl + "/admin/players", getAuthConfig(authToken));
};

const deletePlayerAPI = async (authToken: string, playerId: string) => {
    return axios.delete<Player>(baseUrl + "/admin/players/" + playerId, getAuthConfig(authToken));
};

const updatePlayerAPI = async (authToken: string, player: Player) => {
    return axios.put<Player>(
        baseUrl + "/admin/players/" + player.id,
        { player },
        getAuthConfig(authToken),
    );
};

const getSeasonsAPI = async () => {
    return axios.get<SeasonsAPIDataType>(baseUrl + "/seasons");
};

const createSeasonAdminAPI = async (authToken: string, season: Partial<Season>) => {
    return axios.post<Season>(baseUrl + "/admin/seasons", { season }, getAuthConfig(authToken));
};

const updateSeasonAPI = async (authToken: string, season: Season) => {
    return axios.put<Season>(
        baseUrl + "/admin/seasons/" + season.id,
        { season },
        getAuthConfig(authToken),
    );
};

const makeDummyAdminsAPI = async (authToken: string) => {
    return axios.post<void>(baseUrl + "/admin/makeDummyAdmins", {}, getAuthConfig(authToken));
};

const recalcSeasonAPI = async (authToken: string, variant: GameVariant) => {
    return axios.put<void>(baseUrl + "/admin/recalc/" + variant, {}, getAuthConfig(authToken));
};

export async function removeQualificationAPI(authToken: string) {
    return axios.put<void>(`${baseUrl}/admin/removeQualification`, {}, getAuthConfig(authToken));
}

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
