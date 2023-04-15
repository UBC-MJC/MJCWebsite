import {Router} from "express"

import {isAuthenticated} from "../auth/auth";

import {login, register} from "../controllers/player.controller";
import {addGame, getGames} from "../controllers/game.controller"
import {getAdmin} from "../controllers/admin.controller";

const router: Router = Router()

router.post("/register", register)
router.post("/login", login)

router.get("/games", getGames)
router.post("/games", addGame)

router.get("/admin", isAuthenticated, getAdmin)

export default router
