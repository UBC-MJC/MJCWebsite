import { getGameAPI, getLiveGamesAPI, getPlayerNames } from "@/api/GameAPI";
import { skipToken, useQuery } from "@tanstack/react-query";
import type { GameVariant, GameType } from "@/types";

export function usePlayers(gameVariant: GameVariant, gameType?: GameType) {
    // When gameType === "CASUAL", a list of all players is returned.
    return useQuery({
        queryKey: ["players", gameVariant, gameType],
        queryFn: gameType
            ? async () => {
                  const playerNamesResponse = await getPlayerNames(gameVariant, gameType);
                  return playerNamesResponse.data;
              }
            : skipToken,
    });
}

export function useLiveGames<T extends GameVariant>(gameVariant: T) {
    return useQuery({
        queryKey: ["LiveGames", gameVariant],
        queryFn: async () => {
            const response = await getLiveGamesAPI(gameVariant);
            return response.data;
        },
    });
}

export const gameQueryKey = (gameId: number | undefined, gameVariant: GameVariant | undefined) =>
    ["Game", gameId, gameVariant] as const;

export function useGame<T extends GameVariant>(
    gameId: number | undefined,
    gameVariant: T | undefined,
) {
    return useQuery({
        queryKey: gameQueryKey(gameId, gameVariant),
        queryFn:
            gameId !== undefined && gameVariant
                ? async () => {
                      const response = await getGameAPI(gameId, gameVariant);
                      return response.data;
                  }
                : skipToken,
    });
}
