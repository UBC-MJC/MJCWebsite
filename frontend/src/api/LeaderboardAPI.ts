import axios from "axios";
import { baseUrl } from "./APIUtils";
import type { LeaderboardType } from "@/types";

const getPlayerLeaderboard = async (gameVariant: string, seasonId: string) => {
    return axios.get<{ players: LeaderboardType[] }>(
        `${baseUrl}/players/qualified/${gameVariant}/leaderboard?seasonId=${seasonId}`,
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

async function getPlacementHistory(playerId: string, gameVariant: string, seasonId: string) {
    return axios.get<
        {
            gameId: number;
            createdAt: string;
            placement: 1 | 2 | 3 | 4;
            score: number;
            scores: number[];
        }[]
    >(baseUrl + "/players/" + playerId + "/" + gameVariant + "/" + seasonId + "/placement-history");
}

export { getPlayerLeaderboard, getUserStatistics, getPlacementHistory };
