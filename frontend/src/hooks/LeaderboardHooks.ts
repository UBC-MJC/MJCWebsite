import { skipToken, useQuery } from "@tanstack/react-query";
import { getPlayerLeaderboard, getUserStatistics } from "../api/LeaderboardAPI";
import { mapLeaderboardToOneDecimal } from "../game/common/constants";
import type { GameVariant, GameType, Season } from "../types";

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
        queryFn:
            season && playerId
                ? async () => {
                      const statsResponse = await getUserStatistics(
                          playerId,
                          gameVariant,
                          season.id,
                      );
                      return statsResponse.data;
                  }
                : skipToken,
    });
}
