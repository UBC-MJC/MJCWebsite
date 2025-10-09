import { FC } from "react";
import { GridColDef } from "@mui/x-data-grid";
import { mapChineseNumerals, mapWindToCharacter } from "@/common/Utils";
import TableDisplay from "@/game/common/TableDisplay";
import type { JapaneseRound, PartialJapaneseRound, GamePlayer } from "@/types";

interface LegacyGameTableProps {
    rounds: ModifiedJapaneseRound[];
    players: GamePlayer[];
}

export type ModifiedJapaneseRound = JapaneseRound & { scoreDeltas: number[] };

export function getRowString(row: PartialJapaneseRound) {
    return `${mapWindToCharacter(row.roundWind)}${mapChineseNumerals(row.roundNumber)}局 ${
        row.bonus
    }本場`;
}

const LegacyJapaneseGameTable: FC<LegacyGameTableProps> = ({ rounds, players }) => {
    const columns: GridColDef<ModifiedJapaneseRound>[] = [
        {
            field: "round",
            headerName: "Round",
            flex: 1.5,
            valueGetter: (_, row: ModifiedJapaneseRound) => getRowString(row),
        },
        {
            field: "eastScore",
            headerName: players[0].username,
            flex: 1,
            valueGetter: (_, row: ModifiedJapaneseRound) => row.scoreDeltas[0],
            type: "number",
        },
        {
            field: "southScore",
            headerName: players[1].username,
            flex: 1,
            valueGetter: (_, row: ModifiedJapaneseRound) => row.scoreDeltas[1],
            type: "number",
        },
        {
            field: "westScore",
            headerName: players[2].username,
            flex: 1,
            valueGetter: (_, row: ModifiedJapaneseRound) => row.scoreDeltas[2],
            type: "number",
        },
        {
            field: "northScore",
            headerName: players[3].username,
            flex: 1,
            valueGetter: (_, row: ModifiedJapaneseRound) => row.scoreDeltas[3],
            type: "number",
        },
    ];

    return <TableDisplay<ModifiedJapaneseRound> rounds={rounds} columns={columns} />;
};

export default LegacyJapaneseGameTable;
