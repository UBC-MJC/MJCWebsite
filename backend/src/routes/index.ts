import { Router } from "express";
import { isAdmin, isAuthenticated } from "../middleware/auth";
import {
    getCurrentPlayerHandler,
    getPlayerLeaderboardHandler,
    getQualifiedPlayersHandler,
    getUserStatisticsHandler,
    loginHandler,
    passwordResetHandler,
    registerHandler,
    requestPasswordResetHandler,
    updateSettingsHandler,
} from "../controllers/player.controller";
import {
    createGameHandler,
    createRoundHandler,
    deleteGameHandler,
    deleteLastRoundHandler,
    getLiveGamesHandler,
    getGameHandler,
    getGamesHandler,
    recalcSeasonHandler,
    submitGameHandler,
} from "../controllers/game.controller";
import {
    createSeasonHandler,
    deletePlayerHandler,
    deleteSeasonHandler,
    getPlayersHandler,
    makeTestAdminsHandler,
    removeQualificationHandler,
    updatePlayerHandler,
    updateSeasonHandler,
} from "../controllers/admin.controller";
import { getCurrentSeasonHandler, getSeasonsHandler } from "../controllers/season.controller";

const router: Router = Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.post("/request-password-reset", requestPasswordResetHandler);
router.post("/password-reset", passwordResetHandler);

router.get("/games/:gameVariant", getGamesHandler);
router.post("/games/:gameVariant", isAuthenticated, createGameHandler);
router.get("/games/:gameVariant/live", getLiveGamesHandler);
router.get("/games/:gameVariant/:id", getGameHandler);
router.get("/games/:gameVariant/:id/live", (req, res, next) =>
    getGameHandler(req, res, next, true),
);
router.post("/games/:gameVariant/:id", isAuthenticated, submitGameHandler);
router.delete("/games/:gameVariant/:id", isAuthenticated, deleteGameHandler);
router.post("/games/:gameVariant/:id/rounds", isAuthenticated, createRoundHandler);
router.delete("/games/:gameVariant/:id/rounds", isAuthenticated, deleteLastRoundHandler);

router.get("/players/qualified/:gameVariant/:gameType/names", getQualifiedPlayersHandler);
router.get("/players/qualified/:gameVariant/:gameType/leaderboard", getPlayerLeaderboardHandler);

router.get("/players/current", isAuthenticated, getCurrentPlayerHandler);
router.put("/players/current/settings", isAuthenticated, updateSettingsHandler);
router.get("/players/:playerId/:gameVariant/:seasonId", getUserStatisticsHandler);
router.get("/seasons/current", getCurrentSeasonHandler);
router.get("/seasons", getSeasonsHandler);

router.get("/admin/players", isAuthenticated, isAdmin, getPlayersHandler);
router.put("/admin/players/:id", isAuthenticated, isAdmin, updatePlayerHandler);
router.delete("/admin/players/:id", isAuthenticated, isAdmin, deletePlayerHandler);

router.put("/admin/recalc/:gameVariant/", isAuthenticated, isAdmin, recalcSeasonHandler);
router.put("/admin/removeQualification", isAuthenticated, isAdmin, removeQualificationHandler);
router.post("/admin/seasons", isAuthenticated, isAdmin, createSeasonHandler);
router.put("/admin/seasons/:id", isAuthenticated, isAdmin, updateSeasonHandler);
router.delete("/admin/seasons/:id", isAuthenticated, isAdmin, deleteSeasonHandler);

router.post("/admin/makeDummyAdmins", isAuthenticated, isAdmin, makeTestAdminsHandler);

export default router;
