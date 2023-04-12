import {Router} from "express"
import {addGame, getGames} from "../controllers/gameController"

const router: Router = Router()

router.get("/games", getGames)

router.post("/add-game", addGame)

export default router
