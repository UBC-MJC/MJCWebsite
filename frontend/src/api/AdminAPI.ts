import axios from "axios";
import { baseUrl, getAuthConfig } from "./APIUtils";
import type { Player, Season, SeasonsAPIDataType, GameVariant } from "@/types";

const getPlayersAdminAPI = async () => {
    return axios.get<{ players: Player[] }>(baseUrl + "/admin/players", getAuthConfig());
};

const deletePlayerAPI = async (playerId: string) => {
    return axios.delete<Player>(baseUrl + "/admin/players/" + playerId, getAuthConfig());
};

const updatePlayerAPI = async (player: Player) => {
    return axios.put<Player>(baseUrl + "/admin/players/" + player.id, { player }, getAuthConfig());
};

const getSeasonsAPI = async () => {
    return axios.get<SeasonsAPIDataType>(baseUrl + "/seasons");
};

const createSeasonAdminAPI = async (season: Partial<Season>) => {
    return axios.post<Season>(baseUrl + "/admin/seasons", { season }, getAuthConfig());
};

const updateSeasonAPI = async (season: Season) => {
    return axios.put<Season>(baseUrl + "/admin/seasons/" + season.id, { season }, getAuthConfig());
};

const makeDummyAdminsAPI = async () => {
    return axios.post<void>(baseUrl + "/admin/makeDummyAdmins", {}, getAuthConfig());
};

const recalcSeasonAPI = async (variant: GameVariant) => {
    return axios.put<void>(baseUrl + "/admin/recalc/" + variant, {}, getAuthConfig());
};

export async function removeQualificationAPI() {
    return axios.put<void>(`${baseUrl}/admin/removeQualification`, {}, getAuthConfig());
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
