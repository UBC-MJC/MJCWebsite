import axios, { AxiosResponse } from "axios";
import { baseUrl } from "./APIUtils";

const getCurrentSeason = async (): Promise<AxiosResponse<Season>> => {
    return axios.get(baseUrl + "/seasons/current");
};

const getPlayerLeaderboard = async (
    gameVariant: string,
    seasonId: string,
): Promise<AxiosResponse<{ players: LeaderboardType[] }>> => {
    return axios.get(
        baseUrl + "/players/qualified/" + gameVariant + "/leaderboard/?seasonId=" + seasonId,
    );
};

async function getUserStatistics(playerId: string, gameVariant: string, seasonId: string) {
    return axios.get<{
        dealInCount: number;
        dealInPoint: number;
        winCount: number;
        winPoint: number;
        totalRounds: number;
    }>(baseUrl + "/players/" + playerId + "/" + gameVariant + "/" + seasonId + "/");
}
export { getCurrentSeason, getPlayerLeaderboard, getUserStatistics };
