import {Router} from "express"

import {isAdmin, isAuthenticated} from "../auth/auth";

import {getPlayerNames, getPlayers, login, register} from "../controllers/player.controller";
import {createGame, getGame, getGames} from "../controllers/game.controller"
import {getAdmin} from "../controllers/admin.controller";

const router: Router = Router()

router.post("/register", register)
router.post("/login", login)

router.get("/games", isAuthenticated, getGames)
router.get("/games/:id", isAuthenticated, getGame)
router.post("/games", isAuthenticated, createGame)

router.get("/players", isAuthenticated, isAdmin, getPlayers)
router.get("/players/gametype/:gameType", getPlayerNames)

router.get("/admin", isAuthenticated, getAdmin)

export default router
