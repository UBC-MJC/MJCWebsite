const validateRound = (
    roundValue: RoundValue,
    pointsValue: any,
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

const validateJapanesePoints = (pointsValue: any): void => {
    if (typeof pointsValue.fu === "undefined") {
        throw new Error("Fu is required");
    }
    if (typeof pointsValue.points === "undefined") {
        throw new Error("Points are required");
    }
    if (typeof pointsValue.dora === "undefined") {
        throw new Error("Dora is required");
    }
};

const validateJapaneseRound = (roundValue: RoundValue): void => {
    validateRoundSelectors(roundValue);
};

const validateHongKongPoints = (pointsValue: any): void => {
    if (typeof pointsValue.points === "undefined") {
        throw new Error("Points are required");
    }
};

const validateHongKongRound = (roundValue: RoundValue): void => {
    validateRoundSelectors(roundValue);
};

const validateRoundSelectors = (roundValue: RoundValue): void => {
    roundValue.type.selectors.forEach((selector: string) => {
        for (const key in roundValue.playerActions) {
            if (roundValue.playerActions[key].includes(selector)) {
                return;
            }
        }

        throw new Error(`${selector} is required`);
    });
};

export default validateRound;
