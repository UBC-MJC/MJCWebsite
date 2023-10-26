import React, { FC } from "react";
import {
    ColumnDef,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Table as BTable } from "react-bootstrap";
import { findPlayerScore, mapWindToCharacter } from "../../common/Utils";

type LegacyGameTableProps = {
    rounds: HongKongRound[];
    players: GamePlayer[];
};

const LegacyHongKongGameTable: FC<LegacyGameTableProps> = ({ rounds, players }) => {
    const columnHelper = createColumnHelper<HongKongRound>();

    const roundColumns: ColumnDef<HongKongRound, any>[] = [
        columnHelper.accessor(
            (row) => `${mapWindToCharacter(row.roundWind)} ${row.roundNumber} B${row.bonus}`,
            {
                id: "round",
                header: "Round",
            },
        ),
        columnHelper.accessor(
            (row) => {
                return findPlayerScore(row.scores, players[0].id).scoreChange;
            },
            {
                id: "eastScore",
                header: players[0].username,
            },
        ),
        columnHelper.accessor(
            (row) => {
                return findPlayerScore(row.scores, players[1].id).scoreChange;
            },
            {
                id: "southScore",
                header: players[1].username,
            },
        ),
        columnHelper.accessor(
            (row) => {
                return findPlayerScore(row.scores, players[2].id).scoreChange;
            },
            {
                id: "westScore",
                header: players[2].username,
            },
        ),
        columnHelper.accessor(
            (row) => {
                return findPlayerScore(row.scores, players[3].id).scoreChange;
            },
            {
                id: "northScore",
                header: players[3].username,
            },
        ),
    ];

    const getCurrentScoreRow = (rounds: HongKongRound[]) => {
        const startingScore = 750;

        return [
            "Score",
            ...players.map((player) => {
                return rounds.reduce((total, round) => {
                    return total + findPlayerScore(round.scores, player.id).scoreChange;
                }, startingScore);
            }),
        ];
    };

    const table = useReactTable({
        data: rounds,
        columns: roundColumns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.id,
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

export default LegacyHongKongGameTable;
