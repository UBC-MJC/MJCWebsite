import prisma from "../../db";
import { GameType } from "@prisma/client";
import GameService from "./game.service";
import {
    createEloCalculatorInputs,
    FullHongKongGame, FullJapaneseGame,
    getDealerPlayerId,
    getWind,
    requiresHand,
    WIND_ORDER
} from "./game.util";
import { getAllPlayerElos } from "../leaderboard.service";
import { EloCalculatorInput, getEloChanges } from "./eloCalculator";

class HongKongGameService extends GameService {
    public createGame(
        gameType: GameType,
        playersQuery: any[],
        recorderId: string,
        seasonId: string,
    ): Promise<any> {
        return prisma.hongKongGame.create({
            data: {
                season: {
                    connect: {
                        id: seasonId,
                    },
                },
                type: gameType,
                status: "IN_PROGRESS",
                recordedBy: {
                    connect: {
                        id: recorderId,
                    },
                },
                players: {
                    create: playersQuery,
                },
            },
        });
    }

    public getGame(id: number): Promise<any> {
        return prisma.hongKongGame.findUnique({
            where: {
                id: id,
            },
            include: {
                players: {
                    include: {
                        player: true,
                    },
                },
                rounds: {
                    include: {
                        transactions: true,
                    },
                },
            },
        });
    }

    public async deleteGame(id: number): Promise<void> {
        await prisma.hongKongGame.delete({
            where: {
                id: id,
            },
        });
    }

    public async submitGame(game: FullHongKongGame): Promise<void> {
        const playerScores = getHongKongPlayersCurrentScore(game);
        const eloList = await getAllPlayerElos("hk", game.seasonId);
        const eloCalculatorInput: EloCalculatorInput[] = createEloCalculatorInputs(
            game.players,
            playerScores,
            eloList,
        );
        const calculatedElos = getEloChanges(eloCalculatorInput, "hk");

        await prisma.$transaction(
            calculatedElos.map((elo) => {
                return prisma.hongKongPlayerGame.update({
                    where: {
                        id: game.players.find((player) => player.player.id === elo.playerId)!.id,
                    },
                    data: {
                        eloChange: elo.eloChange,
                    },
                });
            }),
        );

        await prisma.hongKongGame.update({
            where: {
                id: game.id,
            },
            data: {
                status: "FINISHED",
                endedAt: new Date(),
            },
        });
    }

    public async createRound(game: FullHongKongGame, roundRequest: any): Promise<void> {
        const currentRoundInformation = getNextHongKongRound(game);
        const { scoresQuery } = createHongKongScoresQuery(roundRequest, currentRoundInformation);

        const query: any = {
            data: {
                game: {
                    connect: {
                        id: game.id,
                    },
                },
                roundCount: currentRoundInformation.roundCount,
                roundNumber: currentRoundInformation.roundNumber,
                roundWind: currentRoundInformation.roundWind,
                bonus: currentRoundInformation.bonus,
                roundType: roundRequest.roundValue.type.value,
                scores: {
                    create: scoresQuery,
                },
            },
        };

        if (requiresHand(roundRequest.roundValue.type.value)) {
            query.data.hand = {
                create: createHongKongHandQuery(roundRequest.pointsValue),
            };
        }

        try {
            await prisma.hongKongRound.create(query);
        } catch (err) {
            console.error("Error adding HongKong round: ", err);
            console.error("Query: ", query);
        }
    }

    public async deleteRound(id: string): Promise<void> {
        await prisma.hongKongRound.delete({
            where: {
                id: id,
            },
        });
    }

    public mapGameObject(game: FullHongKongGame): any {
        const nextRound = getNextHongKongRound(game);

        return {
            id: game.id,
            type: game.type,
            status: game.status,
            recordedById: game.recordedById,
            players: game.players.map((player) => {
                return {
                    id: player.player.id,
                    username: player.player.username,
                    trueWind: player.wind,
                };
            }),
            rounds: game.rounds,
            currentRound: nextRound,
            gameOver: this.isGameOver(game, nextRound),
        };
    }

