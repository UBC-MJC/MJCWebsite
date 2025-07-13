import { PickerData } from "react-simple-wheel-picker";
import { generateJapaneseCurrentScore } from "../game/jp/controller/JapaneseRound";
import { generateHongKongCurrentScore } from "../game/hk/controller/HongKongRound";

const japanesePoints: PickerData[] = Array.from({ length: 13 }, (_, k) => {
    return {
        id: (k + 1).toString(),
        value: k + 1,
    };
});
japanesePoints.push({ id: "26", value: 26 });
japanesePoints.push({ id: "39", value: 39 });
japanesePoints.push({ id: "52", value: 52 });
japanesePoints.push({ id: "65", value: 65 });
japanesePoints.push({ id: "78", value: 78 });

const japaneseFu: PickerData[] = Array.from({ length: 10 }, (_, k) => {
    return {
        id: ((k + 2) * 10).toString(),
        value: (k + 2) * 10,
    };
});
japaneseFu.splice(1, 0, { id: "25", value: 25 });

const japaneseDora: PickerData[] = Array.from({ length: 37 }, (_, k) => {
    return {
        id: k.toString(),
        value: k,
    };
});

const japanesePointsWheel: PointWheelComponent[] = [
    { label: "Fu", value: "fu", data: japaneseFu },
    { label: "Han", value: "han", data: japanesePoints },
    { label: "Dora", value: "dora", data: japaneseDora },
];

const hongKongPoints: PickerData[] = Array.from({ length: 11 }, (_, k) => {
    return {
        id: (k + 3).toString(),
        value: k + 3,
    };
});

const hongKongPointsWheel: PointWheelComponent[] = [
    { label: "Points", value: "points", data: hongKongPoints },
];

export interface PointWheelComponent {
    label: string;
    value: string;
    data: PickerData[];
}

const japaneseRoundLabels = [
    { name: "Round Winner", value: "win" },
    { name: "Dealt in", value: "dealt-in" },
    { name: "Riichi", value: "riichi" },
    { name: "Tenpai", value: "tenpai" },
    { name: "Chombo", value: "chombo" },
    { name: "Pao", value: "pao" },
];

const hongKongRoundLabels = [
    { name: "Round Winner", value: "win" },
    { name: "Dealt in", value: "dealt-in" },
    { name: "Chombo", value: "chombo" },
    { name: "Pao", value: "pao" },
];

const windOrder = ["EAST", "SOUTH", "WEST", "NORTH"];

const windComparison = (wind1: string, wind2: string, playerWind?: string): number => {
    if (typeof playerWind !== "undefined") {
        const offset = windOrder.indexOf(playerWind);
        const newWindOrder = windOrder.slice(offset).concat(windOrder.slice(0, offset));
        return newWindOrder.indexOf(wind1) - newWindOrder.indexOf(wind2);
    }

    return windOrder.indexOf(wind1) - windOrder.indexOf(wind2);
};

const validateGameVariant = (gameVariant: string | undefined): gameVariant is GameVariant => {
    return typeof gameVariant !== "undefined" && (gameVariant === "jp" || gameVariant === "hk");
};

const getGameVariantString = (gameVariant: GameVariant, gameType?: GameType): string => {
    if (gameType === undefined) {
        return gameVariant === "jp" ? "Riichi" : "Hong Kong";
    }
    const capitalizedGameType = gameType.charAt(0).toUpperCase() + gameType.slice(1).toLowerCase();
    return gameVariant === "jp"
        ? `Riichi ${capitalizedGameType}`
        : `Hong Kong ${capitalizedGameType}`;
};

const mapWindToCharacter = (wind: string): string => {
    if (wind === "EAST") {
        return "東";
    } else if (wind === "SOUTH") {
        return "南";
    } else if (wind === "WEST") {
        return "西";
    } else if (wind === "NORTH") {
        return "北";
    } else {
        throw new Error(`Invalid wind ${wind}`);
    }
};

const mapChineseNumerals = (num: number): string => {
    const table = ["零", "一", "二", "三", "四"];
    return table[num];
};

const range = (end: number): number[] => {
    return Array.from({ length: end }, (_, i) => i);
};

export function getRiichiStickCount(rounds: JapaneseRound[], riichiList: number[]) {
    if (rounds.length === 0) {
        return 0;
    }
    return rounds[rounds.length - 1].endRiichiStickCount + riichiList.length;
}

export const getScoresWithPlayers = <T extends GameVariant>(
    game: Game<T>,
    gameVariant: GameVariant,
) => {
    const scores: number[] = (() => {
        if (gameVariant === "jp") {
            return generateJapaneseCurrentScore(game.rounds as JapaneseRound[]);
        } else {
            return generateHongKongCurrentScore(game.rounds as HongKongRound[]);
        }
    })();

    return scores.map((score, idx) => {
        const player = game.players[idx];

        return {
            username: player.username,
            score: score,
            eloDelta: game.eloDeltas[player.id],
        };
    });
};

export {
    japanesePoints,
    japaneseFu,
    japaneseDora,
    hongKongPoints,
    japanesePointsWheel,
    hongKongPointsWheel,
    japaneseRoundLabels,
    hongKongRoundLabels,
    windComparison,
    getGameVariantString,
    validateGameVariant,
    mapWindToCharacter,
    mapChineseNumerals,
    range,
};
