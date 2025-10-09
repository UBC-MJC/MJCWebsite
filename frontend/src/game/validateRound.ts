import type { RoundValue, JapaneseHandInput, HongKongHandInput, GameVariant } from "@/types";

const validateRound = (
    roundValue: RoundValue,
    pointsValue: JapaneseHandInput | HongKongHandInput,
    gameVariant: GameVariant,
    needPoints: boolean,
): void => {
    switch (gameVariant) {
        case "jp":
            if (needPoints) {
                validateJapanesePoints(pointsValue);
            }
            validateJapaneseRound(roundValue);
            break;
        case "hk":
            if (needPoints) {
                validateHongKongPoints(pointsValue);
            }
            validateHongKongRound(roundValue);
            break;
    }
};

const validateJapanesePoints = (pointsValue: JapaneseHandInput | HongKongHandInput): void => {
    if (typeof pointsValue === "number") {
        throw new Error("Expected Japanese hand input, got Hong Kong hand input");
    }
    if (typeof pointsValue.fu === "undefined") {
        throw new Error("Fu is required");
    }
    if (typeof pointsValue.han === "undefined") {
        throw new Error("Han is required");
    }
    if (typeof pointsValue.dora === "undefined") {
        throw new Error("Dora is required");
    }
};

const validateJapaneseRound = (roundValue: RoundValue): void => {
    validateRoundSelectors(roundValue);
};

const validateHongKongPoints = (pointsValue: JapaneseHandInput | HongKongHandInput): void => {
    if (typeof pointsValue !== "number") {
        throw new Error("Expected Hong Kong hand input (number), got Japanese hand input");
    }
};

const validateHongKongRound = (roundValue: RoundValue): void => {
    validateRoundSelectors(roundValue);
};

const validateRoundSelectors = (roundValue: RoundValue): void => {
    roundValue.type.selectors?.forEach((selector: string) => {
        for (const key in roundValue.playerActions) {
            if (roundValue.playerActions[key].includes(selector)) {
                return;
            }
        }

        throw new Error(`${selector} is required`);
    });
};

export default validateRound;
