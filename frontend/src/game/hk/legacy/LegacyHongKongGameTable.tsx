import { FC } from "react";
import {
    ColumnDef,
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { mapWindToCharacter } from "../../../common/Utils";
import { addScoreDeltas } from "../../jp/controller/JapaneseRound";
import { generateOverallScoreDelta } from "../controller/HongKongRound";
import { getHongKongStartingScore } from "../../common/constants";
import displayTable from "../../common/TableDisplay";
type LegacyGameTableProps = {
    rounds: ModifiedHongKongRound[];
    players: GamePlayer[];
};

export type ModifiedHongKongRound = HongKongRound & { scoreDeltas: number[] };

const getCurrentScoreRow = (rounds: ModifiedHongKongRound[]) => {
    return [
        "Score",
        ...rounds.reduce<number[]>(
            (result, current) => addScoreDeltas(result, generateOverallScoreDelta(current)),
            getHongKongStartingScore(),
        ),
    ];
};

const LegacyHongKongGameTable: FC<LegacyGameTableProps> = ({ rounds, players }) => {
    const columnHelper = createColumnHelper<ModifiedHongKongRound>();

    const roundColumns: ColumnDef<ModifiedHongKongRound, any>[] = [
        columnHelper.accessor((row) => `${mapWindToCharacter(row.roundWind)} ${row.roundNumber}`, {
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
        getRowId: (row) => row.id!,
    });

    return displayTable(table, getCurrentScoreRow(rounds));
};

export default LegacyHongKongGameTable;
