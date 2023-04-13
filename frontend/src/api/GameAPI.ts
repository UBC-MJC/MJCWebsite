import axios, {AxiosResponse} from "axios"
import {baseUrl, resolveResponse} from "./APIUtils";

export const getGames = async (): Promise<AxiosResponse<ApiDataType>> => {
    return resolveResponse(axios.get(baseUrl + "/games"))
}

export const addGame = async (): Promise<AxiosResponse<ApiDataType>> => {
    return resolveResponse(axios.post(baseUrl + "/add-game"))
}
