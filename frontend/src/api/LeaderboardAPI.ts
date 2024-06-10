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
        baseUrl + "/players/qualified/" + gameType + "/leaderboard/?seasonId=" + seasonId,
    );
};

async function getUserStatistics(playerId: string, gameVariant: string, seasonId: string) {
    return axios.get(baseUrl + "/players/" + playerId + "/" + gameVariant + "/" + seasonId + "/");
}
export { getCurrentSeason, getPlayerLeaderboard, getUserStatistics };
