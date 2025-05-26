import { flexRender, Table } from "@tanstack/react-table";
import React from "react";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

function TableDisplay(props: { table: Table<any>; currentScoreRow: (string | number)[] }) {
    const { table, currentScoreRow } = props;
    return (
        <Paper elevation={1}>
            <Stack direction="column" spacing={1}>
                {/* Table Header */}
                <Stack direction="column">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <Stack direction="row" key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <Stack direction="column" key={header.id}>
                                    <Typography variant="subtitle2">
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext(),
                                        )}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                    ))}
                </Stack>
                {/* Table Body */}
                <Stack direction="column" spacing={0}>
                    {table.getRowModel().rows.map((row) => (
                        <Stack direction="row" key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <Stack direction="column" key={cell.id}>
                                    <Typography variant="body2">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                    ))}
                    {/* Current Score Row */}
                    <Stack direction="row">
                        {currentScoreRow.map((value, idx) => (
                            <Stack direction="column" key={idx}>
                                <Typography variant="body2">{value}</Typography>
                            </Stack>
                        ))}
                    </Stack>
                </Stack>
            </Stack>
        </Paper>
    );
}

export default TableDisplay;
