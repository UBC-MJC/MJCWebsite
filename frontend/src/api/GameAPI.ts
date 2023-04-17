import axios, {AxiosResponse} from "axios"
import {baseUrl} from "./APIUtils";

const getPlayerNames = async (gameType: string): Promise<AxiosResponse<{playerNames: string[]}>> => {
    return axios.get(baseUrl + "/players/gametype/" + gameType)
}

export {getPlayerNames}
