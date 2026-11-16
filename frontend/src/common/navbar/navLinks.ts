import { getGameVariantString } from "@/common/Utils";

// With New game and a long username the full bar needs about 1060px, so below lg it uses the drawer
export const DESKTOP = "lg";

export interface NavLink {
    label: string;
    to: string;
}

export interface NavGroup {
    label: string;
    links: NavLink[];
    /** Other paths that belong to the group without being one of its links */
    match?: RegExp;
}

export type NavItem = NavLink | NavGroup;

export const isNavGroup = (item: NavItem): item is NavGroup => "links" in item;

export const gamePage = /^\/games\/(jp|hk)\/\d+$/;

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
        match: gamePage,
    },
    { label: `${getGameVariantString("jp")} stats`, to: "/stats/jp" },
    { label: "Check in", to: "/activity" },
    { label: "Resources", to: "/resources" },
];

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

// Exact match, or Game logs (/games) would light up on every game page
export const isLinkActive = (pathname: string, link: NavLink) =>
    (pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname) === link.to;

export const isItemActive = (pathname: string, item: NavItem) =>
    isNavGroup(item)
        ? item.links.some((link) => isLinkActive(pathname, link)) ||
          (item.match?.test(pathname) ?? false)
        : isLinkActive(pathname, item);
