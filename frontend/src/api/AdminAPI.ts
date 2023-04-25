import axios from "axios"
import {baseUrl, getAuthConfig} from "./APIUtils";
import {AxiosResponse} from "axios";

const getPlayersAdmin = async (authToken: string) => {
    return axios.get(baseUrl + "/admin/players", getAuthConfig(authToken))
}

const getSeasonsAdmin = async (authToken: string) => {
    return axios.get(baseUrl + "/admin/seasons", getAuthConfig(authToken))
}

const createSeasonAdmin = async (authToken: string, seasonName: string) => {
    return axios.post(baseUrl + "/admin/seasons", {seasonName}, getAuthConfig(authToken))
}

const makeDummyAdmins = async (authToken: string): Promise<AxiosResponse<void>> => {
    return axios.post(baseUrl + "/admin/makeDummyAdmins", {}, getAuthConfig(authToken))
}

export {getPlayersAdmin, getSeasonsAdmin, createSeasonAdmin, makeDummyAdmins}
