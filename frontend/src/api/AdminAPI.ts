import axios from "axios"
import {baseUrl, getAuthConfig} from "./APIUtils";
import {AxiosResponse} from "axios/index";

const getPlayersAdmin = async (authToken: string) => {
    return axios.get(baseUrl + "/admin/players", getAuthConfig(authToken))
}

const makeDummyAdmins = async (authToken: string): Promise<AxiosResponse<void>> => {
    return axios.post(baseUrl + "/admin/makeDummyAdmins", {}, getAuthConfig(authToken))
}

export {getPlayersAdmin, makeDummyAdmins}
