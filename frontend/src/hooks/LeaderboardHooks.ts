import { skipToken, useQuery } from "@tanstack/react-query";
import { getPlayerLeaderboard, getUserStatistics } from "../api/LeaderboardAPI";
import { mapLeaderboardToOneDecimal } from "../game/common/constants";

export function usePlayerLeaderboard(
    gameVariant: GameVariant,
    gameType: GameType,
    season: Season | undefined,
) {
    return useQuery({
        queryKey: ["playerLeaderboard", gameVariant, gameType, season],
        queryFn: season
            ? async () => {
                  const response = await getPlayerLeaderboard(gameVariant, gameType, season.id);
                  return mapLeaderboardToOneDecimal(response.data.players);
              }
            : skipToken,
    });
}

export function useStatistics(
    playerId: string | undefined,
    gameVariant: GameVariant,
    season: Season | undefined,
) {
    return useQuery({
        queryKey: ["Statistics", playerId, gameVariant, season],
        queryFn: season
            ? async () => {
                  if (playerId === undefined) {
                      return {
                          dealInCount: 0,
                          dealInPoint: 0,
                          totalRounds: 0,
                          winCount: 0,
                          winPoint: 0,
                      };
                  }
                  const statsResponse = await getUserStatistics(playerId, gameVariant, season.id);
                  return statsResponse.data;
              }
            : skipToken,
    });
}
