import prisma from "../db";
import {Game, GameType, GameVariant, Player} from "@prisma/client";

const createGame = async (gameVariant: GameVariant, gameType: GameType, players: any[], defaultRound: any, recorderId: string, seasonId: string): Promise<Game> => {
    return prisma.game.create({
        data: {
            season: {
                connect: {
                    id: seasonId
                }
            },
            gameVariant: gameVariant,
            gameType: gameType,
            status: 'IN_PROGRESS',
            recordedBy: {
                connect: {
                    id: recorderId
                }
            },
            players: {
                create: players
            },
            japaneseRounds: {
                create: [{
                    roundCount: 1,
                    roundNumber: 1,
                    roundWind: 'EAST',
                    bonus: 0,
                    riichiSticks: 0
                }]
            },
            [gameVariant === GameVariant.JAPANESE ? 'japaneseRounds' : 'hongKongRounds']: {
                create: defaultRound
            }
        }
    });
}

const getGame = async (gameId: number): Promise<any> => {
    return prisma.game.findUnique({
        where: {
            id: gameId
        },
        include: {
            players: {
                include: {
                    player: true
                }
            },
            japaneseRounds: true,
            hongKongRounds: true
        }
    })
}

// Throws error if the player list contains duplicates
const checkPlayerListUnique = (playerList: string[]): void => {
    if (new Set(playerList).size !== playerList.length) {
        throw new Error("Player list contains duplicates")
    }
}

// Throws error if the player is not eligible for the game type
const checkPlayerGameEligibility = (gameVariant: string, player: Player): void => {
    if (gameVariant === 'JAPANESE' && player.japaneseQualified) {
        return
    } else if (gameVariant === 'HONG_KONG' && player.hongKongQualified) {
        return
    }

    throw new Error("Player not eligible for game type")
}

const getWind = (index: number): string => {
    switch (index) {
        case 0:
            return "EAST"
        case 1:
            return "SOUTH"
        case 2:
            return "WEST"
        case 3:
            return "NORTH"
        default:
            return "NONE"
    }
}

const getDefaultRound = (gameVariant: GameVariant): any => {
    if (gameVariant === GameVariant.JAPANESE) {
        return {
            roundCount: 1,
            roundNumber: 1,
            roundWind: 'EAST',
            bonus: 0,
            riichiSticks: 0
        }
    } else if (gameVariant === GameVariant.HONG_KONG) {
        return {
            roundCount: 1,
            roundNumber: 1,
            roundWind: 'EAST',
            bonus: 0
        }
    }
}

export {checkPlayerGameEligibility, checkPlayerListUnique, getWind, getDefaultRound, createGame, getGame}
