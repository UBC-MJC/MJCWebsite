/** Active-route helpers shared by the desktop bar and the mobile drawer. */

export const isPathActive = (pathname: string, path: string) => pathname.startsWith(path);

// The combined Games page is served at both /games and /games/current —
// highlight the nav entry for either, but not for /games/create or game detail pages.
export const isGamesActive = (pathname: string) =>
    pathname === "/games" || pathname === "/games/current";
