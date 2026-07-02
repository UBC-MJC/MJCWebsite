import { mapChineseNumerals, mapWindToCharacter } from "@/common/Utils";
import TableDisplay, { RoundRow } from "@/game/common/TableDisplay";
import type { JapaneseRound, PartialJapaneseRound, GamePlayer } from "@/types";

interface LegacyGameTableProps {
    rounds: ModifiedJapaneseRound[];
    players: GamePlayer[];
    dealerIndex?: number;
}

export type ModifiedJapaneseRound = JapaneseRound & { scoreDeltas: number[] };

export function getRoundLabel(row: PartialJapaneseRound) {
    return `${mapWindToCharacter(row.roundWind)}${mapChineseNumerals(row.roundNumber)}局`;
}

export function getBonusLabel(row: PartialJapaneseRound) {
    return `${row.bonus}本場`;
}

export function getRowString(row: PartialJapaneseRound) {
    return `${getRoundLabel(row)} ${getBonusLabel(row)}`;
}

const LegacyJapaneseGameTable = ({ rounds, players, dealerIndex }: LegacyGameTableProps) => {
    const rows: RoundRow[] = rounds.map((round) => ({
        id: round.roundCount,
        label: getRoundLabel(round),
        secondary: getBonusLabel(round),
        deltas: round.scoreDeltas,
    }));

    return <TableDisplay rows={rows} players={players} dealerIndex={dealerIndex} />;
};

export default LegacyJapaneseGameTable;
