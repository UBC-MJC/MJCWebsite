import {Router} from "express"

import {isAdmin, isAuthenticated} from "../auth/auth";

import {getPlayerNamesHandler, loginHandler, registerHandler} from "../controllers/player.controller";
import {createGameHandler, getGameHandler, getGamesHandler} from "../controllers/game.controller"
import {getPlayers, addSeason, getSeasons, makeTestAdmins} from "../controllers/admin.controller";

const router: Router = Router()

router.post("/register", registerHandler)
router.post("/login", loginHandler)

router.get("/games", isAuthenticated, getGamesHandler)
router.get("/games/:id", isAuthenticated, getGameHandler)
router.post("/games", isAuthenticated, createGameHandler)

router.get("/players/gametype/:gameType", getPlayerNamesHandler)

router.get("/admin/players", isAuthenticated, isAdmin, getPlayers)
router.get("/admin/seasons", isAuthenticated, isAdmin, getSeasons)
router.post("/admin/seasons", isAuthenticated, isAdmin, addSeason)
router.post("/admin/makeDummyAdmins", isAuthenticated, isAdmin, makeTestAdmins)

export default router
