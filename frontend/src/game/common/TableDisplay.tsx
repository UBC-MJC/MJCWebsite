import { flexRender, Table } from "@tanstack/react-table";
import React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TableMUI from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

function TableDisplay(props: { table: Table<any>; currentScoreRow: (string | number)[] }) {
    const { table, currentScoreRow } = props;
    return (
        <TableContainer component={Paper} elevation={1}>
            <TableMUI size="small">
                <TableHead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableCell key={header.id}>
                                    <Typography variant="subtitle2">
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext(),
                                        )}
                                    </Typography>
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableHead>
                <TableBody>
                    {table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                    <Typography variant="body2">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </Typography>
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                    <TableRow>
                        {currentScoreRow.map((value, idx) => (
                            <TableCell key={idx}>
                                <Typography variant="body2">{value}</Typography>
                            </TableCell>
                        ))}
                    </TableRow>
                </TableBody>
            </TableMUI>
        </TableContainer>
    );
}

export default TableDisplay;
