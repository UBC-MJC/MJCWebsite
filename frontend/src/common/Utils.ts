import {PickerData} from "react-simple-wheel-picker";

const japanesePoints: PickerData[] = Array.from({length: 13},(_, k)=> {
    return {
        id: (k+1).toString(),
        value: k+1
    }
})
japanesePoints.push({id: "26", value: 26})
japanesePoints.push({id: "39", value: 39})
japanesePoints.push({id: "52", value: 52})
japanesePoints.push({id: "65", value: 65})

const japaneseFu: PickerData[] = Array.from({length: 10},(_, k)=> {
    return {
        id: ((k+2) * 10).toString(),
        value: (k+2) * 10
    }
})
japaneseFu.splice(1, 0, {id: "25", value: 25})

const japaneseDora: PickerData[] = Array.from({length: 37},(_, k)=> {
    return {
        id: k.toString(),
        value: k
    }
})

const hongKongPoints: PickerData[] = Array.from({length: 11},(_, k)=> {
    return {
        id: (k+3).toString(),
        value: k+3
    }
})

const japaneseRoundLabels = [
    { name: 'Round Winner', value: 'Win'},
    { name: 'Dealt in', value: 'Dealt in'},
    { name: 'Riichi', value: 'Riichi'},
    { name: 'Tenpai', value: 'Tenpai'},
    { name: 'Chombo', value: 'Chombo'},
    { name: 'Pao', value: 'Pao'},
];

const hongKongRoundLabels = [
    { name: 'Round Winner', value: 'Win'},
    { name: 'Dealt in', value: 'Dealt in'},
    { name: 'Chombo', value: 'Chombo'},
    { name: 'Pao', value: 'Pao'},
];

const windOrder = ["EAST", "SOUTH", "WEST", "NORTH"]

const windComparison = (wind1: string, wind2: string, playerWind?: string): number => {
    if (typeof playerWind !== "undefined") {
        const offset = windOrder.indexOf(playerWind)
        const newWindOrder = windOrder.slice(offset).concat(windOrder.slice(0, offset))
        return newWindOrder.indexOf(wind1) - newWindOrder.indexOf(wind2)
    }

    return windOrder.indexOf(wind1) - windOrder.indexOf(wind2)
}

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

export {
    japanesePoints,
    japaneseFu,
    japaneseDora,
    hongKongPoints,
    japaneseRoundLabels,
    hongKongRoundLabels,
    windComparison,
    getGameTypeString,
    getGameVariant
}
