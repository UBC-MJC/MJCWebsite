import {
    checkInAPI,
    checkOutAPI,
    getCheckedInPlayersAPI,
    getStatusAPI
} from "@/api/CheckInAPI";
import { resetAllCheckInsAPI } from "@/api/AdminAPI";
import { logger } from "@/common/logger";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

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

    const invalidateCheckInQueries = () => {
        queryClient.invalidateQueries({
            queryKey: ["checkInStatus"],
        });
        queryClient.invalidateQueries({
            queryKey: ["checkedInPlayers"],
        });
    };

    const checkIn = useMutation({
        mutationFn: checkInAPI,
        onSuccess: invalidateCheckInQueries,
        onError: (error: AxiosError) => {
            logger.log("Error checking-in player: ", error.response?.data);
        },
    });
    const checkOut = useMutation({
        mutationFn: checkOutAPI,
        onSuccess: invalidateCheckInQueries,
        onError: (error: AxiosError) => {
            logger.log("Error checking-out player: ", error.response?.data);
        },
    });
    const resetCheckIns = useMutation({
        mutationFn: resetAllCheckInsAPI,
        onSuccess: invalidateCheckInQueries,
        onError: (error: AxiosError) => {
            logger.log("Error resetting check-ins: ", error.response?.data);
        },
    });

    return {
        checkIn,
        checkOut,
        resetCheckIns,
    }
}