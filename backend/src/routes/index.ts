import {Router} from "express"

import {isAdmin, isAuthenticated} from "../auth/auth";

import {getPlayerNames, login, register} from "../controllers/player.controller";
import {createGame, getGame, getGames} from "../controllers/game.controller"
import {getPlayers, addSeason, getSeasons, makeTestAdmins} from "../controllers/admin.controller";

const router: Router = Router()

router.post("/register", register)
router.post("/login", login)

router.get("/games", isAuthenticated, getGames)
router.get("/games/:id", isAuthenticated, getGame)
router.post("/games", isAuthenticated, createGame)

router.get("/players/gametype/:gameType", getPlayerNames)

router.get("/admin/players", isAuthenticated, isAdmin, getPlayers)
router.get("/admin/seasons", isAuthenticated, isAdmin, getSeasons)
router.post("/admin/seasons", isAuthenticated, isAdmin, addSeason)
router.post("/admin/makeDummyAdmins", isAuthenticated, isAdmin, makeTestAdmins)

export default router
