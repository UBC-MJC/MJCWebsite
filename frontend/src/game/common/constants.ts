import { isJapaneseGameEnd } from "../jp/controller/JapaneseRound";
import { isHongKongGameEnd } from "../hk/controller/HongKongRound";
import { mapWindToCharacter } from "../../common/Utils";

enum Wind {
    EAST = "EAST",
    SOUTH = "SOUTH",
    WEST = "WEST",
    NORTH = "NORTH",
}
enum JapaneseLabel {
    WINNER = "WINNER",
    LOSER = "LOSER",
    TENPAI = "TENPAI",
    PAO = "PAO",
}

enum JapaneseTransactionType {
    DEAL_IN = "DEAL_IN",
    SELF_DRAW = "SELF_DRAW",
    DEAL_IN_PAO = "DEAL_IN_PAO",
    SELF_DRAW_PAO = "SELF_DRAW_PAO",
    NAGASHI_MANGAN = "NAGASHI_MANGAN",
    INROUND_RYUUKYOKU = "INROUND_RYUUKYOKU",
    DECK_OUT = "DECK_OUT", // Not really a transaction; here for convenience's sake
}

export type JapaneseActions = Partial<Record<JapaneseLabel, number>>;

type JapaneseActionButtons = {
    name: string;
    value: JapaneseTransactionType;
}[];

const JP_TRANSACTION_TYPE_BUTTONS: JapaneseActionButtons = [
    {
        name: "Deal In",
        value: JapaneseTransactionType.DEAL_IN,
    },
    { name: "Self Draw", value: JapaneseTransactionType.SELF_DRAW },
    {
        name: "Deal In Pao",
        value: JapaneseTransactionType.DEAL_IN_PAO,
    },
    {
        name: "Tsumo Pao",
        value: JapaneseTransactionType.SELF_DRAW_PAO,
    },
    {
        name: "Nagashi Mangan",
        value: JapaneseTransactionType.NAGASHI_MANGAN,
    },
];

const JP_SINGLE_ACTION_BUTTONS: JapaneseActionButtons = [
    ...JP_TRANSACTION_TYPE_BUTTONS,
    { name: "Reshuffle", value: JapaneseTransactionType.INROUND_RYUUKYOKU },
    { name: "Deck Out", value: JapaneseTransactionType.DECK_OUT },
];

const JP_LABEL_MAP: Record<JapaneseLabel, string> = {
    WINNER: "Winner",
    LOSER: "Loser",
    TENPAI: "Tenpai",
    PAO: "Pao Player",
};

const JP_UNDEFINED_HAND: JapaneseHandInput = {
    han: -2,
    fu: 10,
    dora: 0,
};

enum HongKongLabel {
    WINNER = "WINNER",
    LOSER = "LOSER",
    PAO = "PAO",
}

enum HongKongTransactionType {
    DEAL_IN = "DEAL_IN",
    SELF_DRAW = "SELF_DRAW",
    DEAL_IN_PAO = "DEAL_IN_PAO",
    SELF_DRAW_PAO = "SELF_DRAW_PAO",
    DECK_OUT = "DECK_OUT", // not a transaction
}

export type HongKongActions = Partial<Record<HongKongLabel, number>>;

type HongKongTransactionTypeButtons = {
    name: string;
    value: HongKongTransactionType;
}[];

const HK_TRANSACTION_TYPE_BUTTONS: HongKongTransactionTypeButtons = [
    {
        name: "Deal In",
        value: HongKongTransactionType.DEAL_IN,
    },
    { name: "Self Draw", value: HongKongTransactionType.SELF_DRAW },
    {
        name: "Deal In Pao",
        value: HongKongTransactionType.DEAL_IN_PAO,
    },
    {
        name: "Self Draw Pao",
        value: HongKongTransactionType.SELF_DRAW_PAO,
    },
    {
        name: "Deck Out",
        value: HongKongTransactionType.DECK_OUT,
    },
];

const HK_LABEL_MAP: Record<HongKongLabel, string> = {
    WINNER: "Winner",
    LOSER: "Loser",
    PAO: "Pao Player",
};

const HK_UNDEFINED_HAND: HongKongHandInput = -1;

const isGameEnd = (game: Game, variant: GameVariant): boolean => {
    if (variant === "jp") {
        return isJapaneseGameEnd(
            game.currentRound as PartialJapaneseRound,
            game.rounds as JapaneseRound[],
        );
    } else if (variant === "hk") {
        return isHongKongGameEnd(
            game.currentRound as PartialHongKongRound,
            game.rounds as HongKongRound[],
        );
    } else {
        return false;
    }
};

const gameRoundString = (game: Game, variant: GameVariant) => {
    if (typeof game.currentRound === "undefined") {
        return "End of Game";
    }

    const lastRound = game.currentRound;
    if (variant === "jp") {
        return `${mapWindToCharacter(lastRound.roundWind)} ${lastRound.roundNumber} Bonus ${
            lastRound.bonus
        }`;
    } else if (variant === "hk") {
        return `${mapWindToCharacter(lastRound.roundWind)} ${lastRound.roundNumber}`;
    }
};

export {
    Wind,
    JapaneseLabel,
    JapaneseTransactionType,
    JP_TRANSACTION_TYPE_BUTTONS,
    JP_LABEL_MAP,
    JP_UNDEFINED_HAND,
    JP_SINGLE_ACTION_BUTTONS,
    HongKongLabel,
    HongKongTransactionType,
    HK_TRANSACTION_TYPE_BUTTONS,
    HK_LABEL_MAP,
    HK_UNDEFINED_HAND,
    isGameEnd,
    gameRoundString,
};

export function getEmptyScoreDelta(): number[] {
    return Array(NUM_PLAYERS).fill(0);
}

export function getJapaneseStartingScore(): number[] {
    return Array(NUM_PLAYERS).fill(JAPANESE_STARTING_POINT);
}

export function getHongKongStartingScore(): number[] {
    return Array(NUM_PLAYERS).fill(HONGKONG_STARTING_POINT);
}

export function mapPlayerNameToOption(
    playerNameDatas: PlayerNamesDataType[],
): OptionsType<string>[] {
    return sortOptions(
        playerNameDatas.map((playerNameData) => {
            return { label: playerNameData.username, value: playerNameData.playerId };
        }),
    );
}

export function sortOptions(options: OptionsType<string>[]) {
    return options.sort((a, b) => a.label.localeCompare(b.label));
}

export function mapSeasonToOption(seasons: Season[]): OptionsType<Season>[] {
    return seasons.map((season) => {
        return { label: season.name, value: season };
    });
}

export function mapLeaderboardToOneDecimal(leaderboards: LeaderboardType[]) {
    const playerElos = leaderboards.sort((a, b) => {
        return Number(b.elo) - Number(a.elo);
    });
    return playerElos.map((player) => {
        const elo = Number(player.elo);
        return {
            ...player,
            displayElo: (elo - 15 * player.chomboCount).toFixed(1),
        };
    });
}

export const NUM_PLAYERS = 4;
export const JAPANESE_STARTING_POINT = 25000;
export const JAPANESE_RETURNING_POINT = 30000; // kaeshi, genten

export const RIICHI_STICK_VALUE = 1000;

export const HONGKONG_STARTING_POINT = 750;
