import { isAxiosError } from "axios";

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
    if (failureCount >= 1 || !isAxiosError(error) || error.code === "ERR_CANCELED") {
        return false;
    }

    const status = error.response?.status;
    return status === undefined || [408, 429, 500, 502, 503, 504].includes(status);
}
