import { index, layout, route, type RouteConfig } from "@react-router/dev/routes";

export default [
    layout("routes/with-nav.tsx", [
        index("routes/home.tsx"),
        route("leaderboard/jp", "routes/leaderboard-jp.tsx"),
        route("leaderboard/jp/casual", "routes/leaderboard-jp-casual.tsx"),
        route("leaderboard/hk", "routes/leaderboard-hk.tsx"),
        route("leaderboard/hk/casual", "routes/leaderboard-hk-casual.tsx"),
        route("games/current/jp", "routes/live-games-jp.tsx"),
        route("games/current/hk", "routes/live-games-hk.tsx"),
        route("games/create/jp", "routes/create-game-jp.tsx"),
        route("games/create/jp/casual", "routes/create-game-jp-casual.tsx"),
        route("games/create/hk", "routes/create-game-hk.tsx"),
        route("games/create/hk/casual", "routes/create-game-hk-casual.tsx"),
        route("games/not-found", "routes/game-not-found.tsx"),
        route("games/:variant/:id", "routes/game.tsx"),
        route("games", "routes/game-logs.tsx"),
        route("resources", "routes/resources.tsx"),
        route("vro2026", "routes/tournament.tsx"),
        route("stats/jp", "routes/statistics-jp.tsx"),
        route("activity", "routes/checkin.tsx"),
        route("admin", "routes/admin.tsx"),
        route("settings", "routes/settings.tsx"),
        route("unauthorized", "routes/unauthorized.tsx"),
    ]),
    layout("routes/without-nav.tsx", [
        route("login", "routes/login.tsx"),
        route("register", "routes/register.tsx"),
        route("request-password-reset", "routes/request-password-reset.tsx"),
        route("password-reset", "routes/password-reset.tsx"),
    ]),
    route("*", "routes/redirect-home.tsx"),
] satisfies RouteConfig;
