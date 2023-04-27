import {Router} from "express"

import {isAuthenticated} from "../auth/auth";

import {getPlayerNamesHandler, loginHandler, registerHandler} from "../controllers/player.controller";
import {createGameHandler, getGameHandler, getGamesHandler} from "../controllers/game.controller"
import {getAdminHandler} from "../controllers/admin.controller";

const router: Router = Router()

router.post("/register", registerHandler)
router.post("/login", loginHandler)

router.get("/games", isAuthenticated, getGamesHandler)
router.get("/games/:id", isAuthenticated, getGameHandler)
router.post("/games", isAuthenticated, createGameHandler)

router.get("/players/gametype/:gameType", getPlayerNamesHandler)

router.get("/admin", isAuthenticated, getAdminHandler)

export default router
