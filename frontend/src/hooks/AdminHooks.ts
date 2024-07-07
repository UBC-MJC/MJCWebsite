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

const seasonsKey = ["seasons"];

export function useSeasons(setSeason: (season: Season) => void = () => null) {
    return useQuery({
        queryKey: seasonsKey,
        queryFn: async () => {
            const seasonsResponse = await getSeasonsAPI();
            const seasons = seasonsResponse.data;
            if (seasons.length > 0 && new Date(seasons[0].endDate) > new Date()) {
                setSeason(seasons[0]);
            }
            return seasons;
        },
    });
}

export function createSeasonMutation(player: Player) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (createSeasonRequest: Partial<Season>) =>
            createSeasonAdminAPI(player.authToken, createSeasonRequest),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: seasonsKey }); // TODO: return the updated seasons
        },
        onError: (error: AxiosError) => {
            console.log("Error creating season: ", error.response?.data);
        },
    });
}

export function updateSeasonMutation(player: Player) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (updatedSeason: Season) => updateSeasonAPI(player.authToken, updatedSeason),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: seasonsKey }); // TODO: return the updated seasons
        },
        onError: (error: AxiosError) => {
            console.log("Error updating season: ", error.response?.data);
        },
    });
}

export function saveSeasonMutation(player: Player) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (editedSeason: Season) => updateSeasonAPI(player.authToken, editedSeason),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: seasonsKey }); // TODO: return the updated seasons
        },
        onError: (error: AxiosError) => {
            console.log("Error updating season: ", error.response?.data);
        },
    });
}

const adminPlayersKey = ["adminPlayers"];

export function useAdminPlayers(adminPlayer: Player) {
    return useQuery({
        queryKey: adminPlayersKey,
        queryFn: async () => {
            const response = await getPlayersAdminAPI(adminPlayer.authToken);
            return response.data.players;
        },
    });
}

export function deletePlayerMutation(player: Player) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (playerId: string) => deletePlayerAPI(player.authToken, playerId),
        onSuccess: async (response) => {
            await queryClient.invalidateQueries({ queryKey: adminPlayersKey });
        },
        onError: (error: AxiosError) => {
            console.log("Error deleting player: ", error.response?.data);
        },
    });
}

export function savePlayerMutation(player: Player) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (editedPlayer: Player) => updatePlayerAPI(player.authToken, editedPlayer),
        onSuccess: async (response) => {
            await queryClient.invalidateQueries({ queryKey: adminPlayersKey });
        },
        onError: (error: AxiosError) => {
            console.log("Error updating player: ", error.response?.data);
        },
    });
}
