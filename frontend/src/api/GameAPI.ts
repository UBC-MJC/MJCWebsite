import axios, {AxiosResponse} from "axios"
import {baseUrl, getAuthConfig} from "./APIUtils";

const getPlayerNames = async (gameType: string): Promise<AxiosResponse<{playerNames: string[]}>> => {
    return axios.get(baseUrl + "/players/gametype/" + gameType)
}

const createGameAPI = async (authToken: string, gameType: GameType, gameVariant: GameVariant, players: string[]): Promise<AxiosResponse> => {
    return axios.post(baseUrl + "/games", {
        gameType,
        gameVariant,
        players
    }, getAuthConfig(authToken))
}

const getGameAPI = async (gameId: number): Promise<AxiosResponse<Game>> => {
    return axios.get(baseUrl + "/games/" + gameId)
}

export {getPlayerNames, createGameAPI, getGameAPI}
