import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createSeasonAdminAPI,
    deletePlayerAPI,
    getPlayersAdminAPI,
    getSeasonsAPI,
    updatePlayerAPI,
    updateSeasonAPI,
} from "../api/AdminAPI";
import { AxiosError } from "axios";
import type { Season, Player } from "../types";

const seasonsKey = ["seasons"];

export function useSeasons(setSeason: (season: Season) => void = () => null) {
    return useQuery({
        queryKey: seasonsKey,
        queryFn: async () => {
            const seasonsResponse = await getSeasonsAPI();
            const seasons = seasonsResponse.data.map((season) => ({
                ...season,
                startDate: new Date(season.startDate),
                endDate: new Date(season.endDate),
            }));
            seasons.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
            // Set the first season as the current season if it has not ended
            if (seasons.length > 0 && seasons[0].endDate > new Date()) {
                setSeason(seasons[0]);
            }
            return seasons;
        },
    });
}

export function useCreateSeasonMutation(player?: Player) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (createSeasonRequest: Omit<Season, "id">) => {
            if (!player) throw new Error("No player authenticated");
            return createSeasonAdminAPI(createSeasonRequest);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: seasonsKey }); // TODO: return the updated seasons
        },
        onError: (error: AxiosError) => {
            console.log("Error creating season: ", error.response?.data);
        },
    });
}

export function useUpdateSeasonMutation(player?: Player) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (updatedSeason: Season) => {
            if (!player) throw new Error("No player authenticated");
            return updateSeasonAPI(updatedSeason);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: seasonsKey }); // TODO: return the updated seasons
        },
        onError: (error: AxiosError) => {
            console.log("Error updating season: ", error.response?.data);
        },
    });
}

const adminPlayersKey = ["adminPlayers"];

export function useAdminPlayers(adminPlayer?: Player) {
    return useQuery({
        queryKey: adminPlayersKey,
        queryFn: async () => {
            if (!adminPlayer) throw new Error("No player authenticated");
            const response = await getPlayersAdminAPI();
            return response.data.players;
        },
        enabled: !!adminPlayer,
    });
}

export function useDeletePlayerMutation(player?: Player) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (playerId: string) => {
            if (!player) throw new Error("No player authenticated");
            return deletePlayerAPI(playerId);
        },
        onSuccess: async (_response) => {
            await queryClient.invalidateQueries({ queryKey: adminPlayersKey });
        },
        onError: (error: AxiosError) => {
            console.log("Error deleting player: ", error.response?.data);
        },
    });
}

export function useSavePlayerMutation(player?: Player) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (editedPlayer: Player) => {
            if (!player) throw new Error("No player authenticated");
            return updatePlayerAPI(editedPlayer);
        },
        onSuccess: async (_response) => {
            await queryClient.invalidateQueries({ queryKey: adminPlayersKey });
        },
        onError: (error: AxiosError) => {
            console.log("Error updating player: ", error.response?.data);
        },
    });
}
