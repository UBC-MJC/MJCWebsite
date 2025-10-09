import { getGameAPI, getLiveGamesAPI, getPlayerNames } from "@/api/GameAPI";
import { useQuery } from "@tanstack/react-query";
import type { GameVariant, GameType } from "@/types";

export function usePlayers(gameVariant: GameVariant, gameType: GameType) {
    // When gameType === "CASUAL", a list of all players is returned.
    return useQuery({
        queryKey: ["players", gameVariant, gameType],
        queryFn: async () => {
            const playerNamesResponse = await getPlayerNames(gameVariant, gameType);
            return playerNamesResponse.data;
        },
    });
}

export function useLiveGames(gameVariant: GameVariant) {
    return useQuery({
        queryKey: ["LiveGames", gameVariant],
        queryFn: async () => {
            const response = await getLiveGamesAPI(gameVariant);
            return response.data;
        },
    });
}

export function useGame(gameId: number, gameVariant: GameVariant) {
    return useQuery({
        queryKey: ["Game", gameId, gameVariant],
        queryFn: async () => {
            const response = await getGameAPI(gameId, gameVariant);
            return response.data;
        },
    });
} // TODO: extract this out
