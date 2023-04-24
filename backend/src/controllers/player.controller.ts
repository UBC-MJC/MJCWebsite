import {NextFunction, Request, Response} from "express";
import createError from "http-errors";
import {loginSchema, registerSchema} from "../validation/player.validation";
import {createPlayer, findAllPlayers, findPlayerByUsername} from "../services/player.service";
import {generateToken} from "../auth/jwt";
import bcrypt from "bcryptjs";

const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    registerSchema.validate(req.body).then(() => createPlayer(req.body)).then((player) => {
        if (!player) {
            throw new Error("Error creating player")
        }

        const token = generateToken(player.id)
        const {password, ...playerOmitted} = player;
        res.json({
            player: {authToken: token, ...playerOmitted}
        })
    }).catch((err: any) => {
        next(createError.BadRequest(err.message))
    })
}

const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    loginSchema.validate(req.body).then(() => findPlayerByUsername(req.body.username)).then((player) => {
        if (player && bcrypt.compareSync(req.body.password, player.password)) {
            const token = generateToken(player.id)
            const {password, ...playerOmitted} = player;
            res.json({
                player: {authToken: token, ...playerOmitted}
            })
        } else {
            next(createError.Unauthorized("Username or password is incorrect"))
        }
    }).catch((err: any) => {
        next(createError.Unauthorized("Username or password is incorrect"))
    })
}

const getPlayerNames = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const gameType = req.params.gameType

    let query = {}
    if (gameType === "jp") {
        query = {
            where: {
                japaneseQualified: true
            }
        }
    } else if (gameType === "hk") {
        query = {
            where: {
                hongKongQualified: true
            }
        }
    }

    findAllPlayers(query).then((players) => {
        const playerNames = players.map((player) => player.username)
        res.json({playerNames})
    }).catch((err: any) => {
        next(createError.InternalServerError(err.message))
    })
}

const getPlayers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    findAllPlayers({}).then((players) => {
        const playersCleaned = players.map((player) => {
            const {password, ...playerOmitted} = player;
            return playerOmitted
        })
        res.json({players: playersCleaned})
    }).catch((err: any) => {
        next(createError.InternalServerError(err.message))
    })
}

export {register, login, getPlayerNames, getPlayers}
