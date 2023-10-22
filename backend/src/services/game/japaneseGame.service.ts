import prisma from "../../db";
import {
    ActionType,
    GameType,
    JapaneseGame,
    JapanesePoint, JapaneseRound,
    JapaneseTransaction,
    Wind,
} from "@prisma/client";
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
        /* we should already have all information in roundRequest
        roundRequest will be a series of actions to apply here
         */
        const currentRoundInformation = getNextJapaneseRound(game);

        const query: { data: any } = {
            gameId: game.id,
            roundCount: currentRoundInformation.roundCount,
            roundNumber: currentRoundInformation.roundNumber,
            roundWind: currentRoundInformation.roundWind,
            bonus: currentRoundInformation.bonus,

            riichiSticksOnTable: currentRoundInformation.riichiSticksOnTable,
            pointStatus: currentRoundInformation.pointStatus,
        };

        query.data.transactions = transformAll(roundRequest.transactions);

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

interface JapaneseRoundInformation {
    roundCount: number,
    roundNumber: number,
    roundWind: Wind,
    bonus: number,
    riichiSticksOnTable: number,
    pointStatus: JapanesePoint[],
}

export class JapaneseRoundClass {
    public readonly globalSeating: JapanesePoint[]; // the dealer is on the round - 1 index
    public readonly wind: Wind;
    public readonly round: number;
    public readonly honba: number;
    public riichiSticks: number;
    public readonly actions: JapaneseTransaction[];
    public readonly localSeating: any;
    private readonly dealerID: string;
    public readonly count: number;

    constructor(round: JapaneseRound) {
        /**
         * Represents a Round in a Riichi Game.
         * @param seating a list representing the *initial* seating and the points.
         * That is, if round = 3, then seating[3-1] is the dealer.
         * @param wind the wind of the current. Can be East or South.
         * @param round the current round. Between 1 and 4.
         * @param honba the current honba. Can either be 0 (different win), honba of past round + 1 (dealer tenpai/ron)
         * or honba of past round (Reshuffle, Chombo).
         * @param riichiSticks the amount of riichi Sticks that are still on the table.
         *
         * Invariant: the total number of riichi sticks * 1000 + the total score of each player should add up to 100000
         **/
        this.globalSeating = round.pointStatus.copy();
        this.count = round.roundCount;
        this.wind = round.roundWind;
        this.round = round.roundNumber;
        this.honba = round.bonus;
        this.riichiSticks = round.riichiSticksOnTable;
        this.actions = round.transactions;
        this.localSeating = {};
        this.dealerID = this.globalSeating[this.round - 1].playerID;
        this.initializeLocalSeating();
    }

    private initializeLocalSeating() {
        const ids = [];

        for (const person of this.globalSeating) {
            ids.push(person.playerID);
        }

        while (ids[0] !== this.dealerID) {
            ids.push(ids.shift());
        }
        for (const i in ids) {
            // @ts-ignore
            this.localSeating[ids[i]] = parseInt(i, 10);
        }
    }

    public getPlayerLocalIndex(playerName: string): number {
        return this.localSeating[playerName];
    }

    public getPlayerGlobalIndex(playerName: string): number {
        return (this.localSeating[playerName] + this.round - 1) % 4;
    }

    public getScoreDeltas(): number[] {
        /**
         * Returns the situation of the next round in accordance to the actions performed.
         * Should go through the list of actions and aggregate a final score delta.
         */
        const finalRoundChange = [0, 0, 0, 0];
        for (const transaction of this.actions) {
            finalRoundChange[this.getPlayerGlobalIndex(transaction.pointReceiverID)] +=
                transaction.amount;
            finalRoundChange[this.getPlayerGlobalIndex(transaction.pointGiverID)] -=
                transaction.amount;
        }
        return finalRoundChange;
    }

    private getClosestWinner(loserLocalPos: number, winners: Set<string>) {
        let [closestWinner] = winners;
        for (const winnerName of winners) {
            if (
                (this.getPlayerLocalIndex(winnerName) - loserLocalPos) % 4 <
                (this.getPlayerLocalIndex(closestWinner) - loserLocalPos) % 4
            ) {
                closestWinner = winnerName;
            }
        }
        return closestWinner;
    }

    public getNextRound(): JapaneseRoundInformation {
        for (const i in this.getScoreDeltas()) {
            this.globalSeating[i].points += this.getScoreDeltas()[i];
        }

        this.distributeRemainingRiichiSticks();
        // Four situations:
        // Dealership retains, honba retains (chombo);
        // Dealership passes, honba increases by 1;
        // Dealership passes, honba set to 0;
        // dealership retains, honba increases by 1 (renchan).
        // Therefore, the situation will only depend on 1. if the dealership retains and 2. if the honba should increase
        const dealershipRetains: boolean = this.dealershipRetains();
        const newHonbaCount: number = this.getNewHonbaCount();
        if (dealershipRetains) {
            // TODO: Logic NOT correct
            return {
                pointStatus: this.globalSeating,
                roundCount: this.count,
                // globalSeating: this.globalSeating,
                roundWind: this.wind,
                roundNumber: this.round,
                bonus: newHonbaCount,
                riichiSticksOnTable: this.riichiSticks
                };
        } else {
            return {
                pointStatus: this.globalSeating,
                roundCount: this.count,
                roundWind: this.round === 4 ? getWind(windOrder.indexOf(this.wind) + 1) : this.wind,
                roundNumber: (this.round + 1) % 4,
                bonus: newHonbaCount,
                riichiSticksOnTable: this.riichiSticks
            };
        }
    }

