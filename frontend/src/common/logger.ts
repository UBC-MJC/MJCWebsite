/**
 * Environment-aware logger utility
 * In development: logs to console
 * In production: only logs errors (can be extended to send to error tracking service)
 */

const isProduction = process.env.NODE_ENV === "production";

export const logger = {
    /**
     * Log informational messages (only in development)
     */
    log: (...args: unknown[]): void => {
        if (!isProduction) {
            console.log(...args);
        }
    },

    /**
     * Log warning messages (only in development)
     */
    warn: (...args: unknown[]): void => {
        if (!isProduction) {
            console.warn(...args);
        }
    },

    /**
     * Log error messages (always logged, can be sent to error tracking service)
     */
    error: (...args: unknown[]): void => {
        console.error(...args);
        // TODO: Send to error tracking service (e.g., Sentry) in production
        // if (isProduction) {
        //     sendToErrorTracking(args);
        // }
    },

    /**
     * Log debug messages (only in development)
     */
    debug: (...args: unknown[]): void => {
        if (!isProduction) {
            console.debug(...args);
        }
    },
};
