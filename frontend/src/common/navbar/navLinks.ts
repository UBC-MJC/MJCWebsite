import { getGameVariantString } from "@/common/Utils";

// The bar shows every link from this breakpoint up and moves them into the drawer below it.
// Five links and two actions need about 1060px with a long username, so md (900px) is too narrow
export const DESKTOP = "lg";

export interface NavLink {
    label: string;
    to: string;
}

/** Destinations shown together: a menu in the desktop bar, a labelled group in the drawer */
export interface NavGroup {
    label: string;
    links: NavLink[];
    /** Other paths that belong to the group without being one of its links */
    match?: RegExp;
}

export type NavItem = NavLink | NavGroup;

export const isNavGroup = (item: NavItem): item is NavGroup => "links" in item;

// Leaderboards, live games and game creation still have one route per variant, so they are grouped here.
// Each group becomes a single link in the PR that merges its pages into one
export const mainNav: NavItem[] = [
    {
        label: "Leaderboard",
        links: [
            { label: getGameVariantString("jp"), to: "/leaderboard/jp" },
            { label: getGameVariantString("hk"), to: "/leaderboard/hk" },
        ],
    },
    {
        label: "Games",
        links: [
            { label: `Live ${getGameVariantString("jp")}`, to: "/games/current/jp" },
            { label: `Live ${getGameVariantString("hk")}`, to: "/games/current/hk" },
            { label: "Game logs", to: "/games" },
        ],
        match: /^\/games\/(jp|hk)\/\d+$/, // a single game
    },
    // Only Riichi has a stats page so far
    { label: `${getGameVariantString("jp")} stats`, to: "/stats/jp" },
    { label: "Check in", to: "/activity" },
    { label: "Resources", to: "/resources" },
];

/** Signed-in players only. It lives in the bar at every width, not in the drawer */
export const newGameGroup: NavGroup = {
    label: "New game",
    links: [
        { label: getGameVariantString("jp"), to: "/games/create/jp" },
        { label: getGameVariantString("hk"), to: "/games/create/hk" },
    ],
};

export const settingsLink: NavLink = { label: "Settings", to: "/settings" };
export const adminLink: NavLink = { label: "Admin", to: "/admin" };
export const loginLink: NavLink = { label: "Log in", to: "/login" };

// Exact match only: `/games` (the logs) must not light up on /games/create/jp or a game page
export const isLinkActive = (pathname: string, link: NavLink) =>
    (pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname) === link.to;

export const isItemActive = (pathname: string, item: NavItem) =>
    isNavGroup(item)
        ? item.links.some((link) => isLinkActive(pathname, link)) ||
          (item.match?.test(pathname) ?? false)
        : isLinkActive(pathname, item);
