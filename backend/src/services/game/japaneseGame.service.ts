import prisma from "../../db";
import { GameStatus, GameType, JapaneseTransaction, JapaneseTransactionType } from "@prisma/client";
import {
    addScoreDeltas,
    containingAny,
    createEloCalculatorInputs,
    FullJapaneseGame,
    FullJapaneseRound,
    getEmptyScoreDelta,
    getNextRoundWind,
    NUM_PLAYERS,
    range,
    reduceScoreDeltas,
    RIICHI_STICK_VALUE,
} from "./game.util";
import GameService from "./game.service";
import { getAllPlayerElos } from "../leaderboard.service";
import { EloCalculatorInput, getEloChanges } from "./eloCalculator";
const MANGAN_BASE_POINT = 2000;
const RIICHI_STICK_SCORE = 1000;
const BONUS_PER_HONBA = 300;
class JapaneseGameService extends GameService {
    public createGame(
        gameType: GameType,
        playersQuery: any[],
        recorderId: string,
        seasonId: string,
    ): Promise<any> {
        return prisma.japaneseGame.create({
            data: {
                season: {
                    connect: {
                        id: seasonId,
                    },
                },
                type: gameType,
                status: GameStatus.IN_PROGRESS,
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
        return prisma.japaneseGame.findUnique({
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
        await prisma.japaneseGame.delete({
            where: {
                id: id,
            },
        });
    }

    // TODO: replace getAllPlayerElos call, not all elos are needed
    public async submitGame(game: FullJapaneseGame): Promise<void> {
        const playerScores = getJapaneseGameFinalScore(game);

        const eloList = await getAllPlayerElos("jp", game.seasonId);
        const eloCalculatorInput: EloCalculatorInput[] = createEloCalculatorInputs(
            game.players,
            playerScores,
            eloList,
        );
        const calculatedElos = getEloChanges(eloCalculatorInput, "jp");

        await prisma.$transaction(
            calculatedElos.map((eloObject) => {
                return prisma.japanesePlayerGame.update({
                    where: {
                        id: game.players.find((player) => player.player.id === eloObject.playerId)!
                            .id,
                    },
                    data: {
                        eloChange: eloObject.eloChange,
                    },
                });
            }),
        );

        await prisma.japaneseGame.update({
            where: {
                id: game.id,
            },
            data: {
                status: GameStatus.FINISHED,
                endedAt: new Date(),
            },
        });
    }

    public async createRound(game: FullJapaneseGame, roundRequest: any): Promise<void> {
        validateCreateJapaneseRound(roundRequest, game);
        const concludedRound = roundRequest as ConcludedJapaneseRoundT;

        const query: any = {
            data: {
                game: {
                    connect: {
                        id: game.id,
                    },
                },
                ...transformConcludedRound(concludedRound),
                transactions: {
                    create: concludedRound.transactions.map((transaction) =>
                        transformTransaction(transaction),
                    ),
                },
            },
        };

        try {
            await prisma.japaneseRound.create(query);
        } catch (err) {
            console.error("Error adding japanese round: ", err);
            console.error("Query: ", query);
            throw err;
        }
    }

    public async deleteRound(id: string): Promise<void> {
        await prisma.japaneseRound.delete({
            where: {
                id: id,
            },
        });
    }

    public mapGameObject(game: FullJapaneseGame): any {
        const nextRound = getNextJapaneseRound(game);

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
            rounds: game.rounds.map((round) => transformDBJapaneseRound(round)),
            currentRound: nextRound,
        };
    }
}

const getFirstJapaneseRound = (): PartialJapaneseRound => {
    return {
        roundCount: 1,
        roundNumber: 1,
        roundWind: "EAST",
        startRiichiStickCount: 0,
        bonus: 0,
    };
};

export function dealershipRetains(
    transactions: JapaneseTransactionT[],
    tenpais: number[],
    dealerIndex: number,
) {
    for (const transaction of transactions) {
        if (
            transaction.transactionType !== JapaneseTransactionType.NAGASHI_MANGAN &&
            transaction.scoreDeltas[dealerIndex] > 0
        ) {
            return true;
        }
        if (transaction.transactionType === JapaneseTransactionType.INROUND_RYUUKYOKU) {
            return true;
        }
    }
    return tenpais.includes(dealerIndex);
}

export function getNewHonbaCount(
    transactions: JapaneseTransactionT[],
    dealerIndex: number,
    honba: number,
) {
    if (transactions.length === 0) {
        return honba + 1;
    }
    for (const transaction of transactions) {
        if (
            transaction.transactionType === JapaneseTransactionType.INROUND_RYUUKYOKU ||
            transaction.transactionType === JapaneseTransactionType.NAGASHI_MANGAN
        ) {
            return honba + 1;
        }
        if (transaction.scoreDeltas[dealerIndex] > 0) {
            return honba + 1;
        }
    }

    return 0;
}

// CAREFUL the riichi sticks on table are just taken from prev round and need to be updated
// TODO: breaks at north 4
const getNextJapaneseRound = (game: FullJapaneseGame): PartialJapaneseRound => {
    if (game.rounds.length === 0) {
        return getFirstJapaneseRound();
    }

    const previousRound: ConcludedJapaneseRoundT = transformDBJapaneseRound(
        game.rounds[game.rounds.length - 1],
    );
    const newHonbaCount = getNewHonbaCount(
        previousRound.transactions,
        previousRound.roundNumber - 1,
        previousRound.bonus,
    );
    if (
        dealershipRetains(
            previousRound.transactions,
            previousRound.tenpais,
            previousRound.roundNumber - 1,
        )
    ) {
        return {
            roundCount: previousRound.roundCount + 1,
            bonus: newHonbaCount,
            roundNumber: previousRound.roundNumber,
            roundWind: previousRound.roundWind,
            startRiichiStickCount: previousRound.endRiichiStickCount,
        };
    }
    return {
        roundCount: previousRound.roundCount + 1,
        bonus: newHonbaCount,
        roundNumber: previousRound.roundNumber === 4 ? 1 : previousRound.roundNumber + 1,
        roundWind:
            previousRound.roundNumber === 4
                ? getNextRoundWind(previousRound.roundWind)
                : previousRound.roundWind,
        startRiichiStickCount: previousRound.endRiichiStickCount,
    };
};

const createJapaneseScoresQuery = (
    round: any,
    currentRoundInformation: any,
    dealerId: string,
): any => {
    const roundType = round.roundValue.type.value;
    const playerActions = round.roundValue.playerActions;
    const hand = round.pointsValue;
    const { honba, riichiSticksOnTable } = currentRoundInformation;

    let winnerId: string | undefined = undefined;
    let loserId: string | undefined = undefined;
    let paoId: string | undefined = undefined;
    let currentRiichiSticks = riichiSticksOnTable;

    const playerScores: any = {};
    for (const playerId in playerActions) {
        playerScores[playerId] = {
            scoreChange: 0,
            riichi: false,
        };

        if (playerActions[playerId].includes("Winner")) {
            winnerId = playerId;
        }

        if (playerActions[playerId].includes("Loser")) {
            loserId = playerId;
        }

        if (playerActions[playerId].includes("Pao Player")) {
            paoId = playerId;
        }

        if (playerActions[playerId].includes("Riichis")) {
            playerScores[playerId].riichi = true;
            playerScores[playerId].scoreChange -= RIICHI_STICK_SCORE;
            currentRiichiSticks++;
        }
    }

    switch (roundType) {
        case "DEAL_IN":
            updateJapaneseDealIn(
                playerScores,
                winnerId!,
                loserId!,
                dealerId,
                hand,
                honba,
                currentRiichiSticks,
            );
            break;
        case "SELF_DRAW":
            updateJapaneseSelfDraw(
                playerScores,
                winnerId!,
                dealerId,
                hand,
                honba,
                currentRiichiSticks,
            );
            break;
        case "DECK_OUT":
            updateJapaneseDeckOut(playerScores, playerActions);
            break;
        case "MISTAKE":
            updateJapaneseMistake(playerScores, loserId!);
            break;
        case "RESHUFFLE":
            break;
        case "DEAL_IN_PAO":
            updateJapaneseDealInPao(
                playerScores,
                winnerId!,
                loserId!,
                paoId!,
                dealerId,
                hand,
                honba,
                currentRiichiSticks,
            );
            break;
        case "SELF_DRAW_PAO":
            updateJapaneseSelfDrawPao(
                playerScores,
                winnerId!,
                paoId!,
                dealerId,
                hand,
                honba,
                currentRiichiSticks,
            );
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
            riichi: playerScores[playerId].riichi,
        });
    }

    if (roundType !== "RESHUFFLE" && roundType !== "DECK_OUT") {
        currentRiichiSticks = 0;
    }

    return { scoresQuery, newRiichiStickTotal: currentRiichiSticks };
};

function calculateHandValueWithMultiplier(multiplier: number, fu: number, points: number) {
    if (points >= 5) {
        return manganValue(points) * multiplier;
    }
    const manganPayout = MANGAN_BASE_POINT * multiplier;
    const handValue = Math.ceil((fu * Math.pow(2, 2 + points) * multiplier) / 100) * 100;
    return handValue > manganPayout ? manganPayout : handValue;
}

const updateJapaneseDealIn = (
    playerScores: any,
    winnerId: string,
    loserId: string,
    dealerId: string,
    hand: any,
    honba: number,
    riichiSticks: number,
) => {
    const bonusPoints = honba * BONUS_PER_HONBA;

    // The multiplier is for whether it's a dealer victory
    const multiplier = winnerId !== dealerId ? 4 : 6;

    const { points, fu } = hand;

    // Check to see if you have to count basic points
    if (fu === 20 || (points === 1 && fu === 25)) {
        throw new RangeError("Invalid points/fu combination");
    }
    const handValue = calculateHandValueWithMultiplier(multiplier, fu, points);

    // Add everything together to finalize total
    playerScores[winnerId].scoreChange += handValue + bonusPoints + riichiSticks * RIICHI_STICK_SCORE;
    playerScores[loserId].scoreChange -= handValue + bonusPoints;
};

const updateJapaneseSelfDraw = (
    playerScores: any,
    winnerId: string,
    dealerId: string,
    hand: any,
    honba: number,
    riichiSticks: number,
) => {
    const bonusPoints = honba * BONUS_PER_HONBA;
    const individualBonusPayout = bonusPoints / 3;

    const { points, fu } = hand;

    // Check to see if you have to count basic points
    if ((points === 1 && (fu === 20 || fu === 25)) || (points === 2 && fu === 25)) {
        throw RangeError("Invalid points/fu combination");
    }

    const singleBasePoint = calculateHandValueWithMultiplier(1, points, fu)
    const doubleBasePoint = calculateHandValueWithMultiplier(2, points, fu)

    // calculate score changes for everyone except winner and dealer
    if (dealerId === winnerId) {
        playerScores[winnerId].scoreChange += doubleBasePoint * 3 + bonusPoints + riichiSticks * RIICHI_STICK_SCORE;
        for (const playerId in playerScores) {
            if (playerId !== winnerId) {
                playerScores[playerId].scoreChange -= doubleBasePoint + individualBonusPayout;
            }
        }
    } else {
        playerScores[winnerId].scoreChange += singleBasePoint * 2 + doubleBasePoint + bonusPoints + riichiSticks * RIICHI_STICK_SCORE;
        for (const playerId in playerScores) {
            if (playerId !== winnerId && playerId !== dealerId) {
                playerScores[playerId].scoreChange -= singleBasePoint + individualBonusPayout;
            }
        }
        playerScores[dealerId].scoreChange -= doubleBasePoint + individualBonusPayout;
    }
};

const updateJapaneseDeckOut = (playerScores: any, playerActions: any) => {
    let tenpaiCount = 0;

    for (const playerId in playerScores) {
        if (playerActions[playerId].includes("Tenpais")) {
            tenpaiCount++;
        }
    }

    if (tenpaiCount === 0 || tenpaiCount === 4) {
        return;
    }

    const tenpaiMoneyWon = 3000 / tenpaiCount;
    const tenpaiMoneyLost = 3000 / (4 - tenpaiCount);

    for (const playerId in playerScores) {
        if (playerActions[playerId].includes("Tenpais")) {
            playerScores[playerId].scoreChange += tenpaiMoneyWon;
        } else {
            playerScores[playerId].scoreChange -= tenpaiMoneyLost;
        }
    }
};

const updateJapaneseMistake = (playerScores: any, loserId: string) => {
    for (const playerId in playerScores) {
        playerScores[playerId].scoreChange = 2 * MANGAN_BASE_POINT;
    }

    playerScores[loserId].scoreChange = -6 * MANGAN_BASE_POINT;
};

const updateJapaneseDealInPao = (
    playerScores: any,
    winnerId: string,
    loserId: string,
    paoId: string,
    dealerId: string,
    hand: any,
    honba: number,
    riichiSticks: number,
) => {
    const { points } = hand;
    if (points < 13) {
        throw new Error("Pao cannot happen unless hand is yakuman");
    }

    for (const playerId in playerScores) {
        playerScores[playerId].scoreChange = 0;
    }

    const bonusPoints = honba * BONUS_PER_HONBA;

    const multiplier = winnerId !== dealerId ? 4 : 6;
    const handValue = manganValue(points) * multiplier;

    playerScores[winnerId].scoreChange += handValue + bonusPoints + riichiSticks * RIICHI_STICK_SCORE;
    playerScores[loserId].scoreChange -= handValue / 2 + bonusPoints + riichiSticks * RIICHI_STICK_SCORE;
    playerScores[paoId].scoreChange -= handValue / 2;
};

const updateJapaneseSelfDrawPao = (
    playerScores: any,
    winnerId: string,
    paoId: string,
    dealerId: string,
    hand: any,
    honba: number,
    riichiSticks: number,
) => {
    const { points } = hand;
    if (points < 13) {
        throw new Error("Pao cannot happen unless hand is yakuman");
    }

    const bonusPoints = honba * 300;

    const multiplier = winnerId !== dealerId ? 4 : 6;
    const handValue = manganValue(points) * multiplier;

    playerScores[winnerId].scoreChange += handValue + bonusPoints + riichiSticks * RIICHI_STICK_SCORE;
    playerScores[paoId].scoreChange -= handValue + bonusPoints;
};

/**
 * Calculates the total base points  for high value hands
 * @param {number} points - total points in hand
 * @returns {number} representing number of base points as the result of a certain point threshold,
 *                   must be greater than mangan minimum points
 */
const manganValue = (points: number) => {
    let multiplier = 0;
    switch (true) {
        case points === 5:
            multiplier = 1;
            break;
        case points <= 7:
            multiplier = 1.5;
            break;
        case points <= 10:
            multiplier = 2;
            break;
        case points <= 12:
            multiplier = 3;
            break;
        // After 13 points is hit, we only see multiples of 13
        case points === 13:
            multiplier = 4;
            break;
        case points === 26:
            multiplier = 4 * 2;
            break;
        case points === 39:
            multiplier = 4 * 3;
            break;
        case points === 52:
            multiplier = 4 * 4;
            break;
        case points === 65:
            multiplier = 4 * 5;
            break;
    }
    return MANGAN_BASE_POINT * multiplier;
};

const createJapaneseHandQuery = (pointsValue: any): any => {
    return {
        roundCount: dbJapaneseRound.roundCount,
        roundWind: dbJapaneseRound.roundWind,
        roundNumber: dbJapaneseRound.roundNumber,
        bonus: dbJapaneseRound.bonus,
        startRiichiStickCount: dbJapaneseRound.startRiichiStickCount,
        endRiichiStickCount: dbJapaneseRound.endRiichiStickCount,
        riichis: riichis,
        tenpais: tenpais,
        transactions: dbJapaneseRound.transactions.map((dbTransaction) =>
            transformDBTransaction(dbTransaction),
        ),
    };
}

export default JapaneseGameService;
