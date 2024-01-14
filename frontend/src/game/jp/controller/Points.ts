export const MANGAN_BASE_POINT = 2000;
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

function calculateHandValue(multiplier: number, hand: JapaneseHandInput) {
    const han = hand.han;
    const fu = hand.fu;
    if (han >= 5) {
        return manganValue(han) * multiplier;
    }
    const manganPayout = MANGAN_BASE_POINT * multiplier;
    const handValue = Math.ceil((fu * Math.pow(2, 2 + han) * multiplier) / 100) * 100;
    return handValue > manganPayout ? manganPayout : handValue;
}

export {calculateHandValue}
