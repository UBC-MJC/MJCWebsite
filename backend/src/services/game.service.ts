import prisma from "../db";
import {Game, GameType, Player} from "@prisma/client";

const checkPlayerGameEligibility = (gameType: string, player: Player): void => {
    if (gameType === 'RIICHI' && player.rankedRiichi) {
        return
    } else if (gameType === 'HONG_KONG' && player.rankedHongKong) {
        return
    }

    throw new Error("Player not eligible for game type")
}

const createGameService = async (gameType: GameType, playerIds: {id: string}[], recorderId: string): Promise<Game> => {
    return prisma.game.create({
        data: {
            gameType: gameType,
            status: 'IN_PROGRESS',
            recordedBy: {
                connect: {
                    id: recorderId
                }
            },
            players: {
                connect: playerIds
            }
        }
    });
}

export {checkPlayerGameEligibility, createGameService}
