import axios, { AxiosResponse } from "axios";
import { baseUrl } from "./APIUtils";

const getCurrentSeason = async (): Promise<AxiosResponse<Season>> => {
    return axios.get(baseUrl + "/seasons/current");
};

const getPlayerLeaderboard = async (
    gameType: string,
    seasonId: string,
): Promise<AxiosResponse<{ players: LeaderboardType[] }>> => {
    return axios.get(
        baseUrl + "/players/gametype/" + gameType + "/leaderboard/?seasonId=" + seasonId,
    );
};

export { getCurrentSeason, getPlayerLeaderboard };