    public isGameOver(
        game: FullHongKongGame,
        nextRound: any = getNextHongKongRound(game),
    ): boolean {
        return nextRound.roundWind === "END";
    }
}

const getHongKongPlayersCurrentScore = (game: FullHongKongGame): number[] => {
    const result = [0, 0, 0, 0];
    game.rounds.forEach((round) => {
        round.transactions.forEach((transaction) => {
            result[0] += transaction.player0ScoreChange;
            result[1] += transaction.player1ScoreChange;
            result[2] += transaction.player2ScoreChange;
            result[3] += transaction.player3ScoreChange;
        });
    });

    return result;
}

const getFirstHongKongRound = (): any => {
    return {
        roundCount: 1,
        roundNumber: 1,
        roundWind: "EAST",
        bonus: 0,
    };
};

const getNextHongKongRound = (game: FullHongKongGame): any => {
    const rounds = game.rounds;
    if (rounds.length === 0) {
        return getFirstHongKongRound();
    }

    const lastRound = rounds[rounds.length - 1];

    const lastRoundWind = lastRound.roundWind;
    const lastRoundNumber = lastRound.roundNumber;
    const lastRoundCount = lastRound.roundCount;
    // const lastBonus = lastRound.bonus;

    // const lastDealerId = getDealerPlayerId(game, lastRoundNumber);
    // const lastDealerScore = lastRound.scores.find((score) => score.playerId === lastDealerId);
    //
    // if (lastDealerScore!.scoreChange > 0) {
    //     return {
    //         roundCount: lastRoundCount + 1,
    //         roundNumber: lastRoundNumber,
    //         roundWind: lastRoundWind,
    //     };
    // }

    // TODO: get acutal rules
    // if (lastRound.roundType === "DECK_OUT") {
    //     return {
    //         roundCount: lastRoundCount + 1,
    //         roundNumber: lastRoundNumber === 4 ? 1 : lastRoundNumber + 1,
    //         roundWind:
    //             lastRoundNumber === 4
    //                 ? getWind(WIND_ORDER.indexOf(lastRoundWind) + 1)
    //                 : lastRoundWind,
    //         bonus: lastBonus + 1,
    //     };
    // }

    let roundWind;
    if (lastRoundNumber === 4 && lastRoundWind === "NORTH") {
        roundWind = "END";
    } else if (lastRoundNumber === 4) {
        roundWind = getWind(WIND_ORDER.indexOf(lastRoundWind) + 1);
    } else {
        roundWind = lastRoundWind;
    }

    return {
        roundCount: lastRoundCount + 1,
        roundNumber: lastRoundNumber === 4 ? 1 : lastRoundNumber + 1,
        roundWind: roundWind,
    };
};

const createHongKongScoresQuery = (round: any, currentRoundInformation: any): any => {
    const roundType = round.roundValue.type.value;
    const playerActions = round.roundValue.playerActions;
    const hand = round.pointsValue;
    const { bonus } = currentRoundInformation;

    let winnerId: string | undefined = undefined;
    let loserId: string | undefined = undefined;
    let paoId: string | undefined = undefined;

    const playerScores: any = {};
    for (const playerId in playerActions) {
        playerScores[playerId] = 0;

        if (playerActions[playerId].includes("Winner")) {
            winnerId = playerId;
        }

        if (playerActions[playerId].includes("Loser")) {
            loserId = playerId;
        }

        if (playerActions[playerId].includes("Pao Player")) {
            paoId = playerId;
        }
    }

    switch (roundType) {
        case "DEAL_IN":
            updateHongKongDealIn(playerScores, winnerId!, loserId!, hand, bonus);
            break;
        case "SELF_DRAW":
            updateHongKongSelfDraw(playerScores, winnerId!, hand, bonus);
            break;
        case "DECK_OUT":
            break;
        case "MISTAKE":
            updateHongKongMistake(playerScores, loserId!);
            break;
        case "PAO":
            updateHongKongPao(playerScores, winnerId!, paoId!, hand, bonus);
            break;
        default:
            throw new Error("Invalid round type: " + roundType);
    }

    const scoresQuery: any[] = [];
    for (const playerId in playerScores) {
        scoresQuery.push({
            player: {
                connect: {
                    id: playerId,
                },
            },
            scoreChange: playerScores[playerId].scoreChange,
        });
    }

    return scoresQuery;
};

