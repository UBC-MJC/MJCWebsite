import {Player} from "@prisma/client";

export {}

declare global {
    namespace Express {
        export interface Request {
            player: Player;
        }
    }
}
