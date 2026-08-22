const SITE_TITLE = "UBC Mahjong Club";

export const pageMeta = (pageName?: string) => [
    { title: pageName ? `${pageName} | ${SITE_TITLE}` : SITE_TITLE },
];
