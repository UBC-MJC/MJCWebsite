import {NextFunction, Request, Response} from "express";
import createError from "http-errors";
import {loginSchema, registerSchema} from "../validation/player.validation";
import {createPlayer, findPlayerByUsername} from "../services/player.service";
import {generateToken} from "../auth/jwt";
import bcrypt from "bcryptjs";

const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    registerSchema.validate(req.body).then(() => createPlayer(req.body)).then((player) => {
        const token = generateToken(player.id)
        const {password, ...playerOmitted} = player;
        res.json({
            accessToken: token,
            player: playerOmitted
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
                accessToken: token,
                player: playerOmitted
            })
        } else {
            next(createError.Unauthorized("Username or password is incorrect"))
        }
    }).catch((err: any) => {
        next(createError.Unauthorized("Username or password is incorrect"))
    })
}

export {register, login}
