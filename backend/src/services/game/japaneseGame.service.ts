import prisma from "../../db";
import { GameType } from "@prisma/client";
import {
    getDealerPlayerId,
    getWind,
    requiresHand,
    windOrder,
    FullJapaneseGame,
    getPlayerScores,
} from "./game.util";
import GameService from "./game.service";
import { getAllPlayerElos } from "../leaderboard.service";
import { EloCalculatorInput, getEloChanges } from "./eloCalculator";

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
                gameType: gameType,
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
                        scores: true,
                        hand: true,
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
        const playerScores = getPlayerScores(game);
        const eloList = await getAllPlayerElos("jp", game.seasonId);

        const eloCalculatorInput: EloCalculatorInput[] = game.players.map((player) => {
            let elo = 1500;
            const eloObject = eloList.find((x) => x.playerId === player.player.id);
            if (typeof eloObject !== "undefined") {
                elo += eloObject.elo;
            }

            return {
                playerId: player.player.id,
                elo: elo,
                score: playerScores[player.player.id],
                wind: player.wind,
            };
        });

        const calculatedElos = getEloChanges(eloCalculatorInput, "jp");

        await prisma.$transaction(
            calculatedElos.map((elo) => {
                return prisma.japanesePlayerGame.update({
                    where: {
                        id: game.players.find((player) => player.player.id === elo.playerId)!.id,
                    },
                    data: {
                        eloChange: elo.eloChange,
                        position: elo.position,
                    },
                });
            }),
        );

        await prisma.japaneseGame.update({
            where: {
                id: game.id,
            },
            data: {
                status: "FINISHED",
                endedAt: new Date(),
            },
        });
    }

    public async createRound(game: FullJapaneseGame, roundRequest: any): Promise<void> {
        const currentRoundInformation = getNextJapaneseRound(game);
        const dealerId = getDealerPlayerId(game, currentRoundInformation.roundNumber);
        const { scoresQuery, newRiichiStickTotal } = createJapaneseScoresQuery(
            roundRequest,
            currentRoundInformation,
            dealerId,
        );

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
                riichiSticksOnTable: newRiichiStickTotal,
                roundType: roundRequest.roundValue.type.value,
                scores: {
                    create: scoresQuery,
                },
            },
        };

        if (requiresHand(roundRequest.roundValue.type.value)) {
            query.data.hand = {
                create: createJapaneseHandQuery(roundRequest.pointsValue),
            };
        }

        try {
            await prisma.japaneseRound.create(query);
        } catch (err) {
            console.error("Error adding japanese round: ", err);
            console.error("Query: ", query);
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
            gameType: game.gameType,
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
        game: FullJapaneseGame,
        nextRound: any = getNextJapaneseRound(game),
    ): boolean {
        const playerScores = getPlayerScores(game);
        const allPositive = Object.values(playerScores).every((score: number) => score >= 0);

        if (!allPositive) {
            // end game if player has negative score
            return true;
        } else if (
            nextRound.roundWind === "EAST" ||
            (nextRound.roundWind === "SOUTH" && nextRound.roundNumber < 4)
        ) {
            return false;
        } else if (nextRound.roundWind === "SOUTH" && nextRound.roundNumber === 4) {
            const lastRound = game.rounds[game.rounds.length - 1];
            if (lastRound.roundWind === "SOUTH" && lastRound.roundNumber === 4) {
                // end game if we are in south 4 because dealer won and dealer has most points
                const dealerId = getDealerPlayerId(game, 4);

                // check if dealer has most points
                let dealerHasMostPoints = true;
                for (const playerId in playerScores) {
                    if (playerId !== dealerId && playerScores[playerId] >= playerScores[dealerId]) {
                        dealerHasMostPoints = false;
                        break;
                    }
                }

                return dealerHasMostPoints;
            } else {
                // don't end game because we are in south 4 from south 3
                return false;
            }
        } else {
            // we are in west/north round, end game if someone has more than 30000 points
            for (const playerId in playerScores) {
                if (playerScores[playerId] >= 30000) {
                    return true;
                }
            }
            return false;
        }
    }
}

