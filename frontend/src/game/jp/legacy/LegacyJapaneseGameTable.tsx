import { mapChineseNumerals, mapWindToCharacter } from "@/common/Utils";
import TableDisplay, { RoundRow } from "@/game/common/TableDisplay";
import type { JapaneseRound, PartialJapaneseRound, GamePlayer } from "@/types";

interface LegacyGameTableProps {
    rounds: ModifiedJapaneseRound[];
    players: GamePlayer[];
    dealerIndex?: number;
}

export type ModifiedJapaneseRound = JapaneseRound & { scoreDeltas: number[] };

export function getRowString(row: PartialJapaneseRound) {
    return `${mapWindToCharacter(row.roundWind)}${mapChineseNumerals(row.roundNumber)}局 ${
        row.bonus
    }本場`;
}

const LegacyJapaneseGameTable = ({ rounds, players, dealerIndex }: LegacyGameTableProps) => {
    const rows: RoundRow[] = rounds.map((round) => ({
        id: round.roundCount,
        label: getRowString(round),
        deltas: round.scoreDeltas,
    }));

    return <TableDisplay rows={rows} players={players} dealerIndex={dealerIndex} />;
};

export default LegacyJapaneseGameTable;
