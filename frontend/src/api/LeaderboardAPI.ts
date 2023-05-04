import axios, {AxiosResponse} from "axios"
import {baseUrl} from "./APIUtils";

const getPlayerLeaderboard = async (gameType: string): Promise<AxiosResponse<{players: LeaderboardType[]}>> => {
    return axios.get(baseUrl + "/players/gametype/" + gameType + "/leaderboard")
}

export {getPlayerLeaderboard}