    private distributeRemainingRiichiSticks() {
        const winners = new Set<string>();
        const losers = new Set<string>();
        for (const transaction of this.actions) {
            if (
                [
                    ActionType.RON,
                    ActionType.TSUMO,
                    ActionType.SELF_DRAW_PAO,
                    ActionType.DEAL_IN_PAO,
                ].includes(transaction.actionType)
            ) {
                winners.add(transaction.pointReceiverID);
                losers.add(transaction.pointGiverID);
            }
        }
        if (winners.size > 1 && losers.size > 1) {
            throw new Error("Input mismatch: must have only one winner or only one loser");
        }
        if (winners.size === 1) {
            const [winner] = winners;
            this.globalSeating[this.getPlayerGlobalIndex(winner)].points += this.riichiSticks * 1000;
            this.riichiSticks = 0;
        } else if (losers.size === 1) {
            const [loser] = losers;
            const loserLocalPos = this.getPlayerLocalIndex(loser);
            const closestWinner = this.getClosestWinner(loserLocalPos, winners);
            this.globalSeating[this.getPlayerGlobalIndex(closestWinner)].points +=
                this.riichiSticks * 1000;
            this.riichiSticks = 0;
        }
    }

    private dealershipRetains() {
        for (const transaction of this.actions) {
            if (
                [
                    ActionType.RON,
                    ActionType.TSUMO,
                    ActionType.SELF_DRAW_PAO,
                    ActionType.DEAL_IN_PAO,
                ].includes(transaction.actionType) &&
                transaction.pointReceiverID == this.dealerID
            ) {
                return true;
            }
            if (transaction.actionType === ActionType.CHOMBO) {
                return true;
            }
            if (transaction.actionType === ActionType.NAGASHI_MANGAN) {
                return true;
            }
        }
        return false;
    }

    private getNewHonbaCount() {
        for (const transaction of this.actions) {
            if (
                [
                    ActionType.RON,
                    ActionType.TSUMO,
                    ActionType.SELF_DRAW_PAO,
                    ActionType.DEAL_IN_PAO,
                ].includes(transaction.actionType) &&
                transaction.pointReceiverID == this.dealerID
            ) {
                return this.honba + 1;
            }
            if (transaction.actionType === ActionType.CHOMBO) {
                return this.honba;
            }
        }
        return 0;
    }
}

function transformAll(transactions: any[]): JapaneseTransaction[] {
    return []; // stub
}

// CAREFUL the riichi sticks on table are just taken from prev round and need to be updated
// TODO: breaks at north 4
const getNextJapaneseRound = (game: FullJapaneseGame): JapaneseRoundInformation => {
    const rounds = game.rounds;
    if (rounds.length === 0) {
        const pointStatus: JapanesePoint[] = [];
        for (const playerIdx in game.players) {
            const startingPoint: JapanesePoint = {
                japaneseRoundId: "0",
                playerID: game.players[playerIdx],
                points: 25000,
            }
            pointStatus.push(startingPoint);
        }
        return {
            roundCount: 1,
            roundNumber: 1,
            roundWind: Wind.EAST,
            bonus: 0,
            riichiSticksOnTable: 0,
            pointStatus: pointStatus
        };
    }

    const lastRound = rounds[rounds.length - 1];
    return new JapaneseRoundClass(lastRound).getNextRound();
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
    playerScores[winnerId].scoreChange +=
        handValue + bonusPoints + riichiSticks * RIICHI_STICK_SCORE;
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

    const singleBasePoint = calculateHandValueWithMultiplier(1, points, fu);
    const doubleBasePoint = calculateHandValueWithMultiplier(2, points, fu);

    // calculate score changes for everyone except winner and dealer
    if (dealerId === winnerId) {
        playerScores[winnerId].scoreChange +=
            doubleBasePoint * 3 + bonusPoints + riichiSticks * RIICHI_STICK_SCORE;
        for (const playerId in playerScores) {
            if (playerId !== winnerId) {
                playerScores[playerId].scoreChange -= doubleBasePoint + individualBonusPayout;
            }
        }
    } else {
        playerScores[winnerId].scoreChange +=
            singleBasePoint * 2 + doubleBasePoint + bonusPoints + riichiSticks * RIICHI_STICK_SCORE;
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

    playerScores[winnerId].scoreChange +=
        handValue + bonusPoints + riichiSticks * RIICHI_STICK_SCORE;
    playerScores[loserId].scoreChange -=
        handValue / 2 + bonusPoints + riichiSticks * RIICHI_STICK_SCORE;
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

    playerScores[winnerId].scoreChange +=
        handValue + bonusPoints + riichiSticks * RIICHI_STICK_SCORE;
    playerScores[paoId].scoreChange -= handValue + bonusPoints;
};

/**
 * Calculates the total base points  for high value hands
 * @param {number} points - total points in hand
 * @returns {number} representing number of base points as the result of a certain point threshold,
 *                   must be greater than mangan minimum points
 */
function manganValue(points) {
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
}

const createJapaneseHandQuery = (pointsValue: any): any => {
    return {
        points: pointsValue.points,
        fu: pointsValue.fu,
        dora: pointsValue.dora,
        honba: pointsValue.honba,
    };
};

export default JapaneseGameService;
