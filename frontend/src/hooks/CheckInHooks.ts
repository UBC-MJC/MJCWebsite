import {
    checkInAPI,
    checkOutAPI,
    getCheckedInPlayersAPI,
    getStatusAPI
} from "@/api/CheckInAPI";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCheckedInPlayers() {
    return useQuery({
        queryKey: ["checkedInPlayers"],
        queryFn: async () => {
            const response = await getCheckedInPlayersAPI();
            return response.data.players;
        }
    })
}

export function useCheckInStatus(enabled: boolean) {
    return useQuery({
        queryKey: ["checkInStatus"],
        queryFn: async () => {
            const response = await getStatusAPI();
            return response.data.checkedInAt !== null;
        },
        enabled,
    });
}

export function useCheckInAction() {
    const queryClient = useQueryClient();
    const checkIn = useMutation({
        mutationFn: checkInAPI,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["checkInStatus"],
            });

            queryClient.invalidateQueries({
                queryKey: ["checkedInPlayers"],
            });
        },
    });
    const checkOut = useMutation({
        mutationFn: checkOutAPI,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["checkInStatus"],
            });

            queryClient.invalidateQueries({
                queryKey: ["checkedInPlayers"],
            });
        },
    });

    return {
        checkIn,
        checkOut,
    }
}