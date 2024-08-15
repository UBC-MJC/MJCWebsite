import { FC } from "react";
import {
    ColumnDef,
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { mapChineseNumerals, mapWindToCharacter } from "../../../common/Utils";
import { generateJapaneseCurrentScore } from "../controller/JapaneseRound";
import displayTable from "../../common/TableDisplay";

type LegacyGameTableProps = {
    rounds: ModifiedJapaneseRound[];
    players: GamePlayer[];
};

export type ModifiedJapaneseRound = JapaneseRound & { scoreDeltas: number[] };

const getCurrentScoreRow = (rounds: JapaneseRound[]) => {
    return ["Score", ...generateJapaneseCurrentScore(rounds)];
};

function getRowString(row: ModifiedJapaneseRound) {
    return `${mapWindToCharacter(row.roundWind)}${mapChineseNumerals(row.roundNumber)}局 ${
        row.bonus
    }本場`;
}

const LegacyJapaneseGameTable: FC<LegacyGameTableProps> = ({ rounds, players }) => {
    const columnHelper = createColumnHelper<ModifiedJapaneseRound>();

    const roundColumns: ColumnDef<ModifiedJapaneseRound, any>[] = [
        columnHelper.accessor((row) => getRowString(row), {
            id: "round",
            header: "Round",
        }),
        columnHelper.accessor(
            (row) => {
                return row.scoreDeltas[0];
            },
            {
                id: "eastScore",
                header: players[0].username,
            },
        ),
        columnHelper.accessor(
            (row) => {
                return row.scoreDeltas[1];
            },
            {
                id: "southScore",
                header: players[1].username,
            },
        ),
        columnHelper.accessor(
            (row) => {
                return row.scoreDeltas[2];
            },
            {
                id: "westScore",
                header: players[2].username,
            },
        ),
        columnHelper.accessor(
            (row) => {
                return row.scoreDeltas[3];
            },
            {
                id: "northScore",
                header: players[3].username,
            },
        ),
    ];

    const table = useReactTable({
        data: rounds,
        columns: roundColumns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row, idx) => idx.toString(),
    });

    return displayTable(table, getCurrentScoreRow(rounds));
};

export default LegacyJapaneseGameTable;
