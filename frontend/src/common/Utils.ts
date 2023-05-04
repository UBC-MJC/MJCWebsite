const getGameTypeString = (gameType: "jp" | "hk"): string => {
    if (gameType === "jp") {
        return "Riichi"
    } else if (gameType === "hk") {
        return "Hong Kong"
    }
    return ""
}

const getGameVariant = (gameType: "jp" | "hk"): GameVariant => {
    if (gameType === "jp") {
        return "JAPANESE"
    } else if (gameType === "hk") {
        return "HONG_KONG"
    }
    return "JAPANESE"
}

export {getGameTypeString, getGameVariant}
