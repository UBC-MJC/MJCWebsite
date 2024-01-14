import { NUM_PLAYERS } from "../jp/controller/Types";

enum Wind {
    EAST = "EAST",
    SOUTH = "SOUTH",
    WEST = "WEST",
    NORTH = "NORTH",
}

const windOrder = [Wind.EAST, Wind.SOUTH, Wind.WEST, Wind.NORTH];
const getNextWind = (index: number): Wind => {
    return windOrder[(index % NUM_PLAYERS) + 1];
};

enum JapaneseLabel {
    WINNER = "WINNER",
    WINNER_2 = "WINNER_2",
    LOSER = "LOSER",
    TENPAI = "TENPAI",
    PAO = "PAO",
}

enum JapaneseRoundType {
    DEAL_IN = "DEAL_IN",
    SELF_DRAW = "SELF_DRAW",
    DECK_OUT = "DECK_OUT",
    RESHUFFLE = "RESHUFFLE",
    DEAL_IN_PAO = "DEAL_IN_PAO",
    SELF_DRAW_PAO = "SELF_DRAW_PAO",
    NAGASHI_MANGAN = "NAGASHI_MANGAN",
}

export type JapaneseActions = {
    [key in JapaneseLabel]?: number;
}

type JapaneseRoundTypeButtons = {
    name: string;
    value: JapaneseRoundType;
}[];


const JP_ROUND_TYPE_BUTTONS: JapaneseRoundTypeButtons = [
    {
        name: "Deal In",
        value: JapaneseRoundType.DEAL_IN,
    },
    { name: "Self Draw", value: JapaneseRoundType.SELF_DRAW},
    { name: "Deck Out", value: JapaneseRoundType.DECK_OUT},
    { name: "Reshuffle", value: JapaneseRoundType.RESHUFFLE},
    {
        name: "Deal In Pao",
        value: JapaneseRoundType.DEAL_IN_PAO,
    },
    {
        name: "Tsumo Pao",
        value: JapaneseRoundType.SELF_DRAW_PAO,
    },
]

const JP_LABEL_MAP: {[key in JapaneseLabel]: string} = {
    WINNER: "Winner",
    WINNER_2: "Second Winner",
    LOSER: "Loser",
    TENPAI: "Tenpai",
    PAO: "Pao Player",
}

const JP_UNDEFINED_HAND: JapaneseHandInput = {
    han: -1,
    fu: -1,
    dora: -1,
}

enum HongKongLabel {
    WINNER = "WINNER",
    WINNER_2 = "WINNER_2",
    LOSER = "LOSER",
    PAO = "PAO",
}

enum HongKongRoundType {
    DEAL_IN = "DEAL_IN",
    SELF_DRAW = "SELF_DRAW",
    DECK_OUT = "DECK_OUT",
    RESHUFFLE = "RESHUFFLE",
    MISTAKE = "MISTAKE",
    DEAL_IN_PAO = "DEAL_IN_PAO",
    SELF_DRAW_PAO = "SELF_DRAW_PAO",
}

export type HongKongActions = {
    [key in HongKongLabel]?: number;
}

type HongKongRoundTypeButtons = {
    name: string;
    value: HongKongRoundType;
}[];


const HK_ROUND_TYPE_BUTTONS: HongKongRoundTypeButtons = [
    {
        name: "Deal In",
        value: HongKongRoundType.DEAL_IN,
    },
    { name: "Self Draw", value: HongKongRoundType.SELF_DRAW},
    { name: "Deck Out", value: HongKongRoundType.DECK_OUT},
    { name: "Reshuffle", value: HongKongRoundType.RESHUFFLE},
    { name: "Mistake", value: HongKongRoundType.MISTAKE},
    {
        name: "Deal In Pao",
        value: HongKongRoundType.DEAL_IN_PAO,
    },
    {
        name: "Tsumo Pao",
        value: HongKongRoundType.SELF_DRAW_PAO,
    },
]

const HK_LABEL_MAP: {[key in HongKongLabel]: string} = {
    WINNER: "Winner",
    WINNER_2: "Second Winner",
    LOSER: "Loser",
    PAO: "Pao Player",
}

const HK_UNDEFINED_HAND: HongKongHandInput = -1;

export {
    Wind,
    getNextWind,
    JapaneseLabel,
    JapaneseRoundType,
    JP_ROUND_TYPE_BUTTONS,
    JP_LABEL_MAP,
    JP_UNDEFINED_HAND,
    HongKongLabel,
    HongKongRoundType,
    HK_ROUND_TYPE_BUTTONS,
    HK_LABEL_MAP,
    HK_UNDEFINED_HAND
}