const getFirstJapaneseRound = (): any => {
    return {
        roundCount: 1,
        roundNumber: 1,
        roundWind: "EAST",
        bonus: 0,
        riichiSticksOnTable: 0,
    };
};

// CAREFUL the riichi sticks on table are just taken from prev round and need to be updated
// TODO: breaks at north 4
const getNextJapaneseRound = (game: FullJapaneseGame): any => {
    const rounds = game.rounds;
    if (rounds.length === 0) {
        return getFirstJapaneseRound();
    }

    const lastRound = rounds[rounds.length - 1];

    const lastRoundWind = lastRound.roundWind;
    const lastRoundNumber = lastRound.roundNumber;
    const lastRoundCount = lastRound.roundCount;
    const lastBonus = lastRound.bonus;

    const lastDealerId = getDealerPlayerId(game, lastRoundNumber);
    const lastDealerScore = lastRound.scores.find((score) => score.playerId === lastDealerId);
    const lastRiichiSticks = lastRound.riichiSticksOnTable;

    if (
        lastDealerScore!.scoreChange > 0 ||
        lastDealerScore!.riichi ||
        lastRound.roundType === "RESHUFFLE"
    ) {
        return {
            roundCount: lastRoundCount + 1,
            roundNumber: lastRoundNumber,
            roundWind: lastRoundWind,
            bonus: lastBonus + 1,
            riichiSticksOnTable: lastRiichiSticks,
        };
    }

    if (lastRound.roundType === "DECK_OUT") {
        return {
            roundCount: lastRoundCount + 1,
            roundNumber: lastRoundNumber === 4 ? 1 : lastRoundNumber + 1,
            roundWind:
                lastRoundNumber === 4
                    ? getWind(windOrder.indexOf(lastRoundWind) + 1)
                    : lastRoundWind,
            bonus: lastBonus + 1,
            riichiSticksOnTable: lastRiichiSticks,
        };
    }

    return {
        roundCount: lastRoundCount + 1,
        roundNumber: lastRoundNumber === 4 ? 1 : lastRoundNumber + 1,
        roundWind:
            lastRoundNumber === 4 ? getWind(windOrder.indexOf(lastRoundWind) + 1) : lastRoundWind,
        bonus: 0,
        riichiSticksOnTable: lastRiichiSticks,
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
    const { bonus, riichiSticksOnTable } = currentRoundInformation;

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
            playerScores[playerId].scoreChange -= 1000;
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
                bonus,
                currentRiichiSticks,
            );
            break;
        case "SELF_DRAW":
            updateJapaneseSelfDraw(
                playerScores,
                winnerId!,
                dealerId,
                hand,
                bonus,
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
                bonus,
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
                bonus,
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

const updateJapaneseDealIn = (
    playerScores: any,
    winnerId: string,
    loserId: string,
    dealerId: string,
    hand: any,
    bonus: number,
    riichiSticks: number,
) => {
    let handValue;
    const bonusPoints = bonus * 300;

    // The multiplier is for whether it's a dealer victory
    const multiplier = winnerId !== dealerId ? 4 : 6;

    const { points, fu } = hand;

    // Check to see if you have to count basic points
    if (points < 5) {
        if (fu === 20 || (points === 1 && fu === 25)) {
            throw new Error("Invalid points/fu combination");
        } else {
            // Calculate hand value, if it's above a mangan, cap it there
            const manganPayout = 2000 * multiplier;
            handValue = Math.ceil((fu * Math.pow(2, 2 + points) * multiplier) / 100) * 100;
            handValue = handValue > manganPayout ? manganPayout : handValue;
        }
    } else {
        handValue = manganValue(points) * multiplier;
    }

    // Add everything together to finalize total
    playerScores[winnerId].scoreChange += handValue + bonusPoints + riichiSticks * 1000;
    playerScores[loserId].scoreChange -= handValue + bonusPoints;
};

const updateJapaneseSelfDraw = (
    playerScores: any,
    winnerId: string,
    dealerId: string,
    hand: any,
    bonus: number,
    riichiSticks: number,
) => {
    let basicPoints: number;
    const bonusPoints = bonus * 300;
    const individualBonusPayout = bonusPoints / 3;

    const { points, fu } = hand;

    // Check to see if you have to count basic points
    if (points < 5) {
        if ((points === 1 && (fu === 20 || fu === 25)) || (points === 2 && fu === 25)) {
            throw RangeError("Invalid points/fu combination");
        } else {
            // Calculate hand value, if it's above a mangan, cap it there
            basicPoints = fu * Math.pow(2, 2 + points);
            basicPoints = basicPoints < 2000 ? basicPoints : 2000;
        }
    } else {
        basicPoints = manganValue(points);
    }

    const nonDealerPays = Math.ceil((basicPoints / 100) * (dealerId === winnerId ? 2 : 1)) * 100;
    const dealerPays = Math.ceil((basicPoints / 100) * 2) * 100;

    // caclulate score changes for eeveryone except winner and dealer
    for (const playerId in playerScores) {
        if (playerId !== winnerId && playerId !== dealerId) {
            playerScores[playerId].scoreChange -= nonDealerPays + individualBonusPayout;
        }
    }

    // If dealer wins, everyone pays dealer amount, otherwise dealer pays differently
    if (dealerId === winnerId) {
        playerScores[dealerId].scoreChange += nonDealerPays * 3 + bonusPoints + riichiSticks * 1000;
    } else {
        playerScores[dealerId].scoreChange -= dealerPays + individualBonusPayout;
        playerScores[winnerId].scoreChange +=
            dealerPays + nonDealerPays * 2 + bonusPoints + riichiSticks * 1000;
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
        playerScores[playerId].scoreChange = 4000;
    }

    playerScores[loserId].scoreChange = -12000;
};

const updateJapaneseDealInPao = (
    playerScores: any,
    winnerId: string,
    loserId: string,
    paoId: string,
    dealerId: string,
    hand: any,
    bonus: number,
    riichiSticks: number,
) => {
    const { points } = hand;
    if (points < 13) {
        throw new Error("Pao cannot happen unless hand is yakuman");
    }

    for (const playerId in playerScores) {
        playerScores[playerId].scoreChange = 0;
    }

    const bonusPoints = bonus * 300;

    const multiplier = winnerId !== dealerId ? 4 : 6;
    const handValue = manganValue(points) * multiplier;

    playerScores[winnerId].scoreChange += handValue + bonusPoints + riichiSticks * 1000;
    playerScores[loserId].scoreChange -= handValue / 2 + bonusPoints + riichiSticks * 1000;
    playerScores[paoId].scoreChange -= handValue / 2;
};

const updateJapaneseSelfDrawPao = (
    playerScores: any,
    winnerId: string,
    paoId: string,
    dealerId: string,
    hand: any,
    bonus: number,
    riichiSticks: number,
) => {
    const { points } = hand;
    if (points < 13) {
        throw new Error("Pao cannot happen unless hand is yakuman");
    }

    const bonusPoints = bonus * 300;

    const multiplier = winnerId !== dealerId ? 4 : 6;
    const handValue = manganValue(points) * multiplier;

    playerScores[winnerId].scoreChange += handValue + bonusPoints + riichiSticks * 1000;
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
    return 2000 * multiplier;
};

const createJapaneseHandQuery = (pointsValue: any): any => {
    return {
        points: pointsValue.points,
        fu: pointsValue.fu,
        dora: pointsValue.dora,
    };
};

export default JapaneseGameService;
