import { Router } from "express";
import { isAdmin, isAuthenticated } from "../middleware/auth";
import {
    getCurrentPlayerHandler,
    getPlayerLeaderboardHandler,
    getPlayerNamesHandler,
    loginHandler,
    registerHandler,
    passwordResetHandler,
    updateSettingsHandler,
} from "../controllers/player.controller";
import {
    createGameHandler,
    createRoundHandler,
    deleteGameHandler,
    deleteLastRoundHandler,
    getCurrentGamesHandler,
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
    getSeasonsHandler,
    makeTestAdminsHandler,
    updatePlayerHandler,
    updateSeasonHandler,
} from "../controllers/admin.controller";
import { getCurrentSeasonHandler } from "../controllers/season.controller";

const router: Router = Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.post("/password-reset", passwordResetHandler);

router.get("/games/:gameVariant", isAuthenticated, getGamesHandler);
router.post("/games/:gameVariant", isAuthenticated, createGameHandler);
router.get("/games/:gameVariant/current", getCurrentGamesHandler);
router.get("/games/:gameVariant/:id", getGameHandler);
router.post("/games/:gameVariant/:id", isAuthenticated, submitGameHandler);
router.delete("/games/:gameVariant/:id", isAuthenticated, deleteGameHandler);
router.post("/games/:gameVariant/:id/rounds", isAuthenticated, createRoundHandler);
router.delete("/games/:gameVariant/:id/rounds", isAuthenticated, deleteLastRoundHandler);

router.get("/players/gametype/:gameVariant/names", getPlayerNamesHandler);
router.get("/players/gametype/:gameVariant/leaderboard", getPlayerLeaderboardHandler);

router.get("/players/current", isAuthenticated, getCurrentPlayerHandler);
router.put("/players/current/settings", isAuthenticated, updateSettingsHandler);

router.get("/seasons/current", getCurrentSeasonHandler);

router.get("/admin/players", isAuthenticated, isAdmin, getPlayersHandler);
router.put("/admin/players/:id", isAuthenticated, isAdmin, updatePlayerHandler);
router.delete("/admin/players/:id", isAuthenticated, isAdmin, deletePlayerHandler);

router.put("/admin/recalc/:gameVariant", isAuthenticated, isAdmin, recalcSeasonHandler);

router.get("/admin/seasons", isAuthenticated, isAdmin, getSeasonsHandler);
router.post("/admin/seasons", isAuthenticated, isAdmin, createSeasonHandler);
router.put("/admin/seasons/:id", isAuthenticated, isAdmin, updateSeasonHandler);
router.delete("/admin/seasons/:id", isAuthenticated, isAdmin, deleteSeasonHandler);

router.post("/admin/makeDummyAdmins", isAuthenticated, isAdmin, makeTestAdminsHandler);

export default router;
