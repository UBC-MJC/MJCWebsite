import axios from "axios"
import {baseUrl, getAuthConfig} from "./APIUtils";
import {AxiosResponse} from "axios";

const getPlayersAdminAPI = async (authToken: string) => {
    return axios.get(baseUrl + "/admin/players", getAuthConfig(authToken))
}

const deletePlayerAPI = async (authToken: string, playerId: string) => {
    return axios.delete(baseUrl + "/admin/players/" + playerId, getAuthConfig(authToken))
}

const updatePlayerAPI = async (authToken: string, player: Player) => {
    return axios.put(baseUrl + "/admin/players/" + player.id, {player}, getAuthConfig(authToken))
}

const getSeasonsAdminAPI = async (authToken: string) => {
    return axios.get(baseUrl + "/admin/seasons", getAuthConfig(authToken))
}

const createSeasonAdminAPI = async (authToken: string, seasonName: string) => {
    return axios.post(baseUrl + "/admin/seasons", {seasonName}, getAuthConfig(authToken))
}

const makeDummyAdminsAPI = async (authToken: string): Promise<AxiosResponse<void>> => {
    return axios.post(baseUrl + "/admin/makeDummyAdmins", {}, getAuthConfig(authToken))
}

export {getPlayersAdminAPI, deletePlayerAPI, updatePlayerAPI, getSeasonsAdminAPI, createSeasonAdminAPI, makeDummyAdminsAPI}
