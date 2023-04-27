import prisma from "../db";
import {Game, Player, Season} from "@prisma/client";
import {CreateGameType} from "../validation/game.validation";

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

const createGame = async (createGame: CreateGameType, players: any[], recorderId: string, seasonId: string): Promise<Game> => {
    return prisma.game.create({
        data: {
            season: {
                connect: {
                    id: seasonId
                }
            },
            gameType: createGame.gameType,
            status: 'IN_PROGRESS',
            recordedBy: {
                connect: {
                    id: recorderId
                }
            },
            players: {
                create: players
            },
            japaneseGames: {
                create: [{
                    rounds: {
                        create: {
                            roundCount: 1,
                            roundNumber: 1,
                            roundWind: 'EAST'
                        }
                    }
                }]
            }
        }
    });
}

export {checkPlayerGameEligibility, createGame, checkPlayerListUnique}
