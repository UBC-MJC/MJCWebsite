import axios, {AxiosResponse} from "axios"
import {baseUrl} from "./APIUtils";

export const getGames = async (): Promise<AxiosResponse<ApiDataType>> => {
    return axios.get(baseUrl + "/games")
}

export const addGame = async (): Promise<AxiosResponse<ApiDataType>> => {
    return axios.post(baseUrl + "/add-game")
}
