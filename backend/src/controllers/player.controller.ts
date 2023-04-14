import {NextFunction, Request, Response} from "express";
import createError from "http-errors";
import {loginSchema, registerSchema} from "../validation/player.validation";
import {createPlayer, findPlayerByEmail, findPlayerByUsername} from "../services/player.service";
import {generateToken} from "../auth/jwt";
import bcrypt from "bcryptjs";

const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        registerSchema.validate(req.body).then(() => createPlayer(req.body)).then((player) => {
            const token = generateToken(player.id)
            res.json({
                accessToken: token,
                player: player
            })
        }).catch((err: any) => {
            next(createError.BadRequest(err.message))
        })
    } catch (error: any) {
        next(createError(error.statusCode, error.message))
    }
}

const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        loginSchema.validate(req.body).then(() => findPlayerByUsername(req.body.username)).then((player) => {
            if (player && bcrypt.compareSync(req.body.password, player.password)) {
                const token = generateToken(player.id)
                res.json({
                    accessToken: token,
                    player: player
                })
            } else {
                next(createError.Unauthorized("Username or password is incorrect"))
            }
        }).catch((err: any) => {
            next(createError.BadRequest(err.message))
        })
    } catch (error: any) {
        next(createError(error.statusCode, error.message))
    }
}

export {register, login}
