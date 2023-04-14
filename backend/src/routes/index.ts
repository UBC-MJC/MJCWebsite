import {Router} from "express"

import {login, register} from "../controllers/player.controller";
import {addGame, getGames} from "../controllers/game.controller"
import {getAdmin} from "../controllers/admin.controller";
import {isAuthenticated} from "../auth/auth";

const router: Router = Router()

router.post("/register", register)
router.post("/login", login)

router.get("/games", getGames)
router.post("/add-game", addGame)

router.get("/admin", isAuthenticated, getAdmin)

export default router
