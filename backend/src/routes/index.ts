import {Router} from "express"

import {isAdmin, isAuthenticated} from "../auth/auth";

import {getPlayerNamesHandler, loginHandler, registerHandler} from "../controllers/player.controller";
import {createGameHandler, getGameHandler, getGamesHandler} from "../controllers/game.controller"
import {
    getPlayersHandler,
    createSeasonHandler,
    getSeasonsHandler,
    makeTestAdminsHandler,
    deletePlayerHandler,
    updatePlayerHandler,
    deleteSeasonHandler,
    updateSeasonHandler
} from "../controllers/admin.controller";

const router: Router = Router()

router.post("/register", registerHandler)
router.post("/login", loginHandler)

router.get("/games", isAuthenticated, getGamesHandler)
router.get("/games/:id", getGameHandler)
router.post("/games", isAuthenticated, createGameHandler)

router.get("/players/gametype/:gameType", getPlayerNamesHandler)

router.get("/admin/players", isAuthenticated, isAdmin, getPlayersHandler)
router.put("/admin/players/:id", isAuthenticated, isAdmin, updatePlayerHandler)
router.delete("/admin/players/:id", isAuthenticated, isAdmin, deletePlayerHandler)

router.get("/admin/seasons", isAuthenticated, isAdmin, getSeasonsHandler)
router.post("/admin/seasons", isAuthenticated, isAdmin, createSeasonHandler)
router.put("/admin/seasons/:id", isAuthenticated, isAdmin, updateSeasonHandler)
router.delete("/admin/seasons/:id", isAuthenticated, isAdmin, deleteSeasonHandler)

router.post("/admin/makeDummyAdmins", isAuthenticated, isAdmin, makeTestAdminsHandler)

export default router
