import { isAxiosError } from "axios";

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
    if (failureCount >= 1 || !isAxiosError(error) || error.code === "ERR_CANCELED") {
        return false;
    }

    const status = error.response?.status;
    return status === undefined || [408, 429, 500, 502, 503, 504].includes(status);
}

export function getQueryRetryDelay(failureCount: number, error: unknown): number {
    const defaultDelay = Math.min(1000 * 2 ** failureCount, 30000);
    const retryAfter = isAxiosError(error) ? error.response?.headers["retry-after"] : undefined;

    if (typeof retryAfter === "string" || typeof retryAfter === "number") {
        const seconds = Number(retryAfter);
        const delay =
            Number.isFinite(seconds) && seconds >= 0
                ? seconds * 1000
                : Date.parse(String(retryAfter)) - Date.now();

        if (Number.isFinite(delay)) {
            return Math.max(defaultDelay, delay);
        }
    }

    return defaultDelay;
}
