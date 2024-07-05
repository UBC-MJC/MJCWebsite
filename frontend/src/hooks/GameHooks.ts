import { getGameAPI, getLiveGamesAPI, getPlayerNames } from "../api/GameAPI";
import { useQuery } from "@tanstack/react-query";

export function usePlayers(gameVariant: GameVariant) {
    return useQuery({
        queryKey: ["players", "gameVariant", gameVariant],
        queryFn: async () => {
            const playerNamesResponse = await getPlayerNames(gameVariant);
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