const createHongKongHandQuery = (pointsValue: any): any => {
    return {
        points: pointsValue.points,
    };
};

const updateHongKongDealIn = (
    playerScores: any,
    winnerId: string,
    loserId: string,
    hand: any,
    bonus: number,
) => {
    const { points } = hand;
    let scoreChange;
    switch (points) {
        case 3:
            scoreChange = 16;
            break;
        case 4:
            scoreChange = 32;
            break;
        case 5:
            scoreChange = 48;
            break;
        case 6:
            scoreChange = 64;
            break;
        case 7:
            scoreChange = 96;
            break;
        case 8:
            scoreChange = 128;
            break;
        case 9:
            scoreChange = 192;
            break;
        case 10:
            scoreChange = 256;
            break;
        case 11:
            scoreChange = 384;
            break;
        case 12:
            scoreChange = 512;
            break;
        case 13:
            scoreChange = 768;
            break;
        default:
            throw new Error("Invalid Hong Kong hand points: " + points);
    }

    playerScores[winnerId] += scoreChange;
    playerScores[loserId] -= scoreChange;
};

const updateHongKongSelfDraw = (playerScores: any, winnerId: string, hand: any, bonus: number) => {
    const { points } = hand;
    let scoreChange;
    switch (points) {
        case 3:
            scoreChange = 8;
            break;
        case 4:
            scoreChange = 16;
            break;
        case 5:
            scoreChange = 24;
            break;
        case 6:
            scoreChange = 32;
            break;
        case 7:
            scoreChange = 48;
            break;
        case 8:
            scoreChange = 64;
            break;
        case 9:
            scoreChange = 96;
            break;
        case 10:
            scoreChange = 128;
            break;
        case 11:
            scoreChange = 192;
            break;
        case 12:
            scoreChange = 256;
            break;
        case 13:
            scoreChange = 384;
            break;
        default:
            throw new Error("Invalid Hong Kong hand points: " + points);
    }

    for (const playerId in playerScores) {
        if (playerId === winnerId) {
            playerScores[playerId] += scoreChange * 3;
        }
        playerScores[playerId] -= scoreChange;
    }
};

const updateHongKongMistake = (playerScores: any, loserId: string) => {
    for (const playerId in playerScores) {
        if (playerId === loserId) {
            playerScores[playerId] += 200;
        }
        playerScores[playerId] -= 600;
    }
};

const updateHongKongPao = (
    playerScores: any,
    winnerId: string,
    paoId: string,
    hand: any,
    bonus: number,
) => {
    const { points } = hand;
    let scoreChange;
    switch (points) {
        case 3:
            scoreChange = 24;
            break;
        case 4:
            scoreChange = 48;
            break;
        case 5:
            scoreChange = 72;
            break;
        case 6:
            scoreChange = 96;
            break;
        case 7:
            scoreChange = 144;
            break;
        case 8:
            scoreChange = 192;
            break;
        case 9:
            scoreChange = 288;
            break;
        case 10:
            scoreChange = 384;
            break;
        case 11:
            scoreChange = 576;
            break;
        case 12:
            scoreChange = 768;
            break;
        case 13:
            scoreChange = 1152;
            break;
        default:
            throw new Error("Invalid Hong Kong hand points: " + points);
    }

    playerScores[winnerId] += scoreChange;
    playerScores[paoId] -= scoreChange;
};

export default HongKongGameService;
