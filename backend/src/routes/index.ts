import { Router } from "express";
import { isAdmin, isAuthenticated } from "../middleware/auth";
import {
    getCurrentPlayerHandler,
    getPlayerLeaderboardHandler,
    getQualifiedPlayersHandler,
    getUserStatisticsHandler,
    getPlacementHistoryHandler,
    loginHandler,
    logoutHandler,
    passwordResetHandler,
    registerHandler,
    requestPasswordResetHandler,
    updateSettingsHandler,
    updateUsernameHandler,
} from "../controllers/player.controller";
import {
    createGameHandler,
    createRoundHandler,
    deleteGameHandler,
    deleteLastRoundHandler,
    getLiveGamesHandler,
    getLiveGameHandler,
    getGameHandler,
    getGamesHandler,
    recalcSeasonHandler,
    submitGameHandler,
    setChomboHandler,
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
import {
    checkInHandler,
    checkOutHandler,
    getStatusHandler,
    getCheckedInPlayersHandler
} from "../controllers/checkin.controller";

const router: Router = Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.post("/logout", logoutHandler);
router.post("/request-password-reset", requestPasswordResetHandler);
router.post("/password-reset", passwordResetHandler);

router.get("/games/:gameVariant", getGamesHandler);
router.post("/games/:gameVariant", isAuthenticated, createGameHandler);
router.get("/games/:gameVariant/live", getLiveGamesHandler);
router.get("/games/:gameVariant/:id", getGameHandler);
router.get("/games/:gameVariant/:id/live", getLiveGameHandler);
router.post("/games/:gameVariant/:id", isAuthenticated, submitGameHandler);
router.delete("/games/:gameVariant/:id", isAuthenticated, deleteGameHandler);
router.post("/games/:gameVariant/:id/rounds", isAuthenticated, createRoundHandler);
router.post("/games/:gameVariant/:id/chombo", isAuthenticated, setChomboHandler);
router.delete("/games/:gameVariant/:id/rounds", isAuthenticated, deleteLastRoundHandler);

router.get("/players/qualified/:gameVariant/:gameType/names", getQualifiedPlayersHandler);
router.get("/players/qualified/:gameVariant/:gameType/leaderboard", getPlayerLeaderboardHandler);

router.get("/players/current", isAuthenticated, getCurrentPlayerHandler);
router.put("/players/current/settings", isAuthenticated, updateSettingsHandler);
router.put("/players/current/username", isAuthenticated, updateUsernameHandler);
router.get("/players/:playerId/:gameVariant/:seasonId", getUserStatisticsHandler);
router.get(
    "/players/:playerId/:gameVariant/:seasonId/placement-history",
    getPlacementHistoryHandler,
);
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

router.post("/checkin", isAuthenticated, checkInHandler);
router.post("/checkout", isAuthenticated, checkOutHandler);
router.get("/checkin", isAuthenticated, getStatusHandler);
router.get("/checkin/list", getCheckedInPlayersHandler);

export default router;
