import React, { FC } from "react";
import {
    ColumnDef,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Table as BTable } from "react-bootstrap";
import { mapChineseNumerals, mapWindToCharacter } from "../../../common/Utils";
import { generateJapaneseCurrentScore } from "../controller/JapaneseRound";

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

    return (
        <div>
            <BTable striped borderless responsive className="my-4 text-nowrap align-middle">
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id}>
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext(),
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}

                    <tr className="footer-row" key="current-score">
                        {getCurrentScoreRow(rounds).map((value, idx) => (
                            <td className={idx === 0 ? "footer-label" : ""} key={idx}>
                                {value}
                            </td>
                        ))}
                    </tr>
                </tbody>
            </BTable>
        </div>
    );
};

export default LegacyJapaneseGameTable;
