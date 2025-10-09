import axios from "axios";
import { baseUrl } from "./APIUtils";
import type { Season, GameType, LeaderboardType } from "@/types";

const getCurrentSeason = async () => {
    return axios.get<Season>(baseUrl + "/seasons/current");
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
        dealInRiichiCount: number;
        riichiCount: number;
        winRiichiCount: number;
        winCount: number;
        winPoint: number;
        totalRounds: number;
    }>(baseUrl + "/players/" + playerId + "/" + gameVariant + "/" + seasonId + "/");
}
export { getCurrentSeason, getPlayerLeaderboard, getUserStatistics };
