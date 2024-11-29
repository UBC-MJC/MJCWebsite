import axios from "axios";
import { baseUrl } from "./APIUtils";

const getCurrentSeasons = async () => {
    return axios.get<Season[]>(baseUrl + "/seasons/current");
};

const getPlayerLeaderboard = async (gameVariant: string, gameType: GameType, seasonId: string) => {
    return axios.get<{ players: LeaderboardType[] }>(
        `${baseUrl}/players/qualified/${gameVariant}/${gameType}/leaderboard/?seasonId=${seasonId}`,
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
export { getCurrentSeasons, getPlayerLeaderboard, getUserStatistics };
